interface Props {
  initials: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function TeamBadge({ initials, className = "", size = "md" }: Props) {
  const dim = size === "sm" ? 36 : size === "lg" ? 64 : 48;
  const font = size === "sm" ? 10 : size === "lg" ? 20 : 14;

  return (
    <svg width={dim} height={dim} viewBox="0 0 48 48" fill="none" className={className}>
      <circle cx="24" cy="24" r="22" fill="#C8102E" />
      <circle cx="24" cy="24" r="22" fill="none" stroke="#C8102E" strokeWidth="1" />
      <circle cx="24" cy="24" r="19" fill="none" stroke="white" strokeOpacity="0.3" strokeWidth="0.5" />
      <text x="24" y={font === 14 ? 26 : font === 20 ? 28 : 23}
        textAnchor="middle"
        fill="white"
        fontFamily="Bebas Neue, sans-serif"
        fontSize={font}
        dominantBaseline="central"
      >
        {initials}
      </text>
    </svg>
  );
}
