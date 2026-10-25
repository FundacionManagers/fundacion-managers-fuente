-- ============================================================
-- Dos copas en la fase final, y los clubes nuevos de la 5a edicion.
-- Aplicada en el proyecto fundacion-managers el 25/10/2026.
--
-- La 5a edicion se juega en dos grupos de cuatro. Al cerrar los
-- grupos, el 1o y el 2o de cada uno van a la Copa Oro y el 3o y el 4o
-- a la Copa Plata. Cada copa tiene sus semifinales, su tercer puesto y
-- su final, asi que `fase` ya no basta para saber de que cruce se
-- habla: hay dos finales en la misma edicion.
--
-- Se anade `copa` a la misma tabla en vez de crear otra, por la misma
-- razon que la 0007 metio la eliminatoria en `partidos`: el panel edita
-- con el mismo formulario y el sitio lee con la misma consulta.
--
-- Es nullable a proposito. La fase de grupos no pertenece a ninguna
-- copa, y la eliminatoria de la 4a edicion fue una sola llave. Que la
-- 5a la lleve siempre lo asegura el panel, que no deja crear un cruce
-- sin elegirla.
--
-- Los grupos NO se guardan en la base: salen de los clubes de cada
-- grupo, escritos en `liga.ts`, igual que los propios clubes. Un club
-- solo juega contra los de su grupo, asi que el grupo de un partido se
-- deduce de cualquiera de sus dos equipos.
-- ============================================================

alter table public.partidos
  add column if not exists copa text;

alter table public.partidos drop constraint if exists copa_valida;
alter table public.partidos
  add constraint copa_valida check (copa is null or copa in ('oro', 'plata'));

-- Un partido de grupos no es de ninguna copa.
alter table public.partidos drop constraint if exists copa_coherente;
alter table public.partidos
  add constraint copa_coherente check (fase <> 'grupos' or copa is null);

comment on column public.partidos.copa is
  'oro o plata en la fase final de una edicion con dos copas. Null en grupos y en ediciones de una sola llave.';

-- Los dos clubes que se suman en la 5a edicion. Los partidos referencian
-- `equipos`, asi que tienen que existir antes de cargar el fixture.
-- Escudo, colores definitivos y nombre exacto: pendientes de la
-- organizacion.
insert into public.equipos (slug, nombre, corto, color, titulos, orden) values
  ('isotopos-portal-1', 'Isótopos Portal 1', 'ISO', '#65A30D', 0, 8),
  ('cucuta-10-fc', 'Cúcuta 10 F.C.', 'CUC', '#9F1239', 0, 9)
on conflict (slug) do nothing;
