import {
  Briefcase,
  Trophy,
  Plane,
  CalendarHeart,
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
 * Cuántos ejes se muestran, en letras, para los títulos del sitio. Antes decían
 * «seis» a mano y quedaban mintiendo apenas se ocultaba uno.
 */
const NUMEROS = ['cero', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho'] as const;
export const CANTIDAD_EJES: string =
  NUMEROS[EJES_VISIBLES.length] ?? String(EJES_VISIBLES.length);
/** La misma palabra, para cuando abre frase. */
export const CANTIDAD_EJES_CAP =
  CANTIDAD_EJES.charAt(0).toUpperCase() + CANTIDAD_EJES.slice(1);

export function getEje(slug: string): Eje | undefined {
  return EJES.find((e) => e.slug === slug);
}
