-- ============================================================
-- Definicion por penales en la fase final.
-- Aplicada en el proyecto fundacion-managers el 13/09/2026.
--
-- En la liga un empate es un resultado valido y reparte un punto a
-- cada uno. En eliminatoria no: alguien tiene que pasar. Hasta ahora
-- la base solo guardaba goles, asi que un 1-1 en cuartos dejaba la
-- llave sin ganador y al panel sin donde anotar la tanda.
--
-- Se guardan como dos columnas mas, no como una tabla aparte ni como
-- un texto libre: asi la llave puede decidir quien pasa con la misma
-- comparacion numerica que ya usa para los goles.
-- ============================================================

alter table public.partidos
  add column if not exists penales_local     int check (penales_local >= 0),
  add column if not exists penales_visitante int check (penales_visitante >= 0);

-- Una tanda de penales solo existe si el partido es de fase final, esta
-- jugado, los goles quedaron iguales y alguien gano la tanda. Cualquier
-- otra combinacion es un dato mal cargado, y es preferible que la base lo
-- rechace a que la llave tenga que adivinar.
alter table public.partidos drop constraint if exists penales_coherentes;
alter table public.partidos
  add constraint penales_coherentes check (
    (penales_local is null and penales_visitante is null)
    or (
      fase <> 'grupos'
      and estado = 'jugado'
      and goles_local is not null
      and goles_local = goles_visitante
      and penales_local is not null
      and penales_visitante is not null
      and penales_local <> penales_visitante
    )
  );

comment on column public.partidos.penales_local is
  'Penales convertidos por el local en la tanda. Null si el partido no fue a penales.';
comment on column public.partidos.penales_visitante is
  'Penales convertidos por el visitante en la tanda. Null si el partido no fue a penales.';
