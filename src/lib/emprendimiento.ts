import { BadgeCheck, Rocket, type LucideIcon } from 'lucide-react';

/**
 * Contenido de la página de Emprendimiento. Vive aparte de `eje-content.ts`
 * porque esta sección dejó de caber en la plantilla genérica de los ejes:
 * tiene dos rutas que se despliegan, un paquete con ocho entregables y el
 * diagnóstico como cierre. Lo dictó Jorge el 13 de septiembre de 2026.
 */

export interface EntregableRuta {
  titulo: string;
  detalle: string;
}

export interface Ruta {
  /** Etiqueta corta del momento del emprendimiento. */
  etapa: string;
  numero: string;
  titulo: string;
  /** La línea que se ve con la tarjeta cerrada. */
  resumen: string;
  /** Qué es esta etapa, en palabras de la fundación. */
  cuerpo: string;
  icon: LucideIcon;
  entregables?: EntregableRuta[];
  /** Frase con la que cierra la ruta, si la tiene. */
  cierre?: string;
}

export const COMPROMISO = {
  kicker: 'Nuestro compromiso',
  titulo: 'La fundación no da un taller y se va.',
  cuerpo:
    'Acompañamos a quien tiene un emprendimiento en dos frentes: lo hacemos visible ante la comunidad y lo llevamos, paso a paso, hasta que factura por primera vez. Estas son las dos rutas por las que se entra.',
};

export const RUTAS: readonly Ruta[] = [
  {
    etapa: 'Pre-incubación',
    numero: '01',
    titulo: 'Entra al directorio de emprendimientos',
    resumen: 'Tu emprendimiento se da a conocer en la comunidad de la fundación.',
    cuerpo:
      'Pre-incubación es el momento en que el emprendimiento todavía se está probando y lo que más le falta no es plata: es que lo vean. Tu emprendimiento entra al directorio de la Fundación Managers con una ficha propia —qué hace, a quién le sirve y cómo contactarte— y queda a la vista de toda la comunidad. La primera venta de muchos negocios sale de alguien que ya estaba cerca y no sabía que existías.',
    icon: BadgeCheck,
  },
  {
    etapa: 'Incubación',
    numero: '02',
    titulo: 'Toma el paquete Emprende, de tres meses',
    resumen: 'Tres meses de acompañamiento y todo con lo que un emprendimiento sale a vender.',
    cuerpo:
      'Incubación es cuando el emprendimiento deja de ser una idea que se explica y pasa a ser un negocio que se muestra, se cobra y se sostiene. Son tres meses, una sesión por semana, y ocho cosas que al final quedan hechas y son tuyas.',
    icon: Rocket,
    entregables: [
      {
        titulo: 'Doce sesiones de mentoría',
        detalle: 'Una hora por semana durante tres meses, uno a uno.',
      },
      {
        titulo: 'La primera versión de tu landing',
        detalle: 'Tu emprendimiento con página propia en internet, no un perfil prestado.',
      },
      {
        titulo: 'Tu primera red, construida a propósito',
        detalle: 'A quién necesitas conocer y en qué orden. No se deja al azar.',
      },
      {
        titulo: 'Tu primer kit de marca',
        detalle: 'Nombre, logo, colores y tipografías: con qué cara sales al mercado.',
      },
      {
        titulo: 'Taller «Descubre tu talento en 5 pasos»',
        detalle: 'Qué sabes hacer mejor que los demás, y cómo eso se cobra.',
      },
      {
        titulo: 'Tu propuesta única de valor',
        detalle: 'Por qué te compran a ti y no al de al lado, dicho en una sola frase.',
      },
      {
        titulo: 'Tu primer catálogo emprendedor',
        detalle: 'Lo que vendes, ordenado y listo para mostrar.',
      },
      {
        titulo: 'Tus primeros procesos clave',
        detalle:
          'Recomendaciones administrativas, financieras y legales para no improvisar lo que después cuesta caro.',
      },
    ],
    cierre: 'Te llevamos hasta tu primera facturación.',
  },
];

export const DIAGNOSTICO_BLOQUE = {
  kicker: 'Antes de empezar',
  pregunta: '¿Por qué hacer el diagnóstico?',
  cuerpo:
    'Porque ninguna de las dos rutas sirve si no sabemos de dónde partes. En veinticinco minutos reconocemos en qué estado real está tu emprendimiento y te entregamos ahí mismo —sin esperar y sin reunión— un diagnóstico escrito para ti.',
  entrega:
    'En qué etapa estás, qué tienes ya a favor, cuáles son tus tres retos y qué hacer en los próximos 8 días.',
};
