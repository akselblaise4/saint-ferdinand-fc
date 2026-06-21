"use client";

import { motion } from "framer-motion";

const items = [
  "⚽ SFC 3 - 1 Rivales | Próximo Partido: Domingo 16:00 hrs | Goleador de la liga: SFC 🏃‍♂️",
  "🏆 Líderes del Grupo A | 15 Partidos Invictos | Clásico vs Atlético este domingo",
  "📊 42 Goles a Favor | 12 En Contra | 82% de Posesión Media | Mejor Ataque",
  "🎯 Máximo Goleador: M. López (14 goles) | P. Torres lidera en asistencias (11)",
  "🔴 Saint Ferdinand FC · USS Liga Premier · Temporada 2026",
];

export function Marquee() {
  return (
    <div className="relative w-full overflow-hidden border-b border-white/[0.04] bg-surface-low/50">
      <div className="flex whitespace-nowrap">
        <motion.div
          className="flex shrink-0 gap-12 py-2.5 px-4"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 30, ease: "linear", repeat: Infinity }}
        >
          {[...items, ...items].map((text, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-2 text-xs font-medium tracking-wide text-muted-foreground/70"
            >
              <span className="size-1.5 rounded-full bg-club-red" />
              {text}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
