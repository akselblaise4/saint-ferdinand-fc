"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSaintsMatches, useNextMatch, useStandings, useSaints } from "@/hooks/useCopaData";

export default function PartidosPage() {
  const { data: matches = [] } = useSaintsMatches();
  const { data: nextMatch } = useNextMatch();
  const { data: standings = [] } = useStandings();
  const { data: saints } = useSaints();

  const saintsId = saints?.id ?? null;
  const saintsStanding = standings.find((s) => s.id === saintsId);

  const regularMatches = useMemo(
    () =>
      matches
        .filter((m) => !m.isPlayoff)
        .sort((a, b) => (a.dateTimestamp || 0) - (b.dateTimestamp || 0)),
    [matches]
  );

  const playoffMatches = useMemo(
    () =>
      matches
        .filter((m) => m.isPlayoff)
        .sort((a, b) => (a.dateTimestamp || 0) - (b.dateTimestamp || 0)),
    [matches]
  );

  const finished = matches.filter((m) => m.finished);
  const recentResults = finished.slice(-5).reverse();

  const [filter, setFilter] = useState<string | null>(null);

  const displayedMatches = useMemo(() => {
    let ms = regularMatches;
    if (filter === "finished") ms = ms.filter((m) => m.finished);
    else if (filter === "upcoming") ms = ms.filter((m) => !m.finished);
    return ms;
  }, [regularMatches, filter]);

  const filters = [
    { key: null, label: "Todos" },
    { key: "finished", label: "Jugados" },
    { key: "upcoming", label: "Próximos" },
  ];

  return (
    <>
      {/* ─── HERO: NEXT MATCH ─── */}
      <section className="relative h-[819px] flex items-center justify-center overflow-hidden bg-on-surface">
        <div className="absolute inset-0 opacity-40">
          <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(227,6,19,0.25)_0%,transparent_70%)]" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-on-surface via-transparent to-transparent" />
        <div className="relative z-10 w-full max-w-desktop px-margin-mobile md:px-margin-desktop text-center">
          {nextMatch ? (
            <>
              <div className="mb-8 inline-flex items-center bg-primary-container px-4 py-1 text-on-primary font-label-sm uppercase tracking-[0.2em]">
                Siguiente Encuentro
              </div>
              <div className="flex flex-col md:flex-row items-center justify-between gap-12 md:gap-0">
                {/* Home Team */}
                <div className="flex flex-col items-center flex-1">
                  <div className="w-32 h-32 md:w-48 md:h-48 mb-6 p-4 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center">
                    {nextMatch.homeTeam.id === saintsId ? (
                      <span className="material-symbols-outlined text-[80px] md:text-[120px] text-primary">shield</span>
                    ) : (
                      <span className="material-symbols-outlined text-[80px] md:text-[120px] text-white/60">shield</span>
                    )}
                  </div>
                  <h2 className="font-display-lg text-display-lg text-white uppercase tracking-tighter">
                    {nextMatch.homeTeam.name === "SAINT FERDINAND" ? "Saint Ferdinand" : nextMatch.homeTeam.name}
                  </h2>
                </div>
                {/* VS / Date */}
                <div className="flex flex-col items-center">
                  <span className="font-display-xl text-display-xl text-primary-container mb-2 italic">VS</span>
                  <div className="text-white space-y-1">
                    {nextMatch.venue && (
                      <p className="font-label-lg text-label-lg tracking-[0.3em] uppercase">{nextMatch.venue}</p>
                    )}
                    {nextMatch.date && (
                      <p className="font-headline-md text-headline-md font-bold">
                        {new Date(nextMatch.date).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }).toUpperCase()}
                      </p>
                    )}
                  </div>
                </div>
                {/* Away Team */}
                <div className="flex flex-col items-center flex-1">
                  <div className="w-32 h-32 md:w-48 md:h-48 mb-6 p-4 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center">
                    {nextMatch.awayTeam.id === saintsId ? (
                      <span className="material-symbols-outlined text-[80px] md:text-[120px] text-primary">shield</span>
                    ) : (
                      <span className="material-symbols-outlined text-[80px] md:text-[120px] text-white/60">shield</span>
                    )}
                  </div>
                  <h2 className="font-display-lg text-display-lg text-white uppercase tracking-tighter">
                    {nextMatch.awayTeam.name === "SAINT FERDINAND" ? "Saint Ferdinand" : nextMatch.awayTeam.name}
                  </h2>
                </div>
              </div>
              <div className="mt-12 flex justify-center gap-6">
                <button className="bg-primary text-on-primary font-label-lg uppercase px-12 py-4 tracking-widest hover:scale-105 transition-transform">
                  Comprar Entradas
                </button>
                <button className="bg-transparent border-2 border-white text-white font-label-lg uppercase px-12 py-4 tracking-widest hover:bg-white hover:text-on-surface transition-all">
                  Vista Previa
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="mb-8 inline-flex items-center bg-primary-container px-4 py-1 text-on-primary font-label-sm uppercase tracking-[0.2em]">
                Temporada {saints?.season?.stats?.played ?? 0} Partidos
              </div>
              <h1 className="font-display-xl text-display-xl text-surface uppercase tracking-tighter">
                Calendario Saint Ferdinand
              </h1>
              <p className="font-headline-lg text-headline-lg text-surface-variant mt-6">
                {regularMatches.length} partidos registrados
              </p>
            </>
          )}
        </div>
      </section>

      <main className="pt-20">
        {/* ─── MATCH CALENDAR & FILTERS ─── */}
        <section className="py-section-gap bg-surface">
          <div className="max-w-desktop mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
              <div>
                <h2 className="font-display-lg text-display-lg text-on-surface uppercase tracking-tighter mb-2">
                  Calendario de Partidos
                </h2>
                <p className="text-on-surface-variant font-body-lg text-body-lg">
                  {regularMatches.length} partidos en fase regular. Filtra por estado.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                {filters.map((f) => (
                  <button
                    key={f.key ?? "all"}
                    onClick={() => setFilter(f.key)}
                    className={`px-6 py-2 font-label-sm uppercase tracking-wider transition-colors ${
                      filter === f.key
                        ? "bg-primary text-on-primary"
                        : "bg-white border border-secondary-container text-on-surface-variant hover:border-primary"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Playoffs */}
            {playoffMatches.length > 0 && (
              <div className="mb-12">
                <h3 className="font-headline-lg text-headline-lg uppercase tracking-tighter mb-6 text-primary">
                  Playoffs
                </h3>
                <div className="space-y-4">
                  {playoffMatches.map((m) => {
                    const isHome = m.homeTeam.id === saintsId;
                    const saintScore = isHome ? m.score?.home : m.score?.away;
                    const oppScore = isHome ? m.score?.away : m.score?.home;
                    return (
                      <div
                        key={m.id}
                        className="bg-surface-container-lowest border border-surface-container-high hover:border-primary transition-colors p-6 md:p-8"
                      >
                        <div className="flex flex-col md:flex-row items-center gap-6">
                          <div className="w-full md:w-40 shrink-0">
                            <p className="font-label-sm text-on-surface-variant uppercase tracking-widest">
                              {m.date
                                ? new Date(m.date).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })
                                : "—"}
                            </p>
                            <p className="font-headline-md text-headline-md">{m.phase || "Playoff"}</p>
                          </div>
                          <div className="flex-1 flex items-center justify-center gap-4 md:gap-8">
                            <div className="flex items-center gap-3 flex-1 justify-end">
                              <span className="font-headline-md text-headline-md uppercase text-right">
                                {isHome ? "ST. FERDINAND" : m.homeTeam.name}
                              </span>
                              <div className="w-10 h-10 bg-surface-container-low p-2 flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary">shield</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-headline-md text-headline-md">{saintScore ?? "?"}</span>
                              <span className="px-4 py-1 bg-surface-container text-on-surface-variant font-label-sm uppercase tracking-widest">
                                {m.finished ? "FT" : "VS"}
                              </span>
                              <span className="font-headline-md text-headline-md">{oppScore ?? "?"}</span>
                            </div>
                            <div className="flex items-center gap-3 flex-1">
                              <div className="w-10 h-10 bg-surface-container-low p-2 flex items-center justify-center">
                                <span className="material-symbols-outlined text-on-surface-variant">shield</span>
                              </div>
                              <span className="font-headline-md text-headline-md uppercase">
                                {isHome ? m.awayTeam.name : "ST. FERDINAND"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Regular Matches */}
            <div className="space-y-4">
              {displayedMatches.length === 0 ? (
                <p className="text-center py-16 font-body-lg text-body-lg text-on-surface-variant">
                  No hay partidos{filter ? ` con filtro "${filters.find((f) => f.key === filter)?.label}"` : ""}
                </p>
              ) : (
                displayedMatches.map((m) => {
                  const isHome = m.homeTeam.id === saintsId;
                  const saintScore = isHome ? m.score?.home : m.score?.away;
                  const oppScore = isHome ? m.score?.away : m.score?.home;
                  return (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="bg-white border border-surface-container-high group hover:border-primary transition-colors"
                    >
                      <div className="flex flex-col md:flex-row items-center p-6 md:p-8 gap-6 md:gap-8">
                        <div className="w-full md:w-48 shrink-0">
                          <p className="font-label-sm text-on-surface-variant uppercase tracking-widest">
                            {m.date
                              ? new Date(m.date).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })
                              : "—"}
                          </p>
                          <p className="font-headline-md text-headline-md">
                            {m.localHour ? `${m.localHour}:00` : "—"}
                          </p>
                        </div>
                        <div className="flex-1 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 md:gap-6 flex-1 justify-end">
                            <span className="font-headline-md text-headline-md uppercase text-right">
                              {isHome ? "ST. FERDINAND" : m.homeTeam.name}
                            </span>
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-surface-container-low p-2 flex items-center justify-center">
                              <span className="material-symbols-outlined text-3xl md:text-4xl text-primary">shield</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {m.finished ? (
                              <>
                                <span className="font-headline-md text-headline-md">{saintScore ?? "?"}</span>
                                <span className="px-4 py-1 bg-on-surface text-surface font-label-sm uppercase tracking-widest">FT</span>
                                <span className="font-headline-md text-headline-md">{oppScore ?? "?"}</span>
                              </>
                            ) : (
                              <span className="px-6 py-2 bg-surface-container text-on-surface-variant font-label-sm uppercase tracking-widest">VS</span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 md:gap-6 flex-1">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-surface-container-low p-2 flex items-center justify-center">
                              <span className="material-symbols-outlined text-3xl md:text-4xl text-on-surface-variant">shield</span>
                            </div>
                            <span className="font-headline-md text-headline-md uppercase">
                              {isHome ? m.awayTeam.name : "ST. FERDINAND"}
                            </span>
                          </div>
                        </div>
                        <div className="w-full md:w-64 flex justify-end gap-3 shrink-0">
                          <Link
                            href="/copa"
                            className="flex-1 md:flex-none bg-surface-container-highest text-on-surface font-label-sm uppercase py-3 px-5 text-center hover:bg-primary hover:text-on-primary transition-all tracking-wider"
                          >
                            Detalles
                          </Link>
                          <button className="p-3 bg-white border border-secondary-container hover:border-primary transition-colors">
                            <span className="material-symbols-outlined text-on-surface-variant">share</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        </section>

        {/* ─── STANDINGS + RECENT RESULTS BENTO ─── */}
        <section className="py-section-gap bg-white overflow-hidden">
          <div className="max-w-desktop mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter items-start">
              {/* Standings Table (8 columns) */}
              <div className="md:col-span-8 bg-surface-container-lowest border border-surface-container p-8 md:p-10">
                <div className="flex justify-between items-center mb-8 md:mb-10">
                  <h3 className="font-headline-lg text-headline-lg uppercase tracking-tighter">
                    Clasificación — {saints?.group || "Torneo"}
                  </h3>
                  <Link
                    href="/copa"
                    className="font-label-sm text-primary uppercase tracking-widest flex items-center gap-2 hover:opacity-80"
                  >
                    Tabla Completa <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-surface-container-high text-on-surface-variant font-label-sm uppercase tracking-widest">
                        <th className="py-4 pr-2 font-normal">Pos</th>
                        <th className="py-4 px-2 font-normal">Equipo</th>
                        <th className="py-4 px-2 font-normal text-center">PJ</th>
                        <th className="py-4 px-2 font-normal text-center">G</th>
                        <th className="py-4 px-2 font-normal text-center">E</th>
                        <th className="py-4 px-2 font-normal text-center">P</th>
                        <th className="py-4 px-2 font-normal text-center">DG</th>
                        <th className="py-4 pl-2 font-normal text-center">Pts</th>
                      </tr>
                    </thead>
                    <tbody className="font-body-md text-body-md">
                      {standings.slice(0, 8).map((s) => {
                        const isSaints = s.id === saintsId;
                        return (
                          <tr
                            key={s.id}
                            className={`border-b border-surface-container ${isSaints ? "bg-primary-container/5" : ""}`}
                          >
                            <td className={`py-4 pr-2 font-bold ${isSaints ? "text-primary" : ""}`}>{s.pos}</td>
                            <td className={`py-4 px-2 flex items-center gap-3 ${isSaints ? "text-primary font-bold" : ""}`}>
                              <div className={`w-6 h-6 ${isSaints ? "bg-primary" : "bg-surface-container"} p-1 flex items-center justify-center`}>
                                <span className={`material-symbols-outlined text-sm ${isSaints ? "text-on-primary" : "text-on-surface-variant"}`}>
                                  shield
                                </span>
                              </div>
                              <span className="uppercase tracking-tight">{s.name}</span>
                            </td>
                            <td className="py-4 px-2 text-center">{s.stats?.played ?? 0}</td>
                            <td className="py-4 px-2 text-center">{s.stats?.wins ?? 0}</td>
                            <td className="py-4 px-2 text-center">{s.stats?.draws ?? 0}</td>
                            <td className="py-4 px-2 text-center">{s.stats?.losses ?? 0}</td>
                            <td className="py-4 px-2 text-center">
                              {s.stats ? `${s.stats.goalDiff > 0 ? "+" : ""}${s.stats.goalDiff}` : "0"}
                            </td>
                            <td className="py-4 pl-2 text-center font-bold">{s.pts}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recent Results (4 columns) */}
              <div className="md:col-span-4 space-y-6">
                <h3 className="font-headline-lg text-headline-lg uppercase tracking-tighter mb-4">
                  Resultados Recientes
                </h3>
                {recentResults.length === 0 ? (
                  <p className="text-on-surface-variant font-body-md text-body-md">Sin resultados</p>
                ) : (
                  recentResults.map((m) => {
                    const isHome = m.homeTeam.id === saintsId;
                    const saintScore = isHome ? m.score?.home : m.score?.away;
                    const oppScore = isHome ? m.score?.away : m.score?.home;
                    const isWin = saintScore != null && oppScore != null && saintScore > oppScore;
                    const isDraw = saintScore != null && oppScore != null && saintScore === oppScore;
                    const borderColor = isWin ? "border-primary" : isDraw ? "border-secondary" : "border-on-surface-variant";
                    const scorers = m.details?.list
                      ?.filter((e) => e.type === "goal" && !e.cardColor)
                      .map((e) => e.playerName)
                      .filter(Boolean) ?? [];

                    return (
                      <div
                        key={m.id}
                        className={`bg-surface-container-high p-6 border-l-4 ${borderColor}`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <span className="font-label-sm uppercase tracking-widest text-on-surface-variant">
                            {m.phase || `Jornada ${m.round || ""}`}
                          </span>
                          <span className="px-3 py-1 bg-on-surface text-surface font-label-sm uppercase">FT</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex-1 text-center">
                            <div className="w-10 h-10 mx-auto mb-2 flex items-center justify-center">
                              <span className="material-symbols-outlined text-3xl text-primary">shield</span>
                            </div>
                            <span className="font-label-sm uppercase block text-on-surface-variant">
                              {isHome ? "STF" : m.homeTeam.name.slice(0, 3).toUpperCase()}
                            </span>
                          </div>
                          <div className="px-4 flex items-center gap-2">
                            <span className={`font-display-lg text-display-lg leading-none ${isWin ? "text-primary" : ""}`}>
                              {saintScore ?? "?"}
                            </span>
                            <span className="font-display-lg text-display-lg leading-none opacity-20">—</span>
                            <span className="font-display-lg text-display-lg leading-none">{oppScore ?? "?"}</span>
                          </div>
                          <div className="flex-1 text-center">
                            <div className="w-10 h-10 mx-auto mb-2 flex items-center justify-center">
                              <span className="material-symbols-outlined text-3xl text-on-surface-variant">shield</span>
                            </div>
                            <span className="font-label-sm uppercase block text-on-surface-variant">
                              {isHome ? m.awayTeam.name.slice(0, 3).toUpperCase() : "STF"}
                            </span>
                          </div>
                        </div>
                        {scorers.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-secondary-container">
                            <p className="font-body-md text-sm text-on-surface-variant italic">
                              Goles: {scorers.join(", ")}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
                <Link
                  href="/copa"
                  className="w-full block text-center py-4 bg-white border border-secondary-container font-label-lg uppercase tracking-widest hover:bg-on-surface hover:text-surface transition-all"
                >
                  Ver Todos
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ─── TICKETS CTA ─── */}
        <section className="py-section-gap bg-primary-container text-on-primary overflow-hidden relative">
          <div className="absolute right-0 top-0 h-full w-1/3 opacity-20 mix-blend-overlay">
            <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.3)_0%,transparent_70%)]" />
          </div>
          <div className="max-w-desktop mx-auto px-margin-mobile md:px-margin-desktop relative z-10 flex flex-col items-center text-center">
            <h2 className="font-display-lg text-display-lg uppercase tracking-tighter mb-6">
              No te pierdas ningún momento
            </h2>
            <p className="font-body-lg text-body-lg mb-10 max-w-2xl opacity-90">
              Consigue tus abonos o entradas para cada partido. Vive la experiencia Saint Ferdinand.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <button className="bg-surface text-primary font-label-lg uppercase px-12 py-4 tracking-widest hover:bg-on-surface hover:text-surface transition-all">
                Abonos
              </button>
              <button className="bg-transparent border-2 border-surface text-on-primary font-label-lg uppercase px-12 py-4 tracking-widest hover:bg-surface hover:text-primary transition-all">
                Entradas
              </button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
