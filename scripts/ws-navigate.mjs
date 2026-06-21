import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

let wsLog = [];
page.on("websocket", (ws) => {
  if (!ws.url().includes("firebaseio")) return;
  ws.on("framesent", (frame) => {
    const t = (frame.payload || "").trim();
    if (t.length > 20 && !t.startsWith('{"t":"k"') && !t.startsWith('{"t":"c"')) {
      wsLog.push({ dir: "SEND", time: Date.now(), data: t });
    }
  });
  ws.on("framereceived", (frame) => {
    const t = (frame.payload || "").trim();
    if (t.length > 30) {
      wsLog.push({ dir: "RECV", time: Date.now(), data: t });
    }
  });
});

await page.goto("https://copafacil.com/-5qp1c@5jvbh", { waitUntil: "domcontentloaded", timeout: 20000 });
console.log("Loaded, waiting for Flutter...");
await page.waitForTimeout(15000);

// Try clicking bottom nav at various positions
console.log("Clicking tab bar area...");
for (let x = 100; x < 1900; x += 200) {
  await page.mouse.click(x, 950);
  await page.waitForTimeout(200);
}
await page.waitForTimeout(2000);

// Try clicking on match list area
console.log("Clicking main content area...");
for (let y = 200; y < 800; y += 30) {
  await page.mouse.click(500, y);
  await page.waitForTimeout(100);
}
await page.waitForTimeout(3000);

// Search for 'details' or 'list/' in WS frames
console.log("\n=== Analyzing WS frames for match detail data ===");
let detailsFound = false;
for (const f of wsLog) {
  if (f.data.includes("details") || f.data.includes("list/") || f.data.includes("ac") || f.data.includes("val1")) {
    if (!f.data.startsWith('{"t":"d","d":{"r":')) continue; // just metadata
    console.log(f.dir, f.time, f.data.substring(0, 2000));
    detailsFound = true;
    break;
  }
}
if (!detailsFound) {
  console.log("No 'details' path data found in WS frames.");
}

// Show first 3 large RECV frames for analysis
console.log("\n=== First 3 large RECV frames ===");
let count = 0;
for (const f of wsLog) {
  if (f.dir === "RECV" && f.data.length > 500) {
    console.log(`[${count}] ${f.data.substring(0, 400)}`);
    count++;
    if (count >= 3) break;
  }
}

// Show all unique QUERY paths from SEND frames
console.log("\n=== All queried paths ===");
const paths = new Set();
for (const f of wsLog) {
  if (f.dir === "SEND") {
    const m = f.data.match(/"p":"([^"]+)"/);
    if (m) paths.add(m[1]);
  }
}
paths.forEach(p => console.log("  " + p));

await browser.close();
