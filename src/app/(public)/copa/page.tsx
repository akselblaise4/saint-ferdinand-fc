import { getCopaData } from "@/lib/loadData";

function formatDate(d: string | null) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
}

const HERO_IMAGE = "https://lh3.googleusercontent.com/aida-public/AB6AXuDFef9o9-Xqszly-_LqEJ_JWKLFBAOWGMtnMNLf1MkSCPpsNqyCFEdayR7BpzXAK_qRLCQyRbgSDH66FrYqqrY2D6LQJWjldKl_c7yqP4AczM__lZ2wbJ0kDnZRX94qR_l-CWXBepNq0ubnPL-FDGMCxO3XKv0";

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

  const statBoxes = [
    { label: "PJ", value: ss?.played || 0 },
    { label: "PG", value: ss?.wins || 0 },
    { label: "PE", value: ss?.draws || 0 },
    { label: "PP", value: ss?.losses || 0 },
    { label: "GF", value: ss?.goalsFor || 0 },
    { label: "GC", value: ss?.goalsAgainst || 0 },
    { label: "DIF", value: ss?.goalDiff != null ? (ss.goalDiff > 0 ? "+" : "") + ss.goalDiff : 0 },
    { label: "PTS", value: saints?.season?.pts || 0 },
  ];

  return (
    <>

      <header className="relative h-[65vh] flex items-end overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <img src={HERO_IMAGE} alt="" className="w-full h-full object-cover opacity-40 scale-105" />
          <div className="absolute inset-0 hero-gradient" />
        </div>
        <div className="relative z-10 w-full max-w-desktop mx-auto px-margin-mobile md:px-margin-desktop pb-16">
          <span className="font-label-lg text-label-lg uppercase tracking-[0.2em] text-primary mb-4 block">Competición</span>
          <h1 className="font-display-xl text-display-xl text-on-surface uppercase leading-[0.9] mb-4">Copa Fácil</h1>
          <p className="font-body-lg text-body-lg text-secondary">{ev?.title || "USS Liga Premier"}</p>
        </div>
      </header>

      <main>

        <section className="py-section-gap bg-surface-container-low">
          <div className="max-w-desktop mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-section-gap">
              <div className="bg-surface-container-lowest p-6 md:p-8 border border-surface-container-high">
                <span className="material-symbols-outlined text-primary text-3xl mb-4 block">emoji_events</span>
                <p className="font-label-sm text-label-sm uppercase text-secondary mb-2">Torneo</p>
                <p className="font-headline-md text-headline-md uppercase">{ev?.title || "USS Liga Premier"}</p>
              </div>
              <div className="bg-surface-container-lowest p-6 md:p-8 border border-surface-container-high">
                <span className="material-symbols-outlined text-primary text-3xl mb-4 block">calendar_month</span>
                <p className="font-label-sm text-label-sm uppercase text-secondary mb-2">Periodo</p>
                <p className="font-headline-md text-headline-md uppercase">{formatDate(ev?.startDate)} — {formatDate(ev?.endDate)}</p>
              </div>
              <div className="bg-surface-container-lowest p-6 md:p-8 border border-surface-container-high">
                <span className="material-symbols-outlined text-primary text-3xl mb-4 block">groups</span>
                <p className="font-label-sm text-label-sm uppercase text-secondary mb-2">Divisiones</p>
                <p className="font-headline-md text-headline-md uppercase">{data.divisions?.length || 0} divisiones</p>
              </div>
            </div>

            <h2 className="font-headline-lg text-headline-lg uppercase mb-8 border-l-4 border-primary pl-6">Saint Ferdinand</h2>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-gutter">
              {statBoxes.map((s) => (
                <div key={s.label} className="bg-surface-container-lowest p-4 md:p-6 border border-surface-container-high text-center">
                  <p className="font-display-lg text-display-lg text-primary">{s.value}</p>
                  <p className="font-label-sm text-label-sm uppercase text-secondary mt-2">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-section-gap bg-surface">
          <div className="max-w-desktop mx-auto px-margin-mobile md:px-margin-desktop">
            <h2 className="font-headline-lg text-headline-lg uppercase mb-8 border-l-4 border-primary pl-6">Partidos</h2>
            <div className="space-y-gutter">
              {matches.map((m: any) => {
                const home = isHome(m);
                return (
                  <div
                    key={m.id}
                    className="bg-surface-container-lowest border border-surface-container-high overflow-hidden"
                  >
                    <div className="flex items-center justify-between px-6 py-3 bg-surface-container border-b border-surface-container-high">
                      <span className="font-body-sm text-body-sm text-secondary">{m.date}</span>
                      <span className={`font-label-sm text-label-sm uppercase ${m.isPlayoff ? "text-primary" : "text-secondary"}`}>
                        {m.isPlayoff ? m.title || "Playoff" : "Fase Regular"}
                      </span>
                    </div>
                    <div className="px-6 py-5 flex items-center justify-between gap-4">
                      <span className="font-headline-md text-headline-md uppercase flex-1 text-right">
                        {home ? "Saint Ferdinand" : teamName(m)}
                      </span>
                      <span className="font-display-xl text-display-xl text-primary px-4 shrink-0">{gf(m)} — {gc(m)}</span>
                      <span className="font-headline-md text-headline-md uppercase flex-1">
                        {home ? teamName(m) : "Saint Ferdinand"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {(data.standingsByGroup as any[])?.map((g: any) => (
          <section key={g.group} className="py-section-gap bg-surface-container-low">
            <div className="max-w-desktop mx-auto px-margin-mobile md:px-margin-desktop">
              <h2 className="font-headline-lg text-headline-lg uppercase mb-8 border-l-4 border-primary pl-6">Grupo {g.group}</h2>
              <div className="overflow-x-auto border border-surface-container-high">
                <table className="w-full text-left">
                  <thead className="bg-surface-container-high">
                    <tr>
                      {["#", "Equipo", "PJ", "PG", "PE", "PP", "GF", "GC", "DIF", "PTS"].map((h) => (
                        <th key={h} className="p-4 font-label-sm text-label-sm uppercase text-secondary whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {g.teams?.map((t: any) => (
                      <tr key={t.id} className={t.id === saints?.id ? "bg-primary/5 font-semibold" : "border-t border-surface-container-high"}>
                        <td className="p-4 font-body-md text-body-md">{t.season?.pos}</td>
                        <td className="p-4 font-body-md text-body-md">{t.name}</td>
                        <td className="p-4 font-body-md text-body-md">{t.season?.stats?.played || 0}</td>
                        <td className="p-4 font-body-md text-body-md">{t.season?.stats?.wins || 0}</td>
                        <td className="p-4 font-body-md text-body-md">{t.season?.stats?.draws || 0}</td>
                        <td className="p-4 font-body-md text-body-md">{t.season?.stats?.losses || 0}</td>
                        <td className="p-4 font-body-md text-body-md">{t.season?.stats?.goalsFor || 0}</td>
                        <td className="p-4 font-body-md text-body-md">{t.season?.stats?.goalsAgainst || 0}</td>
                        <td className="p-4 font-body-md text-body-md">{t.season?.stats?.goalDiff ?? 0}</td>
                        <td className="p-4 font-headline-md text-headline-md text-primary">{t.season?.pts || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        ))}

        <section className="py-section-gap bg-surface">
          <div className="max-w-desktop mx-auto px-margin-mobile md:px-margin-desktop">
            <h2 className="font-headline-lg text-headline-lg uppercase mb-8 border-l-4 border-primary pl-6">Goleadores</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
              <div className="bg-surface-container-lowest p-6 md:p-8 border border-surface-container-high">
                <h3 className="font-headline-sm text-headline-sm uppercase mb-6 text-primary">Generales</h3>
                <div className="space-y-3">
                  {topScorers.slice(0, 15).map((s: any, i: number) => (
                    <div key={s.playerId || i} className="flex items-center justify-between border-b border-surface-container-high pb-3 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <span className="font-label-lg text-label-lg text-secondary w-6">{i + 1}</span>
                        <div>
                          <p className="font-body-md text-body-md">{s.playerName || "?"}</p>
                          <p className="font-body-sm text-body-sm text-secondary">{s.teamName}</p>
                        </div>
                      </div>
                      <span className="font-headline-md text-headline-md text-primary">{s.goals}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-surface-container-lowest p-6 md:p-8 border border-surface-container-high">
                <h3 className="font-headline-sm text-headline-sm uppercase mb-6 text-primary">Saint Ferdinand</h3>
                <div className="space-y-3">
                  {saintsScorers.map((s: any, i: number) => (
                    <div key={s.playerId || i} className="flex items-center justify-between border-b border-surface-container-high pb-3 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <span className="font-label-lg text-label-lg text-secondary w-6">{i + 1}</span>
                        <p className="font-body-md text-body-md">{s.playerName || "?"}</p>
                      </div>
                      <span className="font-headline-md text-headline-md text-primary">{s.goals}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-section-gap bg-surface-container-low">
          <div className="max-w-desktop mx-auto px-margin-mobile md:px-margin-desktop">
            <h2 className="font-headline-lg text-headline-lg uppercase mb-8 border-l-4 border-primary pl-6">Plantilla ({roster.length})</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
              {roster.map((p: any) => (
                <div key={p.id} className="bg-surface-container-lowest p-4 md:p-6 border border-surface-container-high flex items-center gap-4">
                  <div className="w-12 h-12 border border-surface-container-high bg-surface-container flex items-center justify-center shrink-0">
                    <span className="font-headline-md text-headline-md text-secondary">{(p.firstName?.[0] || "?").toUpperCase()}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-body-md text-body-md truncate">{p.firstName || p.name}</p>
                    {p.lastName && <p className="font-body-sm text-body-sm text-secondary truncate">{p.lastName}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {media.length > 0 && (
          <section className="py-section-gap bg-surface">
            <div className="max-w-desktop mx-auto px-margin-mobile md:px-margin-desktop">
              <h2 className="font-headline-lg text-headline-lg uppercase mb-8 border-l-4 border-primary pl-6">Medios</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
                {media.map((m: any) => (
                  <a key={m.id} href={m.urlDrive || m.url} target="_blank" rel="noopener noreferrer"
                    className="bg-surface-container-lowest p-6 border border-surface-container-high transition-all hover:-translate-y-1 hover:shadow-lg block"
                  >
                    <p className="font-headline-sm text-headline-sm uppercase mb-4">{m.title}</p>
                    <div className="flex flex-wrap gap-2">
                      {m.cancha && <span className="font-label-sm text-label-sm text-secondary border border-surface-container-high px-3 py-1">{m.cancha}</span>}
                      {m.turno && <span className="font-label-sm text-label-sm text-secondary border border-surface-container-high px-3 py-1">Turno {m.turno}</span>}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        {data.partners?.length > 0 && (
          <section className="py-section-gap bg-surface-container-low">
            <div className="max-w-desktop mx-auto px-margin-mobile md:px-margin-desktop">
              <h2 className="font-headline-lg text-headline-lg uppercase mb-8 border-l-4 border-primary pl-6">Patrocinadores</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
                {data.partners.map((p: any) => (
                  <div key={p.id} className="bg-surface-container-lowest p-6 border border-surface-container-high">
                    <p className="font-headline-md text-headline-md uppercase mb-2">{p.name}</p>
                    {p.phone && <p className="font-body-md text-body-md text-secondary mb-2">{p.phone}</p>}
                    {p.url && <a href={p.url} target="_blank" rel="noopener noreferrer" className="font-label-sm text-label-sm text-primary uppercase inline-flex items-center gap-2">Sitio Web <span className="material-symbols-outlined text-lg">open_in_new</span></a>}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

      </main>
    </>
  );
}
