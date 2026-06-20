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

await page.goto("https://copafacil.com/-5qp1c@5jvbh", { waitUntil: "domcontentloaded", timeout: 20000 });
await page.waitForTimeout(8000);
await page.goto("about:blank", { waitUntil: "domcontentloaded" });

const allSubs = await page.evaluate(async (config) => {
  const { initializeApp } = await import("https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js");
  const { getDatabase, ref, child, get } = await import("https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js");
  const app = initializeApp(config);
  const db = getDatabase(app);
  const rootRef = ref(db);

  async function read(p) {
    try { const s = await get(child(rootRef, p)); return s.exists() ? s.val() : null; }
    catch (e) { return { error: e.message }; }
  }

  // Check all media evt IDs as sub-events
  const evtIds = ["kjk7t", "sz2ln", "66786", "mp7pq", "5jvbh", "8ard", "6d06s"];
  const result = {};
  for (const eid of evtIds) {
    // Try as group under -5qp1c
    result[eid] = {};
    result[eid].info = await read(`events/-5qp1c@${eid}/info`);
    result[eid].teams = await read(`events/-5qp1c@${eid}/teams`);
    result[eid].matches = await read(`events/-5qp1c@${eid}/matches`);
    result[eid].players = await read(`events/-5qp1c@${eid}/players`);
  }
  return result;
}, FIREBASE_CONFIG);

// Analyze results
for (const [eid, data] of Object.entries(allSubs)) {
  console.log(`\n--- evt=${eid} ---`);
  console.log(`  info: ${data.info === null ? 'null' : data.info.error || Object.keys(data.info).length + ' keys'}`);
  console.log(`  teams: ${data.teams === null ? 'null' : data.teams.error || Object.keys(data.teams).length + ' teams'}`);
  console.log(`  matches: ${data.matches === null ? 'null' : data.matches.error || Object.keys(data.matches).length + ' matches'}`);
  console.log(`  players: ${data.players === null ? 'null' : data.players.error || Object.keys(data.players).length + ' players'}`);

  // Show first team name if exists
  if (data.teams && !data.teams.error && typeof data.teams === "object") {
    const teams = Object.entries(data.teams);
    console.log(`  Sample team: ${JSON.stringify(teams[0]?.[1]?.name || teams[0]?.[1]).substring(0, 100)}`);
  }
  // Show info key names
  if (data.info && !data.info.error && typeof data.info === "object") {
    console.log(`  info keys: ${Object.keys(data.info).join(', ')}`);
    console.log(`  sub_title: ${data.info.info?.sub_title || data.info.sub_title || 'N/A'}`);
  }
}

await browser.close();
