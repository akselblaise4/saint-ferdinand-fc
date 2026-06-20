import { chromium } from "playwright";
import fs from "fs";

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDbR0mRSSb554WadsJgfOivSXLET84IIR0",
  databaseURL: "https://copafacil-web.firebaseio.com",
};
const SAINTS_ID = "-OqC_DyMZey8vTF5Shq5";
const EVENT_ID = "-5qp1c";
const GROUP = "5jvbh";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto("https://copafacil.com/-5qp1c@5jvbh", { waitUntil: "domcontentloaded", timeout: 20000 });
await page.waitForTimeout(10000);
await page.goto("about:blank", { waitUntil: "domcontentloaded" });

const data = await page.evaluate(async (opts) => {
  const { initializeApp } = await import("https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js");
  const { getDatabase, ref, child, get } = await import("https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js");
  const app = initializeApp(opts.config);
  const db = getDatabase(app);
  const rootRef = ref(db);
  const read = async p => { try { const s = await get(child(rootRef, p)); return s.exists() ? s.val() : null; } catch (e) { return { error: e.message }; } };

  // Explore ALL possible paths for player stats, goals, playoffs
  const paths = [
    // Player data per team
    `events/${opts.eid}@${opts.gid}/players`,
    `events/${opts.eid}@${opts.gid}/players/${opts.saints}`,
    // Goal scorers
    `events/${opts.eid}@${opts.gid}/goals`,
    `events/${opts.eid}@${opts.gid}/goalscorers`,
    `events/${opts.eid}/goals`,
    `events/${opts.eid}/goalscorers`,
    // Results (stadistics/leaderboards)
    `events/${opts.eid}@${opts.gid}/results`,
    `events/${opts.eid}@${opts.gid}/results/ASS`,
    `events/${opts.eid}@${opts.gid}/results/KEE`,
    `events/${opts.eid}@${opts.gid}/results/best`,
    // Stats
    `events/${opts.eid}@${opts.gid}/stats`,
    `events/${opts.eid}/stats`,
    // Events structure (for playoffs)
    `events/${opts.eid}@${opts.gid}/events`,
    // Match sets (playoffs structure)
    `events/${opts.eid}@${opts.gid}/m_set`,
    // Attach events detail
    `events/${opts.eid}/attachevents`,
    // Team plays classification (which cup/phase)
    `events/${opts.eid}@${opts.gid}/info`,
    `events/${opts.eid}@${opts.gid}/inf_up/${opts.saints}`,
    `events/${opts.eid}@${opts.gid}/inf_up`,
  ];

  const result = {};
  for (const p of paths) { result[p] = await read(p); }
  return result;
}, { config: FIREBASE_CONFIG, eid: EVENT_ID, gid: GROUP, saints: SAINTS_ID });

console.log("=== EXPLORATION RESULTS ===\n");
Object.entries(data).forEach(([path, value]) => {
  if (value === null) return;
  const size = typeof value === "object" ? Object.keys(value).length : "scalar";
  const sample = typeof value === "object" ? JSON.stringify(value).substring(0, 200) : String(value).substring(0, 200);
  console.log(`${path}`);
  console.log(`  TYPE: ${typeof value}, SIZE: ${size}`);
  console.log(`  DATA: ${sample}\n`);
});

// Deep dive into results/ASS, KEE, best
console.log("\n=== DEEP DIVE: RESULTS ===");
const results = data[`events/${EVENT_ID}@${GROUP}/results`];
if (results) {
  Object.entries(results).forEach(([k, v]) => {
    console.log(`\n${k}:`);
    console.log(JSON.stringify(v, null, 2).substring(0, 500));
  });
}

// Deep dive into matchs to find playoff-connected matches
console.log("\n=== DEEP DIVE: ATTACHEVENTS ===");
const att = data[`events/${EVENT_ID}/attachevents`];
if (att) {
  Object.entries(att).forEach(([k, v]) => {
    console.log(`\n${k}:`);
    console.log(JSON.stringify(v, null, 2).substring(0, 500));
  });
}

// Check all match sets for playoff phase titles
console.log("\n=== DEEP DIVE: M_SET (all phases) ===");
const mset = data[`events/${EVENT_ID}@${GROUP}/m_set`];
if (mset) {
  Object.entries(mset).forEach(([k, v]) => {
    console.log(`  ${k}: title="${v.title}", fs=${v.fs}, m=${v.m || "?"}`);
  });
}

await browser.close();
