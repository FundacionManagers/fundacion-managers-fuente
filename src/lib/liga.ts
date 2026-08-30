/**
 * Fase de grupos de la 4ª edición (2026-2) — liga de 7 fechas, 8 equipos,
 * todos contra todos a una sola vuelta. 28 partidos en Thomajo Sport.
 *
 * A diferencia de la 3ª edición (llave eliminatoria, en `torneo-data.ts`),
 * esta edición se define por tabla de posiciones.
 *
 * DECISIÓN DE DISEÑO: la tabla NO se escribe a mano. `calcularPosiciones()`
 * la deriva de `PARTIDOS_LIGA`, así PJ, PG, PE, PP, GF, GC, DG y PTS son
 * siempre coherentes con el calendario: es imposible que se contradigan.
 * Solo se cargan a mano las tarjetas, que no se deducen de un marcador.
 *
 * Esto además detectó dos erratas en el gráfico oficial de la Fecha 4: la
 * diferencia de gol de Useches (dice -2, son -1) y la de Yonotomo (dice -13,
 * son -9). El resto de la tabla oficial coincide celda por celda.
 *
 * Al día en la Fecha 5, y cuadrado: los 8 clubes suman 97 goles a favor, el
 * ranking reparte 96 entre 46 anotadores y el que falta es el autogol de
 * `AUTOGOLES`, que lo marcó Managers FC en su propia portería y cuenta para
 * Pomada Alfa. Club por club también cuadra, y tests/ lo vigila.
 */

import { EQUIPOS } from './torneo-data';

export const EDICION_ACTUAL = 4;
export const PERIODO_ACTUAL = '2026-2';
export const TOTAL_JORNADAS = 7;
export const CANCHA = 'Thomajo Sport';
export const FORMATO_LIGA = 'Todos contra todos · una sola vuelta';

export interface PartidoLiga {
  id: string;
  /** Número de fecha, 1 a 7. */
  jornada: number;
  /** Día de juego, ej. '26/07/2026'. */
  fecha: string;
  /** Hora de inicio en formato 24h, ej. '20:00'. */
  hora: string;
  /** slug del equipo local. */
  local: string;
  /** slug del equipo visitante. */
  visitante: string;
  golesLocal: number | null;
  golesVisitante: number | null;
  estado: 'programado' | 'jugado';
}

/** Tarjetas acumuladas por club. No se deducen del marcador: se cargan. */
export interface Disciplina {
  amarillas: number;
  rojas: number;
}

export interface FilaPosicion {
  posicion: number;
  equipo: string;
  pj: number;
  pg: number;
  pe: number;
  pp: number;
  gf: number;
  gc: number;
  ta: number;
  tr: number;
  dg: number;
  pts: number;
}

export interface Goleador {
  posicion: number;
  jugador: string;
  equipo: string;
  /** Dorsal del jugador. */
  numero: number;
  goles: number;
}

