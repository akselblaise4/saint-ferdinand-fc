import { getCopaData } from "@/lib/loadData";
import ScrollReveal from "@/components/animations/ScrollReveal";
import { StaggerGrid, StaggerItem } from "@/components/animations/StaggerGrid";
import PageHero from "@/components/sections/PageHero";

const resultBadge: Record<string, string> = {
  win: "bg-club-red text-white border-club-red",
  loss: "bg-surface-container text-on-surface-variant border-border",
  draw: "bg-surface-container text-on-surface-variant border-border",
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
      <PageHero
        title="Galería"
        subtitle={`${albums.length} álbumes de Saint Ferdinand`}
      />

      <ScrollReveal delay={0.1}>
        <section className="py-12 md:py-16">
          <div className="mx-auto max-w-6xl px-6">
            {albums.length === 0 ? (
              <div className="flex flex-col items-center justify-center border border-dashed py-24 text-center">
                <p className="text-sm font-medium text-on-surface-variant">No hay álbumes disponibles</p>
              </div>
            ) : (
              <StaggerGrid className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {albums.map((m) => {
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
                    <StaggerItem key={m.id}>
                      <a href={m.urlDrive || "#"} target="_blank" rel="noopener noreferrer"
                        className="group relative flex h-64 cursor-pointer items-end overflow-hidden border border-border bg-surface-container-lowest transition-colors hover:bg-surface-container">
                        <img
                          src={m.url || "/images/stadium-crowd.jpg"}
                          alt={m.title || "Álbum"}
                          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500 group-hover:opacity-80"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="relative z-10 w-full p-5">
                          <div className="flex items-center gap-2">
                            {m.urlDrive && (
                              <span className="border border-white/40 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-white">
                                Álbum
                              </span>
                            )}
                            {result && (
                              <span className={`border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] ${resultBadge[result]}`}>
                                {result === "win" ? "Victoria" : result === "loss" ? "Derrota" : "Empate"}
                              </span>
                            )}
                          </div>
                          <h3 className="mt-2 text-base font-bold text-white">{m.title || "Álbum"}</h3>
                          {matchInfo?.opponent && (
                            <p className="mt-1 text-sm text-white/70">vs {matchInfo.opponent} {sc != null && `${sc}-${oc}`}</p>
                          )}
                        </div>
                      </a>
                    </StaggerItem>
                  );
                })}
              </StaggerGrid>
            )}
          </div>
        </section>
      </ScrollReveal>
    </>
  );
}
