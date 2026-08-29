interface LandscapeMotifProps {
  /** 'campo' = colinas + surcos de cultivo · 'montana' = cordillera. */
  variant?: 'campo' | 'montana';
  tint?: string;
}

/**
 * Motivo vectorial de paisaje, anclado al borde inferior, tenue y SIN
 * invadir el texto (vive abajo, detrás del contenido). Dibujado a mano:
 * siempre apropiado para Rural/Turismo (nunca caballos al azar).
 */
export function LandscapeMotif({ variant = 'campo', tint = '#2D7A4F' }: LandscapeMotifProps) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[42vh] overflow-hidden"
    >
      <svg
        viewBox="0 0 1440 420"
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <linearGradient id="lm-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0a0d12" />
            <stop offset="55%" stopColor="#0a0d12" stopOpacity="0" />
          </linearGradient>
        </defs>

        {variant === 'montana' ? (
          <>
            <polygon
              points="0,420 0,210 220,90 430,230 540,150 760,300 760,420"
              fill={tint}
              opacity="0.18"
            />
            <polygon
              points="600,420 600,250 820,120 1020,260 1180,170 1440,300 1440,420"
              fill={tint}
              opacity="0.13"
            />
            <circle cx="1140" cy="120" r="46" fill={tint} opacity="0.16" />
          </>
        ) : (
          <>
            {/* Colinas */}
            <path d="M0 420 V300 Q360 230 720 285 T1440 270 V420 Z" fill={tint} opacity="0.16" />
            <path d="M0 420 V340 Q420 300 860 340 T1440 330 V420 Z" fill={tint} opacity="0.2" />
            {/* Surcos de cultivo */}
            <g stroke={tint} strokeOpacity="0.22" strokeWidth="2" fill="none">
              {Array.from({ length: 9 }, (_, i) => (
                <path
                  key={i}
                  d={`M${120 + i * 150} 420 Q${720} ${360 - i * 4} ${1320 - i * 150} 420`}
                />
              ))}
            </g>
            {/* Sol bajo */}
            <circle cx="1180" cy="250" r="40" fill={tint} opacity="0.18" />
          </>
        )}

        {/* Funde el motivo con el fondo para que no invada */}
        <rect width="1440" height="420" fill="url(#lm-fade)" />
      </svg>
    </div>
  );
}
