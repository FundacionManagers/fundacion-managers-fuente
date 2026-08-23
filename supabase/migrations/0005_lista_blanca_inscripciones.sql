-- ============================================================
-- Extender la lista blanca a inscripciones y jugadores.
-- Aplicada en el proyecto fundacion-managers el 22/08/2026.
--
-- Ambas tablas permitian todo a cualquier cuenta autenticada. Al
-- habilitar el enlace magico eso se vuelve peligroso: registrarse basta
-- para leer datos personales de los equipos (capitan, contacto, plantel).
--
-- NO se toca:
--   * "publico_inserta" de inscripciones (anon): el formulario publico
--     de pre-inscripcion sigue funcionando igual.
--   * Las funciones fm_* (SECURITY DEFINER): los capitanes siguen
--     entrando con su token, sin cuenta, porque esas funciones no
--     pasan por RLS.
--
-- Verificado antes de aplicar: las dos cuentas que existen hoy
-- (jorgeicone.com@gmail.com y williammojica@fundacionmanagers.com)
-- ya estan en public.admins, asi que ninguna pierde acceso.
-- ============================================================

do $$
declare
  cond constant text :=
    'exists (select 1 from public.admins a
               where a.correo = lower(auth.jwt() ->> ''email'') and a.activo)';
begin
  -- inscripciones: lectura, actualizacion y borrado solo para la lista.
  drop policy if exists "admin_lee" on public.inscripciones;
  execute format(
    'create policy "admin_lee" on public.inscripciones for select to authenticated using (%s)', cond);

  drop policy if exists "admin_actualiza" on public.inscripciones;
  execute format(
    'create policy "admin_actualiza" on public.inscripciones for update to authenticated using (%s) with check (%s)',
    cond, cond);

  drop policy if exists "admin_elimina" on public.inscripciones;
  execute format(
    'create policy "admin_elimina" on public.inscripciones for delete to authenticated using (%s)', cond);

  -- jugadores: misma regla para el acceso con sesion.
  drop policy if exists "admin_jugadores_all" on public.jugadores;
  execute format(
    'create policy "admin_jugadores_all" on public.jugadores for all to authenticated using (%s) with check (%s)',
    cond, cond);
end $$;

-- Comprobado simulando cinco sesiones contra las 13 inscripciones reales:
--   Jorge 13 | William 13 | Ramon 13 | intruso 0 | anonimo 0
