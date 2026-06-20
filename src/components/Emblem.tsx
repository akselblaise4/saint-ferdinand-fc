export default function Emblem({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  if (compact) {
    return (
      <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="60" cy="60" r="56" fill="#C8102E" stroke="#C9A84C" strokeWidth="3" />
        <circle cx="60" cy="60" r="46" fill="none" stroke="white" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.3" />
        <text x="60" y="56" textAnchor="middle" fill="white" fontFamily="'Bebas Neue',sans-serif" fontSize="28" letterSpacing="3">SF</text>
        <text x="60" y="76" textAnchor="middle" fill="#C9A84C" fontFamily="'Geist',sans-serif" fontSize="10" letterSpacing="2" fontWeight="bold">FC</text>
        <circle cx="60" cy="18" r="8" fill="#C9A84C" />
        <text x="60" y="24" textAnchor="middle" fill="white" fontSize="10">★</text>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 400 480" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D41632" />
          <stop offset="100%" stopColor="#A01024" />
        </linearGradient>
        <linearGradient id="gg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#D4AF37" />
          <stop offset="50%" stopColor="#C9A84C" />
          <stop offset="100%" stopColor="#A8882E" />
        </linearGradient>
      </defs>

      <path d="M200 28 L345 108 L345 275 Q345 385 200 455 Q55 385 55 275 L55 108 Z" fill="white" stroke="url(#gg)" strokeWidth="5" />
      <path d="M200 46 L325 116 L325 268 Q325 370 200 435 Q75 370 75 268 L75 116 Z" fill="url(#sg)" />
      <path d="M200 120 L295 165 L295 235 Q295 310 200 350 Q105 310 105 235 L105 165 Z" fill="white" opacity="0.08" />

      <line x1="105" y1="195" x2="295" y2="195" stroke="url(#gg)" strokeWidth="1.5" />
      <line x1="105" y1="290" x2="295" y2="290" stroke="url(#gg)" strokeWidth="1.5" />

      <text x="200" y="115" textAnchor="middle" fill="white" fontFamily="'Bebas Neue',sans-serif" fontSize="28" letterSpacing="6" fontWeight="bold">SAINT</text>
      <text x="200" y="150" textAnchor="middle" fill="white" fontFamily="'Bebas Neue',sans-serif" fontSize="20" letterSpacing="4">FERDINAND</text>

      <text x="200" y="325" textAnchor="middle" fill="white" fontFamily="'Geist',sans-serif" fontSize="36" fontWeight="bold" letterSpacing="2">FC</text>
      <text x="200" y="358" textAnchor="middle" fill="url(#gg)" fontFamily="'Geist',sans-serif" fontSize="11" fontWeight="bold" letterSpacing="3">EST. 2024</text>

      <circle cx="200" cy="85" r="24" fill="url(#gg)" />
      <text x="200" y="94" textAnchor="middle" fill="white" fontSize="20" fontFamily="'Geist',sans-serif">★</text>

      <path d="M200 28 L345 108 L345 275 Q345 385 200 455 Q55 385 55 275 L55 108 Z" fill="none" stroke="url(#gg)" strokeWidth="5" />
    </svg>
  );
}
