import fs from "fs";

const raw = fs.readFileSync("data/captured-session.json", "utf8");
const data = JSON.parse(raw);

// Build player name map from all responses
// Player data comes through team data at path events/-5qp1c@5jvbh/teams
const playerNames = {};
const teamNames = {};

for (const resp of data.allResponses) {
  try {
    const parsed = JSON.parse(resp);
    const path = parsed?.d?.b?.p || "";
    const d = parsed?.d?.b?.d;
    if (!d || typeof d !== "object") continue;

    // Team data: events/-5qp1c@5jvbh/teams has team info with player names
    if (path.startsWith("events/-5qp1c@5jvbh/teams")) {
      // Check if it's the full teams object
      if (path === "events/-5qp1c@5jvbh/teams" && !d["-OqC_"]) {
        // Might be an update, not the full data
      }
      // The full teams data has team IDs as keys
      for (const [teamId, teamData] of Object.entries(d)) {
        if (teamData && typeof teamData === "object") {
          if (teamData.name) teamNames[teamId] = teamData.name;
          if (teamData.pl && typeof teamData.pl === "object") {
            // pl contains player data: { playerId: { name: "...", num: "..." } }
            for (const [plId, plData] of Object.entries(teamData.pl)) {
              if (plData && typeof plData === "object") {
                playerNames[plId] = plData.name || plData.nome || `Player ${plId.substring(0, 8)}`;
              }
            }
          }
        }
      }
    }
  } catch {}
}

console.log("Team names found:", Object.keys(teamNames).length);
console.log("Player names found:", Object.keys(playerNames).length);

// Extra data: look for player info from inf_up path
for (const resp of data.allResponses) {
  try {
    const parsed = JSON.parse(resp);
    const path = parsed?.d?.b?.p || "";
    const d = parsed?.d?.b?.d;
    if (!d || typeof d !== "object") continue;

    if (path.includes("inf_up") && d.at && typeof d.at === "object") {
      for (const [plId, plData] of Object.entries(d.at)) {
        if (plData && typeof plData === "object") {
          if (plData.nome && !playerNames[plId]) {
            playerNames[plId] = plData.nome;
          }
        }
      }
    }
  } catch {}
}

console.log("Player names after inf_up scan:", Object.keys(playerNames).length);

// Process details data
const matchEvents = {};
const actionTypes = {};

for (const r of (data.detailsResponses || [])) {
  const path = r.path;
  if (!path) continue;
  
  const parts = path.split("/");
  const matchId = parts[parts.length - 1];
  
  if (!r.data || typeof r.data !== "object") {
    console.log(`Match ${matchId}: No data`);
    continue;
  }
  
  const eventInfo = r.data.info || {};
  const eventList = r.data.list || {};
  const eventBest = r.data.best || {};
  
  const events = [];
  for (const [ts, ev] of Object.entries(eventList)) {
    if (typeof ev !== "object" || !ev.ac) continue;
    actionTypes[ev.ac] = (actionTypes[ev.ac] || 0) + 1;
    
    const playerName = playerNames[ev.pl_id1] || ev.pl_id1;
    const teamName = teamNames[ev.team1] || ev.team1;
    const teamShort = teamName.substring(0, 20);
    
    events.push({
      ts,
      ac: ev.ac,
      playerId: ev.pl_id1,
      playerName,
      teamId: ev.team1,
      teamName: teamShort,
      minute: ev.val1,
      val2: ev.val2,
      val3: ev.val3,
    });
  }
  
  // Sort by timestamp
  events.sort((a, b) => a.ts.localeCompare(b.ts));
  
  matchEvents[matchId] = {
    info: {
      as_blue: eventInfo.as_blue,
      as_red: eventInfo.as_red,
      as_total: eventInfo.as_total,
      as_yellow: eventInfo.as_yellow,
      start: eventInfo.start,
      venue: eventInfo.v,
    },
    best: eventBest,
    events,
  };
}

console.log("\n=== ACTION TYPES FOUND ===");
for (const [ac, count] of Object.entries(actionTypes).sort((a, b) => a[0] - b[0])) {
  console.log(`  ac ${ac}: ${count} occurrences`);
}

console.log("\n=== MATCH EVENTS ===");
for (const [matchId, me] of Object.entries(matchEvents)) {
  console.log(`\nMatch: ${matchId}`);
  console.log(`  Info: ${JSON.stringify(me.info)}`);
  console.log(`  Best: ${JSON.stringify(me.best)}`);
  console.log(`  Events (${me.events.length}):`);
  
  for (const ev of me.events) {
    const acLabel = ev.ac === 7 ? "⚽ GOAL" : ev.ac === 9 ? "🟨 CARD" : `ac=${ev.ac}`;
    console.log(`    ${acLabel} | ${ev.playerName} (${ev.teamName}) | min ${ev.minute} | val2=${ev.val2} val3=${ev.val3}`);
  }
}

// Now also try to find the 3 matches by their IDs in the allQueries
console.log("\n=== Looking for match data matchIds... ===");
// Check the match data in the queries
for (const q of data.allQueries) {
  // Look for queries about matchs that reference these detail IDs
  const m = q.match(/"p":"([^"]+)"/);
  if (m) {
    const qPath = m[1];
    if (qPath.includes("matchs")) {
      // Check what specific matchs paths were queried
    }
  }
}

// Let's also find the match date mapping from existing copa-data.json
const copaData = JSON.parse(fs.readFileSync("data/copa-data.json", "utf8"));
if (copaData.matchs) {
  console.log("\n=== Match ID mapping from copa-data.json ===");
  for (const [mid, mData] of Object.entries(copaData.matchs)) {
    if (matchEvents[mData.dt]) {
      const phase = mData.ph || "?";
      console.log(`  ${mid} (dt=${mData.dt}) -> details matchId = ${mData.dt}`);
      console.log(`    Teams: ${mData.t1?.n || "?"} vs ${mData.t2?.n || "?"}, Phase: ${phase}`);
    }
  }
}
