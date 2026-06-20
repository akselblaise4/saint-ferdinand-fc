"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Player, PlayerPosition } from "@/types/football";

type CardVariant = "default" | "compact" | "expanded";

interface PlayerCardProps {
  player: Player;
  variant?: CardVariant;
  className?: string;
}

const positionColors: Record<PlayerPosition, string> = {
  GK: "bg-amber-100 text-amber-800",
  RB: "bg-blue-100 text-blue-800",
  CB: "bg-blue-100 text-blue-800",
  LB: "bg-blue-100 text-blue-800",
  RWB: "bg-blue-100 text-blue-800",
  LWB: "bg-blue-100 text-blue-800",
  CDM: "bg-emerald-100 text-emerald-800",
  CM: "bg-emerald-100 text-emerald-800",
  CAM: "bg-emerald-100 text-emerald-800",
  RM: "bg-purple-100 text-purple-800",
  LM: "bg-purple-100 text-purple-800",
  RW: "bg-purple-100 text-purple-800",
  LW: "bg-purple-100 text-purple-800",
  ST: "bg-red-100 text-red-800",
  CF: "bg-red-100 text-red-800",
};

const positionOrder: Record<string, string> = {
  GK: "01",
  RB: "02", CB: "03", LB: "04",
  RWB: "05", LWB: "06",
  CDM: "07", CM: "08", CAM: "09",
  RM: "10", LM: "11", RW: "12", LW: "13",
  ST: "14", CF: "15",
};

function sortPositions(a: PlayerPosition, b: PlayerPosition) {
  return (positionOrder[a] ?? "99").localeCompare(positionOrder[b] ?? "99");
}

function Skeleton() {
  return (
    <div className="animate-pulse rounded-xl border bg-card p-4">
      <div className="mb-3 h-4 w-16 rounded bg-muted" />
      <div className="mb-2 h-6 w-32 rounded bg-muted" />
      <div className="h-4 w-24 rounded bg-muted" />
    </div>
  );
}

function DefaultCard({ player }: { player: Player }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-club-red-light text-lg font-bold text-club-red">
        {player.number}
      </div>
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">{player.name}</p>
        <div className="mt-1 flex items-center gap-2">
          <Badge
            variant="secondary"
            className={cn("px-1.5 py-0 text-[10px]", positionColors[player.position])}
          >
            {player.position}
          </Badge>
          <span className="text-xs text-muted-foreground">{player.nationality}</span>
          <span className="text-xs text-muted-foreground">{player.age} años</span>
        </div>
      </div>
    </div>
  );
}

function CompactCard({ player }: { player: Player }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card px-3 py-2 shadow-sm">
      <span className="text-xs font-bold text-muted-foreground">{player.number}</span>
      <span className="truncate text-sm font-medium text-foreground">{player.name}</span>
      <Badge variant="outline" className="ml-auto px-1.5 py-0 text-[10px]">
        {player.position}
      </Badge>
    </div>
  );
}

function ExpandedCard({ player }: { player: Player }) {
  const [open, setOpen] = useState(false);
  const stats = player.seasonStats;

  return (
    <motion.div
      layout
      className="rounded-xl border bg-card shadow-sm"
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-4 p-4 text-left"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-club-red text-xl font-bold text-white">
          {player.number}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-foreground">{player.name}</p>
          <div className="mt-1 flex items-center gap-2">
            <Badge
              variant="secondary"
              className={cn("px-1.5 py-0 text-[10px]", positionColors[player.position])}
            >
              {player.position}
            </Badge>
            <span className="text-xs text-muted-foreground">{player.nationality}</span>
            <span className="text-xs text-muted-foreground">{player.age} años</span>
          </div>
        </div>
        <motion.svg
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="h-5 w-5 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>

      <AnimatePresence>
        {open && stats && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-t"
          >
            <div className="grid grid-cols-2 gap-3 p-4">
              <StatRow label="PJ" value={stats.appearances} />
              <StatRow label="Goles" value={stats.goals} />
              <StatRow label="Asistencias" value={stats.assists} />
              <StatRow label="Minutos" value={stats.minutesPlayed} />
              <StatRow label="TA" value={stats.yellowCards} />
              <StatRow label="TR" value={stats.redCards} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}

export function PlayerCard({ player, variant = "default", className }: PlayerCardProps) {
  return (
    <div className={className}>
      {variant === "compact" && <CompactCard player={player} />}
      {variant === "expanded" && <ExpandedCard player={player} />}
      {variant === "default" && <DefaultCard player={player} />}
    </div>
  );
}

export { Skeleton as PlayerCardSkeleton, sortPositions, positionColors };
