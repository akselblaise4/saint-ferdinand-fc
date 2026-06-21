import Emblem from "@/components/Emblem";
import PageEnter from "@/components/animations/PageEnter";
import ScrollReveal from "@/components/animations/ScrollReveal";
import PageHero from "@/components/sections/PageHero";

const values = [
  { title: "PASIÓN", desc: "Entregamos todo en cada partido, cada entrenamiento, cada momento. La pasión es nuestro motor." },
  { title: "HONOR", desc: "Defendemos el escudo con respeto. Nuestro compromiso es con el club, la afición y nuestros compañeros." },
  { title: "UNIÓN", desc: "Somos más que un equipo. La familia Saint Ferdinand crece con cada temporada." },
  { title: "EXCELENCIA", desc: "Buscamos la mejora constante. En el campo, en la gestión y en cada detalle del club." },
];

const historyTimeline = [
  { year: "2024", event: "Fundación del Saint Ferdinand FC", desc: "El club nace con la visión de crear un proyecto deportivo sólido basado en la cantera y el juego ofensivo." },
  { year: "2024", event: "Primera temporada en USS Liga Premier", desc: "Debut en la categoría compitiendo en el Grupo C con una plantilla de 17 jugadores." },
  { year: "2025", event: "Consolidación del proyecto", desc: "Segunda temporada con refuerzos clave y asentamiento del estilo de juego." },
  { year: "2026", event: "Tercera temporada", desc: "El club sigue creciendo con nuevos talentos y mayor estructura deportiva." },
];

export default function ClubPage() {
  return (
    <PageEnter>
      <PageHero icon="🏛️" title="El Club" subtitle="Historia, valores y alma del Saint Ferdinand FC" />

      <ScrollReveal>
        <section className="relative overflow-hidden border-b py-16 md:py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid items-center gap-12 md:grid-cols-2">
              <div className="flex justify-center">
                <Emblem className="h-72 w-auto drop-shadow-2xl md:h-96" />
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-club-red">Quiénes somos</span>
                <h2 className="mt-2 font-display text-5xl leading-none text-club-black md:text-6xl">SAINT FERDINAND FC</h2>
                <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                  Fundado en 2024, Saint Ferdinand FC es un club de fútbol con sede en Madrid que compite en la 
                  USS Liga Premier. Nacido desde la pasión por el deporte rey, el club se ha consolidado como 
                  una institución que promueve el talento, el trabajo en equipo y la excelencia deportiva.
                </p>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  Con una filosofía basada en el juego ofensivo y la formación de jugadores, Saint Ferdinand 
                  busca dejar huella en cada competición. Nuestros colores —rojo, negro y dorado— representan 
                  la pasión, la fuerza y la gloria que perseguimos en cada partido.
                </p>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-12 text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-club-red">Nuestra esencia</span>
              <h2 className="mt-2 font-display text-5xl text-club-black md:text-6xl">VALORES</h2>
              <div className="mx-auto mt-4 h-0.5 w-16 bg-club-red" />
            </div>
            <div className="grid gap-6 md:grid-cols-4">
              {values.map((v, i) => (
                <div key={v.title} className="group rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl club-gradient text-lg font-bold text-white shadow-sm mb-5">
                    {i + 1}
                  </div>
                  <h3 className="font-display text-2xl text-club-black">{v.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal delay={0.15}>
        <section className="relative overflow-hidden bg-club-black py-16 md:py-24">
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:24px_24px]" />
          <div className="relative mx-auto max-w-4xl px-6">
            <div className="mb-12 text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-club-gold">Nuestra historia</span>
              <h2 className="mt-2 font-display text-5xl text-white md:text-6xl">LÍNEA DE TIEMPO</h2>
              <div className="mx-auto mt-4 h-0.5 w-16 bg-club-gold" />
            </div>
            <div className="relative">
              <div className="absolute left-4 top-0 h-full w-px bg-white/10 md:left-1/2 md:-translate-x-px" />
              {historyTimeline.map((item, i) => (
                <div key={i} className={`relative mb-12 last:mb-0 md:mb-16 ${i % 2 === 0 ? "md:text-right md:pr-12 md:ml-auto md:w-1/2" : "md:pl-12 md:ml-0 md:w-1/2 md:ml-0"}`}>
                  <div className={`absolute left-0 top-1 flex h-8 w-8 items-center justify-center rounded-full border-2 md:left-auto md:right-auto ${i % 2 === 0 ? "md:right-0 md:-translate-x-1/2" : "md:left-0 md:translate-x-1/2"} border-club-gold bg-club-black`}>
                    <div className="h-2 w-2 rounded-full bg-club-gold" />
                  </div>
                  <div className="ml-12 md:ml-0">
                    <span className="font-display text-3xl text-club-gold md:text-4xl">{item.year}</span>
                    <h3 className="mt-1 text-lg font-bold text-white">{item.event}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/40">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal delay={0.2}>
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-6xl px-6 text-center">
            <div className="mb-12">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-club-red">Datos del club</span>
              <h2 className="mt-2 font-display text-5xl text-club-black md:text-6xl">FICHA</h2>
              <div className="mx-auto mt-4 h-0.5 w-16 bg-club-red" />
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Fundación", value: "2024" },
                { label: "Sede", value: "Madrid" },
                { label: "Liga", value: "USS Liga Premier" },
                { label: "Grupo", value: "C" },
                { label: "Colores", value: "Rojo · Negro · Oro" },
                { label: "Estadio", value: "Campo Municipal" },
                { label: "Capacidad", value: "1,500" },
                { label: "Jugadores", value: "17" },
              ].map((d) => (
                <div key={d.label} className="rounded-xl border bg-card p-6 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{d.label}</p>
                  <p className="mt-2 font-display text-3xl text-club-black">{d.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>
    </PageEnter>
  );
}
