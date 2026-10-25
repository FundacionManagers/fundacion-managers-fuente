/**
 * La 4ª edición (2026-2), ya cerrada: liga de 7 fechas con 8 clubes y una
 * llave de cuartos a la final. Campeón: Pomada Alfa, en penales.
 *
 * Vive aparte por la misma razón que `edicion-3.ts`: el palmarés se deriva
 * de su Gran Final, y la edición en curso —la 5ª— ya no tiene nada que ver
 * con este formato. Mientras se jugó, estos datos eran el respaldo de
 * `liga.ts` por si Supabase no respondía en el build; ahora son historia.
 *
 * OJO: la liga y la planilla de goleadores de aquí son la FOTO DE LA FECHA
 * 5, que es lo último que se copió al respaldo. Las fechas 6 y 7 figuran
 * como programadas. La edición completa —28 partidos, 61 anotadores, 158
 * goles con la fase final— está en la base como edición 4, y de allí hay que
 * sacarla si algún día se publica.
 *
 * Se conserva la foto, y no solo la final, porque las verificaciones de
 * `tests/` la siguen cuadrando: los 8 clubes suman 97 goles a favor, el
 * ranking reparte 96 entre 46 anotadores y el que falta es el autogol de
 * `AUTOGOLES_4`, que lo marcó Managers FC en su propia portería y cuenta para
 * Pomada Alfa. La fase final de abajo sí es la definitiva.
 *
 * Esto además detectó en su día dos erratas en el gráfico oficial de la
 * Fecha 4: la diferencia de gol de Useches (dice -2, son -1) y la de
 * Yonotomo (dice -13, son -9).
 */

import type { Partido } from './edicion-3';
import type { Autogol, Disciplina, Goleador, PartidoLiga } from './liga';

/** Cada fecha con su día y su rótulo, tal como aparecen en el fixture oficial. */
export const JORNADAS_INFO_4: readonly { jornada: number; etiqueta: string }[] = [
  { jornada: 1, etiqueta: 'Domingo 26 de julio 2026' },
  { jornada: 2, etiqueta: 'Domingo 2 de agosto 2026' },
  { jornada: 3, etiqueta: 'Miércoles 5 y jueves 6 de agosto 2026' },
  { jornada: 4, etiqueta: 'Miércoles 12 y jueves 13 de agosto 2026' },
  { jornada: 5, etiqueta: 'Domingo 23 de agosto 2026' },
  { jornada: 6, etiqueta: 'Domingo 30 de agosto 2026' },
  { jornada: 7, etiqueta: 'Domingo 6 de septiembre 2026' },
] as const;

/**
 * Fixture completo. Fechas 1 a 5 jugadas; 6 y 7 programadas.
 *
 * Nota: el gráfico de la Fecha 3 rotula el miércoles como 05/02/2026, pero
 * el fixture oficial lo fija el 5 de agosto. Se usa la fecha del fixture.
 */
