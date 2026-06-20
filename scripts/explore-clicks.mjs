/*
 * Smart Flutter Navigator — clicks the app, discovers new Firebase paths.
 * Run once; it saves discovered paths to data/discovered.json.
 * On each run it tries unseen click zones until it maps the full app.
 */

import { chromium } from "playwright";
import fs from "fs";

const DBG = "data/discovered.json";

let state = { visitedUrls: {}, clickResults: [] };
if (fs.existsSync(DBG)) {
  try { state = JSON.parse(fs.readFileSync(DBG, "utf-8")); } catch (e) {}
}

async function readNewPaths(page) {
  // After clicks, wait and inject Firebase SDK to read paths
  await page.waitForTimeout(1500);
  
  const result = await page.evaluate(async () => {
    const { initializeApp } = await import(
      "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js"
    );
    const { getDatabase, ref, child, get } = await import(
      "https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js"
    );
    const app = initializeApp({
      apiKey: "AIzaSyDbR0mRSSb554WadsJgfOivSXLET84IIR0",
      databaseURL: "https://copafacil-web.firebaseio.com",
    });
    const db = getDatabase(app);
    const rootRef = ref(db);

    const alwaysPaths = [
      "events/-5qp1c@5jvbh/info",
      "events/-5qp1c@5jvbh/teams/-OqC_DyMZey8vTF5Shq5",
    ];

    // Try match-like paths
    const tryPaths = [
      "events/-5qp1c@5jvbh/matches",
      "events/-5qp1c/matches",
      "events/-5qp1c@5jvbh/fixtures",
      "events/-5qp1c@5jvbh/rounds",
      "events/-5qp1c@5jvbh/classificacao",
      "events/-5qp1c@5jvbh/players",
      "events/-5qp1c/players",
      "events/-5qp1c@5jvbh/teams/-OqC_DyMZey8vTF5Shq5/players",
      // Each evt ID as sub-event
      "events/-5qp1c@kjk7t/teams",
      "events/-5qp1c@kjk7t/matches",
      "events/-5qp1c@sz2ln/teams",
      "events/-5qp1c@sz2ln/matches",
      "events/-5qp1c@66786/teams",
      "events/-5qp1c@66786/matches",
      "events/-5qp1c@mp7pq/teams",
      "events/-5qp1c@mp7pq/matches",
      "events/-5qp1c@8ard/teams",
      "events/-5qp1c@8ard/matches",
      "events/-5qp1c@6d06s/teams",
      "events/-5qp1c@6d06s/matches",
    ];

    const all = [...alwaysPaths, ...tryPaths];
    const result = {};
    for (const p of all) {
      try {
        const snap = await get(child(rootRef, p));
        result[p] = snap.exists() ? "DATA" : null;
      } catch (e) {
        result[p] = "ERR:" + e.message.substring(0, 30);
      }
    }
    return result;
  });

  // Identify which tryPaths now have data
  const newOnes = [];
  for (const [p, status] of Object.entries(result)) {
    if (status === "DATA" && p.includes("matches") || p.includes("players") || p.includes("round")) {
      newOnes.push(p);
    }
  }
  return { newOnes, result };
}

async function main() {
  console.log("=== Smart Flutter Navigator ===\n");

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 430, height: 932 } });

  // Load base page
  await page.goto("https://copafacil.com/-5qp1c@5jvbh", { waitUntil: "domcontentloaded", timeout: 20000 });
  await page.waitForTimeout(10000);

  // Baseline: what data do we see before any clicks?
  const baseline = await readNewPaths(page);
  console.log("Baseline paths with data:");
  Object.entries(baseline.result).forEach(([p, s]) => {
    if (s === "DATA") console.log("  " + p);
  });
  console.log();

  // Define click grid (screen is 430x932)
  // Flutter app typically has:
  //   - Top app bar: y~0-80
  //   - Content area: y~80-840
  //   - Bottom nav: y~840-932
  const clickGrid = [];
  // Top bar
  for (let i = 0; i < 4; i++) clickGrid.push({ x: 50 + i * 110, y: 40, zone: "top-bar" });
  // Content rows
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 3; col++) {
      clickGrid.push({
        x: Math.round(80 + col * 140),
        y: Math.round(120 + row * 120),
        zone: "content-R" + row + "C" + col,
      });
    }
  }
  // Bottom nav
  for (let i = 0; i < 5; i++) {
    clickGrid.push({ x: Math.round(43 + i * 86), y: 905, zone: "bottom-nav-" + i });
  }

  console.log("Click grid has " + clickGrid.length + " zones\n");

  // Track which zones we've already tried
  const tried = state.clickResults.map(cr => cr.x + "," + cr.y);
  let discoveries = 0;

  for (const click of clickGrid) {
    const key = click.x + "," + click.y;
    if (tried.includes(key)) continue;

    try {
      await page.mouse.click(click.x, click.y);
      const { newOnes } = await readNewPaths(page);

      const entry = {
        x: click.x, y: click.y, zone: click.zone,
        found: newOnes.length,
        paths: newOnes,
      };
      state.clickResults.push(entry);

      if (newOnes.length > 0) {
        discoveries++;
        console.log("HIT at " + click.zone + " (" + click.x + "," + click.y + ")");
        console.log("  New paths: " + newOnes.join(", "));
      }
    } catch (e) {
      // Click might cause navigation or error, that's fine
    }

    // Save state periodically
    if (state.clickResults.length % 20 === 0) {
      fs.writeFileSync(DBG, JSON.stringify(state, null, 2));
    }
  }

  console.log("\nDone. Total hits: " + discoveries + " / " + clickGrid.length);
  fs.writeFileSync(DBG, JSON.stringify(state, null, 2));
  console.log("State saved to " + DBG);

  await browser.close();
}

main().catch(console.error);
