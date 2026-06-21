import { chromium } from "playwright";

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

page.on("websocket", (ws) => {
  const url = ws.url();
  if (!url.includes("firebaseio")) return;
  ws.on("framesent", (frame) => {
    const t = (frame.payload || "").trim();
    if (t.includes('"a":"q"') || t.includes("eventData") || t.includes("match") && t.length > 100) {
      console.log("\nQUERY:", t.substring(0, 500));
    }
  });
  ws.on("framereceived", (frame) => {
    const t = (frame.payload || "").trim();
    if (t.includes("eventData") || t.includes("goals") || t.includes("cards") || t.includes("gol")) {
      console.log("\n*** EVENTDATA RESPONSE ***:", t.substring(0, 3000));
    }
  });
});

await page.goto("https://copafacil.com/-5qp1c@5jvbh", { waitUntil: "domcontentloaded", timeout: 20000 });
console.log("Waiting 15s for Flutter to fully render...");
await page.waitForTimeout(15000);
await page.screenshot({ path: "data/copa-page.png", fullPage: true });
console.log("Screenshot saved to data/copa-page.png");

// Try clicking on match-list tab (bottom nav in Copa Facil)
console.log("Trying to click on match list area...");
await page.mouse.click(960, 950); // bottom nav area
await page.waitForTimeout(3000);
await page.screenshot({ path: "data/copa-matchlist.png", fullPage: true });

// Try clicking on a match row
for (let y = 300; y <= 600; y += 50) {
  await page.mouse.click(400, y);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `data/copa-click-${y}.png`, fullPage: true });
}

console.log("Waiting 10s for any new data...");
await page.waitForTimeout(10000);

await browser.close();
