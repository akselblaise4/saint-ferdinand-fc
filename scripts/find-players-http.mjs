import { chromium } from "playwright";
import fs from "fs";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

// Intercept ALL requests
const requests = [];
page.on("request", req => {
  const url = req.url();
  if (url.includes("firebaseio") || url.includes("cloudfunctions") || url.includes("copafacil") || url.includes("googleapis")) {
    requests.push({ url: url.substring(0, 200), method: req.method() });
  }
});

// Intercept WebSocket
const wsMessages = [];
page.on("websocket", ws => {
  ws.on("framesent", frame => {
    if (frame.payload?.includes('"a":"q"')) {
      try {
        const d = JSON.parse(frame.payload);
        const path = d?.d?.b?.p;
        if (path) wsMessages.push(path);
      } catch {}
    }
  });
});

console.log("[1] Loading Copa Fácil...");
await page.goto("https://copafacil.com/-5qp1c@5jvbh", { waitUntil: "load", timeout: 30000 });
await page.waitForTimeout(8000);

const initReqs = [...requests];
const initWs = [...wsMessages];
requests.length = 0;
wsMessages.length = 0;

console.log(`Initial requests: ${initReqs.length}, WS: ${initWs.length}`);

// Click Equipos tab
console.log("[2] Clicking Equipos tab...");
const canvas = await page.$("flt-glass-pane canvas, canvas");
const box = await canvas.boundingBox();
await page.mouse.click(box.x + 215, box.y + 100);
await page.waitForTimeout(5000);

console.log(`After Equipos: ${requests.length} requests, ${wsMessages.length} WS`);
console.log("\nNew requests:");
requests.forEach(r => console.log(`  ${r.method} ${r.url}`));
console.log("\nNew WS queries:");
wsMessages.forEach(p => console.log(`  ${p}`));

// Now try clicking at different positions to find team detail
// Capture what queries happen
console.log("\n[3] Probing team click positions...");
const foundPaths = new Set();
for (let attempt = 0; attempt < 5; attempt++) {
  const yPositions = [220, 280, 340, 400, 460, 520, 580, 640];
  for (const y of yPositions) {
    const before = wsMessages.length;
    await page.mouse.click(box.x + 200, box.y + y);
    await page.waitForTimeout(1500);
    if (wsMessages.length > before) {
      const newPaths = wsMessages.slice(before);
      console.log(`  Click at y=${y}: ${newPaths.length} new queries`);
      newPaths.forEach(p => { console.log(`    ${p}`); foundPaths.add(p); });
      // Try reading these paths
      break;
    }
  }
}

// Read ALL discovered paths
console.log(`\n[4] Reading ${foundPaths.size} discovered paths...`);
await page.goto("about:blank", { waitUntil: "domcontentloaded" });

const result = await page.evaluate(async (config, paths) => {
  const { initializeApp } = await import("https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js");
  const { getDatabase, ref, child, get } = await import("https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js");
  const app = initializeApp(config);
  const db = getDatabase(app);
  const rootRef = ref(db);
  const read = async p => { try { const s = await get(child(rootRef, p)); return s.exists() ? s.val() : null; } catch { return null; } };
  const result = {};
  for (const p of paths) result[p] = await read(p);
  return result;
}, {
  apiKey: "AIzaSyDbR0mRSSb554WadsJgfOivSXLET84IIR0",
  databaseURL: "https://copafacil-web.firebaseio.com",
}, [...foundPaths]);

let foundCount = 0;
Object.entries(result).forEach(([path, val]) => {
  if (val !== null) {
    foundCount++;
    const size = typeof val === "object" ? Object.keys(val).length : "scalar";
    console.log(`\n${path}: FOUND (${size})`);
    console.log(JSON.stringify(val).substring(0, 500));
  }
});
if (foundCount === 0) console.log("No paths had data");

// Also: check if there's a Cloud Functions endpoint
console.log(`\n[5] Cloud Functions requests found: ${initReqs.filter(r => r.url.includes("cloudfunctions")).length}`);
initReqs.filter(r => r.url.includes("cloudfunctions")).forEach(r => console.log(`  ${r.url}`));

// Check for API endpoints
console.log(`\n   Firebase REST API calls: ${initReqs.filter(r => r.url.includes("firebaseio")).length}`);
console.log(`   Google APIs calls: ${initReqs.filter(r => r.url.includes("googleapis")).length}`);

await browser.close();
