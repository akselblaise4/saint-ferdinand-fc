import { getCopaData } from "@/lib/loadData";
import PageEnter from "@/components/animations/PageEnter";
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
  const playerNamesMap: Record<string, string> = {};
  (roster as any[]).forEach((p: any) => { if (p.id) playerNamesMap[p.id] = p.firstName && p.lastName ? p.firstName + ' ' + p.lastName : p.name; });

  const isHome = (m: any) => m.team1?.id === saints?.id;
  const teamName = (m: any) => isHome(m) ? m.team2?.name : m.team1?.name;
  const gf = (m: any) => isHome(m) ? m.score1 : m.score2;
  const gc = (m: any) => isHome(m) ? m.score2 : m.score1;


  return (
    <PageEnter>
      <PageHero icon="🏆" title="Copa Fácil" subtitle={`${ev?.title || "USS Liga Premier"}`} />

      <ScrollReveal>
        <section className="py-12 md:py-16">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-xl border bg-card p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Torneo</p>
                <p className="mt-1 text-lg font-bold">{ev?.title || "Martes Uss Liga Premier"}</p>
              </div>
              <div className="rounded-xl border bg-card p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Periodo</p>
                <p className="mt-1 text-lg font-bold">{formatDate(ev?.startDate)} — {formatDate(ev?.endDate)}</p>
              </div>
              <div className="rounded-xl border bg-card p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Divisiones</p>
                <p className="mt-1 text-lg font-bold">{data.divisions?.length || 0} divisiones</p>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="font-display text-2xl md:text-3xl mb-8">SAINT FERDINAND</h2>
            <div className="grid gap-4 md:grid-cols-4 mb-8">
              <StatBox label="PJ" value={ss?.played || 0} />
              <StatBox label="PG" value={ss?.wins || 0} className="text-green-600" />
              <StatBox label="PE" value={ss?.draws || 0} />
              <StatBox label="PP" value={ss?.losses || 0} className="text-red-600" />
              <StatBox label="GF" value={ss?.goalsFor || 0} />
              <StatBox label="GC" value={ss?.goalsAgainst || 0} />
              <StatBox label="DIF" value={ss?.goalDiff != null ? (ss.goalDiff > 0 ? "+" : "") + ss.goalDiff : 0} />
              <StatBox label="PTS" value={saints?.season?.pts || 0} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <StatBox label="Amarillas" value={ss?.yellowCards || 0} className="text-yellow-600" />
              <StatBox label="Rojas" value={ss?.redCards || 0} className="text-red-600" />
            </div>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="py-12 md:py-16">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="font-display text-2xl md:text-3xl mb-8">Partidos</h2>
            <div className="space-y-4">
              {matches.map((m: any) => {
                const isSaintsHome = isHome(m);
                const mergedDetail = m.details;
                const goals = mergedDetail?.list?.filter((e: any) => e.ac === 1 || e.ac === 5) || [];
                const cards = mergedDetail?.list?.filter((e: any) => e.ac === 4 || e.ac === 9) || [];
                const bestKey = mergedDetail?.best ? Object.keys(mergedDetail.best)[0] : null;
                const mvpName = bestKey ? (playerNamesMap?.[bestKey] || null) : null;
                const mvpRating = bestKey ? (Object.values(mergedDetail.best)[0] as any)?.num_val || null : null;
                return (
                  <div key={m.id} className="rounded-xl border bg-card overflow-hidden">
                    <div className="flex items-center justify-between p-4 bg-muted/20">
                      <span className="text-sm text-muted-foreground">{m.date}</span>
                      <div className="flex items-center gap-2">
                        {m.venue && <span className="text-xs text-muted-foreground">{m.venue}</span>}
                        <span className="text-xs font-semibold uppercase">{m.isPlayoff ? m.title || "Playoff" : "Fase Regular"}</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold truncate min-w-0">{isSaintsHome ? "SAINT FERDINAND" : teamName(m)}</span>
                        <span className="text-2xl font-bold px-4 shrink-0">{gf(m)} — {gc(m)}</span>
                        <span className="font-semibold text-right truncate min-w-0">{isSaintsHome ? teamName(m) : "SAINT FERDINAND"}</span>
                      </div>
                      {(goals.length > 0 || cards.length > 0 || mvpName) && (
                        <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                          {goals.length > 0 && (
                            <div><span className="font-semibold text-foreground">Goles: </span>
                              {goals.map((g: any, i: number) => (
                                <span key={i}>{g.playerName || "?"} ({(g.team1 === m.team1?.id ? m.team1?.name : m.team2?.name) || ""}){i < goals.length - 1 ? ", " : ""}</span>
                              ))}
                            </div>
                          )}
                          {cards.length > 0 && (
                            <div><span className="font-semibold text-foreground">Tarjetas: </span>
                              {cards.map((c: any, i: number) => (
                                <span key={i}>{c.playerName || "?"} — {c.val2 === 2 ? "Segunda amarilla" : (c.ac === 4 ? "Expulsión" : "Amarilla")}{i < cards.length - 1 ? "; " : ""}</span>
                              ))}
                            </div>
                          )}
                          {mvpName && (
                            <div><span className="font-semibold text-foreground">MVP: </span>
                              <span>{mvpName} ({mvpRating})</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {(data.standingsByGroup as unknown as any[])?.map((g: any) => (
        <ScrollReveal key={g.group}>
          <section className="py-12 md:py-16 bg-muted/30">
            <div className="mx-auto max-w-6xl px-6">
              <h2 className="font-display text-2xl md:text-3xl mb-8">Grupo {g.group}</h2>
              <div className="overflow-x-auto rounded-xl border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="p-3 text-left">#</th><th className="p-3 text-left">Equipo</th>
                      <th className="p-3 text-center">PJ</th><th className="p-3 text-center">PG</th>
                      <th className="p-3 text-center">PE</th><th className="p-3 text-center">PP</th>
                      <th className="p-3 text-center">GF</th><th className="p-3 text-center">GC</th>
                      <th className="p-3 text-center">DIF</th><th className="p-3 text-center">PTS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.teams?.map((t: any) => (
                      <tr key={t.id} className={t.id === saints?.id ? "bg-primary/10 font-semibold" : "border-t"}>
                        <td className="p-3">{t.season?.pos}</td>
                        <td className="p-3">{t.name}</td>
                        <td className="p-3 text-center">{t.season?.stats?.played || 0}</td>
                        <td className="p-3 text-center">{t.season?.stats?.wins || 0}</td>
                        <td className="p-3 text-center">{t.season?.stats?.draws || 0}</td>
                        <td className="p-3 text-center">{t.season?.stats?.losses || 0}</td>
                        <td className="p-3 text-center">{t.season?.stats?.goalsFor || 0}</td>
                        <td className="p-3 text-center">{t.season?.stats?.goalsAgainst || 0}</td>
                        <td className="p-3 text-center">{t.season?.stats?.goalDiff ?? 0}</td>
                        <td className="p-3 text-center font-bold">{t.season?.pts || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </ScrollReveal>
      ))}

      <ScrollReveal>
        <section className="py-12 md:py-16">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="font-display text-2xl md:text-3xl mb-8">Goleadores</h2>
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <h3 className="text-lg font-semibold mb-4">Generales</h3>
                <table className="w-full text-sm border rounded-xl overflow-hidden">
                  <thead className="bg-muted/50">
                    <tr><th className="p-2 text-left">#</th><th className="p-2 text-left">Jugador</th><th className="p-2 text-left">Equipo</th><th className="p-2 text-center">Goles</th></tr>
                  </thead>
                  <tbody>
                    {topScorers.slice(0, 20).map((s: any, i: number) => (
                      <tr key={s.playerId || i} className="border-t">
                        <td className="p-2">{i + 1}</td>
                        <td className="p-2">{s.playerName || "?"}</td>
                        <td className="p-2 text-muted-foreground">{s.teamName}</td>
                        <td className="p-2 text-center font-bold">{s.goals}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Saint Ferdinand</h3>
                <table className="w-full text-sm border rounded-xl overflow-hidden">
                  <thead className="bg-muted/50">
                    <tr><th className="p-2 text-left">#</th><th className="p-2 text-left">Jugador</th><th className="p-2 text-center">Goles</th></tr>
                  </thead>
                  <tbody>
                    {saintsScorers.map((s: any, i: number) => (
                      <tr key={s.playerId || i} className="border-t">
                        <td className="p-2">{i + 1}</td>
                        <td className="p-2">{s.playerName || "?"}</td>
                        <td className="p-2 text-center font-bold">{s.goals}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="font-display text-2xl md:text-3xl mb-8">Plantilla ({roster.length})</h2>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {roster.map((p: any) => (
                <div key={p.id} className="rounded-xl border bg-card p-4 flex items-center gap-3">
                  {p.photo ? (
                    <img src={p.photo} alt={p.firstName || ""} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-lg font-bold text-muted-foreground">
                      {(p.firstName?.[0] || "?").toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{p.firstName || p.name}</p>
                    {p.lastName && <p className="text-xs text-muted-foreground truncate">{p.lastName}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {media.length > 0 && (
        <ScrollReveal>
          <section className="py-12 md:py-16">
            <div className="mx-auto max-w-6xl px-6">
              <h2 className="font-display text-2xl md:text-3xl mb-8">Medios</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {media.map((m: any) => {
                  const isDrive = m.urlDrive && (m.urlDrive.includes("drive.google.com") || m.urlDrive.includes("drive"));
                  const isPhoto = m.url && (m.url.match(/.(jpg|jpeg|png|gif|webp)(\?|$)/i));
                  return (
                  <a key={m.id} href={m.urlDrive || m.url} target="_blank" rel="noopener noreferrer" className="rounded-xl border bg-card overflow-hidden hover:bg-muted/50 transition-colors block group">
                    {isPhoto && (
                      <div className="h-40 bg-muted overflow-hidden">
                        <img src={m.url} alt={m.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    )}
                    <div className={"p-4" + (isPhoto ? "" : " pt-0")}>
                      <p className="font-semibold text-sm">{m.title}</p>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                        {m.cancha && <span className="rounded-full bg-muted px-2 py-0.5">{m.cancha}</span>}
                        {m.turno && <span className="rounded-full bg-muted px-2 py-0.5">Turno {m.turno}</span>}
                        {m.matchedDate && <span className="rounded-full bg-muted px-2 py-0.5">{m.matchedDate}</span>}
                        {isDrive && <span className="rounded-full bg-blue-100 text-blue-700 px-2 py-0.5">Drive</span>}
                      </div>
                    </div>
                  </a>
                );})}
              </div>
            </div>
          </section>
        </ScrollReveal>
      )}

      {data.partners?.length > 0 && (
        <ScrollReveal>
          <section className="py-12 md:py-16 bg-muted/30">
            <div className="mx-auto max-w-6xl px-6">
              <h2 className="font-display text-2xl md:text-3xl mb-8">Patrocinadores</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {data.partners.map((p: any) => (
                  <div key={p.id} className="rounded-xl border bg-card p-4">
                    <p className="font-semibold">{p.name}</p>
                    {p.phone && <p className="text-sm text-muted-foreground">{p.phone}</p>}
                    {p.url && <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">Sitio Web</a>}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </ScrollReveal>
      )}
    </PageEnter>
  );
}

function StatBox({ label, value, className }: { label: string; value: string | number; className?: string }) {
  return (
    <div className="rounded-xl border bg-card p-4 text-center">
      <p className={"text-2xl font-bold " + (className || "")}>{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
