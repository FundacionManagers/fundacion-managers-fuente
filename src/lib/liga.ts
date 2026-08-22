/**
 * Fase de grupos de la 4ª edición (2026-2) — liga de 7 fechas, 8 equipos.
 *
 * A diferencia de la 3ª edición (llave eliminatoria, en `torneo-data.ts`),
 * esta edición se juega todos contra todos y la clasificación sale de los
 * resultados.
 *
 * DECISIÓN DE DISEÑO: la tabla de posiciones NO se escribe a mano. Se calcula
 * con `calcularPosiciones()` a partir de `PARTIDOS_LIGA`. Así PJ, PG, PE, PP,
 * GF, GC, DG y PTS son siempre coherentes entre sí y con el calendario: es
 * imposible que la tabla y los marcadores se contradigan. Lo único que se
 * carga a mano es la disciplina (amarillas y rojas), que no se deduce de un
 * marcador.
 */

import { EQUIPOS } from './torneo-data';

export const EDICION_ACTUAL = 4;
export const PERIODO_ACTUAL = '2026-2';
export const TOTAL_JORNADAS = 7;

export interface PartidoLiga {
  id: string;
  /** Número de fecha, 1 a 7. */
  jornada: number;
  /** Fecha de juego en formato legible, ej. '26/07/2026'. */
  fecha: string;
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
  numero: number | null;
  goles: number;
}

/**
 * Fixture completo de la fase de grupos.
 * Los partidos ya jugados llevan marcador y `estado: 'jugado'`.
 */
export const PARTIDOS_LIGA: readonly PartidoLiga[] = [] as const;

/** Tarjetas por club, indexadas por slug. */
export const DISCIPLINA: Readonly<Record<string, Disciplina>> = {};

/** Ranking de goleadores acumulado. */
export const GOLEADORES_LIGA: readonly Goleador[] = [] as const;

export const JORNADA_ACTUAL = PARTIDOS_LIGA.reduce(
  (max, p) => (p.estado === 'jugado' && p.jornada > max ? p.jornada : max),
  0,
);

/** Partidos de una fecha concreta, en el orden en que fueron cargados. */
export function partidosDeJornada(jornada: number): PartidoLiga[] {
  return PARTIDOS_LIGA.filter((p) => p.jornada === jornada);
}

/** Números de fecha presentes en el fixture, ordenados. */
export const JORNADAS: number[] = [...new Set(PARTIDOS_LIGA.map((p) => p.jornada))].sort(
  (a, b) => a - b,
);

/**
 * Calcula la tabla de posiciones a partir de los partidos jugados.
 *
 * Desempate: puntos, luego diferencia de gol, luego goles a favor y por
 * último orden alfabético, para que el resultado sea estable entre builds.
 * Si el torneo usa otro criterio (por ejemplo, enfrentamiento directo),
 * es aquí donde hay que cambiarlo.
 */
export function calcularPosiciones(
  partidos: readonly PartidoLiga[] = PARTIDOS_LIGA,
  disciplina: Readonly<Record<string, Disciplina>> = DISCIPLINA,
): FilaPosicion[] {
  const tabla = new Map<string, Omit<FilaPosicion, 'posicion' | 'dg'>>();

  for (const eq of EQUIPOS) {
    tabla.set(eq.slug, {
      equipo: eq.slug,
      pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0,
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

  return [...tabla.values()]
    .map((f) => ({ ...f, dg: f.gf - f.gc }))
    .sort(
      (a, b) =>
        b.pts - a.pts || b.dg - a.dg || b.gf - a.gf || a.equipo.localeCompare(b.equipo),
    )
    .map((f, i) => ({ ...f, posicion: i + 1, dg: f.dg }));
}

export const POSICIONES_LIGA = calcularPosiciones();

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
] as const;
