import { chromium } from "playwright";
import fs from "fs";

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDbR0mRSSb554WadsJgfOivSXLET84IIR0",
  databaseURL: "https://copafacil-web.firebaseio.com",
};
const DATA_DIR = "data";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

await page.goto("https://copafacil.com/-5qp1c@5jvbh", { waitUntil: "domcontentloaded", timeout: 20000 });
await page.waitForTimeout(8000);
await page.goto("about:blank", { waitUntil: "domcontentloaded" });

const allData = await page.evaluate(async (config) => {
  const { initializeApp } = await import("https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js");
  const { getDatabase, ref, child, get } = await import("https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js");
  const app = initializeApp(config);
  const db = getDatabase(app);
  const rootRef = ref(db);

  async function read(p) {
    try { const s = await get(child(rootRef, p)); return s.exists() ? s.val() : null; }
    catch (e) { return { error: e.message }; }
  }

  // Get match data + all team stats + full team info
  return {
    matches: await read("events/-5qp1c/matchs"),
    teams: await read("events/-5qp1c@5jvbh/teams"),
    places: await read("events/-5qp1c/places"),
    m_set: await read("events/-5qp1c@5jvbh/m_set"),
    info: await read("events/-5qp1c@5jvbh/info"),
    inf_up: await read("events/-5qp1c@5jvbh/inf_up"),
  };
}, FIREBASE_CONFIG);

// Build team name map
const teamIds = new Map();
if (allData.teams) {
  Object.entries(allData.teams).forEach(([id, t]) => {
    teamIds.set(id, t.name || id.substring(0, 10));
  });
}

// Build place map
const places = new Map();
if (allData.places) {
  Object.entries(allData.places).forEach(([id, p]) => {
    places.set(id, p.title || `Cancha ${id}`);
  });
}

// Build round map
const rounds = new Map();
if (allData.m_set) {
  Object.entries(allData.m_set).forEach(([id, r]) => {
    rounds.set(id, r.title || `Fecha ${id}`);
  });
}

const saintsId = "-OqC_DyMZey8vTF5Shq5";
const saintsTeam = allData.teams?.[saintsId];

// ----- INSPECT: what fields exist in match data? -----
const sampleSaints = [];
if (allData.matches) {
  Object.entries(allData.matches).forEach(([id, m]) => {
    if (m.team1 === saintsId || m.team2 === saintsId) {
      sampleSaints.push({ id, ...m });
    }
  });
}

console.log("=== RAW SAINT FERDINAND MATCH KEYS ===");
sampleSaints.forEach(m => {
  const keys = Object.keys(m);
  console.log(`\nMatch ${m.id}: team1=${teamIds.get(m.team1) || m.team1} vs team2=${teamIds.get(m.team2) || m.team2}`);
  console.log(`  Keys: ${keys.join(", ")}`);
  console.log(`  dt keys: ${m.dt ? Object.keys(m.dt).join(", ") : "NONE"}`);
  console.log(`  Full dt: ${JSON.stringify(m.dt)}`);
  console.log(`  st=${m.st}, finished=${m.finished ? new Date(m.finished).toISOString() : "no"}`);
  if (m.l) console.log(`  l=${m.l} (place ref)`);
});

// ----- INSPECT: team inf_up (stats) -----
const saintsInfo = allData.info?.[saintsId];
const saintsInfUp = allData.inf_up?.[saintsId];

console.log("\n=== SAINT FERDINAND INFO ===");
console.log(JSON.stringify(saintsInfo, null, 2).substring(0, 500));

console.log("\n=== SAINT FERDINAND INF_UP ===");
console.log(JSON.stringify(saintsInfUp, null, 2).substring(0, 500));

// Check: what is the actual team stats string?
if (saintsInfo) {
  console.log("\n=== INFO KEY ANALYSIS ===");
  Object.entries(saintsInfo).forEach(([k, v]) => {
    console.log(`  ${k}: ${typeof v} = ${JSON.stringify(v).substring(0, 120)}`);
  });
}

if (saintsInfUp) {
  console.log("\n=== INF_UP KEY ANALYSIS ===");
  Object.entries(saintsInfUp).forEach(([k, v]) => {
    console.log(`  ${k}: ${typeof v} = ${JSON.stringify(v).substring(0, 120)}`);
  });
}

await browser.close();
