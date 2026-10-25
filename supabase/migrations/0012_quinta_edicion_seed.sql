-- ============================================================
-- Fixture de la 5a edicion y resultados de la Fecha 1.
-- Ejecutado en el proyecto fundacion-managers el 25/10/2026, desde
-- MCP, despues de 0012_copas.sql (que crea los dos clubes nuevos).
--
-- Fuente: «Actualizacion pagina web · Torneo Managers Quinta Edicion»,
-- documento de la organizacion del 21/10/2026.
--
-- Dos grupos de cuatro, todos contra todos dentro del grupo: tres
-- fechas de cuatro partidos. El grupo no va en la fila, sale de los
-- clubes (ver la nota de 0012_copas.sql).
--
-- Solo inserta si la edicion 5 esta vacia: a partir de aqui los
-- marcadores los carga el panel, y volver a correr esto no debe pisar
-- nada de lo que se haya cargado despues.
-- ============================================================

do $$
begin
  if exists (select 1 from public.partidos where edicion = 5) then
    raise notice 'La edicion 5 ya tiene partidos: no se toca.';
    return;
  end if;

  insert into public.partidos
    (edicion, fase, jornada, fecha, hora, local, visitante, goles_local, goles_visitante, estado)
  values
    -- Fecha 1 · domingo 18 de octubre (jugada)
    (5, 'grupos', 1, '2026-10-18', '08:00', 'pomada-alfa',      'isotopos-portal-1', 10, 4, 'jugado'),
    (5, 'grupos', 1, '2026-10-18', '09:00', 'la-banda-cruzada', 'los-pibes',          6, 1, 'jugado'),
    (5, 'grupos', 1, '2026-10-18', '11:00', 'the-originals',    'tp-fc',              1, 3, 'jugado'),
    (5, 'grupos', 1, '2026-10-18', '12:00', 'yonotomo-fc',      'cucuta-10-fc',       5, 6, 'jugado'),
    -- Fecha 2 · domingo 25 de octubre
    (5, 'grupos', 2, '2026-10-25', '08:00', 'la-banda-cruzada', 'isotopos-portal-1', null, null, 'programado'),
    (5, 'grupos', 2, '2026-10-25', '09:00', 'the-originals',    'cucuta-10-fc',      null, null, 'programado'),
    (5, 'grupos', 2, '2026-10-25', '10:00', 'pomada-alfa',      'los-pibes',         null, null, 'programado'),
    (5, 'grupos', 2, '2026-10-25', '11:00', 'tp-fc',            'yonotomo-fc',       null, null, 'programado'),
    -- Fecha 3 · domingo 8 de noviembre
    (5, 'grupos', 3, '2026-11-08', '08:00', 'isotopos-portal-1', 'los-pibes',        null, null, 'programado'),
    (5, 'grupos', 3, '2026-11-08', '09:00', 'pomada-alfa',       'la-banda-cruzada', null, null, 'programado'),
    (5, 'grupos', 3, '2026-11-08', '10:00', 'the-originals',     'yonotomo-fc',      null, null, 'programado'),
    (5, 'grupos', 3, '2026-11-08', '11:00', 'tp-fc',             'cucuta-10-fc',     null, null, 'programado');

  -- Tarjetas acumuladas tras la Fecha 1, club por club.
  insert into public.disciplina (edicion, equipo, amarillas, rojas) values
    (5, 'pomada-alfa',       1, 0),
    (5, 'isotopos-portal-1', 0, 0),
    (5, 'la-banda-cruzada',  2, 1),
    (5, 'los-pibes',         1, 1),
    (5, 'the-originals',     2, 0),
    (5, 'tp-fc',             1, 0),
    (5, 'yonotomo-fc',       1, 0),
    (5, 'cucuta-10-fc',      4, 0);
end $$;
