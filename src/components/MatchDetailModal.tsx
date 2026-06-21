"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Match, MatchEvent } from "@/types/football";

interface MatchDetailModalProps {
  match: Match | null;
  teamPhotos: Record<string, string>;
  onClose: () => void;
}

function Shield({ src, name }: { src?: string | null; name: string }) {
  return (
    <div className="h-12 w-12 border border-border bg-surface-container flex items-center justify-center overflow-hidden">
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span className="font-display text-sm font-bold text-on-surface-variant">{name.charAt(0)}</span>
      )}
    </div>
  );
}

function TimelineEvent({ event, isHome }: { event: MatchEvent; isHome: boolean }) {
  const showMinute = (ev: MatchEvent) => ev.minute != null ? `${ev.minute}'` : null;
  if (event.ac === 1) {
    return (
      <div className={`flex items-center gap-2 ${isHome ? "flex-row" : "flex-row-reverse"}`}>
        <div className="h-6 w-6 border border-border bg-surface-container flex items-center justify-center">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-club-red">
            <circle cx="12" cy="12" r="9" />
          </svg>
        </div>
        <span className="text-xs font-medium text-on-surface">{event.playerName}</span>
        {showMinute(event) && <span className="text-[10px] text-on-surface-variant">{showMinute(event)}</span>}
      </div>
    );
  }
  if (event.ac === 9 || event.ac === 3) {
    const isYellow = event.ac === 9;
    return (
      <div className={`flex items-center gap-2 ${isHome ? "flex-row" : "flex-row-reverse"}`}>
        <div className={`h-3 w-2 ${isYellow ? "bg-yellow-400" : "bg-orange-400"}`} />
        <span className="text-xs font-medium text-on-surface">{event.playerName}</span>
        <span className="text-[10px] text-on-surface-variant">{isYellow ? "Amarilla" : "Conducta"}{showMinute(event) ? ` ${showMinute(event)}` : ""}</span>
      </div>
    );
  }
  if (event.ac === 4) {
    return (
      <div className={`flex items-center gap-2 ${isHome ? "flex-row" : "flex-row-reverse"}`}>
        <div className="h-3 w-2 bg-club-red" />
        <span className="text-xs font-medium text-on-surface">{event.playerName}</span>
        <span className="text-[10px] text-on-surface-variant">Expulsado {showMinute(event)}</span>
      </div>
    );
  }
  if (event.ac === 10) {
    return (
      <div className={`flex items-center gap-2 ${isHome ? "flex-row" : "flex-row-reverse"}`}>
        <div className="h-5 w-5 border border-border flex items-center justify-center">
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-on-surface-variant">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </div>
        <span className="text-xs font-medium text-on-surface">{event.playerName}</span>
        <span className="text-[10px] text-on-surface-variant">{event.minute}'</span>
      </div>
    );
  }
  return null;
}

