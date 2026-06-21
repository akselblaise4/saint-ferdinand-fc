import { getCopaData } from "@/lib/loadData";

export interface MatchAdapter {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeShort: string;
  awayShort: string;
  homeScore: number;
  awayScore: number;
  date: string;
  venue: string;
  competition: string;
  stage: string;
  status: "scheduled" | "live" | "finished" | "postponed";
}

export function getMatches(): MatchAdapter[] {
  const raw = getCopaData();
  const matches = (raw as any)?.matches || (raw as any)?.partidos || [];
  return matches.map((m: any) => ({
    id: m.id || m.matchId || "",
    homeTeam: m.homeTeam || m.local || "",
    awayTeam: m.awayTeam || m.visitante || "",
    homeShort: m.homeShort || (m.homeTeam || m.local || "").slice(0, 3).toUpperCase(),
    awayShort: m.awayShort || (m.awayTeam || m.visitante || "").slice(0, 3).toUpperCase(),
    homeScore: m.homeScore ?? m.golesLocal ?? -1,
    awayScore: m.awayScore ?? m.golesVisita ?? -1,
    date: m.date || m.fecha || m.datetime || "",
    venue: m.venue || m.estadio || "",
    competition: m.competition || m.torneo || "",
    stage: m.stage || m.fase || "",
    status: m.status || m.estado || "scheduled",
  }));
}

export function getUpcomingMatches(matches: MatchAdapter[], limit = 5): MatchAdapter[] {
  return matches
    .filter((m) => m.status === "scheduled")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, limit);
}

export function getLastResults(matches: MatchAdapter[], limit = 5): MatchAdapter[] {
  return matches
    .filter((m) => m.status === "finished")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

export function getLiveMatches(matches: MatchAdapter[]): MatchAdapter[] {
  return matches.filter((m) => m.status === "live");
}
