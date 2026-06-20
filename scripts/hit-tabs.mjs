import { chromium } from "playwright";
import fs from "fs";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 430, height: 932 } });

const queries = [];
page.on("websocket", ws => {
  if (!ws.url().includes("firebaseio.com")) return;
  ws.on("framesent", frame => {
    try {
      const msg = JSON.parse(frame.payload);
      if (msg.t === "d" && (msg.d.a === "q" || msg.d.a === "n")) {
        queries.push({ time: Date.now(), path: msg.d.b?.p || msg.d.b?.c?.[0], action: msg.d.a });
      }
    } catch (e) {}
  });
});

console.log("Loading...");
await page.goto("https://copafacil.com/-5qp1c@5jvbh", { waitUntil: "domcontentloaded", timeout: 20000 });
await page.waitForTimeout(15000);

console.log("Initial queries:", queries.length);
const initial = queries.length;

// The tabs are at the top. On 430px wide, with header at y~0-100:
// Tab bar y position ~ 110-150 (below header)
// 5 tabs: Info | Partidos | Equipos | Fotos | Sponsors
// Each tab ≈ 86px wide
const tabWidth = 430 / 5;
const tabY = 130; // middle of tab bar

const tabNames = ["Info", "Partidos", "Equipos", "Fotos", "Sponsors"];

for (let i = 0; i < tabNames.length; i++) {
  const x = Math.round(tabWidth * i + tabWidth / 2);
  const y = tabY;
  const before = queries.length;
  
  console.log(`\nClicking "${tabNames[i]}" at (${x}, ${y})...`);
  await page.mouse.click(x, y);
  await page.waitForTimeout(8000); // plenty of time for Flutter to load data
  
  const newQ = queries.slice(before);
  if (newQ.length > 0) {
    console.log(`  => ${newQ.length} new queries:`);
    newQ.forEach(q => console.log(`     [${q.action}] ${q.path}`));
  } else {
    console.log(`  => no new queries`);
  }
}

// Try y offsets for the tab bar (maybe tabs are slightly different position)
if (queries.length <= initial) {
  console.log("\n\n=== Trying alternative Y positions ===");
  for (let yTry = 100; yTry <= 180; yTry += 10) {
    const before = queries.length;
    await page.mouse.click(129, yTry); // Partidos tab approximate x
    await page.waitForTimeout(5000);
    if (queries.length > before) {
      console.log(`  HIT at y=${yTry}! New queries:`);
      queries.slice(before).forEach(q => console.log(`     [${q.action}] ${q.path}`));
      break;
    }
  }
}

console.log("\n=== TOTAL QUERIES ===");
queries.forEach(q => console.log("  [" + q.action + "] " + q.path));

// Try to read the new data that may have loaded
console.log("\n=== Reading all data after navigation ===");
await page.goto("about:blank", { waitUntil: "domcontentloaded" });
const rtdbPaths = [...new Set(queries.map(q => q.path))];
const interestingPaths = rtdbPaths.filter(p => !p.includes("/data") && !p.includes("acess_count"));

const data = await page.evaluate(async (paths) => {
  const { initializeApp } = await import("https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js");
  const { getDatabase, ref, child, get } = await import("https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js");
  const app = initializeApp({
    apiKey: "AIzaSyDbR0mRSSb554WadsJgfOivSXLET84IIR0",
    databaseURL: "https://copafacil-web.firebaseio.com",
  });
  const db = getDatabase(app);
  const rootRef = ref(db);
  const result = {};
  for (const p of paths) {
    try {
      const snap = await get(child(rootRef, p));
      result[p] = snap.exists() ? "EXISTS (" + Object.keys(snap.val()).length + " children)" : "null";
    } catch (e) {
      result[p] = "ERR: " + e.message.substring(0, 40);
    }
  }
  return result;
}, interestingPaths);

Object.entries(data).forEach(([k, v]) => console.log("  " + k + " => " + v));

fs.writeFileSync("data/queries-log.json", JSON.stringify(queries, null, 2));
await browser.close();
