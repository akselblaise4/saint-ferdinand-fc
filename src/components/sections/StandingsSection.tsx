import type { TopScorer, Standing } from "@/types/football";

interface StandingsSectionProps {
  standings: Standing[];
  scorers: TopScorer[];
  eventTitle?: string | null;
  saintsId?: string | null;
}

export default function StandingsSection({ standings, scorers, eventTitle }: StandingsSectionProps) {
  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="container">
        <div className="text-center mb-10 md:mb-14">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-red mb-1">{eventTitle || "Liga"}</p>
          <h2 className="text-3xl md:text-5xl font-bold font-display text-[#111] uppercase tracking-[-0.02em]">Clasificación</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#C8D4E0]">
                    <th className="pb-3 text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground w-8">#</th>
                    <th className="pb-3 text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Equipo</th>
                    <th className="pb-3 text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground text-center">PJ</th>
                    <th className="pb-3 text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground text-center">PG</th>
                    <th className="pb-3 text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground text-center">PE</th>
                    <th className="pb-3 text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground text-center">PP</th>
                    <th className="pb-3 text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground text-center">GF</th>
                    <th className="pb-3 text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground text-center">GC</th>
                    <th className="pb-3 text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground text-center">DG</th>
                    <th className="pb-3 text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground text-center font-bold">PTS</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((team, i) => {
                    const s = team.stats;
                    return (
                      <tr key={team.id || i} className={`border-b border-[rgba(0,0,0,0.04)] hover:bg-red/5 transition-colors ${team.name?.includes("SAINT") ? "bg-red/5 font-bold" : ""}`}>
                        <td className="py-3 text-sm text-muted-foreground">{team.pos || i + 1}</td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            {team.photo && <img src={team.photo} alt="" className="w-5 h-5 object-contain" />}
                            <span className="text-sm text-[#001838]">{team.name || "—"}</span>
                          </div>
                        </td>
                        <td className="py-3 text-sm text-center text-muted-foreground">{s?.played ?? "—"}</td>
                        <td className="py-3 text-sm text-center text-muted-foreground">{s?.wins ?? "—"}</td>
                        <td className="py-3 text-sm text-center text-muted-foreground">{s?.draws ?? "—"}</td>
                        <td className="py-3 text-sm text-center text-muted-foreground">{s?.losses ?? "—"}</td>
                        <td className="py-3 text-sm text-center text-muted-foreground">{s?.goalsFor ?? "—"}</td>
                        <td className="py-3 text-sm text-center text-muted-foreground">{s?.goalsAgainst ?? "—"}</td>
                        <td className={`py-3 text-sm text-center ${(s?.goalDiff ?? 0) > 0 ? "text-green-600" : (s?.goalDiff ?? 0) < 0 ? "text-red" : "text-muted-foreground"}`}>
                          {s?.goalDiff ?? "—"}
                        </td>
                        <td className="py-3 text-sm text-center font-bold text-[#001838]">{team.pts ?? "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <div className="bg-ivory rounded-lg border border-[#C8D4E0] p-5">
              <h3 className="text-sm font-bold font-display text-[#001838] uppercase tracking-[0.05em] mb-4 flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D42030" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                Máximos Goleadores
              </h3>
              <div className="space-y-3">
                {scorers.slice(0, 8).map((scorer, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] font-bold text-muted-foreground w-5 flex-shrink-0">{scorer.overallRank || i + 1}º</span>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#001838] truncate">{scorer.player || "—"}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{scorer.team || ""}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-red flex-shrink-0">{scorer.goals ?? 0}</span>
                  </div>
                ))}
                {(!scorers || scorers.length === 0) && (
                  <p className="text-sm text-muted-foreground">Sin datos disponibles</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
