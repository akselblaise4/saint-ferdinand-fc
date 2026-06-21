"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface PlayerOnField {
  number: number;
  name: string;
  position: string;
  x: number;
  y: number;
  isCaptain?: boolean;
}

interface FormationProps {
  formation: string;
  players: PlayerOnField[];
  className?: string;
  animated?: boolean;
}

const formations: Record<string, { rows: number[]; label: string }> = {
  "4-3-3": { rows: [4, 3, 3], label: "4-3-3" },
  "4-4-2": { rows: [4, 4, 2], label: "4-4-2" },
  "4-2-3-1": { rows: [4, 2, 3, 1], label: "4-2-3-1" },
  "3-5-2": { rows: [3, 5, 2], label: "3-5-2" },
  "3-4-3": { rows: [3, 4, 3], label: "3-4-3" },
  "5-3-2": { rows: [5, 3, 2], label: "5-3-2" },
  "4-1-4-1": { rows: [4, 1, 4, 1], label: "4-1-4-1" },
};

export function Formation({ formation, players, className, animated = true }: FormationProps) {
  const f = formations[formation] || formations["4-3-3"];

  const positionedPlayers = useMemo(() => {
    const result: PlayerOnField[] = [];
    let idx = 0;
    const rows = [1, ...f.rows]; // goalkeeper row

    for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
      const count = rows[rowIdx];
      for (let colIdx = 0; colIdx < count; colIdx++) {
        if (idx < players.length) {
          const player = players[idx];
          const x = (colIdx + 0.5) / count;
          const y = (rowIdx + 0.5) / rows.length;
          result.push({ ...player, x, y });
          idx++;
        }
      }
    }
    return result;
  }, [players, f]);

  return (
    <div className={cn("relative w-full aspect-[3/4] max-w-[400px] mx-auto rounded-2xl overflow-hidden", className)}>
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/80 via-emerald-900/60 to-emerald-950/80 rounded-2xl" />
      <svg className="absolute inset-0 w-full h-full opacity-[0.08]" viewBox="0 0 100 130" preserveAspectRatio="xMidYMid meet">
        <rect x="5" y="5" width="90" height="120" rx="4" fill="none" stroke="white" strokeWidth="0.5" />
        <line x1="50" y1="5" x2="50" y2="125" stroke="white" strokeWidth="0.3" />
        <circle cx="50" cy="65" r="20" fill="none" stroke="white" strokeWidth="0.3" />
        <rect x="25" y="0" width="50" height="15" rx="7" fill="none" stroke="white" strokeWidth="0.3" />
        <rect x="25" y="115" width="50" height="15" rx="7" fill="none" stroke="white" strokeWidth="0.3" />
        <circle cx="50" cy="65" r="2" fill="white" />
      </svg>

      <div className="absolute inset-0">
        <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.3em] text-white/30 font-mono">
          {f.label}
        </span>
        {positionedPlayers.map((player, i) => (
          <motion.div
            key={i}
            className="absolute flex flex-col items-center"
            style={{ left: `${player.x * 100}%`, top: `${player.y * 100}%`, transform: "translate(-50%, -50%)" }}
            initial={animated ? { opacity: 0, scale: 0 } : undefined}
            animate={animated ? { opacity: 1, scale: 1 } : undefined}
            transition={{ delay: 0.3 + i * 0.06, type: "spring", stiffness: 200, damping: 20 }}
          >
            <div className={cn(
              "w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center",
              "bg-card/80 backdrop-blur-md border-2 border-white/15",
              "shadow-lg text-sm",
              player.isCaptain && "border-club-gold/60 bg-club-gold/10"
            )}>
              <span className="font-mono text-xs md:text-sm font-bold text-white">{player.number}</span>
            </div>
            <span className="text-[9px] md:text-[10px] uppercase tracking-wider text-white/70 mt-1 truncate max-w-[70px] text-center font-mono">
              {player.name}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
