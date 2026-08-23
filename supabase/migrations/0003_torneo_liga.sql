-- ============================================================
-- Torneo Managers — datos de la liga (equipos, partidos,
-- disciplina y goleadores) + RLS.
-- Aplicada en el proyecto fundacion-managers el 22/08/2026.
--
-- Estos datos SI son publicos: cualquiera que entre al sitio
-- debe poder leerlos. Escribir solo lo puede hacer un usuario
-- autenticado (el panel de administracion).
--
-- La tabla de posiciones NO se guarda: se calcula desde
-- public.partidos. Asi es imposible que la tabla y el
-- calendario se contradigan, que fue justo el problema que
-- aparecio al cargar la Fecha 4 a mano.
-- ============================================================

create table if not exists public.equipos (
  slug            text primary key,
  nombre          text not null,
  corto           text not null,
  color           text not null default '#D4A437',
  titulos         int  not null default 0 check (titulos >= 0),
  orden           int  not null default 0,
  creado_en       timestamptz not null default now(),
  actualizado_en  timestamptz not null default now()
);

create table if not exists public.partidos (
  id              uuid primary key default gen_random_uuid(),
  edicion         int  not null default 4,
  jornada         int  not null check (jornada >= 1),
  fecha           date not null,
  hora            time not null,
  local           text not null references public.equipos(slug) on update cascade,
  visitante       text not null references public.equipos(slug) on update cascade,
  goles_local     int  check (goles_local >= 0),
  goles_visitante int  check (goles_visitante >= 0),
  estado          text not null default 'programado'
                    check (estado in ('programado', 'jugado')),
  creado_en       timestamptz not null default now(),
  actualizado_en  timestamptz not null default now(),

  constraint rivales_distintos check (local <> visitante),

  -- Un partido jugado tiene marcador; uno programado, no. Evita
  -- que la tabla cuente partidos a medio cargar.
  constraint marcador_coherente check (
    (estado = 'programado' and goles_local is null and goles_visitante is null)
    or
    (estado = 'jugado' and goles_local is not null and goles_visitante is not null)
  )
);

create index if not exists partidos_edicion_jornada_idx
  on public.partidos (edicion, jornada, hora);

create table if not exists public.disciplina (
  edicion         int  not null default 4,
  equipo          text not null references public.equipos(slug) on update cascade,
  amarillas       int  not null default 0 check (amarillas >= 0),
  rojas           int  not null default 0 check (rojas >= 0),
  creado_en       timestamptz not null default now(),
  actualizado_en  timestamptz not null default now(),
  primary key (edicion, equipo)
);

create table if not exists public.goleadores (
  id              uuid primary key default gen_random_uuid(),
  edicion         int  not null default 4,
  jugador         text not null,
  equipo          text not null references public.equipos(slug) on update cascade,
  numero          int  check (numero between 0 and 999),
  goles           int  not null default 0 check (goles >= 0),
  creado_en       timestamptz not null default now(),
  actualizado_en  timestamptz not null default now(),
  unique (edicion, equipo, jugador)
);

create index if not exists goleadores_edicion_goles_idx
  on public.goleadores (edicion, goles desc);

-- ===================== RLS =====================
alter table public.equipos     enable row level security;
alter table public.partidos    enable row level security;
alter table public.disciplina  enable row level security;
alter table public.goleadores  enable row level security;

do $$
declare t text;
begin
  foreach t in array array['equipos', 'partidos', 'disciplina', 'goleadores'] loop
    -- Lectura publica: el sitio la consume sin sesion.
    execute format('drop policy if exists "publico_lee" on public.%I', t);
    execute format(
      'create policy "publico_lee" on public.%I for select to anon, authenticated using (true)', t);

    -- Escritura solo para el panel de administracion.
    execute format('drop policy if exists "admin_inserta" on public.%I', t);
    execute format(
      'create policy "admin_inserta" on public.%I for insert to authenticated with check (true)', t);

    execute format('drop policy if exists "admin_actualiza" on public.%I', t);
    execute format(
      'create policy "admin_actualiza" on public.%I for update to authenticated using (true) with check (true)', t);

    execute format('drop policy if exists "admin_elimina" on public.%I', t);
    execute format(
      'create policy "admin_elimina" on public.%I for delete to authenticated using (true)', t);

    -- Mantener actualizado_en, reutilizando la funcion de 0001.
    execute format('drop trigger if exists touch_%I on public.%I', t, t);
    execute format(
      'create trigger touch_%I before update on public.%I
         for each row execute function public.touch_actualizado_en()', t, t);
  end loop;
end $$;
