-- ============================================================
-- Fase final de la 4a edicion.
-- Aplicada en el proyecto fundacion-managers el 23/08/2026.
--
-- Los cruces eliminatorios van en la misma tabla que la fase de
-- grupos, distinguidos por `fase`. Asi el panel los edita con el
-- mismo formulario y el sitio los lee con la misma consulta: no hace
-- falta una tabla paralela ni codigo duplicado.
--
-- Las filas existentes quedan como 'grupos', que es lo que son.
--
-- Los partidos de fase final se crean cuando ya se sabe quienes
-- clasificaron, no antes. Por eso `local` y `visitante` siguen siendo
-- obligatorios: no hay cruces con rival por definir, y se evita tener
-- que aflojar el esquema para un estado transitorio.
-- ============================================================

alter table public.partidos
  add column if not exists fase text not null default 'grupos';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'fase_valida'
  ) then
    alter table public.partidos
      add constraint fase_valida check (
        fase in ('grupos', 'cuartos', 'semifinal', 'tercer-puesto', 'final')
      );
  end if;
end $$;

-- En fase final la jornada no aplica; se guarda 0 para no dejarla nula.
-- El check original exigia jornada >= 1, asi que se amplia.
alter table public.partidos drop constraint if exists partidos_jornada_check;
alter table public.partidos
  add constraint jornada_coherente check (
    (fase = 'grupos' and jornada >= 1) or (fase <> 'grupos' and jornada = 0)
  );

create index if not exists partidos_fase_idx on public.partidos (edicion, fase);

comment on column public.partidos.fase is
  'grupos para la fase regular; cuartos, semifinal, tercer-puesto o final para la eliminatoria.';
