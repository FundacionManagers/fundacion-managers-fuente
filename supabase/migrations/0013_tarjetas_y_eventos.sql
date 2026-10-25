-- ============================================================
-- Tarjetas por partido y eventos de fecha.
-- Aplicada en el proyecto fundacion-managers el 25/10/2026.
--
-- TARJETAS. Hasta la 4a edicion se cargaba el acumulado por club
-- (tabla `disciplina`): dos numeros por equipo, escritos a mano. La
-- organizacion ahora publica cada tarjeta con su partido y su dorsal
-- —«La Banda Cruzada: 2 amarillas (#16 y #23) y 1 roja (#7)»— y de ahi
-- salen dos cosas que el acumulado no podia dar: las tarjetas de cada
-- partido y quien esta suspendido para la fecha siguiente.
--
-- Una fila por tarjeta, no un acumulado. El total por club se cuenta
-- en el sitio a partir de estas filas, igual que la tabla se cuenta a
-- partir de los marcadores: asi no puede haber un total que contradiga
-- las tarjetas de los partidos.
--
-- El dorsal es opcional: el documento de la Fecha 1 no lo da para todas
-- («The Originals recibio 2 amarillas»). Sin dorsal la tarjeta cuenta
-- para el Fair Play del club, pero no puede suspender a nadie.
--
-- No se guarda el nombre del jugador: el dorsal basta para el
-- reglamento y la tabla se lee sin sesion (Ley 1581, minimo necesario).
--
-- `disciplina` se conserva para las ediciones anteriores. Una edicion
-- con tarjetas cargadas aqui ignora la suya.
--
-- EVENTOS DE FECHA. La Fecha 1 tuvo a las 10:00 un torneo de penales
-- con su campeon, que no es un partido de grupos: no suma puntos ni
-- tiene dos equipos. Es un texto con hora dentro de una fecha.
-- ============================================================

create table if not exists public.tarjetas (
  id              uuid primary key default gen_random_uuid(),
  edicion         int  not null,
  partido         uuid not null references public.partidos(id) on delete cascade,
  equipo          text not null references public.equipos(slug) on update cascade,
  numero          int  check (numero between 0 and 999),
  tipo            text not null check (tipo in ('amarilla', 'roja')),
  creado_en       timestamptz not null default now(),
  actualizado_en  timestamptz not null default now()
);

create index if not exists tarjetas_edicion_idx on public.tarjetas (edicion, partido);

comment on table public.tarjetas is
  'Una fila por tarjeta mostrada. El acumulado por club y los suspendidos se calculan en el sitio.';
comment on column public.tarjetas.numero is
  'Dorsal. Null si la organizacion no lo informo: cuenta para el Fair Play pero no suspende a nadie.';

-- El club de la tarjeta tiene que haber jugado ese partido. Una tarjeta
-- cargada al equipo equivocado moveria la tabla del Fair Play sin que
-- nadie lo notara. Es un trigger y no un check porque mira otra tabla.
create or replace function public.tarjeta_de_quien_jugo()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.partidos p
     where p.id = new.partido
       and p.edicion = new.edicion
       and new.equipo in (p.local, p.visitante)
  ) then
    raise exception 'La tarjeta es de % y ese club no jugo el partido %', new.equipo, new.partido;
  end if;
  return new;
end $$;

drop trigger if exists tarjeta_coherente on public.tarjetas;
create trigger tarjeta_coherente before insert or update on public.tarjetas
  for each row execute function public.tarjeta_de_quien_jugo();

create table if not exists public.eventos_fecha (
  id              uuid primary key default gen_random_uuid(),
  edicion         int  not null,
  jornada         int  not null check (jornada >= 1),
  hora            time,
  titulo          text not null check (length(trim(titulo)) > 0),
  detalle         text,
  creado_en       timestamptz not null default now(),
  actualizado_en  timestamptz not null default now()
);

create index if not exists eventos_fecha_edicion_idx on public.eventos_fecha (edicion, jornada);

comment on table public.eventos_fecha is
  'Lo que pasa en una fecha y no es un partido: un torneo de penales, una premiacion.';

-- RLS: lectura publica, escritura solo para administradores activos,
-- con la misma condicion que `premios` (0010).
alter table public.tarjetas      enable row level security;
alter table public.eventos_fecha enable row level security;

do $$
declare
  t text;
  cond constant text :=
    'exists (select 1 from public.admins a
               where a.correo = lower(auth.jwt() ->> ''email'') and a.activo)';
begin
  foreach t in array array['tarjetas', 'eventos_fecha'] loop
    execute format('drop policy if exists "publico_lee" on public.%I', t);
    execute format(
      'create policy "publico_lee" on public.%I for select to anon, authenticated using (true)', t);

    execute format('drop policy if exists "admin_inserta" on public.%I', t);
    execute format(
      'create policy "admin_inserta" on public.%I for insert to authenticated with check (%s)', t, cond);

    execute format('drop policy if exists "admin_actualiza" on public.%I', t);
    execute format(
      'create policy "admin_actualiza" on public.%I for update to authenticated using (%s) with check (%s)', t, cond, cond);

    execute format('drop policy if exists "admin_elimina" on public.%I', t);
    execute format(
      'create policy "admin_elimina" on public.%I for delete to authenticated using (%s)', t, cond);

    execute format('drop trigger if exists touch_%I on public.%I', t, t);
    execute format(
      'create trigger touch_%I before update on public.%I
         for each row execute function public.touch_actualizado_en()', t, t);
  end loop;
end $$;

-- La marca de cambios tiene que ver las tablas nuevas: si no, cargar una
-- tarjeta en el panel no dispararia la republicacion del cron. Misma
-- vista que la 0009, con dos tablas mas.
create or replace view public.torneo_marca_edicion
with (security_invoker = true) as
with ediciones as (
  select edicion from public.partidos
  union
  select edicion from public.disciplina
  union
  select edicion from public.goleadores
  union
  select edicion from public.tarjetas
  union
  select edicion from public.eventos_fecha
),
equipos_marca as (
  select
    coalesce(max(actualizado_en), 'epoch'::timestamptz) as ultimo_cambio,
    count(*)                                            as filas
  from public.equipos
)
select
  e.edicion,
  greatest(
    coalesce((select max(p.actualizado_en) from public.partidos      p where p.edicion = e.edicion), 'epoch'::timestamptz),
    coalesce((select max(d.actualizado_en) from public.disciplina    d where d.edicion = e.edicion), 'epoch'::timestamptz),
    coalesce((select max(g.actualizado_en) from public.goleadores    g where g.edicion = e.edicion), 'epoch'::timestamptz),
    coalesce((select max(t.actualizado_en) from public.tarjetas      t where t.edicion = e.edicion), 'epoch'::timestamptz),
    coalesce((select max(v.actualizado_en) from public.eventos_fecha v where v.edicion = e.edicion), 'epoch'::timestamptz),
    eq.ultimo_cambio
  ) as ultimo_cambio,
  (select count(*) from public.partidos      p where p.edicion = e.edicion)
  + (select count(*) from public.disciplina    d where d.edicion = e.edicion)
  + (select count(*) from public.goleadores    g where g.edicion = e.edicion)
  + (select count(*) from public.tarjetas      t where t.edicion = e.edicion)
  + (select count(*) from public.eventos_fecha v where v.edicion = e.edicion)
  + eq.filas as filas
from ediciones e
cross join equipos_marca eq;

grant select on public.torneo_marca_edicion to anon, authenticated;
