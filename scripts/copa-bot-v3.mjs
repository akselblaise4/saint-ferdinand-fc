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

// Track all responses with path + data
const responseData = {};

page.on("websocket", (ws) => {
  if (!ws.url().includes("firebaseio")) return;
  ws.on("framereceived", (frame) => {
    const text = frame.payload || "";
    if (text.length < 30) return;
    try {
      const parsed = JSON.parse(text);
      const p = parsed?.d?.b?.p;
      const d = parsed?.d?.b?.d;
      if (p && d !== undefined) {
        responseData[p] = d;
      }
    } catch {}
  });
});

await page.goto(`https://copafacil.com/${EVENT}@${GROUP}`, { waitUntil: "domcontentloaded", timeout: 30000 });
await page.waitForTimeout(25000);

// Check if WS is ready
const ready = await page.evaluate(() => !!window.__fbWebSocket);
if (!ready) { console.log("WS not ready"); await browser.close(); process.exit(1); }
console.log("WS ready, auto-captured paths:", Object.keys(responseData).length);

// Send a query via page.evaluate
async function query(path) {
  const r = Date.now() % 100000 + 1;
  const msg = JSON.stringify({ t: "d", d: { r, a: "q", b: { p: "/" + path, h: "" } } });
  await page.evaluate((m) => window.__fbWebSocket?.send(m), msg);
}

// First get matchs
console.log("Querying matchs...");
await query(`events/${EVENT}/matchs`);
await page.waitForTimeout(8000);

// Check if matchs data arrived
const matchsPath = `events/${EVENT}/matchs`;
let matchsData = responseData[matchsPath];
console.log("Matchs in responseData:", matchsData ? "loaded" : "not found");

// If not, try alternative path format
if (!matchsData) {
  // Check all paths for match data
  for (const [p, d] of Object.entries(responseData)) {
    if (p.includes("matchs") && typeof d === "object" && Object.keys(d).length > 0) {
      console.log("Found matchs at:", p);
      matchsData = d;
      break;
    }
  }
}

if (!matchsData) {
  console.log("Could not find matchs data");
  console.log("All paths:", Object.keys(responseData).sort().join(", "));
  await browser.close();
  process.exit(1);
}

const matchKeys = Object.keys(matchsData);
console.log(`Total matchs: ${matchKeys.length}`);

// Filter for our group's matches
const groupMatches = matchKeys.filter(k => {
  const m = matchsData[k];
  return m && typeof m === "object" && m.evt === `${EVENT}@${GROUP}`;
});
console.log(`Group matches: ${groupMatches.length}`);

// Now query details for each group match
console.log("Querying match details...");
const detailsFound = {};

for (let i = 0; i < groupMatches.length; i++) {
  const mk = groupMatches[i];
  const dPath = `events/${EVENT}@${GROUP}/details/${mk}`;
  
  await query(dPath);
  await page.waitForTimeout(1500);
  
  // Check if data arrived
  const data = responseData[dPath];
  if (data && typeof data === "object" && data.list) {
    detailsFound[mk] = {
      eventCount: Object.keys(data.list).length,
      info: data.info,
      best: data.best,
    };
  }
  
  if ((i + 1) % 5 === 0) {
    console.log(`  ${i + 1}/${groupMatches.length} - found ${Object.keys(detailsFound).length} with data`);
  }
}

console.log(`\nDetails found: ${Object.keys(detailsFound).length}/${groupMatches.length}`);

// Now get all player IDs and query player data
const allPlayerIds = new Set();
for (const [mk, details] of Object.entries(detailsFound)) {
  const dPath = `events/${EVENT}@${GROUP}/details/${mk}`;
  const data = responseData[dPath];
  if (data?.list) {
    for (const [ts, ev] of Object.entries(data.list)) {
      if (ev.pl_id1) allPlayerIds.add(ev.pl_id1);
    }
  }
}
console.log(`\nUnique player IDs: ${allPlayerIds.size}`);

// Query player data in batches
console.log("Querying player data...");
const playerNames = {};
const playerIdsArr = [...allPlayerIds];
const BATCH_SIZE = 20;

for (let i = 0; i < playerIdsArr.length; i += BATCH_SIZE) {
  const batch = playerIdsArr.slice(i, i + BATCH_SIZE);
  for (const plId of batch) {
    await query(`events/${EVENT}@${GROUP}/player/${plId}`);
  }
  await page.waitForTimeout(3000);
  
  // Check results
  let found = 0;
  for (const plId of batch) {
    const plData = responseData[`events/${EVENT}@${GROUP}/player/${plId}`];
    if (plData && typeof plData === "object") {
      playerNames[plId] = plData.nome || plData.name || plData.num || "(no name)";
      found++;
    }
  }
  
  if ((i + BATCH_SIZE) % 100 === 0 || i === 0) {
    console.log(`  Players: ${Math.min(i + BATCH_SIZE, playerIdsArr.length)}/${playerIdsArr.length} - found ${Object.keys(playerNames).length} names`);
  }
}

// Now build the complete output
const output = {
  capturedAt: new Date().toISOString(),
  matchCount: groupMatches.length,
  playerCount: allPlayerIds.size,
  detailsCount: Object.keys(detailsFound).length,
  playerNamesCount: Object.keys(playerNames).length,
  matchs: matchsData,
  details: {},
  players: playerNames,
  teams: responseData[`events/${EVENT}@${GROUP}/teams`] || null,
  info: responseData[`events/${EVENT}@${GROUP}/info`] || null,
  m_set: responseData[`events/${EVENT}@${GROUP}/m_set`] || null,
};

// Add full detail data
for (const mk of Object.keys(detailsFound)) {
  const dPath = `events/${EVENT}@${GROUP}/details/${mk}`;
  output.details[mk] = responseData[dPath];
}

fs.writeFileSync("data/copa-complete.json", JSON.stringify(output, null, 2));
const size = fs.statSync("data/copa-complete.json").size;
console.log(`\nSaved data/copa-complete.json (${(size / 1024 / 1024).toFixed(1)} MB)`);
console.log(`Groups paths captured: ${Object.keys(responseData).length}`);

await browser.close();
