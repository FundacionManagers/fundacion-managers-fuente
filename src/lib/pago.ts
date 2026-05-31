/**
 * Configuración del pago de inscripción (paso 4) con Bold.
 *
 * Integración por "link de pago" de Bold (bold.co): no requiere claves en el
 * cliente ni servidor para firmar. Pega aquí la URL del link de pago y el valor
 * cuando estén listos; mientras `LINK` esté vacío, el botón muestra
 * "disponible pronto".
 */
export const BOLD_PAGO = {
  /** URL del link de pago generado en el panel de Bold. Vacío = aún no configurado. */
  LINK: '',
  /** Valor visible de la inscripción, ej. '$350.000 COP'. Vacío = por definir. */
  VALOR: '$1.000.000 COP',
  /** Celular de soporte (WhatsApp) para dudas de pago. */
  WHATSAPP: '573126299744',
  /**
   * Temporal: mientras no haya link de Bold, el pago se coordina por WhatsApp.
   * Poner en false cuando se configure `LINK` con el link real de Bold.
   */
  POR_WHATSAPP: true,
} as const;

/** Hay link de Bold configurado. */
export const pagoConfigurado = BOLD_PAGO.LINK.trim() !== '';
