-- ============================================================
-- Marca del estado del torneo, para saber si hay que republicar.
-- Aplicada en el proyecto fundacion-managers el 22/08/2026.
--
-- El sitio es estatico: guardar en el panel no basta, hay que
-- recompilar. El cron de .github/workflows/deploy.yml revisa esta
-- vista cada 15 minutos y solo dispara el despliegue cuando algo
-- cambio de verdad.
--
-- Incluye el conteo de filas ademas de la ultima fecha de cambio,
-- porque un borrado no mueve ningun `actualizado_en`: si se elimina
-- un goleador, la marca de tiempo sigue igual y el cambio pasaria
-- inadvertido. El conteo si baja.
--
-- security_invoker: la vista respeta las politicas RLS de las tablas
-- que consulta, en vez de saltarselas con los permisos de su dueno.
-- ============================================================

create or replace view public.torneo_marca
with (security_invoker = true) as
select
  greatest(
    coalesce((select max(actualizado_en) from public.partidos),   'epoch'::timestamptz),
    coalesce((select max(actualizado_en) from public.disciplina), 'epoch'::timestamptz),
    coalesce((select max(actualizado_en) from public.goleadores), 'epoch'::timestamptz),
    coalesce((select max(actualizado_en) from public.equipos),    'epoch'::timestamptz)
  ) as ultimo_cambio,
  (select count(*) from public.partidos)
  + (select count(*) from public.disciplina)
  + (select count(*) from public.goleadores)
  + (select count(*) from public.equipos) as filas;

comment on view public.torneo_marca is
  'Resumen del estado del torneo (ultimo cambio + total de filas) para decidir si republicar el sitio.';

grant select on public.torneo_marca to anon, authenticated;
