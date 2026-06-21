import type { TeamStats } from "@/types/football";

interface StatsSectionProps {
  stats: TeamStats | null;
  position?: number | null;
  points?: number | null;
}

const statDefs: { key: keyof TeamStats; label: string }[] = [
  { key: "played", label: "PJ" },
  { key: "wins", label: "PG" },
  { key: "draws", label: "PE" },
  { key: "losses", label: "PP" },
  { key: "goalsFor", label: "GF" },
  { key: "goalsAgainst", label: "GC" },
];

export default function StatsSection({ stats, position, points }: StatsSectionProps) {
  return (
    <section id="estadisticas" className="py-12 md:py-20 bg-ivory">
      <div className="container">
        <div className="text-center mb-10 md:mb-14">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-red mb-1">Rendimiento</p>
          <h2 className="text-3xl md:text-5xl font-bold font-display text-[#111] uppercase tracking-[-0.02em]">Estadísticas</h2>
        </div>

        <div className="grid grid-cols-4 md:grid-cols-8 gap-3 md:gap-4 max-w-3xl mx-auto mb-8">
          {stats && statDefs.map(({ key, label }) => (
            <div key={label} className="text-center p-4 md:p-5 rounded-lg bg-white border border-[#C8D4E0]">
              <div className="text-2xl md:text-3xl font-bold font-display text-[#001838]">{stats[key]}</div>
              <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground mt-1">{label}</div>
            </div>
          ))}
          {!stats && <p className="col-span-full text-center text-sm text-muted-foreground">Sin datos disponibles</p>}
          {position !== undefined && position !== null && (
            <div className="text-center p-4 md:p-5 rounded-lg bg-red/5 border border-red/20">
              <div className="text-2xl md:text-3xl font-bold font-display text-red">{position}º</div>
              <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-red mt-1">Posición</div>
            </div>
          )}
          {points !== undefined && points !== null && (
            <div className="text-center p-4 md:p-5 rounded-lg bg-red text-white">
              <div className="text-2xl md:text-3xl font-bold font-display">{points}</div>
              <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/80 mt-1">Puntos</div>
            </div>
          )}
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-red/20 to-transparent max-w-xl mx-auto" />
      </div>
    </section>
  );
}
