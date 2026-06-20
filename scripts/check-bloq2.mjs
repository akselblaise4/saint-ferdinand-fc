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

const data = await page.evaluate(async (config) => {
  const { initializeApp } = await import("https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js");
  const { getDatabase, ref, child, get } = await import("https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js");
  const app = initializeApp(config);
  const db = getDatabase(app);
  const rootRef = ref(db);
  const read = async p => { try { const s = await get(child(rootRef, p)); return s.exists() ? s.val() : null; } catch { return null; } };

  return {
    bloq2: await read("events/-5qp1c/bloq2"),
    bloq2_full: await read("events/-5qp1c"),
    // Check individual match fields that might have goals
    matchFields: await read("events/-5qp1c/matchs"),
    // Try embedded structures
    match_goals_sub: await read("events/-5qp1c/matchs/1776197236368"),
  };
}, FIREBASE_CONFIG);

if (data.bloq2 !== null) {
  console.log("=== BLOQ2 DATA ===");
  console.log(JSON.stringify(data.bloq2, null, 2).substring(0, 2000));
} else {
  console.log("bloq2 is null");
}

// Search ALL matches for any field beyond the known ones
if (data.matchFields) {
  const allKeys = new Set();
  const matchesWithExtra = [];
  
  Object.entries(data.matchFields).forEach(([id, m]) => {
    const keys = Object.keys(m);
    keys.forEach(k => allKeys.add(k));
    const extra = keys.filter(k => !["d_i","dt","evt","finished","fs","gmt","l","m_set","st","team1","team2","title","qc","qm","wo1","next1","pos_eli","next2","name1","name2"].includes(k));
    if (extra.length > 0) matchesWithExtra.push({ id, extra, full: m });
  });
  
  console.log("\n=== ALL MATCH FIELDS ===");
  console.log([...allKeys].join(", "));
  
  console.log(`\n=== MATCHES WITH EXTRA FIELDS (${matchesWithExtra.length}) ===`);
  matchesWithExtra.forEach(m => {
    console.log(`\n  ${m.id}: extra fields = ${m.extra.join(", ")}`);
    console.log(`    ${JSON.stringify(m.full).substring(0, 300)}`);
  });
}

// Check if matches might have goals sub-structures
// For each of our group's matches, read the dt sub-key
console.log("\n=== CHECK MATCH DT SUB-FIELDS ===");
// Also check across all divisions' matches for player fields
const allSaintsMatchIds = [
  "1776197236368", "1776197236371", "1776197236376",
  "1776197236381", "1776197236386", "1776197236390",
  "1776197236393", "1780501700822"
];
for (const mid of allSaintsMatchIds) {
  const key = `events/-5qp1c/matchs/${mid}`;
  if (data.matchFields?.[mid]) {
    const m = data.matchFields[mid];
    console.log(`Match ${mid}: dt keys = ${m.dt ? Object.keys(m.dt).join(", ") : "NONE"}, extra = ${Object.keys(m).filter(k => !["d_i","dt","evt","finished","fs","gmt","l","m_set","st","team1","team2","title"].includes(k)).join(", ") || "none"}`);
  }
}

await browser.close();
