export default function Emblem({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 480"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="shield-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#CC0000" />
          <stop offset="100%" stopColor="#990000" />
        </linearGradient>
        <linearGradient id="gold-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#C9A84C" />
          <stop offset="100%" stopColor="#A8882E" />
        </linearGradient>
      </defs>

      <path
        d="M200 30 L340 110 L340 270 Q340 380 200 450 Q60 380 60 270 L60 110 Z"
        fill="white"
        stroke="url(#gold-grad)"
        strokeWidth="6"
      />

      <path
        d="M200 50 L320 120 L320 260 Q320 360 200 425 Q80 360 80 260 L80 120 Z"
        fill="url(#shield-grad)"
      />

      <path
        d="M200 170 L280 210 L280 290 Q280 360 200 395 Q120 360 120 290 L120 210 Z"
        fill="white"
        opacity="0.15"
      />

      <line x1="120" y1="220" x2="280" y2="220" stroke="url(#gold-grad)" strokeWidth="2" />
      <line x1="120" y1="310" x2="280" y2="310" stroke="url(#gold-grad)" strokeWidth="2" />

      <text
        x="200"
        y="165"
        textAnchor="middle"
        fill="white"
        fontFamily="Bebas Neue, sans-serif"
        fontSize="22"
        fontWeight="bold"
        letterSpacing="4"
      >
        SAINT
      </text>
      <text
        x="200"
        y="190"
        textAnchor="middle"
        fill="white"
        fontFamily="Bebas Neue, sans-serif"
        fontSize="16"
        letterSpacing="2"
      >
        FERDINAND
      </text>

      <text
        x="200"
        y="345"
        textAnchor="middle"
        fill="white"
        fontFamily="Geist, sans-serif"
        fontSize="28"
        fontWeight="bold"
      >
        FC
      </text>

      <text
        x="200"
        y="375"
        textAnchor="middle"
        fill="url(#gold-grad)"
        fontFamily="Geist, sans-serif"
        fontSize="11"
        fontWeight="bold"
        letterSpacing="2"
      >
        E STD. 2 0 2 4
      </text>

      <circle cx="200" cy="90" r="22" fill="url(#gold-grad)" />
      <text
        x="200"
        y="98"
        textAnchor="middle"
        fill="white"
        fontFamily="Geist, sans-serif"
        fontSize="18"
        fontWeight="bold"
      >
        ★
      </text>

      <path
        d="M200 30 L340 110 L340 270 Q340 380 200 450 Q60 380 60 270 L60 110 Z"
        fill="none"
        stroke="url(#gold-grad)"
        strokeWidth="6"
      />
    </svg>
  );
}
