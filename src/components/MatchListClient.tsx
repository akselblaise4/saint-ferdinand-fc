"use client";

import { useState } from "react";
import Image from "next/image";
import { StaggerGrid, StaggerItem } from "@/components/animations/StaggerGrid";
import MatchDetailModal from "@/components/MatchDetailModal";
import type { MatchEntry } from "@/lib/loadData";

const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
function fmt(d: string | null) { if (!d) return ""; const [y, m, dd] = d.split("-").map(Number); return `${dd} ${monthNames[m - 1]} ${y}`; }

const resultStyles: Record<string, string> = {
  win: "border-emerald-200 bg-emerald-50 text-emerald-700",
  loss: "border-red-200 bg-red-50 text-red-700",
  draw: "border-zinc-200 bg-zinc-50 text-zinc-600",
  upcoming: "border-zinc-200 bg-white text-zinc-500",
};

function getTeamPhoto(standings: any[], name: string): string | null {
  return standings?.find((s: any) => s.name === name)?.photo || null;
}

export default function MatchListClient({ matches, saintsId, standings }: { matches: MatchEntry[]; saintsId: string | null; standings: any[] }) {
  const [selectedMatch, setSelectedMatch] = useState<MatchEntry | null>(null);
  const teamPhotos: Record<string, string> = {};
  standings.forEach((s: any) => { if (s.photo) teamPhotos[s.id || s.name] = s.photo; });

  return (
    <>
      <StaggerGrid className="space-y-2">
        {matches.map((m, i) => {
          const isHome = m.team1.id === saintsId;
          const sc = m.score1 !== null ? (isHome ? m.score1 : m.score2) : null;
          const oc = m.score1 !== null ? (isHome ? m.score2 : m.score1) : null;
          const result = sc !== null && oc !== null ? sc > oc ? "win" : sc < oc ? "loss" : "draw" : null;
          const isFuture = m.score1 === null;
          const homeLogo = getTeamPhoto(standings, m.team1.name);
          const awayLogo = getTeamPhoto(standings, m.team2.name);
          const hasDetails = m.details?.list && m.details.list.length > 0;

          return (
            <StaggerItem key={m.id + i}>
              <button
                onClick={() => setSelectedMatch(hasDetails || m.finished ? m : null)}
                className={`w-full text-left rounded-xl border bg-card shadow-sm transition-all hover:shadow-md ${hasDetails || m.finished ? "cursor-pointer" : "cursor-default"}`}
              >
                <div className="flex items-center justify-between gap-4 p-4 md:px-6">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="w-16 shrink-0 text-right text-xs tabular-nums text-muted-foreground">{fmt(m.date)}</span>
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${result ? resultStyles[result] : resultStyles.upcoming}`}>
                      {isFuture ? "Próximo" : result === "win" ? "Victoria" : result === "loss" ? "Derrota" : "Empate"}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-3 md:gap-6">
                    <div className="flex items-center gap-2">
                      {homeLogo && (
                        <div className="flex h-6 w-6 items-center justify-center overflow-hidden rounded bg-muted">
                          <Image src={homeLogo} alt="" width={24} height={24} className="h-full w-full object-contain p-0.5" />
                        </div>
                      )}
                      <span className={`truncate text-sm font-medium ${!isHome ? "text-muted-foreground" : ""}`}>
                        {isHome ? "SFFC" : m.team1.name}
                      </span>
                    </div>
                    <div className="flex w-16 items-center justify-center gap-1">
                      {sc !== null ? (
                        <>
                          <span className={`font-display text-xl leading-none ${result === "win" ? "text-emerald-600" : result === "loss" ? "text-red-500" : "text-muted-foreground"}`}>{sc}</span>
                          <span className="text-xs text-muted-foreground">-</span>
                          <span className={`font-display text-xl leading-none ${result === "loss" ? "text-emerald-600" : result === "win" ? "text-red-500" : "text-muted-foreground"}`}>{oc}</span>
                        </>
                      ) : (
                        <span className="text-xs font-semibold text-muted-foreground">VS</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`truncate text-sm font-medium ${isHome ? "text-muted-foreground" : ""}`}>
                        {isHome ? m.team2.name : "SFFC"}
                      </span>
                      {awayLogo && (
                        <div className="flex h-6 w-6 items-center justify-center overflow-hidden rounded bg-muted">
                          <Image src={awayLogo} alt="" width={24} height={24} className="h-full w-full object-contain p-0.5" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {m.venue && <span className="hidden text-xs text-muted-foreground md:block">{m.venue}</span>}
                    <span className="text-xs text-muted-foreground">T{m.turno}</span>
                    {hasDetails && <span className="text-[10px] text-club-red">⏱</span>}
                  </div>
                </div>
              </button>
            </StaggerItem>
          );
        })}
      </StaggerGrid>

      <MatchDetailModal
        match={(() => {
          if (!selectedMatch) return null;
          const d = selectedMatch.details;
          const mappedEvents = d?.list?.map(ev => ({
            id: ev.id,
            matchId: ev.matchId,
            playerId: ev.pl_id1 || "",
            teamId: ev.team1 || "",
            playerName: ev.playerName || ev.pl_id1 || "",
            minute: 0,
            stoppageTime: undefined,
            type: (ev.ac === 7 ? "goal" : ev.ac === 9 ? "card" : ev.ac === 1 ? "substitution" : "goal") as "goal" | "card" | "substitution" | "penalty" | "own_goal",
            cardColor: undefined,
            ac: ev.ac,
            val2: ev.val2,
            val3: ev.val3,
          })) || undefined;
          return {
            id: selectedMatch.id,
            date: selectedMatch.date,
            dateTimestamp: selectedMatch.dateTimestamp,
            localHour: selectedMatch.localHour,
            round: selectedMatch.round,
            phase: selectedMatch.phase,
            bracketFs: selectedMatch.bracketFs,
            venue: selectedMatch.venue,
            homeTeam: selectedMatch.team1,
            awayTeam: selectedMatch.team2,
            score: { home: selectedMatch.score1, away: selectedMatch.score2 },
            penalties: { home: selectedMatch.penalties1, away: selectedMatch.penalties2 },
            title: selectedMatch.title,
            nextId: selectedMatch.next1,
            finished: selectedMatch.finished,
            status: selectedMatch.status,
            isPlayoff: selectedMatch.isPlayoff,
            isSaints: selectedMatch.isSaints,
            walkover: selectedMatch.walkover,
            details: d ? { list: mappedEvents, info: d.info, best: d.best } : undefined,
          };
        })()}
        teamPhotos={teamPhotos}
        onClose={() => setSelectedMatch(null)}
      />
    </>
  );
}
