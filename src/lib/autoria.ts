/**
 * De quién es el sitio y quién lo hizo.
 *
 * El sitio es de la Fundación Managers: lo encargó y lo paga, así que el aviso
 * de derechos va a su nombre. Que se diga quién lo diseñó y lo construyó es
 * otra cosa, la autoría, y esa no se cede con el encargo. Por eso son dos
 * líneas distintas en el pie y en los metadatos, y la firma va en segundo plano
 * frente a la marca del cliente.
 */

export const TITULAR = 'Fundación Managers';

export const AUTORIA = {
  autor: 'Ing. Jorge Hugo Pérez Gaona',
  estudio: 'ICONEialabs',
  sitio: 'https://www.iconeialabs.com',
  /** Como se escribe el sitio en pantalla: con www, nunca a secas. */
  sitioVisible: 'www.iconeialabs.com',
} as const;

/** «© 2026 Fundación Managers · Todos los derechos reservados». */
export function avisoDerechos(anio: number): string {
  return `© ${anio} ${TITULAR} · Todos los derechos reservados`;
}
