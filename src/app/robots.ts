import type { MetadataRoute } from 'next';
import { SITIO } from '@/lib/rutas';

/**
 * robots.txt del sitio, que no existía: la ruta devolvía 404.
 *
 * El panel de la organización ya se protege por su cuenta con
 * `noindex, nofollow` en el HTML, así que esto no cambia su privacidad. Se
 * añade el Disallow para que además no se gaste rastreo en él, y se enlaza
 * el sitemap.
 */
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/resultados/', '/inscripciones/'],
    },
    sitemap: `${SITIO}/sitemap.xml`,
  };
}
