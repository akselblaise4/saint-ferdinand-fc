"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StandingTeam {
  position: number;
  name: string;
  shortName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form?: ("W" | "D" | "L")[];
  crest?: string;
}

interface StandingsTableProps {
  teams: StandingTeam[];
  className?: string;
  title?: string;
}

const formColors = {
  W: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
  D: "bg-amber-500/20 text-amber-400 border-amber-500/40",
  L: "bg-red-500/20 text-red-400 border-red-500/40",
};

export function StandingsTable({ teams, className, title }: StandingsTableProps) {
  const sorted = [...teams].sort((a, b) => a.position - b.position);

  return (
    <div className={cn("w-full", className)}>
      {title && (
        <h3 className="font-display text-2xl md:text-3xl text-white/90 mb-6 tracking-tight">
          {title}
        </h3>
      )}
      <div className="overflow-x-auto scrollbar-hide">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-white/5 text-xs uppercase tracking-widest text-muted-foreground">
              <th className="text-left py-3 px-2 w-10">#</th>
              <th className="text-left py-3 px-2">Club</th>
              <th className="text-center py-3 px-2 w-10">PJ</th>
              <th className="text-center py-3 px-2 w-10">G</th>
              <th className="text-center py-3 px-2 w-10">E</th>
              <th className="text-center py-3 px-2 w-10">P</th>
              <th className="text-center py-3 px-2 w-14">GF</th>
              <th className="text-center py-3 px-2 w-14">GC</th>
              <th className="text-center py-3 px-2 w-14">DG</th>
              <th className="text-center py-3 px-2 w-12 font-bold text-club-red">Pts</th>
              <th className="text-left py-3 px-2 w-28 hidden md:table-cell">Últimos</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((team, i) => (
              <motion.tr
                key={team.position}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: i * 0.04, ease: [0.34, 1.56, 0.64, 1] }}
                className={cn(
                  "border-b border-white/3 transition-colors duration-200",
                  team.position <= 4
                    ? "bg-club-red/5 hover:bg-club-red/10"
                    : "hover:bg-white/5"
                )}
              >
                <td className="py-3 px-2 font-mono text-sm">
                  <span className={cn(
                    "tabular-nums",
                    team.position <= 4 ? "text-club-red font-bold" : "text-muted-foreground"
                  )}>
                    {team.position}
                  </span>
                </td>
                <td className="py-3 px-2">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold shrink-0">
                      {team.shortName?.slice(0, 2) || team.name.slice(0, 2)}
                    </span>
                    <span className="text-sm font-medium text-white/90 truncate max-w-[180px]">
                      {team.name}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-2 text-center font-mono text-sm text-muted-foreground">{team.played}</td>
                <td className="py-3 px-2 text-center font-mono text-sm text-muted-foreground">{team.won}</td>
                <td className="py-3 px-2 text-center font-mono text-sm text-muted-foreground">{team.drawn}</td>
                <td className="py-3 px-2 text-center font-mono text-sm text-muted-foreground">{team.lost}</td>
                <td className="py-3 px-2 text-center font-mono text-sm text-muted-foreground">{team.goalsFor}</td>
                <td className="py-3 px-2 text-center font-mono text-sm text-muted-foreground">{team.goalsAgainst}</td>
                <td className="py-3 px-2 text-center font-mono text-sm">{team.goalDifference > 0 ? "+" : ""}{team.goalDifference}</td>
                <td className="py-3 px-2 text-center font-mono text-sm font-bold text-club-red">{team.points}</td>
                <td className="py-3 px-2 hidden md:table-cell">
                  <div className="flex gap-1">
                    {team.form?.map((f, fi) => (
                      <span
                        key={fi}
                        className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border",
                          formColors[f]
                        )}
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
