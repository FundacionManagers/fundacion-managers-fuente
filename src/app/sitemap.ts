import type { MetadataRoute } from 'next';
import { RUTAS_PUBLICAS, SITIO } from '@/lib/rutas';

/**
 * sitemap.xml del sitio, que tampoco existía: la ruta devolvía 404.
 *
 * Las rutas salen de `RUTAS_PUBLICAS`, que a su vez las deriva de los ejes y
 * de los clubes: añadir un club mete su ficha en el sitemap sin tocar esto.
 *
 * No lleva `lastModified`. El sitio se recompila cada vez que cambian los
 * datos del torneo, así que una fecha de build pondría "modificado hoy" en
 * las 27 páginas cada pocas horas, incluidas las que llevan meses igual. Un
 * dato falso es peor que ninguno.
 */
export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  return RUTAS_PUBLICAS.map(({ ruta, prioridad }) => ({
    url: `${SITIO}${ruta}`,
    changeFrequency: ruta.startsWith('/torneo') ? ('weekly' as const) : ('monthly' as const),
    priority: prioridad,
  }));
}
