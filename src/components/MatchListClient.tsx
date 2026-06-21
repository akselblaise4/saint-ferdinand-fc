"use client";

import { useState } from "react";
import { StaggerGrid, StaggerItem } from "@/components/animations/StaggerGrid";
import MatchDetailModal from "@/components/MatchDetailModal";
import type { MatchEntry } from "@/lib/loadData";

const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
function fmt(d: string | null) { if (!d) return ""; const [y, m, dd] = d.split("-").map(Number); return `${dd} ${monthNames[m - 1]}`; }

const resultStyles: Record<string, string> = {
  win: "border-club-red bg-club-red text-white",
  loss: "border-border bg-surface-container text-on-surface-variant",
  draw: "border-border bg-surface-container text-on-surface-variant",
  upcoming: "border-border bg-surface-container-low text-on-surface-variant",
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
      <StaggerGrid className="space-y-0">
        {matches.map((m, i) => {
          const isHome = m.team1.id === saintsId;
          const sc = m.score1 !== null ? (isHome ? m.score1 : m.score2) : null;
          const oc = m.score1 !== null ? (isHome ? m.score2 : m.score1) : null;
          const result = sc !== null && oc !== null ? sc > oc ? "win" : sc < oc ? "loss" : "draw" : null;
          const isFuture = m.score1 === null;
          const hasDetails = m.details?.list && m.details.list.length > 0;

          return (
            <StaggerItem key={m.id + i}>
              <button
                onClick={() => setSelectedMatch(hasDetails || m.finished ? m : null)}
                className={`w-full text-left border-b border-border bg-surface-container-lowest transition-colors
                  ${hasDetails || m.finished ? "cursor-pointer hover:bg-surface-container-low" : "cursor-default"}
                  ${i === 0 ? "border-t" : ""}`}
              >
                <div className="flex items-center gap-4 px-6 py-4">
                  <span className="w-14 shrink-0 text-right text-xs tabular-nums text-on-surface-variant">{fmt(m.date)}</span>

                  <span className={`inline-flex items-center border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] ${result ? resultStyles[result] : resultStyles.upcoming}`}>
                    {isFuture ? "Próximo" : result === "win" ? "Victoria" : result === "loss" ? "Derrota" : "Empate"}
                  </span>

                  <div className="flex flex-1 items-center justify-center gap-3">
                    <span className={`text-sm font-medium text-right ${!isHome ? "text-on-surface-variant" : "text-on-surface"}`}>
                      {isHome ? "SFFC" : m.team1.name}
                    </span>

                    <div className="flex w-14 items-center justify-center">
                      {sc !== null ? (
                        <span className="font-display text-lg font-bold text-on-surface">
                          {sc} - {oc}
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">VS</span>
                      )}
                    </div>

                    <span className={`text-sm font-medium ${isHome ? "text-on-surface-variant" : "text-on-surface"}`}>
                      {isHome ? m.team2.name : "SFFC"}
                    </span>
                  </div>

                  <div className="flex shrink-0 items-center gap-2 text-xs text-on-surface-variant">
                    {m.venue && <span>{m.venue}</span>}
                    {hasDetails && <span className="text-club-red">⏱</span>}
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
          const mappedEvents = d?.list
            ?.filter(ev => ev.ac !== 7 && ev.ac !== 8)
            ?.map(ev => {
            const ac = ev.ac;
            let type: "goal" | "card" | "substitution" | "penalty" | "own_goal" = "goal";
            let cardColor: "yellow" | "red" | "second_yellow" | undefined;
            if (ac === 1) type = "goal";
            else if (ac === 9) { type = "card"; cardColor = "yellow"; }
            else if (ac === 4) { type = "card"; cardColor = "red"; }
            else if (ac === 3) { type = "card"; cardColor = "second_yellow"; }
            else if (ac === 10) type = "substitution";
            return {
              id: ev.id, matchId: ev.matchId,
              playerId: ev.pl_id1 || "", teamId: ev.team1 || "",
              playerName: (ev.playerName || ev.pl_id1 || "").replace(/\t/g, " "),
              minute: ev.val1 ?? null, stoppageTime: undefined,
              type, cardColor, ac: ev.ac,
              val2: ev.val2, val3: ev.val3,
            };
          }) || undefined;
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
            media: selectedMatch.media,
            details: d ? { list: mappedEvents, info: d.info, best: d.best } : undefined,
          };
        })()}
        teamPhotos={teamPhotos}
        onClose={() => setSelectedMatch(null)}
      />
    </>
  );
}
