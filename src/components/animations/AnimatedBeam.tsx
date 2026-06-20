"use client";

import { motion } from "framer-motion";

interface AnimatedBeamProps {
  className?: string;
  color?: string;
  duration?: number;
}

export function AnimatedBeam({
  className,
  color = "rgba(200, 16, 46, 0.15)",
  duration = 8,
}: AnimatedBeamProps) {
  return (
    <motion.div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}
      aria-hidden
    >
      <motion.div
        className="absolute -inset-4"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${color} 50%, transparent 100%)`,
          WebkitMaskImage:
            "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.4) 30%, rgba(0,0,0,0.8) 50%, rgba(0,0,0,0.4) 70%, transparent 100%)",
          maskImage:
            "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.4) 30%, rgba(0,0,0,0.8) 50%, rgba(0,0,0,0.4) 70%, transparent 100%)",
        }}
        animate={{
          x: ["-100%", "100%"],
        }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </motion.div>
  );
}