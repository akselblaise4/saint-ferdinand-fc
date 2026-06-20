import { chromium } from "playwright";
import fs from "fs";

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDbR0mRSSb554WadsJgfOivSXLET84IIR0",
  databaseURL: "https://copafacil-web.firebaseio.com",
};

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

// Intercept ALL WebSocket messages
const wsMessages = [];
page.on("websocket", ws => {
  const url = ws.url();
  ws.on("framesent", frame => {
    if (frame.payload?.includes('"a":"q"')) {
      try {
        const d = JSON.parse(frame.payload);
        const path = d?.d?.b?.p;
        if (path) wsMessages.push({ t: "sent", path, payload: frame.payload.substring(0, 150) });
      } catch {}
    }
  });
  ws.on("framereceived", frame => {
    if (frame.payload?.includes('"a":"d"')) { /* data responses */ }
  });
});

console.log("[1] Loading Copa Fácil...");
await page.goto("https://copafacil.com/-5qp1c@5jvbh", { waitUntil: "domcontentloaded", timeout: 20000 });
await page.waitForTimeout(5000);

// Clear initial queries
const initialQueries = [...wsMessages];
wsMessages.length = 0;

// Click on "Equipos" tab to see team list
console.log("[2] Clicking Equipos tab...");
const canvas = await page.$("flt-glass-pane canvas, canvas");
if (!canvas) { console.log("Canvas not found!"); process.exit(1); }
const box = await canvas.boundingBox();
console.log(`Canvas: ${JSON.stringify(box)}`);

// Click Equipos tab (y=100, x=215)
await page.mouse.click(box.x + 215, box.y + 100);
await page.waitForTimeout(3000);
console.log(`  New WS queries: ${wsMessages.length}`);

// Now try to find and click Saint Ferdinand in the team list
// The teams are likely listed in a vertical list
// Let me try clicking at various positions where team entries might be
// For a 1080p viewport, team rows might start around y=200-250
const saintsClicks = [];
for (let y = 200; y < 900; y += 60) {
  wsMessages.length = 0;
  await page.mouse.click(box.x + 300, box.y + y);
  await page.waitForTimeout(1500);
  if (wsMessages.length > 0) {
    saintsClicks.push({ y, queries: [...wsMessages] });
    console.log(`  Click at y=${y}: ${wsMessages.length} new queries`);
    wsMessages.forEach(m => console.log(`    ${m.path}`));
    break; // Found! Stop after first hit
  }
}

// After clicking, read the new data
if (saintsClicks.length > 0) {
  console.log("\n[3] Reading newly loaded data...");
  
  // Collect ALL unique paths queried
  const allPaths = new Set();
  saintsClicks.forEach(c => c.queries.forEach(q => allPaths.add(q.path)));
  wsMessages.forEach(m => allPaths.add(m.path));
  
  console.log(`\nUnique paths discovered:`);
  allPaths.forEach(p => console.log(`  ${p}`));

  // Now initialize Firebase and read them
  await page.goto("about:blank", { waitUntil: "domcontentloaded" });
  
  const data = await page.evaluate(async (config) => {
    const { initializeApp } = await import("https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js");
    const { getDatabase, ref, child, get } = await import("https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js");
    const app = initializeApp(config);
    const db = getDatabase(app);
    const rootRef = ref(db);
    const read = async p => { try { const s = await get(child(rootRef, p)); return s.exists() ? s.val() : null; } catch (e) { return null; } };
    
    // Read all the discovered paths
    const paths = [
      // Try path patterns based on what we know
      "events/-5qp1c@5jvbh/teams/-OqC_DyMZey8vTF5Shq5",
      "events/-5qp1c@5jvbh",
      "events/-5qp1c@5jvbh/info",
      // Event-level data
      "events/-5qp1c",
      "events/-5qp1c/tournament",
      "events/-5qp1c/standings",
      // Try with 'statistics' or 'classificacao'
      "events/-5qp1c@5jvbh/classificacao",
      "events/-5qp1c@5jvbh/leaderboard",
      "events/-5qp1c@5jvbh/players",
      // Try all sub-nodes of the event
    ];
    
    const result = {};
    for (const p of paths) result[p] = await read(p);
    return result;
  }, FIREBASE_CONFIG);
  
  Object.entries(data).forEach(([path, val]) => {
    if (val !== null) {
      const size = typeof val === "object" ? Object.keys(val).length : "scalar";
      console.log(`\n${path}: FOUND (${size})`);
      console.log(JSON.stringify(val).substring(0, 400));
    }
  });
}

// Also look at all media items for our group in detail
console.log("\n[4] Reading full media list for group...");

await page.goto("https://copafacil.com/-5qp1c@5jvbh", { waitUntil: "domcontentloaded", timeout: 20000 });
await page.waitForTimeout(5000);
await page.goto("about:blank", { waitUntil: "domcontentloaded" });

const mediaData = await page.evaluate(async (config) => {
  const { initializeApp } = await import("https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js");
  const { getDatabase, ref, child, get } = await import("https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js");
  const app = initializeApp(config);
  const db = getDatabase(app);
  const rootRef = ref(db);
  const read = async p => { try { const s = await get(child(rootRef, p)); return s.exists() ? s.val() : null; } catch (e) { return null; } };
  
  // Get ALL media items
  return {
    allMedia: await read("events/-5qp1c/midia"),
    // Also get match sets for the playoff phase we care about
    mset: await read("events/-5qp1c@5jvbh/m_set"),
  };
}, FIREBASE_CONFIG);

if (mediaData.allMedia) {
  const groupMedia = Object.entries(mediaData.allMedia).filter(([, m]) => m.evt === "5jvbh");
  console.log(`\nGroup media items (${groupMedia.length}):`);
  groupMedia.forEach(([id, m]) => {
    console.log(`\n  ${id}:`);
    console.log(`    legend: ${m.leg}`);
    console.log(`    evt: ${m.evt}`);
    console.log(`    url: ${m.i?.url?.substring(0, 100)}`);
    console.log(`    urlP (Drive): ${m.i?.urlP}`);
    console.log(`    timestamp: ${m.i?.m} = ${m.i?.m ? new Date(m.i.m).toISOString().substring(0, 10) : "?"}`);
    console.log(`    full: ${JSON.stringify(m)}`);
  });
}

if (mediaData.mset) {
  console.log("\n=== Match sets (m_set) ===");
  Object.entries(mediaData.mset).forEach(([id, m]) => {
    console.log(`  ${id}: ${m.title} (fs=${m.fs?.substring(0, 8) || "?"}, m=${m.m ? new Date(m.m).toISOString().substring(0, 10) : "?"})`);
  });
}

console.log(`\n\n=== Total WS messages captured: ${wsMessages.length} ===`);
allPaths = new Set();
[...initialQueries, ...wsMessages].forEach(m => {
  const p = typeof m === "string" ? m : m.path;
  if (p) allPaths.add(p);
});
console.log("All unique WS query paths:");
allPaths.forEach(p => console.log(`  ${p}`));

await browser.close();
