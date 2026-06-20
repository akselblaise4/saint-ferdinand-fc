import { getCopaData } from "@/lib/loadData";
import PageEnter from "@/components/animations/PageEnter";
import ScrollReveal from "@/components/animations/ScrollReveal";
import { StaggerGrid, StaggerItem } from "@/components/animations/StaggerGrid";

const coachingStaff = [
  { name: "José Martínez", role: "Head Coach", nation: "ESP", age: 45, joined: "2024" },
  { name: "David López", role: "Assistant Coach", nation: "ESP", age: 52, joined: "2024" },
  { name: "Peter Hansen", role: "Fitness Coach", nation: "GER", age: 38, joined: "2025" },
  { name: "Carlos Ruiz", role: "Goalkeeping Coach", nation: "ESP", age: 50, joined: "2024" },
];

const squad = [
  { n: 1, name: "Carlos Mendoza", pos: "GK", age: 28, nation: "ESP", caps: 48, joined: "2024" },
  { n: 13, name: "Álvaro Ruiz", pos: "GK", age: 24, nation: "ESP", caps: 12, joined: "2025" },
  { n: 2, name: "Javier Torres", pos: "RB", age: 26, nation: "ARG", caps: 62, joined: "2024" },
  { n: 3, name: "Marcos López", pos: "CB", age: 30, nation: "ESP", caps: 85, joined: "2024" },
  { n: 4, name: "Sergio Ramos Jr.", pos: "CB", age: 25, nation: "MEX", caps: 34, joined: "2025" },
  { n: 5, name: "Diego Castillo", pos: "CB", age: 27, nation: "ESP", caps: 56, joined: "2024" },
  { n: 6, name: "Pablo Herrera", pos: "CM", age: 29, nation: "ESP", caps: 91, joined: "2024" },
  { n: 8, name: "Andrés Silva", pos: "CM", age: 23, nation: "URU", caps: 28, joined: "2025" },
  { n: 10, name: "Lucas Fernández", pos: "CAM", age: 26, nation: "ARG", caps: 73, joined: "2024" },
  { n: 14, name: "Miguel Ángel", pos: "CM", age: 22, nation: "ESP", caps: 8, joined: "2026" },
  { n: 7, name: "Alejandro Vega", pos: "LW", age: 27, nation: "COL", caps: 67, joined: "2024" },
  { n: 11, name: "Cristian Díaz", pos: "RW", age: 24, nation: "ESP", caps: 41, joined: "2025" },
  { n: 9, name: "Raúl Jiménez", pos: "ST", age: 31, nation: "MEX", caps: 102, joined: "2024" },
  { n: 17, name: "Daniel Ortiz", pos: "ST", age: 21, nation: "ESP", caps: 15, joined: "2026" },
];

const groupPositions = [
  { label: "Goalkeepers", filter: ["GK"] },
  { label: "Defenders", filter: ["RB", "CB"] },
  { label: "Midfielders", filter: ["CM", "CAM"] },
  { label: "Forwards", filter: ["LW", "RW", "ST"] },
];

function Badge({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "secondary" }) {
  const cls = variant === "default" ? "border-transparent bg-primary text-primary-foreground shadow"
    : "border-transparent bg-secondary text-secondary-foreground";
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${cls}`}>{children}</span>;
}

export default function PlantillaPage() {
  const data = getCopaData();
  const saints = data.saints;

  return (
    <PageEnter>
      {/* ── HERO ── */}
      <section className="relative min-h-[50vh] flex items-center overflow-hidden bg-club-black pt-20">
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[length:24px_24px]" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-club-black to-club-black" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10 backdrop-blur-sm">
              <span className="text-2xl">👥</span>
            </div>
            <div>
              <h1 className="font-display text-6xl leading-none tracking-tight text-white md:text-8xl">Equipo</h1>
              <p className="mt-2 text-sm text-white/40">{saints?.playersCount || 17} jugadores · {data.event?.title}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── COACHING STAFF ── */}
      <ScrollReveal>
        <section className="relative bg-club-black/5 border-b py-12 md:py-16 overflow-hidden">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-8">
              <h2 className="font-display text-3xl text-foreground md:text-4xl">Cuerpo Técnico</h2>
              <p className="text-sm text-muted-foreground">{coachingStaff.length} miembros</p>
            </div>
            <StaggerGrid className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {coachingStaff.map((s) => (
                <StaggerItem key={s.name}>
                  <div className="rounded-xl border bg-card shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-4 p-5">
                      <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-primary/10">
                        <span className="font-display text-2xl text-primary">{s.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.role}</p>
                        <p className="text-xs text-muted-foreground/60">{s.nation}</p>
                      </div>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerGrid>
          </div>
        </section>
      </ScrollReveal>

      {/* ── SQUAD ── */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-6">
          {groupPositions.map((group, gi) => {
            const players = squad.filter((p) => group.filter.includes(p.pos));
            return (
              <ScrollReveal key={group.label} delay={0.05 * gi}>
                <div className="mb-16 last:mb-0">
                  <div className="mb-8 flex items-center gap-4">
                    <h2 className="font-display text-2xl text-foreground md:text-3xl">{group.label}</h2>
                    <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-3 py-0.5 text-xs font-semibold text-primary">{players.length}</span>
                  </div>
                  <StaggerGrid className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {players.map((p) => (
                      <StaggerItem key={p.n}>
                        <div className="group rounded-xl border bg-card shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
                          <div className="p-5">
                            <div className="flex items-start justify-between">
                              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/5">
                                <span className="font-display text-3xl leading-none text-primary/30 group-hover:text-primary/50 transition-colors">{String(p.n).padStart(2, "0")}</span>
                              </div>
                              <Badge variant="secondary">{p.pos}</Badge>
                            </div>
                            <div className="mt-4">
                              <p className="text-base font-bold">{p.name}</p>
                              <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                                <span>{p.nation}</span>
                                <span className="h-1 w-1 rounded-full bg-border" />
                                <span>{p.age} años</span>
                                <span className="h-1 w-1 rounded-full bg-border" />
                                <span>{p.caps} caps</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </StaggerItem>
                    ))}
                  </StaggerGrid>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </section>
    </PageEnter>
  );
}
