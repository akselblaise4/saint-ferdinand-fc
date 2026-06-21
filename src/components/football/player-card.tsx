"use client";

import { HoverEffect } from "./hover-effect";

export function PlayerCard({ name, number, goals, rank }: { name: string; number: number; goals: number; rank?: number }) {
  return (
    <HoverEffect className="p-6">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="flex size-20 items-center justify-center rounded-full bg-club-red text-3xl font-bold text-white shadow-lg shadow-club-red/20">
            {String(number).padStart(2, "0")}
          </div>
        </div>
        <div className="text-center">
          <h3 className="font-display text-lg tracking-wide text-white leading-tight">{name}</h3>
          <div className="mt-2 flex items-center justify-center gap-2">
            <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-club-red">
              {goals} goles
            </span>
            {rank && (
              <span className="text-xs text-muted-foreground">Rank #{rank}</span>
            )}
          </div>
        </div>
      </div>
    </HoverEffect>
  );
}