/** Cada fecha con su día y su rótulo, tal como aparecen en el fixture oficial. */
export const JORNADAS_INFO: readonly { jornada: number; etiqueta: string }[] = [
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
export const PARTIDOS_LIGA: readonly PartidoLiga[] = [
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
export const DISCIPLINA: Readonly<Record<string, Disciplina>> = {
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
 * Peso de cada tarjeta para el desempate por juego limpio: menos es mejor.
 * La roja pesa el triple que la amarilla, como es habitual en el reglamento
 * de fair play.
 */
export const PESO_AMARILLA = 1;
export const PESO_ROJA = 3;

/** Puntos de juego limpio de un club. Cuantos menos, mejor clasificado. */
export function puntosJuegoLimpio(fila: Pick<FilaPosicion, 'ta' | 'tr'>): number {
  return fila.ta * PESO_AMARILLA + fila.tr * PESO_ROJA;
}

/**
 * Ranking de goleadores acumulado hasta la Fecha 5. 46 anotadores, 96 goles.
 *
 * Es una copia de lo que hay en Supabase, que es la fuente real: esto solo
 * se usa si la base no responde durante el build. Conviene resincronizarlo
 * de vez en cuando para que el respaldo no publique un ranking viejo.
 *
 * Los equipos suman 97 goles y aquí hay 96. El que falta es el autogol de
 * `AUTOGOLES`: cuenta para el club, no para la bota de oro. La verificación
 * de tests/ exige que toda diferencia entre la tabla y este ranking quede
 * explicada por un autogol registrado, club por club, para que nunca vuelva
 * a haber un gol suelto sin dar cuenta de él.
 */
export const GOLEADORES_LIGA: readonly Goleador[] = [
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
 * Gol en propia puerta: suma al club beneficiado, no a ningún goleador.
 *
 * Se registra el CLUB que lo marcó en su propia portería y la fecha, nunca
 * el jugador: el reglamento acredita el gol al equipo, y señalar a quien
 * tuvo la mala suerte no aporta nada.
 *
 * El club beneficiado no se escribe, se deduce del calendario — es el rival
 * de ese partido. Misma regla que el resto del sitio: si el dato se puede
 * sacar de los resultados, no se teclea.
 */
export interface Autogol {
  /** Slug del club que lo marcó en su propia portería. */
  autor: string;
  /** Fecha en que ocurrió. */
  jornada: number;
}

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
export const AUTOGOLES: readonly Autogol[] = [{ autor: 'managers-fc', jornada: 2 }];

/** Un goleador con su puesto compartido y cuántos lo comparten. */
export interface GoleadorClasificado extends Goleador {
  /** Cuántos jugadores tienen exactamente los mismos goles. */
  empatados: number;
}

/**
 * Reparte los puestos del ranking dejando que los empatados compartan número.
 *
 * El ranking numeraba de 1 a N por orden de llegada, así que siete jugadores
 * con 4 goles ocupaban los puestos 3 al 9 y el desempate real era el orden
 * alfabético — sin decirlo en ninguna parte. Andrés Ospina salía tercero y
 * Wilson Rubiano noveno con los mismos goles.
 *
 * Se usa la numeración estándar de competición: tras siete empatados en el
 * puesto 3, el siguiente es el 10. De los 46 anotadores actuales, 44 están
 * dentro de algún grupo de empate, así que esto no es un caso raro: es el
 * caso normal.
 */
export function posicionesCompartidas(
  goleadores: readonly Goleador[],
): readonly GoleadorClasificado[] {
  const ordenados = [...goleadores].sort(
    (a, b) => b.goles - a.goles || a.jugador.localeCompare(b.jugador, 'es'),
  );

  const cuantos = new Map<number, number>();
  for (const g of ordenados) cuantos.set(g.goles, (cuantos.get(g.goles) ?? 0) + 1);

  let puesto = 0;
  return ordenados.map((g, i) => {
    if (i === 0 || g.goles !== ordenados[i - 1]!.goles) puesto = i + 1;
    return { ...g, posicion: puesto, empatados: cuantos.get(g.goles) ?? 1 };
  });
}

/** Los goleadores agrupados por número de goles, de más a menos. */
export function tramosDeGoles(
  goleadores: readonly GoleadorClasificado[],
): { goles: number; posicion: number; jugadores: readonly GoleadorClasificado[] }[] {
  const tramos: { goles: number; posicion: number; jugadores: GoleadorClasificado[] }[] = [];
  for (const g of goleadores) {
    const ultimo = tramos[tramos.length - 1];
    if (ultimo && ultimo.goles === g.goles) ultimo.jugadores.push(g);
    else tramos.push({ goles: g.goles, posicion: g.posicion, jugadores: [g] });
  }
  return tramos;
}

/**
 * Club beneficiado por un autogol: el rival de ese partido.
 *
 * Sale del calendario, no de un campo escrito a mano, así que no puede
 * contradecir al fixture ni quedarse viejo si cambia un resultado.
 */
export function beneficiadoDe(
  autogol: Autogol,
  partidos: readonly PartidoLiga[] = PARTIDOS_LIGA,
): string | undefined {
  const partido = partidos.find(
    (p) =>
      p.jornada === autogol.jornada && (p.local === autogol.autor || p.visitante === autogol.autor),
  );
  if (!partido) return undefined;
  return partido.local === autogol.autor ? partido.visitante : partido.local;
}

/** Autogoles a favor de un club. */
export function autogolesDe(
  equipo: string,
  partidos: readonly PartidoLiga[] = PARTIDOS_LIGA,
  autogoles: readonly Autogol[] = AUTOGOLES,
): number {
  return autogoles.filter((a) => beneficiadoDe(a, partidos) === equipo).length;
}

export const PARTIDOS_JUGADOS = PARTIDOS_LIGA.filter((p) => p.estado === 'jugado');

export const JORNADA_ACTUAL = PARTIDOS_JUGADOS.reduce(
  (max, p) => (p.jornada > max ? p.jornada : max),
  0,
);

/** Última fecha con partidos jugados, sobre cualquier conjunto de partidos. */
export function jornadaActualDe(partidos: readonly PartidoLiga[]): number {
  return partidos.reduce(
    (max, p) => (p.estado === 'jugado' && p.jornada > max ? p.jornada : max),
    0,
  );
}

/** Partidos de una fecha concreta, en el orden del fixture. */
export function partidosDeJornada(
  jornada: number,
  partidos: readonly PartidoLiga[] = PARTIDOS_LIGA,
): PartidoLiga[] {
  return partidos.filter((p) => p.jornada === jornada);
}

/** Próximo partido programado, o null si ya se jugaron todos. */
export const PROXIMO_PARTIDO = PARTIDOS_LIGA.find((p) => p.estado === 'programado') ?? null;

/** Primer partido sin jugar de un conjunto: el próximo del calendario. */
export function proximoPartidoDe(partidos: readonly PartidoLiga[]): PartidoLiga | null {
  return partidos.find((p) => p.estado === 'programado') ?? null;
}

/**
 * Lo próximo que se juega, sea una fecha de grupos o una ronda de la final.
 *
 * Existe para que la web no se quede sin "próximo" el 6 de septiembre.
 * Hasta ahora todo miraba `proximoPartidoDe`, que solo conoce la fase de
 * grupos: en cuanto se jugara la Fecha 7 devolvería vacío y desaparecerían
 * de golpe la tarjeta del Calendario y el punto de aviso de la pestaña,
 * justo en la semana previa a cuartos.
 *
 * El orden de búsqueda es:
 *   1. La siguiente fecha de grupos con partidos por jugar.
 *   2. La siguiente ronda de la eliminatoria que ya esté cargada en el panel.
 *   3. La siguiente ronda del calendario anunciado, aunque todavía no tenga
 *      ni equipos ni horas.
 *
 * Cuál es la ronda pendiente se decide por los datos, no por la fecha de
 * hoy: es la primera que no tiene todos sus partidos jugados. Así no
 * depende de cuándo se compiló el sitio.
 */
export interface Compromiso {
  tipo: 'jornada' | 'ronda';
  /** 'Fecha 6' o 'Cuartos de final'. */
  titulo: string;
  /** 'Domingo 30 de agosto 2026'. */
  etiqueta: string;
  /** Momento de inicio en ISO, para la cuenta atrás del navegador. */
  iso: string;
  /** Los partidos, si ya se conocen. Vacío en una ronda sin sorteo. */
  partidos: readonly PartidoLiga[];
}

export function proximoCompromiso(
  partidos: readonly PartidoLiga[],
  eliminatoria: readonly PartidoEliminatoria[] = [],
): Compromiso | null {
  // 1. Fase de grupos.
  const siguiente = proximoPartidoDe(partidos);
  if (siguiente) {
    const suyos = partidosDeJornada(siguiente.jornada, partidos);
    return {
      tipo: 'jornada',
      titulo: `Fecha ${siguiente.jornada}`,
      etiqueta:
        JORNADAS_INFO.find((j) => j.jornada === siguiente.jornada)?.etiqueta ??
        fechaLargaDe(siguiente.fecha),
      iso: isoDe(siguiente),
      partidos: suyos,
    };
  }

  // 2 y 3. La primera ronda de la final que aún no se ha jugado entera.
  for (const ronda of CALENDARIO_FASE_FINAL) {
    const suyos = eliminatoria.filter((p) => p.fase === ronda.fase);
    const pendiente = suyos.length === 0 || suyos.some((p) => p.estado === 'programado');
    if (!pendiente) continue;

    // Si ya hay cruces cargados, mandan su fecha y su hora sobre lo anunciado.
    const primero = suyos.find((p) => p.estado === 'programado') ?? suyos[0];
    const fecha = primero?.fecha ?? ronda.fecha;
    return {
      tipo: 'ronda',
      titulo: ronda.titulo,
      etiqueta: fechaLargaDe(fecha),
      iso: primero ? isoDe(primero) : `${aISO(fecha)}T00:00:00-05:00`,
      partidos: suyos,
    };
  }

  return null;
}

/** '13/09/2026' → '2026-09-13'. */
function aISO(fecha: string): string {
  const [d, m, a] = fecha.split('/');
  return `${a}-${m}-${d}`;
}

/**
 * Momento exacto del partido en ISO con la zona de Colombia.
 *
 * '30/08/2026' + '07:00' → '2026-08-30T07:00:00-05:00'. Lleva el huso
 * escrito: sin él, el navegador de quien mire desde otro país lo
 * interpretaría en su propia hora y la cuenta atrás saldría corrida.
 */
export function isoDe(partido: PartidoLiga): string {
  const [d, m, a] = partido.fecha.split('/');
  return `${a}-${m}-${d}T${partido.hora}:00-05:00`;
}

/** Día de un partido en formato corto: '30/08/2026' → 'dom 30 ago'. */
const DIAS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'] as const;
const MESES = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
] as const;

export function diaCortoDe(partido: PartidoLiga): string {
  const [d, m, a] = partido.fecha.split('/').map(Number) as [number, number, number];
  // Mediodía UTC para que el día no se corra por el huso al formatear.
  const dia = new Date(Date.UTC(a, m - 1, d, 12));
  return `${DIAS[dia.getUTCDay()]} ${d} ${MESES[m - 1]}`;
}

/**
 * ¿Esta fecha del torneo se reparte en más de un día?
 *
 * Las fechas 3 y 4 se juegan miércoles y jueves. El rótulo lo decía
 * ("Miércoles 5 y jueves 6"), pero ningún partido decía cuál era el suyo, y
 * la diferencia entre un día y otro es pedir permiso en el trabajo.
 */
export function jornadaEnVariosDias(partidos: readonly PartidoLiga[]): boolean {
  return new Set(partidos.map((p) => p.fecha)).size > 1;
}

/**
 * Calcula la tabla de posiciones a partir de los partidos jugados.
 *
 * Desempate segun el Articulo 14 del reglamento del torneo, en este orden:
 *
 *   1. Puntaje
 *   2. Fair Play          <- antes que la diferencia de gol
 *   3. Diferencia de gol
 *   4. Goles a favor
 *   5. Resultados entre si
 *   6. Sorteo
 *
 * El orden importa: con Fair Play en segundo lugar, un club con peor
 * diferencia de gol puede ir por encima si tiene menos tarjetas. Es
 * exactamente lo que ocurre entre The Originals y Los Pibes en la 4a
 * edicion, y explica el orden del grafico oficial de la Fecha 4.
 *
 * El sorteo no se automatiza: si dos clubes empatan en los cinco criterios,
 * la funcion los deja en orden alfabetico para que la tabla no cambie sola
 * entre compilaciones, y la organizacion decide con la moneda.
 */
export function calcularPosiciones(
  partidos: readonly PartidoLiga[] = PARTIDOS_LIGA,
  disciplina: Readonly<Record<string, Disciplina>> = DISCIPLINA,
): FilaPosicion[] {
  const tabla = new Map<string, Omit<FilaPosicion, 'posicion' | 'dg'>>();

  for (const eq of EQUIPOS) {
    tabla.set(eq.slug, {
      equipo: eq.slug,
      pj: 0,
      pg: 0,
      pe: 0,
      pp: 0,
      gf: 0,
      gc: 0,
      ta: disciplina[eq.slug]?.amarillas ?? 0,
      tr: disciplina[eq.slug]?.rojas ?? 0,
      pts: 0,
    });
  }

  for (const p of partidos) {
    if (p.estado !== 'jugado' || p.golesLocal == null || p.golesVisitante == null) continue;

    const local = tabla.get(p.local);
    const visitante = tabla.get(p.visitante);
    if (!local || !visitante) continue;

    local.pj += 1;
    visitante.pj += 1;
    local.gf += p.golesLocal;
    local.gc += p.golesVisitante;
    visitante.gf += p.golesVisitante;
    visitante.gc += p.golesLocal;

    if (p.golesLocal > p.golesVisitante) {
      local.pg += 1;
      local.pts += 3;
      visitante.pp += 1;
    } else if (p.golesLocal < p.golesVisitante) {
      visitante.pg += 1;
      visitante.pts += 3;
      local.pp += 1;
    } else {
      local.pe += 1;
      visitante.pe += 1;
      local.pts += 1;
      visitante.pts += 1;
    }
  }

  const filas = [...tabla.values()].map((f) => ({ ...f, dg: f.gf - f.gc }));

  /**
   * Criterio 5: resultados entre si. Suma lo que cada uno le hizo al otro en
   * sus enfrentamientos directos. Devuelve 0 si no se han enfrentado o si
   * quedaron igualados.
   */
  function entreSi(a: string, b: string): number {
    let golesA = 0;
    let golesB = 0;
    for (const p of partidos) {
      if (p.estado !== 'jugado' || p.golesLocal == null || p.golesVisitante == null) continue;
      if (p.local === a && p.visitante === b) {
        golesA += p.golesLocal;
        golesB += p.golesVisitante;
      } else if (p.local === b && p.visitante === a) {
        golesA += p.golesVisitante;
        golesB += p.golesLocal;
      }
    }
    return golesB - golesA;
  }

  filas.sort(
    (a, b) =>
      b.pts - a.pts ||
      puntosJuegoLimpio(a) - puntosJuegoLimpio(b) ||
      b.dg - a.dg ||
      b.gf - a.gf ||
      entreSi(a.equipo, b.equipo) ||
      a.equipo.localeCompare(b.equipo),
  );

  return filas.map((f, i) => ({ ...f, posicion: i + 1 }));
}

export const POSICIONES_LIGA = calcularPosiciones();

/**
 * Criterios de desempate del Articulo 14, para mostrarlos junto a la tabla.
 * Quien mira la tabla necesita saber por que un club esta sobre otro.
 */
export const CRITERIOS_DESEMPATE = [
  'Puntaje',
  'Fair Play',
  'Diferencia de gol',
  'Goles a favor',
  'Resultados entre sí',
  'Sorteo (cara o sello)',
] as const;

/** Columnas de la tabla, con su nombre largo para accesibilidad. */
export const COLUMNAS_TABLA = [
  { key: 'pj', corto: 'PJ', largo: 'Partidos jugados' },
  { key: 'pg', corto: 'PG', largo: 'Partidos ganados' },
  { key: 'pe', corto: 'PE', largo: 'Partidos empatados' },
  { key: 'pp', corto: 'PP', largo: 'Partidos perdidos' },
  { key: 'gf', corto: 'GF', largo: 'Goles a favor' },
  { key: 'gc', corto: 'GC', largo: 'Goles en contra' },
  { key: 'ta', corto: 'TA', largo: 'Tarjetas amarillas' },
  { key: 'tr', corto: 'TR', largo: 'Tarjetas rojas' },
  { key: 'dg', corto: 'DG', largo: 'Diferencia de gol' },
  { key: 'pts', corto: 'PTS', largo: 'Puntos' },
] as const satisfies readonly { key: keyof FilaPosicion; corto: string; largo: string }[];

/* ─────────────────────────── Fase final ─────────────────────────── */

/** Las rondas de la eliminatoria. Vive aquí y no en `liga-supabase` para
 *  que el calendario de la fase final pueda tiparse sin importación
 *  circular; `liga-supabase` lo reexporta para no romper a quien ya lo
 *  importaba de allí. */
export type FaseFinal = 'cuartos' | 'semifinal' | 'tercer-puesto' | 'final';

/** Un partido de la eliminatoria: como los de liga, más su ronda. */
export interface PartidoEliminatoria extends PartidoLiga {
  fase: FaseFinal;
}

export interface RondaFinal {
  fase: FaseFinal;
  titulo: string;
  /** Día de juego, ej. '13/09/2026'. */
  fecha: string;
}

/**
 * Calendario de la fase final, con las fechas que anunció la organización.
 *
 * Se guardan las fechas aunque todavía no se sepan ni los equipos ni las
 * horas: los cruces salen de la tabla cuando termine la fase de grupos, y
 * los horarios los fija la organización más adelante. Publicar el día ya
 * sirve —un capitán puede reservarlo— y evita el hueco que se abriría el 6
 * de septiembre, cuando se juegue la Fecha 7 y no quede ningún partido de
 * grupos por delante.
 *
 * En cuanto se carguen los partidos reales en el panel, mandan ellos: este
 * calendario solo se usa mientras la eliminatoria esté vacía.
 */
export const CALENDARIO_FASE_FINAL: readonly RondaFinal[] = [
  { fase: 'cuartos', titulo: 'Cuartos de final', fecha: '13/09/2026' },
  { fase: 'semifinal', titulo: 'Semifinales', fecha: '20/09/2026' },
  { fase: 'final', titulo: 'Gran Final', fecha: '26/09/2026' },
];

/** Día en que arranca la fase final. Sale de la primera ronda, no a mano. */
export const FECHA_FASE_FINAL = CALENDARIO_FASE_FINAL[0]!.fecha;

/** Orden en que se juegan las rondas, para dibujarlas siempre igual. */
export const ORDEN_FASES: readonly FaseFinal[] = ['cuartos', 'semifinal', 'tercer-puesto', 'final'];

/** Cuántos cruces tiene cada ronda cuando todavía no hay partidos cargados. */
export const CRUCES_POR_FASE: Record<FaseFinal, number> = {
  cuartos: 4,
  semifinal: 2,
  'tercer-puesto': 1,
  final: 1,
};

const TITULO_FASE: Record<FaseFinal, string> = {
  cuartos: 'Cuartos de final',
  semifinal: 'Semifinales',
  'tercer-puesto': 'Tercer puesto',
  final: 'Gran Final',
};

/** En qué va una ronda de la fase final. */
export type EstadoRonda = 'jugada' | 'en-juego' | 'pendiente';

/** Una parada del camino a la final, con su estado y sus partidos. */
export interface ParadaFinal {
  fase: FaseFinal;
  titulo: string;
  /** La fecha del partido cargado si ya existe; si no, la que anunció la organización. */
  fecha: string;
  estado: EstadoRonda;
  partidos: PartidoEliminatoria[];
}

/**
 * El camino a la final, ronda por ronda y con el estado de cada una.
 *
 * El estado se deduce de lo que haya cargado la organización, no del reloj:
 * sin partidos la ronda está `pendiente`, con partidos a medio jugar está
 * `en-juego`, y con todos jugados está `jugada`. Si dependiera de "hoy",
 * quedaría congelado en la fecha en que se compiló el sitio.
 *
 * Devuelve siempre las tres rondas, incluso vacías: es lo que permite dibujar
 * la llave completa —cuartos, semifinales y final— desde el primer día, en vez
 * de mostrar solo los cruces que ya existen y dejar el resto sin explicar.
 */
export function caminoFaseFinal(eliminatoria: readonly PartidoEliminatoria[] = []): ParadaFinal[] {
  const anunciadas = new Map(CALENDARIO_FASE_FINAL.map((r) => [r.fase, r]));
  const cargadas = new Set(eliminatoria.map((p) => p.fase));

  // Entra toda ronda anunciada y, además, toda ronda que la organización haya
  // cargado aunque no estuviera anunciada —un tercer puesto, por ejemplo—.
  // Su fecha sale del propio partido, así que no hay que inventarla, y ningún
  // partido cargado se queda fuera del camino.
  return ORDEN_FASES.filter((f) => anunciadas.has(f) || cargadas.has(f)).map((fase) => {
    const suyos = eliminatoria.filter((p) => p.fase === fase);
    const jugados = suyos.filter((p) => p.estado === 'jugado').length;
    const estado: EstadoRonda =
      suyos.length === 0 ? 'pendiente' : jugados === suyos.length ? 'jugada' : 'en-juego';

    return {
      fase,
      titulo: anunciadas.get(fase)?.titulo ?? TITULO_FASE[fase],
      fecha: suyos[0]?.fecha ?? anunciadas.get(fase)?.fecha ?? '',
      estado,
      partidos: suyos,
    };
  });
}

const DIAS_LARGOS = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
] as const;
const MESES_LARGOS = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
] as const;

/** '13/09/2026' → 'Domingo 13 de septiembre 2026'. */
export function fechaLargaDe(fecha: string): string {
  const [d, m, a] = fecha.split('/').map(Number) as [number, number, number];
  // Mediodía UTC para que el día de la semana no se corra por el huso.
  const dia = new Date(Date.UTC(a, m - 1, d, 12));
  return `${DIAS_LARGOS[dia.getUTCDay()]} ${d} de ${MESES_LARGOS[m - 1]} ${a}`;
}

/**
 * Emparejamientos de cuartos: el 1º con el 8º, el 2º con el 7º, y así.
 * El mejor ubicado hace de local.
 */
export const EMPAREJAMIENTOS_CUARTOS: readonly (readonly [number, number])[] = [
  [1, 8],
  [2, 7],
  [3, 6],
  [4, 5],
] as const;

export interface CruceCuartos {
  id: string;
  /** Rótulo del cruce, ej. '1º vs 8º'. */
  etiqueta: string;
  posicionLocal: number;
  posicionVisitante: number;
  /** slug del club, o null si esa posición aún no tiene dueño. */
  local: string | null;
  visitante: string | null;
}

/** true cuando ya se jugaron los 28 partidos de la fase de grupos. */
export function faseDeGruposCompleta(partidos: readonly PartidoLiga[] = PARTIDOS_LIGA): boolean {
  return partidos.length > 0 && partidos.every((p) => p.estado === 'jugado');
}

/**
 * Deriva la llave de cuartos de la tabla de posiciones.
 *
 * DECISIÓN DE DISEÑO: igual que la tabla, la llave NO se escribe a mano.
 * Sale de `calcularPosiciones()`, que a su vez sale de los marcadores. Así
 * es imposible publicar un cruce que contradiga la tabla —el error clásico
 * de copiar la llave a mano y olvidar actualizarla tras la última fecha—.
 *
 * Mientras falten fechas por jugar esto es una proyección, no el cuadro
 * definitivo: quien la muestre debe decirlo. `faseDeGruposCompleta()` es el
 * interruptor para saber cuál de las dos cosas es.
 *
 * Cuando la organización cargue los cruces reales en el panel, esos mandan:
 * llegan por Supabase como partidos con `fase` distinta de 'grupos' y se
 * pintan en su lugar. Esta función solo cubre el hueco previo.
 */
export function cruzarCuartos(
  posiciones: readonly FilaPosicion[] = POSICIONES_LIGA,
): CruceCuartos[] {
  const porPosicion = new Map(posiciones.map((f) => [f.posicion, f.equipo]));

  return EMPAREJAMIENTOS_CUARTOS.map(([alto, bajo], i) => ({
    id: `cf${i + 1}`,
    etiqueta: `${alto}º vs ${bajo}º`,
    posicionLocal: alto,
    posicionVisitante: bajo,
    local: porPosicion.get(alto) ?? null,
    visitante: porPosicion.get(bajo) ?? null,
  }));
}

/** Llave proyectada con la tabla de respaldo. */
export const CUARTOS_LIGA = cruzarCuartos();
