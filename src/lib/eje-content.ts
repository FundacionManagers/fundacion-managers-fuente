import {
  ClipboardCheck,
  Compass,
  Handshake,
  Lightbulb,
  MapPin,
  Megaphone,
  Network,
  Package,
  Route,
  Sprout,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  type LucideIcon,
} from 'lucide-react';

/**
 * Contenido editorial por eje. El copy es preliminar pero honesto: describe
 * el tipo de actividades que cada eje realiza, sin afirmar resultados,
 * cifras o programas específicos que aún deben confirmarse contra
 * Managers_Especificaciones_v2.docx.
 */

export interface ValueProp {
  icon: LucideIcon;
  title: string;
  body: string;
}

export interface ProcesoStep {
  numero: string;
  title: string;
  body: string;
}

export interface EjeContent {
  intro: string;
  stats: { valor: string; etiqueta: string }[];
  valueProps: ValueProp[];
  proceso: ProcesoStep[];
  ctaTitle: string;
  ctaBody: string;
  /** Frase de cierre única que conecta este eje con mejores decisiones. */
  cierre: string;
  /**
   * Cómo Managers Lab (alianza con ICONE ialabs) potencia ESTE eje.
   * La alianza es transversal: aparece en cada sección con sentido propio.
   */
  labAngle: string;
}

