-- 0015 · La marca de cambios cuenta también los premios
-- Aplicada el 25/10/2026.
--
-- Por qué: la vista de 0013 miraba partidos, disciplina, goleadores, tarjetas,
-- eventos y equipos, pero no `premios`. Guardar o borrar el MVP no movía la
-- marca: la revisión programada no republicaba y el panel decía «Todo
-- publicado» con el MVP todavía fuera de la web. Misma vista, una tabla más.

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
  union
  select edicion from public.premios
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
    coalesce((select max(r.actualizado_en) from public.premios       r where r.edicion = e.edicion), 'epoch'::timestamptz),
    eq.ultimo_cambio
  ) as ultimo_cambio,
  (select count(*) from public.partidos      p where p.edicion = e.edicion)
  + (select count(*) from public.disciplina    d where d.edicion = e.edicion)
  + (select count(*) from public.goleadores    g where g.edicion = e.edicion)
  + (select count(*) from public.tarjetas      t where t.edicion = e.edicion)
  + (select count(*) from public.eventos_fecha v where v.edicion = e.edicion)
  + (select count(*) from public.premios       r where r.edicion = e.edicion)
  + eq.filas as filas
from ediciones e
cross join equipos_marca eq;

grant select on public.torneo_marca_edicion to anon, authenticated;
