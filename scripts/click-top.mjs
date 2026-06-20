import { chromium } from "playwright";
import fs from "fs";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 430, height: 932 } });

// Capture ALL Firebase WS queries in real-time
const foundPaths = new Set();
const queryTimeline = [];
let queryCounter = 0;

page.on("websocket", ws => {
  if (!ws.url().includes("firebaseio.com")) return;
  
  ws.on("framesent", frame => {
    try {
      const msg = JSON.parse(frame.payload);
      if (msg.t === "d" && msg.d.a === "q" && msg.d.b?.p) {
        const path = msg.d.b.p;
        queryCounter++;
        if (!foundPaths.has(path)) {
          foundPaths.add(path);
          queryTimeline.push({ when: Date.now(), r: msg.d.r, path });
        }
      }
    } catch (e) {}
  });
});

console.log("Loading app...");
await page.goto("https://copafacil.com/-5qp1c@5jvbh", { waitUntil: "domcontentloaded", timeout: 20000 });
await page.waitForTimeout(15000);

console.log("\nInitial paths loaded:", queryTimeline.length);
queryTimeline.forEach(q => console.log("  [" + q.r + "] " + q.path));
const initialCount = queryTimeline.length;

// STRATEGY: Click top area systematically
// On mobile 430x932, the app has:
// - Status bar: y=0-40
// - App bar with tabs: y=40-120
// - Content area: y=120-830
// - Bottom safe area: y=830-932

console.log("\n=== Clicking TOP TAB BAR (y=40 to y=150) ===");

const tabBarClicks = [];
// Try 5 horizontal positions at different vertical offsets
for (let y = 60; y <= 140; y += 20) {
  for (let x = 30; x <= 410; x += 76) {
    tabBarClicks.push({ x: Math.round(x), y: Math.round(y) });
  }
}

for (const click of tabBarClicks) {
  const before = queryTimeline.length;
  try {
    await page.mouse.click(click.x, click.y);
    await page.waitForTimeout(1000);
    if (queryTimeline.length > before) {
      console.log("\n*** CLICK (" + click.x + "," + click.y + ") => NEW PATHS:");
      queryTimeline.slice(before).forEach(q => console.log("  [" + q.r + "] " + q.path));
    }
  } catch (e) {}
}

// If no new paths found, try waiting longer after each click
if (queryTimeline.length <= initialCount) {
  console.log("\nNo paths found with 1s wait. Trying with 5s wait...");
  for (const click of tabBarClicks.slice(0, 10)) {
    const before = queryTimeline.length;
    try {
      await page.mouse.click(click.x, click.y);
      await page.waitForTimeout(5000);
      if (queryTimeline.length > before) {
        console.log("CLICK (" + click.x + "," + click.y + ") => NEW PATHS");
        queryTimeline.slice(before).forEach(q => console.log("  [" + q.r + "] " + q.path));
        break;
      }
    } catch (e) {}
  }
}

// ALSO: Try to take a screenshot and save it for analysis
await page.screenshot({ path: "data/screenshot.png", fullPage: false });
console.log("\nScreenshot saved to data/screenshot.png");

// Report all unique paths found
console.log("\n=== ALL PATHS FOUND ===");
queryTimeline.forEach(q => console.log(q.path));

fs.writeFileSync("data/query-timeline.json", JSON.stringify(queryTimeline, null, 2));

await browser.close();
