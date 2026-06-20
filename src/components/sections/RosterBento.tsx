"use client";

import { useRef, useState } from "react";

interface Player {
  n: number;
  name: string;
  pos: string;
  age: number;
  nation: string;
}

interface RosterBentoProps {
  squad: Player[];
}

function PlayerCard({ player, className, spotlight }: { player: Player; className?: string; spotlight?: boolean }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 50, y: 50 });

  const handleMove = (e: React.PointerEvent) => {
    if (!spotlight) return;
    const rect = cardRef.current!.getBoundingClientRect();
    setPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <div
      ref={cardRef}
      onPointerMove={handleMove}
      className={`group relative overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-300 hover:shadow-md ${className ?? ""}`}
    >
      {spotlight && (
        <div
          className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle at ${pos.x}% ${pos.y}%, rgba(200,16,46,0.12), transparent 60%)`,
          }}
        />
      )}
      <div className="absolute -top-4 -right-4 font-display text-8xl leading-none text-primary/[0.04] select-none pointer-events-none">
        {String(player.n).padStart(2, "0")}
      </div>
      <div className="relative z-10 p-5">
        <div className="flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/5">
            <span className="font-display text-lg leading-none text-primary/40 group-hover:text-primary/60 transition-colors">
              {String(player.n).padStart(2, "0")}
            </span>
          </div>
          <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-[10px] font-semibold text-primary transition-colors group-hover:bg-primary/10">
            {player.pos}
          </span>
        </div>
        <div className="mt-4">
          <p className="text-sm font-bold text-foreground truncate">{player.name}</p>
          <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
            <span>{player.nation}</span>
            <span className="h-1 w-1 rounded-full bg-border" />
            <span>{player.age} años</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const coachingStaff = [
  { name: "José Martínez", role: "Head Coach", nation: "ESP" },
  { name: "David López", role: "Assistant Coach", nation: "ESP" },
  { name: "Peter Hansen", role: "Fitness Coach", nation: "GER" },
  { name: "Carlos Ruiz", role: "Goalkeeping Coach", nation: "ESP" },
];

export default function RosterBento({ squad }: RosterBentoProps) {
  const captain = squad[0];
  const rest = squad.slice(1, 7);
  const secondRow = squad.slice(7, 11);

  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white to-zinc-50/50" />
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Plantilla
          </p>
          <h2 className="mt-1 font-display text-3xl text-foreground md:text-4xl">
            Jugadores
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {squad.length} jugadores · {coachingStaff.length} cuerpo técnico
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          <PlayerCard player={captain} className="col-span-2 row-span-2 min-h-[220px]" spotlight />
          {rest.slice(0, 2).map((p) => (
            <PlayerCard key={p.n} player={p} spotlight />
          ))}
          {rest.slice(2, 4).map((p) => (
            <PlayerCard key={p.n} player={p} spotlight />
          ))}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4 md:mt-4">
          {secondRow.slice(0, 2).map((p) => (
            <PlayerCard key={p.n} player={p} spotlight />
          ))}
          <div className="col-span-2 row-span-1 rounded-xl border bg-gradient-to-br from-primary/5 to-primary/[0.02] p-5 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <span className="font-display text-xl text-primary">+{squad.length - 11}</span>
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Jóvenes Talentos</p>
              <p className="text-xs text-muted-foreground">Jugadores en desarrollo</p>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
            Cuerpo Técnico
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {coachingStaff.map((s) => (
              <div
                key={s.name}
                className="rounded-xl border bg-card p-4 flex items-center gap-3 transition-all hover:shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/5 shrink-0">
                  <span className="font-display text-base text-primary/50">{s.name.charAt(0)}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.role}</p>
                  <p className="text-[10px] text-muted-foreground/60">{s.nation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
