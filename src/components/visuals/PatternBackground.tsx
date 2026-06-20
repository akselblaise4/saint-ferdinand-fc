export default function PatternBackground({ variant = "stripes", className = "" }: { variant?: string; className?: string }) {
  if (variant === "dots") {
    return (
      <svg className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} viewBox="0 0 200 200" preserveAspectRatio="none">
        <defs>
          <pattern id="dots" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
            <circle cx="15" cy="15" r="1.5" fill="currentColor" opacity="0.15" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>
    );
  }

  if (variant === "diagonal") {
    return (
      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 200 200" preserveAspectRatio="none">
        <defs>
          <pattern id="diag" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="40" stroke="currentColor" strokeWidth="1" opacity="0.08" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#diag)" />
      </svg>
    );
  }

  if (variant === "shield") {
    return (
      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice">
        <g opacity="0.04">
          <path d="M200 30 L340 110 L340 270 Q340 380 200 450 Q60 380 60 270 L60 110 Z" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M200 60 L310 125 L310 260 Q310 350 200 410 Q90 350 90 260 L90 125 Z" fill="none" stroke="currentColor" strokeWidth="1" />
        </g>
      </svg>
    );
  }

  return null;
}