export const PARTIDOS_LIGA_4: readonly PartidoLiga[] = [
  // Fecha 1 — domingo 26 de julio
  {
    id: 'j1p1',
    jornada: 1,
    fecha: '26/07/2026',
    hora: '07:00',
    local: 'the-originals',
    visitante: 'tp-fc',
    golesLocal: 4,
    golesVisitante: 1,
    estado: 'jugado',
  },
  {
    id: 'j1p2',
    jornada: 1,
    fecha: '26/07/2026',
    hora: '08:00',
    local: 'pomada-alfa',
    visitante: 'yonotomo-fc',
    golesLocal: 9,
    golesVisitante: 4,
    estado: 'jugado',
  },
  {
    id: 'j1p3',
    jornada: 1,
    fecha: '26/07/2026',
    hora: '09:00',
    local: 'los-pibes',
    visitante: 'la-banda-cruzada',
    golesLocal: 4,
    golesVisitante: 2,
    estado: 'jugado',
  },
  {
    id: 'j1p4',
    jornada: 1,
    fecha: '26/07/2026',
    hora: '10:00',
    local: 'useche-fc',
    visitante: 'managers-fc',
    golesLocal: 4,
    golesVisitante: 1,
    estado: 'jugado',
  },

  // Fecha 2 — domingo 2 de agosto
  {
    id: 'j2p1',
    jornada: 2,
    fecha: '02/08/2026',
    hora: '07:00',
    local: 'yonotomo-fc',
    visitante: 'the-originals',
    golesLocal: 2,
    golesVisitante: 1,
    estado: 'jugado',
  },
  {
    id: 'j2p2',
    jornada: 2,
    fecha: '02/08/2026',
    hora: '08:00',
    local: 'la-banda-cruzada',
    visitante: 'tp-fc',
    golesLocal: 3,
    golesVisitante: 4,
    estado: 'jugado',
  },
  {
    id: 'j2p3',
    jornada: 2,
    fecha: '02/08/2026',
    hora: '09:00',
    local: 'managers-fc',
    visitante: 'pomada-alfa',
    golesLocal: 0,
    golesVisitante: 1,
    estado: 'jugado',
  },
  {
    id: 'j2p4',
    jornada: 2,
    fecha: '02/08/2026',
    hora: '10:00',
    local: 'los-pibes',
    visitante: 'useche-fc',
    golesLocal: 4,
    golesVisitante: 2,
    estado: 'jugado',
  },

  // Fecha 3 — miércoles 5 y jueves 6 de agosto
  {
    id: 'j3p1',
    jornada: 3,
    fecha: '05/08/2026',
    hora: '20:00',
    local: 'useche-fc',
    visitante: 'la-banda-cruzada',
    golesLocal: 4,
    golesVisitante: 3,
    estado: 'jugado',
  },
  {
    id: 'j3p2',
    jornada: 3,
    fecha: '05/08/2026',
    hora: '21:00',
    local: 'los-pibes',
    visitante: 'yonotomo-fc',
    golesLocal: 7,
    golesVisitante: 0,
    estado: 'jugado',
  },
  {
    id: 'j3p3',
    jornada: 3,
    fecha: '06/08/2026',
    hora: '20:00',
    local: 'pomada-alfa',
    visitante: 'tp-fc',
    golesLocal: 2,
    golesVisitante: 1,
    estado: 'jugado',
  },
  {
    id: 'j3p4',
    jornada: 3,
    fecha: '06/08/2026',
    hora: '21:00',
    local: 'managers-fc',
    visitante: 'the-originals',
    golesLocal: 1,
    golesVisitante: 3,
    estado: 'jugado',
  },

  // Fecha 4 — miércoles 12 y jueves 13 de agosto
  {
    id: 'j4p1',
    jornada: 4,
    fecha: '12/08/2026',
    hora: '20:00',
    local: 'pomada-alfa',
    visitante: 'los-pibes',
    golesLocal: 4,
    golesVisitante: 2,
    estado: 'jugado',
  },
  {
    id: 'j4p2',
    jornada: 4,
    fecha: '12/08/2026',
    hora: '21:00',
    local: 'yonotomo-fc',
    visitante: 'managers-fc',
    golesLocal: 3,
    golesVisitante: 1,
    estado: 'jugado',
  },
  {
    id: 'j4p3',
    jornada: 4,
    fecha: '13/08/2026',
    hora: '20:00',
    local: 'useche-fc',
    visitante: 'tp-fc',
    golesLocal: 2,
    golesVisitante: 5,
    estado: 'jugado',
  },
  {
    id: 'j4p4',
    jornada: 4,
    fecha: '13/08/2026',
    hora: '21:00',
    local: 'the-originals',
    visitante: 'la-banda-cruzada',
    golesLocal: 3,
    golesVisitante: 0,
    estado: 'jugado',
  },

  // Fecha 5 — domingo 23 de agosto
  {
    id: 'j5p1',
    jornada: 5,
    fecha: '23/08/2026',
    hora: '07:00',
    local: 'managers-fc',
    visitante: 'los-pibes',
    golesLocal: 0,
    golesVisitante: 0,
    estado: 'jugado',
  },
  {
    id: 'j5p2',
    jornada: 5,
    fecha: '23/08/2026',
    hora: '08:00',
    local: 'la-banda-cruzada',
    visitante: 'pomada-alfa',
    golesLocal: 2,
    golesVisitante: 7,
    estado: 'jugado',
  },
  {
    id: 'j5p3',
    jornada: 5,
    fecha: '23/08/2026',
    hora: '09:00',
    local: 'the-originals',
    visitante: 'useche-fc',
    golesLocal: 0,
    golesVisitante: 1,
    estado: 'jugado',
  },
  {
    id: 'j5p4',
    jornada: 5,
    fecha: '23/08/2026',
    hora: '10:00',
    local: 'tp-fc',
    visitante: 'yonotomo-fc',
    golesLocal: 0,
    golesVisitante: 0,
    estado: 'jugado',
  },

  // Fecha 6 — domingo 30 de agosto
  {
    id: 'j6p1',
    jornada: 6,
    fecha: '30/08/2026',
    hora: '07:00',
    local: 'pomada-alfa',
    visitante: 'useche-fc',
    golesLocal: null,
    golesVisitante: null,
    estado: 'programado',
  },
  {
    id: 'j6p2',
    jornada: 6,
    fecha: '30/08/2026',
    hora: '08:00',
    local: 'tp-fc',
    visitante: 'managers-fc',
    golesLocal: null,
    golesVisitante: null,
    estado: 'programado',
  },
  {
    id: 'j6p3',
    jornada: 6,
    fecha: '30/08/2026',
    hora: '09:00',
    local: 'los-pibes',
    visitante: 'the-originals',
    golesLocal: null,
    golesVisitante: null,
    estado: 'programado',
  },
  {
    id: 'j6p4',
    jornada: 6,
    fecha: '30/08/2026',
    hora: '10:00',
    local: 'yonotomo-fc',
    visitante: 'la-banda-cruzada',
    golesLocal: null,
    golesVisitante: null,
    estado: 'programado',
  },

  // Fecha 7 — domingo 6 de septiembre
  {
    id: 'j7p1',
    jornada: 7,
    fecha: '06/09/2026',
    hora: '07:00',
    local: 'tp-fc',
    visitante: 'los-pibes',
    golesLocal: null,
    golesVisitante: null,
    estado: 'programado',
  },
  {
    id: 'j7p2',
    jornada: 7,
    fecha: '06/09/2026',
    hora: '08:00',
    local: 'la-banda-cruzada',
    visitante: 'managers-fc',
    golesLocal: null,
    golesVisitante: null,
    estado: 'programado',
  },
  {
    id: 'j7p3',
    jornada: 7,
    fecha: '06/09/2026',
    hora: '09:00',
    local: 'useche-fc',
    visitante: 'yonotomo-fc',
    golesLocal: null,
    golesVisitante: null,
    estado: 'programado',
  },
  {
    id: 'j7p4',
    jornada: 7,
    fecha: '06/09/2026',
    hora: '10:00',
    local: 'the-originals',
    visitante: 'pomada-alfa',
    golesLocal: null,
    golesVisitante: null,
    estado: 'programado',
  },
] as const;

