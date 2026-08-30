/**
 * Las rutas públicas del sitio, para robots.txt y sitemap.xml.
 *
 * La lista NO se escribe a mano: los ejes salen de `EJES` y las fichas de
 * club de `EQUIPOS`, que son las mismas fuentes de las que sale la
 * navegación. Así, añadir un eje o un club lo mete en el sitemap solo, sin
 * que nadie tenga que acordarse.
 *
 * Fuera quedan a propósito las rutas del panel de la organización
 * (/resultados/, /inscripciones/), que además llevan `noindex`.
 */

import { EJES } from './navigation';
import { EQUIPOS } from './torneo-data';

export const SITIO = process.env.NEXT_PUBLIC_APP_URL ?? 'https://fundacionmanagers.com';

/** Páginas fijas, con su prioridad relativa para el buscador. */
const FIJAS: { ruta: string; prioridad: number }[] = [
  { ruta: '/', prioridad: 1 },
  { ruta: '/torneo/', prioridad: 0.9 },
  { ruta: '/torneo/calendario/', prioridad: 0.8 },
  { ruta: '/torneo/equipos/', prioridad: 0.8 },
  { ruta: '/torneo/estadisticas/', prioridad: 0.8 },
  { ruta: '/torneo/palmares/', prioridad: 0.7 },
  { ruta: '/torneo/bracket/', prioridad: 0.7 },
  { ruta: '/torneo/inscripciones/', prioridad: 0.9 },
  { ruta: '/nosotros/', prioridad: 0.7 },
  { ruta: '/alianza/', prioridad: 0.5 },
  { ruta: '/contacto/', prioridad: 0.5 },
  { ruta: '/blog/', prioridad: 0.4 },
  { ruta: '/privacidad/', prioridad: 0.2 },
  { ruta: '/terminos/', prioridad: 0.2 },
];

export interface RutaPublica {
  ruta: string;
  prioridad: number;
}

export const RUTAS_PUBLICAS: readonly RutaPublica[] = [
  ...FIJAS,
  // Los cinco ejes que tienen página propia. 'torneo' se excluye porque su
  // página no es /torneo (eje) sino la sección completa, ya listada arriba.
  ...EJES.filter((e) => e.slug !== 'torneo').map((e) => ({
    ruta: `/${e.slug}/`,
    prioridad: 0.6,
  })),
  // La ficha de cada club.
  ...EQUIPOS.map((e) => ({ ruta: `/torneo/equipos/${e.slug}/`, prioridad: 0.6 })),
];
