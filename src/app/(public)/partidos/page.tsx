import { getCopaData } from "@/lib/loadData";
import { buildBracket } from "@/lib/buildBracket";
import Bracket from "@/components/visuals/Bracket";
import PageEnter from "@/components/animations/PageEnter";
import ScrollReveal from "@/components/animations/ScrollReveal";
import { StaggerItem } from "@/components/animations/StaggerGrid";
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
            <MatchListClient matches={regularMatches} saintsId={saints?.id || null} standings={data.standings} />
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
              <div className="space-y-4">
                {bracketTrees.map((tree, i) => (
                  <div key={i} className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
                    <div className="p-6">
                      <Bracket tree={tree} />
                    </div>
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
