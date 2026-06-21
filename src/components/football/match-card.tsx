"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

interface MatchCardProps {
  homeTeam: string;
  awayTeam: string;
  homeCrest?: string;
  awayCrest?: string;
  homeScore?: number;
  awayScore?: number;
  date: string;
  time?: string;
  venue?: string;
  competition?: string;
  stage?: string;
  status?: "scheduled" | "live" | "finished" | "postponed";
  className?: string;
  index?: number;
}

const statusStyles = {
  scheduled: "border-white/5",
  live: "border-club-red/60 bg-club-red/5 animate-pulse-soft",
  finished: "border-white/8",
  postponed: "border-amber-500/30 bg-amber-500/5",
};

const badgeStyles = {
  scheduled: "bg-white/5 text-muted-foreground",
  live: "bg-club-red text-white font-bold",
  finished: "bg-white/5 text-muted-foreground",
  postponed: "bg-amber-500/20 text-amber-400",
};

const statusLabels = {
  scheduled: "PROXIMAMENTE",
  live: "EN VIVO",
  finished: "FINALIZADO",
  postponed: "APLAZADO",
};

export function MatchCard({
  homeTeam,
  awayTeam,
  homeCrest,
  awayCrest,
  homeScore,
  awayScore,
  date,
  time,
  venue,
  competition,
  stage,
  status = "scheduled",
  className,
  index = 0,
}: MatchCardProps) {
  const parsedDate = parseISO(date);
  const isLive = status === "live";
  const isFinished = status === "finished";
  const showScore = isLive || isFinished;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.34, 1.56, 0.64, 1] }}
      className={cn(
        "group relative rounded-2xl overflow-hidden",
        "glass bg-card/40 backdrop-blur-xl",
        "border transition-all duration-300",
        statusStyles[status],
        "hover:border-club-red/40 hover:shadow-[0_8px_32px_-8px_rgba(212,32,48,0.12)]",
        className
      )}
    >
      <div className="p-5 md:p-6">
        {competition && (
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-mono">
              {competition}
            </span>
            <span className={cn(
              "text-[10px] uppercase tracking-[0.15em] font-mono px-2.5 py-1 rounded-full",
              badgeStyles[status]
            )}>
              {statusLabels[status]}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="shrink-0 text-sm font-bold text-white/80 text-right truncate max-w-[100px] md:max-w-[140px]">
              {homeTeam}
            </span>
          </div>

          <div className="shrink-0">
            {showScore ? (
              <div className="flex items-center gap-2">
                <span className={cn(
                  "font-display text-3xl md:text-4xl tabular-nums",
                  isLive && "text-club-red",
                  homeScore! > awayScore! ? "text-white" : "text-muted-foreground"
                )}>
                  {homeScore}
                </span>
                <span className="text-lg text-muted-foreground">-</span>
                <span className={cn(
                  "font-display text-3xl md:text-4xl tabular-nums",
                  isLive && "text-club-red",
                  awayScore! > homeScore! ? "text-white" : "text-muted-foreground"
                )}>
                  {awayScore}
                </span>
              </div>
            ) : (
              <div className="text-center">
                <div className="font-display text-xl md:text-2xl text-white/70 leading-none">
                  {format(parsedDate, "HH:mm", { locale: es })}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1 font-mono">
                  {format(parsedDate, "d MMM", { locale: es })}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 flex-1 min-w-0 justify-end">
            <span className="shrink-0 text-sm font-bold text-white/80 truncate max-w-[100px] md:max-w-[140px]">
              {awayTeam}
            </span>
          </div>
        </div>

        {(venue || stage) && (
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
            {venue && <span>{venue}</span>}
            {stage && <span>{stage}</span>}
          </div>
        )}
      </div>
    </motion.div>
  );
}
