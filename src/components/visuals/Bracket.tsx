"use client";

import { sileo } from "sileo";
import type { PlayoffBracketTree } from "@/lib/buildBracket";

interface BracketProps {
  tree: PlayoffBracketTree;
}

export default function Bracket({ tree }: BracketProps) {
  const { rounds, saintsTeamId } = tree;
  if (!rounds.length) return null;

  const totalRounds = rounds.length;

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="flex gap-5 min-w-[700px]" style={{ minHeight: 360 }}>
        {rounds.map((round, roundIdx) => {
          const verticalSpace = Math.max(360, round.matches.length * 64);
          return (
            <div key={round.name} className="flex flex-1 flex-col" style={{ minWidth: 220 }}>
              <div className="mb-4">
                <div className="rounded-lg border bg-card px-3.5 py-2 shadow-sm">
                  <p className="text-xs font-semibold text-muted-foreground">
                    {roundIdx === 0 ? "Cuartos" : roundIdx === 1 ? "Semifinal" : "Final"}
                  </p>
                  <p className="text-sm font-semibold text-card-foreground">{round.name}</p>
                </div>
              </div>

              <div className="flex flex-1 flex-col justify-around gap-2.5" style={{ minHeight: verticalSpace }}>
                {round.matches.map((m) => {
                  const isSaintsMatch = m.isSaints;
                  const saintsIsT1 = m.team1Id === saintsTeamId;
                  const t1Won = m.score1 !== null && m.score2 !== null && m.score1 > m.score2;
                  const t2Won = m.score1 !== null && m.score2 !== null && m.score2 > m.score1;
                  const isDraw = m.score1 !== null && m.score2 !== null && m.score1 === m.score2;

                  const handleClick = () => {
                    if (m.score1 !== null && m.score2 !== null) {
                      const winner = t1Won ? m.team1 : t2Won ? m.team2 : null;
                      const pen = m.penalties1 !== null ? ` (${m.penalties1}-${m.penalties2} pen)` : "";
                      sileo.success({
                        title: `${m.team1} ${m.score1}-${m.score2} ${m.team2}${pen}`,
                        description: `${round.name}${winner ? ` · Avanza: ${winner}` : " · Empate"}${m.title ? ` · ${m.title}` : ""}`,
                      });
                    } else {
                      sileo.info({
                        title: `${m.team1} vs ${m.team2}`,
                        description: `${round.name}${m.title ? ` · ${m.title}` : ""}`,
                      });
                    }
                  };

                  return (
                    <div
                      key={m.id}
                      onClick={handleClick}
                      className={`relative rounded-xl border px-3 py-2.5 transition-all cursor-pointer ${
                        isSaintsMatch
                          ? "border-primary/20 bg-accent hover:bg-accent"
                          : "border bg-card hover:shadow-sm"
                      }`}
                    >
                      {roundIdx < totalRounds - 1 && (
                        <div className="absolute -right-[13px] top-1/2 z-0 hidden md:block">
                          <div className="h-px w-3 bg-zinc-200" />
                        </div>
                      )}

                      {m.title && (
                        <p className="mb-1 text-xs font-semibold text-muted-foreground">{m.title}</p>
                      )}

                      <div className="flex items-center gap-2">
                        <div className={`flex flex-1 items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
                          isSaintsMatch && saintsIsT1
                            ? "bg-primary text-primary-foreground"
                            : t1Won
                            ? "bg-emerald-100 text-emerald-700"
                            : isDraw && m.score1 !== null
                            ? "bg-muted text-muted-foreground"
                            : "bg-muted text-muted-foreground/60"
                        }`}>
                          <span className="truncate">{m.team1}</span>
                        </div>
                        <span className={`w-6 text-center text-sm font-semibold tabular-nums ${
                          t1Won ? "text-emerald-600" : m.score1 !== null ? "text-muted-foreground" : "text-muted"
                        }`}>{m.score1 !== null ? m.score1 : "—"}</span>
                      </div>

                      <div className="mt-1 flex items-center gap-2">
                        <div className={`flex flex-1 items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
                          isSaintsMatch && !saintsIsT1
                            ? "bg-primary text-primary-foreground"
                            : t2Won
                            ? "bg-emerald-100 text-emerald-700"
                            : isDraw && m.score1 !== null
                            ? "bg-muted text-muted-foreground"
                            : "bg-muted text-muted-foreground/60"
                        }`}>
                          <span className="truncate">{m.team2}</span>
                        </div>
                        <span className={`w-6 text-center text-sm font-semibold tabular-nums ${
                          t2Won ? "text-emerald-600" : m.score2 !== null ? "text-muted-foreground" : "text-muted"
                        }`}>{m.score2 !== null ? m.score2 : "—"}</span>
                      </div>

                      {m.penalties1 !== null && (
                        <p className="mt-1 text-xs font-semibold text-muted-foreground text-right">Pen: {m.penalties1}-{m.penalties2}</p>
                      )}

                      {isSaintsMatch && (
                        <div className="absolute -top-1.5 -right-1.5 inline-flex items-center rounded-full border border-transparent bg-primary px-1.5 py-0.5 text-[6px] font-semibold text-primary-foreground shadow-sm">
                          SFFC
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
