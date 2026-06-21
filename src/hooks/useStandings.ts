"use client";

import { useQuery } from "@tanstack/react-query";
import { getCopaData } from "@/lib/loadData";

interface StandingData {
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
  form?: string[];
  crest?: string;
  [key: string]: unknown;
}

export function useStandings() {
  return useQuery({
    queryKey: ["standings"],
    queryFn: async (): Promise<StandingData[]> => {
      const data = getCopaData();
      const raw = (data as any)?.standings || (data as any)?.clasificacion || [];
      return raw.map((s: any) => ({
        position: s.position || s.posicion,
        team: s.team || s.equipo,
        shortName: s.shortName || s.corto || (s.team || "").slice(0, 3).toUpperCase(),
        played: s.played ?? s.jugados ?? s.PJ,
        won: s.won ?? s.ganados ?? s.G,
        drawn: s.drawn ?? s.empatados ?? s.E,
        lost: s.lost ?? s.perdidos ?? s.P,
        goalsFor: s.goalsFor ?? s.golesFavor ?? s.GF,
        goalsAgainst: s.goalsAgainst ?? s.golesContra ?? s.GC,
        goalDifference: s.goalDifference ?? s.diferencia ?? s.DG,
        points: s.points ?? s.puntos ?? s.Pts,
        form: s.form || s.forma || undefined,
        crest: s.crest || s.escudo,
      }));
    },
    staleTime: 30000,
  });
}
