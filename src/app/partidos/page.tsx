import Image from "next/image";
import { getCopaData } from "@/lib/loadData";
import { buildBracket } from "@/lib/buildBracket";
import Bracket from "@/components/visuals/Bracket";
import PageEnter from "@/components/animations/PageEnter";
import ScrollReveal from "@/components/animations/ScrollReveal";
import { StaggerGrid, StaggerItem } from "@/components/animations/StaggerGrid";
import PageHero from "@/components/sections/PageHero";

const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
function fmt(d: string | null) { if (!d) return ""; const [y, m, dd] = d.split("-").map(Number); return `${dd} ${monthNames[m - 1]} ${y}`; }

function getTeamPhoto(data: any, name: string): string | null {
  return data.standings?.find((s: any) => s.name === name)?.photo || null;
}

const resultStyles: Record<string, string> = {
  win: "border-emerald-200 bg-emerald-50 text-emerald-700",
  loss: "border-red-200 bg-red-50 text-red-700",
  draw: "border-zinc-200 bg-zinc-50 text-zinc-600",
  upcoming: "border-zinc-200 bg-white text-zinc-500",
};

export default function PartidosPage() {
  const data = getCopaData();
  const saints = data.saints;
  const ss = saints?.season?.stats;
  const matches = data.matches?.saints || [];
  const regularMatches = matches.filter(m => !m.isPlayoff).sort((a, b) => (a.dateTimestamp || 0) - (b.dateTimestamp || 0));
  const bracketTrees = buildBracket(matches, saints?.id || null);

  const WDL = (r: "win" | "loss" | "draw") => {
    return regularMatches.filter(m => {
      if (m.score1 === null || m.score2 === null) return false;
      const isHome = m.team1.id === saints?.id;
      const sc = isHome ? m.score1 : m.score2;
      const oc = isHome ? m.score2 : m.score1;
      if (r === "win") return sc > oc;
      if (r === "loss") return sc < oc;
      return sc === oc;
    }).length;
  };

  return (
    <PageEnter>
      <PageHero
        icon="⚽"
        title="Partidos"
        subtitle={`${data.event?.title} · ${ss?.played || 0} partidos jugados`}
      />

      <ScrollReveal>
        <section className="relative overflow-hidden bg-primary">
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[length:20px_20px]" />
          <div className="relative mx-auto max-w-6xl px-6">
            <div className="grid grid-cols-4 divide-x divide-white/10">
              {[
                { value: WDL("win"), label: "Victorias" },
                { value: WDL("draw"), label: "Empates" },
                { value: WDL("loss"), label: "Derrotas" },
                { value: ss ? `${ss.goalsFor}:${ss.goalsAgainst}` : "—", label: "Goleo" },
              ].map(s => (
                <div key={s.label} className="px-4 py-8 text-center md:py-10">
                  <p className="font-display text-3xl leading-none text-white md:text-4xl">{s.value}</p>
                  <p className="mt-2 text-xs font-medium uppercase tracking-wider text-white/60">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-5xl px-6">
            <div className="mb-8">
              <h2 className="font-display text-3xl text-foreground md:text-4xl">Fase Regular</h2>
              <p className="text-sm text-muted-foreground">{regularMatches.length} partidos</p>
            </div>
            <StaggerGrid className="space-y-2">
              {regularMatches.map((m, i) => {
                const isHome = m.team1.id === saints?.id;
                const sc = m.score1 !== null ? (isHome ? m.score1 : m.score2) : null;
                const oc = m.score1 !== null ? (isHome ? m.score2 : m.score1) : null;
                const result = sc !== null && oc !== null ? sc > oc ? "win" : sc < oc ? "loss" : "draw" : null;
                const isFuture = m.score1 === null;
                const oppName = isHome ? m.team2.name : m.team1.name;
                const homeLogo = getTeamPhoto(data, m.team1.name);
                const awayLogo = getTeamPhoto(data, m.team2.name);

                return (
                  <StaggerItem key={m.id + i}>
                    <div className="rounded-xl border bg-card shadow-sm transition-all hover:shadow-md">
                      <div className="flex items-center justify-between gap-4 p-4 md:px-6">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="w-16 shrink-0 text-right text-xs tabular-nums text-muted-foreground">{fmt(m.date)}</span>
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${result ? resultStyles[result] : resultStyles.upcoming}`}>
                            {isFuture ? "Próximo" : result === "win" ? "Victoria" : result === "loss" ? "Derrota" : "Empate"}
                          </span>
                        </div>
                        <div className="flex items-center justify-center gap-3 md:gap-6">
                          <div className="flex items-center gap-2">
                            {homeLogo && (
                              <div className="flex h-6 w-6 items-center justify-center overflow-hidden rounded bg-muted">
                                <Image src={homeLogo} alt="" width={24} height={24} className="h-full w-full object-contain p-0.5" />
                              </div>
                            )}
                            <span className={`truncate text-sm font-medium ${!isHome ? "text-muted-foreground" : ""}`}>
                              {isHome ? "SFFC" : m.team1.name}
                            </span>
                          </div>
                          <div className="flex w-16 items-center justify-center gap-1">
                            {sc !== null ? (
                              <>
                                <span className={`font-display text-xl leading-none ${result === "win" ? "text-emerald-600" : result === "loss" ? "text-red-500" : "text-muted-foreground"}`}>{sc}</span>
                                <span className="text-xs text-muted-foreground">-</span>
                                <span className={`font-display text-xl leading-none ${result === "loss" ? "text-emerald-600" : result === "win" ? "text-red-500" : "text-muted-foreground"}`}>{oc}</span>
                              </>
                            ) : (
                              <span className="text-xs font-semibold text-muted-foreground">VS</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`truncate text-sm font-medium ${isHome ? "text-muted-foreground" : ""}`}>
                              {isHome ? m.team2.name : "SFFC"}
                            </span>
                            {awayLogo && (
                              <div className="flex h-6 w-6 items-center justify-center overflow-hidden rounded bg-muted">
                                <Image src={awayLogo} alt="" width={24} height={24} className="h-full w-full object-contain p-0.5" />
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          {m.venue && <span className="hidden text-xs text-muted-foreground md:block">{m.venue}</span>}
                          <span className="text-xs text-muted-foreground">T{m.turno}</span>
                        </div>
                      </div>
                    </div>
                  </StaggerItem>
                );
              })}
            </StaggerGrid>
          </div>
        </section>
      </ScrollReveal>

      {bracketTrees.length > 0 && (
        <ScrollReveal delay={0.15}>
          <section className="relative overflow-hidden bg-club-black py-16 md:py-24">
            <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[length:24px_24px]" />
            <div className="relative mx-auto max-w-6xl px-6">
              <div className="mb-8">
                <h2 className="font-display text-3xl text-white md:text-4xl">Playoffs</h2>
                <p className="text-sm text-white/30">{bracketTrees[0].rounds.length} fases</p>
              </div>
              <StaggerGrid stagger={0.1}>
                {bracketTrees.map((tree, i) => (
                  <StaggerItem key={i}>
                    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
                      <div className="p-6">
                        <Bracket tree={tree} />
                      </div>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerGrid>
            </div>
          </section>
        </ScrollReveal>
      )}
    </PageEnter>
  );
}
