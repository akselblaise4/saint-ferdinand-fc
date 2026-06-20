/**
 * Explore Firebase RTDB — find all possible paths for players, matches, etc.
 */
import { chromium } from "playwright";
import fs from "fs";

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDbR0mRSSb554WadsJgfOivSXLET84IIR0",
  authDomain: "copafacil-web.firebaseapp.com",
  databaseURL: "https://copafacil-web.firebaseio.com",
  projectId: "copafacil-web",
  storageBucket: "copafacil-web.appspot.com",
  messagingSenderId: "1084972798992",
  appId: "1:1084972798992:web:821f62c5b4373754c4e695",
};

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

// Seed
await page.goto("https://copafacil.com/-5qp1c@5jvbh", { waitUntil: "domcontentloaded", timeout: 20000 });
await page.waitForTimeout(8000);
await page.goto("about:blank", { waitUntil: "domcontentloaded" });

const results = await page.evaluate(async (config) => {
  const { initializeApp } = await import(
    "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js"
  );
  const { getDatabase, ref, child, get } = await import(
    "https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js"
  );
  const app = initializeApp(config);
  const db = getDatabase(app);
  const rootRef = ref(db);

  async function read(p) {
    try { const s = await get(child(rootRef, p)); return s.exists() ? s.val() : null; }
    catch (e) { return { error: e.message }; }
  }

  const paths = [
    // Possible player paths
    "events/-5qp1c@5jvbh/teams/-OqC_DyMZey8vTF5Shq5/players",
    "events/-5qp1c@5jvbh/players/-OqC_DyMZey8vTF5Shq5",
    "events/-5qp1c@5jvbh/players",
    "events/-5qp1c/players/-OqC_DyMZey8vTF5Shq5",
    "events/-5qp1c/players",
    // Match paths
    "events/-5qp1c@5jvbh/fixtures",
    "events/-5qp1c/fixtures",
    "events/-5qp1c@5jvbh/match",
    "events/-5qp1c@5jvbh/matches",
    "events/-5qp1c/matches",
    // Try evt IDs as paths
    "events/-5qp1c@kjk7t",
    "events/-5qp1c@kjk7t/info",
    "events/-5qp1c@sz2ln",
    "events/-5qp1c@66786",
    // Team as event
    "events/-OqC_DyMZey8vTF5Shq5",
    "events/-OqC_DyMZey8vTF5Shq5/info",
    // Generic queries
    "data",
    "events",
  ];

  const result = {};
  for (const p of paths) {
    result[p] = await read(p);
  }
  return result;
}, FIREBASE_CONFIG);

// Print summary
Object.entries(results).forEach(([k, v]) => {
  if (v === null) console.log(`  ${k} → null`);
  else if (v.error) console.log(`  ${k} → ${v.error}`);
  else if (typeof v === "object") {
    const keys = Object.keys(v);
    console.log(`  ${k} → ${keys.length} keys`);
    if (keys.length > 0 && keys.length <= 10) {
      if (typeof v[keys[0]] === "object" && v[keys[0]] !== null) {
        console.log(`    Sample: ${JSON.stringify(v[keys[0]]).substring(0, 150)}`);
      } else {
        console.log(`    First key: ${keys[0]} = ${JSON.stringify(v[keys[0]]).substring(0, 120)}`);
      }
    }
  } else {
    console.log(`  ${k} → ${typeof v}: ${JSON.stringify(v).substring(0, 80)}`);
  }
});

// Look deeper at one team for player data
console.log("\n--- Team details ---");
const teamDetail = await page.evaluate(async (config) => {
  const { initializeApp } = await import("https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js");
  const { getDatabase, ref, child, get } = await import("https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js");
  const app = initializeApp(config);
  const db = getDatabase(app);
  const rootRef = ref(db);

  // Try to read each team's full object
  const teams = [];
  for (const id of ["-OqC_DyMZey8vTF5Shq5"]) {
    const snap = await get(child(rootRef, `events/-5qp1c@5jvbh/teams/${id}`));
    if (snap.exists()) {
      teams.push({ id, ...snap.val() });
    }
  }
  return teams;
}, FIREBASE_CONFIG);

teamDetail.forEach(t => {
  console.log(`Team: ${t.name}`);
  console.log(`  Keys: ${Object.keys(t).filter(k => k !== 'id').join(', ')}`);
  // Check for nested objects
  Object.entries(t).forEach(([k, v]) => {
    if (typeof v === "object" && v !== null && !Array.isArray(v)) {
      console.log(`  ${k}: ${Object.keys(v).length} sub-keys`);
    }
  });
});

await browser.close();
