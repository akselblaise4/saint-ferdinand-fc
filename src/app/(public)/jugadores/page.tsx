import { PlayerCard } from "@/components/football/player-card";
import { defaultPlayers } from "@/components/football/players-data";
import { Marquee } from "@/components/football/marquee";

export default function JugadoresPage() {
  const positions = ["Todos", "POR", "DEF", "MED", "DEL"];

  return (
    <>
      <Marquee />

      <section className="relative pt-36 pb-16 px-5 md:px-10 max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.03] px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-6">
            Plantilla 2026
          </span>
          <h1 className="font-display text-6xl md:text-8xl leading-[0.9] tracking-tighter text-white">
            Nuestros <span className="text-club-red italic">Jugadores</span>
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            Conoce al equipo que defiende los colores de Saint Ferdinand FC con orgullo y pasión.
          </p>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
          {positions.map((pos) => (
            <button
              key={pos}
              className={`rounded-lg border px-4 py-2 text-[10px] font-semibold uppercase tracking-widest transition-all ${
                pos === "Todos"
                  ? "border-club-red/40 bg-club-red text-white"
                  : "border-white/[0.08] bg-white/[0.03] text-muted-foreground hover:border-white/[0.15]"
              }`}
            >
              {pos}
            </button>
          ))}
        </div>
      </section>

      <section className="pb-28 px-5 md:px-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {defaultPlayers.map((player) => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </div>
      </section>
    </>
  );
}
