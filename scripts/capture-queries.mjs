/*
 * Captures real-time Firebase queries by intercepting WebSocket frames.
 * Clicks systematically and records EVERY path queried.
 */

import { chromium } from "playwright";
import fs from "fs";

async function main() {
  console.log("=== Real-time Firebase Query Capture ===\n");

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 430, height: 932 } });

  // Map of requestId -> path
  const pendingQueries = new Map();
  const seenPaths = new Set();
  const allQueries = [];

  page.on("websocket", ws => {
    if (!ws.url().includes("firebaseio.com")) return;

    ws.on("framesent", frame => {
      try {
        const msg = JSON.parse(frame.payload);
        if (msg.t === "d" && msg.d.a === "q" && msg.d.b?.p) {
          pendingQueries.set(msg.d.r, msg.d.b.p);
        }
      } catch (e) {}
    });

    ws.on("framereceived", frame => {
      try {
        const msg = JSON.parse(frame.payload);
        if (msg.t === "c") return;
        if (msg.t === "d" && msg.d.r) {
          // Response to a query
          const path = pendingQueries.get(msg.d.r);
          if (path && !seenPaths.has(path)) {
            seenPaths.add(path);
            allQueries.push({ path, status: msg.d.b?.s || "ok" });
            console.log("  NEW PATH: " + path + " (r=" + msg.d.r + ")");
          }
          pendingQueries.delete(msg.d.r);
        }
      } catch (e) {}
    });
  });

  // Load base page
  console.log("Loading app...");
  await page.goto("https://copafacil.com/-5qp1c@5jvbh", { waitUntil: "domcontentloaded", timeout: 20000 });
  await page.waitForTimeout(15000);

  console.log("\nInitial paths loaded:");
  allQueries.forEach(q => console.log("  " + q.path));

  // Click grid
  const clicks = [];
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 3; col++) {
      clicks.push({ x: Math.round(80 + col * 140), y: Math.round(120 + row * 120), label: "C" + row + col });
    }
  }
  for (let i = 0; i < 5; i++) {
    clicks.push({ x: Math.round(43 + i * 86), y: 905, label: "nav" + i });
  }
  clicks.push({ x: 215, y: 50, label: "top" });
  clicks.push({ x: 215, y: 880, label: "above-nav" });

  for (const c of clicks) {
    const before = allQueries.length;
    await page.mouse.click(c.x, c.y);
    await page.waitForTimeout(2000);
    const after = allQueries.length;

    if (after > before) {
      const newOnes = allQueries.slice(before);
      console.log("\nCLICK " + c.label + " (" + c.x + "," + c.y + ") => " + newOnes.length + " new queries");
      newOnes.forEach(q => console.log("  " + q.path));
    }
  }

  console.log("\n=== ALL DISCOVERED PATHS ===");
  allQueries.forEach(q => console.log("  " + q.path));

  fs.writeFileSync("data/captured-queries.json", JSON.stringify(allQueries, null, 2));
  console.log("\nSaved " + allQueries.length + " queries to data/captured-queries.json");

  await browser.close();
}

main().catch(console.error);
