"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { ArrowRight, Shield, Trophy, Users, Goal, CalendarDays } from "lucide-react";
import { useSaints, useSaintsScorers, useNextMatch, useSaintsMatches } from "@/hooks/useCopaData";

gsap.registerPlugin(useGSAP, ScrollTrigger);

function StatCounter({ value, label, suffix = "" }: { value: string | number; label: string; suffix?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const el = counterRef.current;
    if (!el) return;
    const num = typeof value === "string" ? parseInt(value.replace(/\D/g, ""), 10) : value;
    if (isNaN(num)) return;

    ScrollTrigger.create({
      trigger: ref.current,
      start: "top 85%",
      once: true,
      onEnter: () => {
        gsap.fromTo(el, { textContent: 0 }, {
          textContent: num,
          duration: 1.8,
          ease: "power4.out",
          snap: { textContent: 1 },
          onUpdate: () => {
            if (suffix) {
              el.textContent = String(Math.round(Number(el.textContent))) + suffix;
            }
          },
        });
      },
    });
  }, [value]);

  return (
    <div ref={ref} className="text-center md:text-left">
      <span ref={counterRef} className="block font-display text-5xl md:text-6xl font-bold text-club-red leading-none tracking-tight">
        0
      </span>
      <span className="block text-[10px] font-semibold uppercase tracking-[0.15em] text-on-surface-variant mt-2">
        {label}
      </span>
    </div>
  );
}

const easeOutExpo = [0.19, 1, 0.22, 1] as const;
const easeSmooth = [0.65, 0, 0.35, 1] as const;

