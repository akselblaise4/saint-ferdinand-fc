"use client";

import { useSaints, useSaintsMatches, useStandings, useSaintsScorers, useMedia, useEvent } from "@/hooks/useCopaData";
import HeroSection from "@/components/sections/HeroSection";
import MatchdayCard from "@/components/sections/MatchdayCard";
import GalleryHorizontal from "@/components/sections/GalleryHorizontal";
import { BentoGridHome, type Tile } from "@/components/sections/BentoGridHome";
import { PlayerCard } from "@/components/sections/PlayerCard";
import { StatCard } from "@/components/ui/stat-card";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Section, SectionTitle } from "@/components/sections/Section";
import ScrollReveal from "@/components/animations/ScrollReveal";
import StatsVisualizer from "@/components/sections/StatsVisualizer";
import type { Player } from "@/types/football";

const squad: { n: number; name: string; pos: Player["position"]; age: number; nation: string }[] = [
  { n: 1, name: "Carlos Mendoza", pos: "GK", age: 28, nation: "ESP" },
  { n: 13, name: "Álvaro Ruiz", pos: "GK", age: 24, nation: "ESP" },
  { n: 2, name: "Javier Torres", pos: "RB", age: 26, nation: "ARG" },
  { n: 3, name: "Marcos López", pos: "CB", age: 30, nation: "ESP" },
  { n: 4, name: "Sergio Ramos Jr.", pos: "CB", age: 25, nation: "MEX" },
  { n: 5, name: "Diego Castillo", pos: "CB", age: 27, nation: "ESP" },
  { n: 6, name: "Pablo Herrera", pos: "CM", age: 29, nation: "ESP" },
  { n: 8, name: "Andrés Silva", pos: "CM", age: 23, nation: "URU" },
  { n: 10, name: "Lucas Fernández", pos: "CAM", age: 26, nation: "ARG" },
  { n: 14, name: "Miguel Ángel", pos: "CM", age: 22, nation: "ESP" },
  { n: 7, name: "Alejandro Vega", pos: "LW", age: 27, nation: "COL" },
  { n: 11, name: "Cristian Díaz", pos: "RW", age: 24, nation: "ESP" },
  { n: 9, name: "Raúl Jiménez", pos: "ST", age: 31, nation: "MEX" },
  { n: 17, name: "Daniel Ortiz", pos: "ST", age: 21, nation: "ESP" },
];

const players: Player[] = squad.map((p, i) => ({
  id: String(i + 1),
  name: p.name,
  position: p.pos,
  number: p.n,
  age: p.age,
  nationality: p.nation,
  photo: null,
  teamId: "",
  teamName: "Saint Ferdinand FC",
  seasonStats: null,
  matchStats: null,
}));

