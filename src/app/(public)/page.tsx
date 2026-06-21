"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { ArrowRight, Trophy, Shield, Users, Goal, CalendarDays } from "lucide-react";
import { useSaints, useSaintsScorers, useNextMatch, useSaintsMatches } from "@/hooks/useCopaData";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const easeSmooth = [0.65, 0, 0.35, 1] as const;

function StatCounter({ value, label }: { value: string | number; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);

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
        });
      },
    });
  }, [value]);

  return (
    <div ref={ref} className="bento-stat p-8 flex flex-col justify-between h-48 md:h-56">
      <div className="flex justify-between items-start">
        <span className="text-primary font-label-sm uppercase tracking-widest">{label}</span>
      </div>
      <div>
        <div ref={counterRef} className="font-display-lg text-display-lg leading-none text-primary">
          0
        </div>
      </div>
    </div>
  );
}

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

  const heroRef = useRef<HTMLElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 0.8 } });
      tl.fromTo(".hero-line", { y: 80, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1, duration: 1, ease: "power4.out" }, 0.2)
        .fromTo(".hero-meta", { y: 24, opacity: 0 }, { y: 0, opacity: 1 }, 0.8)
        .fromTo(".hero-buttons", { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, 1.0)
        .fromTo(".hero-indicator", { opacity: 0 }, { opacity: 1, duration: 0.4 }, 1.2);

      gsap.to(marqueeRef.current, {
        xPercent: -50,
        ease: "none",
        duration: 25,
        repeat: -1,
      });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <>
      {/* ─── HERO ─── */}
      <section ref={heroRef} className="relative h-[85vh] md:h-[90vh] flex items-end overflow-hidden bg-inverse-surface">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface via-inverse-surface/60 to-transparent z-10" />
          <div className="w-full h-full bg-on-surface" />
          <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-primary-container/20 blur-[160px] rounded-full" />
        </div>

        <div className="relative z-20 w-full max-w-desktop mx-auto px-margin-mobile md:px-margin-desktop pb-section-gap">
          <div className="max-w-3xl">
            <div className="overflow-hidden mb-4">
              <p className="hero-meta font-label-sm text-label-sm uppercase tracking-[0.2em] text-primary-container/80">
                USS Liga Premier &middot; 2026
              </p>
            </div>
            <h1 className="font-display-xl text-display-xl uppercase leading-[0.9] text-white">
              <div className="overflow-hidden"><span className="hero-line block">Saint</span></div>
              <div className="overflow-hidden"><span className="hero-line block text-primary-container">Ferdinand</span></div>
            </h1>
            <div className="overflow-hidden mt-6">
              <p className="hero-meta font-body-lg text-body-lg text-surface-variant max-w-lg leading-relaxed">
                Madrid. Excelencia, pasión y precisión en el terreno de juego. Un club construido para la grandeza.
              </p>
            </div>
            <div className="hero-buttons flex flex-wrap gap-4 mt-10">
              <Link
                href="/partidos"
                className="bg-primary-container text-white font-label-lg uppercase px-10 py-4 tracking-widest transition-all duration-300 hover:brightness-110 inline-flex items-center gap-2"
              >
                Calendario <ArrowRight size={14} />
              </Link>
              <Link
                href="/plantilla"
                className="bg-transparent border-2 border-white/30 text-white font-label-lg uppercase px-10 py-4 tracking-widest transition-all duration-300 hover:bg-white hover:text-on-surface"
              >
                Plantilla
              </Link>
            </div>
          </div>
        </div>

        <div className="hero-indicator absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="font-label-sm text-label-sm uppercase tracking-[0.25em] text-white/30">Scroll</span>
          <div className="h-8 w-[1px] bg-gradient-to-b from-white/40 to-transparent animate-scroll-indicator" />
        </div>
      </section>

      {/* ─── MARQUEE ─── */}
      <div className="relative overflow-hidden bg-primary-container py-4">
        <div ref={marqueeRef} className="flex w-max gap-12 whitespace-nowrap">
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i} className="flex items-center gap-12 text-white font-display text-sm md:text-base font-semibold uppercase tracking-[0.15em]">
              <span>Saint Ferdinand FC</span>
              <span className="text-white/40">&bull;</span>
              <span>Est. 2024</span>
              <span className="text-white/40">&bull;</span>
              <span>Madrid</span>
              <span className="text-white/40">&bull;</span>
              <span>USS Liga Premier</span>
              <span className="text-white/40">&bull;</span>
            </span>
          ))}
        </div>
      </div>

      {/* ─── NEXT MATCH WIDGET ─── */}
      <section className="bg-surface-container-lowest">
        <div className="max-w-desktop mx-auto px-margin-mobile md:px-margin-desktop -mt-16 relative z-30">
          <div className="bg-surface-container-lowest border border-secondary-container p-8 md:p-10 grid grid-cols-1 md:grid-cols-3 items-center gap-8 md:gap-12 zero-gravity-shadow">
            {nextMatch ? (
              <>
                <div className="flex flex-col items-center md:items-end gap-4">
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-5xl text-primary">shield</span>
                    <div className="text-right">
                      <p className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-1">Local</p>
                      <h3 className="font-headline-md text-headline-md uppercase">ST. FERDINAND</h3>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center border-x-0 md:border-x border-secondary-container px-8 md:px-12 text-center">
                  <span className="font-label-lg text-label-lg text-primary uppercase mb-2 tracking-widest">Próximo Partido</span>
                  <div className="font-display-lg text-display-lg tracking-tighter text-on-surface mb-1">
                    {nextMatch.date ? new Date(nextMatch.date).toLocaleDateString("es-ES", { day: "numeric", month: "short" }).toUpperCase() : "PRÓXIMAMENTE"}
                  </div>
                  <div className="font-headline-md text-headline-md text-primary">VS</div>
                </div>

                <div className="flex flex-col items-center md:items-start gap-4">
                  <div className="flex items-center gap-4">
                    <div className="text-left">
                      <p className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-1">Visitante</p>
                      <h3 className="font-headline-md text-headline-md uppercase">
                        {nextMatch.awayTeam.name === "SAINT FERDINAND" ? nextMatch.homeTeam.name : nextMatch.awayTeam.name}
                      </h3>
                    </div>
                    <span className="material-symbols-outlined text-5xl text-secondary">shield</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="col-span-3 text-center py-8">
                <p className="font-headline-md text-headline-md text-on-surface-variant">No hay próximos partidos</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── STATS ROW ─── */}
      <section className="py-section-gap bg-surface-container-low">
        <div className="max-w-desktop mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
            <StatCounter value={played} label="Partidos" />
            <StatCounter value={goalsFor} label="Goles" />
            <StatCounter value={wins} label="Victorias" />
            <StatCounter value={`#${pos}`} label="Posición" />
          </div>
        </div>
      </section>

      {/* ─── LAST MATCH + TOP SCORERS ─── */}
      <section className="bg-surface-container-lowest">
        <div className="max-w-desktop mx-auto px-margin-mobile md:px-margin-desktop py-section-gap">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
            {/* Last Match */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease: easeSmooth }}
              className="md:col-span-7 bg-white border border-surface-container-high p-8 md:p-10"
            >
              <div className="flex items-center gap-2 mb-8">
                <Trophy size={14} className="text-primary" />
                <span className="font-label-sm text-label-sm text-primary uppercase tracking-[0.2em]">Último Resultado</span>
              </div>

              {lastMatch ? (
                <div>
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <div className="flex-1">
                      <p className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant/60 mb-2">LOCAL</p>
                      <p className="font-headline-md text-headline-md uppercase text-on-surface">
                        {lastMatch.homeTeam.name === "SAINT FERDINAND" ? "SAINT FERDINAND" : lastMatch.homeTeam.name}
                      </p>
                    </div>

                    <div className="text-center shrink-0">
                      <div className="font-display-lg text-display-lg text-primary leading-none tracking-tight">
                        {lastMatch.score?.home ?? "?"}
                        <span className="text-on-surface/20 mx-2">:</span>
                        {lastMatch.score?.away ?? "?"}
                      </div>
                      <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant/60 mt-1 block">FT</span>
                    </div>

                    <div className="flex-1 text-right">
                      <p className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant/60 mb-2">VISITANTE</p>
                      <p className="font-headline-md text-headline-md uppercase text-on-surface">
                        {lastMatch.awayTeam.name === "SAINT FERDINAND" ? "SAINT FERDINAND" : lastMatch.awayTeam.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 font-body-md text-body-md text-on-surface-variant mt-8 pt-6 border-t border-surface-container">
                    {lastMatch.venue && <span>{lastMatch.venue}</span>}
                    {lastMatch.phase && <><span className="text-on-surface/20">|</span><span>{lastMatch.phase}</span></>}
                  </div>
                </div>
              ) : (
                <p className="font-body-lg text-body-lg text-on-surface-variant py-10 text-center">Sin partidos disputados aún</p>
              )}
            </motion.div>

            {/* Top Scorers */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: 0.1, ease: easeSmooth }}
              className="md:col-span-5 bg-white border border-surface-container-high p-8 md:p-10"
            >
              <div className="flex items-center gap-2 mb-8">
                <Goal size={14} className="text-primary" />
                <span className="font-label-sm text-label-sm text-primary uppercase tracking-[0.2em]">Goleadores</span>
              </div>

              {scorers.length === 0 ? (
                <p className="font-body-lg text-body-lg text-on-surface-variant">Sin datos</p>
              ) : (
                <div className="space-y-1">
                  {scorers.slice(0, 6).map((p: any, i: number) => (
                    <motion.div
                      key={(p.playerName || i) + ""}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05, duration: 0.3, ease: easeSmooth }}
                      className="flex items-center gap-4 px-4 py-3 transition-colors duration-200 hover:bg-surface-container"
                    >
                      <span className={`flex h-7 w-7 shrink-0 items-center justify-center font-label-sm text-label-sm uppercase tracking-wider
                        ${i === 0 ? "bg-primary text-white" : "bg-surface-container text-on-surface-variant"}
                      `}>
                        {i + 1}
                      </span>
                      <span className="flex-1 font-body-md text-body-md text-on-surface capitalize truncate">
                        {p.playerName || "?"}
                      </span>
                      <span className="font-headline-md text-headline-md text-primary tabular-nums">{p.goals}</span>
                    </motion.div>
                  ))}
                </div>
              )}

              {scorers.length > 0 && (
                <Link
                  href="/plantilla"
                  className="mt-6 inline-flex items-center gap-2 font-label-sm text-label-sm text-on-surface-variant hover:text-primary uppercase tracking-widest transition-colors"
                >
                  Ver plantilla <ArrowRight size={12} />
                </Link>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── CLUB VALUES ─── */}
      <section className="py-section-gap bg-surface">
        <div className="max-w-desktop mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="grid grid-cols-12 gap-gutter mb-16">
            <div className="col-span-12 md:col-span-6">
              <h2 className="font-headline-lg text-headline-lg uppercase border-l-4 border-primary pl-6">Nuestra Identidad</h2>
            </div>
            <div className="col-span-12 md:col-span-6 flex items-center">
              <p className="font-body-md text-body-md text-secondary border-t border-secondary-container pt-4 w-full">
                Nuestros valores son los pilares arquitectónicos de nuestra institución, guiando cada pase, cada gol y cada decisión.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter">
            {[
              { icon: "favorite", title: "Pasión", desc: "El fuego interior que impulsa a nuestros atletas a trascender sus límites físicos en cada partido." },
              { icon: "shield", title: "Honor", desc: "Defender el prestigio del club mediante una conducta impecable dentro y fuera del campo." },
              { icon: "diversity_3", title: "Unión", desc: "La fuerza colectiva de nuestra plantilla y comunidad global, forjada en una unidad inquebrantable." },
              { icon: "diamond", title: "Excelencia", desc: "La búsqueda incansable de la perfección técnica y el dominio estratégico en cada aspecto del juego." },
            ].map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.08, duration: 0.5, ease: easeSmooth }}
                className="group p-8 md:p-10 bg-surface-container-lowest border border-surface-container-high transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/5"
              >
                <div className="mb-8 w-16 h-16 rounded-full border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                  <span className="material-symbols-outlined text-3xl">{v.icon}</span>
                </div>
                <h3 className="font-headline-md text-headline-md uppercase mb-4 tracking-tight">{v.title}</h3>
                <p className="font-body-md text-body-md text-secondary leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── NEXT MATCH CTA ─── */}
      <section className="relative py-section-gap bg-primary-container text-white overflow-hidden">
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-10 mix-blend-overlay bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEwMCAwIEMgODAgMjAsIDUwIDEwLCAzMCA1MCBTIDAgODAsIDAgMTAwIEwgMTAwIDEwMCBaIiBmaWxsPSIjZmZmIi8+PC9zdmc+')] bg-contain bg-no-repeat bg-right" />
        <div className="relative z-10 max-w-desktop mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <span className="font-label-sm text-label-sm uppercase tracking-[0.3em] text-white/80 mb-4 block">No te lo pierdas</span>
              <h2 className="font-display-lg text-display-lg uppercase tracking-tighter">
                Vive la emoción del estadio
              </h2>
              <p className="font-body-lg text-body-lg text-white/80 max-w-xl mt-4">
                Consigue tus abonos o entradas. Únete al muro de sonido en el Estadio San Fernando.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 shrink-0">
              <Link
                href="/partidos"
                className="bg-white text-primary font-label-lg uppercase px-10 py-4 tracking-widest transition-all hover:bg-on-surface hover:text-white"
              >
                Calendario
              </Link>
              <Link
                href="/contacto"
                className="bg-transparent border-2 border-white text-white font-label-lg uppercase px-10 py-4 tracking-widest transition-all hover:bg-white hover:text-primary"
              >
                Entradas
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
