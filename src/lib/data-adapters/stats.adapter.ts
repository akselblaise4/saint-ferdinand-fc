import { getCopaData } from "@/lib/loadData";

export interface StatsAdapter {
  totalGoals: number;
  totalMatches: number;
  averageGoals: number;
  homeWins: number;
  awayWins: number;
  draws: number;
  cleanSheets: number;
  topScorer: { name: string; goals: number } | null;
  topAssister: { name: string; assists: number } | null;
  totalYellowCards: number;
  totalRedCards: number;
  possessionAvg: number;
  passAccuracy: number;
}

export function getStats(): StatsAdapter {
  const raw = getCopaData();
  const s = (raw as any)?.stats || (raw as any)?.estadisticas || {};
  return {
    totalGoals: s.totalGoals ?? s.golesTotales ?? 0,
    totalMatches: s.totalMatches ?? s.partidosTotales ?? 0,
    averageGoals: s.averageGoals ?? s.promedioGoles ?? 0,
    homeWins: s.homeWins ?? s.victoriasLocal ?? 0,
    awayWins: s.awayWins ?? s.victoriasVisita ?? 0,
    draws: s.draws ?? s.empates ?? 0,
    cleanSheets: s.cleanSheets ?? s.vallaInvicta ?? 0,
    topScorer: s.topScorer || s.maximoGoleador || null,
    topAssister: s.topAssister || s.maximoAsistente || null,
    totalYellowCards: s.totalYellowCards ?? s.amarillasTotales ?? 0,
    totalRedCards: s.totalRedCards ?? s.rojasTotales ?? 0,
    possessionAvg: s.possessionAvg ?? s.promedioPosesion ?? 0,
    passAccuracy: s.passAccuracy ?? s.precisionPases ?? 0,
  };
}
