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

/**
 * Reenvío de los enlaces de autenticación al panel.
 *
 * Cuando alguien pide recuperar su contraseña, Supabase manda un correo cuyo
 * enlace vuelve al sitio con un token —o con un error— en el fragmento de la
 * URL. Si la dirección del panel no está en las Redirect URLs del proyecto,
 * Supabase ignora el destino pedido y usa la Site URL, que es la portada: la
 * persona aterriza en el home con un `#error=…` colgando y sin manera de
 * cambiar nada.
 *
 * Esto lo corrige del lado del sitio. Si llega un fragmento de autenticación a
 * cualquier página que no sea el panel, se reenvía al panel tal cual, con
 * `replace` para no dejar la portada en el historial. Así el flujo funciona
 * incluso con la configuración de Supabase sin tocar.
 *
 * Va inline en el <head> para que corra antes de pintar: nadie alcanza a ver
 * la página equivocada.
 */
const REENVIO_AUTH = `(function(){try{
var h=location.hash||'';
if(!/(^|[#&])(access_token|error_code|error_description)=/.test(h))return;
if(location.pathname.indexOf('panel.html')>-1)return;
location.replace('/panel.html'+h);
}catch(e){}})();`;

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
      <head>
        <script dangerouslySetInnerHTML={{ __html: REENVIO_AUTH }} />
      </head>
      <body className="min-h-dvh font-body">{children}</body>
    </html>
  );
}
