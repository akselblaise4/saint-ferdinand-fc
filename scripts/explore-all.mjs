/**
 * Copa Fácil Intelligent Navigator — crawls the Flutter Web app
 * to discover navigation paths, matches, and player data.
 *
 * Strategy:
 * 1. Try URL-based navigation (hash routes, path segments)
 * 2. Systematically click canvas grid zones
 * 3. Track which Firebase paths appear after each action
 */

import { chromium } from "playwright";
import fs from "fs";

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDbR0mRSSb554WadsJgfOivSXLET84IIR0",
  databaseURL: "https://copafacil-web.firebaseio.com",
};

// -- Helpers --

async function readPaths(page, paths) {
  return await page.evaluate(async (opts) => {
    const { initializeApp } = await import(opts.appJs);
    const { getDatabase, ref, child, get } = await import(opts.dbJs);
    const app = initializeApp(opts.config);
    const db = getDatabase(app);
    const rootRef = ref(db);
    const result = {};
    for (const p of opts.paths) {
      try {
        const snap = await get(child(rootRef, p));
        result[p] = snap.exists() ? snap.val() : { __exists: true, __keys: Object.keys(snap.val()).slice(0, 20) };
      } catch (e) {
        result[p] = { __error: e.message };
      }
    }
    return result;
  }, {
    appJs: "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js",
    dbJs: "https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js",
    config: FIREBASE_CONFIG,
    paths,
  });
}

async function explore(page, baseUrl) {
  console.log(`\n>>> Navigating to: ${baseUrl}`);
  try {
    await page.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 15000 });
  } catch (e) {
    console.log(`  Navigation error (non-critical): ${e.message}`);
  }
  await page.waitForTimeout(8000);

  // Read the known data paths to see if this URL loads different content
  const testPaths = [
    `events/-5qp1c@5jvbh/info`,
    `events/-5qp1c@5jvbh/teams`,
  ];
  const data = await readPaths(page, testPaths);
  const infoOk = data[testPaths[0]] && !data[testPaths[0]].__error;
  const teamsCount = data[testPaths[1]]?.__exists ? data[testPaths[1]].__keys?.length : 0;
  console.log(`  Event info: ${infoOk ? 'OK' : 'FAIL'}`);
  console.log(`  Teams: ${teamsCount}`);

  return { infoOk, teamsCount };
}

// -- Main --

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 430, height: 932 } });

// Track ALL Firebase WebSocket queries for path discovery
const discoveredPaths = new Set();
page.on("websocket", ws => {
  if (ws.url().includes("firebaseio.com")) {
    ws.on("framesent", frame => {
      try {
        const msg = JSON.parse(frame.payload);
        if (msg.t === "d" && msg.d.a === "q" && msg.d.b?.p) {
          discoveredPaths.add(msg.d.b.p);
        }
      } catch (e) {}
    });
  }
});

// ========== STEP 1: Try URL-based routing ==========
console.log("=== STEP 1: URL Routing Discovery ===");

const urlVariants = [
  // Base
  "https://copafacil.com/-5qp1c@5jvbh",
  // Path segments
  "https://copafacil.com/-5qp1c@5jvbh/partidos",
  "https://copafacil.com/-5qp1c@5jvbh/matches",
  "https://copafacil.com/-5qp1c@5jvbh/equipos",
  "https://copafacil.com/-5qp1c@5jvbh/plantilla",
  "https://copafacil.com/-5qp1c@5jvbh/noticias",
  "https://copafacil.com/-5qp1c@5jvbh/fechas",
  "https://copafacil.com/-5qp1c@5jvbh/tabla",
  // Hash routes
  "https://copafacil.com/-5qp1c@5jvbh#/partidos",
  "https://copafacil.com/-5qp1c@5jvbh#/matches",
  "https://copafacil.com/-5qp1c@5jvbh#/equipos",
  "https://copafacil.com/-5qp1c@5jvbh#/fechas",
  // Query params
  "https://copafacil.com/-5qp1c@5jvbh?tab=partidos",
  "https://copafacil.com/-5qp1c@5jvbh?tab=matches",
  "https://copafacil.com/-5qp1c@5jvbh?view=fixtures",
  // Direct event route
  "https://copafacil.com/",
  "https://copafacil.com/#/login",
  "https://copafacil.com/-5qp1c",
  "https://copafacil.com/-5qp1c/5jvbh",
];

for (const url of urlVariants) {
  const result = await explore(page, url);
  // Check for new Firebase paths
  if (discoveredPaths.size > 0) {
    const newPaths = [...discoveredPaths].filter(p => !p.includes("/teams") && !p.includes("/info") && !p.includes("/midia") && !p.includes("/ptr") && !p.includes("/acess_count"));
    if (newPaths.length > 0) {
      console.log(`  NEW PATHS FOUND:`, newPaths);
    }
  }
}

console.log("\n=== All discovered Firebase paths ===");
console.log([...discoveredPaths].join("\n"));

// ========== STEP 2: Systematic canvas click grid ==========
console.log("\n=== STEP 2: Canvas Click Grid ===");

// Start from the working base URL
await page.goto("https://copafacil.com/-5qp1c@5jvbh", { waitUntil: "domcontentloaded", timeout: 20000 });
await page.waitForTimeout(10000);

// Click in a grid pattern across the canvas (mobile layout)
// Flutter bottom nav typically at y=880-920, content at y=60-870
const clicks = [];
for (let row = 0; row < 8; row++) {
  for (let col = 0; col < 4; col++) {
    const x = 430 * (col + 0.5) / 4;
    const y = 932 * (row + 0.5) / 8;
    clicks.push({ x: Math.round(x), y: Math.round(y), label: `R${row}C${col}` });
  }
}

// Add special target areas
clicks.push({ x: 215, y: 120, label: "header" });  // top center (might be a title/back button)
clicks.push({ x: 50, y: 60, label: "top-left" });  // hamburger menu area
clicks.push({ x: 215, y: 460, label: "center" });  // center (main content area)

for (const click of clicks) {
  const beforeCount = discoveredPaths.size;
  await page.mouse.click(click.x, click.y);
  await page.waitForTimeout(2000);
  const afterCount = discoveredPaths.size;

  if (afterCount > beforeCount) {
    // Find which paths were added
    const newPaths = [...discoveredPaths].slice(beforeCount);
    console.log(`  CLICK ${click.label} (${click.x},${click.y}) → ${newPaths.length} new paths`);
    newPaths.forEach(p => console.log(`    ${p}`));

    // If we found something interesting, try to read the data
    if (newPaths.some(p => p.includes("match") || p.includes("player") || p.includes("game") || p.includes("round") || p.includes("fecha"))) {
      console.log("  <<< Reading new data paths... >>>");
      const data = await readPaths(page, newPaths);
      Object.entries(data).forEach(([k, v]) => {
        if (v && !v.__error) {
          console.log(`    ${k}: ${v.__exists ? v.__keys?.length + ' children' : 'has data'}`);
        } else if (v?.__error) {
          console.log(`    ${k}: ${v.__error}`);
        } else {
          console.log(`    ${k}: null`);
        }
      });
    }
  }
}

// ========== STEP 3: Report ==========
console.log("\n=== FINAL REPORT ===");
console.log(`Total unique Firebase paths discovered: ${discoveredPaths.size}`);
console.log("All paths:");
console.log([...discoveredPaths].sort().join("\n"));

// Save discovered paths to file for reference
fs.writeFileSync("data/discovered-paths.json", JSON.stringify([...discoveredPaths], null, 2));
console.log("\nSaved to data/discovered-paths.json");

await browser.close();
