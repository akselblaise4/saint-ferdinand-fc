import { chromium } from "playwright";
import fs from "fs";

const EVENT = "-5qp1c";
const GROUP = "5jvbh";

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();

await context.addInitScript(() => {
  const NativeWS = window.WebSocket;
  const origSend = NativeWS.prototype.send;
  NativeWS.prototype.send = function(data) {
    if (typeof data === "string" && !window.__fbWebSocket && data.length > 20 && data.includes('"a":"q"')) {
      window.__fbWebSocket = this;
    }
    return origSend.call(this, data);
  };
});

const page = await context.newPage({ viewport: { width: 1920, height: 1080 } });
const rawResponses = [];

page.on("websocket", (ws) => {
  if (!ws.url().includes("firebaseio")) return;
  ws.on("framereceived", (frame) => {
    const text = frame.payload || "";
    if (text.length > 30) rawResponses.push(text);
  });
});

await page.goto(`https://copafacil.com/${EVENT}@${GROUP}`, { waitUntil: "domcontentloaded", timeout: 30000 });
await page.waitForTimeout(20000);

const ready = await page.evaluate(() => !!window.__fbWebSocket);
if (!ready) { console.log("WS not ready"); await browser.close(); process.exit(1); }
console.log("WS ready. Auto-captured:", rawResponses.length, "frames");

// Helper: extract path and data from response
function parseResponse(text) {
  try {
    const parsed = JSON.parse(text);
    const p = parsed?.d?.b?.p;
    const d = parsed?.d?.b?.d;
    if (p && d !== undefined) return { path: p, data: d };
  } catch {}
  return null;
}

// Send query
async function sendQuery(path) {
  const r = Date.now() % 100000 + 1000;
  const msg = JSON.stringify({ t: "d", d: { r, a: "q", b: { p: "/" + path, h: "" } } });
  const before = rawResponses.length;
  await page.evaluate((m) => window.__fbWebSocket?.send(m), msg);
  await page.waitForTimeout(5000);
  return before;
}

// Query matchs
console.log("Sending matchs query...");
const b4 = await sendQuery(`events/${EVENT}/matchs`);

// Check all new responses
console.log(`New responses after query: ${rawResponses.length - b4}`);
for (let i = b4; i < rawResponses.length; i++) {
  const r = parseResponse(rawResponses[i]);
  if (r) {
    console.log(`  Path: ${r.path}, Data type: ${typeof r.data}, Keys: ${typeof r.data === "object" ? Object.keys(r.data).length : "N/A"}`);
  } else {
    // Show first 200 chars for debugging
    console.log(`  Raw: ${rawResponses[i].substring(0, 200)}`);
  }
}

// Now extract matchs data from ALL responses (including auto-captured)
console.log("\n=== Extracting matchs from ALL raw responses ===");
const allMatchData = {};
let matchsFound = false;

for (const resp of rawResponses) {
  const r = parseResponse(resp);
  if (r && (r.path === `events/${EVENT}/matchs` || r.path === `/${EVENT}/matchs`) && typeof r.data === "object") {
    Object.assign(allMatchData, r.data);
    matchsFound = true;
    console.log("Found matchs data!");
  }
  // Also try checking for matchs-like data in any path
  if (r && r.path && r.path.includes("matchs") && typeof r.data === "object") {
    const keys = Object.keys(r.data);
    if (keys.length > 3 && keys[0].length === 13) {
      console.log(`Matchs-like data at: ${r.path} with ${keys.length} keys`);
      Object.assign(allMatchData, r.data);
      matchsFound = true;
    }
  }
}

if (!matchsFound) {
  console.log("Matchs data not found. Dumping all unique paths...");
  const paths = new Set();
  for (const resp of rawResponses) {
    const r = parseResponse(resp);
    if (r) paths.add(r.path);
  }
  for (const p of [...paths].sort()) {
    console.log("  " + p);
  }
}

if (matchsFound) {
  const matchKeys = Object.keys(allMatchData);
  console.log(`Total matches: ${matchKeys.length}`);
  
  // Filter for our group
  const groupMatches = matchKeys.filter(k => {
    const m = allMatchData[k];
    return m && typeof m === "object" && m.evt === `${EVENT}@${GROUP}`;
  });
  console.log(`Group matches (${EVENT}@${GROUP}): ${groupMatches.length}`);
  
  // Save match keys
  fs.writeFileSync("data/group-matches.json", JSON.stringify({
    allKeys: matchKeys,
    groupKeys: groupMatches,
    allMatchData,
  }, null, 2));
  
  // Now query details for group matches
  console.log("\nQuerying details for group matches...");
  const detailsData = {};
  
  for (let i = 0; i < groupMatches.length; i++) {
    const mk = groupMatches[i];
    const dPath = `events/${EVENT}@${GROUP}/details/${mk}`;
    const b4d = rawResponses.length;
    
    await sendQuery(dPath);
    
    // Scan for the response
    for (let j = b4d; j < rawResponses.length; j++) {
      const r = parseResponse(rawResponses[j]);
      if (r && r.path === dPath && typeof r.data === "object" && r.data.list) {
        detailsData[mk] = r.data;
        break;
      }
    }
    
    if ((i + 1) % 5 === 0) {
      console.log(`  ${i + 1}/${groupMatches.length} - found ${Object.keys(detailsData).length} details`);
    }
  }
  
  console.log(`\nDetails found: ${Object.keys(detailsData).length}/${groupMatches.length}`);
  
  // Player data
  console.log("\nCollecting player IDs...");
  const playerIds = new Set();
  for (const [mk, data] of Object.entries(detailsData)) {
    if (data.list) {
      for (const [ts, ev] of Object.entries(data.list)) {
        if (ev.pl_id1) playerIds.add(ev.pl_id1);
      }
    }
  }
  console.log(`Player IDs: ${playerIds.size}`);
  
  fs.writeFileSync("data/copa-complete.json", JSON.stringify({
    capturedAt: new Date().toISOString(),
    matchCount: groupMatches.length,
    detailsCount: Object.keys(detailsData).length,
    playerCount: playerIds.size,
    matches: allMatchData,
    details: detailsData,
  }, null, 2));
  
  console.log("Saved data/copa-complete.json");
}

await browser.close();
