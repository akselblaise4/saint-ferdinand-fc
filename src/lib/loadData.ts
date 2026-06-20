import fs from "fs";
import path from "path";

interface Stats {
  played: number; wins: number; draws: number; losses: number;
  goalsFor: number; goalsAgainst: number; goalDiff: number;
  yellowCards: number; redCards: number; efficiency: number; points: number;
}

interface TeamEntry {
  id: string;
  name: string;
  photo: string | null;
  playersCount: number;
  season: { group: string; pos: number; pts: number; stats: Stats | null } | null;
  latest: { pos: number; pts: number; stats: Stats | null } | null;
}

export interface MatchEntry {
  id: string;
  date: string | null;
  dateTimestamp: number | null;
  localHour: number | null;
  turno: number | null;
  round: string | null;
  phase: string;
  bracketFs: string | null;
  venue: string | null;
  team1: { id: string; name: string };
  team2: { id: string; name: string };
  score1: number | null;
  score2: number | null;
  penalties1: number | null;
  penalties2: number | null;
  title: string | null;
  next1: string | null;
  pos_eli: number | null;
  name1: string | null;
  name2: string | null;
  finished: boolean;
  status: number;
  isPlayoff: boolean;
  isSaints: boolean;
}

interface StatHistoryEntry {
  at: number; date: string; position: number | null; points: number | null;
  group: string | null; suspended: boolean; stats: Stats | null;
}

export interface CopaData {
  fetchedAt: string;
  event: {
    id: string; group: string; title: string; sport: number;
    startDate: string | null; endDate: string | null; admin: string; urlCover: string | null;
  };
  divisions: { id: string; title: string; teamsCount: number }[];
  saints: {
    id: string; name: string; photo: string | null; playersCount: number; group: string;
    season: { pos: number; pts: number; stats: Stats | null } | null;
    latest: { pos: number; pts: number; stats: Stats | null } | null;
    statsHistory: StatHistoryEntry[];
  } | null;
  standings: TeamEntry[];
  standingsByGroup: Record<string, TeamEntry[]>;
  teams: TeamEntry[];
  matches: {
    total: number;
    items: MatchEntry[];
    saints: MatchEntry[];
  };
  topScorers: {
    overall: { player: string; team: string; goals: number; position: number }[];
    saints: { player: string; team: string; goals: number; overallRank: number }[];
    lastUpdated: string | null;
  };
  media: { all: { id: string; type: string; title: string; url: string; urlDrive: string | null; thumbnail: string | null; evt: string; timestamp: number | null; date: string | null; dateOnly: string | null; matchDriveUrl: string | null }[]; saintsGroup: any[] };
  partners: { id: string; name: string; phone: string; url: string }[];
  attachments: { id: string; title: string; url: string }[];
}

let cached: CopaData | null = null;

export function getCopaData(): CopaData {
  if (cached) return cached;
  const filePath = path.join(process.cwd(), "data", "copa-data.json");
  if (!fs.existsSync(filePath)) {
    cached = {
      fetchedAt: new Date().toISOString(),
      event: { id: "", group: "", title: "USS Liga Premier", sport: 11, startDate: null, endDate: null, admin: "", urlCover: null },
      divisions: [],
      saints: null,
      standings: [],
      standingsByGroup: {},
      teams: [],
      matches: { total: 0, items: [], saints: [] },
      topScorers: { overall: [], saints: [], lastUpdated: null },
      media: { all: [], saintsGroup: [] },
      partners: [],
      attachments: [],
    };
    return cached;
  }
  const raw = fs.readFileSync(filePath, "utf-8");
  cached = JSON.parse(raw) as CopaData;
  return cached!;
}
