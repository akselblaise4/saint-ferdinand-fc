export {
  getPlayers,
  getPlayerByNumber,
  getPlayersByPosition,
  groupPlayersByPosition,
} from "./players.adapter";
export type { PlayerAdapter } from "./players.adapter";

export {
  getMatches,
  getUpcomingMatches,
  getLastResults,
  getLiveMatches,
} from "./matches.adapter";
export type { MatchAdapter } from "./matches.adapter";

export {
  getStandings,
  getTopFour,
  getTeamPosition,
} from "./standings.adapter";
export type { StandingAdapter } from "./standings.adapter";

export { getStats } from "./stats.adapter";
export type { StatsAdapter } from "./stats.adapter";
