"use client";

import { useQuery } from "@tanstack/react-query";
import { getCopaData } from "@/lib/loadData";

interface PlayerData {
  id?: string;
  name?: string;
  number?: number;
  position?: string;
  age?: number;
  nationality?: string;
  photo?: string;
  stats?: Record<string, number>;
  [key: string]: unknown;
}

export function usePlayers() {
  return useQuery({
    queryKey: ["players"],
    queryFn: async (): Promise<PlayerData[]> => {
      const data = getCopaData();
      const raw = (data as any)?.players || (data as any)?.jugadores || [];
      return raw.map((p: any) => ({
        id: p.id || p.playerId,
        name: p.name || p.nombre,
        number: p.number || p.dorsal || p.numero,
        position: p.position || p.posicion,
        age: p.age || p.edad,
        nationality: p.nationality || p.nacionalidad,
        photo: p.photo || p.foto,
        stats: p.stats || p.estadisticas || {},
      }));
    },
    staleTime: 30000,
  });
}
