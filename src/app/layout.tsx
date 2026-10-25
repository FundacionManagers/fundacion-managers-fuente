import type { Metadata } from 'next';
import { AvisoEnsayos } from '@/components/shared/AvisoEnsayos';
import { ES_ENSAYOS } from '@/lib/entorno';
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
  // Es el texto que Google muestra bajo el título. Anunciaba seis frentes
  // —turismo, consultoría y desarrollo rural entre ellos— que ya no se
  // muestran en el sitio: quien llegara buscándolos no encontraría nada. Se
  // deja lo que la fundación sí ofrece hoy, en el orden del menú.
  description:
    'Ocio serio para que los líderes tomen mejores decisiones. Torneo Managers F7, emprendimiento y eventos, con la inteligencia artificial de Managers Lab.',
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
  // La réplica de ensayos no debe aparecer en un buscador: tiene datos de
  // prueba y un canonical que apunta a la web real no basta para sacarla.
  ...(ES_ENSAYOS ? { robots: { index: false, follow: false } } : {}),
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
/**
 * Ojo con la lista de exenciones: `/resultados/` monta su propia puerta y
 * escucha `onAuthStateChange`, asi que el cliente de Supabase consume el
 * fragmento solo. Reenviarla rompia su acceso por enlace al correo —el
 * enlace mágico volvia a `/resultados/#access_token=…` y este script lo
 * sacaba de ahi antes de pintar—, y dejaba sin ninguna forma de entrar a
 * quien no hubiera fijado contrasena.
 *
 * Sin expresion regular a proposito: esto vive dentro de una plantilla de
 * JavaScript, y la plantilla se come la barra invertida de `\/`. El script
 * salia al HTML como `/^/resultados(/|$)/`, que es un error de sintaxis, y
 * mataba el reenvio entero sin que nada lo avisara. Dos comparaciones de
 * cadena no se pueden romper asi.
 *
 * Las rutas llevan el basePath. En ensayos el panel vive en
 * /fundacion-managers-ensayos/resultados/: comparado contra '/resultados/', el
 * enlace mágico salía del panel hacia jorgeicone.github.io/panel.html —un 404
 * de otro sitio— con el token de la sesión en la URL.
 */
const BASE = JSON.stringify(process.env.NEXT_PUBLIC_BASE_PATH ?? '');
const REENVIO_AUTH = `(function(){try{
var h=location.hash||'';
if(!/(^|[#&])(access_token|error_code|error_description)=/.test(h))return;
var b=${BASE};
var p=location.pathname;
if(p.indexOf('panel.html')>-1)return;
if(p===b+'/resultados/'||p===b+'/resultados')return;
location.replace(b+'/panel.html'+h);
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
      <body className="min-h-dvh font-body">
        {/* Va en el layout raíz, no en el del torneo: el aviso tiene que
            salir en TODAS las páginas de la réplica, el panel incluido. */}
        <AvisoEnsayos />
        {children}
      </body>
    </html>
  );
}
