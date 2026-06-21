import { z } from "zod";

export const TeamStatsSchema = z.object({
  points: z.number(),
  played: z.number(),
  wins: z.number(),
  draws: z.number(),
  losses: z.number(),
  goalsFor: z.number(),
  goalsAgainst: z.number(),
  goalDiff: z.number(),
  yellowCards: z.number(),
  redCards: z.number(),
  efficiency: z.number(),
});

export const StandingDetailSchema = z.object({
  pos: z.number(),
  pts: z.number(),
  group: z.string().optional(),
  stats: TeamStatsSchema.nullable(),
});

export const SeasonSchema = StandingDetailSchema;

export const LatestSchema = z.object({
  pos: z.number(),
  pts: z.number(),
  stats: TeamStatsSchema.nullable(),
});

export const StandingEntrySchema = z.object({
  id: z.string(),
  name: z.string(),
  photo: z.string().nullable(),
  playersCount: z.number(),
  season: SeasonSchema.nullable(),
  latest: LatestSchema.nullable(),
  allEntries: z.array(z.any()).optional(),
});

export const StatHistoryEntrySchema = z.object({
  at: z.number(),
  date: z.string(),
  position: z.number().nullable(),
  points: z.number().nullable(),
  group: z.string().nullable(),
  suspended: z.boolean(),
  stats: TeamStatsSchema.nullable(),
});

export const SaintsSchema = z.object({
  id: z.string(),
  name: z.string(),
  photo: z.string().nullable(),
  playersCount: z.number(),
  group: z.string(),
  season: StandingDetailSchema.nullable(),
  latest: LatestSchema.nullable(),
  statsHistory: z.array(StatHistoryEntrySchema),
});

export const MatchItemSchema = z.object({
  id: z.string(),
  date: z.string().nullable(),
  dateTimestamp: z.number().nullable(),
  localHour: z.number().nullable(),
  turno: z.number().nullable(),
  round: z.string().nullable(),
  phase: z.string(),
  bracketFs: z.string().nullable(),
  venue: z.string().nullable(),
  team1: z.object({ id: z.string(), name: z.string() }),
  team2: z.object({ id: z.string(), name: z.string() }),
  score1: z.number().nullable(),
  score2: z.number().nullable(),
  penalties1: z.number().nullable(),
  penalties2: z.number().nullable(),
  title: z.string().nullable(),
  next1: z.string().nullable(),
  pos_eli: z.number().nullable(),
  name1: z.string().nullable(),
  name2: z.string().nullable(),
  finished: z.boolean(),
  status: z.number(),
  isPlayoff: z.boolean(),
  isSaints: z.boolean(),
});

export const TopScorerItemSchema = z.object({
  playerId: z.string(),
  playerName: z.string(),
  teamId: z.string(),
  teamName: z.string(),
  goals: z.number(),
  overallRank: z.number().optional(),
  ownGoals: z.number().optional(),
});

export const MediaItemSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string(),
  url: z.string(),
  urlDrive: z.string().nullable(),
  thumbnail: z.string().nullable(),
  evt: z.string(),
  timestamp: z.number().nullable(),
  date: z.string().nullable(),
  dateOnly: z.string().nullable(),
  matchDriveUrl: z.string().nullable(),
});

export const EventSchema = z.object({
  id: z.string(),
  group: z.string(),
  title: z.string(),
  sport: z.number(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  admin: z.string(),
  urlCover: z.string().nullable(),
});

export const DivisionSchema = z.object({
  id: z.string(),
  title: z.string(),
  teamsCount: z.number(),
});

export const PartnerSchema = z.object({
  id: z.string(),
  name: z.string(),
  phone: z.string(),
  url: z.string(),
});

export const AttachmentSchema = z.object({
  id: z.string(),
  title: z.string(),
  url: z.string(),
});

export const CopaDataSchema = z.object({
  fetchedAt: z.string(),
  event: EventSchema,
  divisions: z.array(DivisionSchema),
  saints: SaintsSchema.nullable(),
  standings: z.array(StandingEntrySchema),
  standingsByGroup: z.record(z.string(), z.array(StandingEntrySchema)),
  matches: z.object({
    total: z.number(),
    items: z.array(MatchItemSchema),
    saints: z.array(MatchItemSchema),
  }),
  topScorers: z.object({
    overall: z.array(TopScorerItemSchema),
    saints: z.array(TopScorerItemSchema),
    lastUpdated: z.string().nullable(),
  }),
  media: z.object({
    all: z.array(MediaItemSchema),
    saintsGroup: z.array(z.any()),
  }),
  partners: z.array(PartnerSchema),
  attachments: z.array(AttachmentSchema),
});