export default function Home() {
  const { data: event } = useEvent();
  const { data: saints } = useSaints();
  const { data: standings = [] } = useStandings();
  const { data: matches } = useSaintsMatches();
  const { data: scorersData } = useSaintsScorers();
  const { data: mediaData } = useMedia();

  const ss = saints?.season?.stats || null;
  const saintsMatches = matches || [];

  const nextMatch =
    saintsMatches
      .filter((m) => m.score?.home === null)
      .sort((a, b) => (a.dateTimestamp || 0) - (b.dateTimestamp || 0))[0] || null;

  const nextIsHome = nextMatch?.homeTeam.id === saints?.id;
  const nextOppName = nextMatch ? (nextIsHome ? nextMatch.awayTeam.name : nextMatch.homeTeam.name) : null;
  const nextOppPhoto = nextOppName
    ? standings.find((s) => s.name === nextOppName)?.photo || null
    : null;

  const topStandings = standings.slice(0, 8);
  const sffcStanding = standings.find((s) => s.name?.includes("SAINT"));
  if (sffcStanding && !topStandings.includes(sffcStanding)) topStandings.push(sffcStanding);

  const scorers = scorersData || [];
  const albums = (mediaData?.all || []).filter((m) => m.event === "5jvbh").slice(0, 10);

  const tiles: Tile[] = [
    {
      id: "record",
      colSpan: "2",
      children: (
        <div className="grid h-full grid-cols-2 gap-3 p-5">
          <StatCard label="Partidos" value={ss?.played ?? 0} />
          <StatCard label="Victorias" value={ss?.wins ?? 0} trend={ss?.wins && ss?.wins > (ss?.losses ?? 0) ? "up" : "down"} trendLabel={ss?.wins && ss?.wins > (ss?.losses ?? 0) ? "positivo" : "negativo"} />
          <StatCard label="Goles a favor" value={ss?.goalsFor ?? 0} />
          <StatCard label="Goles en contra" value={ss?.goalsAgainst ?? 0} />
        </div>
      ),
      className: "section-fade",
    },
    {
      id: "position",
      children: (
        <div className="section-fade flex h-full flex-col items-center justify-center p-5 text-center">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Posición</span>
          <span className="font-display text-8xl leading-none text-club-red">
            {saints?.season?.pos ?? "-"}
          </span>
          <span className="mt-1 text-xs text-muted-foreground">en {saints?.group || "grupo"}</span>
        </div>
      ),
    },
    {
      id: "points",
      children: (
        <div className="section-fade flex h-full flex-col items-center justify-center p-5 text-center">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Puntos</span>
          <span className="font-display text-7xl leading-none text-club-gold">
            {saints?.season?.pts ?? 0}
          </span>
          <span className="mt-1 text-xs text-muted-foreground">temporada</span>
        </div>
      ),
    },
    {
      id: "next-match",
      colSpan: "2",
      children: (
        <div className="section-fade p-5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Próximo partido
          </span>
          {nextMatch ? (
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full club-gradient text-xs font-bold text-white shadow-sm">
                VS
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{nextOppName || "vs"}</p>
                <p className="text-xs text-muted-foreground">
                  {nextMatch.date
                    ? new Date(nextMatch.dateTimestamp || 0).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "long",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Fecha por confirmar"}
                </p>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">Sin próximos partidos</p>
          )}
        </div>
      ),
    },
    {
      id: "squad-preview",
      colSpan: "3",
      children: (
        <div className="section-fade p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Jugadores destacados
            </span>
            <Badge variant="secondary">{players.length} jugadores</Badge>
          </div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {players.slice(0, 6).map((p) => (
              <PlayerCard key={p.id} player={p} variant="compact" />
            ))}
          </div>
        </div>
      ),
    },
  ];

  return (
    <>
      <HeroSection
        emblemUrl={saints?.photo}
        eventTitle={event?.title}
        groupLabel={saints?.group}
        playersCount={saints?.playersCount ?? undefined}
      />

      <Section theme="dark" id="stats">
        <SectionTitle label="Resumen" title="ESTADÍSTICAS" theme="dark" />
        <ScrollReveal>
          <MatchdayCard
            nextMatch={nextMatch as any}
            saintsId={saints?.id || null}
            saintsPhoto={saints?.photo || null}
            opponentName={nextOppName}
            opponentPhoto={nextOppPhoto}
          />
        </ScrollReveal>
        <ScrollReveal delay={0.15}>
          <div className="mt-10">
            <BentoGridHome tiles={tiles} />
          </div>
        </ScrollReveal>
      </Section>

      <Section theme="light" id="plantilla">
        <SectionTitle label="Equipo" title="PLANTILLA" theme="light" />
        <div className="mx-auto max-w-5xl">
          <ScrollReveal>
            <div className="section-fade mb-8 grid gap-4 md:grid-cols-2">
              {players.slice(0, 4).map((p) => (
                <PlayerCard key={p.id} player={p} variant="expanded" />
              ))}
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <div className="section-fade grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {players.slice(4).map((p) => (
                <PlayerCard key={p.id} player={p} variant="default" />
              ))}
            </div>
          </ScrollReveal>
        </div>
      </Section>

      <Section theme="dark" id="galeria">
        <SectionTitle label="Multimedia" title="GALERÍA" theme="dark" />
        <ScrollReveal>
          <div className="mt-10">
            <BentoGridHome tiles={tiles} />
          </div>
        </ScrollReveal>

        {ss && (
          <ScrollReveal delay={0.2}>
            <div className="mt-12 grid gap-6 md:grid-cols-2">
              <StatsVisualizer
                title="Rendimiento"
                stats={[
                  { label: "Partidos jugados", value: ss.played, max: ss.played > 10 ? ss.played : 14 },
                  { label: "Victorias", value: ss.wins, max: ss.played },
                  { label: "Efectividad", value: Math.round(((ss.wins * 3 + (ss.draws || 0)) / (ss.played * 3)) * 100), max: 100 },
                  { label: "Goles por partido", value: Math.round((ss.goalsFor / Math.max(ss.played, 1)) * 10) / 10, max: 5 },
                ]}
              />
              <StatsVisualizer
                title="Disciplina"
                stats={[
                  { label: "Goles a favor", value: Math.min(ss.goalsFor, 50), max: Math.max(ss.goalsFor, 50) },
                  { label: "Goles en contra", value: Math.min(ss.goalsAgainst, 50), max: Math.max(ss.goalsAgainst, 50) },
                  { label: "Diferencia de goles", value: ss.goalDiff > 0 ? Math.min(Math.abs(ss.goalDiff), 30) : 0, max: 30 },
                  { label: "Balance win/loss", value: Math.round((ss.wins / Math.max(ss.wins + (ss.losses || 0), 1)) * 100), max: 100 },
                ]}
              />
            </div>
          </ScrollReveal>
        )}
      </Section>

      <Section theme="alt" id="tabla">
        <SectionTitle label="Competición" title="CLASIFICACIÓN" theme="light" />
        <ScrollReveal>
          <div className="section-fade mx-auto max-w-5xl">
            <Card className="overflow-hidden border-0 shadow-lg">
              <CardHeader className="bg-club-black text-white">
                <CardTitle className="font-display text-2xl tracking-wide text-white">
                  {event?.title || "Liga"}
                </CardTitle>
                <CardDescription className="text-white/60">
                  Posiciones actuales
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <DataTable
                  columns={[
                    { key: "pos", header: "#", cell: (s: any) => <span className="font-bold">{s.pos}</span>, className: "w-12" },
                    { key: "name", header: "Equipo", cell: (s: any) => {
                      const isSffc = s.name?.includes("SAINT");
                      return <span className={`font-medium ${isSffc ? "text-club-red font-bold" : ""}`}>{s.name}</span>;
                    }},
                    { key: "pj", header: "PJ", cell: (s: any) => s.stats?.played ?? 0 },
                    { key: "v", header: "V", cell: (s: any) => s.stats?.wins ?? 0 },
                    { key: "e", header: "E", cell: (s: any) => s.stats?.draws ?? 0 },
                    { key: "d", header: "D", cell: (s: any) => s.stats?.losses ?? 0 },
                    { key: "gf", header: "GF", cell: (s: any) => s.stats?.goalsFor ?? 0 },
                    { key: "gc", header: "GC", cell: (s: any) => s.stats?.goalsAgainst ?? 0 },
                    { key: "dg", header: "DG", cell: (s: any) => {
                      const dg = (s.stats?.goalsFor ?? 0) - (s.stats?.goalsAgainst ?? 0);
                      return <span className={dg >= 0 ? "text-emerald-600" : "text-red-600"}>{dg > 0 ? "+" : ""}{dg}</span>;
                    }},
                    { key: "pts", header: "Pts", cell: (s: any) => <span className="font-bold text-club-red">{s.pts}</span>, className: "text-right" },
                  ]}
                  data={topStandings}
                  keyExtractor={(s: any) => s.id}
                />
              </CardContent>
            </Card>
          </div>
        </ScrollReveal>

        {scorers.length > 0 && (
          <ScrollReveal delay={0.1}>
            <div className="section-fade mx-auto mt-12 max-w-3xl">
              <h3 className="mb-6 text-center font-display text-3xl text-club-black">GOLEADORES</h3>
              <div className="space-y-2">
                {scorers.map((s, i) => (
                  <div
                    key={s.player + s.team}
                    className="flex items-center gap-4 rounded-lg border bg-white px-4 py-3 shadow-sm transition-colors hover:bg-club-red-light"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full club-gradient text-xs font-bold text-white">
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">{s.player}</p>
                      <p className="text-xs text-muted-foreground">{s.team}</p>
                    </div>
                    <span className="font-display text-2xl leading-none text-club-red">{s.goals}</span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        )}
      </Section>
    </>
  );
}
