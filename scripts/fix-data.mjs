import fs from "fs";

// Load data
const copa = JSON.parse(fs.readFileSync("data/copa-data.json", "utf8"));
const allData = JSON.parse(fs.readFileSync("data/copa-all-data.json", "utf8"));

const details = allData.details || {};
const playerNames = allData.players || {};

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

const saintsId = copa.saints?.id;

// Count goals per player
const goalCounts = {}; // playerId -> { goals, teamId }
const saintsGoalCounts = {}; // playerId -> { goals, overallRank }

for (const [matchId, detail] of Object.entries(details)) {
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

// Also fix first saints match score2 if possible (it's missing from source)
// The raw Firebase data doesn't have qt_g2 for match 1776197236368
// So we leave it as null

fs.writeFileSync("data/copa-data.json", JSON.stringify(copa, null, 2));
fs.writeFileSync("data/copa-data-ultimate.json", JSON.stringify(copa, null, 2));

console.log("\n=== SUMMARY ===");
console.log(`Saints: ${copa.saints?.name || "N/A"}`);
console.log(`Standings: ${copa.standings.length} teams`);
console.log(`Matches: ${copa.matches.total} total, ${copa.matches.saints.length} saints`);
console.log(`Top scorers: ${overall.length} players tracked`);
console.log(`  Top 3 overall:`);
overall.slice(0, 3).forEach(p => console.log(`    ${p.position}. ${p.player} (${p.team}) - ${p.goals} goles`));
console.log(`  Saints scorers: ${saints.length}`);
saints.forEach(p => console.log(`    ${p.player} - ${p.goals} goles (rank #${p.overallRank})`));
console.log(`Media: ${copa.media.all.length} items (${fixedMediaCount} titles fixed)`);
console.log(`Partners: ${copa.partners.length}`);
console.log("\n✅ copa-data.json actualizado");
