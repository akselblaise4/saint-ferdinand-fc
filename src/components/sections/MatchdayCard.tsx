"use client";

import { useState, useEffect } from "react";
import { GradientBorder } from "@/components/ui/gradient-border";

interface MatchData {
  team1: { id: string; name: string };
  team2: { id: string; name: string };
  date?: string | null;
  dateTimestamp?: number | null;
  venue?: string | null;
  turno?: number | null;
  round?: string | null;
  score1?: number | null;
  score2?: number | null;
}

interface MatchdayCardProps {
  nextMatch: MatchData | null;
  saintsId: string | null;
  saintsPhoto?: string | null;
  opponentName?: string | null;
  opponentPhoto?: string | null;
}

function fmtDate(d: string) {
  const [y, m, dd] = d.split("-").map(Number);
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  return `${dd} ${months[m - 1]} ${y}`;
}

function fmtRound(r: string | null | undefined) {
  if (!r) return "";
  const n = r.match(/\d+/);
  return n ? `Fecha ${n[0]}` : r;
}

const FALLBACK_MS = Date.now() + 7 * 86400000;

function calcDiff(target: number) {
  const now = Date.now();
  const diff = Math.max(0, target - now);
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function Countdown({ target }: { target: number }) {
  const [t, setT] = useState(() => calcDiff(target));

  useEffect(() => {
    const id = setInterval(() => setT(calcDiff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const totalSecs = t.days * 86400 + t.hours * 3600 + t.minutes * 60 + t.seconds;
  if (totalSecs <= 0) {
    return <p className="text-sm font-medium text-primary">Jugando ahora</p>;
  }

  const items = [
    { value: t.days, label: "Días" },
    { value: t.hours, label: "Horas" },
    { value: t.minutes, label: "Min" },
    { value: t.seconds, label: "Seg" },
  ];

  return (
    <div className="flex items-center gap-3">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col items-center">
          <span className="font-display text-3xl leading-none text-white md:text-4xl tabular-nums">
            {String(item.value).padStart(2, "0")}
          </span>
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-white/30">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function MatchdayCard({ nextMatch, saintsId, saintsPhoto, opponentName, opponentPhoto }: MatchdayCardProps) {
  if (!nextMatch) return null;

  const isHome = nextMatch.team1.id === saintsId;
  const oppName = opponentName || (isHome ? nextMatch.team2.name : nextMatch.team1.name);
  const oppPhoto = opponentPhoto || null;
  const targetMs = nextMatch.dateTimestamp ? nextMatch.dateTimestamp * 1000 : FALLBACK_MS;

  return (
    <section className="relative py-20 md:py-28 overflow-hidden bg-club-black">
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[length:24px_24px]" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-transparent to-club-black" />
      <div className="absolute top-0 left-1/4 h-px w-1/2 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="relative mx-auto max-w-5xl px-6">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/30">Próximo Partido</p>
          <p className="mt-1 text-sm text-white/20">
            {fmtRound(nextMatch.round)}{nextMatch.date ? ` · ${fmtDate(nextMatch.date)}` : ""}{nextMatch.turno ? ` · T${nextMatch.turno}` : ""}
          </p>
        </div>

        <GradientBorder className="p-[1.5px]">
          <div className="rounded-[inherit] bg-club-black">
            <div className="grid md:grid-cols-3 items-center">
              <div className="p-8 md:p-10 text-center">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-white/[0.04] mx-auto ring-1 ring-white/5 md:h-24 md:w-24">
                  {saintsPhoto ? (
                    <img src={saintsPhoto} alt="" className="h-full w-full object-contain p-3" />
                  ) : (
                    <span className="font-display text-3xl text-white/40">SF</span>
                  )}
                </div>
                <p className="mt-3 text-base font-bold text-white">SFFC</p>
                <p className="text-xs text-white/30">{isHome ? "Local" : "Visita"}</p>
              </div>

              <div className="p-8 md:p-10 text-center border-t border-b md:border-t-0 md:border-b-0 md:border-x border-white/[0.06]">
                <span className="font-display text-5xl leading-none text-white/10 md:text-6xl">VS</span>
                <div className="mt-6 flex justify-center">
                  <Countdown target={targetMs} />
                </div>
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-white/25">
                  <span>{nextMatch.venue || "Cancha"}</span>
                  <span className="h-1 w-1 rounded-full bg-white/20" />
                  <span>T{nextMatch.turno}</span>
                </div>
              </div>

              <div className="p-8 md:p-10 text-center">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-white/[0.04] mx-auto ring-1 ring-white/5 md:h-24 md:w-24">
                  {oppPhoto ? (
                    <img src={oppPhoto} alt="" className="h-full w-full object-contain p-3" />
                  ) : (
                    <span className="font-display text-2xl text-white/30">{oppName.substring(0, 3)}</span>
                  )}
                </div>
                <p className="mt-3 text-base font-bold text-white">{oppName}</p>
                <p className="text-xs text-white/30">{isHome ? "Visitante" : "Local"}</p>
              </div>
            </div>
          </div>
        </GradientBorder>
      </div>
    </section>
  );
}
