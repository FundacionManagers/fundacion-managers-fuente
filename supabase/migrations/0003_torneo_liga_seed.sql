begin;
delete from public.goleadores where edicion = 4;
delete from public.partidos where edicion = 4;
delete from public.disciplina where edicion = 4;

insert into public.equipos (slug, nombre, corto, color, titulos, orden) values
  ('pomada-alfa', 'Pomada Alfa', 'PAL', '#8B2E2E', 2, 0),
  ('the-originals', 'The Originals', 'ORI', '#2D6CDF', 1, 1),
  ('los-pibes', 'Los Pibes del Barrio', 'PIB', '#C8362B', 0, 2),
  ('yonotomo-fc', 'Yonotomo', 'YON', '#E8722C', 0, 3),
  ('la-banda-cruzada', 'La Banda Cruzada FC', 'LBC', '#5BB8E0', 0, 4),
  ('tp-fc', 'Tranquilo Papi', 'TPA', '#0F766E', 0, 5),
  ('managers-fc', 'Managers FC', 'MGR', '#D4A437', 0, 6),
  ('useche-fc', 'Useches', 'USE', '#5B3DA8', 0, 7)
on conflict (slug) do update set nombre = excluded.nombre, corto = excluded.corto, color = excluded.color, titulos = excluded.titulos, orden = excluded.orden;

insert into public.partidos (edicion, jornada, fecha, hora, local, visitante, goles_local, goles_visitante, estado) values
  (4, 1, '2026-07-26', '07:00', 'the-originals', 'tp-fc', 4, 1, 'jugado'),
  (4, 1, '2026-07-26', '08:00', 'pomada-alfa', 'yonotomo-fc', 9, 4, 'jugado'),
  (4, 1, '2026-07-26', '09:00', 'los-pibes', 'la-banda-cruzada', 4, 2, 'jugado'),
  (4, 1, '2026-07-26', '10:00', 'useche-fc', 'managers-fc', 4, 1, 'jugado'),
  (4, 2, '2026-08-02', '07:00', 'yonotomo-fc', 'the-originals', 2, 1, 'jugado'),
  (4, 2, '2026-08-02', '08:00', 'la-banda-cruzada', 'tp-fc', 3, 4, 'jugado'),
  (4, 2, '2026-08-02', '09:00', 'managers-fc', 'pomada-alfa', 0, 1, 'jugado'),
  (4, 2, '2026-08-02', '10:00', 'los-pibes', 'useche-fc', 4, 2, 'jugado'),
  (4, 3, '2026-08-05', '20:00', 'useche-fc', 'la-banda-cruzada', 4, 3, 'jugado'),
  (4, 3, '2026-08-05', '21:00', 'los-pibes', 'yonotomo-fc', 7, 0, 'jugado'),
  (4, 3, '2026-08-06', '20:00', 'pomada-alfa', 'tp-fc', 2, 1, 'jugado'),
  (4, 3, '2026-08-06', '21:00', 'managers-fc', 'the-originals', 1, 3, 'jugado'),
  (4, 4, '2026-08-12', '20:00', 'pomada-alfa', 'los-pibes', 4, 2, 'jugado'),
  (4, 4, '2026-08-12', '21:00', 'yonotomo-fc', 'managers-fc', 3, 1, 'jugado'),
  (4, 4, '2026-08-13', '20:00', 'useche-fc', 'tp-fc', 2, 5, 'jugado'),
  (4, 4, '2026-08-13', '21:00', 'the-originals', 'la-banda-cruzada', 3, 0, 'jugado'),
  (4, 5, '2026-08-23', '07:00', 'managers-fc', 'los-pibes', null, null, 'programado'),
  (4, 5, '2026-08-23', '08:00', 'la-banda-cruzada', 'pomada-alfa', null, null, 'programado'),
  (4, 5, '2026-08-23', '09:00', 'the-originals', 'useche-fc', null, null, 'programado'),
  (4, 5, '2026-08-23', '10:00', 'tp-fc', 'yonotomo-fc', null, null, 'programado'),
  (4, 6, '2026-08-30', '07:00', 'pomada-alfa', 'useche-fc', null, null, 'programado'),
  (4, 6, '2026-08-30', '08:00', 'tp-fc', 'managers-fc', null, null, 'programado'),
  (4, 6, '2026-08-30', '09:00', 'los-pibes', 'the-originals', null, null, 'programado'),
  (4, 6, '2026-08-30', '10:00', 'yonotomo-fc', 'la-banda-cruzada', null, null, 'programado'),
  (4, 7, '2026-09-06', '07:00', 'tp-fc', 'los-pibes', null, null, 'programado'),
  (4, 7, '2026-09-06', '08:00', 'la-banda-cruzada', 'managers-fc', null, null, 'programado'),
  (4, 7, '2026-09-06', '09:00', 'useche-fc', 'yonotomo-fc', null, null, 'programado'),
  (4, 7, '2026-09-06', '10:00', 'the-originals', 'pomada-alfa', null, null, 'programado');