export default function MatchDetailModal({ match, teamPhotos, onClose }: MatchDetailModalProps) {
  useEffect(() => {
    if (!match) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [match, onClose]);

  const events = match?.details?.list || [];
  const cardCounts = events.reduce((acc, ev) => {
    if (ev.ac === 3 || ev.ac === 9) acc.yellow++;
    if (ev.ac === 4) acc.red++;
    return acc;
  }, { yellow: 0, red: 0 });
  const bestPlayer = match?.details?.best
    ? Object.entries(match.details.best).find(([, v]) => v.num_val === 10)?.[0]
    : null;

  return (
    <AnimatePresence>
      {match && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className="relative w-full max-w-lg mx-4 mb-0 md:mb-0 bg-surface-container-lowest border border-border max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header bar */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-3 border-b border-border bg-surface-container-lowest">
              <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
                {match.round || "Fase Regular"}
              </span>
              <button onClick={onClose} className="h-7 w-7 flex items-center justify-center border border-border text-on-surface-variant hover:text-on-surface">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4l8 8M12 4l-8 8" />
                </svg>
              </button>
            </div>

            {/* Score */}
            <div className="px-6 py-8 flex items-center gap-4 justify-center">
              <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
                <Shield src={teamPhotos[match.homeTeam?.id || ""]} name={match.homeTeam?.name || ""} />
                <span className="font-display text-xs font-semibold uppercase tracking-[0.04em] text-on-surface text-center leading-tight">
                  {match.homeTeam?.name || "Local"}
                </span>
              </div>
              <div className="flex flex-col items-center gap-1 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="font-display text-4xl font-bold text-on-surface md:text-5xl">
                    {match.score?.home != null ? match.score.home : "—"}
                  </span>
                  <span className="font-display text-3xl text-on-surface-variant">-</span>
                  <span className="font-display text-4xl font-bold text-on-surface md:text-5xl">
                    {match.score?.away != null ? match.score.away : "—"}
                  </span>
                </div>
                {match.penalties?.home != null && match.penalties?.away != null && (
                  <span className="text-[10px] text-on-surface-variant">
                    Penales: {match.penalties.home} - {match.penalties.away}
                  </span>
                )}
              </div>
              <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
                <Shield src={teamPhotos[match.awayTeam?.id || ""]} name={match.awayTeam?.name || ""} />
                <span className="font-display text-xs font-semibold uppercase tracking-[0.04em] text-on-surface text-center leading-tight">
                  {match.awayTeam?.name || "Visita"}
                </span>
              </div>
            </div>

            <div className="h-px bg-border mx-6" />

            {/* Info */}
            <div className="px-6 py-5 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant">Fecha</span>
                  <p className="text-sm text-on-surface mt-0.5">{match.date || "—"}</p>
                </div>
                <div>
                  <span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant">Cancha</span>
                  <p className="text-sm text-on-surface mt-0.5">{match.venue || "—"}</p>
                </div>
                <div>
                  <span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant">Estado</span>
                  <p className="text-sm text-on-surface mt-0.5">{match.finished ? "Finalizado" : "Pendiente"}</p>
                </div>
              </div>

              {/* Cards */}
              {(cardCounts.yellow > 0 || cardCounts.red > 0) && (
                <div>
                  <span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant">Tarjetas</span>
                  <div className="flex items-center gap-4 mt-2">
                    {cardCounts.yellow > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-2 bg-yellow-400" />
                        <span className="text-sm text-on-surface">{cardCounts.yellow}</span>
                      </div>
                    )}
                    {cardCounts.red > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-2 bg-club-red" />
                        <span className="text-sm text-on-surface">{cardCounts.red}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Walkover */}
              {match.walkover && (
                <div className="border border-border bg-surface-container px-4 py-3">
                  <p className="text-xs font-semibold text-on-surface-variant">Walkover — Partido adjudicado</p>
                </div>
              )}

              {/* MVP */}
              {bestPlayer && (
                <div className="border border-border bg-surface-container px-4 py-3 flex items-center gap-3">
                  <span className="text-yellow-600 text-sm">★</span>
                  <div>
                    <span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant">MVP del Partido</span>
                    <p className="text-xs font-medium text-on-surface">
                      {(events.find((e: any) => e.playerId === bestPlayer)?.playerName) || bestPlayer.substring(0, 8)}
                    </p>
                  </div>
                </div>
              )}

              {/* Timeline */}
              {events.length > 0 && (
                <div>
                  <span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant">Desarrollo</span>
                  <div className="mt-2 space-y-2">
                    {events.map((event, i) => {
                      const isHome = event.teamId === match.homeTeam?.id;
                      return (
                        <div key={event.id || i} className={`flex ${isHome ? "justify-start" : "justify-end"}`}>
                          <TimelineEvent event={event} isHome={isHome} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {events.length === 0 && match.finished && (
                <div className="py-4 text-center">
                  <p className="text-xs text-on-surface-variant">No hay eventos registrados</p>
                </div>
              )}

              {/* Photos */}
              {match.media && match.media.length > 0 && (
                <div>
                  <span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant">Fotos del partido</span>
                  {(() => {
                    const mi = match.media![0];
                    const photos = mi.drivePhotos || [];
                    if (photos.length > 0) {
                      return (
                        <>
                          <div className="mt-2 grid grid-cols-3 gap-1">
                            {photos.slice(0, 6).map((p: any, i: number) => (
                              <a key={i} href={p.url} target="_blank" rel="noopener noreferrer"
                                className={`block bg-surface-container overflow-hidden group ${i === 0 ? "col-span-2 row-span-2" : ""}`}>
                                <img src={p.thumbnail || p.url} alt={p.title}
                                  className="h-full w-full object-cover group-hover:opacity-90 transition-opacity" loading="lazy" />
                              </a>
                            ))}
                          </div>
                          {photos.length > 6 && (
                            <a href={photos[6]?.url || mi.urlDrive || "#"} target="_blank" rel="noopener noreferrer"
                              className="text-[10px] text-on-surface-variant mt-1 inline-block underline underline-offset-2">
                              Ver las {photos.length} fotos →
                            </a>
                          )}
                        </>
                      );
                    }
                    return (
                      <>
                        <div className="mt-2 grid grid-cols-2 gap-1">
                          {match.media!.map((m: any, i: number) => (
                            <a key={i} href={m.urlDrive || m.url} target="_blank" rel="noopener noreferrer"
                              className="block aspect-video bg-surface-container overflow-hidden group">
                              <img src={m.url} alt={m.title} className="h-full w-full object-cover group-hover:opacity-90 transition-opacity" loading="lazy" />
                            </a>
                          ))}
                        </div>
                        {mi.urlParentDrive && (
                          <a href={mi.urlParentDrive} target="_blank" rel="noopener noreferrer"
                            className="text-[10px] text-on-surface-variant mt-1 inline-block underline underline-offset-2">
                            Ver todas las fotos →
                          </a>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
