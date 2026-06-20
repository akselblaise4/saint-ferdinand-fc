import type { MatchEntry } from "./loadData";

export interface BracketMatch {
  id: string;
  round: number;
  team1: string; team2: string;
  team1Id: string; team2Id: string;
  score1: number | null; score2: number | null;
  penalties1: number | null; penalties2: number | null;
  title: string | null;
  pos_eli: number | null;
  next1: string | null;
  isSaints: boolean;
}

export interface BracketRound {
  name: string;
  matches: BracketMatch[];
}

export interface PlayoffBracketTree {
  rounds: BracketRound[];
  saintsTeamId: string | null;
}

export function buildBracket(matches: MatchEntry[], saintsId: string | null): PlayoffBracketTree[] {
  const playoffGroups = new Map<string, MatchEntry[]>();
  matches.forEach(m => {
    if (!m.isPlayoff || !m.bracketFs) return;
    const g = playoffGroups.get(m.bracketFs) || [];
    g.push(m);
    playoffGroups.set(m.bracketFs, g);
  });

  const result: PlayoffBracketTree[] = [];
  const phaseOrder = ["Cuartos de final", "Semifinal", "Final"];

  playoffGroups.forEach((ms, fs) => {
    const rounds: BracketRound[] = [];
    phaseOrder.forEach(phase => {
      const phaseMatches = ms.filter(m => m.phase === phase);
      if (phaseMatches.length === 0) return;
      // Sort by pos_eli for quarterfinals, or by title for later rounds
      phaseMatches.sort((a, b) => {
        const aPos = a.pos_eli ?? 99;
        const bPos = b.pos_eli ?? 99;
        return aPos - bPos;
      });
      rounds.push({
        name: phase,
        matches: phaseMatches.map(m => ({
          id: m.id,
          round: phaseOrder.indexOf(phase),
          team1: m.team1.name, team2: m.team2.name,
          team1Id: m.team1.id, team2Id: m.team2.id,
          score1: m.score1, score2: m.score2,
          penalties1: m.penalties1, penalties2: m.penalties2,
          title: m.title,
          pos_eli: m.pos_eli,
          next1: m.next1,
          isSaints: m.team1.id === saintsId || m.team2.id === saintsId,
        })),
      });
    });

    if (rounds.length > 0) {
      const hasSaints = rounds.some(r => r.matches.some(m => m.isSaints));
      if (hasSaints) {
        result.unshift({ rounds, saintsTeamId: saintsId });
      } else {
        result.push({ rounds, saintsTeamId: saintsId });
      }
    }
  });

  return result;
}
