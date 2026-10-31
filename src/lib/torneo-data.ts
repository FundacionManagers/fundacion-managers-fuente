/**
 * Clubes del torneo y grupos de la edición en curso. Los datos que cambian
 * cada semana —tabla, calendario, goleadores— viven en `liga.ts`, y el
 * palmarés por edición en `torneo.ts`.
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
  /**
   * false = todavía no hay archivo en `public/escudos/`. Los clubes que se
   * suman en una edición llegan sin logo, y un `<img>` apuntando a un archivo
   * que no existe pinta el icono de imagen rota en cada tabla del sitio.
   * Sin escudo, `TeamCrest` dibuja el monograma del club con su color.
   */
  escudo: boolean;
}

/**
 * Todos los clubes que han jugado el torneo, estén o no en la edición en
 * curso. El palmarés NO se escribe aquí: `titulos` se cuenta sobre
 * `EDICIONES` (en `torneo.ts`), que es donde vive el campeón de cada edición.
 *
 * Antes cada club llevaba su número de títulos a mano y se desincronizó: la
 * web daba a Pomada FC como "bicampeón vigente" cuando la 3ª edición la
 * ganó The Originals. Con el conteo derivado, cerrar una edición en
 * `EDICIONES` actualiza escudos, badges y destacados de una sola vez.
 *
 * Los que ya no juegan siguen aquí porque las llaves de ediciones pasadas
 * los nombran: Useches y Managers FC jugaron la 4ª y no la 5ª.
 */
const CLUBES = [
  { slug: 'pomada-alfa', nombre: 'Pomada FC', corto: 'PFC', color: '#8B2E2E', escudo: true },
  { slug: 'the-originals', nombre: 'The Originals', corto: 'ORI', color: '#2D6CDF', escudo: true },
  {
    slug: 'los-pibes',
    nombre: 'Los Pibes del Barrio',
    corto: 'PIB',
    color: '#C8362B',
    escudo: true,
  },
  { slug: 'yonotomo-fc', nombre: 'Yonotomo', corto: 'YON', color: '#E8722C', escudo: true },
  {
    slug: 'la-banda-cruzada',
    nombre: 'La Banda Cruzada FC',
    corto: 'LBC',
    color: '#5BB8E0',
    escudo: true,
  },
  { slug: 'tp-fc', nombre: 'Tranquilo Papi', corto: 'TPA', color: '#0F766E', escudo: true },
  { slug: 'managers-fc', nombre: 'Managers FC', corto: 'MGR', color: '#D4A437', escudo: true },
  { slug: 'useche-fc', nombre: 'Useches', corto: 'USE', color: '#5B3DA8', escudo: true },
  // Nuevos en la 5ª edición. Nombre tal como lo escribe la organización;
  // el color es provisional, el escudo ya viene del documento de la organización.
  {
    slug: 'isotopos-portal-1',
    nombre: 'Isótopos Portal 1',
    corto: 'ISO',
    color: '#65A30D',
    escudo: true,
  },
  { slug: 'cucuta-10-fc', nombre: 'Cúcuta 10 F.C.', corto: 'CUC', color: '#9F1239', escudo: true },
] as const;

export type Grupo = 'A' | 'B';

/**
 * Los dos grupos de la 5ª edición, en el orden de la tabla oficial de la
 * Fecha 1.
 *
 * Es lo único del formato que se escribe a mano. El grupo de cada partido
 * no se guarda en ninguna parte: un club solo juega contra los de su grupo,
 * así que sale de cualquiera de los dos equipos.
 */
export const GRUPOS: Readonly<Record<Grupo, readonly string[]>> = {
  A: ['tp-fc', 'cucuta-10-fc', 'yonotomo-fc', 'the-originals'],
  B: ['pomada-alfa', 'la-banda-cruzada', 'isotopos-portal-1', 'los-pibes'],
};

export const LETRAS_GRUPO: readonly Grupo[] = ['A', 'B'];

/** Grupo de un club en la edición en curso, o null si no la juega. */
export function grupoDe(slug: string): Grupo | null {
  return LETRAS_GRUPO.find((g) => GRUPOS[g].includes(slug)) ?? null;
}

const TODOS: readonly Equipo[] = CLUBES.map((c) => ({
  ...c,
  titulos: TITULOS_POR_CLUB[c.nombre] ?? 0,
  // Escudo y plantel siguen siendo material pendiente de la organización.
  placeholder: true,
}));

/** Todos los clubes con historia en el torneo, jueguen o no la edición en curso. */
export const CLUBES_HISTORICOS: readonly Equipo[] = TODOS;

/**
 * Los clubes de la edición en curso, grupo por grupo.
 *
 * Es lo que recorren la tabla, el marquee, la parrilla de Equipos y el
 * panel. Un club que no juega esta edición no tiene fila que mostrar.
 */
export const EQUIPOS: readonly Equipo[] = LETRAS_GRUPO.flatMap((g) =>
  GRUPOS[g].map((slug) => TODOS.find((e) => e.slug === slug)!),
);

/** Busca en todos los clubes, no solo en los de hoy: las llaves viejas los nombran. */
export function getEquipo(slug: string): Equipo | undefined {
  return TODOS.find((e) => e.slug === slug);
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
  // El palmarés tiene pestaña propia porque se busca a propósito. Estuvo un
  // rato como sección al final del Resumen y ahí no lo encontraba nadie.
  { href: '/torneo/palmares/', label: 'Palmarés' },
  { href: '/torneo/inscripciones/', label: 'Inscripciones' },
] as const;
