import { getCopaData } from "@/lib/loadData";
import PageEnter from "@/components/animations/PageEnter";
import ScrollReveal from "@/components/animations/ScrollReveal";
import { StaggerGrid, StaggerItem } from "@/components/animations/StaggerGrid";
import PageHero from "@/components/sections/PageHero";

const posColors: Record<string, string> = {
  GK: "bg-amber-100 text-amber-700 border-amber-200",
  DEF: "bg-blue-100 text-blue-700 border-blue-200",
  MID: "bg-emerald-100 text-emerald-700 border-emerald-200",
  FWD: "bg-red-100 text-red-700 border-red-200",
};

function SquadBadge({ pos }: { pos: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${posColors[pos] || "bg-muted text-muted-foreground"}`}>
      {pos}
    </span>
  );
}

export default function PlantillaPage() {
  const data = getCopaData();
  const saints = data.saints;
  const players = data.players || [];
  const scorersMap = new Map<string, number>();
  for (const s of data.topScorers.saints) {
    scorersMap.set(s.player, s.goals);
  }
  const sorted = [...players].sort((a, b) => (scorersMap.get(b.name) || 0) - (scorersMap.get(a.name) || 0));

  return (
    <PageEnter>
      <PageHero
        icon="👥"
        title="Equipo"
        subtitle={`${saints?.playersCount || sorted.length} jugadores · ${data.event?.title}`}
      />

      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <ScrollReveal>
            <div className="mb-8 flex items-center gap-4">
              <h2 className="font-display text-3xl text-foreground md:text-4xl">Plantilla 2026</h2>
              <span className="inline-flex items-center justify-center rounded-full club-gradient px-3 py-0.5 text-xs font-semibold text-white">{sorted.length}</span>
            </div>
          </ScrollReveal>
          <StaggerGrid className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {sorted.map((p, i) => (
              <StaggerItem key={p.id}>
                <div className="group rounded-xl border bg-card shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
                  <div className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/5">
                        <span className="font-display text-2xl leading-none text-primary/30 group-hover:text-primary/50 transition-colors">{String(i + 1).padStart(2, "0")}</span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-base font-bold">{p.name}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                        <span>{scorersMap.get(p.name) || 0} goles</span>
                        <span className="h-1 w-1 rounded-full bg-border" />
                        <span>Rank #{data.topScorers.saints.find(s => s.player === p.name)?.overallRank || "—"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>
    </PageEnter>
  );
}
