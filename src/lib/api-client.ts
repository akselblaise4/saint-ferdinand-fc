import type {
  Standing,
  Match,
  TopScorer,
  SaintsInfo,
  MediaItem,
  EventInfo,
} from "@/types/football";

interface RawStats {
  points: number; played: number; wins: number; draws: number; losses: number;
  goalsFor: number; goalsAgainst: number; goalDiff: number;
  yellowCards: number; redCards: number; efficiency: number;
}

interface RawTeamEntry {
  id: string; name: string; photo: string | null; playersCount: number;
  season: { group: string; pos: number; pts: number; stats: RawStats | null } | null;
  latest: { pos: number; pts: number; stats: RawStats | null } | null;
}

interface RawMatch {
  id: string; date: string | null; dateTimestamp: number | null;
  localHour: number | null; round: string | null; phase: string;
  bracketFs: string | null; venue: string | null;
  team1: { id: string; name: string }; team2: { id: string; name: string };
  score1: number | null; score2: number | null;
  penalties1: number | null; penalties2: number | null;
  title: string | null; next1: string | null;
  finished: boolean; status: number; isPlayoff: boolean; isSaints: boolean;
  walkover?: boolean;
  details?: {
    list?: {
      id: string; matchId: string; ac?: number;
      pl_id1?: string; team1?: string;
      val1?: number; val2?: number; val3?: number;
      playerName?: string;
    }[];
    info?: Record<string, string | number>;
    best?: Record<string, { num_val?: number }>;
  };
}

interface RawMedia {
  id: string; type: string; title: string; url: string;
  urlDrive: string | null; thumbnail: string | null;
  evt: string; timestamp: number | null;
  date: string | null; dateOnly: string | null; matchDriveUrl: string | null;
}

interface RawData {
  fetchedAt: string;
  event: EventInfo;
  divisions: { id: string; title: string; teamsCount: number }[];
  saints: SaintsInfo | null;
  standings: RawTeamEntry[];
  standingsByGroup: Record<string, RawTeamEntry[]>;
  matches: { total: number; items: RawMatch[]; saints: RawMatch[] };
  topScorers: {
    overall: TopScorer[];
    saints: TopScorer[];
    lastUpdated: string | null;
  };
  media: { all: RawMedia[]; saintsGroup: any[] };
  partners: { id: string; name: string; phone: string; url: string }[];
  attachments: { id: string; title: string; url: string }[];
  players?: { id: string; name: string }[];
}

function mapStanding(s: RawTeamEntry): Standing {
  const latest = s.latest || s.season;
  return {
    id: s.id,
    name: s.name,
    photo: s.photo,
    playersCount: s.playersCount,
    group: s.season?.group ?? "",
    pos: latest?.pos ?? 0,
    pts: latest?.pts ?? 0,
    stats: latest?.stats ?? null,
  };
}

function mapMatch(m: RawMatch): Match {
  return {
    id: m.id,
    date: m.date,
    dateTimestamp: m.dateTimestamp,
    localHour: m.localHour,
    round: m.round,
    phase: m.phase,
    bracketFs: m.bracketFs,
    venue: m.venue,
    homeTeam: { id: m.team1.id, name: m.team1.name },
    awayTeam: { id: m.team2.id, name: m.team2.name },
    score: { home: m.score1, away: m.score2 },
    penalties: { home: m.penalties1, away: m.penalties2 },
    title: m.title,
    nextId: m.next1,
    finished: m.finished,
    status: m.status,
    isPlayoff: m.isPlayoff,
    isSaints: m.isSaints,
    walkover: m.walkover,
    details: m.details,
  };
}

function mapMedia(m: RawMedia): MediaItem {
  return {
    id: m.id,
    type: m.type,
    title: m.title,
    url: m.url,
    urlDrive: m.urlDrive,
    thumbnail: m.thumbnail,
    event: m.evt,
    timestamp: m.timestamp,
    date: m.date,
    dateOnly: m.dateOnly,
    matchDriveUrl: m.matchDriveUrl,
  };
}

class ApiClient {
  private cache: Record<string, any> = {};

  async fetchRaw(): Promise<RawData> {
    if (this.cache.raw) return this.cache.raw;
    const res = await fetch("/api/data");
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data: RawData = await res.json();
    this.cache.raw = data;
    return data;
  }

  invalidate() {
    this.cache = {};
  }

  async getEvent(): Promise<EventInfo> {
    const raw = await this.fetchRaw();
    return raw.event;
  }

  async getSaints(): Promise<SaintsInfo | null> {
    const raw = await this.fetchRaw();
    return raw.saints;
  }

  async getStandings(): Promise<Standing[]> {
    const raw = await this.fetchRaw();
    return raw.standings.map(mapStanding);
  }

  async getStandingsByGroup(): Promise<Record<string, Standing[]>> {
    const raw = await this.fetchRaw();
    return Object.fromEntries(
      Object.entries(raw.standingsByGroup).map(([g, teams]) => [g, teams.map(mapStanding)])
    );
  }

  async getSaintsMatches(): Promise<Match[]> {
    const raw = await this.fetchRaw();
    return raw.matches.saints.map(mapMatch);
  }

  async getTopScorers() {
    const raw = await this.fetchRaw();
    return raw.topScorers;
  }

  async getSaintsScorers(): Promise<TopScorer[]> {
    const raw = await this.fetchRaw();
    return raw.topScorers.saints;
  }

  async getMedia() {
    const raw = await this.fetchRaw();
    return {
      all: raw.media.all.map(mapMedia),
      saintsGroup: raw.media.saintsGroup,
    };
  }

  async getNextMatch(): Promise<Match | null> {
    const saints = await this.getSaints();
    if (!saints) return null;
    const matches = await this.getSaintsMatches();
    return (
      matches
        .filter((m) => m.score?.home === null)
        .sort((a, b) => (a.dateTimestamp || 0) - (b.dateTimestamp || 0))[0] ?? null
    );
  }

  async getStandingForSaints(): Promise<Standing | null> {
    const standings = await this.getStandings();
    return standings.find((s) => s.name?.includes("SAINT")) ?? null;
  }

  async getPhotoForTeam(name: string): Promise<string | null> {
    const standings = await this.getStandings();
    return standings.find((s) => s.name === name)?.photo ?? null;
  }

  async getSquad(): Promise<{ id: string; name: string }[]> {
    const raw = await this.fetchRaw();
    return raw.players || [];
  }
}

export const apiClient = new ApiClient();
