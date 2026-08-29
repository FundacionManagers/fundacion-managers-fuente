import Image from 'next/image';
import { Star } from 'lucide-react';
import { asset } from '@/lib/asset';
import { getEquipo } from '@/lib/torneo-data';

interface TeamCrestProps {
  slug: string | null;
  size?: number;
  /** Muestra estrellas por títulos bajo el escudo. */
  showStars?: boolean;
}

/**
 * Escudo de club: logo OFICIAL montado sobre una "valla blanca" (panel
 * crema redondeado) con halo de luz tipo reflector atrás. Es como si
 * cada equipo tuviera su cartel iluminado en el estadio.
 *
 * Por qué así (Jorge, mayo 2026): los logos fueron diseñados para fondo
 * blanco. Sobre el fondo oscuro del sitio, los elementos oscuros del
 * logo (Useche, contornos de Alianza/TP, ball pattern) se perdían. La
 * valla blanca devuelve a cada logo su entorno nativo de contraste, y
 * el reflector lo integra cinematográficamente con la paleta del sitio.
 *
 * - Equipos normales: valla blanca + halo cálido + ring sutil dorado.
 * - Campeones: valla blanca + halo dorado intenso + ring dorado más visible
 *   + una estrella por título. Quién es campeón no se decide aquí: sale de
 *   `titulos`, que se cuenta sobre las finales publicadas.
 */
export function TeamCrest({ slug, size = 56, showStars = false }: TeamCrestProps) {
  const eq = slug ? getEquipo(slug) : undefined;
  const titulos = eq?.titulos ?? 0;
  const champion = titulos > 0;
  const starSize = Math.max(11, Math.round(size * 0.2));

  if (!eq) {
    return (
      <div
        aria-label="Por definir"
        className="inline-flex shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/5 font-mono text-neutral-400"
        style={{ width: size, height: size, fontSize: size * 0.34 }}
      >
        ?
      </div>
    );
  }

  // Halo (reflector) detrás de la valla. Más intenso para campeón.
  const haloGradient = champion
    ? 'radial-gradient(circle, rgba(245,200,90,0.55) 0%, rgba(212,164,55,0.30) 30%, rgba(212,164,55,0.10) 58%, transparent 78%)'
    : 'radial-gradient(circle, rgba(255,247,225,0.42) 0%, rgba(255,236,180,0.18) 35%, rgba(255,236,180,0.05) 62%, transparent 80%)';

  const haloPx = Math.round(size * 1.5);
  const haloOffset = Math.round((size - haloPx) / 2);

  // Radio de la valla escalado al tamaño (esquinas más redondas en chico).
  const radius = Math.max(8, Math.round(size * 0.16));

  return (
    <div className="inline-flex shrink-0 flex-col items-center">
      <div
        className="relative inline-flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        {/* Reflector (halo) detrás de todo */}
        <span
          aria-hidden
          className="pointer-events-none absolute"
          style={{
            width: haloPx,
            height: haloPx,
            left: haloOffset,
            top: haloOffset,
            background: haloGradient,
            filter: 'blur(12px)',
            borderRadius: '50%',
          }}
        />

        {/* Valla blanca (cartel) */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            borderRadius: radius,
            background: 'linear-gradient(180deg, #ffffff 0%, #f4efe6 100%)',
            boxShadow: champion
              ? '0 10px 24px rgba(0,0,0,0.45), inset 0 0 0 2px rgba(212,164,55,0.95), inset 0 0 0 4px rgba(255,255,255,0.65)'
              : '0 8px 18px rgba(0,0,0,0.40), inset 0 0 0 1px rgba(212,164,55,0.55)',
          }}
        />

        {/* Logo encima de la valla */}
        <Image
          src={asset(`/escudos/${eq.slug}.png`)}
          alt={`Escudo ${eq.nombre}`}
          width={size}
          height={size}
          className="relative block h-full w-full object-contain"
          style={{ padding: Math.round(size * 0.08) }}
        />
      </div>

      {showStars && champion ? (
        <div
          aria-hidden
          className="flex items-center gap-1"
          style={{ marginTop: Math.round(size * 0.08) }}
        >
          {Array.from({ length: Math.min(titulos, 3) }, (_, i) => (
            <Star
              key={i}
              size={starSize}
              className="fill-amarillo text-amarillo drop-shadow-[0_2px_6px_rgba(212,164,55,0.55)]"
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
