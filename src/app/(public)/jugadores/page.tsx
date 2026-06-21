import { getCopaData } from "@/lib/loadData";
import { PlayerCard } from "@/components/football/player-card";
import { Marquee } from "@/components/football/marquee";

export default function JugadoresPage() {
  const data = getCopaData();
  const players = (data.players as any)?.items || [];
  const scorersMap = new Map<string, number>();
  const rankingsMap = new Map<string, number>();
  for (const s of (data as any).topScorers.saints) {
    scorersMap.set(s.playerName, s.goals);
  }
  const ranksMap = new Map<string, number>();
  for (const s of (data as any).topScorers.overall) {
    if (!ranksMap.has(s.playerName)) {
      ranksMap.set(s.playerName, s.overallRank || ranksMap.size + 1);
    }
  }
  const sorted = [...(players as any[])].sort((a, b) => (scorersMap.get(b.name) || 0) - (scorersMap.get(a.name) || 0));

  return (
    <>
      <Marquee />

      <section className="relative pt-36 pb-16 px-5 md:px-10 max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.03] px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-6">
            Plantilla 2026 · {sorted.length} jugadores
          </span>
          <h1 className="font-display text-6xl md:text-8xl leading-[0.9] tracking-tighter text-white">
            Nuestros <span className="text-club-red italic">Jugadores</span>
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            Conoce al equipo que defiende los colores de Saint Ferdinand FC con orgullo y pasión.
          </p>
        </div>
      </section>

      <section className="pb-28 px-5 md:px-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sorted.map((player, i) => (
            <PlayerCard
              key={player.id}
              name={player.name}
              number={i + 1}
              goals={scorersMap.get(player.name) || 0}
              rank={ranksMap.get(player.name)}
            />
          ))}
        </div>
      </section>
    </>
  );
}
