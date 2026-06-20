import { chromium } from "playwright";
import fs from "fs";

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDbR0mRSSb554WadsJgfOivSXLET84IIR0",
  databaseURL: "https://copafacil-web.firebaseio.com",
};

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

await page.goto("https://copafacil.com/-5qp1c@5jvbh", { waitUntil: "domcontentloaded", timeout: 20000 });
await page.waitForTimeout(8000);
await page.goto("about:blank", { waitUntil: "domcontentloaded" });

const result = await page.evaluate(async (config) => {
  const { initializeApp } = await import("https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js");
  const { getDatabase, ref, child, get } = await import("https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js");
  const app = initializeApp(config);
  const db = getDatabase(app);
  const rootRef = ref(db);

  async function read(p) {
    try { const s = await get(child(rootRef, p)); return s.exists() ? s.val() : null; }
    catch (e) { return { error: e.message }; }
  }

  const saintsId = "-OqC_DyMZey8vTF5Shq5";
  const allMatches = await read("events/-5qp1c/matchs");

  // Find matches with extra fields (qc, qm, wo1, name1, name2)
  const matchesWithNames = {};
  const matchesWithQc = {};
  if (allMatches) {
    Object.entries(allMatches).forEach(([id, m]) => {
      if (m.name1) matchesWithNames[id] = m;
      if (m.qc) matchesWithQc[id] = m;
    });
  }

  return {
    // RESULTS at group level
    results: await read("events/-5qp1c@5jvbh/results"),
    // Results at event level
    resultsEvent: await read("events/-5qp1c/results"),
    // Sample matches with name fields
    namedMatches: matchesWithNames,
    qcMatches: matchesWithQc,
    // Also check raw match with all fields for saints
    saintsMatches: Object.entries(allMatches || {})
      .filter(([,m]) => m.team1 === saintsId || m.team2 === saintsId)
      .reduce((acc, [id, m]) => ({ ...acc, [id]: m }), {}),
    // All Saints matches including all deep fields
    totalSaints: Object.keys(allMatches || {})
      .filter(id => {
        const m = allMatches[id];
        return m.team1 === saintsId || m.team2 === saintsId;
      }).length,
  };
}, FIREBASE_CONFIG);

console.log("=== RESULTS (group level) ===");
console.log(JSON.stringify(result.results, null, 2).substring(0, 1000));

console.log("\n=== RESULTS (event level) ===");
console.log(JSON.stringify(result.resultsEvent, null, 2).substring(0, 300));

console.log(`\n=== Total Saints matches found: ${result.totalSaints} ===`);

console.log("\n=== Matches with name1/name2 fields:");
console.log(JSON.stringify(result.namedMatches, null, 2).substring(0, 800));

console.log("\n=== Matches with qc/qm fields:");
console.log(JSON.stringify(result.qcMatches, null, 2).substring(0, 800));

console.log("\n=== SAINTS MATCHES (all fields) ===");
Object.entries(result.saintsMatches).forEach(([id, m]) => {
  console.log(`\n  ${id}:`);
  console.log(`    ${JSON.stringify(m).substring(0, 600)}`);
});

await browser.close();
