import fs from "fs";

// Load data
const copa = JSON.parse(fs.readFileSync("data/copa-data.json", "utf8"));
const allData = JSON.parse(fs.readFileSync("data/copa-all-data.json", "utf8"));

const rawDetails = allData.details || {};
const rawPlayers = allData.players || {};
const rawPlayerNames = allData.playerNames || {};

// Build player name lookup
const playerNames = { ...rawPlayerNames, ...rawPlayers };

// ── 0. MERGE MATCH EVENTS INTO COPA-DATA ──
const saintsId = copa.saints?.id;
const sfcPlayerSet = new Set();
let mergedCount = 0;
let totalEvents = 0;

for (const match of copa.matches.items) {
  const detail = rawDetails[match.id];
  if (!detail) continue;

  const events = detail.list;
  if (events) {
    const eventList = [];
    for (const [evId, ev] of Object.entries(events)) {
      const pid = ev.pl_id1 || "";
      const name = playerNames[pid] || pid;
      // Track SFC players
      if (ev.team1 === saintsId && pid) {
        sfcPlayerSet.add(JSON.stringify({ id: pid, name: name.replace(/\t/g, " ").trim() }));
      }
      const event = { id: evId, matchId: match.id };
      event.ac = ev.ac;
      if (ev.pl_id1) event.pl_id1 = ev.pl_id1;
      if (ev.team1) event.team1 = ev.team1;
      if (ev.val1 != null) event.val1 = ev.val1;
      if (ev.val2 != null) event.val2 = ev.val2;
      if (ev.val3 != null) event.val3 = ev.val3;
      if (name) event.playerName = name.replace(/\t/g, " ").trim();
      eventList.push(event);
      totalEvents++;
    }
    match.details = { list: eventList };
  }
  if (detail.info) match.details = { ...match.details, info: detail.info };
  if (detail.best) match.details = { ...match.details, best: detail.best };
  mergedCount++;
}

// Build SFC player roster
const sfcPlayers = Array.from(sfcPlayerSet).map(s => JSON.parse(s));
// Deduplicate by ID
const sfcPlayersDedup = [];
const seen = new Set();
for (const p of sfcPlayers) {
  if (!seen.has(p.id)) {
    seen.add(p.id);
    sfcPlayersDedup.push(p);
  }
}

console.log(`Merged details into ${mergedCount} matches (${totalEvents} events)`);
console.log(`SFC player roster: ${sfcPlayersDedup.length} players`);

// ── 1. COMPUTE TOP SCORERS ──
// Match ID -> teams mapping from copa-data matches
const matchTeamMap = {};
for (const m of copa.matches.items) {
  matchTeamMap[m.id] = { team1: m.team1?.id, team2: m.team2?.id };
}

// Also from allData matchs if available
const allMatchs = allData.matchs || allData.matches || {};
for (const [id, m] of Object.entries(allMatchs)) {
  if (!matchTeamMap[id]) {
    matchTeamMap[id] = { team1: m.team1, team2: m.team2 };
  }
}

// Team name lookup
const teamNames = {};
for (const s of copa.standings) {
  teamNames[s.id] = s.name;
}
// Also from saints
if (copa.saints) teamNames[copa.saints.id] = copa.saints.name;

// Count goals per player
const goalCounts = {}; // playerId -> { goals, teamId }
const saintsGoalCounts = {}; // playerId -> { goals, overallRank }

for (const [matchId, detail] of Object.entries(rawDetails)) {
  const list = detail.list;
  if (!list) continue;
  const teams = matchTeamMap[matchId];
  
  for (const [evId, ev] of Object.entries(list)) {
    if (ev.ac === 7 && ev.pl_id1) {
      // Goal event
      const pid = ev.pl_id1;
      const teamId = ev.team1;
      
      if (!goalCounts[pid]) {
        goalCounts[pid] = { goals: 0, teamId };
      }
      goalCounts[pid].goals++;
    }
  }
}

// Convert to arrays
const overall = Object.entries(goalCounts)
  .map(([pid, data]) => ({
    player: (playerNames[pid] || pid).trim().replace(/\t/g, " "),
    team: teamNames[data.teamId] || data.teamId,
    goals: data.goals,
    position: 0, // will calculate
  }))
  .sort((a, b) => b.goals - a.goals);

// Assign positions
overall.forEach((p, i) => { p.position = i + 1; });

// Saints scorers
const saints = overall
  .filter(p => p.team === "SAINT FERDINAND" || p.team === copa.saints?.name)
  .map(p => ({
    player: p.player,
    team: p.team,
    goals: p.goals,
    overallRank: p.position,
  }));

console.log(`Top scorers computed: ${overall.length} overall, ${saints.length} saints`);

// ── 2. FIX MEDIA TITLES ──
let fixedMediaCount = 0;
for (const item of copa.media.all) {
  if (item.title && /[^\x20-\x7E\u00C0-\u024F\u0400-\u04FF]/.test(item.title)) {
    const cleaned = item.title
      .replace(/[^\x20-\x7E\u00C0-\u024F\u0400-\u04FF\s]/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (cleaned && cleaned !== item.title) {
      item.title = cleaned;
      fixedMediaCount++;
    }
  }
}
console.log(`Fixed media titles: ${fixedMediaCount}`);

// ── 3. UPDATE copa-data.json ──
copa.topScorers = {
  overall,
  saints,
  lastUpdated: new Date().toISOString(),
};

// Add SFC player roster
copa.players = sfcPlayersDedup;

// Re-derive saints matches (events may have been added)
const saintsMatches = copa.matches.items.filter(m => {
  if (m.team1?.id === saintsId || m.team2?.id === saintsId) return true;
  return copa.matches.saints.some(sm => sm.id === m.id);
});
copa.matches.saints = saintsMatches;

console.log(`Saints matches count: ${copa.matches.saints.length}`);

fs.writeFileSync("data/copa-data.json", JSON.stringify(copa, null, 2));
fs.writeFileSync("data/copa-data-ultimate.json", JSON.stringify(copa, null, 2));

console.log("\n=== SUMMARY ===");
console.log(`Saints: ${copa.saints?.name || "N/A"}`);
console.log(`Standings: ${copa.standings.length} teams`);
console.log(`Matches: ${copa.matches.total} total, ${copa.matches.saints.length} saints`);
console.log(`Events: ${totalEvents} merged into ${mergedCount} matches`);
console.log(`SFC Roster: ${sfcPlayersDedup.length} players`);
console.log(`Top scorers: ${overall.length} players tracked`);
console.log(`  Top 3 overall:`);
overall.slice(0, 3).forEach(p => console.log(`    ${p.position}. ${p.player} (${p.team}) - ${p.goals} goles`));
console.log(`  Saints scorers: ${saints.length}`);
saints.forEach(p => console.log(`    ${p.player} - ${p.goals} goles (rank #${p.overallRank})`));
console.log(`Media: ${copa.media.all.length} items (${fixedMediaCount} titles fixed)`);
console.log(`Partners: ${copa.partners.length}`);
console.log("\n✅ copa-data.json actualizado");
