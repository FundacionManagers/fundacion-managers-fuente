import type { MetadataRoute } from 'next';
import { ES_ENSAYOS } from '@/lib/entorno';
import { SITIO } from '@/lib/rutas';

/**
 * robots.txt del sitio, que no existía: la ruta devolvía 404.
 *
 * Los paneles internos no se nombran aquí. robots.txt lo lee cualquiera, y una
 * lista de Disallow es justo la lista de direcciones que no se quería
 * enseñar. Cada panel se protege con `noindex, nofollow` en su propio HTML.
 *
 * El sitio de ensayos no se indexa entero: además va `noindex` en cada página
 * (layout), porque este archivo queda bajo /fundacion-managers-ensayos/ y los
 * buscadores solo leen el robots.txt de la raíz del dominio.
 */
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  if (ES_ENSAYOS) return { rules: { userAgent: '*', disallow: '/' } };
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${SITIO}/sitemap.xml`,
  };
}
