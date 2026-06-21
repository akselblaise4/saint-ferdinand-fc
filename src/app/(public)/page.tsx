"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import Link from "next/link";
import { useSaints, useSaintsScorers, useNextMatch, useSaintsMatches } from "@/hooks/useCopaData";

const HERO_IMAGE = "https://lh3.googleusercontent.com/aida-public/AB6AXuAtGgpt-RKNr_nEv_oDiMzJzmOjQWaXme4q85pQQeY1Llk9tbJzVNpCMr_TuXyDzj3d6V9DKgPWwzkyAToc5e8sXTN-N_0ol5ocWkFIRJ-ZE4BhPqbbLjUsFPaeQl-jHb9kO1fVKqGK2jCNI7uFDTVbrXKESO-8k1S3eKfnN5YmF9oSVin-Nc4mioZEy7fmMMRUJ4RSUGM6UBXndgVM6LS5SQ_lbMdIfXOGDWSCZiOsHG_ucbCwc7DuXvlQmDqdCaxnrLd5dLleT3g";
const FEATURED_IMAGE = "https://lh3.googleusercontent.com/aida-public/AB6AXuBI2DEF9yZxeNmpq2wA7IL5mVj7TQFoBalxSCDYddu2JsluThqtS4sko15dK4jP5faXEBjsBFntikZTQikyQvnugZH18SCevb0IjLZI8haIjTMsgmlgdQ2XGXJD2raiDDlnrpbTVslImRK0kIMwlXz5JKAnk2C011dHxb-3Vs8L8r44IVA68yz0GxU3LpkJQInv8-6wi0Gz1Leffce0gv8H9PMaa3uerL9LKAG8pZsLD_4WHc--xvCUW2wjPM-z9X1Qhwljn1ibkpE";
const TRAINING_IMAGE = "https://lh3.googleusercontent.com/aida-public/AB6AXuCifpRdjz5jKjrqUG_qzbed2z_tOo0zrXXEvinDEKxrpXj_y4Idta0nnacSqAAF_TxQdcqSLOycElOyneU1DmK1G1nCQXAEZEgBhlGLhBFcmm8qDfYF19JmjIIRYwL4rLMytwkPxuelgLD8Htm2Bx0wEtrQLX42szunQI9b9ZKZ3Wvul6iHGOIHfVyFxKmr0SGvk73h5gM6TkEQ-tAtkqMZkkcVbTNiMskTekdp5ytxCBScWlsENH1UiruG7sKD07WFARKox6dY9lw";
const KIT_IMAGE = "https://lh3.googleusercontent.com/aida-public/AB6AXuCdVi1G8CUkRrD3d_wxMEHtmY0_OH-tvywxFfrJOnRmJCctTnhH0As8QxMf_gG2hBT9GcZ-3w_HZrwkjlJ1QIuVlvWpWEVtq-2YUoCIXokRXAG7ZNMZ7waU9PlgnC9avKeo-u93IluRI1_LMRBSI2_FXHFv4SuSBXD1r4QPVUMMNzICMUaaQJibtcW1rd0R62rVr3rMswvb8ulbYH9GJ6hpZzB5TeIJKkAuV4-nInnix3KO2epnX2vd9XjHoNbLFpivkgYhtnqj7lU";

gsap.registerPlugin(useGSAP);

