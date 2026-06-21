"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight, Zap, Crosshair, Flame, Trophy,
  TvIcon as Tv,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Marquee } from "@/components/football/marquee";
import { BorderBeam } from "@/components/football/border-beam";

function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rx = useSpring(x, { stiffness: 200, damping: 20 });
  const ry = useSpring(y, { stiffness: 200, damping: 20 });
  const transform = useTransform(() => `perspective(800px) rotateY(${ry.get()}deg) rotateX(${-rx.get()}deg) scale(1.02)`);

  const handleMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientY - rect.top - rect.height / 2) / 20);
    y.set((e.clientX - rect.left - rect.width / 2) / 20);
  };
  const handleLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ transform }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Counter({ end, suffix = "" }: { end: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const dur = 40;
    const step = Math.ceil(end / dur);
    const t = setInterval(() => {
      start += step;
      if (start >= end) { setVal(end); clearInterval(t); }
      else setVal(start);
    }, 30);
    return () => clearInterval(t);
  }, [end]);
  return <>{val}{suffix}</>;
}

const stats = [
  { label: "PARTIDOS", end: 15, icon: Zap },
  { label: "GOLES", end: 42, icon: Crosshair },
  { label: "VICTORIAS", end: 11, icon: Flame },
  { label: "PTS", end: 34, icon: Trophy },
];

const scorers = [
  { n: "M. López", g: 14, a: 5 },
  { n: "R. Gómez", g: 11, a: 7 },
  { n: "L. Fernández", g: 9, a: 10 },
  { n: "P. Torres", g: 6, a: 14 },
];

