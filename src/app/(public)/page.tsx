"use client";

import { motion } from "framer-motion";
import { Marquee } from "@/components/football/marquee";
import { BorderBeam } from "@/components/football/border-beam";
import { CardCompound } from "@/components/ui/card";
import { BentoGrid, BentoGridItem, BentoGridPattern } from "@/components/ui/bento-grid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { cn } from "@/lib/utils";
import ScrollReveal from "@/components/animations/ScrollReveal";
import AnalogNoiseOverlay from "@/components/visuals/AnalogNoiseOverlay";
import Link from "next/link";
import { ArrowRight, Trophy, Users, Calendar, TrendingUp, Shield, Award } from "lucide-react";

const topScorers = [
  { name: "M. López", goals: 14, assists: 5, pos: 1 },
  { name: "R. Gómez", goals: 11, assists: 7, pos: 2 },
  { name: "L. Fernández", goals: 9, assists: 10, pos: 3 },
  { name: "P. Torres", goals: 6, assists: 14, pos: 4 },
  { name: "D. Sánchez", goals: 5, assists: 8, pos: 5 },
];

const newsItems = [
  { title: "Victoria contundente en casa ante el Atlético", category: "Partido", date: "Hace 2 horas", href: "#" },
  { title: "M. López nominado a jugador del mes", category: "Club", date: "Hace 6 horas", href: "#" },
  { title: "Nuevo fichaje confirmado para la temporada", category: "Transferencias", date: "Ayer", href: "#" },
  { title: "Calendario de pretemporada 2026 publicado", category: "Calendario", date: "Ayer", href: "#" },
  { title: "La academia SFC presenta 3 nuevos talentos", category: "Cantera", date: "Hace 2 días", href: "#" },
];

const honors = [
  { title: "Liga Premier", count: "3", icon: Trophy },
  { title: "Copa USS", count: "2", icon: Award },
  { title: "Supercopa", count: "1", icon: Shield },
  { title: "Liga de Campeones", count: "1", icon: TrendingUp },
];

const partners = ["Nike", "Coca-Cola", "Movistar", "Adidas", "Samsung", "Mahou"];

const navItems = [
  { title: "Partidos", href: "/partidos", desc: "Calendario", icon: Calendar },
  { title: "Plantilla", href: "/plantilla", desc: "Equipo", icon: Users },
  { title: "Club", href: "/club", desc: "Historia", icon: Shield },
  { title: "Jugadores", href: "/jugadores", desc: "Estadísticas", icon: TrendingUp },
  { title: "Noticias", href: "/blog", desc: "Novedades", icon: Trophy },
  { title: "Contacto", href: "/contacto", desc: "Escríbenos", icon: ArrowRight },
];

const sectionVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const springEase = [0.34, 1.56, 0.64, 1] as const;
const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: springEase } },
};

