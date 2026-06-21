import { chromium } from "playwright";
import fs from "fs";

const EVENT = "-5qp1c";
const GROUP = "5jvbh";

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();

// Patch WebSocket BEFORE the page loads to intercept Firebase WebSocket
await context.addInitScript(() => {
  const NativeWebSocket = window.WebSocket;
  let fbWs = null;
  
  // Override to capture Firebase WebSocket instance
  window.__fbWebSocket = null;
  
  const origSend = NativeWebSocket.prototype.send;
  NativeWebSocket.prototype.send = function(data) {
    if (typeof data === "string" && (data.startsWith('{"t":"d"') || data == '{"t":"c"}' || data == '{"t":"d","d":{"r":1,"a":"q","b":{"p":"/","h":""}}}')) {
      window.__fbWebSocket = this;
      window.__fbWsReady = true;
    }
    return origSend.call(this, data);
  };
});

const page = await context.newPage({ viewport: { width: 1920, height: 1080 } });
const results = { responses: [] };

page.on("websocket", (ws) => {
  if (!ws.url().includes("firebaseio")) return;
  console.log("Firebase WS URL:", ws.url().substring(0, 100));
  
  ws.on("framereceived", (frame) => {
    const text = frame.payload || "";
    if (text.length > 50) results.responses.push(text);
  });
});

await page.goto(`https://copafacil.com/${EVENT}@${GROUP}`, {
  waitUntil: "domcontentloaded",
  timeout: 30000,
});

console.log("Waiting for Flutter init...");
await page.waitForTimeout(25000);

// Check if we intercepted the WebSocket
const hasWs = await page.evaluate(() => !!window.__fbWebSocket);
console.log("Firebase WS captured:", hasWs);

// Try to add our own message to the Firebase WebSocket
// Firebase WS protocol: {"t":"d","d":{"r":REQUEST_ID,"a":"q","b":{"p":"PATH","h":""}}}
// The server responds with: {"t":"d","d":{"r":REQUEST_ID,"b":{"p":"PATH","d":DATA}}}

async function sendQuery(path) {
  const r = Date.now() % 100000;
  const msg = JSON.stringify({ t: "d", d: { r, a: "q", b: { p: "/" + path, h: "" } } });
  
  await page.evaluate((msg) => {
    if (window.__fbWebSocket && window.__fbWebSocket.readyState === WebSocket.OPEN) {
      window.__fbWebSocket.send(msg);
    }
  }, msg);
  
  await new Promise(r => setTimeout(r, 2000));
}

// Query all match details from the matchs data we captured earlier
// We need the match IDs first - get them from the initial load responses
console.log("Checking captured responses...");
const matchIds = new Set();
for (const resp of results.responses) {
  try {
    const parsed = JSON.parse(resp);
    const d = parsed?.d?.b?.d;
    const p = parsed?.d?.b?.p;
    if (p && p.includes("matchs") && d && typeof d === "object") {
      for (const key of Object.keys(d)) {
        if (d[key] && typeof d[key] === "object") {
          if (d[key].t1 || d[key].t2 || d[key].dt) {
            matchIds.add(d[key].dt);
          }
        }
      }
    }
  } catch {}
}

console.log(`Found ${matchIds.size} match IDs from responses`);

// If we couldn't extract match IDs, use the ones we know
if (matchIds.size === 0) {
  // From our interactive session we know these match IDs
  const known = ["1780501700822", "1780501700821", "1780501700820"];
  known.forEach(id => matchIds.add(id));
}

// Send queries for all matches and player data
const queryPaths = [];
for (const mid of matchIds) {
  queryPaths.push(`events/${EVENT}@${GROUP}/details/${mid}`);
}

// Also get all matchs data to find all match IDs
queryPaths.push(`events/${EVENT}/matchs`);

console.log(`Sending ${queryPaths.length} queries...`);

const beforeCount = results.responses.length;
for (let i = 0; i < queryPaths.length; i++) {
  await sendQuery(queryPaths[i]);
  if (i % 10 === 0) console.log(`  ${i}/${queryPaths.length}`);
}

// Wait for responses
await page.waitForTimeout(10000);
console.log(`Responses after queries: ${results.responses.length - beforeCount} new`);

// Save results
const saved = {
  queryPaths,
  responsesBefore: beforeCount,
  responsesAfter: results.responses.length,
};

// Extract details data
const detailsData = {};
for (const resp of results.responses) {
  try {
    const parsed = JSON.parse(resp);
    const p = parsed?.d?.b?.p;
    const d = parsed?.d?.b?.d;
    if (p && p.includes("details") && d && typeof d === "object") {
      detailsData[p] = d;
    }
  } catch {}
}

console.log(`\nDetails paths captured: ${Object.keys(detailsData).length}`);
for (const [p, d] of Object.entries(detailsData)) {
  const matchId = p.split("/").pop();
  const listKeys = d.list ? Object.keys(d.list).length : 0;
  console.log(`  ${matchId}: ${listKeys} events`);
}

// Save everything
fs.writeFileSync("data/ws-bot-data.json", JSON.stringify({
  detailsData,
  allResponses: results.responses,
  saved,
}, null, 2));

console.log("\nSaved to data/ws-bot-data.json");

await browser.close();
