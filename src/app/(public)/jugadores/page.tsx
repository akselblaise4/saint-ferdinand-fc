import { getCopaData } from "@/lib/loadData";
import PageHero from "@/components/sections/PageHero";

export default function JugadoresPage() {
  const data = getCopaData();
  const players = (data.players as any)?.items || [];
  const scorersMap = new Map<string, number>();
  for (const s of (data as any).topScorers?.saints || []) {
    scorersMap.set(s.playerName, s.goals);
  }
  const sorted = [...(players as any[])].sort((a, b) => (scorersMap.get(b.name) || 0) - (scorersMap.get(a.name) || 0));

  return (
    <>
      <PageHero
        title="Jugadores"
        subtitle={`${sorted.length} jugadores en plantilla`}
      />

      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {sorted.map((player, i) => {
              const name = player.firstName && player.lastName ? player.firstName + " " + player.lastName : player.name;
              const goals = scorersMap.get(player.name) || 0;
              return (
                <div key={player.id} className="border border-border bg-surface-container-lowest p-5 transition-colors hover:bg-surface-container">
                  <div className="flex h-12 w-12 items-center justify-center border border-border bg-surface-container">
                    <span className="font-display text-base font-bold text-on-surface-variant">{i + 1}</span>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-on-surface">{name}</p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-on-surface-variant">
                    {goals > 0 && <span>{goals} goles</span>}
                    {goals > 0 && <span className="h-1 w-1 bg-on-surface-variant" />}
                    <span>#{i + 1}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