export default function Home() {
  return (
    <>
      <AnalogNoiseOverlay />
      <Marquee />

      <section className="relative pt-36 pb-20 px-5 md:px-10 max-w-7xl mx-auto">
        <motion.div
          className="flex flex-col items-center text-center"
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
        >
          <motion.div
            variants={itemVariants}
            className="glass inline-flex items-center gap-2 rounded-full px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-club-red animate-pulse-soft" />
            TEMPORADA 2026 · USS LIGA PREMIER
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="font-display text-7xl md:text-9xl lg:text-[160px] leading-[0.78] tracking-tighter text-white"
          >
            SAINT
            <br />
            <span className="text-club-red italic drop-shadow-[0_0_40px_rgba(212,32,48,0.3)]">FERDINAND</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mt-6 max-w-lg text-sm leading-relaxed text-muted-foreground"
          >
            Precisión, pasión y excelencia. Representamos a Madrid en la USS Liga Premier con orgullo y determinación.
          </motion.p>

          <motion.div variants={itemVariants} className="mt-10 flex items-center gap-4">
            <Button variant="primary" size="lg" hoverGlow rightIcon={<ArrowRight size={16} />}>
              Ver Calendario
            </Button>
            <Button variant="glass" size="lg" hoverLift>
              Plantilla 2026
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={sectionVariants}
        >
          {[
            { label: "PARTIDOS", value: "15", icon: Calendar },
            { label: "VICTORIAS", value: "11", icon: Trophy },
            { label: "GOLES", value: "42", icon: TrendingUp },
            { label: "PTS", value: "34", icon: Award },
          ].map((stat) => (
            <motion.div key={stat.label} variants={itemVariants}>
              <CardCompound variant="glass" hover className="text-center py-8">
                <div className="flex justify-center mb-2">
                  <stat.icon size={20} className="text-club-red/60" />
                </div>
                <div className="font-display text-5xl md:text-6xl italic text-club-red leading-none">
                  {stat.value}
                </div>
                <div className="mt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {stat.label}
                </div>
              </CardCompound>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <div className="max-w-7xl mx-auto px-5 md:px-10">
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      <ScrollReveal>
        <section className="py-16 px-5 md:px-10 max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-1 h-5 rounded-full bg-club-red" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              Últimas Noticias
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
            <Link href="/blog">
              <Button variant="ghost" size="sm" rightIcon={<ArrowRight size={14} />}>
                Ver todas
              </Button>
            </Link>
          </div>

          <BentoGrid columns={3} gap="md">
            {newsItems.slice(0, 3).map((item, i) => (
              <BentoGridItem key={item.title} index={i} hoverLift>
                <a href={item.href} className="flex flex-col h-full p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" size="sm">{item.category}</Badge>
                    <span className="text-[10px] text-muted-foreground font-mono">{item.date}</span>
                  </div>
                  <h3 className="font-display text-xl tracking-wide text-white group-hover:text-club-red transition-colors mt-auto">
                    {item.title}
                  </h3>
                </a>
              </BentoGridItem>
            ))}
          </BentoGrid>
        </section>
      </ScrollReveal>

      <div className="max-w-7xl mx-auto px-5 md:px-10">
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      <ScrollReveal>
        <section className="py-16 px-5 md:px-10 max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-1 h-5 rounded-full bg-club-red" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              Cobertura del Partido
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
          </div>

          <BentoGridPattern pattern="mixed">
            {[
              <div key="result" className="relative flex flex-col justify-end p-6 min-h-[280px]">
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent rounded-2xl" />
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1459865264687-595d652de67e?w=1200')] bg-cover bg-center opacity-10 rounded-2xl" />
                <div className="relative z-10">
                  <Badge variant="destructive" size="sm" className="mb-4">Último Resultado</Badge>
                  <div className="flex items-end gap-6">
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">LOCAL</div>
                      <div className="font-display text-4xl text-white">SFC</div>
                    </div>
                    <div className="font-display text-6xl italic text-club-red drop-shadow-[0_0_20px_rgba(212,32,48,0.3)]">3 - 1</div>
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">VISITANTE</div>
                      <div className="font-display text-4xl text-white">RIV</div>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground/80 max-w-md">
                    Victoria contundente en casa. Doblete de M. López y gol de R. Gómez que sentenció el partido en el minuto 78.
                  </p>
                </div>
              </div>,

              <div key="next" className="relative overflow-hidden p-5 flex flex-col justify-between min-h-[200px]">
                <BorderBeam duration={5} size={250} colorFrom="#CEAB5D" colorTo="#D42030" />
                <Badge variant="gold" size="sm" className="self-start relative z-10">Próximo Partido</Badge>
                <div className="relative z-10 mt-auto">
                  <div className="font-display text-2xl text-white">vs Atlético</div>
                  <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                    <p>🔴 Domingo 16:00 hrs</p>
                    <p>📍 Estadio Municipal</p>
                  </div>
                  <div className="mt-4 glass rounded-xl p-4">
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Cuenta Regresiva</div>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      {["03", "14", "28", "45"].map((val, i) => (
                        <div key={i}>
                          <div className="font-display text-xl text-white">{val}</div>
                          <div className="text-[8px] font-semibold uppercase tracking-widest text-muted-foreground">
                            {["DÍAS", "HRS", "MIN", "SEG"][i]}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>,

              <div key="scorers" className="p-5 flex flex-col min-h-[280px]">
                <Badge variant="destructive" size="sm" className="self-start">Top Goleadores</Badge>
                <div className="mt-4 flex-1 space-y-2">
                  {topScorers.map((player) => (
                    <div key={player.name} className="flex items-center gap-3 glass rounded-xl px-4 py-3 transition-all hover:bg-white/5">
                      <div className="flex w-8 h-8 items-center justify-center rounded-full bg-club-red text-xs font-bold text-white">
                        {player.pos}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">{player.name}</div>
                        <div className="text-[10px] text-muted-foreground">{player.assists} asistencias</div>
                      </div>
                      <div className="font-display text-xl text-club-red">{player.goals}</div>
                    </div>
                  ))}
                </div>
              </div>,

              <div key="pos" className="p-5 flex flex-col justify-center min-h-[120px]">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Posición Actual</div>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-7xl italic text-club-gold">1°</span>
                  <span className="text-sm text-muted-foreground">de 12 equipos</span>
                </div>
                <div className="mt-2 w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-club-red to-club-gold" />
                </div>
              </div>,

              <div key="form" className="p-5 flex flex-col justify-center min-h-[120px]">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Últimos 5</div>
                <div className="flex gap-2">
                  {["W", "W", "D", "W", "L"].map((r, i) => (
                    <span key={i} className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold font-mono border ${
                      r === "W" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
                      r === "D" ? "bg-amber-500/20 text-amber-400 border-amber-500/30" :
                      "bg-red-500/20 text-red-400 border-red-500/30"
                    }`}>{r}</span>
                  ))}
                </div>
              </div>,

              <div key="cta" className="p-5 flex flex-col justify-center items-center text-center min-h-[120px]">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Sigue toda la temporada</p>
                <Link href="/partidos">
                  <Button variant="glass" size="sm" hoverGlow rightIcon={<ArrowRight size={14} />}>
                    Ver Calendario Completo
                  </Button>
                </Link>
              </div>,
            ]}
          </BentoGridPattern>
        </section>
      </ScrollReveal>

      <div className="max-w-7xl mx-auto px-5 md:px-10">
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      <ScrollReveal>
        <section className="py-20 px-5 md:px-10 max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-1 h-5 rounded-full bg-club-gold" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              Palmarés
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-club-gold/20 to-transparent" />
          </div>

          <BentoGrid columns={4} gap="md">
            {honors.map((h, i) => (
              <BentoGridItem key={h.title} index={i} hover3D>
                <CardCompound variant="glass" padding="lg" className="text-center">
                  <h.icon size={28} className="mx-auto text-club-gold/60" />
                  <div className="mt-3 font-display text-4xl md:text-5xl italic text-club-gold group-hover:text-club-red transition-colors duration-300">
                    {h.count}
                  </div>
                  <div className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {h.title}
                  </div>
                </CardCompound>
              </BentoGridItem>
            ))}
          </BentoGrid>
        </section>
      </ScrollReveal>

      <div className="max-w-7xl mx-auto px-5 md:px-10">
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      <ScrollReveal>
        <section className="py-16 px-5 md:px-10 max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-1 h-5 rounded-full bg-club-red" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              Patrocinadores
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-14 gap-y-10">
            {partners.map((p, i) => (
              <motion.span
                key={p}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, ease: [0.34, 1.56, 0.64, 1] }}
                className="text-sm font-semibold uppercase tracking-widest text-white/15 hover:text-white/30 transition-colors duration-300 cursor-default"
              >
                {p}
              </motion.span>
            ))}
          </div>
        </section>
      </ScrollReveal>

      <div className="max-w-7xl mx-auto px-5 md:px-10">
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      <ScrollReveal>
        <section className="py-20 px-5 md:px-10 max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-1 h-5 rounded-full bg-club-red" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              Navegación
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
          </div>

          <BentoGrid columns={3} gap="md">
            {navItems.map((item, i) => (
              <BentoGridItem key={item.title} index={i} hover3D>
                <Link href={item.href} className="flex flex-col items-center text-center p-6">
                  <item.icon size={24} className="text-club-red/50 group-hover:text-club-red transition-colors duration-300" />
                  <h3 className="mt-3 font-display text-xl uppercase tracking-wide text-white group-hover:text-club-red transition-colors">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {item.desc}
                  </p>
                </Link>
              </BentoGridItem>
            ))}
          </BentoGrid>
        </section>
      </ScrollReveal>
    </>
  );
}
