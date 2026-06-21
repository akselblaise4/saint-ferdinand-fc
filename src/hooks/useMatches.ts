"use client";

import { useQuery } from "@tanstack/react-query";
import { getCopaData } from "@/lib/loadData";

interface MatchData {
  id?: string;
  homeTeam?: string;
  awayTeam?: string;
  homeScore?: number;
  awayScore?: number;
  date?: string;
  time?: string;
  venue?: string;
  competition?: string;
  status?: string;
  [key: string]: unknown;
}

export function useMatches() {
  return useQuery({
    queryKey: ["matches"],
    queryFn: async (): Promise<MatchData[]> => {
      const data = getCopaData();
      const raw = (data as any)?.matches || (data as any)?.partidos || [];
      return raw.map((m: any) => ({
        id: m.id || m.matchId,
        homeTeam: m.homeTeam || m.local,
        awayTeam: m.awayTeam || m.visitante,
        homeScore: m.homeScore ?? m.golesLocal,
        awayScore: m.awayScore ?? m.golesVisita,
        date: m.date || m.fecha,
        time: m.time || m.hora,
        venue: m.venue || m.estadio,
        competition: m.competition || m.torneo,
        status: m.status || m.estado,
      }));
    },
    staleTime: 30000,
  });
}
