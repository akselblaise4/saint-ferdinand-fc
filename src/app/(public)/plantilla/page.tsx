import { getCopaData } from "@/lib/loadData";
import ScrollReveal from "@/components/animations/ScrollReveal";
import { StaggerGrid, StaggerItem } from "@/components/animations/StaggerGrid";
import PageHero from "@/components/sections/PageHero";

export default function PlantillaPage() {
  const data = getCopaData();
  const saintsId = "-OqC_DyMZey8vTF5Shq5";
  const saints = data.saints;
  const allPlayers = (data.players as any)?.items || [];
  const saintsPlayers = (data.players as any)?.byTeam?.[saintsId]?.players || allPlayers.filter((p: any) => p.teamId === saintsId);
  const scorersMap = new Map<string, number>();
  for (const s of (data as any).topScorers?.saints || []) {
    scorersMap.set(s.playerName, s.goals);
  }
  const sorted = [...saintsPlayers].sort((a: any, b: any) => (scorersMap.get(b.name) || 0) - (scorersMap.get(a.name) || 0));

  return (
    <>
      <PageHero
        title="Equipo"
        subtitle={`${saints?.playersCount || sorted.length} jugadores · ${data.event?.title}`}
      />

      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-6">
          <ScrollReveal>
            <div className="mb-6 flex items-center gap-4">
              <h2 className="font-display text-2xl font-bold uppercase tracking-[-0.01em] text-on-surface md:text-3xl">Plantilla 2026</h2>
              <span className="inline-flex items-center justify-center bg-club-red px-3 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-white">
                {sorted.length}
              </span>
            </div>
          </ScrollReveal>
          <StaggerGrid className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {sorted.map((p, i) => (
              <StaggerItem key={p.id}>
                <div className="border border-border bg-surface-container-lowest p-5 transition-colors hover:bg-surface-container">
                  <div className="flex items-start justify-between">
                    <div className="flex h-14 w-14 items-center justify-center border border-border bg-surface-container">
                      <span className="font-display text-lg font-bold text-on-surface-variant">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-on-surface">
                      {p.firstName || p.name}{p.lastName ? " " + p.lastName : ""}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-on-surface-variant">
                      <span>{scorersMap.get(p.name) || 0} goles</span>
                      <span className="h-1 w-1 bg-on-surface-variant" />
                      <span>Rank #{(data as any).topScorers?.saints?.find((s: any) => s.playerName === p.name)?.overallRank || "—"}</span>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>
    </>
  );
}
