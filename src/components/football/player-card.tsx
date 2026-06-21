"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RadarChart } from "./radar-chart";
import { HoverEffect } from "./hover-effect";
import type { Player } from "./players-data";

const positionColors: Record<string, string> = {
  DEL: "bg-club-red/10 text-club-red border-club-red/30",
  MED: "text-amber-400 border-amber-400/30 bg-amber-400/10",
  DEF: "text-blue-400 border-blue-400/30 bg-blue-400/10",
  POR: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
};

const flagEmoji: Record<string, string> = {
  ES: "🇪🇸",
  AR: "🇦🇷",
  MX: "🇲🇽",
};

export function PlayerCard({ player }: { player: Player }) {
  const posColor = positionColors[player.position] || positionColors.MED;

  return (
    <HoverEffect className="p-6">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="flex size-20 items-center justify-center rounded-full bg-club-red text-3xl font-bold text-white shadow-lg shadow-club-red/20">
            {player.number}
          </div>
          <span className="absolute -bottom-1 -right-1 text-lg">{flagEmoji[player.nationality]}</span>
        </div>
        <div className="text-center">
          <h3 className="font-display text-2xl tracking-wide text-white">{player.name}</h3>
          <div className="mt-1 flex items-center justify-center gap-2">
            <span className={`rounded-full border px-3 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${posColor}`}>
              {player.position}
            </span>
            <span className="text-xs text-muted-foreground">{player.age} años</span>
          </div>
        </div>
        <Dialog>
          <DialogTrigger className="mt-2 w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground transition-all hover:border-club-red/40 hover:text-club-red">
            Ver Estadísticas
          </DialogTrigger>
          <DialogContent className="sm:max-w-md border-white/[0.08]">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl tracking-wide text-white">
                {player.number} · {player.name}
              </DialogTitle>
            </DialogHeader>
            <div className="flex items-center justify-center py-4">
              <RadarChart stats={player.stats} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(player.stats).map(([key, val]) => (
                <div key={key} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-center">
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {key === "speed" ? "VEL" : key === "shooting" ? "TIR" : key === "passing" ? "PAS" : key === "defense" ? "DEF" : key === "physical" ? "FÍS" : "REG"}
                  </div>
                  <div className="mt-1 font-display text-2xl text-white">{val}</div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </HoverEffect>
  );
}
