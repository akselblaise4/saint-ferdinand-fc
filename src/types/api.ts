import type { PlayerAdapter } from "@/lib/data-adapters";
import type { MatchAdapter } from "@/lib/data-adapters";
import type { StandingAdapter } from "@/lib/data-adapters";
import type { StatsAdapter } from "@/lib/data-adapters";

export interface ApiResponse<T> {
  data: T;
  timestamp: number;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface DashboardData {
  players: PlayerAdapter[];
  matches: MatchAdapter[];
  standings: StandingAdapter[];
  stats: StatsAdapter;
}

export interface FetchState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}
