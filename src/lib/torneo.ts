/**
 * Identidad del Torneo Managers y palmarés por edición.
 *
 * `EDICIONES` es la ÚNICA lista de la que sale todo lo relacionado con
 * títulos: cuántos tiene cada club, quién es el campeón vigente, quién el
 * máximo ganador y qué se muestra en la sección de Palmarés. Ningún club
 * lleva su número de títulos escrito a mano en otro sitio.
 *
 * Por qué. La web llegó a presentar a Pomada Alfa como "bicampeón vigente",
 * con dos títulos fechados en 2024 y 2025 que no encajaban ni con la
 * numeración del resto del sitio, mientras la 3ª edición la había ganado
 * The Originals. El número vivía suelto en la ficha del club, sin ninguna
 * lista que lo respaldara ni nadie a quien preguntarle de dónde salía.
 *
 * Cada campeón declara ahora de dónde sale, y eso es lo que la sección de
 * Palmarés publica junto al título:
 *
 *   - `partidos`: la llave está en el sitio y quien quiera puede ir a ver
 *     quién ganó la final. Es el caso de la 3ª edición.
 *   - `campeonDeclarado`: el palmarés que aporta la organización de las dos
 *     primeras ediciones, cuyos partidos nunca se publicaron.
 *
 * Si algún día se cargan esas llaves —creando su `edicion-1.ts` y
 * `edicion-2.ts` como el de la 3ª— basta con enlazarlas aquí: el campeón
 * pasará a salir de la final y el respaldo cambiará solo, sin tocar ni un
 * texto de la web.
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

/**
 * De dónde sale el nombre del campeón de una edición.
 *
 * `llave-publicada` es el respaldo fuerte: el sitio publica la Gran Final y
 * cualquiera puede comprobar quién la ganó. `declarado` es el palmarés que
 * aporta la organización de ediciones cuyos partidos no se publicaron nunca.
 * Ambos cuentan como título; la diferencia se dice en la sección de Palmarés
 * en vez de esconderla, que fue el problema original.
 */
export type RespaldoCampeon = 'llave-publicada' | 'declarado';

export interface Edicion {
  numero: number;
  /** Periodo semestral, ej. '2025-1'. */
  periodo: string;
  estado: 'jugada' | 'en-curso' | 'proxima';
  /** Partidos publicados. Si están, el campeón sale de la Gran Final. */
  partidos?: readonly Partido[];
  /** Campeón aportado por la organización, para ediciones sin llave publicada. */
  campeonDeclarado?: string;
  notas?: string;
}

export const EDICIONES: readonly Edicion[] = [
  {
    numero: 1,
    periodo: '2025-1',
    estado: 'jugada',
    campeonDeclarado: 'Pomada Alfa',
    notas: 'Primera edición del torneo. Sus partidos no se publicaron en el sitio.',
  },
  {
    numero: 2,
    periodo: '2025-2',
    estado: 'jugada',
    campeonDeclarado: 'Pomada Alfa',
    notas: 'Segunda estrella de Pomada Alfa. Sus partidos no se publicaron en el sitio.',
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
  {
    numero: 5,
    periodo: '2027-1',
    estado: 'proxima',
    notas: 'Inscripciones abiertas. Es la edición a la que se apunta un equipo nuevo hoy.',
  },
];

/** El campeón que se puede demostrar con la Gran Final publicada. */
function campeonSegunLlave(edicion: Edicion): string | undefined {
  const final = edicion.partidos?.find((p) => p.fase === 'final');
  if (!final) return undefined;
  const slug = ganadorDe(final);
  return slug ? NOMBRE_POR_SLUG[slug] : undefined;
}

/** Campeón de una edición: el de la llave si está publicada, o el declarado. */
export function campeonDe(edicion: Edicion): string | undefined {
  return campeonSegunLlave(edicion) ?? edicion.campeonDeclarado;
}

/** Cómo está respaldado el campeón de esa edición. */
export function respaldoDe(edicion: Edicion): RespaldoCampeon | undefined {
  if (campeonSegunLlave(edicion)) return 'llave-publicada';
  if (edicion.campeonDeclarado) return 'declarado';
  return undefined;
}

/** Ediciones ya cerradas que tienen campeón. */
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

/**
 * Ediciones que ya existen: jugadas o en juego. Las próximas no cuentan.
 *
 * Es lo que hay que contar cuando la web dice "N ediciones", en el palmarés
 * o en los números del torneo. Anunciar una edición que aún no ha empezado
 * como si ya se hubiera jugado infla el historial.
 */
export const EDICIONES_DISPUTADAS = EDICIONES.filter((e) => e.estado !== 'proxima');

/**
 * La edición a la que se inscribe un equipo hoy.
 *
 * No es la que se está jugando: cuando la 4ª va por la Fecha 5, quien llega
 * al formulario se está apuntando a la 5ª. La web decía "Inscripciones ·
 * Edición 4° (2026-2)" y "¿Tu equipo va por la cuarta moneda?" con la cuarta
 * ya empezada, así que un equipo nuevo leía que se inscribía a un torneo que
 * llevaba cinco fechas jugadas.
 *
 * Si no hay ninguna edición marcada como próxima, se cae a la que está en
 * curso: es preferible a no poder nombrar ninguna.
 */
export const EDICION_INSCRIPCIONES =
  EDICIONES.find((e) => e.estado === 'proxima') ?? EDICION_EN_CURSO;

/** 'la cuarta moneda', 'la quinta moneda'… El número no se escribe a mano. */
const ORDINALES_FEMENINOS = [
  'primera',
  'segunda',
  'tercera',
  'cuarta',
  'quinta',
  'sexta',
  'séptima',
  'octava',
  'novena',
  'décima',
] as const;

export function ordinalFemenino(n: number): string {
  return ORDINALES_FEMENINOS[n - 1] ?? `${n}ª`;
}

/** 'Edición 5° (2027-1)', tal como se rotula en la web. */
export function rotuloEdicion(edicion: Edicion): string {
  return `Edición ${edicion.numero}° (${edicion.periodo})`;
}

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
  { valor: String(EDICIONES_DISPUTADAS.length), etiqueta: 'Ediciones' },
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
