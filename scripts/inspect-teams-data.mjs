import fs from "fs";

const raw = fs.readFileSync("data/captured-session.json", "utf8");
const data = JSON.parse(raw);

// Find the teams data response
let teamsResponse = null;
for (const resp of data.allResponses) {
  if (resp.includes('"p":"events/-5qp1c@5jvbh/teams"')) {
    teamsResponse = resp;
    break;
  }
}

if (teamsResponse) {
  console.log("=== TEAMS DATA ===");
  const parsed = JSON.parse(teamsResponse);
  const path = parsed?.d?.b?.p || "";
  const d = parsed?.d?.b?.d || {};
  console.log("Path:", path);
  console.log("Top level keys:", Object.keys(d));
  
  // Check each team
  for (const [teamId, teamData] of Object.entries(d)) {
    if (typeof teamData !== "object") continue;
    console.log(`\nTeam: ${teamId}`);
    console.log("  Name:", teamData.name || "(no name)");
    console.log("  Keys:", Object.keys(teamData));
    
    // Check nested players
    if (teamData.pl && typeof teamData.pl === "object") {
      const plKeys = Object.keys(teamData.pl);
      console.log(`  Players (${plKeys.length}):`);
      for (const plId of plKeys.slice(0, 5)) {
        const pl = teamData.pl[plId];
        if (typeof pl === "object") {
          console.log(`    ${plId}: ${JSON.stringify(pl)}`);
        } else {
          console.log(`    ${plId}: ${pl}`);
        }
      }
      if (plKeys.length > 5) console.log(`    ... and ${plKeys.length - 5} more`);
    }
    
    if (teamData.dt && typeof teamData.dt === "object") {
      const dtKeys = Object.keys(teamData.dt);
      console.log(`  dt entries: ${dtKeys.length}`);
      // Show first dt entry structure
      const sampleDt = teamData.dt[dtKeys[0]];
      if (typeof sampleDt === "object") {
        console.log(`  Sample dt: ${JSON.stringify(sampleDt).substring(0, 300)}`);
      }
    }
  }
}

// Find the inf_up data
console.log("\n=== INF_UP DATA ===");
for (const resp of data.allResponses) {
  if (resp.includes('"p":"events/-5qp1c@5jvbh/inf_up"')) {
    const parsed = JSON.parse(resp);
    const d = parsed?.d?.b?.d || {};
    console.log("Top keys:", Object.keys(d));
    if (d.at && typeof d.at === "object") {
      const atKeys = Object.keys(d.at);
      console.log(`Players in 'at' (${atKeys.length}):`);
      for (const plId of atKeys.slice(0, 3)) {
        console.log(`  ${plId}: ${JSON.stringify(d.at[plId]).substring(0, 300)}`);
      }
    }
    break;
  }
}

// Also look for player info in other responses
console.log("\n=== Searching for player names in all data ===");
for (const resp of data.allResponses) {
  if (resp.includes('"nome"') || resp.includes('"name"')) {
    try {
      const parsed = JSON.parse(resp);
      const d = parsed?.d?.b?.d;
      if (d && typeof d === "object") {
        // Look for nome/name at any nesting level
        const found = [];
        function search(obj, depth = 0) {
          if (depth > 5 || !obj || typeof obj !== "object") return;
          for (const [k, v] of Object.entries(obj)) {
            if ((k === "nome" || k === "name") && typeof v === "string") {
              found.push(v);
            }
            if (typeof v === "object") search(v, depth + 1);
          }
        }
        search(d);
        if (found.length > 0) {
          console.log("Found names:", found.slice(0, 5));
          const p = parsed?.d?.b?.p || "?";
          console.log("Path:", p);
          break;
        }
      }
    } catch {}
  }
}