/** Tarjetas acumuladas hasta la Fecha 5, según el panel de la organización. */
export const DISCIPLINA_4: Readonly<Record<string, Disciplina>> = {
  'pomada-alfa': { amarillas: 3, rojas: 2 },
  'the-originals': { amarillas: 7, rojas: 0 },
  'los-pibes': { amarillas: 7, rojas: 1 },
  'tp-fc': { amarillas: 5, rojas: 0 },
  'useche-fc': { amarillas: 7, rojas: 0 },
  'yonotomo-fc': { amarillas: 6, rojas: 2 },
  'la-banda-cruzada': { amarillas: 4, rojas: 0 },
  'managers-fc': { amarillas: 7, rojas: 1 },
};

/**
 * Ranking de goleadores acumulado hasta la Fecha 5. 46 anotadores, 96 goles.
 *
 * Es una copia de lo que hay en Supabase, que es la fuente real: esto solo
 * se usa si la base no responde durante el build. Conviene resincronizarlo
 * de vez en cuando para que el respaldo no publique un ranking viejo.
 *
 * Los equipos suman 97 goles y aquí hay 96. El que falta es el autogol de
 * `AUTOGOLES_4`: cuenta para el club, no para la bota de oro. La verificación
 * de tests/ exige que toda diferencia entre la tabla y este ranking quede
 * explicada por un autogol registrado, club por club, para que nunca vuelva
 * a haber un gol suelto sin dar cuenta de él.
 */
