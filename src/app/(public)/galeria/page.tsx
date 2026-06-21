import { getCopaData } from "@/lib/loadData";

const HERO_IMAGE = "https://lh3.googleusercontent.com/aida-public/AB6AXuAG1zETlIJO5tIyPT9hYqidLt2ppqhYOLlzgQzMwxB6tICYYJYXeR6dCUxl1M_EqgqYb8RYRHCKBcXhTG5sMRSLhWLLnMbHp5BF7qB5pY2AYqo";

const resultBadge: Record<string, string> = {
  win: "bg-primary text-on-primary border-primary",
  loss: "bg-surface-container text-secondary border-surface-container-high",
  draw: "bg-surface-container text-secondary border-surface-container-high",
};

export default function GaleriaPage() {
  const data = getCopaData();
  const saintsMatchDates = new Set((data.matches?.saints || []).map(m => m.date).filter(Boolean));
  const saintsRound = new Map((data.matches?.saints || []).map(m => {
    const sc = m.score1; const oc = m.score2;
    const r = m.round?.match(/(\d+)/);
    return [r ? parseInt(r[1]) : -1, {
      opponent: m.team1.id === data.saints?.id ? m.team2.name : m.team1.name,
      score: sc !== null ? `${sc}-${oc}` : null,
      result: sc !== null && oc !== null ? (sc > oc ? "win" : sc < oc ? "loss" : "draw") : null
    }];
  }));

  const albums = (data.media.all || []).filter(m => {
    if (m.event !== "5jvbh" || m.type !== "news") return false;
    if (m.dateOnly && saintsMatchDates.has(m.dateOnly)) return true;
    const r = m.title?.match(/Fecha (\d+)/);
    return r && saintsRound.has(parseInt(r[1]));
  }).reverse();

  return (
    <>

      <header className="relative h-[70vh] flex items-end overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <img src={HERO_IMAGE} alt="" className="w-full h-full object-cover opacity-50 scale-105" />
          <div className="absolute inset-0 hero-gradient" />
        </div>
        <div className="relative z-10 w-full max-w-desktop mx-auto px-margin-mobile md:px-margin-desktop pb-16 md:pb-20">
          <span className="font-label-lg text-label-lg uppercase tracking-[0.2em] text-primary mb-4 block">Multimedia</span>
          <h1 className="font-display-xl text-display-xl text-on-surface uppercase mb-6 leading-[0.9]">
            Galería <br /><span className="text-primary">Saint Ferdinand</span>
          </h1>
          <p className="font-body-lg text-body-lg text-secondary">{albums.length} álbumes de la temporada</p>
        </div>
      </header>

      <main>
        <section className="py-section-gap bg-surface">
          <div className="max-w-desktop mx-auto px-margin-mobile md:px-margin-desktop">
            {albums.length === 0 ? (
              <div className="flex flex-col items-center justify-center border border-surface-container-high py-24 text-center">
                <span className="material-symbols-outlined text-6xl text-secondary mb-4">photo_library</span>
                <p className="font-body-lg text-body-lg text-secondary">No hay álbumes disponibles</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
                {albums.map((m, i) => {
                  const r = m.title?.match(/Fecha (\d+)/);
                  const roundNum = r ? parseInt(r[1]) : null;
                  const matchInfo = roundNum ? saintsRound.get(roundNum) : null;
                  const match = matchInfo ? (data.matches?.saints || []).find(sm => {
                    const smR = sm.round?.match(/(\d+)/);
                    return smR && parseInt(smR[1]) === roundNum;
                  }) : null;
                  const sc = match?.score1; const oc = match?.score2;
                  const result = sc != null && oc != null ? sc > oc ? "win" : sc < oc ? "loss" : "draw" : null;

                  return (
                    <div
                      key={m.id}
                    >
                      <a href={m.urlDrive || "#"} target="_blank" rel="noopener noreferrer"
                        className="group relative flex h-72 cursor-pointer items-end overflow-hidden bg-surface-container-lowest border border-surface-container-high"
                      >
                        <img src={m.url || HERO_IMAGE} alt={m.title || "Álbum"}
                          className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="relative z-10 w-full p-6">
                          <div className="flex items-center gap-2 mb-2">
                            {m.urlDrive && (
                              <span className="font-label-sm text-label-sm text-white border border-white/40 px-3 py-1">Álbum</span>
                            )}
                            {result && (
                              <span className={`font-label-sm text-label-sm px-3 py-1 border ${resultBadge[result]}`}>
                                {result === "win" ? "Victoria" : result === "loss" ? "Derrota" : "Empate"}
                              </span>
                            )}
                          </div>
                          <h3 className="font-headline-sm text-headline-sm uppercase text-on-surface mb-1">{m.title || "Álbum"}</h3>
                          {matchInfo?.opponent && (
                            <p className="font-body-md text-body-md text-white/70">vs {matchInfo.opponent} {sc != null && `${sc}-${oc}`}</p>
                          )}
                        </div>
                      </a>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
