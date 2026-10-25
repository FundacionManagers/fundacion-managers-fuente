/**
 * La edición en curso: la 5ª (2026-2), dos grupos de cuatro.
 *
 * Fase de grupos de tres fechas, todos contra todos dentro de cada grupo. Al
 * cerrarla, el 1º y el 2º de cada grupo juegan la Copa Oro y el 3º y el 4º
 * la Copa Plata, cada una con semifinales cruzadas (1º A vs 2º B, 1º B vs
 * 2º A), tercer puesto y final. El título del torneo es la Copa Oro.
 *
 * La 4ª edición —liga de 8 a 7 fechas y llave desde cuartos— ya cerró y vive
 * en `edicion-4.ts`, igual que la 3ª en `edicion-3.ts`.
 *
 * DECISIÓN DE DISEÑO: la tabla NO se escribe a mano. `calcularPosiciones()`
 * la deriva de los partidos, así PJ, PG, PE, PP, GF, GC, DG y PTS son
 * siempre coherentes con el calendario: es imposible que se contradigan.
 * Solo se cargan a mano las tarjetas, que no se deducen de un marcador. Y
 * la llave sale de la tabla, grupo por grupo.
 *
 * Los partidos de aquí son el RESPALDO: lo que se publica si Supabase no
 * responde durante el build. La fuente real es la base, que carga el panel.
 */

import { EQUIPOS, GRUPOS, LETRAS_GRUPO, grupoDe, type Grupo } from './torneo-data';

export type { Grupo };

export const EDICION_ACTUAL = 5;
export const PERIODO_ACTUAL = '2026-2';
export const TOTAL_JORNADAS = 3;
export const CANCHA = 'Thomajo Sport';
export const FORMATO_LIGA = 'Dos grupos de cuatro · todos contra todos dentro del grupo';

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

/**
 * Tarjetas acumuladas por club. No se deducen del marcador: desde la 5ª se
 * cuentan sobre las tarjetas de cada partido (`disciplinaDeTarjetas`).
 */
export interface Disciplina {
  amarillas: number;
  rojas: number;
}

/**
 * Una tarjeta mostrada en un partido. El dorsal puede faltar: la
 * organización no siempre lo informa, y entonces la tarjeta cuenta para el
 * Fair Play del club pero no puede suspender a nadie.
 */
export interface Tarjeta {
  /** id del partido en que se mostró. */
  partido: string;
  equipo: string;
  numero: number | null;
  tipo: 'amarilla' | 'roja';
}

/** Algo que pasa en una fecha y no es un partido: un torneo de penales. */
export interface EventoFecha {
  id: string;
  jornada: number;
  /** 'HH:MM', o null si no tiene hora fija. */
  hora: string | null;
  titulo: string;
  detalle: string | null;
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
  { jornada: 1, etiqueta: 'Domingo 18 de octubre 2026' },
  { jornada: 2, etiqueta: 'Domingo 25 de octubre 2026' },
  { jornada: 3, etiqueta: 'Domingo 8 de noviembre 2026' },
] as const;

/** Un partido de grupos en una línea: el respaldo se lee como el fixture. */
function p(
  id: string,
  jornada: number,
  fecha: string,
  hora: string,
  local: string,
  visitante: string,
  goles: readonly [number, number] | null = null,
): PartidoLiga {
  return {
    id,
    jornada,
    fecha,
    hora,
    local,
    visitante,
    golesLocal: goles?.[0] ?? null,
    golesVisitante: goles?.[1] ?? null,
    estado: goles ? 'jugado' : 'programado',
  };
}

/**
 * Fixture de la 5ª edición, con la Fecha 1 jugada. Copia del documento de la
 * organización del 21/10/2026; la fuente real es la base.
 *
 * La Fecha 1 tuvo además un torneo de penales a las 10:00, que no es un
 * partido de grupos y no va en esta lista.
 */
export const PARTIDOS_LIGA: readonly PartidoLiga[] = [
  // Fecha 1 — domingo 18 de octubre
  p('j1p1', 1, '18/10/2026', '08:00', 'pomada-alfa', 'isotopos-portal-1', [10, 4]),
  p('j1p2', 1, '18/10/2026', '09:00', 'la-banda-cruzada', 'los-pibes', [6, 1]),
  p('j1p3', 1, '18/10/2026', '11:00', 'the-originals', 'tp-fc', [1, 3]),
  p('j1p4', 1, '18/10/2026', '12:00', 'yonotomo-fc', 'cucuta-10-fc', [5, 6]),
  // Fecha 2 — domingo 25 de octubre
  p('j2p1', 2, '25/10/2026', '08:00', 'la-banda-cruzada', 'isotopos-portal-1'),
  p('j2p2', 2, '25/10/2026', '09:00', 'the-originals', 'cucuta-10-fc'),
  p('j2p3', 2, '25/10/2026', '10:00', 'pomada-alfa', 'los-pibes'),
  p('j2p4', 2, '25/10/2026', '11:00', 'tp-fc', 'yonotomo-fc'),
  // Fecha 3 — domingo 8 de noviembre
  p('j3p1', 3, '08/11/2026', '08:00', 'isotopos-portal-1', 'los-pibes'),
  p('j3p2', 3, '08/11/2026', '09:00', 'pomada-alfa', 'la-banda-cruzada'),
  p('j3p3', 3, '08/11/2026', '10:00', 'the-originals', 'yonotomo-fc'),
  p('j3p4', 3, '08/11/2026', '11:00', 'tp-fc', 'cucuta-10-fc'),
];

