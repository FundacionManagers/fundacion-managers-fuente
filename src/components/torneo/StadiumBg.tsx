interface StadiumBgProps {
  /** Tinte de color del estadio (color del club). */
  tint?: string;
  className?: string;
}

/**
 * Escena de estadio vectorial: focos, haz de luz, tribuna con público,
 * césped en perspectiva y líneas de cancha. Sustituye a la fotografía
 * (offline, on-brand) hasta tener fotos reales.
 */
export function StadiumBg({ tint = '#D4A437', className }: StadiumBgProps) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1200 600"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0b0f14" />
          <stop offset="100%" stopColor="#10141b" />
        </linearGradient>
        <radialGradient id="beam" cx="50%" cy="0%" r="80%">
          <stop offset="0%" stopColor={tint} stopOpacity="0.28" />
          <stop offset="55%" stopColor={tint} stopOpacity="0.06" />
          <stop offset="100%" stopColor={tint} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="pitch" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#163a23" />
          <stop offset="100%" stopColor="#0c1f15" />
        </linearGradient>
        <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0b0f14" stopOpacity="0" />
          <stop offset="100%" stopColor="#0b0f14" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      <rect width="1200" height="600" fill="url(#sky)" />

      {/* Tribuna superior con público (puntos) */}
      <g opacity="0.5">
        <rect x="0" y="60" width="1200" height="150" fill="#0e131a" />
        {Array.from({ length: 130 }, (_, i) => (
          <circle
            key={i}
            cx={(i * 37) % 1200}
            cy={80 + ((i * 53) % 110)}
            r="2.4"
            fill={i % 7 === 0 ? tint : '#3a4250'}
            opacity={i % 3 === 0 ? 0.9 : 0.45}
          />
        ))}
      </g>

      {/* Focos */}
      {[180, 600, 1020].map((x) => (
        <g key={x}>
          <rect x={x - 26} y="20" width="52" height="14" rx="3" fill="#2a313c" />
          <circle cx={x} cy="27" r="6" fill={tint} opacity="0.9" />
        </g>
      ))}
      {/* Haces de luz */}
      <ellipse cx="600" cy="120" rx="900" ry="320" fill="url(#beam)" />

      {/* Césped en perspectiva */}
      <polygon points="0,600 1200,600 980,260 220,260" fill="url(#pitch)" />
      {/* Franjas del césped */}
      {[0, 1, 2, 3, 4].map((i) => (
        <polygon
          key={i}
          points={`${220 + i * 152},260 ${220 + (i + 1) * 152},260 ${
            1200 - i * 120
          },600 ${1200 - (i + 1) * 120},600`}
          fill="#ffffff"
          opacity={i % 2 === 0 ? 0.04 : 0}
        />
      ))}
      {/* Línea de medio campo + círculo */}
      <line
        x1="220"
        y1="320"
        x2="980"
        y2="320"
        stroke="#ffffff"
        strokeOpacity="0.16"
        strokeWidth="2"
      />
      <ellipse
        cx="600"
        cy="430"
        rx="120"
        ry="44"
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.16"
        strokeWidth="2"
      />
      {/* Arco */}
      <rect
        x="520"
        y="246"
        width="160"
        height="34"
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.2"
        strokeWidth="2"
      />

      {/* Desvanecido inferior para legibilidad del texto */}
      <rect width="1200" height="600" fill="url(#fade)" />
    </svg>
  );
}
