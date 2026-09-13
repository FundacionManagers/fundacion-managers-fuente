import { BadgeCheck, Rocket, type LucideIcon } from 'lucide-react';

/**
 * Contenido de Emprendimiento. Vive aparte de `eje-content.ts` porque la
 * sección dejó de caber en la plantilla genérica de los ejes: abre con el
 * diagnóstico, sigue con dos rutas y una de ellas tiene página propia.
 * Lo dictó Jorge el 13 de septiembre de 2026.
 */

export interface Entregable {
  titulo: string;
  /** La línea corta, para la tarjeta. */
  resumen: string;
  /** Qué se hace y con qué se queda la persona. Solo en la página del paquete. */
  detalle: string;
}

export interface Ruta {
  /** El momento del emprendimiento al que responde. */
  etapa: string;
  numero: string;
  titulo: string;
  resumen: string;
  cuerpo: string;
  icon: LucideIcon;
  /** A dónde lleva el botón, si la ruta tiene página propia. */
  href?: string;
  cta: string;
}

export const COMPROMISO = {
  kicker: 'Nuestro compromiso',
  titulo: 'La fundación no da un taller y se va.',
  cuerpo:
    'Ya sabes en qué punto estás. Desde ahí acompañamos en dos frentes: hacemos visible tu emprendimiento ante la comunidad, y lo llevamos paso a paso hasta que factura por primera vez. Estos son los dos caminos.',
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
    cta: 'Quiero estar en el directorio',
  },
  {
    etapa: 'Incubación',
    numero: '02',
    titulo: 'Toma el paquete Emprende',
    resumen: 'Tres meses, doce sesiones y ocho cosas que al final quedan hechas y son tuyas.',
    cuerpo:
      'Incubación es cuando el emprendimiento deja de ser una idea que se explica y pasa a ser un negocio que se muestra, se cobra y se sostiene. Una sesión por semana durante tres meses, y al final tienes con qué salir al mercado.',
    icon: Rocket,
    href: '/emprendimiento/paquete-emprende/',
    cta: 'Ver el programa completo',
  },
];

export const PAQUETE = {
  nombre: 'Paquete Emprende',
  kicker: 'Ruta 02 · Incubación',
  titular: 'Tres meses para dejar de explicar tu idea y empezar a cobrarla.',
  entrada:
    'Una sesión por semana, doce en total, y ocho entregables que al terminar son tuyos y se quedan contigo. No es un curso: es que tu emprendimiento salga de aquí con página, con marca, con catálogo y con a quién llamar.',
  cierre: 'Te llevamos hasta tu primera facturación.',
  duracion: [
    { valor: '3', etiqueta: 'Meses' },
    { valor: '12', etiqueta: 'Sesiones de una hora' },
    { valor: '8', etiqueta: 'Entregables tuyos' },
  ],
};

export const ENTREGABLES: readonly Entregable[] = [
  {
    titulo: 'Doce sesiones de mentoría',
    resumen: 'Una hora por semana durante tres meses, uno a uno.',
    detalle:
      'Una sesión semanal de una hora con quien ya recorrió el camino. No son charlas sueltas: cada sesión avanza sobre lo de la anterior y deja una tarea concreta para la semana.',
  },
  {
    titulo: 'La primera versión de tu landing',
    resumen: 'Tu emprendimiento con página propia, no un perfil prestado.',
    detalle:
      'Una página en internet que es tuya y que puedes mandar por WhatsApp cuando alguien pregunte a qué te dedicas. Qué vendes, a quién, por qué tú, y cómo te contactan.',
  },
  {
    titulo: 'Tu primera red, construida a propósito',
    resumen: 'A quién necesitas conocer y en qué orden. No se deja al azar.',
    detalle:
      'Armamos juntos el mapa de las personas que le sirven a tu negocio —clientes, proveedores, aliados, quien ya vende a quien tú quieres venderle— y el orden en que conviene buscarlas. La comunidad de la fundación es el primer lugar donde se busca.',
  },
  {
    titulo: 'Tu primer kit de marca',
    resumen: 'Nombre, logo, colores y tipografías: con qué cara sales al mercado.',
    detalle:
      'El mínimo con el que un negocio se ve serio: el logo en los formatos que vas a necesitar, la paleta, las tipografías y cómo se usan. Entregado en archivos, para que no dependas de nadie cada vez que hay que hacer una pieza.',
  },
  {
    titulo: 'Taller «Descubre tu talento en 5 pasos»',
    resumen: 'Qué sabes hacer mejor que los demás, y cómo eso se cobra.',
    detalle:
      'Un taller para poner en claro qué es lo que tú haces bien de verdad. Suena a introspección y es lo contrario: de ahí sale qué parte del negocio la haces tú y qué parte toca delegar o aprender.',
  },
  {
    titulo: 'Tu propuesta única de valor',
    resumen: 'Por qué te compran a ti y no al de al lado, dicho en una frase.',
    detalle:
      'La PUV es la frase que dices cuando te preguntan qué vendes y hace que el otro quiera saber más. Se construye con lo que ya sabes de tus clientes y se prueba con ellos antes de darla por buena.',
  },
  {
    titulo: 'Tu primer catálogo emprendedor',
    resumen: 'Lo que vendes, ordenado y listo para mostrar.',
    detalle:
      'Tus productos o servicios con su descripción, su foto y su precio, en un documento que se manda y se entiende sin que tengas que explicarlo por encima.',
  },
  {
    titulo: 'Tus primeros procesos clave',
    resumen: 'Lo administrativo, lo financiero y lo legal, recomendado a tiempo.',
    detalle:
      'Qué tienes que tener en orden ahora y qué puede esperar: facturación, cuentas separadas, registro, contratos, obligaciones. Recomendaciones para no improvisar justo lo que después cuesta caro arreglar.',
  },
];

export const DIAGNOSTICO_BLOQUE = {
  kicker: 'Por aquí se empieza',
  pregunta: '¿Por qué hacer el diagnóstico?',
  cuerpo:
    'Porque lo que viene después —los dos caminos por los que se entra a la fundación— no sirve de nada si no sabemos de dónde partes. En veinticinco minutos reconocemos en qué estado real está tu emprendimiento y te entregamos ahí mismo, sin esperar y sin reunión, un diagnóstico escrito para ti.',
  entrega:
    'En qué etapa estás, qué tienes ya a favor, cuáles son tus tres retos y qué hacer en los próximos 8 días.',
};

/** El WhatsApp de la fundación, el mismo de contacto y de pagos. */
export const WHATSAPP = '573126299744';

export function enlaceWhatsApp(mensaje: string): string {
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensaje)}`;
}
