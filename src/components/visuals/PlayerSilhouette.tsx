interface Props {
  number: number;
  position: string;
  className?: string;
}

export default function PlayerSilhouette({ number, position, className = "" }: Props) {
  const lineColors = position === "GK" ? "text-amber-400" :
    position === "DEF" || position === "RB" || position === "CB" ? "text-blue-400" :
    position === "MED" || position === "CM" || position === "CAM" ? "text-green-400" :
    "text-club-red";

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 200 240" className="h-full w-full">
        <defs>
          <linearGradient id={`player-grad-${number}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.15" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Player silhouette */}
        <g className={lineColors}>
          {/* Head */}
          <ellipse cx="100" cy="42" rx="20" ry="22" fill="currentColor" opacity="0.12" />
          {/* Body - jersey */}
          <path d="M70 75 Q70 65 78 62 L122 62 Q130 65 130 75 L135 140 Q135 155 115 155 L85 155 Q65 155 65 140 Z" fill="url(#player-grad-${number})" />
          {/* Arms */}
          <path d="M70 80 L50 120 L58 124 L70 90" fill="currentColor" opacity="0.08" />
          <path d="M130 80 L150 120 L142 124 L130 90" fill="currentColor" opacity="0.08" />
          {/* Shorts */}
          <rect x="72" y="155" width="56" height="30" rx="4" fill="currentColor" opacity="0.1" />
          {/* Legs */}
          <path d="M78 185 L74 235" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.12" />
          <path d="M122 185 L126 235" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.12" />
          {/* Boots */}
          <ellipse cx="73" cy="237" rx="6" ry="3" fill="currentColor" opacity="0.15" />
          <ellipse cx="127" cy="237" rx="6" ry="3" fill="currentColor" opacity="0.15" />
        </g>

        {/* Running lines */}
        <g opacity="0.06">
          <line x1="30" y1="230" x2="170" y2="230" stroke="currentColor" strokeWidth="1" />
          <line x1="40" y1="220" x2="160" y2="220" stroke="currentColor" strokeWidth="0.5" />
        </g>
      </svg>
    </div>
  );
}
