export const LEAGUE_NAME = "USS Liga Premier";
export const LEAGUE_SHORT = "USS LP";
export const CLUB_NAME = "Saint Ferdinand FC";
export const CLUB_SHORT = "SFC";
export const CLUB_COLOR = "#D42030";
export const CLUB_GOLD = "#CEAB5D";
export const CLUB_NAVY = "#0E1B36";

export const POSITION_MAP: Record<string, string> = {
  GK: "Portero",
  DEF: "Defensa",
  MID: "Centrocampista",
  FW: "Delantero",
  LB: "Lateral Izquierdo",
  RB: "Lateral Derecho",
  CB: "Central",
  CDM: "Mediocentro Defensivo",
  CM: "Centrocampista",
  CAM: "Mediapunta",
  LW: "Extremo Izquierdo",
  RW: "Extremo Derecho",
  ST: "Delantero Centro",
};

export const POSITION_ORDER: Record<string, number> = {
  GK: 0,
  DEF: 1,
  MID: 2,
  FW: 3,
};

export const MATCH_STATUS_MAP: Record<string, string> = {
  scheduled: "Programado",
  live: "En Vivo",
  finished: "Finalizado",
  postponed: "Aplazado",
  cancelled: "Cancelado",
};

export const STALE_TIMES = {
  players: 30000,
  matches: 15000,
  standings: 30000,
  stats: 60000,
} as const;

export const QUERY_KEYS = {
  players: ["players"],
  matches: ["matches"],
  standings: ["standings"],
  stats: ["stats"],
} as const;

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  xxl: 1536,
} as const;