export const GOLEADORES_4: readonly Goleador[] = [
  { posicion: 1, jugador: 'David Rincón', equipo: 'los-pibes', numero: 10, goles: 6 },
  { posicion: 2, jugador: 'Jans Nieto', equipo: 'pomada-alfa', numero: 19, goles: 5 },
  { posicion: 3, jugador: 'Andrés Ospina', equipo: 'yonotomo-fc', numero: 8, goles: 4 },
  { posicion: 4, jugador: 'Andrés Wilches', equipo: 'useche-fc', numero: 17, goles: 4 },
  { posicion: 5, jugador: 'Camilo Rojas', equipo: 'pomada-alfa', numero: 22, goles: 4 },
  { posicion: 6, jugador: 'Jeison Malagón', equipo: 'pomada-alfa', numero: 8, goles: 4 },
  { posicion: 7, jugador: 'Juan Pinzón', equipo: 'useche-fc', numero: 30, goles: 4 },
  { posicion: 8, jugador: 'Julián Niño', equipo: 'los-pibes', numero: 21, goles: 4 },
  { posicion: 9, jugador: 'Wilson Rubiano', equipo: 'tp-fc', numero: 99, goles: 4 },
  { posicion: 10, jugador: 'Alain Jaimes', equipo: 'the-originals', numero: 11, goles: 3 },
  { posicion: 11, jugador: 'Daniel Hernández', equipo: 'pomada-alfa', numero: 4, goles: 3 },
  { posicion: 12, jugador: 'Germán Cruz', equipo: 'tp-fc', numero: 9, goles: 3 },
  { posicion: 13, jugador: 'Leider López', equipo: 'la-banda-cruzada', numero: 23, goles: 3 },
  { posicion: 14, jugador: 'Carlos Cepeda', equipo: 'pomada-alfa', numero: 7, goles: 2 },
  { posicion: 15, jugador: 'Carlos Neira', equipo: 'los-pibes', numero: 8, goles: 2 },
  { posicion: 16, jugador: 'Daniel Delgado', equipo: 'los-pibes', numero: 14, goles: 2 },
  { posicion: 17, jugador: 'Diego Camacho', equipo: 'la-banda-cruzada', numero: 8, goles: 2 },
  { posicion: 18, jugador: 'Guillermo Alvira', equipo: 'yonotomo-fc', numero: 19, goles: 2 },
  { posicion: 19, jugador: 'Isnardo Zárate', equipo: 'useche-fc', numero: 19, goles: 2 },
  { posicion: 20, jugador: 'Jeferson Pedraza', equipo: 'the-originals', numero: 37, goles: 2 },
  { posicion: 21, jugador: 'Mauricio Altamar', equipo: 'yonotomo-fc', numero: 10, goles: 2 },
  { posicion: 22, jugador: 'Nelson Mora', equipo: 'the-originals', numero: 8, goles: 2 },
  { posicion: 23, jugador: 'Omar Flórez', equipo: 'la-banda-cruzada', numero: 7, goles: 2 },
  { posicion: 24, jugador: 'Wilson Wilches', equipo: 'useche-fc', numero: 94, goles: 2 },
  { posicion: 25, jugador: 'Yesid Malagón', equipo: 'pomada-alfa', numero: 91, goles: 2 },
  { posicion: 26, jugador: 'Alfredo Tapia', equipo: 'the-originals', numero: 7, goles: 1 },
  { posicion: 27, jugador: 'Arturo Castro', equipo: 'la-banda-cruzada', numero: 51, goles: 1 },
  { posicion: 28, jugador: 'Christian López', equipo: 'yonotomo-fc', numero: 77, goles: 1 },
  { posicion: 29, jugador: 'Daniel Forero', equipo: 'la-banda-cruzada', numero: 9, goles: 1 },
  { posicion: 30, jugador: 'Daniel Rodríguez', equipo: 'los-pibes', numero: 5, goles: 1 },
  { posicion: 31, jugador: 'Gustavo Páez', equipo: 'managers-fc', numero: 18, goles: 1 },
  { posicion: 32, jugador: 'James Guerrero', equipo: 'managers-fc', numero: 90, goles: 1 },
  { posicion: 33, jugador: 'Jaxon Murillo', equipo: 'la-banda-cruzada', numero: 2, goles: 1 },
  { posicion: 34, jugador: 'Jesús Amaya', equipo: 'los-pibes', numero: 9, goles: 1 },
  { posicion: 35, jugador: 'Jhon Tovaria', equipo: 'the-originals', numero: 16, goles: 1 },
  { posicion: 36, jugador: 'Joan Jurado', equipo: 'tp-fc', numero: 17, goles: 1 },
  { posicion: 37, jugador: 'Juan Álvarez', equipo: 'the-originals', numero: 23, goles: 1 },
  { posicion: 38, jugador: 'Juan Mejía', equipo: 'pomada-alfa', numero: 14, goles: 1 },
  { posicion: 39, jugador: 'Julián Garzón', equipo: 'tp-fc', numero: 4, goles: 1 },
  { posicion: 40, jugador: 'Leonardo Espitia', equipo: 'tp-fc', numero: 19, goles: 1 },
  { posicion: 41, jugador: 'Néstor Useche', equipo: 'useche-fc', numero: 7, goles: 1 },
  { posicion: 42, jugador: 'Nicolás Muñoz', equipo: 'managers-fc', numero: 13, goles: 1 },
  { posicion: 43, jugador: 'Rafael Quilindo', equipo: 'los-pibes', numero: 28, goles: 1 },
  { posicion: 44, jugador: 'Ronald Serna', equipo: 'the-originals', numero: 43, goles: 1 },
  { posicion: 45, jugador: 'Sebastián Galindo', equipo: 'pomada-alfa', numero: 11, goles: 1 },
  { posicion: 46, jugador: 'William Castiblanco', equipo: 'tp-fc', numero: 3, goles: 1 },
] as const;

