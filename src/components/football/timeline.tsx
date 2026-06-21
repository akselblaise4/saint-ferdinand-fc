"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface TimelineEvent {
  minute: number;
  type: "goal" | "yellow" | "red" | "substitution" | "penalty" | "own-goal";
  player: string;
  team: "home" | "away";
  detail?: string;
}

interface MatchTimelineProps {
  events: TimelineEvent[];
  homeTeam: string;
  awayTeam: string;
  className?: string;
}

const eventIcons = {
  goal: "⚽",
  yellow: "🟨",
  red: "🟥",
  substitution: "🔄",
  penalty: "📌",
  "own-goal": "🟠",
};

const eventColors = {
  goal: "text-emerald-400",
  yellow: "text-amber-400",
  red: "text-red-500",
  substitution: "text-blue-400",
  penalty: "text-purple-400",
  "own-goal": "text-orange-400",
};

export function MatchTimeline({ events, homeTeam, awayTeam, className }: MatchTimelineProps) {
  const sorted = useMemo(() => [...events].sort((a, b) => a.minute - b.minute), [events]);

  if (sorted.length === 0) return null;

  return (
    <div className={cn("w-full", className)}>
      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-club-red/40 via-white/10 to-club-red/40" />
        {sorted.map((event, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: event.team === "home" ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: i * 0.06, ease: [0.34, 1.56, 0.64, 1] }}
            className={cn(
              "relative flex items-start gap-4 pb-5 last:pb-0",
              event.team === "home" ? "justify-start" : "justify-start"
            )}
          >
            <div className="relative z-10 flex items-center justify-center w-12 h-12 shrink-0">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-sm",
                "bg-card border border-white/10 shadow-lg"
              )}>
                <span className={cn("text-sm", eventColors[event.type])}>{eventIcons[event.type]}</span>
              </div>
            </div>
            <div className="flex-1 min-w-0 pt-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-club-red font-bold tabular-nums">
                  {event.minute}&apos;
                </span>
                <span className={cn(
                  "text-xs uppercase tracking-wider font-medium",
                  event.team === "home" ? "text-white/90" : "text-white/70"
                )}>
                  {event.player}
                </span>
              </div>
              {event.detail && (
                <p className="text-[11px] text-muted-foreground mt-0.5 capitalize">
                  {event.detail}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function MatchTimelineCompact({ events, className }: { events: TimelineEvent[]; className?: string }) {
  const sorted = useMemo(() => [...events].sort((a, b) => a.minute - b.minute), [events]);

  if (sorted.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {sorted.map((event, i) => (
        <span
          key={i}
          className={cn(
            "inline-flex items-center gap-1 text-[11px] font-mono px-2 py-1 rounded-md",
            "bg-white/5 border border-white/5 tabular-nums",
            eventColors[event.type]
          )}
        >
          <span>{eventIcons[event.type]}</span>
          <span>{event.minute}&apos;</span>
        </span>
      ))}
    </div>
  );
}
