import { asset } from '@/lib/asset';

interface TorneoBackdropProps {
  /** Color de marca / club. */
  tint?: string;
  /**
   * Ruta de la foto (relativa a `public/`). Default: estadio panorámico del
   * hero. Las páginas de equipo pasan su propia foto por slug para que cada
   * club tenga un fondo distinto. SIEMPRE archivo local, nunca CDN externo.
   */
  image?: string;
}

/**
 * Fondo fotográfico del torneo: estadio real a página completa, de lado a
 * lado y todo el alto. `absolute` sobre contenedor `relative` (full-bleed
 * sin el bug de `fixed` recortado). Tratamiento de marca encima para
 * cohesión y legibilidad.
 *
 * La foto vive en `public/fotos/torneo-estadio.jpg` (servida local, NO
 * desde un CDN externo). Antes venía de loremflickr con ?lock=77 y un día
 * ese servidor empezó a devolver otra imagen → el ambiente se "dañó" solo
 * sin tocar el código. Por eso ahora es un archivo fijo del repo. Para
 * cambiar la foto, reemplazar ESE archivo (mismo nombre); no volver a CDNs.
 */
export function TorneoBackdrop({
  tint = '#D4A437',
  image = '/fotos/torneo-estadio.jpg',
}: TorneoBackdropProps) {
  const url = asset(image);
  return (
    <div aria-hidden className="absolute inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[#0a0d12]" />
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('${url}')`,
          filter: 'grayscale(0.12) contrast(1.14) brightness(0.78) saturate(1.05)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(60% 45% at 75% 0%, ${tint}33 0%, transparent 60%),
                       radial-gradient(70% 60% at 50% 115%, ${tint}26 0%, transparent 60%)`,
        }}
      />
      <div className="absolute inset-0 bg-[#0a0d12]/45" />
      <div
        className="absolute inset-0 opacity-[0.4] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")",
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_40%,transparent_45%,rgba(0,0,0,0.7)_100%)]" />
    </div>
  );
}
