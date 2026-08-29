interface PlayerAvatarProps {
  color: string;
  numero: number;
  size?: number;
}

/**
 * Silueta de jugador con camiseta del color del club y dorsal.
 * Placeholder vectorial hasta tener fotos reales de plantel.
 */
export function PlayerAvatar({ color, numero, size = 96 }: PlayerAvatarProps) {
  const id = `pa-${color.replace('#', '')}-${numero}`;
  return (
    <svg
      role="img"
      aria-label={`Jugador ${numero}`}
      viewBox="0 0 100 110"
      width={size}
      height={(size * 110) / 100}
      className="shrink-0"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1b2129" />
          <stop offset="100%" stopColor="#0c1015" />
        </linearGradient>
      </defs>
      <rect width="100" height="110" rx="14" fill={`url(#${id})`} />
      {/* Cabeza */}
      <circle cx="50" cy="34" r="16" fill="#222a33" />
      {/* Camiseta */}
      <path
        d="M22 104 V64 C22 52 31 46 38 44 L50 50 L62 44 C69 46 78 52 78 64 V104 Z"
        fill={color}
      />
      {/* Hombros/sombra */}
      <path d="M22 104 V64 C22 56 26 51 31 48 L31 104 Z" fill="#000" opacity="0.18" />
      {/* Dorsal */}
      <text
        x="50"
        y="92"
        textAnchor="middle"
        fontFamily="var(--font-display-sport), Impact, sans-serif"
        fontSize="26"
        fill="#fff"
        opacity="0.92"
      >
        {numero}
      </text>
    </svg>
  );
}
