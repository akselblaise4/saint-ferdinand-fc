import { chromium } from "playwright";
import fs from "fs";

const EVENT = "-5qp1c";
const GROUP = "5jvbh";
const PREFIX = `${EVENT}@${GROUP}`;

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();

// Patch WebSocket to capture Firebase connection
await context.addInitScript(() => {
  const NativeWebSocket = window.WebSocket;
  const origSend = NativeWebSocket.prototype.send;
  
  NativeWebSocket.prototype.send = function(data) {
    if (typeof data === "string" && data.length > 20 && !window.__fbWebSocket) {
      if (data.includes('"a":"q"') || data.startsWith('{"t":"d"')) {
        window.__fbWebSocket = this;
      }
    }
    return origSend.call(this, data);
  };
});

const page = await context.newPage({ viewport: { width: 1920, height: 1080 } });

const allResponses = [];
let autoCapturedData = {};

page.on("websocket", (ws) => {
  if (!ws.url().includes("firebaseio")) return;
  ws.on("framereceived", (frame) => {
    const text = frame.payload || "";
    if (text.length > 30) {
      allResponses.push({ time: Date.now(), data: text });
      try {
        const parsed = JSON.parse(text);
        if (parsed?.d?.b?.p && parsed?.d?.b?.d !== undefined) {
          autoCapturedData[parsed.d.b.p] = parsed.d.b.d;
        }
      } catch {}
    }
  });
});

await page.goto(`https://copafacil.com/${EVENT}@${GROUP}`, {
  waitUntil: "domcontentloaded",
  timeout: 30000,
});

console.log("Waiting for Flutter init...");
await page.waitForTimeout(25000);

const hasWs = await page.evaluate(() => !!window.__fbWebSocket);
console.log("Firebase WS captured:", hasWs);
if (!hasWs) { await browser.close(); process.exit(1); }

// Function to send a Firebase query and wait for response
async function queryFirebase(path) {
  const r = Date.now() % 100000 + Math.floor(Math.random() * 1000);
  const msg = JSON.stringify({ t: "d", d: { r, a: "q", b: { p: "/" + path, h: "" } } });
  
  const beforeCount = allResponses.length;
  await page.evaluate((m) => {
    if (window.__fbWebSocket && window.__fbWebSocket.readyState === WebSocket.OPEN) {
      window.__fbWebSocket.send(m);
    }
  }, msg);
  
  // Wait for response (up to 5s)
  for (let i = 0; i < 25; i++) {
    await new Promise(r => setTimeout(r, 200));
    // Check if we got a response for this request
    for (let j = beforeCount; j < allResponses.length; j++) {
      try {
        const parsed = JSON.parse(allResponses[j].data);
        if (parsed?.d?.b?.p === path && parsed?.d?.b?.d !== undefined) {
          return parsed.d.b.d;
        }
        // Also check response by request ID
        if (parsed?.d?.r === r && parsed?.d?.b?.d !== undefined) {
          return parsed.d.b.d;
        }
      } catch {}
    }
  }
  return null;
}

// Phase 1: Get all match IDs
console.log("\nPhase 1: Getting match list...");
const matchsData = await queryFirebase(`events/${EVENT}/matchs`);
if (!matchsData) {
  console.log("Could not get matchs data, checking auto-captured...");
  // Fall back to auto-captured data
  for (const [p, d] of Object.entries(autoCapturedData)) {
    if (p.includes("matchs")) {
      console.log("Found matchs data in auto-capture:", p);
    }
  }
}

const matchIds = new Set();
if (matchsData && typeof matchsData === "object") {
  for (const [key, match] of Object.entries(matchsData)) {
    if (match && typeof match === "object" && match.dt) {
      matchIds.add(String(match.dt));
    }
  }
}
console.log(`Found ${matchIds.size} match IDs`);

// Phase 2: Query details for each match
console.log("\nPhase 2: Querying match details...");
const detailsData = {};
let queried = 0;
for (const mid of matchIds) {
  const path = `events/${PREFIX}/details/${mid}`;
  const data = await queryFirebase(path);
  if (data && typeof data === "object") {
    detailsData[mid] = data;
    const listCount = data.list ? Object.keys(data.list).length : 0;
    console.log(`  ${mid}: ${listCount} events`);
  } else {
    console.log(`  ${mid}: no data`);
  }
  queried++;
  if (queried % 10 === 0) console.log(`  Progress: ${queried}/${matchIds.size}`);
}

// Phase 3: Collect all player IDs from details
console.log("\nPhase 3: Collecting player IDs...");
const playerIds = new Set();
for (const [mid, data] of Object.entries(detailsData)) {
  if (data.list && typeof data.list === "object") {
    for (const [ts, ev] of Object.entries(data.list)) {
      if (ev.pl_id1) playerIds.add(ev.pl_id1);
    }
  }
}
console.log(`Found ${playerIds.size} unique player IDs`);

// Phase 4: Query each player's data
console.log("\nPhase 4: Querying player data...");
const playerData = {};
let pQueried = 0;
for (const plId of playerIds) {
  const path = `events/${PREFIX}/player/${plId}`;
  const data = await queryFirebase(path);
  if (data && typeof data === "object") {
    playerData[plId] = data;
    console.log(`  ${plId}: ${data.nome || data.name || "(no name)"}`);
  }
  pQueried++;
  if (pQueried % 50 === 0) console.log(`  Players: ${pQueried}/${playerIds.size}`);
}

// Phase 5: Save ALL results
console.log("\nPhase 5: Saving...");
const output = {
  capturedAt: new Date().toISOString(),
  matchCount: matchIds.size,
  playerCount: playerIds.size,
  detailsCaptured: Object.keys(detailsData).length,
  playersCaptured: Object.keys(playerData).length,
  details: detailsData,
  players: playerData,
  teams: autoCapturedData[`events/${PREFIX}/teams`] || null,
  info: autoCapturedData[`events/${PREFIX}/info`] || null,
  m_set: autoCapturedData[`events/${PREFIX}/m_set`] || null,
};

fs.writeFileSync("data/copa-details.json", JSON.stringify(output, null, 2));
console.log(`\nSaved to data/copa-details.json`);
console.log(`Matches: ${output.detailsCaptured}/${matchIds.size}`);
console.log(`Players: ${output.playersCaptured}/${playerIds.size}`);

await browser.close();
