import { getCopaData } from "@/lib/loadData";
import ScrollReveal from "@/components/animations/ScrollReveal";
import PageHero from "@/components/sections/PageHero";

function formatDate(d: string | null) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" });
}

export default function CopaPage() {
  const data = getCopaData();
  const ev = data.event;
  const saints = data.saints;
  const ss = saints?.season?.stats;
  const matches = data.matches?.saints?.filter((m: any) => m.score1 != null && m.score2 != null) || [];
  const topScorers = (data as any).topScorers?.overall || [];
  const saintsScorers = (data as any).topScorers?.saints || [];
  const media = (data as any).media?.enriched?.filtered || [];
  const roster = saints?.id ? ((data as any).players?.byTeam?.[saints.id]?.players || []) : [];

  const isHome = (m: any) => m.team1?.id === saints?.id;
  const teamName = (m: any) => isHome(m) ? m.team2?.name : m.team1?.name;
  const gf = (m: any) => isHome(m) ? m.score1 : m.score2;
  const gc = (m: any) => isHome(m) ? m.score2 : m.score1;

  return (
    <>
      <PageHero title="Copa Fácil" subtitle={`${ev?.title || "USS Liga Premier"}`} />

      <section className="border-b border-border bg-surface-container py-8 md:py-10">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="border border-border bg-surface-container-lowest p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant">Torneo</p>
              <p className="mt-1 text-sm font-semibold text-on-surface">{ev?.title || "USS Liga Premier"}</p>
            </div>
            <div className="border border-border bg-surface-container-lowest p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant">Periodo</p>
              <p className="mt-1 text-sm font-semibold text-on-surface">{formatDate(ev?.startDate)} — {formatDate(ev?.endDate)}</p>
            </div>
            <div className="border border-border bg-surface-container-lowest p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant">Divisiones</p>
              <p className="mt-1 text-sm font-semibold text-on-surface">{data.divisions?.length || 0} divisiones</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border py-10 md:py-12">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-display text-xl font-bold uppercase tracking-[-0.01em] text-on-surface mb-5">SAINT FERDINAND</h2>
          <div className="grid grid-cols-4 gap-3 mb-4">
            <StatBox label="PJ" value={ss?.played || 0} />
            <StatBox label="PG" value={ss?.wins || 0} />
            <StatBox label="PE" value={ss?.draws || 0} />
            <StatBox label="PP" value={ss?.losses || 0} />
            <StatBox label="GF" value={ss?.goalsFor || 0} />
            <StatBox label="GC" value={ss?.goalsAgainst || 0} />
            <StatBox label="DIF" value={ss?.goalDiff != null ? (ss.goalDiff > 0 ? "+" : "") + ss.goalDiff : 0} />
            <StatBox label="PTS" value={saints?.season?.pts || 0} />
          </div>
        </div>
      </section>

      <section className="border-b border-border py-10 md:py-12">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-display text-xl font-bold uppercase tracking-[-0.01em] text-on-surface mb-5">Partidos</h2>
          <div className="space-y-3">
            {matches.map((m: any) => {
              const isSaintsHome = isHome(m);
              return (
                <div key={m.id} className="border border-border bg-surface-container-lowest">
                  <div className="flex items-center justify-between px-4 py-3 bg-surface-container border-b border-border">
                    <span className="text-xs text-on-surface-variant">{m.date}</span>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-on-surface-variant">
                      {m.isPlayoff ? m.title || "Playoff" : "Fase Regular"}
                    </span>
                  </div>
                  <div className="px-4 py-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-on-surface truncate">
                        {isSaintsHome ? "SAINT FERDINAND" : teamName(m)}
                      </span>
                      <span className="font-display text-xl font-bold text-on-surface px-3 shrink-0">
                        {gf(m)} — {gc(m)}
                      </span>
                      <span className="text-sm font-medium text-on-surface text-right truncate">
                        {isSaintsHome ? teamName(m) : "SAINT FERDINAND"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {(data.standingsByGroup as any[])?.map((g: any) => (
        <section key={g.group} className="border-b border-border bg-surface-container py-10 md:py-12">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="font-display text-xl font-bold uppercase tracking-[-0.01em] text-on-surface mb-5">Grupo {g.group}</h2>
            <div className="overflow-x-auto border border-border">
              <table className="w-full text-sm">
                <thead className="bg-surface-container-high">
                  <tr>
                    <th className="p-3 text-left text-[10px] font-semibold uppercase tracking-[0.06em] text-on-surface-variant">#</th>
                    <th className="p-3 text-left text-[10px] font-semibold uppercase tracking-[0.06em] text-on-surface-variant">Equipo</th>
                    <th className="p-3 text-center text-[10px] font-semibold uppercase tracking-[0.06em] text-on-surface-variant">PJ</th>
                    <th className="p-3 text-center text-[10px] font-semibold uppercase tracking-[0.06em] text-on-surface-variant">PG</th>
                    <th className="p-3 text-center text-[10px] font-semibold uppercase tracking-[0.06em] text-on-surface-variant">PE</th>
                    <th className="p-3 text-center text-[10px] font-semibold uppercase tracking-[0.06em] text-on-surface-variant">PP</th>
                    <th className="p-3 text-center text-[10px] font-semibold uppercase tracking-[0.06em] text-on-surface-variant">GF</th>
                    <th className="p-3 text-center text-[10px] font-semibold uppercase tracking-[0.06em] text-on-surface-variant">GC</th>
                    <th className="p-3 text-center text-[10px] font-semibold uppercase tracking-[0.06em] text-on-surface-variant">DIF</th>
                    <th className="p-3 text-center text-[10px] font-semibold uppercase tracking-[0.06em] text-on-surface-variant">PTS</th>
                  </tr>
                </thead>
                <tbody>
                  {g.teams?.map((t: any) => (
                    <tr key={t.id} className={t.id === saints?.id ? "bg-club-red/5 font-semibold" : "border-t border-border"}>
                      <td className="p-3 text-sm">{t.season?.pos}</td>
                      <td className="p-3 text-sm">{t.name}</td>
                      <td className="p-3 text-center text-sm">{t.season?.stats?.played || 0}</td>
                      <td className="p-3 text-center text-sm">{t.season?.stats?.wins || 0}</td>
                      <td className="p-3 text-center text-sm">{t.season?.stats?.draws || 0}</td>
                      <td className="p-3 text-center text-sm">{t.season?.stats?.losses || 0}</td>
                      <td className="p-3 text-center text-sm">{t.season?.stats?.goalsFor || 0}</td>
                      <td className="p-3 text-center text-sm">{t.season?.stats?.goalsAgainst || 0}</td>
                      <td className="p-3 text-center text-sm">{t.season?.stats?.goalDiff ?? 0}</td>
                      <td className="p-3 text-center text-sm font-bold">{t.season?.pts || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      ))}

      <section className="border-b border-border py-10 md:py-12">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-display text-xl font-bold uppercase tracking-[-0.01em] text-on-surface mb-5">Goleadores</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold text-on-surface mb-3">Generales</h3>
              <div className="border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-surface-container-high">
                    <tr>
                      <th className="p-2 text-left text-[10px] font-semibold uppercase tracking-[0.06em] text-on-surface-variant">#</th>
                      <th className="p-2 text-left text-[10px] font-semibold uppercase tracking-[0.06em] text-on-surface-variant">Jugador</th>
                      <th className="p-2 text-left text-[10px] font-semibold uppercase tracking-[0.06em] text-on-surface-variant">Equipo</th>
                      <th className="p-2 text-center text-[10px] font-semibold uppercase tracking-[0.06em] text-on-surface-variant">Goles</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topScorers.slice(0, 20).map((s: any, i: number) => (
                      <tr key={s.playerId || i} className="border-t border-border">
                        <td className="p-2 text-sm">{i + 1}</td>
                        <td className="p-2 text-sm">{s.playerName || "?"}</td>
                        <td className="p-2 text-sm text-on-surface-variant">{s.teamName}</td>
                        <td className="p-2 text-center text-sm font-bold">{s.goals}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-on-surface mb-3">Saint Ferdinand</h3>
              <div className="border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-surface-container-high">
                    <tr>
                      <th className="p-2 text-left text-[10px] font-semibold uppercase tracking-[0.06em] text-on-surface-variant">#</th>
                      <th className="p-2 text-left text-[10px] font-semibold uppercase tracking-[0.06em] text-on-surface-variant">Jugador</th>
                      <th className="p-2 text-center text-[10px] font-semibold uppercase tracking-[0.06em] text-on-surface-variant">Goles</th>
                    </tr>
                  </thead>
                  <tbody>
                    {saintsScorers.map((s: any, i: number) => (
                      <tr key={s.playerId || i} className="border-t border-border">
                        <td className="p-2 text-sm">{i + 1}</td>
                        <td className="p-2 text-sm">{s.playerName || "?"}</td>
                        <td className="p-2 text-center text-sm font-bold">{s.goals}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-surface-container py-10 md:py-12">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-display text-xl font-bold uppercase tracking-[-0.01em] text-on-surface mb-5">Plantilla ({roster.length})</h2>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {roster.map((p: any) => (
              <div key={p.id} className="border border-border bg-surface-container-lowest p-4 flex items-center gap-3">
                <div className="h-10 w-10 border border-border bg-surface-container flex items-center justify-center text-sm font-bold text-on-surface-variant shrink-0">
                  {(p.firstName?.[0] || "?").toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-on-surface truncate">{p.firstName || p.name}</p>
                  {p.lastName && <p className="text-xs text-on-surface-variant truncate">{p.lastName}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {media.length > 0 && (
        <section className="border-b border-border py-10 md:py-12">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="font-display text-xl font-bold uppercase tracking-[-0.01em] text-on-surface mb-5">Medios</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {media.map((m: any) => (
                <a key={m.id} href={m.urlDrive || m.url} target="_blank" rel="noopener noreferrer"
                  className="border border-border bg-surface-container-lowest transition-colors hover:bg-surface-container block">
                  <div className="p-4">
                    <p className="text-sm font-medium text-on-surface">{m.title}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-on-surface-variant">
                      {m.cancha && <span className="border border-border px-2 py-0.5">{m.cancha}</span>}
                      {m.turno && <span className="border border-border px-2 py-0.5">Turno {m.turno}</span>}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {data.partners?.length > 0 && (
        <section className="bg-surface-container py-10 md:py-12">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="font-display text-xl font-bold uppercase tracking-[-0.01em] text-on-surface mb-5">Patrocinadores</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {data.partners.map((p: any) => (
                <div key={p.id} className="border border-border bg-surface-container-lowest p-4">
                  <p className="text-sm font-semibold text-on-surface">{p.name}</p>
                  {p.phone && <p className="text-xs text-on-surface-variant mt-1">{p.phone}</p>}
                  {p.url && <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-xs text-club-red mt-1 inline-block">Sitio Web</a>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border border-border bg-surface-container-lowest p-3 text-center">
      <p className="font-display text-lg font-bold text-club-red">{value}</p>
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-on-surface-variant mt-0.5">{label}</p>
    </div>
  );
}
