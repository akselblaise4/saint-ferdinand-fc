import { getCopaData } from "@/lib/loadData";

export interface PlayerAdapter {
  id: string;
  name: string;
  number: number;
  position: string;
  age: number;
  nationality: string;
  photo: string;
  height: string;
  weight: string;
  foot: string;
  goals: number;
  assists: number;
  appearances: number;
  minutesPlayed: number;
  yellowCards: number;
  redCards: number;
  rating: number;
}

export function getPlayers(): PlayerAdapter[] {
  const raw = getCopaData();
  const players = (raw as any)?.players || (raw as any)?.jugadores || [];
  return players.map((p: any) => ({
    id: p.id || p.playerId || "",
    name: p.name || p.nombre || "",
    number: p.number || p.dorsal || p.numero || 0,
    position: p.position || p.posicion || "",
    age: p.age || p.edad || 0,
    nationality: p.nationality || p.nacionalidad || "",
    photo: p.photo || p.foto || "",
    height: p.height || p.altura || "",
    weight: p.weight || p.peso || "",
    foot: p.foot || p.pierna || "",
    goals: p.goals ?? p.goles ?? p.stats?.goals ?? 0,
    assists: p.assists ?? p.asistencias ?? p.stats?.assists ?? 0,
    appearances: p.appearances ?? p.partidos ?? p.stats?.appearances ?? 0,
    minutesPlayed: p.minutesPlayed ?? p.minutos ?? p.stats?.minutes ?? 0,
    yellowCards: p.yellowCards ?? p.amarillas ?? p.stats?.yellowCards ?? 0,
    redCards: p.redCards ?? p.rojas ?? p.stats?.redCards ?? 0,
    rating: p.rating ?? p.valoracion ?? p.stats?.rating ?? 0,
  }));
}

export function getPlayerByNumber(players: PlayerAdapter[], number: number): PlayerAdapter | undefined {
  return players.find((p) => p.number === number);
}

export function getPlayersByPosition(players: PlayerAdapter[], position: string): PlayerAdapter[] {
  return players.filter((p) => p.position.toLowerCase() === position.toLowerCase());
}

export function groupPlayersByPosition(players: PlayerAdapter[]): Record<string, PlayerAdapter[]> {
  const groups: Record<string, PlayerAdapter[]> = {};
  for (const p of players) {
    const key = p.position || "Sin posición";
    if (!groups[key]) groups[key] = [];
    groups[key].push(p);
  }
  return groups;
}
