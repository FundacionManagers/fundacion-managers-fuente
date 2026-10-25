-- ============================================================
-- Tarjetas y torneo de penales de la Fecha 1 de la 5a edicion.
-- Ejecutado en el proyecto fundacion-managers el 25/10/2026, desde
-- MCP, despues de 0013_tarjetas_y_eventos.sql.
--
-- Fuente: el documento de la organizacion del 21/10/2026, seccion
-- «Tarjetas de la fecha». Con dorsal donde lo da; sin el donde solo
-- dice cuantas.
--
-- Los partidos se buscan por sus dos clubes y la fecha, no por id: el
-- id lo genera la base y cambia entre la edicion real y la de ensayos.
-- Se carga en la 5 y en la 99, y solo si esa edicion no tiene tarjetas.
-- ============================================================

do $$
declare
  ed int;
begin
  foreach ed in array array[5, 99] loop
    if exists (select 1 from public.tarjetas where edicion = ed) then
      raise notice 'La edicion % ya tiene tarjetas: no se toca.', ed;
      continue;
    end if;

    insert into public.tarjetas (edicion, partido, equipo, numero, tipo)
    select ed, p.id, t.equipo, t.numero, t.tipo
      from (values
        ('pomada-alfa',      'isotopos-portal-1', 'pomada-alfa',      null::int, 'amarilla'),
        ('la-banda-cruzada', 'los-pibes',         'la-banda-cruzada', 16,        'amarilla'),
        ('la-banda-cruzada', 'los-pibes',         'la-banda-cruzada', 23,        'amarilla'),
        ('la-banda-cruzada', 'los-pibes',         'la-banda-cruzada', 7,         'roja'),
        ('la-banda-cruzada', 'los-pibes',         'los-pibes',        7,         'amarilla'),
        ('la-banda-cruzada', 'los-pibes',         'los-pibes',        21,        'roja'),
        ('the-originals',    'tp-fc',             'the-originals',    null,      'amarilla'),
        ('the-originals',    'tp-fc',             'the-originals',    null,      'amarilla'),
        ('the-originals',    'tp-fc',             'tp-fc',            null,      'amarilla'),
        ('yonotomo-fc',      'cucuta-10-fc',      'yonotomo-fc',      null,      'amarilla'),
        ('yonotomo-fc',      'cucuta-10-fc',      'cucuta-10-fc',     null,      'amarilla'),
        ('yonotomo-fc',      'cucuta-10-fc',      'cucuta-10-fc',     null,      'amarilla'),
        ('yonotomo-fc',      'cucuta-10-fc',      'cucuta-10-fc',     null,      'amarilla'),
        ('yonotomo-fc',      'cucuta-10-fc',      'cucuta-10-fc',     null,      'amarilla')
      ) as t(local, visitante, equipo, numero, tipo)
      join public.partidos p
        on p.edicion = ed and p.fase = 'grupos' and p.jornada = 1
       and p.local = t.local and p.visitante = t.visitante;

    if not exists (select 1 from public.eventos_fecha where edicion = ed and jornada = 1) then
      insert into public.eventos_fecha (edicion, jornada, hora, titulo, detalle)
      values (ed, 1, '10:00', 'Torneo de penales', 'Campeón: Los Pibes del Barrio');
    end if;
  end loop;
end $$;