export default function Home() {
  const { data: saints } = useSaints();
  const { data: scorers = [] } = useSaintsScorers();
  const { data: nextMatch } = useNextMatch();
  const { data: matches = [] } = useSaintsMatches();

  const stats = saints?.latest?.stats;
  const points = saints?.latest?.pts ?? 0;
  const pos = saints?.latest?.pos ?? 0;
  const played = stats?.played ?? 0;
  const wins = stats?.wins ?? 0;
  const goalsFor = stats?.goalsFor ?? 0;

  const finished = matches.filter((m) => m.finished);
  const lastMatch = finished[finished.length - 1];

  const heroRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 1 } });

      tl.fromTo(".hero-line", { y: 120, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, duration: 1.2, ease: "power4.out" }, 0.2)
        .fromTo(".hero-meta", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, 0.9)
        .fromTo(".hero-buttons", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, 1.1)
        .fromTo(".hero-indicator", { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.4 }, 1.4);

      // Marquee
      gsap.to(marqueeRef.current, {
        xPercent: -50,
        ease: "none",
        duration: 25,
        repeat: -1,
      });

      // Parallax stats
      gsap.to(".stats-row", {
        scrollTrigger: { trigger: ".stats-row", start: "top 80%", toggleActions: "play none none none" },
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power3.out",
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <>
      {/* ─── HERO ─── */}
      <section
        ref={heroRef}
        className="relative min-h-[92vh] flex items-center overflow-hidden bg-on-surface"
      >
        {/* Hero background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-on-surface via-on-surface to-club-red/20" />
        <div className="absolute top-1/2 right-0 w-[600px] h-[600px] -translate-y-1/2 bg-club-red/10 blur-[160px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-club-red/5 blur-[100px] rounded-full" />

        {/* Decorative red bar */}
        <div className="absolute top-32 md:top-48 left-0 w-1 md:w-1.5 h-32 bg-club-red" />

        <div className="relative z-10 w-full max-w-[1440px] mx-auto px-6 md:px-8 pt-24 md:pt-32 pb-16">
          <div ref={heroContentRef} className="max-w-4xl">
            <div className="overflow-hidden mb-3">
              <p className="hero-meta inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-club-red/80">
                <span className="inline-block h-2 w-2 bg-club-red" />
                USS Liga Premier · 2026
              </p>
            </div>

            <h1 className="font-display text-[18vw] md:text-[14vw] lg:text-[160px] font-bold leading-[0.78] tracking-[-0.03em] text-surface">
              <div className="overflow-hidden"><span className="hero-line block">SAINT</span></div>
              <div className="overflow-hidden"><span className="hero-line block text-club-red">FERDINAND</span></div>
            </h1>

            <div className="overflow-hidden mt-4 md:mt-6">
              <p className="hero-meta max-w-md text-sm md:text-base leading-relaxed text-surface/60">
                Madrid. Excelencia, pasión y precisión en el terreno de juego.
                Un club construido para la grandeza.
              </p>
            </div>

            <div className="hero-buttons flex flex-wrap gap-3 mt-8">
              <Link
                href="/partidos"
                className="group inline-flex items-center gap-2 bg-club-red px-8 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-white transition-all duration-300 hover:bg-club-red/90"
              >
                Calendario
                <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                href="/plantilla"
                className="inline-flex items-center gap-2 border-2 border-surface/30 px-8 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-surface/80 transition-all duration-300 hover:border-surface hover:text-surface"
              >
                Plantilla
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="hero-indicator absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-[8px] font-semibold uppercase tracking-[0.25em] text-surface/30">Scroll</span>
          <div className="h-8 w-[1px] bg-gradient-to-b from-surface/40 to-transparent animate-scroll-indicator" />
        </div>
      </section>

      {/* ─── MARQUEE TICKER ─── */}
      <div className="relative overflow-hidden bg-club-red py-4 border-y border-club-red/20">
        <div ref={marqueeRef} className="flex w-max gap-12 whitespace-nowrap">
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i} className="flex items-center gap-12 text-surface font-display text-sm md:text-base font-semibold uppercase tracking-[0.15em]">
              <span>Saint Ferdinand FC</span>
              <span className="text-surface/40">✦</span>
              <span>Est. 2024</span>
              <span className="text-surface/40">✦</span>
              <span>Madrid</span>
              <span className="text-surface/40">✦</span>
              <span>USS Liga Premier</span>
              <span className="text-surface/40">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* ─── STATS ROW ─── */}
      <section className="stats-row opacity-0 translate-y-6 bg-surface-container-low border-y border-border">
        <div className="max-w-[1440px] mx-auto px-6 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 py-12 md:py-14">
            <div className="md:border-r border-border md:pr-12">
              <StatCounter value={played} label="Partidos" />
            </div>
            <div className="md:border-r border-border md:px-12">
              <StatCounter value={goalsFor} label="Goles" />
            </div>
            <div className="md:border-r border-border md:px-12">
              <StatCounter value={wins} label="Victorias" />
            </div>
            <div className="md:px-12">
              <StatCounter value={`#${pos}`} label="Posición" suffix="" />
            </div>
          </div>
        </div>
      </section>

      {/* ─── LAST MATCH + TOP SCORERS ─── */}
      <section className="bg-surface-container-lowest">
        <div className="max-w-[1440px] mx-auto px-6 md:px-8 py-20 md:py-28">
          <div className="grid md:grid-cols-12 gap-8">
            {/* Last Match — editorial card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, ease: easeSmooth }}
              className="md:col-span-7"
            >
              <div className="h-full border border-border bg-surface-container-lowest p-8 md:p-12">
                <div className="flex items-center gap-2 mb-8">
                  <Trophy size={14} className="text-club-red" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-club-red">
                    Último Resultado
                  </span>
                </div>

                {lastMatch ? (
                  <div>
                    {/* Teams + Score */}
                    <div className="flex items-center justify-between gap-4 mb-6">
                      <div className="flex-1">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-on-surface-variant/60 mb-2">
                          LOCAL
                        </p>
                        <p className="font-display text-2xl md:text-3xl font-bold text-on-surface uppercase leading-tight">
                          {lastMatch.homeTeam.name === "SAINT FERDINAND" ? "Saint Ferdinand" : lastMatch.homeTeam.name}
                        </p>
                      </div>

                      <div className="text-center shrink-0">
                        <div className="font-display text-6xl md:text-7xl font-bold text-club-red leading-none tracking-tight">
                          {lastMatch.score?.home ?? "?"}
                          <span className="text-on-surface/20 mx-2">:</span>
                          {lastMatch.score?.away ?? "?"}
                        </div>
                        <span className="block text-[9px] font-semibold uppercase tracking-[0.15em] text-on-surface-variant/60 mt-2">
                          Final
                        </span>
                      </div>

                      <div className="flex-1 text-right">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-on-surface-variant/60 mb-2">
                          VISITANTE
                        </p>
                        <p className="font-display text-2xl md:text-3xl font-bold text-on-surface uppercase leading-tight">
                          {lastMatch.awayTeam.name === "SAINT FERDINAND" ? "Saint Ferdinand" : lastMatch.awayTeam.name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-on-surface-variant mt-8 pt-6 border-t border-border">
                      {lastMatch.venue && (
                        <span className="flex items-center gap-1.5">
                          <Shield size={12} />
                          {lastMatch.venue}
                        </span>
                      )}
                      {lastMatch.phase && (
                        <span className="flex items-center gap-1.5">
                          <CalendarDays size={12} />
                          {lastMatch.phase}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-40">
                    <p className="text-sm text-on-surface-variant">Sin partidos disputados aún</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Top Scorers — bento list */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: 0.1, ease: easeSmooth }}
              className="md:col-span-5"
            >
              <div className="h-full border border-border bg-surface-container-lowest p-8 md:p-10">
                <div className="flex items-center gap-2 mb-6">
                  <Goal size={14} className="text-club-red" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-club-red">
                    Goleadores
                  </span>
                </div>

                {scorers.length === 0 ? (
                  <p className="text-sm text-on-surface-variant">Sin datos</p>
                ) : (
                  <div className="space-y-1">
                    {scorers.slice(0, 6).map((p: any, i: number) => (
                      <motion.div
                        key={(p.playerName || i) + ""}
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05, duration: 0.3, ease: easeSmooth }}
                        className="group flex items-center gap-4 px-4 py-3 transition-colors duration-200 hover:bg-surface-container"
                      >
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center text-[10px] font-bold tracking-wider
                            ${i === 0 ? "bg-club-red text-white" : "bg-surface-container text-on-surface-variant"}
                          `}
                        >
                          {i + 1}
                        </span>
                        <span className="flex-1 text-sm font-medium text-on-surface capitalize truncate">
                          {p.playerName || "?"}
                        </span>
                        <span className="font-display text-xl font-bold text-club-red tabular-nums">
                          {p.goals}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                )}

                {scorers.length > 0 && (
                  <Link
                    href="/plantilla"
                    className="mt-6 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-on-surface-variant transition-colors duration-200 hover:text-club-red"
                  >
                    Ver plantilla completa <ArrowRight size={12} />
                  </Link>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── NEXT MATCH / CTA BANNER ─── */}
      <section className="relative overflow-hidden">
        {/* Dark background with red gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-on-surface via-on-surface to-club-red/30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-club-red/10 blur-[160px] rounded-full" />

        <div className="relative z-10 max-w-[1440px] mx-auto px-6 md:px-8 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease: easeSmooth }}
            className="flex flex-col md:flex-row items-center justify-between gap-8"
          >
            <div className="flex-1">
              <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-club-red/80 mb-4">
                <span className="h-1.5 w-1.5 bg-club-red" />
                Próximo Partido
              </span>

              {nextMatch ? (
                <>
                  <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-[-0.01em] text-surface leading-none">
                    vs{" "}
                    {nextMatch.awayTeam.name === "SAINT FERDINAND"
                      ? nextMatch.homeTeam.name
                      : nextMatch.awayTeam.name}
                  </h2>
                  <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-surface/60">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays size={14} />
                      {nextMatch.date
                        ? new Date(nextMatch.date).toLocaleDateString("es-ES", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                          })
                        : "Fecha por definir"}
                    </span>
                    {nextMatch.venue && (
                      <>
                        <span className="text-surface/20">·</span>
                        <span>{nextMatch.venue}</span>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-lg text-surface/50 mt-1">No hay próximos partidos programados</p>
              )}
            </div>

            <Link
              href="/partidos"
              className="group inline-flex items-center gap-3 border-2 border-surface/30 px-10 py-5 text-[10px] font-semibold uppercase tracking-[0.15em] text-surface transition-all duration-300 hover:border-surface shrink-0"
            >
              Ver Partido
              <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── CLUB VALUES ─── */}
      <section className="bg-surface-container-lowest border-b border-border">
        <div className="max-w-[1440px] mx-auto px-6 md:px-8 py-20 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: easeSmooth }}
            className="text-center mb-16"
          >
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-club-red">
              Nuestra Identidad
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-[-0.01em] text-on-surface mt-3">
              Hechos para la élite
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Trophy size={20} />,
                title: "Excelencia",
                desc: "Cada entrenamiento, cada partido, cada detalle está orientado a la búsqueda incansable de la perfección deportiva.",
              },
              {
                icon: <Users size={20} />,
                title: "Unidad",
                desc: "Somos más que un equipo. Una familia que comparte la pasión por el fútbol y el compromiso con nuestra comunidad.",
              },
              {
                icon: <Shield size={20} />,
                title: "Legado",
                desc: "Construyendo una historia de grandeza desde Madrid. Nuestro nombre es sinónimo de respeto y determinación.",
              },
            ].map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.1, duration: 0.5, ease: easeSmooth }}
                className="group border border-border bg-surface-container-lowest p-8 md:p-10 transition-all duration-300 hover:border-club-red/30 hover:bg-surface-container-low"
              >
                <div className="flex h-10 w-10 items-center justify-center bg-club-red/10 text-club-red mb-6 transition-colors duration-300 group-hover:bg-club-red group-hover:text-white">
                  {v.icon}
                </div>
                <h3 className="font-display text-xl font-bold uppercase tracking-wide text-on-surface mb-3">
                  {v.title}
                </h3>
                <p className="text-sm leading-relaxed text-on-surface-variant">
                  {v.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