/** Varias tarjetas iguales de un club en un partido, sin dorsal. */
function sinDorsal(
  partido: string,
  equipo: string,
  tipo: Tarjeta['tipo'],
  cuantas: number,
): Tarjeta[] {
  return Array.from({ length: cuantas }, () => ({ partido, equipo, numero: null, tipo }));
}

/**
 * Las tarjetas de la Fecha 1, tal como las da el documento de la
 * organización: con dorsal donde lo dice, sin él donde no.
 */
export const TARJETAS_LIGA: readonly Tarjeta[] = [
  ...sinDorsal('j1p1', 'pomada-alfa', 'amarilla', 1),
  { partido: 'j1p2', equipo: 'la-banda-cruzada', numero: 16, tipo: 'amarilla' },
  { partido: 'j1p2', equipo: 'la-banda-cruzada', numero: 23, tipo: 'amarilla' },
  { partido: 'j1p2', equipo: 'la-banda-cruzada', numero: 7, tipo: 'roja' },
  { partido: 'j1p2', equipo: 'los-pibes', numero: 7, tipo: 'amarilla' },
  { partido: 'j1p2', equipo: 'los-pibes', numero: 21, tipo: 'roja' },
  ...sinDorsal('j1p3', 'the-originals', 'amarilla', 2),
  ...sinDorsal('j1p3', 'tp-fc', 'amarilla', 1),
  ...sinDorsal('j1p4', 'yonotomo-fc', 'amarilla', 1),
  ...sinDorsal('j1p4', 'cucuta-10-fc', 'amarilla', 4),
];

/**
 * El acumulado por club, contado sobre las tarjetas de cada partido.
 *
 * Antes se escribía aparte, a mano, y podía no cuadrar con las tarjetas que
 * la organización publica partido por partido. Sale de la misma lista.
 */
export function disciplinaDeTarjetas(tarjetas: readonly Tarjeta[]): Record<string, Disciplina> {
  const acc: Record<string, Disciplina> = {};
  for (const t of tarjetas) {
    const d = (acc[t.equipo] ??= { amarillas: 0, rojas: 0 });
    if (t.tipo === 'roja') d.rojas += 1;
    else d.amarillas += 1;
  }
  return acc;
}

/** Tarjetas acumuladas tras la Fecha 1. */
export const DISCIPLINA: Readonly<Record<string, Disciplina>> = disciplinaDeTarjetas(TARJETAS_LIGA);

/** Lo que pasó en las fechas aparte de los partidos. */
export const EVENTOS_LIGA: readonly EventoFecha[] = [
  {
    id: 'e1',
    jornada: 1,
    hora: '10:00',
    titulo: 'Torneo de penales',
    detalle: 'Campeón: Los Pibes del Barrio',
  },
];

/** Una suspensión por roja: quién, por qué partido y en cuál la cumple. */
export interface Suspension {
  equipo: string;
  numero: number;
  /** id del partido en que vio la roja. */
  origen: string;
  /**
   * id del partido en que la cumple: el siguiente de su club. Null si ese
   * partido todavía no existe —una roja en la última fecha de grupos se
   * cumple en una semifinal que aún no se ha creado—.
   */
  cumple: string | null;
}

/**
 * Quién está suspendido, deducido de las rojas.
 *
 * La regla que aplica es la del documento de la organización: una roja
 * suspende al jugador para el siguiente partido de su club. Nada más. La
 * acumulación de amarillas no está en ningún documento del torneo, así que
 * no se inventa; si la organización la confirma, se suma aquí.
 *
 * Una roja sin dorsal no suspende a nadie que se pueda nombrar, y no sale.
 */
export function suspensiones(
  tarjetas: readonly Tarjeta[],
  partidos: readonly PartidoLiga[],
): Suspension[] {
  const orden = [...partidos].sort((a, b) => isoDe(a).localeCompare(isoDe(b)));
  const salida: Suspension[] = [];

  for (const t of tarjetas) {
    if (t.tipo !== 'roja' || t.numero == null) continue;
    const origen = orden.find((p) => p.id === t.partido);
    if (!origen) continue;
    const siguiente = orden.find(
      (p) =>
        isoDe(p) > isoDe(origen) &&
        p.id !== origen.id &&
        (p.local === t.equipo || p.visitante === t.equipo),
    );
    salida.push({
      equipo: t.equipo,
      numero: t.numero,
      origen: origen.id,
      cumple: siguiente?.id ?? null,
    });
  }
  return salida;
}

