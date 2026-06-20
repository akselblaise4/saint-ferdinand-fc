import Image from "next/image";
import { getCopaData } from "@/lib/loadData";
import PageEnter from "@/components/animations/PageEnter";
import ScrollReveal from "@/components/animations/ScrollReveal";
import { StaggerGrid, StaggerItem } from "@/components/animations/StaggerGrid";

function Badge({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "destructive" | "success" | "secondary" }) {
  const cls = variant === "default" ? "border-transparent bg-white/20 text-white"
    : variant === "destructive" ? "border-transparent bg-red-500/70 text-white"
    : variant === "success" ? "border-transparent bg-emerald-500/70 text-white"
    : "border border-white/20 text-white/80";
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold transition-colors backdrop-blur-sm ${cls}`}>{children}</span>;
}

export default function GaleriaPage() {
  const data = getCopaData();
  const saintsMatchDates = new Set(data.matches.saints.map(m => m.date).filter(Boolean));
  const saintsRound = new Map(data.matches.saints.map(m => {
    const sc = m.score1; const oc = m.score2;
    const r = m.round?.match(/(\d+)/);
    return [r ? parseInt(r[1]) : -1, {
      opponent: m.team1.id === data.saints?.id ? m.team2.name : m.team1.name,
      score: sc !== null ? `${sc}-${oc}` : null,
      result: sc !== null && oc !== null ? (sc > oc ? "W" : sc < oc ? "L" : "D") : null
    }];
  }));

  const albums = (data.media.all || []).filter(m => {
    if (m.evt !== "5jvbh" || m.type !== "news") return false;
    if (m.dateOnly && saintsMatchDates.has(m.dateOnly)) return true;
    const r = m.title?.match(/Fecha (\d+)/);
    return r && saintsRound.has(parseInt(r[1]));
  }).reverse();

  return (
    <PageEnter>
      {/* ── HERO ── */}
      <section className="relative min-h-[50vh] flex items-center overflow-hidden bg-club-black pt-20">
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[length:24px_24px]" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-club-black to-club-black" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10 backdrop-blur-sm">
              <span className="text-2xl">📸</span>
            </div>
            <div>
              <h1 className="font-display text-6xl leading-none tracking-tight text-white md:text-8xl">Galería</h1>
              <p className="mt-2 text-sm text-white/40">{albums.length} álbumes de Saint Ferdinand</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── ALBUMS ── */}
      <ScrollReveal delay={0.1}>
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-6xl px-6">
            {albums.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-24 text-center">
                <p className="text-sm font-medium text-muted-foreground">No hay álbumes disponibles</p>
                <p className="mt-1 text-xs text-muted-foreground/60">Los álbumes aparecerán aquí cuando estén disponibles.</p>
              </div>
            ) : (
              <StaggerGrid className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {albums.map((m) => {
                  const r = m.title?.match(/Fecha (\d+)/);
                  const roundNum = r ? parseInt(r[1]) : null;
                  const matchInfo = roundNum ? saintsRound.get(roundNum) : null;
                  const match = matchInfo ? data.matches.saints.find(sm => {
                    const smR = sm.round?.match(/(\d+)/);
                    return smR && parseInt(smR[1]) === roundNum;
                  }) : null;
                  const sc = match?.score1; const oc = match?.score2;
                  const result = sc != null && oc != null ? sc > oc ? "win" : sc < oc ? "loss" : "draw" : null;

                  return (
                    <StaggerItem key={m.id}>
                      <a href={m.urlDrive || "#"} target="_blank" rel="noopener noreferrer"
                        className="group relative flex h-72 cursor-pointer items-end overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-500 hover:shadow-lg hover:-translate-y-0.5">
                        <Image
                          src={m.thumbnail || m.url || "/images/stadium-crowd.jpg"}
                          alt={m.title || "Álbum"}
                          fill
                          className="absolute inset-0 object-cover transition-all duration-700 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                        <div className="relative z-10 w-full p-5">
                          <div className="flex items-center gap-2">
                            {m.urlDrive && <Badge variant="default">Álbum</Badge>}
                            {result && <Badge variant={result === "win" ? "success" : result === "loss" ? "destructive" : "secondary"}>{result === "win" ? "Victoria" : result === "loss" ? "Derrota" : "Empate"}</Badge>}
                          </div>
                          <h3 className="mt-2 text-lg font-bold text-white">{m.title || "Álbum"}</h3>
                          {matchInfo?.opponent && (
                            <p className="mt-1 text-sm text-white/70">vs {matchInfo.opponent} {sc != null && `${sc}-${oc}`}</p>
                          )}
                          <p className="mt-0.5 text-xs text-white/40">
                            {m.timestamp ? new Date(m.timestamp).toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" }) : ""}
                          </p>
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
    </PageEnter>
  );
}
