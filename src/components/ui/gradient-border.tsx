"use client";

interface GradientBorderProps {
  children: React.ReactNode;
  className?: string;
}

export function GradientBorder({ children, className }: GradientBorderProps) {
  return (
    <div
      className={`relative animate-border-rotate rounded-xl border border-transparent ${className ?? ""}`}
      style={{
        background: `
          linear-gradient(#fff, #fff) padding-box,
          conic-gradient(from var(--border-angle), #C8102E, #F59E0B, #C8102E, #9E0C23, #C8102E) border-box
        `,
      }}
    >
      {children}
    </div>
  );
}
