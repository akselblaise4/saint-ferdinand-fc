import { getCopaData } from "@/lib/loadData";

export interface StandingAdapter {
  position: number;
  team: string;
  shortName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: string[];
  crest: string;
}

export function getStandings(): StandingAdapter[] {
  const raw = getCopaData();
  const standings = (raw as any)?.standings || (raw as any)?.clasificacion || [];
  return standings.map((s: any) => ({
    position: s.position || s.posicion || 0,
    team: s.team || s.equipo || "",
    shortName: s.shortName || s.corto || (s.team || "").slice(0, 3).toUpperCase(),
    played: s.played ?? s.jugados ?? s.PJ ?? 0,
    won: s.won ?? s.ganados ?? s.G ?? 0,
    drawn: s.drawn ?? s.empatados ?? s.E ?? 0,
    lost: s.lost ?? s.perdidos ?? s.P ?? 0,
    goalsFor: s.goalsFor ?? s.golesFavor ?? s.GF ?? 0,
    goalsAgainst: s.goalsAgainst ?? s.golesContra ?? s.GC ?? 0,
    goalDifference: s.goalDifference ?? s.diferencia ?? s.DG ?? 0,
    points: s.points ?? s.puntos ?? s.Pts ?? 0,
    form: s.form || s.forma || [],
    crest: s.crest || s.escudo || "",
  }));
}

export function getTopFour(standings: StandingAdapter[]): StandingAdapter[] {
  return [...standings].sort((a, b) => a.position - b.position).slice(0, 4);
}

export function getTeamPosition(standings: StandingAdapter[], teamName: string): StandingAdapter | undefined {
  return standings.find((s) => s.team.toLowerCase() === teamName.toLowerCase());
}
