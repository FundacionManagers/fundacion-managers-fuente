-- ============================================================
-- Premios de jurado.
-- Aplicada en el proyecto fundacion-managers el 27/09/2026.
--
-- Casi todos los premios del panel salen solos de los marcadores: el
-- campeon de la final, el goleador del ranking, la valla de los goles
-- recibidos, el equipo mas goleador de los goles a favor. El MVP no:
-- no hay asistencias, ni minutos, ni valoraciones en el sistema. Es una
-- eleccion del jurado, y lo unico honesto es darle un sitio donde vivir
-- en vez de inventarle una formula que no se sostiene.
--
-- Una fila por premio y edicion. `clave` queda libre a proposito: si
-- manana aparece "revelacion" o "mejor arquero", entra sin migracion,
-- solo ampliando el check.
-- ============================================================

create table if not exists public.premios (
  edicion         int  not null default 4,
  clave           text not null,
  jugador         text,
  equipo          text references public.equipos(slug) on update cascade,
  nota            text,
  creado_en       timestamptz not null default now(),
  actualizado_en  timestamptz not null default now(),
  primary key (edicion, clave),
  constraint clave_conocida check (clave in ('mvp'))
);

drop trigger if exists touch_premios on public.premios;
create trigger touch_premios before update on public.premios
  for each row execute function public.touch_actualizado_en();

alter table public.premios enable row level security;

drop policy if exists "publico_lee" on public.premios;
create policy "publico_lee" on public.premios
  for select to anon, authenticated using (true);

do $$
declare
  cond constant text :=
    'exists (select 1 from public.admins a
               where a.correo = lower(auth.jwt() ->> ''email'') and a.activo)';
begin
  execute format('drop policy if exists "admin_inserta" on public.premios');
  execute format(
    'create policy "admin_inserta" on public.premios for insert to authenticated with check (%s)', cond);
  execute format('drop policy if exists "admin_actualiza" on public.premios');
  execute format(
    'create policy "admin_actualiza" on public.premios for update to authenticated using (%s) with check (%s)', cond, cond);
  execute format('drop policy if exists "admin_elimina" on public.premios');
  execute format(
    'create policy "admin_elimina" on public.premios for delete to authenticated using (%s)', cond);
end $$;

comment on table public.premios is
  'Premios que decide un jurado y no se pueden deducir de los marcadores. Hoy solo el MVP.';