export const EJE_CONTENT: Record<string, EjeContent> = {
  consultoria: {
    intro:
      'Acompañamos a empresas, organizaciones y equipos directivos en procesos de transformación estratégica con foco en resultados sostenibles.',
    stats: [
      { valor: '360°', etiqueta: 'Visión integral' },
      { valor: '4', etiqueta: 'Fases de trabajo' },
      { valor: 'B2B', etiqueta: 'Foco empresarial' },
    ],
    valueProps: [
      {
        icon: Target,
        title: 'Diagnóstico organizacional',
        body: 'Mapeamos el estado actual: estructura, procesos, cultura y oportunidades de mejora.',
      },
      {
        icon: Compass,
        title: 'Diseño estratégico',
        body: 'Construimos hojas de ruta accionables alineadas con la realidad y los recursos del cliente.',
      },
      {
        icon: ClipboardCheck,
        title: 'Implementación acompañada',
        body: 'No entregamos un PDF y nos vamos. Acompañamos la ejecución hasta ver el cambio.',
      },
      {
        icon: Users,
        title: 'Programas de liderazgo',
        body: 'Formación para juntas directivas y equipos de alta dirección.',
      },
    ],
    proceso: [
      {
        numero: '01',
        title: 'Escuchar',
        body: 'Sesiones de discovery con líderes y equipos clave.',
      },
      {
        numero: '02',
        title: 'Diagnosticar',
        body: 'Análisis cualitativo y cuantitativo, devolución honesta.',
      },
      {
        numero: '03',
        title: 'Acompañar',
        body: 'Ejecución conjunta, métricas y ajustes en el camino.',
      },
    ],
    ctaTitle: '¿Tu organización está en un punto de inflexión?',
    ctaBody: 'Conversemos. Una primera reunión exploratoria sin compromiso para entender el reto.',
    cierre: 'El criterio que se construye acá se nota en cada decisión de junta directiva.',
    labAngle:
      'Diagnósticos, escenarios y modelos de decisión potenciados con la IA de ICONE ialabs.',
  },
  turismo: {
    intro:
      'Diseñamos experiencias de viaje con propósito: aprendizaje, conexión humana y respeto por los territorios.',
    stats: [
      { valor: '🇨🇴', etiqueta: 'Foco Colombia' },
      { valor: '✦', etiqueta: 'Curado a mano' },
      { valor: '3', etiqueta: 'Pilares de diseño' },
    ],
    valueProps: [
      {
        icon: MapPin,
        title: 'Diseño de experiencias',
        body: 'Itinerarios construidos con criterio editorial, no plantillas.',
      },
      {
        icon: Compass,
        title: 'Operación in-situ',
        body: 'Logística, alianzas locales y acompañamiento durante el viaje.',
      },
      {
        icon: ShieldCheck,
        title: 'Turismo responsable',
        body: 'Trabajamos con comunidades anfitrionas y operadores éticos.',
      },
    ],
    proceso: [
      { numero: '01', title: 'Inspirar', body: 'Propuesta a medida según el grupo.' },
      { numero: '02', title: 'Operar', body: 'Reservas, logística y guías.' },
      { numero: '03', title: 'Cerrar', body: 'Retorno, memoria y comunidad.' },
    ],
    ctaTitle: '¿Quieres viajar con la fundación?',
    ctaBody:
      'Próximas salidas y cupos abiertos llegan a este sitio en cuanto el calendario esté listo.',
    cierre: 'Salir del entorno habitual destraba la cabeza para volver a decidir mejor.',
    labAngle:
      'Itinerarios, logística y experiencias diseñados y optimizados con la IA de ICONE ialabs.',
  },
  eventos: {
    intro:
      'Producimos encuentros que conectan personas y proyectos: jornadas corporativas, lanzamientos, foros y celebraciones.',
    stats: [
      { valor: 'Pro', etiqueta: 'Producción' },
      { valor: 'B2B', etiqueta: 'Y B2C' },
      { valor: '360°', etiqueta: 'Servicio integral' },
    ],
    valueProps: [
      {
        icon: Megaphone,
        title: 'Producción integral',
        body: 'De la idea al cierre: concepto, logística, proveedores, montaje.',
      },
      {
        icon: Sparkles,
        title: 'Curaduría de contenido',
        body: 'Programación con voceros y experiencias que dejan huella.',
      },
      {
        icon: Package,
        title: 'Gestión de proveedores',
        body: 'Red de aliados de confianza para escalar sin perder calidad.',
      },
    ],
    proceso: [
      { numero: '01', title: 'Brief', body: 'Objetivos, audiencia y métricas.' },
      { numero: '02', title: 'Diseño', body: 'Concepto, formato, programación.' },
      { numero: '03', title: 'Ejecución', body: 'Producción en cancha y reporte final.' },
    ],
    ctaTitle: '¿Tienes un evento en mente?',
    ctaBody: 'Cuéntanos la idea y te respondemos con una propuesta inicial.',
    cierre: 'Las mejores decisiones casi siempre nacen de la conversación correcta.',
    labAngle: 'Convocatoria, contenido y producción amplificados con la IA de ICONE ialabs.',
  },
  emprendimiento: {
    intro:
      'Acompañamos a personas con ideas en etapa temprana: estructuración del modelo, validación con mercado y conexión con red.',
    stats: [
      { valor: '0→1', etiqueta: 'Etapa temprana' },
      { valor: 'Red', etiqueta: 'De mentores' },
      { valor: 'CO', etiqueta: 'Foco local' },
    ],
    valueProps: [
      {
        icon: Lightbulb,
        title: 'Mentoría',
        body: 'Sesiones uno a uno con personas que ya recorrieron el camino.',
      },
      {
        icon: Network,
        title: 'Conexión con red',
        body: 'Vínculos con inversionistas, aliados y primeros clientes.',
      },
      {
        icon: Route,
        title: 'Ruta de validación',
        body: 'De la idea al primer cliente, sin saltarse los pasos clave.',
      },
    ],
    proceso: [
      { numero: '01', title: 'Postular', body: 'Convocatoria abierta por cohortes.' },
      { numero: '02', title: 'Construir', body: 'Mentoría, talleres y revisiones.' },
      { numero: '03', title: 'Lanzar', body: 'Primer cliente, primera venta, siguiente paso.' },
    ],
    ctaTitle: '¿Tienes una idea que quiere ser empresa?',
    ctaBody: 'Próxima cohorte: la abrimos a través de este sitio cuando esté lista.',
    cierre: 'Emprender es decidir mil veces con información incompleta. Acá se entrena.',
    labAngle:
      'Validación de ideas, análisis de mercado y prototipos acelerados con la IA de ICONE ialabs.',
  },
  rural: {
    intro:
      'Trabajamos en territorios rurales colombianos: capacitación, asociatividad y acceso a mercados para productores y familias campesinas.',
    stats: [
      { valor: '🇨🇴', etiqueta: 'Colombia rural' },
      { valor: '∞', etiqueta: 'Aliados locales' },
      { valor: '3', etiqueta: 'Líneas de trabajo' },
    ],
    valueProps: [
      {
        icon: Sprout,
        title: 'Capacitación técnica',
        body: 'Formación práctica con expertos del territorio y aliados académicos.',
      },
      {
        icon: Handshake,
        title: 'Asociatividad',
        body: 'Fortalecer organizaciones productivas para negociar mejor.',
      },
      {
        icon: Network,
        title: 'Acceso a mercados',
        body: 'Vínculos con compradores institucionales y canales urbanos.',
      },
    ],
    proceso: [
      { numero: '01', title: 'Territorio', body: 'Llegamos con aliados que ya están en zona.' },
      { numero: '02', title: 'Programa', body: 'Capacitación, herramientas, seguimiento.' },
      { numero: '03', title: 'Mercado', body: 'Encadenamientos comerciales sostenibles.' },
    ],
    ctaTitle: '¿Trabajas en lo rural?',
    ctaBody:
      'Si tienes una organización productiva, una alcaldía o un proyecto en marcha, conversemos.',
    cierre: 'Decisiones que cambian territorios, no solo balances.',
    labAngle: 'Datos, trazabilidad y acceso a mercados para el campo con la IA de ICONE ialabs.',
  },
};
