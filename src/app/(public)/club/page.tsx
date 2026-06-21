import Emblem from "@/components/Emblem";
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
    <>
      <PageHero title="El Club" subtitle="Historia, valores y alma del Saint Ferdinand FC" />

      <section className="border-b border-border bg-surface-container-lowest py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div className="flex justify-center">
              <Emblem className="h-64 w-auto md:h-80" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-club-red">Quiénes somos</span>
              <h2 className="mt-2 font-display text-4xl font-bold uppercase leading-[0.9] tracking-[-0.02em] text-on-surface md:text-5xl">
                SAINT FERDINAND FC
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">
                Fundado en 2024, Saint Ferdinand FC es un club de fútbol con sede en Madrid que compite en la
                USS Liga Premier. Nacido desde la pasión por el deporte rey, el club se ha consolidado como
                una institución que promueve el talento, el trabajo en equipo y la excelencia deportiva.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
                Con una filosofía basada en el juego ofensivo y la formación de jugadores, Saint Ferdinand
                busca dejar huella en cada competición.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-surface-container-low py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-8 text-center">
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-club-red">Nuestra esencia</span>
            <h2 className="mt-2 font-display text-3xl font-bold uppercase tracking-[-0.02em] text-on-surface md:text-4xl">
              VALORES
            </h2>
            <div className="mx-auto mt-3 h-px w-12 bg-club-red" />
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {values.map((v, i) => (
              <div key={v.title} className="border border-border bg-surface-container-lowest p-6">
                <div className="flex h-10 w-10 items-center justify-center border border-border bg-surface-container text-xs font-bold text-on-surface-variant mb-4">
                  {i + 1}
                </div>
                <h3 className="font-display text-lg font-bold uppercase tracking-[-0.01em] text-on-surface">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-club-red py-12 md:py-16">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-8 text-center">
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/70">Nuestra historia</span>
            <h2 className="mt-2 font-display text-3xl font-bold uppercase tracking-[-0.02em] text-white md:text-4xl">
              LÍNEA DE TIEMPO
            </h2>
            <div className="mx-auto mt-3 h-px w-12 bg-white/50" />
          </div>
          <div className="relative">
            <div className="absolute left-4 top-0 h-full w-px bg-white/30 md:left-1/2 md:-translate-x-px" />
            {historyTimeline.map((item, i) => (
              <div key={i} className={`relative mb-10 last:mb-0 md:mb-12 ${i % 2 === 0 ? "md:text-right md:pr-10 md:ml-auto md:w-1/2 md:pl-0" : "md:pl-10 md:ml-0 md:w-1/2"}`}>
                <div className={`absolute left-0 top-1 flex h-6 w-6 items-center justify-center border-2 md:left-auto md:right-auto ${
                  i % 2 === 0 ? "md:right-0 md:translate-x-1/2" : "md:left-0 md:-translate-x-1/2"
                } border-white bg-club-red`}>
                  <div className="h-2 w-2 bg-white" />
                </div>
                <div className="ml-10 md:ml-0">
                  <span className="font-display text-2xl font-bold text-white md:text-3xl">{item.year}</span>
                  <h3 className="mt-1 text-sm font-bold text-white">{item.event}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-white/70">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface-container-lowest py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <div className="mb-8">
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-club-red">Datos del club</span>
            <h2 className="mt-2 font-display text-3xl font-bold uppercase tracking-[-0.02em] text-on-surface md:text-4xl">FICHA</h2>
            <div className="mx-auto mt-3 h-px w-12 bg-club-red" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Fundación", value: "2024" },
              { label: "Sede", value: "Madrid" },
              { label: "Liga", value: "USS Liga Premier" },
              { label: "Grupo", value: "C" },
              { label: "Colores", value: "Rojo · Blanco · Negro" },
              { label: "Estadio", value: "Campo Municipal" },
              { label: "Capacidad", value: "1,500" },
              { label: "Jugadores", value: "17" },
            ].map((d) => (
              <div key={d.label} className="border border-border bg-surface-container-lowest p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant">{d.label}</p>
                <p className="mt-1 font-display text-xl font-bold text-on-surface">{d.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