insert into public.disciplina (edicion, equipo, amarillas, rojas) values
  (4, 'pomada-alfa', 3, 2),
  (4, 'the-originals', 5, 0),
  (4, 'los-pibes', 7, 1),
  (4, 'tp-fc', 2, 0),
  (4, 'useche-fc', 7, 0),
  (4, 'yonotomo-fc', 5, 2),
  (4, 'la-banda-cruzada', 3, 0),
  (4, 'managers-fc', 6, 1)
on conflict (edicion, equipo) do update set amarillas = excluded.amarillas, rojas = excluded.rojas;

insert into public.goleadores (edicion, jugador, equipo, numero, goles) values
  (4, 'David Rincón', 'los-pibes', 10, 6),
  (4, 'Andrés Ospina', 'yonotomo-fc', 8, 4),
  (4, 'Julián Niño', 'los-pibes', 21, 4),
  (4, 'Wilson Rubiano', 'tp-fc', 99, 4),
  (4, 'Juan Pinzón', 'useche-fc', 30, 4),
  (4, 'Camilo Rojas', 'pomada-alfa', 22, 3),
  (4, 'Andrés Wilches', 'useche-fc', 17, 3),
  (4, 'Alain Jaimes', 'the-originals', 11, 3),
  (4, 'Yesid Malagón', 'pomada-alfa', 91, 3),
  (4, 'Leider López', 'la-banda-cruzada', 23, 3),
  (4, 'Germán Cruz', 'tp-fc', 9, 3),
  (4, 'Daniel Hernández', 'pomada-alfa', 4, 2),
  (4, 'Carlos Cepeda', 'pomada-alfa', 7, 2),
  (4, 'Guillermo Alvira', 'yonotomo-fc', 19, 2),
  (4, 'Jeison Malagón', 'pomada-alfa', 8, 2),
  (4, 'Carlos Neira', 'los-pibes', 8, 2),
  (4, 'Omar Flórez', 'la-banda-cruzada', 7, 2),
  (4, 'Mauricio Altamar', 'yonotomo-fc', 10, 2),
  (4, 'Wilson Wilches', 'useche-fc', 94, 2),
  (4, 'Isnardo Zárate', 'useche-fc', 19, 2),
  (4, 'Daniel Delgado', 'los-pibes', 14, 2),
  (4, 'Diego Camacho', 'la-banda-cruzada', 8, 2),
  (4, 'Nelson Mora', 'the-originals', 8, 2),
  (4, 'Jans Nieto', 'pomada-alfa', 19, 2),
  (4, 'Jeferson Pedraza', 'the-originals', 37, 2),
  (4, 'Alfredo Tapia', 'the-originals', 7, 1),
  (4, 'Ronald Serna', 'the-originals', 43, 1),
  (4, 'Daniel Rodríguez', 'los-pibes', 5, 1),
  (4, 'Jesús Amaya', 'los-pibes', 9, 1),
  (4, 'Néstor Useche', 'useche-fc', 7, 1),
  (4, 'Gustavo Páez', 'managers-fc', 18, 1),
  (4, 'Jhon Tovaria', 'the-originals', 16, 1),
  (4, 'Leonardo Espitia', 'tp-fc', 19, 1),
  (4, 'Daniel Forero', 'la-banda-cruzada', 9, 1),
  (4, 'Rafael Quilindo', 'los-pibes', 28, 1),
  (4, 'Sebastián Galindo', 'pomada-alfa', 11, 1),
  (4, 'Julián Garzón', 'tp-fc', 4, 1),
  (4, 'James Guerrero', 'managers-fc', 90, 1),
  (4, 'Juan Mejía', 'pomada-alfa', 14, 1),
  (4, 'Christian López', 'yonotomo-fc', 77, 1),
  (4, 'Nicolás Muñoz', 'managers-fc', 13, 1),
  (4, 'William Castiblanco', 'tp-fc', 3, 1),
  (4, 'Joan Jurado', 'tp-fc', 17, 1),
  (4, 'Juan Álvarez', 'the-originals', 23, 1);

commit;