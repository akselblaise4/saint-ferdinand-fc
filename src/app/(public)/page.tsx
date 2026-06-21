import { Marquee } from "@/components/football/marquee";
import { BorderBeam } from "@/components/football/border-beam";

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
  { title: "Liga Premier", count: "3", icon: "🏆" },
  { title: "Copa USS", count: "2", icon: "🏅" },
  { title: "Supercopa", count: "1", icon: "⭐" },
  { title: "Liga de Campeones", count: "1", icon: "🌍" },
];

const partners = [
  "Nike", "Coca-Cola", "Movistar", "Adidas", "Samsung", "Mahou",
];

export default function Home() {
  return (
    <>
      <Marquee />

      {/* HERO */}
      <section className="relative pt-36 pb-20 px-5 md:px-10 max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.03] px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-8">
            <span className="size-1.5 rounded-full bg-club-red animate-pulse-soft" />
            TEMPORADA 2026 · USS LIGA PREMIER
          </div>
          <h1 className="font-display text-7xl md:text-9xl lg:text-[140px] leading-[0.8] tracking-tighter text-white">
            SAINT
            <br />
            <span className="text-club-red italic">FERDINAND</span>
          </h1>
          <p className="mt-6 max-w-lg text-sm leading-relaxed text-muted-foreground">
            Precisión, pasión y excelencia. Representamos a Madrid en la USS Liga Premier con orgullo y determinación.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "PARTIDOS", value: "15" },
            { label: "VICTORIAS", value: "11" },
            { label: "GOLES", value: "42" },
            { label: "PTS", value: "34" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 text-center backdrop-blur-sm">
              <div className="font-display text-5xl md:text-6xl italic text-club-red">{stat.value}</div>
              <div className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ÚLTIMAS NOTICIAS */}
      <section className="pb-12 px-5 md:px-10 max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="size-1.5 rounded-full bg-club-red" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">Últimas Noticias</span>
          <div className="h-px flex-1 bg-white/[0.06]" />
          <a href="/blog" className="text-[10px] font-semibold uppercase tracking-widest text-club-red hover:text-club-red/80 transition-colors">Ver todas</a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {newsItems.slice(0, 3).map((item) => (
            <a key={item.title} href={item.href} className="group rounded-xl border border-white/[0.06] bg-white/[0.01] p-5 transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.03]">
              <div className="flex items-center gap-2 mb-3">
                <span className="rounded-full border border-club-red/20 bg-club-red/10 px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-club-red">
                  {item.category}
                </span>
                <span className="text-[10px] text-muted-foreground">{item.date}</span>
              </div>
              <h3 className="font-display text-xl tracking-wide text-white group-hover:text-club-red transition-colors">{item.title}</h3>
            </a>
          ))}
        </div>
      </section>

      {/* BENTO GRID: COBERTURA + PRÓXIMO + GOLEADORES */}
      <section className="pb-16 px-5 md:px-10 max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="size-1.5 rounded-full bg-club-red" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">Cobertura del Partido</span>
          <div className="h-px flex-1 bg-white/[0.06]" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-px overflow-hidden rounded-2xl border border-white/[0.04] bg-white/[0.02]">
          <div className="md:col-span-2 md:row-span-2 relative flex flex-col justify-end bg-gradient-to-t from-background via-background/60 to-transparent p-8 min-h-[380px]">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1459865264687-595d652de67e?w=1200')] bg-cover bg-center opacity-15" />
            <div className="relative z-10">
              <span className="inline-flex items-center rounded-full border border-club-red/30 bg-club-red/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-club-red mb-4">
                Último Resultado
              </span>
              <div className="flex items-end gap-6">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">LOCAL</div>
                  <div className="font-display text-5xl text-white">SFC</div>
                </div>
                <div className="font-display text-7xl italic text-club-red">3 - 1</div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">VISITANTE</div>
                  <div className="font-display text-5xl text-white">RIV</div>
                </div>
              </div>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">
                Victoria contundente en casa. Doblete de M. López y gol de R. Gómez que sentenció el partido en el minuto 78.
              </p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl p-6 border border-white/[0.04] bg-white/[0.01] flex flex-col justify-between">
            <BorderBeam duration={5} size={250} colorFrom="#CEAB5D" colorTo="#D42030" />
            <span className="relative z-10 inline-flex items-center rounded-full border border-club-gold/30 bg-club-gold/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-club-gold self-start">
              Próximo Partido
            </span>
            <div className="relative z-10 mt-4">
              <div className="font-display text-3xl text-white">vs Atlético</div>
              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                <p>🔴 Domingo 16:00 hrs</p>
                <p>📍 Estadio Municipal</p>
              </div>
              <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
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
          </div>

          <div className="md:row-span-2 relative p-6 border-b border-white/[0.04] bg-white/[0.01] flex flex-col">
            <span className="inline-flex items-center rounded-full border border-club-red/30 bg-club-red/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-club-red self-start">
              Top Goleadores
            </span>
            <div className="mt-6 flex-1 space-y-2">
              {topScorers.map((player) => (
                <div key={player.name} className="flex items-center gap-3 rounded-xl border border-white/[0.04] bg-white/[0.01] px-4 py-3 transition-all hover:bg-white/[0.03]">
                  <div className="flex size-8 items-center justify-center rounded-full bg-club-red text-xs font-bold text-white">
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
          </div>
        </div>
      </section>

      {/* HONORES */}
      <section className="py-20 border-t border-white/[0.04]">
        <div className="px-5 md:px-10 max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-10">
            <div className="size-1.5 rounded-full bg-club-red" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">Palmarés</span>
            <div className="h-px flex-1 bg-white/[0.06]" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {honors.map((h) => (
              <div key={h.title} className="group rounded-xl border border-white/[0.06] bg-white/[0.01] p-8 text-center transition-all duration-300 hover:border-club-gold/20 hover:bg-white/[0.03]">
                <span className="text-3xl md:text-4xl">{h.icon}</span>
                <div className="mt-3 font-display text-4xl md:text-5xl italic text-club-gold group-hover:text-club-red transition-colors">{h.count}</div>
                <div className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{h.title}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PARTNERS */}
      <section className="py-16 border-t border-white/[0.04]">
        <div className="px-5 md:px-10 max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-10">
            <div className="size-1.5 rounded-full bg-club-red" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">Patrocinadores</span>
            <div className="h-px flex-1 bg-white/[0.06]" />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
            {partners.map((p) => (
              <div key={p} className="text-sm font-semibold uppercase tracking-widest text-white/20 hover:text-white/40 transition-colors">
                {p}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NAVEGACIÓN */}
      <section className="py-20 border-t border-white/[0.04]">
        <div className="px-5 md:px-10 max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-10">
            <div className="size-1.5 rounded-full bg-club-red" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">Navegación</span>
            <div className="h-px flex-1 bg-white/[0.06]" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { title: "Partidos", href: "/partidos", desc: "Calendario", icon: "⚽" },
              { title: "Plantilla", href: "/plantilla", desc: "Equipo", icon: "👥" },
              { title: "Club", href: "/club", desc: "Historia", icon: "🏛️" },
              { title: "Jugadores", href: "/jugadores", desc: "Estadísticas", icon: "📊" },
              { title: "Noticias", href: "/blog", desc: "Novedades", icon: "📰" },
              { title: "Contacto", href: "/contacto", desc: "Escríbenos", icon: "✉️" },
            ].map((item) => (
              <a
                key={item.title}
                href={item.href}
                className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 text-center transition-all duration-300 hover:border-club-red/20 hover:bg-white/[0.04]"
              >
                <span className="text-2xl">{item.icon}</span>
                <h3 className="mt-3 font-display text-xl uppercase tracking-wide text-white group-hover:text-club-red transition-colors">
                  {item.title}
                </h3>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{item.desc}</p>
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
