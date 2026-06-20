"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

interface Standing {
  name: string;
  photo?: string | null;
  season?: {
    pos?: number;
    pts?: number;
    stats?: {
      played?: number;
      wins?: number;
      draws?: number;
      losses?: number;
      goalsFor?: number;
      goalsAgainst?: number;
      goalDiff?: number;
    } | null;
  } | null;
}

interface Scorer {
  player: string;
  goals: number;
  overallRank?: number;
}

interface StatsTableProps {
  standings: Standing[];
  scorers: Scorer[];
  saintsId: string | null;
  eventTitle?: string;
  ss?: {
    played?: number;
    wins?: number;
    draws?: number;
    losses?: number;
    goalsFor?: number;
    goalsAgainst?: number;
    goalDiff?: number;
  } | null;
}

gsap.registerPlugin(useGSAP);

function getTeamPhoto(data: Standing[], name: string): string | null {
  return data.find((s) => s.name === name)?.photo || null;
}

export default function StatsTable({ standings, scorers, eventTitle, ss }: StatsTableProps) {
  const tableRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const rows = tableRef.current?.querySelectorAll(".stat-row");
      if (!rows?.length) return;
      gsap.fromTo(
        rows,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, stagger: 0.03, duration: 0.4, ease: "power2.out" }
      );
    },
    { scope: tableRef, dependencies: [standings] }
  );

  const maxGoals = Math.max(...scorers.map((s) => s.goals), 1);

  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-50/50 to-white" />
      <div className="relative mx-auto max-w-6xl px-6">
        {eventTitle && (
          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Estadísticas
            </p>
            <h2 className="mt-1 font-display text-3xl text-foreground md:text-4xl">
              Clasificación
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{eventTitle}</p>
          </div>
        )}

        <div ref={tableRef} className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    {["#", "Equipo", "PJ", "V", "E", "D", "GF", "GC", "DG", "Pts"].map(
                      (h) => (
                        <th
                          key={h}
                          className="h-10 px-3 text-left align-middle font-medium text-muted-foreground/60 text-[10px] uppercase tracking-wider"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {standings.map((row, i) => {
                    const isSaints = row.name?.toLowerCase().includes("saint");
                    const st = row.season?.stats;
                    return (
                      <tr
                        key={row.name + i}
                        className={`stat-row border-b border-border/50 transition-colors ${
                          isSaints
                            ? "bg-primary/[0.03] border-l-2 border-l-primary"
                            : "hover:bg-muted/30"
                        }`}
                      >
                        <td className="p-3 align-middle">
                          <span className="font-mono text-xs text-muted-foreground">
                            {row.season?.pos || "—"}
                          </span>
                        </td>
                        <td className="p-3 align-middle">
                          <div className="flex items-center gap-2">
                            {getTeamPhoto(standings, row.name) && (
                              <div className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded bg-muted/50">
                                <img
                                  src={getTeamPhoto(standings, row.name)!}
                                  alt=""
                                  className="h-full w-full object-contain p-0.5"
                                />
                              </div>
                            )}
                            <span
                              className={`truncate text-sm ${
                                isSaints
                                  ? "font-bold text-primary"
                                  : "font-medium text-foreground"
                              }`}
                            >
                              {row.name}
                              {isSaints && (
                                <span className="ml-1.5 text-[10px] font-bold text-primary/60">
                                  SFFC
                                </span>
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-right align-middle">
                          <span className="font-mono text-xs text-muted-foreground">
                            {st?.played || "—"}
                          </span>
                        </td>
                        <td className="p-3 text-right align-middle">
                          <span className="font-mono text-xs text-emerald-600">
                            {st?.wins || "—"}
                          </span>
                        </td>
                        <td className="p-3 text-right align-middle">
                          <span className="font-mono text-xs text-amber-500">
                            {st?.draws || "—"}
                          </span>
                        </td>
                        <td className="p-3 text-right align-middle">
                          <span className="font-mono text-xs text-red-400">
                            {st?.losses || "—"}
                          </span>
                        </td>
                        <td className="p-3 text-right align-middle">
                          <span className="font-mono text-xs text-muted-foreground">
                            {st?.goalsFor || "—"}
                          </span>
                        </td>
                        <td className="p-3 text-right align-middle">
                          <span className="font-mono text-xs text-muted-foreground">
                            {st?.goalsAgainst || "—"}
                          </span>
                        </td>
                        <td className="p-3 text-right align-middle">
                          <span
                            className={`font-mono text-xs ${
                              (st?.goalDiff ?? 0) >= 0
                                ? "text-emerald-600"
                                : "text-red-400"
                            }`}
                          >
                            {st?.goalDiff != null
                              ? (st.goalDiff > 0 ? "+" : "") + st.goalDiff
                              : "—"}
                          </span>
                        </td>
                        <td className="p-3 text-right align-middle">
                          <span className="font-mono text-sm font-bold text-foreground">
                            {row.season?.pts || "—"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <div className="rounded-xl border bg-card shadow-sm p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                Goleadores
              </p>
              <div className="mt-4 space-y-3">
                {scorers.length > 0 ? (
                  scorers.map((s, i) => (
                    <div key={s.player} className="stat-row">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-mono text-[11px] text-muted-foreground/40 w-4 shrink-0">
                            {i + 1}
                          </span>
                          <span className="text-sm font-medium text-foreground truncate">
                            {s.player}
                          </span>
                        </div>
                        <span className="font-mono text-sm font-bold text-primary ml-2">
                          {s.goals}
                        </span>
                      </div>
                      <div className="h-1 rounded-full bg-muted/50 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-700"
                          style={{
                            width: `${(s.goals / maxGoals) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground/60 py-4 text-center">
                    Próximamente
                  </p>
                )}
              </div>

              {ss && (
                <div className="mt-6 pt-5 border-t border-border/50">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 mb-3">
                    Resumen SFFC
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "PJ", value: ss.played || 0 },
                      { label: "G", value: ss.wins || 0 },
                      { label: "E", value: ss.draws || 0 },
                      { label: "P", value: ss.losses || 0 },
                    ].map((s) => (
                      <div key={s.label} className="text-center rounded-lg bg-muted/30 p-2">
                        <p className="font-mono text-lg font-bold text-foreground">
                          {s.value}
                        </p>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                          {s.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
