import fs from "fs";

const copa = JSON.parse(fs.readFileSync("data/copa-data.json", "utf8"));
const events = JSON.parse(fs.readFileSync("data/copa-all-data.json", "utf8"));

// copa-data.json structure
console.log("=== copa-data.json ===");
console.log("Top keys:", Object.keys(copa));
console.log("matches type:", typeof copa.matches, Array.isArray(copa.matches));
if (copa.matches && typeof copa.matches === "object") {
  const mk = Object.keys(copa.matches);
  console.log("matches keys count:", mk.length);
  if (mk.length > 0) {
    const sample = copa.matches[mk[0]];
    console.log("Sample match:", JSON.stringify(sample).substring(0, 300));
  }
}

// events data structure
console.log("\n=== events data ===");
const ek = Object.keys(events.details);
console.log("details keys:", ek.length);
console.log("First key:", ek[0]);

// Player name sample
const pEntries = Object.entries(events.players);
console.log("Players:", pEntries.length);
console.log("Sample:", pEntries.slice(0, 3));

// Find matches that have detail data
// The detail keys are like 1776197236309 (timestamps)
// The copa match keys should match
if (copa.matches) {
  console.log("\n=== Matching details to copa matches ===");
  let matched = 0;
  for (const [mk, match] of Object.entries(copa.matches)) {
    if (match && typeof match === "object" && events.details[mk]) {
      matched++;
      if (matched <= 3) {
        console.log(`  ${mk}: ${match.t1?.n || "?"} vs ${match.t2?.n || "?"} - ${Object.keys(events.details[mk].list).length} events`);
      }
    }
  }
  console.log(`Matched: ${matched}/${Object.keys(copa.matches).length}`);
  
  // If no matches, check if match keys are different
  if (matched === 0) {
    console.log("\nNo direct match. Checking alternate IDs...");
    // Maybe the match has a dt field that matches
    for (const [mk, match] of Object.entries(copa.matches)) {
      const m = match;
      if (m) {
        const altIds = [m.dt, m.id, m._id, m.key, m.matchId].filter(Boolean);
        console.log(`Match ${mk} alt IDs:`, altIds);
        for (const aid of altIds) {
          if (events.details[aid]) {
            console.log(`  FOUND via ${aid}!`);
            matched++;
          }
        }
        break; // just check first match
      }
    }
  }
}