/**
 * Los suspendidos de un conjunto de partidos —una fecha, una ronda—.
 *
 * Con `incluirSinPartido`, entran también los que aún no tienen partido
 * donde cumplir. Es lo que toca cuando lo próximo es una ronda de la fase
 * final que todavía no se ha creado: el siguiente compromiso de su club es
 * justo ese. En una fecha de grupos no: ahí ya existen todos los partidos, y
 * una roja sin partido por delante se cumplirá más adelante.
 */
export function suspendidosEn(
  partidos: readonly Pick<PartidoLiga, 'id'>[],
  todas: readonly Suspension[],
  incluirSinPartido = false,
): Suspension[] {
  const ids = new Set(partidos.map((p) => p.id));
  return todas.filter((s) => (s.cumple ? ids.has(s.cumple) : incluirSinPartido));
}

/** Los suspendidos para lo próximo que se juega. */
export function suspendidosDelCompromiso(
  compromiso: Compromiso,
  tarjetas: readonly Tarjeta[],
  todosLosPartidos: readonly PartidoLiga[],
): Suspension[] {
  return suspendidosEn(
    compromiso.partidos,
    suspensiones(tarjetas, todosLosPartidos),
    compromiso.tipo === 'ronda',
  );
}

/**
 * Ranking de goleadores de respaldo. Vacío: el documento de la Fecha 1 no
 * trae goleadores, y un ranking inventado es peor que ninguno. Se llena desde
 * el panel, y de ahí lo lee el build.
 */
export const GOLEADORES_LIGA: readonly Goleador[] = [];

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

/** Autogoles de la edición en curso. Ninguno registrado tras la Fecha 1. */
export const AUTOGOLES: readonly Autogol[] = [];

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
  /** 'Fecha 2' o 'Semifinales'. */
  titulo: string;
  /** 'Domingo 25 de octubre 2026'. */
  etiqueta: string;
  /** Momento de inicio en ISO, para la cuenta atrás del navegador. */
  iso: string;
  /**
   * Los partidos, si ya se conocen. Vacío en una ronda sin sorteo. En la fase
   * final llevan su copa: una misma ronda junta las dos semifinales de la
   * Copa Oro y las dos de la Plata.
   */
  partidos: readonly (PartidoLiga & { copa?: Copa | null })[];
  /**
   * Los cruces de la primera ronda derivados de la tabla, cuando todavía no
   * tiene partidos cargados pero la fase de grupos ya cerró.
   *
   * Existe porque el sitio se estaba contradiciendo: la Llave decía "así
   * quedaron los cruces" con los ocho clubes puestos, mientras esta tarjeta
   * —la que ve casi todo el mundo, en la portada— seguía diciendo "equipos
   * por definir". Los puestos ya estaban decididos; lo único que faltaba era
   * la hora.
   */
  cruces?: readonly CruceDerivado[];
}

/**
 * Deja la Gran Final delante del tercer puesto cuando los dos caen el mismo
 * dia y ninguno se ha jugado.
 *
 * Por reloj el tercer puesto va primero —arranca antes— y `ORDEN_FASES` lo
 * respeta. Como titular de la portada, no: a cuatro dias de la final el
 * sitio anunciaba «Tercer puesto» y no decia en ninguna parte a que hora se
 * juega el titulo. Solo afecta a que se anuncia como lo proximo; el cuadro
 * de la llave conserva su orden.
 */
function ordenarConLaFinalPrimeroSiComparteDia(
  calendario: readonly RondaFinal[],
  eliminatoria: readonly PartidoEliminatoria[],
): readonly RondaFinal[] {
  const diaDe = (fase: FaseFinal) =>
    eliminatoria.find((p) => p.fase === fase)?.fecha ??
    calendario.find((r) => r.fase === fase)?.fecha;

  const tercero = diaDe('tercer-puesto');
  const final = diaDe('final');
  if (!tercero || !final || tercero !== final) return calendario;

  const yaSeJugo = (fase: FaseFinal) =>
    eliminatoria.some((p) => p.fase === fase && p.estado === 'jugado');
  if (yaSeJugo('tercer-puesto') || yaSeJugo('final')) return calendario;

  const resto = calendario.filter((r) => r.fase !== 'final' && r.fase !== 'tercer-puesto');
  const laFinal = calendario.filter((r) => r.fase === 'final');
  const elTercero = calendario.filter((r) => r.fase === 'tercer-puesto');
  return [...resto, ...laFinal, ...elTercero];
}

