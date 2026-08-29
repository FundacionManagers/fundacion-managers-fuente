/**
 * Identidad del Torneo Managers y palmarés por edición.
 *
 * REGLA DE LA CASA: un título no se escribe, se gana en la cancha y se
 * demuestra con la final publicada. `EDICIONES` no lleva un campo `campeon`
 * que alguien teclee; lleva los partidos de esa edición, y el campeón sale
 * de quién ganó la Gran Final.
 *
 * Por qué. La web llegó a presentar a Pomada Alfa como "bicampeón vigente"
 * con dos títulos de 2024 y 2025 que nadie podía comprobar: no hay un solo
 * partido de esas ediciones publicado en el sitio, y de hecho el único
 * partido suyo que sí está —cuartos de la 3ª— lo perdió por penales. El
 * dato estaba escrito a mano y nunca se reconcilió con los resultados.
 *
 * Consecuencia de la regla: las ediciones 1ª y 2ª existieron, y aquí siguen
 * listadas, pero mientras no se publiquen sus partidos no otorgan títulos.
 * El día que se carguen —creando su `edicion-1.ts` y `edicion-2.ts` como el
 * de la 3ª y enlazándolos abajo— los títulos vuelven a contarse solos, sin
 * tocar ni un texto de la web.
 */

import { BRACKET_2026, ganadorDe, type Partido } from './edicion-3';

export const TORNEO_INSTAGRAM = '@torneo_managers';
export const TORNEO_INSTAGRAM_URL = 'https://www.instagram.com/torneo_managers/';

export const TORNEO_BIO =
  'Torneo de F7 diseñado para líderes mayores de 28 años que encuentran en el fútbol un espacio de recreación, networking y alta competencia.';

/** Slug → nombre público. Los partidos guardan slugs; el palmarés, nombres. */
const NOMBRE_POR_SLUG: Readonly<Record<string, string>> = {
  'pomada-alfa': 'Pomada Alfa',
  'the-originals': 'The Originals',
  'los-pibes': 'Los Pibes del Barrio',
  'yonotomo-fc': 'Yonotomo',
  'la-banda-cruzada': 'La Banda Cruzada FC',
  'tp-fc': 'Tranquilo Papi',
  'managers-fc': 'Managers FC',
  'useche-fc': 'Useches',
};

export interface Edicion {
  numero: number;
  /** Periodo semestral, ej. '2025-1'. */
  periodo: string;
  estado: 'jugada' | 'en-curso' | 'proxima';
  /**
   * Partidos publicados de esa edición. Sin ellos no hay campeón que probar.
   * `undefined` = la edición se jugó pero su registro no está en el sitio.
   */
  partidos?: readonly Partido[];
  notas?: string;
}

export const EDICIONES: readonly Edicion[] = [
  {
    numero: 1,
    periodo: '2025-1',
    estado: 'jugada',
    notas: 'Primera edición. Sin registro de partidos publicado en el sitio.',
  },
  {
    numero: 2,
    periodo: '2025-2',
    estado: 'jugada',
    notas: 'Segunda edición. Sin registro de partidos publicado en el sitio.',
  },
  {
    numero: 3,
    periodo: '2026-1',
    estado: 'jugada',
    partidos: BRACKET_2026,
    notas: 'Eliminación directa. Final: Los Pibes del Barrio 1–2 The Originals.',
  },
  {
    numero: 4,
    periodo: '2026-2',
    estado: 'en-curso',
    notas: 'Fase de grupos, 8 equipos a 7 fechas. La final se juega en septiembre.',
  },
];

/** Campeón de una edición: quien ganó su Gran Final, si está publicada. */
export function campeonDe(edicion: Edicion): string | undefined {
  const final = edicion.partidos?.find((p) => p.fase === 'final');
  if (!final) return undefined;
  const slug = ganadorDe(final);
  return slug ? NOMBRE_POR_SLUG[slug] : undefined;
}