export default function Home() {
  return (
    <>
      <Marquee />

      {/* HERO — full bleed, texto partido en dos */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,32,48,0.12)_0%,transparent_60%)]" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-club-red/5 rounded-full blur-[120px]" />

        <div className="relative w-full px-6 md:px-16">
          <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center max-w-7xl mx-auto">
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -60 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] text-club-red/80 mb-4">
                  <span className="w-2 h-2 rounded-full bg-club-red animate-pulse" />
                  TEMP 2026 · USS LP
                </span>
                <h1 className="font-display text-7xl sm:text-8xl md:text-9xl lg:text-[140px] leading-[0.78] text-white">
                  SAINT
                  <br />
                  <span className="text-club-red italic [text-shadow:0_0_60px_rgba(212,32,48,0.4)]">
                    FERDINAND
                  </span>
                </h1>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="text-sm text-muted-foreground/80 max-w-md leading-relaxed"
              >
                Madrid. Precisión, pasión y excelencia en la USS Liga Premier.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.35 }}
                className="flex gap-3"
              >
                <Button variant="primary" size="lg" hoverGlow>
                  Calendario <ArrowRight size={16} />
                </Button>
                <Button variant="glass" size="lg">
                  Plantilla
                </Button>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="hidden md:block"
            >
              <TiltCard>
                <div className="relative aspect-square rounded-3xl border border-white/10 bg-gradient-to-br from-card/60 to-card/20 backdrop-blur-xl p-8 flex items-center justify-center overflow-hidden">
                  <BorderBeam size={300} colorFrom="#D42030" colorTo="#CEAB5D" />
                  <div className="text-center relative z-10">
                    <div className="font-display text-[180px] leading-none text-white/5 select-none absolute -top-10 -right-10">
                      SFC
                    </div>
                    <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-club-red to-club-gold/60 flex items-center justify-center shadow-[0_0_60px_rgba(212,32,48,0.3)]">
                      <span className="font-display text-5xl text-white">SF</span>
                    </div>
                    <p className="mt-4 text-xs text-muted-foreground font-mono uppercase tracking-widest">
                      USS Liga Premier
                    </p>
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* STATS — contadores animados con glassmorphism */}
      <section className="px-6 md:px-16 max-w-7xl mx-auto -mt-20 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="glass rounded-2xl p-6 text-center border border-white/5 hover:border-club-red/30 transition-all duration-500 group"
            >
              <s.icon size={18} className="mx-auto text-club-red/40 group-hover:text-club-red transition-colors mb-2" />
              <div className="font-display text-5xl md:text-6xl italic text-club-red">
                <Counter end={s.end} />
              </div>
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mt-1">
                {s.label}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ULTIMO RESULTADO + GOLEADORES — dos columnas asimétricas */}
      <section className="px-6 md:px-16 max-w-7xl mx-auto py-24">
        <div className="grid md:grid-cols-5 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="md:col-span-3 glass rounded-3xl p-8 md:p-10 relative overflow-hidden border border-white/5 min-h-[300px] flex flex-col justify-end"
          >
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1459865264687-595d652de67e?w=1200')] bg-cover bg-center opacity-[0.07]" />
            <BorderBeam size={400} colorFrom="#D42030" colorTo="#D42030" />
            <div className="relative z-10">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-club-red mb-3 block">Último Resultado</span>
              <div className="flex items-end gap-4 md:gap-8">
                <div>
                  <p className="text-[10px] font-mono text-muted-foreground mb-1">LOCAL</p>
                  <p className="font-display text-4xl md:text-5xl text-white">SFC</p>
                </div>
                <div className="font-display text-7xl md:text-8xl italic text-club-red [text-shadow:0_0_40px_rgba(212,32,48,0.5)]">
                  3 - 1
                </div>
                <div>
                  <p className="text-[10px] font-mono text-muted-foreground mb-1">VISITANTE</p>
                  <p className="font-display text-4xl md:text-5xl text-white">RIV</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground/70 max-w-lg">
                Doblete de M. López y gol de R. Gómez. Victoria en casa.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="md:col-span-2 glass rounded-3xl p-6 border border-white/5 flex flex-col"
          >
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-club-red mb-5">
              <Trophy size={14} className="inline mr-1 mb-0.5" />
              Top Goleadores
            </span>
            <div className="flex-1 space-y-2">
              {scorers.map((p, i) => (
                <div key={p.n} className="flex items-center gap-3 rounded-xl bg-white/[0.03] px-4 py-3 hover:bg-white/[0.06] transition-all">
                  <span className="w-7 h-7 rounded-full bg-club-red/20 text-club-red text-xs font-mono font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="flex-1 text-sm text-white/80">{p.n}</span>
                  <span className="font-mono text-xs text-muted-foreground mr-2">{p.a} ast</span>
                  <span className="font-display text-xl text-club-red">{p.g}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* PROXIMO PARTIDO — full-width card con countdown */}
      <section className="px-6 md:px-16 max-w-7xl mx-auto pb-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-r from-card/80 to-card/40 backdrop-blur-xl p-8 md:p-12"
        >
          <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(ellipse_at_center,rgba(212,32,48,0.08)_0%,transparent_70%)]" />
          <BorderBeam size={500} colorFrom="#CEAB5D" colorTo="#D42030" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-club-gold">
                <Tv size={14} className="inline mr-1 mb-0.5" />
                PRÓXIMO PARTIDO
              </span>
              <h2 className="font-display text-4xl md:text-6xl text-white mt-2">
                vs Atlético Madrid
              </h2>
              <p className="text-sm text-muted-foreground/70 mt-2 font-mono">
                Domingo 16:00 · Estadio Municipal
              </p>
            </div>
            <div className="flex gap-4">
              <Link href="/partidos">
                <Button variant="primary" hoverGlow>Ver Partido</Button>
              </Link>
              <Link href="/clasificacion">
                <Button variant="glass">Clasificación</Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* NAV */}
      <section className="border-t border-white/5 py-16 px-6 md:px-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "Partidos", href: "/partidos", icon: "⚽" },
            { label: "Plantilla", href: "/plantilla", icon: "👥" },
            { label: "Club", href: "/club", icon: "🏛️" },
            { label: "Jugadores", href: "/jugadores", icon: "📊" },
            { label: "Noticias", href: "/blog", icon: "📰" },
            { label: "Contacto", href: "/contacto", icon: "✉️" },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                href={item.href}
                className="glass rounded-2xl p-5 flex flex-col items-center text-center gap-2 border border-white/5 hover:border-club-red/30 hover:-translate-y-1 transition-all duration-300 group"
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="font-display text-lg text-white/80 group-hover:text-club-red transition-colors">
                  {item.label}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
}
