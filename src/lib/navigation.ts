import {
  Briefcase,
  Trophy,
  Plane,
  CalendarHeart,
  Gauge,
  Rocket,
  Sprout,
  type LucideIcon,
} from 'lucide-react';

/**
 * Los ejes de la fundación. Fuente única de verdad para navegación,
 * footer, grid del home y páginas individuales.
 */
export type EjeTheme = 'light' | 'dark';

export interface Eje {
  slug: string;
  nombre: string;
  tagline: string;
  descripcion: string;
  theme: EjeTheme;
  /** Clase de acento principal (Tailwind) para badges y bordes. */
  accent: string;
  icon: LucideIcon;
  /**
   * Si es false, el eje no aparece en el menú, el pie, el home ni la página
   * de «nosotros», pero su página sigue existiendo y respondiendo en su URL.
   * Se hace así —y no borrando el objeto— para que los enlaces ya compartidos
   * no se rompan y para que devolver un eje sea cambiar una sola palabra.
   */
  visible?: boolean;
  /**
   * A dónde lleva. Por defecto, la página del eje: `/{slug}/`. Solo se escribe
   * cuando la entrada apunta a algo que no es una página de este sitio, como el
   * diagnóstico, que es un archivo estático en `public/`.
   */
  href?: string;
}

/** A dónde lleva una entrada del menú. */
export function hrefDeEje(e: Eje): string {
  return e.href ?? `/${e.slug}/`;
}

// Orden oficial definido por Jorge (mayo 2026):
// Torneo → Turismo → Emprendimiento → Consultoría → Eventos → Managers Rural
export const EJES: readonly Eje[] = [
  {
    slug: 'torneo',
    nombre: 'Torneo Managers',
    tagline: 'F7 para líderes mayores de 28',
    descripcion:
      'Torneo de Fútbol 7 diseñado para líderes mayores de 28 años: recreación, networking y alta competencia.',
    theme: 'dark',
    accent: 'text-gold',
    icon: Trophy,
  },
  {
    slug: 'turismo',
    nombre: 'Turismo',
    tagline: 'Experiencias con propósito',
    descripcion: 'Experiencias diseñadas con propósito.',
    theme: 'light',
    accent: 'text-success',
    icon: Plane,
    visible: false,
  },
  {
    slug: 'emprendimiento',
    nombre: 'Emprendimiento',
    tagline: 'Ideas que se vuelven empresas',
    descripcion: 'Programas para emprendedores en etapa temprana.',
    theme: 'light',
    accent: 'text-gold',
    icon: Rocket,
  },
  {
    slug: 'consultoria',
    nombre: 'Consultoría',
    tagline: 'Estrategia con propósito',
    descripcion: 'Acompañamiento estratégico a empresas y organizaciones.',
    theme: 'light',
    accent: 'text-gold',
    icon: Briefcase,
    visible: false,
  },
  {
    slug: 'eventos',
    nombre: 'Eventos',
    tagline: 'Encuentros que conectan',
    descripcion: 'Encuentros que conectan personas y proyectos.',
    theme: 'light',
    accent: 'text-gold',
    icon: CalendarHeart,
  },
  {
    slug: 'rural',
    nombre: 'Managers Rural',
    tagline: 'Oportunidades para el campo',
    descripcion: 'Desarrollo y oportunidades para el campo colombiano.',
    theme: 'light',
    accent: 'text-success',
    icon: Sprout,
    visible: false,
  },
] as const;

/**
 * Los ejes que hoy se muestran. Es lo que consumen el menú, el pie, el home y
 * «nosotros». Las páginas individuales siguen generándose desde EJES, así que
 * un eje oculto conserva su URL: lo que ya se compartió por WhatsApp o quedó
 * en un correo sigue funcionando.
 *
 * Para volver a mostrar un eje, quítale `visible: false` arriba. Nada más.
 */
export const EJES_VISIBLES: readonly Eje[] = EJES.filter((e) => e.visible !== false);

/**
 * El diagnóstico de emprendedores. No es un eje de la fundación —es una
 * herramienta—, pero sí es una puerta de entrada, así que va en el menú, en el
 * pie y en la grilla del home junto a los ejes. No aparece en «nosotros», que
 * habla de los frentes de trabajo, ni en el desplegable de contacto, que
 * pregunta por servicios.
 *
 * Vive en `public/emprendedores.html`: es un archivo estático autocontenido,
 * no una página de este sitio, y por eso lleva `href` propio.
 */
export const DIAGNOSTICO: Eje = {
  slug: 'diagnostico',
  nombre: 'Diagnóstico',
  tagline: 'Para emprendedores',
  descripcion:
    'Veinticinco minutos y sabes en qué etapa está tu emprendimiento, qué tienes a favor y qué hacer en los próximos 8 días.',
  theme: 'light',
  accent: 'text-gold',
  icon: Gauge,
  href: '/emprendedores.html',
};

/**
 * Por dónde se entra a la fundación: el diagnóstico primero, y después los
 * ejes visibles. Es lo que consumen el menú, el menú móvil, el pie y la grilla
 * del home.
 */
export const ENTRADAS: readonly Eje[] = [DIAGNOSTICO, ...EJES_VISIBLES];

/**
 * Cuántas cosas se listan, en letras, para los títulos del sitio. Antes decían
 * «seis» a mano y quedaban mintiendo apenas se ocultaba uno.
 */
const NUMEROS = ['cero', 'una', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho'] as const;
const enLetras = (n: number) => NUMEROS[n] ?? String(n);
const conMayuscula = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const CANTIDAD_EJES: string = enLetras(EJES_VISIBLES.length);
/** La misma palabra, para cuando abre frase. */
export const CANTIDAD_EJES_CAP = conMayuscula(CANTIDAD_EJES);

export const CANTIDAD_ENTRADAS: string = enLetras(ENTRADAS.length);
export const CANTIDAD_ENTRADAS_CAP = conMayuscula(CANTIDAD_ENTRADAS);

export function getEje(slug: string): Eje | undefined {
  return EJES.find((e) => e.slug === slug);
}