/** Ediciones cerradas cuyo campeón se puede demostrar con la final. */
const EDICIONES_CON_CAMPEON = EDICIONES.filter(
  (e) => e.estado === 'jugada' && campeonDe(e) !== undefined,
);

const ULTIMA_CON_CAMPEON = EDICIONES_CON_CAMPEON[EDICIONES_CON_CAMPEON.length - 1];

/** Títulos por club, contados sobre las finales publicadas. */
export const TITULOS_POR_CLUB: Readonly<Record<string, number>> = EDICIONES_CON_CAMPEON.reduce<
  Record<string, number>
>((acc, e) => {
  const campeon = campeonDe(e)!;
  acc[campeon] = (acc[campeon] ?? 0) + 1;
  return acc;
}, {});

/**
 * Campeón vigente: el de la última edición cerrada con final publicada.
 *
 * Campeón vigente y máximo ganador son cosas distintas —quien ganó la última
 * frente a quien más acumula—. Hoy coinciden en The Originals porque es el
 * único club con un título demostrable; en cuanto se publiquen más ediciones
 * pueden volver a separarse, y la web lo refleja sola.
 */
export const CAMPEON_VIGENTE = {
  equipo: campeonDe(ULTIMA_CON_CAMPEON!)!,
  edicion: ULTIMA_CON_CAMPEON!.numero,
  periodo: ULTIMA_CON_CAMPEON!.periodo,
  titulos: TITULOS_POR_CLUB[campeonDe(ULTIMA_CON_CAMPEON!)!] ?? 1,
  descripcion: `Vigente Campeón — ${ULTIMA_CON_CAMPEON!.numero}° Edición Torneo Managers (${ULTIMA_CON_CAMPEON!.periodo}).`,
};

/** La edición que se está jugando ahora mismo. */
export const EDICION_EN_CURSO =
  EDICIONES.find((e) => e.estado === 'en-curso') ?? EDICIONES[EDICIONES.length - 1]!;

/** El club con más títulos. Empate resuelto por orden de aparición. */
export const MAXIMO_GANADOR = Object.entries(TITULOS_POR_CLUB).reduce(
  (mejor, [equipo, titulos]) => (titulos > mejor.titulos ? { equipo, titulos } : mejor),
  { equipo: '', titulos: 0 },
);

/**
 * ¿Vale la pena destacar al máximo ganador aparte del campeón vigente?
 *
 * Solo si son clubes distintos. Mientras coincidan, mostrar los dos bloques
 * sería repetir el mismo club dos veces con dos rótulos.
 */
export const MAXIMO_GANADOR_ES_OTRO = MAXIMO_GANADOR.equipo !== CAMPEON_VIGENTE.equipo;

/** Equipos identificados en el bracket de la edición 2026. */
export const EQUIPOS_2026: readonly string[] = [
  'Pomada Alfa',
  'Managers FC',
  'The Originals',
  'La Banda Cruzada FC',
  'Los Pibes del Barrio',
  'Useches',
  'Yonotomo',
  'Tranquilo Papi',
] as const;

export const TORNEO_STATS = [
  { valor: String(EDICIONES.length), etiqueta: 'Ediciones' },
  { valor: '8+', etiqueta: 'Equipos por edición' },
  { valor: '28+', etiqueta: 'Edad mínima' },
  { valor: 'F7', etiqueta: 'Formato' },
] as const;

/**
 * Rótulo de palmarés de un club.
 *
 * Antes se escribía "Bicampeón · N títulos" para cualquier club con títulos,
 * así que The Originals —campeón vigente con uno solo— aparecía como
 * "Bicampeón · 1 títulos". El rótulo depende del número, no de un texto fijo.
 */
export function etiquetaTitulos(titulos: number): string {
  if (titulos <= 0) return `${EDICION_EN_CURSO.numero}ª edición · ${EDICION_EN_CURSO.periodo}`;
  if (titulos === 1) return 'Campeón · 1 título';
  if (titulos === 2) return `Bicampeón · ${titulos} títulos`;
  return `${titulos} títulos`;
}
