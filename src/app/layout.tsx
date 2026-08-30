import type { Metadata } from 'next';
import { bebasNeue, fredoka, inter, jakarta, jetbrainsMono, playfair } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import './globals.css';

/**
 * Dominio del sitio publicado.
 *
 * Es el que usa Next para convertir en absolutas las rutas de `canonical` y
 * de las imágenes de compartir. Antes caía a `localhost:3000` cuando no
 * había variable de entorno —que es el caso en el despliegue—, así que
 * cualquier URL absoluta habría apuntado a la máquina de quien mirara.
 */
const SITIO = new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://fundacionmanagers.com');

export const metadata: Metadata = {
  metadataBase: SITIO,
  title: {
    default: 'Fundación Managers',
    template: '%s · Fundación Managers',
  },
  description:
    'Fundación Managers: consultoría, deportes, turismo, eventos, emprendimiento y desarrollo rural bajo una sola marca.',
  // Cada página canónica a sí misma. Con `trailingSlash` activo, /torneo y
  // /torneo/ podrían contarse como dos direcciones distintas.
  alternates: { canonical: './' },
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    siteName: 'Fundación Managers',
    // Imagen por defecto de todo el sitio. Las páginas del torneo la
    // sustituyen por la suya. Sin esto, un enlace pegado en WhatsApp llega
    // con el título sobre un rectángulo gris.
    images: [
      {
        url: '/og/fundacion.jpg',
        width: 1200,
        height: 630,
        alt: 'Fundación Managers · Ocio serio para que los líderes tomen mejores decisiones',
      },
    ],
  },
  twitter: { card: 'summary_large_image' },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="es-CO"
      className={cn(
        bebasNeue.variable,
        jakarta.variable,
        playfair.variable,
        fredoka.variable,
        inter.variable,
        jetbrainsMono.variable,
      )}
    >
      <body className="min-h-dvh font-body">{children}</body>
    </html>
  );
}
