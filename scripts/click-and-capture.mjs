import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

let wsConnected = false;
let wsSentFrames = [];
let wsRecvFrames = [];

page.on("websocket", (ws) => {
  if (!ws.url().includes("firebaseio")) return;
  console.log("\n=== WebSocket connected");
  wsConnected = true;

  ws.on("framesent", (frame) => {
    const text = (frame.payload || "").trim();
    if (text.length > 20) {
      wsSentFrames.push(text);
      // Show non-trivial frames
      if (!text.startsWith('{"t":"k"') && !text.startsWith('{"t":"c"') && !text.startsWith('{"t":"n"')) {
        console.log("\nSENT:", text.substring(0, 300));
      }
    }
  });

  ws.on("framereceived", (frame) => {
    const text = (frame.payload || "").trim();
    if (text.startsWith('{"t":"d"') || text.startsWith('{"t":"a"')) {
      // Data or action response - could be match data
      if (text.length > 200 && (text.includes("details") || text.includes("ac") || text.includes("list/"))) {
        console.log("\n*** MATCH DETAIL RECV ***:", text.substring(0, 3000));
      }
      if (text.length > 100 && text.includes("eventData")) {
        console.log("\n*** EVENTDATA RECV ***:", text.substring(0, 3000));
      }
    }
  });
});

// Load page
await page.goto("https://copafacil.com/-5qp1c@5jvbh", { waitUntil: "domcontentloaded", timeout: 20000 });
console.log("Page loaded, waiting for Flutter...");
await page.waitForTimeout(20000);

// Take screenshot to understand layout
await page.screenshot({ path: "data/copa-full.png", fullPage: false });

// Clear recorded frames so we only track new ones
wsSentFrames = [];
wsRecvFrames = [];

// Try to navigate to match list by clicking various coordinates
// The Copa Facil app has tabs at the bottom
console.log("\n=== Clicking on tab area (bottom of screen) ===");
// Try clicking on what might be a "Partidos" tab
for (let x = 200; x <= 1800; x += 200) {
  await page.mouse.click(x, 1000); // bottom nav area
  await page.waitForTimeout(500);
}

await page.waitForTimeout(3000);
await page.screenshot({ path: "data/copa-after-tab-click.png", fullPage: false });

// Now try clicking on match rows (middle of screen)
console.log("\n=== Clicking on match list area ===");
for (let y = 250; y <= 700; y += 40) {
  await page.mouse.click(500, y);
  await page.waitForTimeout(500);
}

await page.waitForTimeout(5000);
await page.screenshot({ path: "data/copa-after-match-click.png", fullPage: false });

console.log("\n=== All new WS frames after interactions ===");
wsSentFrames.forEach((f, i) => {
  console.log("Frame", i, ":", f.substring(0, 200));
});

console.log("\n=== Done ===");
await browser.close();