export default function Home() {
  const { data: saints } = useSaints();
  const { data: scorers = [] } = useSaintsScorers();
  const { data: nextMatch } = useNextMatch();
  const { data: matches = [] } = useSaintsMatches();

  const stats = saints?.latest?.stats;
  const pos = saints?.latest?.pos ?? 0;
  const played = stats?.played ?? 0;
  const wins = stats?.wins ?? 0;
  const goalsFor = stats?.goalsFor ?? 0;

  const finished = matches.filter((m) => m.finished);
  const lastMatch = finished[finished.length - 1];

  const heroRef = useRef<HTMLElement>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const heroTagRef = useRef<HTMLParagraphElement>(null);
  const heroBtnsRef = useRef<HTMLDivElement>(null);

  const [countdown, setCountdown] = useState({ days: "00", hours: "00", mins: "00" });

  useEffect(() => {
    if (!nextMatch?.date) return;
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const matchTime = new Date(nextMatch.date!).getTime();
      const diff = matchTime - now;
      if (diff <= 0) { clearInterval(interval); return; }
      setCountdown({
        days: String(Math.floor(diff / (1000 * 60 * 60 * 24))).padStart(2, "0"),
        hours: String(Math.floor((diff / (1000 * 60 * 60)) % 24)).padStart(2, "0"),
        mins: String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, "0"),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [nextMatch]);

  useGSAP(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(heroTitleRef.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1, delay: 0.3 })
        .fromTo(heroTagRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8 }, "-=0.4")
        .fromTo(heroBtnsRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, "-=0.3");
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <>
      <header ref={heroRef} className="relative w-full h-[95vh] overflow-hidden bg-on-background">
        <img src={HERO_IMAGE} alt="" className="absolute inset-0 w-full h-full object-cover opacity-80 scale-105 transition-transform duration-10000 hover:scale-100" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
        <div className="relative z-20 flex flex-col items-center justify-center h-full text-center px-margin-mobile md:px-margin-desktop">
          <div className="overflow-hidden">
            <h1 ref={heroTitleRef} className="font-display-xl text-display-xl text-surface mb-4 uppercase tracking-tighter">
              SAINT FERDINAND FC
            </h1>
          </div>
          <div className="overflow-hidden">
            <p ref={heroTagRef} className="font-headline-lg text-headline-lg text-surface/60 mb-12 uppercase tracking-[0.2em]">
              THE PITCH IS OUR STAGE
            </p>
          </div>
          <div ref={heroBtnsRef} className="flex flex-col md:flex-row gap-6 mt-4">
            <Link href="/plantilla" className="px-12 py-4 bg-primary text-on-primary font-label-lg uppercase tracking-widest hover:scale-105 transition-transform duration-300">
              Explorar Equipo
            </Link>
            <Link href="/partidos" className="px-12 py-4 bg-transparent border-2 border-surface text-surface font-label-lg uppercase tracking-widest hover:bg-surface hover:text-on-background transition-all duration-300">
              Ver Partidos
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-desktop mx-auto px-margin-mobile md:px-margin-desktop -mt-24 relative z-30">
        <div className="bg-surface-container-lowest border border-secondary-container p-8 md:p-10 grid grid-cols-1 md:grid-cols-3 items-center gap-8 md:gap-12 zero-gravity-shadow">
          {nextMatch ? (
            <>
              <div className="flex flex-col items-center md:items-end gap-4">
                <div className="w-24 h-24 flex items-center justify-center p-2">
                  <span className="material-symbols-outlined text-[80px] text-primary">shield</span>
                </div>
                <div className="text-center md:text-right">
                  <p className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-1">Local</p>
                  <h3 className="font-headline-md text-headline-md uppercase">ST. FERDINAND</h3>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center border-x-0 md:border-x border-secondary-container px-6 md:px-12 text-center">
                <p className="font-label-lg text-label-lg text-primary uppercase mb-2 tracking-widest">Kick Off</p>
                <div className="font-display-lg text-display-lg tracking-tighter text-on-surface mb-4">
                  {nextMatch.date ? new Date(nextMatch.date).toLocaleDateString("es-ES", { day: "numeric", month: "short" }).toUpperCase() : "PRÓXIMAMENTE"}
                </div>
                <div className="flex gap-4 font-label-sm text-label-sm text-on-surface-variant uppercase">
                  <div className="flex flex-col items-center">
                    <span className="text-on-surface font-bold text-lg">{countdown.days}</span>
                    <span>DÍAS</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-on-surface font-bold text-lg">{countdown.hours}</span>
                    <span>HRS</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-on-surface font-bold text-lg">{countdown.mins}</span>
                    <span>MIN</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center md:items-start gap-4">
                <div className="w-24 h-24 flex items-center justify-center p-2">
                  <span className="material-symbols-outlined text-[80px] text-secondary">shield</span>
                </div>
                <div className="text-center md:text-left">
                  <p className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-1">Visitante</p>
                  <h3 className="font-headline-md text-headline-md uppercase">
                    {nextMatch.awayTeam.name === "SAINT FERDINAND" ? nextMatch.homeTeam.name : nextMatch.awayTeam.name}
                  </h3>
                </div>
              </div>
            </>
          ) : (
            <div className="col-span-3 text-center py-8">
              <p className="font-headline-md text-headline-md text-on-surface-variant">No hay próximos partidos programados</p>
            </div>
          )}
        </div>
      </div>

      <section className="max-w-desktop mx-auto px-margin-mobile md:px-margin-desktop py-section-gap">
        <div className="flex justify-between items-end mb-12">
          <div>
            <span className="font-label-lg text-label-lg text-primary uppercase tracking-widest">En Foco</span>
            <h2 className="font-headline-lg text-headline-lg uppercase mt-2">Lo Último Del Club</h2>
          </div>
          <Link href="/blog" className="font-label-lg text-label-lg text-on-surface-variant hover:text-primary uppercase flex items-center gap-2 group hidden md:flex">
            Ver Noticias <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 grid-rows-2 gap-gutter h-auto md:h-[800px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="md:col-span-8 md:row-span-2 group relative overflow-hidden bg-surface-container-high cursor-pointer"
          >
            <img src={FEATURED_IMAGE} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            {lastMatch ? (
              <div className="absolute bottom-0 left-0 p-8 md:p-12 text-white w-full">
                <span className="bg-primary px-3 py-1 font-label-sm text-label-sm uppercase tracking-wider mb-4 inline-block">
                  {lastMatch.phase || "Resultado"}
                </span>
                <div className="flex items-center gap-6 md:gap-10 flex-wrap">
                  <div className="flex-1 min-w-[120px]">
                    <p className="font-label-sm text-label-sm uppercase tracking-widest text-white/60 mb-1">LOCAL</p>
                    <h3 className="font-headline-md text-headline-md uppercase">
                      {lastMatch.homeTeam.name === "SAINT FERDINAND" ? "SAINT FERDINAND" : lastMatch.homeTeam.name}
                    </h3>
                  </div>
                  <div className="text-center shrink-0">
                    <div className="font-display-lg text-display-lg text-white leading-none tracking-tight">
                      {lastMatch.score?.home ?? "?"}
                      <span className="text-white/20 mx-2">:</span>
                      {lastMatch.score?.away ?? "?"}
                    </div>
                    <span className="font-label-sm text-label-sm uppercase tracking-widest text-white/60 mt-1 block">FT</span>
                  </div>
                  <div className="flex-1 min-w-[120px] text-right">
                    <p className="font-label-sm text-label-sm uppercase tracking-widest text-white/60 mb-1">VISITANTE</p>
                    <h3 className="font-headline-md text-headline-md uppercase">
                      {lastMatch.awayTeam.name === "SAINT FERDINAND" ? "SAINT FERDINAND" : lastMatch.awayTeam.name}
                    </h3>
                  </div>
                </div>
                {lastMatch.venue && <p className="font-body-md text-body-md text-white/60 mt-4">{lastMatch.venue}</p>}
              </div>
            ) : (
              <div className="absolute bottom-0 left-0 p-8 md:p-12 text-white">
                <span className="bg-primary px-3 py-1 font-label-sm text-label-sm uppercase tracking-wider mb-4 inline-block">Primer Equipo</span>
                <h3 className="font-display-lg text-display-lg uppercase leading-[1.1] max-w-xl">Saint Ferdinand FC</h3>
                 <p className="font-body-lg text-body-lg text-surface/60 mt-4 max-w-lg">La excelencia en el terreno de juego.</p>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="md:col-span-4 group relative overflow-hidden bg-surface-container-high border border-secondary-container cursor-pointer"
          >
            <img src={TRAINING_IMAGE} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 p-8 text-white">
              <span className="font-label-sm text-label-sm uppercase tracking-widest opacity-80">Academia</span>
              <h4 className="font-headline-md text-headline-md uppercase mt-2">Nuevas Instalaciones</h4>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="md:col-span-4 group relative overflow-hidden bg-surface-container-high border border-secondary-container cursor-pointer"
          >
            <img src={KIT_IMAGE} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 p-8 text-white">
              <span className="font-label-sm text-label-sm uppercase tracking-widest opacity-80">Tienda</span>
              <h4 className="font-headline-md text-headline-md uppercase mt-2">Nueva Equipación 24/25</h4>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative py-section-gap overflow-hidden bg-on-background text-surface">
        <div className="absolute -top-1/4 -right-1/4 w-[600px] md:w-[800px] h-[600px] md:h-[800px] bg-primary/10 organic-curve blur-3xl opacity-30" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[450px] md:w-[600px] h-[450px] md:h-[600px] bg-primary organic-curve blur-3xl opacity-10" />
        <div className="max-w-desktop mx-auto px-margin-mobile md:px-margin-desktop relative z-10">
          <div className="max-w-3xl">
            <span className="font-label-lg text-label-lg text-primary uppercase tracking-[0.3em]">Hazte Leyenda</span>
            <h2 className="font-display-lg text-display-lg uppercase mt-4 mb-8">Únete al Saint Ferdinand</h2>
            <p className="font-body-lg text-body-lg text-surface/60 mb-12">
              Acceso exclusivo a entradas, contenido solo para miembros y beneficios premium. Sé más que un espectador—forma parte de la institución.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 mb-12">
              <div className="flex gap-4">
                <span className="material-symbols-outlined text-primary text-3xl">confirmation_number</span>
                <div>
                  <h5 className="font-headline-sm text-headline-sm uppercase">Acceso Prioritario</h5>
                  <p className="text-surface/60 mt-1 font-body-md text-body-md">Entradas anticipadas para los partidos más demandados.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="material-symbols-outlined text-primary text-3xl">workspace_premium</span>
                <div>
                  <h5 className="font-headline-sm text-headline-sm uppercase">Tienda Exclusiva</h5>
                  <p className="text-surface/60 mt-1 font-body-md text-body-md">Ediciones limitadas disponibles solo para miembros.</p>
                </div>
              </div>
            </div>
            <Link href="/contacto" className="inline-block bg-primary text-on-primary px-16 py-5 font-label-lg uppercase tracking-widest hover:scale-105 transition-transform duration-300">
              Unirse
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
