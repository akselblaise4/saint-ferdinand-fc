"use client";

import { sileo } from "sileo";

interface MatchRowProps {
  date: string;
  turno: number | null;
  venue: string | null;
  home: string;
  away: string;
  homeScore: number | null;
  awayScore: number | null;
  isSaintsHome: boolean;
  isFuture: boolean;
  result: "win" | "loss" | "draw" | null;
  title: string | null;
}

function BadgeResult({ result, isFuture }: { result: "win" | "loss" | "draw" | null; isFuture: boolean }) {
  let cls = "border-transparent bg-muted text-muted-foreground";
  let label = "—";
  if (isFuture) { cls = "border text-muted-foreground"; label = "Próximo"; }
  else if (result === "win") { cls = "border-transparent bg-emerald-100 text-emerald-700"; label = "V"; }
  else if (result === "loss") { cls = "border-transparent bg-red-100 text-red-700"; label = "D"; }
  else if (result === "draw") { cls = "border-transparent bg-muted text-muted-foreground"; label = "E"; }
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold transition-colors ${cls}`}>
      {label}
    </span>
  );
}

export default function MatchRow({
  date, turno, venue, home, away, homeScore, awayScore, isSaintsHome, isFuture, result, title
}: MatchRowProps) {
  const sc = homeScore;
  const oc = awayScore;

  const handleClick = () => {
    if (isFuture) {
      sileo.info({
        title: `${home} vs ${away}`,
        description: `${date} · Turno ${turno} · ${venue || "Cancha por definir"}`,
      });
    } else if (sc !== null && oc !== null) {
      const label = sc > oc ? "Victoria" : sc < oc ? "Derrota" : "Empate";
      sileo.success({
        title: `${home} ${sc}-${oc} ${away}`,
        description: `${label} · ${date} · ${title || venue || "Fase Regular"}`,
      });
    }
  };

  return (
    <div
      onClick={handleClick}
      className="rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md cursor-pointer"
    >
      <div className="flex items-center justify-between gap-4 p-4 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <span className="shrink-0 text-xs text-muted-foreground w-16 text-right tabular-nums">{date}</span>
          <BadgeResult result={result} isFuture={isFuture} />
        </div>

        <div className="flex items-center justify-center gap-3 md:gap-6">
          <span className={`truncate text-sm font-medium ${isSaintsHome ? "text-foreground" : "text-muted-foreground"}`}>
            {isSaintsHome ? "SFFC" : home}
          </span>
          <div className="flex w-16 items-center justify-center gap-1">
            {sc !== null ? (
              <>
                <span className={`font-display text-xl leading-none ${result === "win" ? "text-emerald-600" : result === "loss" ? "text-red-500" : "text-muted-foreground"}`}>{sc}</span>
                <span className="text-xs text-muted">-</span>
                <span className={`font-display text-xl leading-none ${result === "loss" ? "text-emerald-600" : result === "win" ? "text-red-500" : "text-muted-foreground"}`}>{oc}</span>
              </>
            ) : (
              <span className="text-xs font-semibold text-muted">VS</span>
            )}
          </div>
          <span className={`truncate text-sm font-medium ${!isSaintsHome ? "text-foreground" : "text-muted-foreground"}`}>
            {!isSaintsHome ? "SFFC" : away}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className="text-xs text-muted-foreground">T{turno}</span>
          <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold text-muted-foreground">
            Info
          </span>
        </div>
      </div>
    </div>
  );
}
