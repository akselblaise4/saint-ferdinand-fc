"use client";

import { useRef } from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";

interface HoverEffectProps {
  children: React.ReactNode;
  className?: string;
}

export function HoverEffect({ children, className }: HoverEffectProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set(e.clientX - rect.left);
    y.set(e.clientY - rect.top);
  };

  const spotlightBg = useMotionTemplate`radial-gradient(300px circle at ${x}px ${y}px, rgba(212,32,48,0.1), transparent 80%)`;

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      className={`group relative overflow-hidden rounded-xl border border-white/[0.06] bg-card transition-all duration-500 hover:border-white/[0.15] ${className || ""}`}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: spotlightBg }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
