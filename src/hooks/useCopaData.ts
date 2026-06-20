import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

const QUERY_KEYS = {
  event: ["copa", "event"] as const,
  saints: ["copa", "saints"] as const,
  standings: ["copa", "standings"] as const,
  standingsByGroup: ["copa", "standingsByGroup"] as const,
  saintsMatches: ["copa", "matches", "saints"] as const,
  topScorers: ["copa", "topScorers"] as const,
  saintsScorers: ["copa", "topScorers", "saints"] as const,
  nextMatch: ["copa", "matches", "next"] as const,
  media: ["copa", "media"] as const,
};

export function useEvent() {
  return useQuery({
    queryKey: QUERY_KEYS.event,
    queryFn: () => apiClient.getEvent(),
  });
}

export function useSaints() {
  return useQuery({
    queryKey: QUERY_KEYS.saints,
    queryFn: () => apiClient.getSaints(),
  });
}

export function useStandings() {
  return useQuery({
    queryKey: QUERY_KEYS.standings,
    queryFn: () => apiClient.getStandings(),
  });
}

export function useStandingsByGroup() {
  return useQuery({
    queryKey: QUERY_KEYS.standingsByGroup,
    queryFn: () => apiClient.getStandingsByGroup(),
  });
}

export function useSaintsMatches() {
  return useQuery({
    queryKey: QUERY_KEYS.saintsMatches,
    queryFn: () => apiClient.getSaintsMatches(),
  });
}

export function useTopScorers() {
  return useQuery({
    queryKey: QUERY_KEYS.topScorers,
    queryFn: () => apiClient.getTopScorers(),
  });
}

export function useSaintsScorers() {
  return useQuery({
    queryKey: QUERY_KEYS.saintsScorers,
    queryFn: () => apiClient.getSaintsScorers(),
  });
}

export function useNextMatch() {
  return useQuery({
    queryKey: QUERY_KEYS.nextMatch,
    queryFn: () => apiClient.getNextMatch(),
  });
}

export function useMedia() {
  return useQuery({
    queryKey: QUERY_KEYS.media,
    queryFn: () => apiClient.getMedia(),
  });
}
