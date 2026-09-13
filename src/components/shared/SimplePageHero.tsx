import { asset } from '@/lib/asset';

interface SimplePageHeroProps {
  eyebrow: string;
  title: string;
  description?: string;
  /**
   * Foto de fondo del héroe (relativa a `public/`). Sin ella el bloque queda
   * en el oscuro abstracto de siempre, que era justo el problema: blog,
   * privacidad y términos abrían con una franja negra sobre el fondo negro
   * del sitio y no se distinguía dónde empezaba la página.
   */
  image?: string;
}

export function SimplePageHero({ eyebrow, title, description, image }: SimplePageHeroProps) {
  return (
    <section className="canvas-dark spotlight grain relative overflow-hidden">
      {image ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${asset(image)}')`,
            // La foto se ve, pero el titular blanco le gana siempre: velo de
            // marca más fuerte a la izquierda, que es donde cae el texto.
            WebkitMaskImage: 'linear-gradient(to bottom, #000 0%, #000 72%, transparent 100%)',
            maskImage: 'linear-gradient(to bottom, #000 0%, #000 72%, transparent 100%)',
          }}
        />
      ) : null}
      {image ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(100deg, rgba(8,11,16,0.92) 0%, rgba(8,11,16,0.76) 42%, rgba(8,11,16,0.42) 78%, rgba(8,11,16,0.30) 100%)',
          }}
        />
      ) : (
        <div aria-hidden className="aurora pointer-events-none absolute inset-0" />
      )}
      <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-28">
        <p className="font-mono text-caption uppercase tracking-[0.3em] text-gold">{eyebrow}</p>
        <h1 className="mt-5 font-serif text-[42px] font-bold leading-[1.03] text-neutral-50 md:text-[64px]">
          {title}
        </h1>
        {description ? (
          <p className="mt-6 max-w-2xl text-lg text-neutral-300">{description}</p>
        ) : null}
      </div>
    </section>
  );
}
