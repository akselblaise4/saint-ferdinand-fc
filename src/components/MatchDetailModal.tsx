"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Match, MatchEvent } from "@/types/football";

const AC_GOAL = 7;
const AC_CARD = 9;
const AC_SUB_IN = 1;

interface MatchDetailModalProps {
  match: Match | null;
  teamPhotos: Record<string, string>;
  onClose: () => void;
}

function Shield({ src, name, size = "md" }: { src?: string | null; name: string; size?: "sm" | "md" | "lg" }) {
  const dim = size === "lg" ? "w-14 h-14" : size === "sm" ? "w-8 h-8" : "w-12 h-12";
  return (
    <div className={`${dim} bg-surface-container-highest flex items-center justify-center rounded-full shrink-0 overflow-hidden`}>
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span className="font-stats-num text-sm text-on-surface-variant">{name.charAt(0)}</span>
      )}
    </div>
  );
}

function TimelineEvent({ event, isHome }: { event: MatchEvent; isHome: boolean }) {
  if (event.ac === AC_GOAL) {
    return (
      <div className={`flex items-center gap-3 ${isHome ? "flex-row" : "flex-row-reverse"}`}>
        <div className="w-8 h-8 bg-primary-container/30 border border-primary-container/50 flex items-center justify-center shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-primary">
            <circle cx="12" cy="12" r="9" opacity="0.3" />
            <circle cx="12" cy="12" r="5" />
          </svg>
        </div>
        <div className={`flex flex-col ${isHome ? "items-start" : "items-end"}`}>
          <span className="font-label-caps text-label-caps text-on-surface">{event.playerName}</span>
          <span className="font-stats-num text-[11px] text-on-surface-variant">{event.minute}&apos;</span>
        </div>
      </div>
    );
  }
  if (event.ac === AC_CARD) {
    return (
      <div className={`flex items-center gap-3 ${isHome ? "flex-row" : "flex-row-reverse"}`}>
        <div className={`w-3 h-4 shrink-0 ${(event.val2 === 2 || event.val2 === 1) ? "bg-yellow-400" : "bg-red-500"}`} />
        <div className={`flex flex-col ${isHome ? "items-start" : "items-end"}`}>
          <span className="font-label-caps text-label-caps text-on-surface">{event.playerName}</span>
          <span className="font-stats-num text-[11px] text-on-surface-variant">{event.minute}&apos;</span>
        </div>
      </div>
    );
  }
  if (event.ac === AC_SUB_IN) {
    return (
      <div className={`flex items-center gap-3 ${isHome ? "flex-row" : "flex-row-reverse"}`}>
        <div className="w-8 h-8 bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-on-surface-variant">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </div>
        <div className={`flex flex-col ${isHome ? "items-start" : "items-end"}`}>
          <span className="font-label-caps text-label-caps text-on-surface">{event.playerName}</span>
          {event.val3 ? <span className="font-stats-num text-[10px] text-on-surface-variant">Sale #{event.val3}</span> : null}
          <span className="font-stats-num text-[11px] text-on-surface-variant">{event.minute}&apos;</span>
        </div>
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
  const info = match?.details?.info;
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
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className="relative w-full max-w-lg mx-4 mb-0 md:mb-0 bg-surface border border-white/10 rounded-none shadow-2xl max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 sticky top-0 bg-surface z-10">
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                {match.phase !== "regular" ? match.phase : match.round || "Fase Regular"}
              </span>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="text-on-surface">
                  <path d="M4 4l8 8M12 4l-8 8" />
                </svg>
              </button>
            </div>

            {/* Teams & Score */}
            <div className="px-6 py-8 flex items-center gap-6 justify-center">
              <div className="flex flex-col items-center gap-3 flex-1">
                <Shield src={teamPhotos[match.homeTeam?.id || ""]} name={match.homeTeam?.name || ""} size="lg" />
                <span className="font-headline-md text-body-lg uppercase text-center leading-tight">{match.homeTeam?.name || "Local"}</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-3">
                  <span className="font-display-xl text-[48px] md:text-[56px] leading-none">{match.score?.home != null ? match.score.home : "—"}</span>
                  <span className="font-display-xl text-[48px] md:text-[56px] leading-none text-on-surface-variant opacity-40">-</span>
                  <span className="font-display-xl text-[48px] md:text-[56px] leading-none">{match.score?.away != null ? match.score.away : "—"}</span>
                </div>
                {match.penalties?.home != null && match.penalties?.away != null && (
                  <span className="font-label-caps text-label-caps text-on-surface-variant mt-2">
                    Penales: {match.penalties.home} - {match.penalties.away}
                  </span>
                )}
              </div>
              <div className="flex flex-col items-center gap-3 flex-1">
                <Shield src={teamPhotos[match.awayTeam?.id || ""]} name={match.awayTeam?.name || ""} size="lg" />
                <span className="font-headline-md text-body-lg uppercase text-center leading-tight">{match.awayTeam?.name || "Visita"}</span>
              </div>
            </div>

            {/* Divider */}
            <div className="h-[1px] bg-white/5 mx-6" />

            {/* Info Grid */}
            <div className="px-6 py-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider">Fecha</span>
                  <p className="font-stats-num text-[14px] mt-1">{match.date || "—"}</p>
                </div>
                <div>
                  <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider">Cancha</span>
                  <p className="font-stats-num text-[14px] mt-1">{match.venue || "—"}</p>
                </div>
                <div>
                  <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider">Fase</span>
                  <p className="font-stats-num text-[14px] mt-1">{match.phase !== "regular" ? match.phase : match.round || "Fase Regular"}</p>
                </div>
                <div>
                  <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider">Estado</span>
                  <p className="font-stats-num text-[14px] mt-1">{match.finished ? "Finalizado" : "Pendiente"}</p>
                </div>
              </div>

              {/* Card Summary */}
              {info && (Number(info.as_yellow) > 0 || Number(info.as_red) > 0 || Number(info.as_blue) > 0) && (
                <>
                  <div className="h-[1px] bg-white/5" />
                  <div>
                    <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider">Tarjetas</span>
                    <div className="flex items-center gap-4 mt-2">
                      {Number(info.as_yellow) > 0 && (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-3 bg-yellow-400" />
                          <span className="font-stats-num text-[14px]">{info.as_yellow}</span>
                        </div>
                      )}
                      {Number(info.as_red) > 0 && (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-3 bg-red-500" />
                          <span className="font-stats-num text-[14px]">{info.as_red}</span>
                        </div>
                      )}
                      {Number(info.as_blue) > 0 && (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-3 bg-blue-500" />
                          <span className="font-stats-num text-[14px]">{info.as_blue}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Walkover */}
              {match.walkover && (
                <>
                  <div className="h-[1px] bg-white/5" />
                  <div className="bg-primary-container/20 border border-primary-container/40 px-4 py-3">
                    <p className="font-label-caps text-label-caps text-primary">Walkover — Partido adjudicado</p>
                  </div>
                </>
              )}

              {/* MVP */}
              {bestPlayer && (
                <>
                  <div className="h-[1px] bg-white/5" />
                  <div className="bg-yellow-500/10 border border-yellow-500/30 px-4 py-3 flex items-center gap-3">
                    <span className="text-yellow-400 text-lg">★</span>
                    <div>
                      <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider">MVP del Partido</span>
                      <p className="font-label-caps text-label-caps text-on-surface">
                        {(events.find(e => e.playerId === bestPlayer)?.playerName) || bestPlayer.substring(0, 8)}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* Event Timeline */}
              {events.length > 0 && (
                <>
                  <div className="h-[1px] bg-white/5" />
                  <div>
                    <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider">Desarrollo del partido</span>
                    <div className="mt-3 space-y-3">
                      {events.map((event, i) => {
                        const isHome = event.teamId === match.homeTeam?.id;
                        return (
                          <div key={event.id || i} className="flex">
                            <div className={`flex-1 ${isHome ? "" : "text-right"}`}>
                              <TimelineEvent event={event} isHome={isHome} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {events.length === 0 && match.finished && (
                <>
                  <div className="h-[1px] bg-white/5" />
                  <div className="py-6 flex items-center justify-center">
                    <p className="font-label-caps text-label-caps text-on-surface-variant text-center">
                      No hay eventos registrados para este partido
                    </p>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
