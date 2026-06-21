"use client";

interface BorderBeamProps {
  className?: string;
  duration?: number;
  colorFrom?: string;
  colorTo?: string;
  size?: number;
}

export function BorderBeam({
  className,
  duration = 4,
  colorFrom = "#D42030",
  colorTo = "#CEAB5D",
  size = 160,
}: BorderBeamProps) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] ${className || ""}`}
      style={{ maskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)", WebkitMaskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)" }}
    >
      <div
        className="absolute inset-0"
        style={{
          width: size,
          height: size,
          background: `conic-gradient(from 0deg, transparent, ${colorFrom}, transparent 30%, ${colorTo}, transparent 60%, transparent)`,
          animation: `border-beam-spin ${duration}s linear infinite`,
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />
    </div>
  );
}