/**
 * Autogoles de la fase de grupos, confirmados por la organización.
 *
 * El de la Fecha 2 lo marcó un jugador de Managers FC en su propia portería,
 * en el 0–1 contra Pomada Alfa: fue el único gol del partido. La web llegó a
 * atribuirlo a La Banda Cruzada, que era una deducción equivocada — se dio
 * por hecho que el autogol explicaba el hueco de ese club.
 *
 * La planilla ya está conciliada: el gol estaba acreditado a Yesid Malagón
 * y se le descontó en el panel, así que Pomada Alfa marca 23 con 22 de sus
 * jugadores más este autogol. El hueco de La Banda Cruzada era otra cosa y
 * se cerró aparte, cargando a Jaxon Murillo.
 */
export const AUTOGOLES_4: readonly Autogol[] = [{ autor: 'managers-fc', jornada: 2 }];

/** Los ocho clubes que jugaron la 4ª edición. */
export const CLUBES_4: readonly string[] = [
  'pomada-alfa',
  'the-originals',
  'los-pibes',
  'yonotomo-fc',
  'la-banda-cruzada',
  'tp-fc',
  'managers-fc',
  'useche-fc',
];

/**
 * La fase final de la 4ª edición, tal como quedó cargada en el panel.
 *
 * Va en la misma forma que la llave de la 3ª (`Partido`) para que el
 * palmarés, la ficha de cada club y la tarjeta de partido la pinten igual
 * sin saber de qué edición viene. Los cuartos van numerados por su hora,
 * que es como los numeró el cuadro oficial.
 */
