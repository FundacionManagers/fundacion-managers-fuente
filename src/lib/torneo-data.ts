/**
 * Clubes y llave de la 3ª edición (2026-1), la que se jugó por eliminación
 * directa. Los datos de la edición en curso —tabla, calendario, goleadores—
 * viven en `liga.ts`, y el palmarés por edición en `torneo.ts`.
 *
 * Aquí no queda ningún dato "por confirmar": lo que no esté verificado no se
 * publica. La nómina de cada club es lo único pendiente y se arma con los
 * jugadores que ya aparecen en la planilla de goleadores.
 */

import { TITULOS_POR_CLUB } from './torneo';

export interface Equipo {
  slug: string;
  nombre: string;
  corto: string;
  /** Color de acento del club (placeholder hasta tener escudos reales). */
  color: string;
  titulos: number;
  /** true = datos de plantel/escudo aún placeholder. */
  placeholder: boolean;
}

/**
 * Los ocho clubes. El palmarés NO se escribe aquí: `titulos` se cuenta sobre
 * `EDICIONES` (en `torneo.ts`), que es donde vive el campeón de cada edición.
 *
 * Antes cada club llevaba su número de títulos a mano y se desincronizó: la
 * web daba a Pomada Alfa como "bicampeón vigente" cuando la 3ª edición la
 * ganó The Originals. Con el conteo derivado, cerrar una edición en
 * `EDICIONES` actualiza escudos, badges y destacados de una sola vez.
 */
const CLUBES = [
  { slug: 'pomada-alfa', nombre: 'Pomada Alfa', corto: 'PAL', color: '#8B2E2E' },
  { slug: 'the-originals', nombre: 'The Originals', corto: 'ORI', color: '#2D6CDF' },
  { slug: 'los-pibes', nombre: 'Los Pibes del Barrio', corto: 'PIB', color: '#C8362B' },
  { slug: 'yonotomo-fc', nombre: 'Yonotomo', corto: 'YON', color: '#E8722C' },
  { slug: 'la-banda-cruzada', nombre: 'La Banda Cruzada FC', corto: 'LBC', color: '#5BB8E0' },
  { slug: 'tp-fc', nombre: 'Tranquilo Papi', corto: 'TPA', color: '#0F766E' },
  { slug: 'managers-fc', nombre: 'Managers FC', corto: 'MGR', color: '#D4A437' },
  { slug: 'useche-fc', nombre: 'Useches', corto: 'USE', color: '#5B3DA8' },
] as const;

export const EQUIPOS: readonly Equipo[] = CLUBES.map((c) => ({
  ...c,
  titulos: TITULOS_POR_CLUB[c.nombre] ?? 0,
  // Escudo y plantel siguen siendo material pendiente de la organización.
  placeholder: true,
}));

export function getEquipo(slug: string): Equipo | undefined {
  return EQUIPOS.find((e) => e.slug === slug);
}

/**
 * La llave de la 3ª edición se re-exporta desde `edicion-3.ts` para no
 * romper los imports que ya la piden desde aquí. El dato vive allí porque
 * de él sale el palmarés.
 */
export {
  BRACKET_2026,
  CALENDARIO,
  CUARTOS,
  FINAL,
  PROXIMO_PARTIDO_ISO,
  SEMIS,
  TERCER_PUESTO,
  ganadorDe,
  type Fase,
  type Partido,
} from './edicion-3';

export interface SubRuta {
  href: string;
  label: string;
}

export const TORNEO_TABS: readonly SubRuta[] = [
  { href: '/torneo/', label: 'Resumen' },
  { href: '/torneo/bracket/', label: 'Llave' },
  { href: '/torneo/calendario/', label: 'Calendario' },
  { href: '/torneo/equipos/', label: 'Equipos' },
  { href: '/torneo/estadisticas/', label: 'Estadísticas' },
  { href: '/torneo/inscripciones/', label: 'Inscripciones' },
] as const;
