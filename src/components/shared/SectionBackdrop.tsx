import { asset } from '@/lib/asset';

interface SectionBackdropProps {
  /** Color de marca de la sección. */
  tint?: string;
  /**
   * Foto de fondo de la sección (relativa a `public/`). Va MUY difuminada
   * + capa oscura → se convierte en atmósfera de color/escena, no en una
   * imagen literal. Archivo local siempre. Si se omite, queda el fondo
   * abstracto de siempre (caso Managers Lab / alianza).
   */
  image?: string;
  /**
   * `true` = banner ANCHO (gran angular, franja baja) para fotos de escena
   * tipo paisaje. `false`/omitido = modo ALTO original (foto cubre el hero
   * a `88vh`), el que se ve nítido y genial en Home/Consultoría/Nosotros.
   */
  wide?: boolean;
}

/**
 * Fondo cinemático ABSTRACTO a página completa, de lado a lado y todo el
 * alto. Capas de luz + degradado de marca + grano sobre carbón profundo.
 * Sin fotos de stock (evita imágenes inapropiadas). Controlado y premium.
 *
 * `absolute inset-0` sobre un contenedor `relative` que envuelve toda la
 * página → cubre el 100% real sin el bug de `fixed` recortado.
 */
export function SectionBackdrop({ tint = '#D4A437', image, wide }: SectionBackdropProps) {
  const grain =
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")";

  // CON FOTO: la imagen DEBE verse (difuminada, atmósfera). Tratamiento
  // ligero + solo un velo de marca y viñeta suaves para legibilidad. NO
  // se apilan los halos/veladura opacos (tapaban la foto por completo).
  if (image) {
    return (
      <div aria-hidden className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[#0a0d12]" />
        {/* Foto NÍTIDA anclada arriba (zona del hero), se funde hacia el
            oscuro de marca abajo → cubre páginas largas sin pixelar ni
            estirar una franja fina a toda la altura. */}
        <div
          className={
            wide
              ? 'absolute inset-x-0 top-0 aspect-[16/3] min-h-[340px] bg-cover bg-center'
              : 'absolute inset-x-0 top-0 h-[88vh] min-h-[560px] bg-cover bg-center'
          }
          style={{
            backgroundImage: `url('${asset(image)}')`,
            filter: wide ? 'saturate(1.08) brightness(0.96)' : 'saturate(1.1) brightness(0.94)',
            WebkitMaskImage: wide
              ? 'linear-gradient(to bottom, #000 0%, #000 64%, transparent 100%)'
              : 'linear-gradient(to bottom, #000 0%, #000 60%, transparent 100%)',
            maskImage: wide
              ? 'linear-gradient(to bottom, #000 0%, #000 64%, transparent 100%)'
              : 'linear-gradient(to bottom, #000 0%, #000 60%, transparent 100%)',
          }}
        />
        {/* Scrim de marca: oscurece la izquierda (texto legible), la foto
            se ve limpia a la derecha. Tinte muy sutil para cohesión. */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(100deg, rgba(8,11,16,0.74) 0%, rgba(8,11,16,0.30) 40%, rgba(8,11,16,0.06) 72%, rgba(8,11,16,0) 100%),
                         radial-gradient(70% 60% at 82% 0%, ${tint}1c 0%, transparent 62%)`,
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.14] mix-blend-overlay"
          style={{ backgroundImage: grain }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(130%_100%_at_50%_40%,transparent_64%,rgba(0,0,0,0.40)_100%)]" />
      </div>
    );
  }

  // SIN FOTO (Managers Lab / alianza): fondo abstracto de marca de siempre.
  return (
    <div aria-hidden className="absolute inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[#0a0d12]" />
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(60% 50% at 80% 0%, ${tint}33 0%, transparent 60%),
                       radial-gradient(50% 45% at 12% 18%, ${tint}1f 0%, transparent 55%),
                       radial-gradient(70% 60% at 50% 110%, ${tint}26 0%, transparent 60%)`,
        }}
      />
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background: `linear-gradient(125deg, ${tint}14 0%, transparent 40%, #00000055 100%)`,
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.5] mix-blend-overlay"
        style={{ backgroundImage: grain }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_40%,transparent_45%,rgba(0,0,0,0.65)_100%)]" />
    </div>
  );
}
