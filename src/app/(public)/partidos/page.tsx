import { getCopaData } from "@/lib/loadData";
import { buildBracket } from "@/lib/buildBracket";
import Bracket from "@/components/visuals/Bracket";
import ScrollReveal from "@/components/animations/ScrollReveal";
import PageHero from "@/components/sections/PageHero";
import MatchListClient from "@/components/MatchListClient";

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
    <>
      <PageHero
        title="Partidos"
        subtitle={`${data.event?.title} · ${ss?.played || 0} partidos jugados`}
      />

      {/* Stats bar */}
      <section className="border-b border-border bg-surface-container">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-4">
            {[
              { value: WDL("win"), label: "Victorias" },
              { value: WDL("draw"), label: "Empates" },
              { value: WDL("loss"), label: "Derrotas" },
              { value: ss ? `${ss.goalsFor}:${ss.goalsAgainst}` : "—", label: "Goleo" },
            ].map(s => (
              <div key={s.label} className="border-r border-border px-4 py-6 text-center last:border-r-0">
                <p className="font-display text-2xl font-bold text-club-red md:text-3xl">{s.value}</p>
                <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ScrollReveal delay={0.1}>
        <section className="py-12 md:py-16">
          <div className="mx-auto max-w-5xl px-6">
            <div className="mb-6">
              <h2 className="font-display text-2xl font-bold uppercase tracking-[-0.01em] text-on-surface md:text-3xl">Fase Regular</h2>
              <p className="text-sm text-on-surface-variant">{regularMatches.length} partidos</p>
            </div>
            <MatchListClient matches={regularMatches} saintsId={saints?.id || null} standings={data.standings || []} />
          </div>
        </section>
      </ScrollReveal>

      {bracketTrees.length > 0 && (
        <ScrollReveal delay={0.15}>
          <section className="bg-surface-container border-t border-border py-12 md:py-16">
            <div className="mx-auto max-w-6xl px-6">
              <div className="mb-6">
                <h2 className="font-display text-2xl font-bold uppercase tracking-[-0.01em] text-on-surface md:text-3xl">Playoffs</h2>
                <p className="text-sm text-on-surface-variant">{bracketTrees[0].rounds.length} fases</p>
              </div>
              <div className="space-y-4">
                {bracketTrees.map((tree, i) => (
                  <div key={i} className="border border-border bg-surface-container-lowest p-6">
                    <Bracket tree={tree} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        </ScrollReveal>
      )}
    </>
  );
}
