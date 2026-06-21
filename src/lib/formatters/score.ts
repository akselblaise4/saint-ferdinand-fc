export function formatScore(goalsFor: number, goalsAgainst: number): string {
  return `${goalsFor} - ${goalsAgainst}`;
}

export function formatGoalDifference(gd: number): string {
  if (gd > 0) return `+${gd}`;
  return `${gd}`;
}

export function formatResult(homeScore: number, awayScore: number): "W" | "D" | "L" {
  if (homeScore > awayScore) return "W";
  if (homeScore < awayScore) return "L";
  return "D";
}

export function getResultEmoji(result: "W" | "D" | "L"): string {
  const map = { W: "🟢", D: "🟡", L: "🔴" };
  return map[result];
}
