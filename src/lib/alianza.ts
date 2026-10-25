/**
 * Managers Lab — powered by ICONEialabs (modelo Intel Inside / Bonyurt).
 * Cada marca opera independiente; el concepto conjunto es:
 * IA que ayuda a líderes a tomar mejores decisiones.
 */

export const ALIANZA = {
  nombre: 'Managers Lab',
  poweredBy: 'ICONEialabs',
  firma: 'Managers Lab — powered by ICONEialabs',
  claim: 'El laboratorio donde los líderes deciden mejor con inteligencia artificial.',
  bajada:
    'Managers Lab es el espacio conjunto de la Fundación Managers, potenciado por la inteligencia artificial de ICONEialabs. La comunidad de líderes pone el contexto; la IA, la ventaja para decidir.',
  icone: {
    nombre: 'ICONEialabs',
    url: 'https://www.iconeialabs.com',
    descripcion: 'Laboratorio de inteligencia artificial: productos, automatización y formación.',
  },
  managers: {
    nombre: 'Fundación Managers',
    descripcion: 'Comunidad de gerentes y líderes en ocio serio, con un solo norte.',
  },
} as const;

export interface AporteMarca {
  marca: string;
  aporta: string[];
}

export const APORTES: readonly AporteMarca[] = [
  {
    marca: 'Fundación Managers',
    aporta: [
      'La comunidad de gerentes y líderes que deciden',
      'El torneo, los eventos y la confianza humana',
      'El contexto real donde se prueban las decisiones',
    ],
  },
  {
    marca: 'ICONEialabs',
    aporta: [
      'Inteligencia artificial aplicada',
      'Productos, automatización y herramientas',
      'Formación técnica',
    ],
  },
] as const;

/** Cómo fluye una oportunidad entre las dos marcas. */
export const FLUJOS = [
  {
    desde: 'Llegas por Fundación Managers',
    hacia: 'y necesitas IA para tu organización',
    resultado: 'Te conectamos con ICONEialabs.',
  },
  {
    desde: 'Llegas por ICONEialabs',
    hacia: 'y lideras una empresa o equipo',
    resultado: 'Te abrimos la comunidad de Managers.',
  },
] as const;

/** Acento visual de la marca aliada (paleta ICONEialabs). */
export const ICONE_CYAN = '#00D4FF';

/** Ejes donde tiene sentido el CTA cruzado hacia ICONEialabs. */
export const EJES_CON_CRUCE = ['consultoria', 'emprendimiento'] as const;
