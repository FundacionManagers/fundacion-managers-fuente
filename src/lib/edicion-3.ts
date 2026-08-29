/**
 * La 3ª edición (2026-1), que se jugó por eliminación directa.
 *
 * Vive en su propio archivo, separada de los clubes, por una razón concreta:
 * el palmarés del torneo se deriva de estos partidos. `torneo.ts` lee la
 * Gran Final de aquí para saber quién es campeón, y `torneo-data.ts` cuenta
 * los títulos de cada club a partir de eso. Si el bracket siguiera junto a
 * los equipos habría una importación circular.
 *
 * De las ediciones 1ª y 2ª no hay ningún partido publicado, así que no
 * tienen un archivo como este — y por eso no otorgan títulos.
 */

export type Fase = 'cuartos' | 'semifinal' | 'tercer-puesto' | 'final';

export interface Partido {
  id: string;
  fase: Fase;
  etiqueta: string;
  fecha: string;
  hora: string;
  /** slug de equipo o null si aún no definido (espera ganador). */
  local: string | null;
  visitante: string | null;
  golesLocal: number | null;
  golesVisitante: number | null;
  /** Definición por penales cuando el tiempo reglamentario termina empatado. */
  penales?: { local: number; visitante: number };
  estado: 'programado' | 'jugado' | 'en-vivo';
  /** Fechas/horas tomadas del bracket de IG; pendientes de confirmar. */
  placeholder: boolean;
}

/** Ganador de un partido jugado (considera penales en caso de empate). */
export function ganadorDe(p: Partido): string | null {
  if (p.estado !== 'jugado' || p.golesLocal == null || p.golesVisitante == null) {
    return null;
  }
  if (p.golesLocal > p.golesVisitante) return p.local;
  if (p.golesVisitante > p.golesLocal) return p.visitante;
  if (p.penales) {
    return p.penales.local > p.penales.visitante ? p.local : p.visitante;
  }
  return null;
}

/**
 * Bracket 2026 (tercera edición). Emparejamientos de cuartos según el
 * gráfico de @torneo_managers; marcadores aún por confirmar.
 */
export const BRACKET_2026: readonly Partido[] = [
  {
    id: 'cf1',
    fase: 'cuartos',
    etiqueta: 'Cuartos · Partido 1',
    fecha: '24 may 2026',
    hora: '10:00',
    local: 'los-pibes',
    visitante: 'useche-fc',
    golesLocal: 5,
    golesVisitante: 0,
    estado: 'jugado',
    placeholder: false,
  },
  {
    id: 'cf2',
    fase: 'cuartos',
    etiqueta: 'Cuartos · Partido 2',
    fecha: '24 may 2026',
    hora: '08:00',
    local: 'the-originals',
    visitante: 'managers-fc',
    golesLocal: 5,
    golesVisitante: 2,
    estado: 'jugado',
    placeholder: false,
  },
  {
    id: 'cf3',
    fase: 'cuartos',
    etiqueta: 'Cuartos · Partido 3',
    fecha: '24 may 2026',
    hora: '07:00',
    local: 'pomada-alfa',
    visitante: 'la-banda-cruzada',
    golesLocal: 0,
    golesVisitante: 0,
    penales: { local: 3, visitante: 4 },
    estado: 'jugado',
    placeholder: false,
  },
  {
    id: 'cf4',
    fase: 'cuartos',
    etiqueta: 'Cuartos · Partido 4',
    fecha: '24 may 2026',
    hora: '09:00',
    local: 'yonotomo-fc',
    visitante: 'tp-fc',
    golesLocal: 6,
    golesVisitante: 2,
    estado: 'jugado',
    placeholder: false,
  },
  {
    id: 'sf1',
    fase: 'semifinal',
    etiqueta: 'Semifinal 1',
    fecha: '31 may 2026',
    hora: '07:00',
    local: 'los-pibes',
    visitante: 'yonotomo-fc',
    golesLocal: 3,
    golesVisitante: 2,
    estado: 'jugado',
    placeholder: false,
  },
  {
    id: 'sf2',
    fase: 'semifinal',
    etiqueta: 'Semifinal 2',
    fecha: '31 may 2026',
    hora: '08:30',
    local: 'the-originals',
    visitante: 'la-banda-cruzada',
    golesLocal: 3,
    golesVisitante: 0,
    estado: 'jugado',
    placeholder: false,
  },
  {
    id: 'tp',
    fase: 'tercer-puesto',
    etiqueta: 'Tercer puesto',
    fecha: '31 may 2026',
    hora: '10:00',
    local: 'yonotomo-fc',
    visitante: 'la-banda-cruzada',
    golesLocal: 8,
    golesVisitante: 3,
    estado: 'jugado',
    placeholder: false,
  },
  {
    id: 'fin',
    fase: 'final',
    etiqueta: 'Gran Final',
    fecha: '31 may 2026',
    hora: '11:30',
    local: 'los-pibes',
    visitante: 'the-originals',
    golesLocal: 1,
    golesVisitante: 2,
    estado: 'jugado',
    placeholder: false,
  },
] as const;

/** Fecha/hora ISO del próximo partido (Colombia, UTC-5) para la cuenta regresiva. */
export const PROXIMO_PARTIDO_ISO = '2026-05-31T11:30:00-05:00';

export const CUARTOS = BRACKET_2026.filter((p) => p.fase === 'cuartos');
export const SEMIS = BRACKET_2026.filter((p) => p.fase === 'semifinal');
export const TERCER_PUESTO = BRACKET_2026.find((p) => p.fase === 'tercer-puesto')!;
export const FINAL = BRACKET_2026.find((p) => p.fase === 'final')!;

/** Calendario = bracket ordenado por fecha/hora. */
export const CALENDARIO = [...BRACKET_2026];
