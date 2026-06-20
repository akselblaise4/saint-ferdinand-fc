import { chromium } from "playwright";
import fs from "fs";

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDbR0mRSSb554WadsJgfOivSXLET84IIR0",
  databaseURL: "https://copafacil-web.firebaseio.com",
};
const EVT = "-5qp1c";
const GRP = "5jvbh";
const SAINTS = "-OqC_DyMZey8vTF5Shq5";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto("https://copafacil.com/-5qp1c@5jvbh", { waitUntil: "domcontentloaded", timeout: 20000 });
await page.waitForTimeout(8000);
await page.goto("about:blank", { waitUntil: "domcontentloaded" });

const allData = await page.evaluate(async (opts) => {
  const { initializeApp } = await import("https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js");
  const { getDatabase, ref, child, get } = await import("https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js");
  const app = initializeApp(opts.config);
  const db = getDatabase(app);
  const rootRef = ref(db);
  const read = async p => { try { const s = await get(child(rootRef, p)); return s.exists() ? s.val() : null; } catch (e) { return null; } };

  // Check many paths for player/scorer data
  const paths = {
    // Player-related paths
    players_team: `events/${opts.evt}/players`,
    players_group: `events/${opts.evt}@${opts.grp}/players`,
    // Ranking/goalscorer paths
    ranking: `events/${opts.evt}@${opts.grp}/ranking`,
    artilheiros: `events/${opts.evt}@${opts.grp}/artilheiros`,
    top_scorers: `events/${opts.evt}@${opts.grp}/top_scorers`,
    statistics: `events/${opts.evt}@${opts.grp}/statistics`,
    // Team detail page data
    team_detail: `events/${opts.evt}@${opts.grp}/teams/${opts.saints}/detail`,
    team_players: `events/${opts.evt}@${opts.grp}/teams/${opts.saints}/players`,
    team_goals: `events/${opts.evt}@${opts.grp}/teams/${opts.saints}/goals`,
    // Match goal-scorers
    match_goals_1: `events/${opts.evt}/matchs/1776197236368/goals`,
    match_goals_2: `events/${opts.evt}/matchs/1776197236368/goalscorers`,
    match_goals_3: `events/${opts.evt}/matchs/1776197236368/dt/goals`,
    // Other attempts
    jogadores: `events/${opts.evt}@${opts.grp}/jogadores`,
    elenco: `events/${opts.evt}@${opts.grp}/elenco`,
    squad: `events/${opts.evt}@${opts.grp}/squad`,
    plantel: `events/${opts.evt}@${opts.grp}/plantel`,
    // Look for data at event level (no group)
    evt_players: `events/${opts.evt}/players`,
    evt_ranking: `events/${opts.evt}/ranking`,
    evt_artilheiros: `events/${opts.evt}/artilheiros`,
    evt_topscorers: `events/${opts.evt}/top_scorers`,
    evt_statistics: `events/${opts.evt}/statistics`,
  };

  const result = {};
  for (const [key, p] of Object.entries(paths)) {
    result[key] = await read(p);
  }
  return result;
}, { config: FIREBASE_CONFIG, evt: EVT, grp: GRP, saints: SAINTS });

console.log("=== EXHAUSTIVE PATH SEARCH ===\n");
let found = 0;
Object.entries(allData).forEach(([key, value]) => {
  if (value !== null) {
    found++;
    const size = typeof value === "object" ? Object.keys(value).length : "scalar";
    console.log(`${key}: FOUND (${size} items)`);
    console.log(`  ${JSON.stringify(value).substring(0, 250)}\n`);
  }
});
if (found === 0) console.log("No player data found at any path!\n");

// Also check: what are the other divisions' inf_up? (might reveal player data location)
console.log("=== CHECKING OTHER DIVISIONS ===");
const divisions = ["5jvbh", "kjk7t", "sz2ln", "66786", "mp7pq", "8ard", "6d06s"];
for (const div of divisions) {
  const key = `inf_up_${div}`;
  if (allData[key] !== undefined) continue;
  // Actually I didn't query these
}
// Quick check of what inf_up value means for each group:
console.log("inf_up for 5jvbh (our group) = 1776282155324");
console.log("This is likely a 'last updated' timestamp");

// Look at media items to understand how they connect to matches
console.log("\n=== MEDIA STRUCTURE ===");
const midiaRaw = JSON.parse(fs.readFileSync("data/rtdb-full.json", "utf-8"));
const midiaPath = Object.keys(midiaRaw).find(k => k.endsWith("/midia"));
if (midiaPath) {
  const midia = midiaRaw[midiaPath];
  if (midia) {
    const samples = Object.entries(midia).slice(0, 3);
    samples.forEach(([id, m]) => {
      console.log(`\nMedia ${id}:`);
      console.log(JSON.stringify(m, null, 2).substring(0, 500));
    });
  }
}

// Look at the raw team data for any player sub-entries
console.log("\n=== TEAM SFFC RAW (full keys check) ===");
const teamsPath = Object.keys(midiaRaw).find(k => k.endsWith(`@${GRP}/teams`));
if (teamsPath && midiaRaw[teamsPath]) {
  const sffc = midiaRaw[teamsPath][SAINTS];
  if (sffc) {
    console.log("All keys:", Object.keys(sffc));
    console.log("Has players sub-key:", sffc.players ? "YES" : "NO");
    console.log("Has jogadores sub-key:", sffc.jogadores ? "YES" : "NO");
    console.log("Has squad sub-key:", sffc.squad ? "YES" : "NO");
  }
}

await browser.close();