export function proximoCompromiso(
  partidos: readonly PartidoLiga[],
  eliminatoria: readonly PartidoEliminatoria[] = [],
  disciplina: Readonly<Record<string, Disciplina>> = DISCIPLINA,
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
  for (const ronda of ordenarConLaFinalPrimeroSiComparteDia(CALENDARIO_FASE_FINAL, eliminatoria)) {
    const suyos = eliminatoria.filter((p) => p.fase === ronda.fase);
    const pendiente = suyos.length === 0 || suyos.some((p) => p.estado === 'programado');
    if (!pendiente) continue;

    // Si ya hay cruces cargados, mandan su fecha y su hora sobre lo anunciado.
    const primero = suyos.find((p) => p.estado === 'programado') ?? suyos[0];
    const fecha = primero?.fecha ?? ronda.fecha;

    // La primera ronda sin partidos cargados, pero con la fase de grupos
    // cerrada: los rivales ya están decididos por la tabla aunque la
    // organización no haya fijado las horas. Se muestran, que es lo que la
    // Llave ya hacía.
    const cruces =
      ronda.fase === CALENDARIO_FASE_FINAL[0]!.fase &&
      suyos.length === 0 &&
      faseDeGruposCompleta(partidos)
        ? cruzarFaseFinal(posicionesPorGrupo(partidos, disciplina))
        : undefined;

    // Las semifinales se reparten en miércoles y jueves. Mientras no haya
    // cruces cargados, o si los cargados caen en días distintos, se dice el
    // rótulo de la ronda —«Miércoles 11 y jueves 12»— y no solo el primer día.
    const variosDias = suyos.length === 0 || jornadaEnVariosDias(suyos);
    const etiqueta = variosDias && ronda.etiqueta ? ronda.etiqueta : fechaLargaDe(fecha);

    return {
      tipo: 'ronda',
      titulo: ronda.titulo,
      etiqueta,
      iso: primero ? isoDe(primero) : `${aISO(fecha)}T00:00:00-05:00`,
      partidos: suyos,
      cruces,
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
 * diferencia de gol puede ir por encima si tiene menos tarjetas. Es lo que
 * paso entre The Originals y Los Pibes en la 4a edicion, y lo que deja a
 * Pomada Alfa sobre La Banda Cruzada tras la Fecha 1 de la 5a: los dos con 3
 * puntos, y la roja de La Banda pesa mas que su diferencia de gol.
 *
 * `clubes` dice que filas tiene la tabla. Por defecto son los de la edicion
 * en curso; para la tabla de un grupo se pasan los cuatro del grupo, y los
 * partidos contra clubes de fuera no cuentan.
 *
 * El sorteo no se automatiza: si dos clubes empatan en los cinco criterios,
 * la funcion los deja en orden alfabetico para que la tabla no cambie sola
 * entre compilaciones, y la organizacion decide con la moneda.
 */
export function calcularPosiciones(
  partidos: readonly PartidoLiga[] = PARTIDOS_LIGA,
  disciplina: Readonly<Record<string, Disciplina>> = DISCIPLINA,
  clubes: readonly string[] = EQUIPOS.map((e) => e.slug),
): FilaPosicion[] {
  const tabla = new Map<string, Omit<FilaPosicion, 'posicion' | 'dg'>>();

  for (const slug of clubes) {
    tabla.set(slug, {
      equipo: slug,
      pj: 0,
      pg: 0,
      pe: 0,
      pp: 0,
      gf: 0,
      gc: 0,
      ta: disciplina[slug]?.amarillas ?? 0,
      tr: disciplina[slug]?.rojas ?? 0,
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

/** La tabla de un grupo, con sus puestos del 1 al 4. */
export interface TablaGrupo {
  grupo: Grupo;
  filas: FilaPosicion[];
}

/**
 * Una tabla por grupo. Es la que manda en la 5ª edición: los puestos que
 * cuentan para las copas son los del grupo, no los de una tabla general.
 */
export function posicionesPorGrupo(
  partidos: readonly PartidoLiga[] = PARTIDOS_LIGA,
  disciplina: Readonly<Record<string, Disciplina>> = DISCIPLINA,
): TablaGrupo[] {
  return LETRAS_GRUPO.map((grupo) => ({
    grupo,
    filas: calcularPosiciones(partidos, disciplina, GRUPOS[grupo]),
  }));
}

/**
 * El puesto de cada club dentro de su grupo, escrito como se lee: '1A',
 * '3B'. Es lo que va junto al escudo en la llave.
 */
export function siembraPorGrupo(tablas: readonly TablaGrupo[]): Map<string, string> {
  return new Map(
    tablas.flatMap((t) => t.filas.map((f) => [f.equipo, `${f.posicion}${t.grupo}`] as const)),
  );
}

/** Grupo de un partido de la fase de grupos: el de cualquiera de sus clubes. */
export function grupoDePartido(partido: Pick<PartidoLiga, 'local'>): Grupo | null {
  return grupoDe(partido.local);
}

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

/**
 * Las dos copas de la 5ª edición. La Oro es el título del torneo: la que
 * suma al palmarés y corona al campeón.
 */
export type Copa = 'oro' | 'plata';

export interface DatosCopa {
  copa: Copa;
  titulo: string;
  /** Los dos puestos de grupo que juegan esta copa: [mejor, peor]. */
  puestos: readonly [number, number];
}

export const COPAS: readonly DatosCopa[] = [
  { copa: 'oro', titulo: 'Copa Oro', puestos: [1, 2] },
  { copa: 'plata', titulo: 'Copa Plata', puestos: [3, 4] },
];

export const TITULO_COPA: Record<Copa, string> = { oro: 'Copa Oro', plata: 'Copa Plata' };

/**
 * La copa de un cruce. Null es la llave única de las ediciones anteriores,
 * que fue la del título: cuenta como la Oro. Así las funciones de la fase
 * final sirven igual para la 4ª, con una llave, que para la 5ª, con dos.
 */
export function copaDe(partido: { copa?: Copa | null }): Copa {
  return partido.copa ?? 'oro';
}

/** Un partido de la eliminatoria: como los de liga, más su ronda y su copa. */
export interface PartidoEliminatoria extends PartidoLiga {
  fase: FaseFinal;
  /** 'oro' o 'plata'. Null en la llave única de ediciones anteriores. */
  copa: Copa | null;
  /**
   * Penales convertidos en la tanda, si el partido acabó empatado.
   *
   * En la liga un empate reparte un punto y ahí se acaba; en eliminatoria
   * alguien tiene que pasar. Son null en todo partido que se resolvió en los
   * 90, que son la mayoría.
   */
  penalesLocal: number | null;
  penalesVisitante: number | null;
}

/**
 * Quién gana un cruce: por goles, y si hubo empate, por la tanda de penales.
 *
 * Devuelve null cuando todavía no se puede saber —partido sin jugar, o
 * empatado y sin tanda cargada—. Vive aquí, y no en cada componente, porque
 * la Llave y el Calendario deben coincidir siempre: si uno resuelve el
 * empate y el otro no, el sitio se contradice a sí mismo.
 */
export function ladoGanador(
  golesLocal: number | null,
  golesVisitante: number | null,
  penalesLocal: number | null = null,
  penalesVisitante: number | null = null,
): 'local' | 'visitante' | null {
  if (golesLocal == null || golesVisitante == null) return null;
  if (golesLocal !== golesVisitante) return golesLocal > golesVisitante ? 'local' : 'visitante';
  if (penalesLocal == null || penalesVisitante == null) return null;
  if (penalesLocal === penalesVisitante) return null;
  return penalesLocal > penalesVisitante ? 'local' : 'visitante';
}

export interface RondaFinal {
  fase: FaseFinal;
  titulo: string;
  /** Día de juego, ej. '13/09/2026'. Si la ronda va en dos días, el primero. */
  fecha: string;
  /** Rótulo cuando la ronda se reparte en varios días: 'Miércoles 11 y jueves 12…'. */
  etiqueta?: string;
}

/**
 * Calendario de la fase final, con las fechas que anunció la organización.
 *
 * Se guardan las fechas aunque todavía no se sepan ni los equipos ni las
 * horas: los cruces salen de las tablas cuando termine la fase de grupos, y
 * los horarios los fija la organización más adelante. Publicar el día ya
 * sirve —un capitán puede reservarlo— y evita que la web se quede sin
 * «próximo» el 8 de noviembre, al jugarse la Fecha 3.
 *
 * Es el mismo para las dos copas: sus semifinales se juegan las mismas dos
 * noches y sus finales el mismo domingo. Qué semifinal va el miércoles y cuál
 * el jueves no está anunciado todavía.
 *
 * En cuanto se carguen los partidos reales en el panel, mandan ellos: este
 * calendario solo se usa mientras la eliminatoria esté vacía.
 */
export const CALENDARIO_FASE_FINAL: readonly RondaFinal[] = [
  {
    fase: 'semifinal',
    titulo: 'Semifinales',
    fecha: '11/11/2026',
    etiqueta: 'Miércoles 11 y jueves 12 de noviembre 2026 · nocturno',
  },
  { fase: 'tercer-puesto', titulo: 'Tercer puesto', fecha: '22/11/2026' },
  { fase: 'final', titulo: 'Gran Final', fecha: '22/11/2026' },
];

/** Día en que arranca la fase final. Sale de la primera ronda, no a mano. */
export const FECHA_FASE_FINAL = CALENDARIO_FASE_FINAL[0]!.fecha;

/** Las cifras gruesas de la edición, para la cabecera de Estadísticas. */
export interface CifrasEdicion {
  partidos: number;
  goles: number;
  /** Goles por partido, con dos decimales. Null si todavía no se ha jugado nada. */
  promedio: number | null;
  /** El partido con más goles de la edición. Null si no hay ninguno jugado. */
  masGoleado: PartidoLiga | null;
}

/**
 * Cuenta lo que ya se jugó: partidos, goles y el partido más goleado.
 *
 * La página de Estadísticas se llamaba así y solo tenía goleadores. Estas
 * cifras salen del mismo calendario que la tabla, así que no pueden
 * contradecirla; escribirlas a mano sí habría podido.
 */
export function cifrasDeEdicion(partidos: readonly PartidoLiga[] = PARTIDOS_LIGA): CifrasEdicion {
  const jugados = partidos.filter(
    (p) => p.estado === 'jugado' && p.golesLocal != null && p.golesVisitante != null,
  );
  const golesDe = (p: PartidoLiga) => (p.golesLocal ?? 0) + (p.golesVisitante ?? 0);
  const goles = jugados.reduce((s, p) => s + golesDe(p), 0);

  // El primero de la jornada más temprana gana los empates: así el resultado
  // no depende del orden en que Supabase devuelva las filas.
  const masGoleado = jugados.reduce<PartidoLiga | null>((mejor, p) => {
    if (!mejor) return p;
    if (golesDe(p) > golesDe(mejor)) return p;
    if (golesDe(p) === golesDe(mejor) && p.jornada < mejor.jornada) return p;
    return mejor;
  }, null);

  return {
    partidos: jugados.length,
    goles,
    promedio: jugados.length ? Math.round((goles / jugados.length) * 100) / 100 : null,
    masGoleado,
  };
}

/** El club menos goleado. Empate resuelto por quien vaya mejor en la tabla. */
export function mejorDefensa(posiciones: readonly FilaPosicion[]): FilaPosicion | null {
  return posiciones.reduce<FilaPosicion | null>(
    (mejor, f) => (!mejor || f.gc < mejor.gc ? f : mejor),
    null,
  );
}

/**
 * Los ocho clubes ordenados por juego limpio, del más limpio al menos.
 *
 * La página publicaba solo al ganador —"4 amarillas · 0 rojas"— y sin nadie
 * con quien compararlo eso no dice nada. Peor: se leía como una
 * contradicción, porque quien gana puede tener más amarillas que otro y
 * ganar igual (una roja pesa como tres amarillas, Artículo 14). Con la tabla
 * entera delante, la regla se explica sola.
 */
export function tablaJuegoLimpio(posiciones: readonly FilaPosicion[]): FilaPosicion[] {
  return [...posiciones].sort(
    (a, b) => puntosJuegoLimpio(a) - puntosJuegoLimpio(b) || a.posicion - b.posicion,
  );
}

/** Lo único que de verdad cambia el plan de alguien. El resto es ruido. */
export type DiaRelativo = 'Hoy' | 'Mañana' | 'Resultados en camino' | null;

/**
 * A cuántos días de distancia queda un compromiso, dicho en palabras.
 *
 * Se comparan días de calendario, no milisegundos: a las 23:00 de la víspera
 * faltan 8 horas, pero para quien lo lee es "mañana".
 *
 * Un "en 5 días" no mueve a nadie y solo compite por atención con lo que sí
 * importa, así que devuelve null. La excepción es el día después: un partido
 * sigue marcado como "programado" hasta que la organización sube el marcador,
 * y llamar "próximo" a un partido de ayer es mentira. Lo honesto es admitir
 * que faltan los resultados.
 *
 * Vive aquí, y no dentro del componente, porque la usan la tarjeta del
 * Calendario y la ficha de cada club, y una sola de las dos equivocándose
 * sería peor que ninguna.
 */
export function diaRelativoDe(iso: string, ahora: Date): DiaRelativo {
  const inicio = new Date(iso);
  if (Number.isNaN(inicio.getTime())) return null;

  const soloDia = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const dias = Math.round((soloDia(inicio) - soloDia(ahora)) / 86400000);

  if (dias < 0) return 'Resultados en camino';
  if (dias === 0) return 'Hoy';
  if (dias === 1) return 'Mañana';
  return null;
}

/** Orden en que se juegan las rondas, para dibujarlas siempre igual. */
export const ORDEN_FASES: readonly FaseFinal[] = ['cuartos', 'semifinal', 'tercer-puesto', 'final'];

/** Cuántos cruces tiene cada ronda cuando todavía no hay partidos cargados. */
export const CRUCES_POR_FASE: Record<FaseFinal, number> = {
  cuartos: 4,
  semifinal: 2,
  'tercer-puesto': 1,
  final: 1,
};

/** Nombre largo de cada ronda. Lo usa la Llave y tambien el panel. */
export const TITULO_FASE: Record<FaseFinal, string> = {
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
  /** El rótulo anunciado si la ronda va en dos días; la fecha sola no lo cuenta. */
  etiqueta?: string;
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
 * Devuelve siempre todas las rondas anunciadas, incluso vacías: es lo que
 * permite dibujar la llave completa desde el primer día, en vez de mostrar
 * solo los cruces que ya existen y dejar el resto sin explicar.
 *
 * Es el camino de UNA copa. En la 5ª hay dos y cada una se dibuja aparte;
 * los cruces sin copa —la llave única de la 4ª— cuentan como la Oro.
 */
export function caminoFaseFinal(
  todos: readonly PartidoEliminatoria[] = [],
  copa: Copa = 'oro',
): ParadaFinal[] {
  const eliminatoria = todos.filter((p) => copaDe(p) === copa);
  const anunciadas = new Map(CALENDARIO_FASE_FINAL.map((r) => [r.fase, r]));
  const cargadas = new Set(eliminatoria.map((p) => p.fase));

  // Entra toda ronda anunciada y, además, toda ronda que la organización haya
  // cargado aunque no estuviera anunciada —un tercer puesto, por ejemplo—.
  // Su fecha sale del propio partido, así que no hay que inventarla, y ningún
  // partido cargado se queda fuera del camino.
  return ORDEN_FASES.filter((f) => anunciadas.has(f) || cargadas.has(f)).map((fase) => {
    const suyos = eliminatoria.filter((p) => p.fase === fase);
    const jugados = suyos.filter((p) => p.estado === 'jugado').length;
    // Una ronda con los cruces cargados pero sin ningun partido jugado sigue
    // PENDIENTE. Decia «En juego» desde el momento de crear el cruce: el
    // sitio afirmaba que habia futbol en curso cuatro dias antes del partido.
    const estado: EstadoRonda =
      suyos.length === 0 || jugados === 0
        ? 'pendiente'
        : jugados === suyos.length
          ? 'jugada'
          : 'en-juego';

    return {
      fase,
      titulo: anunciadas.get(fase)?.titulo ?? TITULO_FASE[fase],
      fecha: suyos[0]?.fecha ?? anunciadas.get(fase)?.fecha ?? '',
      etiqueta:
        suyos.length === 0 || jornadaEnVariosDias(suyos)
          ? anunciadas.get(fase)?.etiqueta
          : undefined,
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
 * Un cruce de la primera ronda de la fase final, sacado de las tablas antes
 * de que la organización lo cargue con su hora.
 */
export interface CruceDerivado {
  id: string;
  copa: Copa;
  /** Rótulo del cruce, ej. '1º A vs 2º B'. */
  etiqueta: string;
  /** Puesto de grupo de cada lado, ej. '1A'. */
  siembraLocal: string;
  siembraVisitante: string;
  /** slug del club, o null si ese puesto aún no tiene dueño. */
  local: string | null;
  visitante: string | null;
}

/** true cuando ya se jugaron todos los partidos de la fase de grupos. */
export function faseDeGruposCompleta(partidos: readonly PartidoLiga[] = PARTIDOS_LIGA): boolean {
  return partidos.length > 0 && partidos.every((p) => p.estado === 'jugado');
}

/**
 * Deriva las semifinales de las dos copas de las tablas de grupo.
 *
 * Cruzadas, como en el documento de la organización: en cada copa, el mejor
 * puesto del Grupo A contra el peor del B, y el mejor del B contra el peor
 * del A. En la Oro eso es 1º A vs 2º B y 1º B vs 2º A; en la Plata, 3º A vs
 * 4º B y 3º B vs 4º A. El mejor ubicado hace de local.
 *
 * DECISIÓN DE DISEÑO: igual que la tabla, la llave NO se escribe a mano.
 * Sale de `posicionesPorGrupo()`, que a su vez sale de los marcadores. Así
 * es imposible publicar un cruce que contradiga la tabla —el error clásico
 * de copiar la llave a mano y olvidar actualizarla tras la última fecha—.
 *
 * Mientras falten fechas por jugar esto es una proyección, no el cuadro
 * definitivo: quien la muestre debe decirlo. `faseDeGruposCompleta()` es el
 * interruptor para saber cuál de las dos cosas es.
 *
 * Cuando la organización cargue los cruces reales en el panel, esos mandan.
 * Esta función solo cubre el hueco previo.
 */
export function cruzarFaseFinal(
  tablas: readonly TablaGrupo[] = posicionesPorGrupo(),
): CruceDerivado[] {
  const club = (grupo: Grupo, puesto: number) =>
    tablas.find((t) => t.grupo === grupo)?.filas.find((f) => f.posicion === puesto)?.equipo ?? null;

  return COPAS.flatMap(({ copa, puestos: [alto, bajo] }) =>
    (
      [
        ['A', 'B'],
        ['B', 'A'],
      ] as const
    ).map(([g1, g2], i) => ({
      id: `${copa}-sf${i + 1}`,
      copa,
      etiqueta: `${alto}º ${g1} vs ${bajo}º ${g2}`,
      siembraLocal: `${alto}${g1}`,
      siembraVisitante: `${bajo}${g2}`,
      local: club(g1, alto),
      visitante: club(g2, bajo),
    })),
  );
}

/* ─────────────────────── Premios de la edición ─────────────────────── */

/**
 * Acumulados de un club a lo largo de TODA la edición.
 *
 * Ojo con la diferencia respecto a `FilaPosicion`: esa es la tabla de
 * posiciones y solo cuenta la fase de grupos, porque es la fase que reparte
 * puntos. Esto cuenta los nueve o diez partidos que jugó el club, cuartos y
 * final incluidos, que es como se entregan los premios de la clausura.
 *
 * Mezclarlas fue el error original: la web premiaba «la valla menos vencida»
 * con la cifra de la fase de grupos mientras la organización la calculaba
 * sobre el torneo entero, y salían clubes distintos.
 */
export interface TotalesEquipo {
  equipo: string;
  /** Partidos jugados en la edición, de todas las fases. */
  pj: number;
  gf: number;
  gc: number;
}

/**
 * Suma los goles de cada club sobre los partidos que se le pasen.
 *
 * Se le pasan grupos Y eliminatoria juntos: quien llama decide el alcance,
 * y así la misma función sirve para comprobar una fase suelta.
 */
export function totalesDeEdicion(partidos: readonly PartidoLiga[]): TotalesEquipo[] {
  const acc = new Map<string, TotalesEquipo>();
  const de = (equipo: string) => {
    let fila = acc.get(equipo);
    if (!fila) {
      fila = { equipo, pj: 0, gf: 0, gc: 0 };
      acc.set(equipo, fila);
    }
    return fila;
  };

  for (const p of partidos) {
    if (p.estado !== 'jugado' || p.golesLocal == null || p.golesVisitante == null) continue;
    const local = de(p.local);
    const visitante = de(p.visitante);
    local.pj += 1;
    visitante.pj += 1;
    local.gf += p.golesLocal;
    local.gc += p.golesVisitante;
    visitante.gf += p.golesVisitante;
    visitante.gc += p.golesLocal;
  }

  return [...acc.values()].sort((a, b) => a.equipo.localeCompare(b.equipo));
}

/** Un premio que se gana con una cifra: quién y cuánto. */
export interface PremioCifra {
  equipo: string;
  valor: number;
  /**
   * Los demás clubes que lo comparten: misma cifra y mismo desempate. Vacío
   * casi siempre. Tras la Fecha 1 de la 5ª, La Banda Cruzada y Tranquilo
   * Papi recibieron un gol cada uno en un partido, y publicar solo al primero
   * por orden alfabético era dar el premio a uno que no lo había ganado solo.
   */
  empatados: string[];
}

/** El club que más goles marcó en la edición. Null si todavía no se jugó nada. */
export function equipoMasGoleador(totales: readonly TotalesEquipo[]): PremioCifra | null {
  const orden = [...totales].sort((a, b) => b.gf - a.gf || a.equipo.localeCompare(b.equipo));
  const mejor = orden[0];
  if (!mejor) return null;
  const empatados = orden.slice(1).filter((t) => t.gf === mejor.gf);
  return { equipo: mejor.equipo, valor: mejor.gf, empatados: empatados.map((t) => t.equipo) };
}

/**
 * La valla menos vencida de la edición: el club que menos goles recibió.
 *
 * En empate manda el que jugó más partidos: recibir los mismos goles en más
 * partidos es mejor defensa, y además evita premiar al que se fue antes.
 */
export function vallaMenosVencida(totales: readonly TotalesEquipo[]): PremioCifra | null {
  const orden = [...totales].sort(
    (a, b) => a.gc - b.gc || b.pj - a.pj || a.equipo.localeCompare(b.equipo),
  );
  const mejor = orden[0];
  if (!mejor) return null;
  const empatados = orden.slice(1).filter((t) => t.gc === mejor.gc && t.pj === mejor.pj);
  return { equipo: mejor.equipo, valor: mejor.gc, empatados: empatados.map((t) => t.equipo) };
}

/** El podio de la edición. Cada puesto es null mientras no se pueda demostrar. */
export interface Podio {
  campeon: string | null;
  subcampeon: string | null;
  tercero: string | null;
}

/**
 * El podio, deducido de la Gran Final y del tercer puesto.
 *
 * No se escribe a mano en ninguna parte: sale de los mismos marcadores que
 * cargó la organización, igual que la tabla sale de los partidos. Mientras
 * la final no esté jugada devuelve nulls, y quien lo muestre dice «por
 * definir» en vez de inventar un campeón.
 */
export function podioDeEdicion(todos: readonly PartidoEliminatoria[], copa: Copa = 'oro'): Podio {
  // El podio del torneo es el de la Copa Oro. Con dos finales en la misma
  // edición, buscar «la final» sin decir de qué copa coronaba a la primera
  // que devolviera la base.
  const eliminatoria = todos.filter((p) => copaDe(p) === copa);
  const resolver = (fase: FaseFinal) => {
    const p = eliminatoria.find((x) => x.fase === fase && x.estado === 'jugado');
    if (!p) return { ganador: null, perdedor: null };
    const lado = ladoGanador(p.golesLocal, p.golesVisitante, p.penalesLocal, p.penalesVisitante);
    if (!lado) return { ganador: null, perdedor: null };
    return lado === 'local'
      ? { ganador: p.local, perdedor: p.visitante }
      : { ganador: p.visitante, perdedor: p.local };
  };

  const final = resolver('final');
  const tercero = resolver('tercer-puesto');

  return {
    campeon: final.ganador,
    subcampeon: final.perdedor,
    tercero: tercero.ganador,
  };
}

/** Llave proyectada con las tablas de respaldo. */
export const CRUCES_LIGA = cruzarFaseFinal();
