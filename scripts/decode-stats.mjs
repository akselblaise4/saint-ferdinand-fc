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
    catch (e) { return null; }
  }

  const saintsId = "-OqC_DyMZey8vTF5Shq5";
  return {
    teamInfo: await read(`events/-5qp1c@5jvbh/info/${saintsId}`),
    teamInfUp: await read(`events/-5qp1c@5jvbh/inf_up/${saintsId}`),
    teamData: await read(`events/-5qp1c@5jvbh/teams/${saintsId}`),
    // Get stats for ALL teams in group C
    groupInfo: await read("events/-5qp1c@5jvbh/info"),
    players: await read(`events/-5qp1c@5jvbh/players/${saintsId}`),
  };
}, FIREBASE_CONFIG);

console.log("=== TEAM DATA ===");
console.log(JSON.stringify(allData.teamData, null, 2).substring(0, 800));

console.log("\n=== TEAM INFO ===");
console.log(JSON.stringify(allData.teamInfo, null, 2).substring(0, 800));

console.log("\n=== TEAM INF_UP ===");
if (allData.teamInfUp) {
  console.log(JSON.stringify(allData.teamInfUp, null, 2).substring(0, 800));
} else {
  console.log("null");
}

console.log("\n=== GROUP INFO (stats for all teams) ===");
if (allData.groupInfo) {
  // Show all keys/entries
  Object.entries(allData.groupInfo).forEach(([teamId, info]) => {
    console.log(`\n  Team ${teamId.substring(0, 12)}...:`);
    Object.entries(info).forEach(([k, v]) => {
      console.log(`    ${k}: ${typeof v} = ${JSON.stringify(v).substring(0, 150)}`);
    });
  });
} else {
  console.log("null");
}

console.log("\n=== PLAYERS ===");
if (allData.players) {
  Object.entries(allData.players).slice(0, 3).forEach(([id, p]) => {
    console.log(`\n  Player ${id.substring(0, 12)}...:`);
    Object.entries(p).forEach(([k, v]) => {
      console.log(`    ${k}: ${JSON.stringify(v).substring(0, 100)}`);
    });
  });
  console.log(`\nTotal players: ${Object.keys(allData.players).length}`);
} else {
  console.log("null");
}

await browser.close();
