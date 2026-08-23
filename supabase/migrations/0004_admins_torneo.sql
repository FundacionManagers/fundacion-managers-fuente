-- ============================================================
-- Lista blanca de administradores del torneo.
-- Aplicada en el proyecto fundacion-managers el 22/08/2026.
--
-- Hasta 0003 las politicas de escritura decian "to authenticated
-- using (true)": cualquier cuenta con sesion podia escribir. Como el
-- panel usara enlace magico y cualquiera puede pedir uno con su correo,
-- eso no alcanza. A partir de aqui escribir exige, ademas de sesion,
-- estar en esta tabla.
--
-- Efecto secundario deseado: el panel no usa contrasenas, asi que una
-- contrasena filtrada no es vector de ataque contra estos datos.
-- ============================================================

create table if not exists public.admins (
  correo          text primary key,
  nombre          text not null,
  activo          boolean not null default true,
  creado_en       timestamptz not null default now(),
  actualizado_en  timestamptz not null default now(),
  constraint correo_en_minusculas check (correo = lower(correo))
);

insert into public.admins (correo, nombre) values
  ('jorgeicone.com@gmail.com',            'Jorge Hugo Pérez Gaona'),
  ('ramonmojika25@gmail.com',             'Ramón Mojica'),
  ('williammojica@fundacionmanagers.com', 'William Mojica')
on conflict (correo) do update set nombre = excluded.nombre, activo = true;

alter table public.admins enable row level security;

-- Solo una sesion iniciada puede leer la lista; nunca el publico.
-- Es necesario para que las politicas de abajo puedan consultarla.
drop policy if exists "sesion_lee_admins" on public.admins;
create policy "sesion_lee_admins"
  on public.admins for select to authenticated using (true);

-- Nadie edita la lista desde la aplicacion: se administra por SQL.
-- Sin politicas de insert/update/delete, RLS las bloquea todas.

drop trigger if exists touch_admins on public.admins;
create trigger touch_admins before update on public.admins
  for each row execute function public.touch_actualizado_en();

-- ===== Reemplazar las politicas de escritura de las tablas del torneo =====
do $$
declare
  t text;
  cond constant text :=
    'exists (select 1 from public.admins a
               where a.correo = lower(auth.jwt() ->> ''email'') and a.activo)';
begin
  foreach t in array array['equipos', 'partidos', 'disciplina', 'goleadores'] loop
    execute format('drop policy if exists "admin_inserta" on public.%I', t);
    execute format(
      'create policy "admin_inserta" on public.%I for insert to authenticated with check (%s)',
      t, cond);

    execute format('drop policy if exists "admin_actualiza" on public.%I', t);
    execute format(
      'create policy "admin_actualiza" on public.%I for update to authenticated using (%s) with check (%s)',
      t, cond, cond);

    execute format('drop policy if exists "admin_elimina" on public.%I', t);
    execute format(
      'create policy "admin_elimina" on public.%I for delete to authenticated using (%s)',
      t, cond);
  end loop;
end $$;

-- Verificado el 22/08/2026 simulando dos sesiones: una cuenta fuera de la
-- lista fue rechazada al insertar y una de la lista escribio sin problema.