export const FASE_FINAL_4: readonly Partido[] = [
  {
    id: 'e4-cf1',
    fase: 'cuartos',
    etiqueta: 'Cuartos · Partido 1',
    fecha: '13 sep 2026',
    hora: '08:00',
    local: 'los-pibes',
    visitante: 'yonotomo-fc',
    golesLocal: 3,
    golesVisitante: 2,
    estado: 'jugado',
    placeholder: false,
  },
  {
    id: 'e4-cf2',
    fase: 'cuartos',
    etiqueta: 'Cuartos · Partido 2',
    fecha: '13 sep 2026',
    hora: '09:00',
    local: 'pomada-alfa',
    visitante: 'la-banda-cruzada',
    golesLocal: 2,
    golesVisitante: 0,
    estado: 'jugado',
    placeholder: false,
  },
  {
    id: 'e4-cf3',
    fase: 'cuartos',
    etiqueta: 'Cuartos · Partido 3',
    fecha: '13 sep 2026',
    hora: '10:00',
    local: 'tp-fc',
    visitante: 'managers-fc',
    golesLocal: 3,
    golesVisitante: 0,
    estado: 'jugado',
    placeholder: false,
  },
  {
    id: 'e4-cf4',
    fase: 'cuartos',
    etiqueta: 'Cuartos · Partido 4',
    fecha: '13 sep 2026',
    hora: '11:00',
    local: 'useche-fc',
    visitante: 'the-originals',
    golesLocal: 3,
    golesVisitante: 3,
    penales: { local: 1, visitante: 2 },
    estado: 'jugado',
    placeholder: false,
  },
  {
    id: 'e4-sf1',
    fase: 'semifinal',
    etiqueta: 'Semifinal 1',
    fecha: '20 sep 2026',
    hora: '09:00',
    local: 'los-pibes',
    visitante: 'pomada-alfa',
    golesLocal: 0,
    golesVisitante: 1,
    estado: 'jugado',
    placeholder: false,
  },
  {
    id: 'e4-sf2',
    fase: 'semifinal',
    etiqueta: 'Semifinal 2',
    fecha: '20 sep 2026',
    hora: '10:00',
    local: 'tp-fc',
    visitante: 'the-originals',
    golesLocal: 1,
    golesVisitante: 1,
    penales: { local: 1, visitante: 3 },
    estado: 'jugado',
    placeholder: false,
  },
  {
    id: 'e4-tp',
    fase: 'tercer-puesto',
    etiqueta: 'Tercer puesto',
    fecha: '26 sep 2026',
    hora: '19:00',
    local: 'los-pibes',
    visitante: 'tp-fc',
    golesLocal: 1,
    golesVisitante: 1,
    penales: { local: 4, visitante: 3 },
    estado: 'jugado',
    placeholder: false,
  },
  {
    id: 'e4-fin',
    fase: 'final',
    etiqueta: 'Gran Final',
    fecha: '26 sep 2026',
    hora: '21:00',
    local: 'pomada-alfa',
    visitante: 'the-originals',
    golesLocal: 3,
    golesVisitante: 3,
    penales: { local: 6, visitante: 5 },
    estado: 'jugado',
    placeholder: false,
  },
];
