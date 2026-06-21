export interface TeamStats {
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  yellowCards: number;
  redCards: number;
  efficiency: number;
  points: number;
}

export interface Club {
  id: string;
  name: string;
  shortName?: string;
  photo: string | null;
  playersCount: number;
  group?: string;
  season: StandingDetail | null;
  latest: StandingDetail | null;
}

export interface StandingDetail {
  pos: number;
  pts: number;
  stats: TeamStats | null;
}

export interface StatHistoryEntry {
  at: number;
  date: string;
  position: number | null;
  points: number | null;
  group: string | null;
  suspended: boolean;
  stats: TeamStats | null;
}

export interface Standing {
  id: string;
  name: string;
  photo: string | null;
  playersCount: number;
  group: string;
  pos: number;
  pts: number;
  stats: TeamStats | null;
  form?: string[];
  trend?: "up" | "down" | "same";
}

export interface GroupStandings {
  group: string;
  teams: Standing[];
}

export interface Match {
  id: string;
  date: string | null;
  dateTimestamp: number | null;
  localHour: number | null;
  round: string | null;
  phase: string;
  bracketFs: string | null;
  venue: string | null;
  homeTeam: TeamRef;
  awayTeam: TeamRef;
  score: Score | null;
  penalties: Score | null;
  title: string | null;
  nextId: string | null;
  finished: boolean;
  status: number;
  isPlayoff: boolean;
  isSaints: boolean;
  walkover?: boolean;
  details?: {
    list?: MatchEvent[];
    info?: Record<string, string | number>;
    best?: Record<string, { num_val?: number }>;
  };
}

export interface TeamRef {
  id: string;
  name: string;
}

export interface Score {
  home: number | null;
  away: number | null;
}

export interface Player {
  id: string;
  name: string;
  position: PlayerPosition;
  number: number;
  age: number;
  nationality: string;
  photo: string | null;
  teamId: string;
  teamName: string;
  seasonStats: PlayerSeasonStats | null;
  matchStats: PlayerMatchStats | null;
  height?: number;
  weight?: number;
  preferredFoot?: "left" | "right" | "both";
}

export type PlayerPosition =
  | "GK"
  | "RB" | "CB" | "LB" | "RWB" | "LWB"
  | "CDM" | "CM" | "CAM"
  | "RM" | "LM" | "RW" | "LW"
  | "ST" | "CF";

export interface PlayerSeasonStats {
  appearances: number;
  starts: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  minutesPlayed: number;
  cleanSheets?: number;
  goalsConceded?: number;
  saves?: number;
  passAccuracy?: number;
  tackles?: number;
  interceptions?: number;
  dribblesCompleted?: number;
}

export interface PlayerMatchStats {
  rating?: number;
  goals?: number;
  assists?: number;
  shots?: number;
  shotsOnTarget?: number;
  passes?: number;
  passAccuracy?: number;
  tackles?: number;
  interceptions?: number;
  fouls?: number;
  yellowCard?: boolean;
  redCard?: boolean;
  minutesPlayed?: number;
  offside?: number;
}

export interface MatchEvent {
  id: string;
  matchId: string;
  type: "goal" | "card" | "substitution" | "penalty" | "own_goal";
  minute: number;
  stoppageTime?: number;
  playerId: string;
  playerName: string;
  teamId: string;
  assistPlayerId?: string;
  assistPlayerName?: string;
  cardColor?: "yellow" | "red" | "second_yellow";
  substitutionOff?: string;
  substitutionOn?: string;
  ac?: number;
  val2?: number;
  val3?: number;
}

export interface TopScorer {
  player: string;
  team: string;
  goals: number;
  position?: number;
  overallRank?: number;
}

export interface MediaItem {
  id: string;
  type: string;
  title: string;
  url: string;
  urlDrive: string | null;
  thumbnail: string | null;
  event: string;
  timestamp: number | null;
  date: string | null;
  dateOnly: string | null;
  matchDriveUrl: string | null;
}

export interface Partner {
  id: string;
  name: string;
  phone: string;
  url: string;
}

export interface EventInfo {
  id: string;
  group: string;
  title: string;
  sport: number;
  startDate: string | null;
  endDate: string | null;
  admin: string;
  urlCover: string | null;
}

export interface Division {
  id: string;
  title: string;
  teamsCount: number;
}

export interface SaintsInfo {
  id: string;
  name: string;
  photo: string | null;
  playersCount: number;
  group: string;
  season: StandingDetail | null;
  latest: StandingDetail | null;
  statsHistory: StatHistoryEntry[];
}

export interface PaginatedResponse<T> {
  total: number;
  items: T[];
}

export interface CopaDataSet {
  fetchedAt: string;
  event: EventInfo;
  divisions: Division[];
  saints: SaintsInfo | null;
  standings: Standing[];
  standingsByGroup: Record<string, Standing[]>;
  clubs: Club[];
  matches: PaginatedResponse<Match> & { saints: Match[] };
  topScorers: {
    overall: TopScorer[];
    saints: TopScorer[];
    lastUpdated: string | null;
  };
  media: { all: MediaItem[]; saintsGroup: MediaItem[] };
  partners: Partner[];
  attachments: { id: string; title: string; url: string }[];
}
