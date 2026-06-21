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
    if (typeof data === "string" && !window.__fbWebSocket && data.includes('"a":"q"')) {
      window.__fbWebSocket = this;
    }
    return origSend.call(this, data);
  };
});

const page = await context.newPage({ viewport: { width: 1920, height: 1080 } });

// We'll capture ALL raw frames and filter by timing
let frameIndex = 0;
const allFrames = [];

page.on("websocket", (ws) => {
  if (!ws.url().includes("firebaseio")) return;
  ws.on("framereceived", (frame) => {
    allFrames.push({ idx: frameIndex++, text: frame.payload || "", time: Date.now() });
  });
});

await page.goto(`https://copafacil.com/${EVENT}@${GROUP}`, {
  waitUntil: "domcontentloaded", timeout: 30000
});
await page.waitForTimeout(25000);

const ready = await page.evaluate(() => !!window.__fbWebSocket);
console.log("WS ready:", ready);
console.log("Total frames so far:", allFrames.length);

async function queryAndCollect(path, timeoutMs = 15000) {
  const r = Date.now() % 100000 + 1000;
  const msg = JSON.stringify({ t: "d", d: { r, a: "q", b: { p: "/" + path, h: "" } } });
  
  const beforeCount = allFrames.length;
  const beforeTime = Date.now();
  
  await page.evaluate((m) => window.__fbWebSocket?.send(m), msg);
  
  // Wait until we get the ack response with our request ID or timeout
  await new Promise(resolve => {
    const check = setInterval(() => {
      for (let i = beforeCount; i < allFrames.length; i++) {
        if (allFrames[i].text.includes(`"r":${r}`)) {
          clearInterval(check);
          resolve();
          return;
        }
      }
      if (Date.now() - beforeTime > timeoutMs) {
        clearInterval(check);
        resolve();
      }
    }, 200);
  });
  
  // Wait a bit more for trailing data frames
  await new Promise(r => setTimeout(r, 2000));
  
  // Collect frames after the query (including after ack)
  const afterFrames = allFrames.filter(f => f.time >= beforeTime);
  
  // Now concatenate all frames SIMPLY
  const full = afterFrames.map(f => f.text).join("");
  
  // Try to parse the reconstructed JSON
  try {
    return JSON.parse(full);
  } catch {
    // Try to find valid JSON by looking for the ack at the end
    const ackIdx = full.lastIndexOf('{"t":"d","d":{"r"');
    if (ackIdx >= 0) {
      // Everything before ack is the data response
      const dataPart = full.substring(0, ackIdx);
      try {
        return JSON.parse(dataPart);
      } catch {
        // Try adding closing braces
        try { return JSON.parse(dataPart + "}}}"); } catch {}
        try { return JSON.parse(dataPart + "}}},"); } catch {}
        try { return JSON.parse(dataPart + '"}}}'); } catch {}
      }
    }
    return null;
  }
}

// Phase 1: Get matchs data
console.log("\nPhase 1: Getting matchs data...");
const matchsResult = await queryAndCollect(`events/${EVENT}/matchs`);

if (!matchsResult) {
  console.log("Failed to parse matchs data. Saving raw frames for analysis...");
  const afterIdx = allFrames.length - 50;
  const recent = allFrames.slice(afterIdx);
  fs.writeFileSync("data/matchs-raw-frames.json", JSON.stringify(recent, null, 2));
  await browser.close();
  process.exit(1);
}

// Extract match data from response
let matchData = matchsResult;
// Check if wrapped in response format
if (matchData.d?.b?.d) matchData = matchData.d.b.d;
else if (matchData.d?.d?.b?.d) matchData = matchData.d.d.b.d;

if (!matchData || typeof matchData !== "object") {
  console.log("Match data format unexpected:", JSON.stringify(matchData).substring(0, 200));
  await browser.close();
  process.exit(1);
}

const allKeys = Object.keys(matchData);
console.log(`Total matches: ${allKeys.length}`);

const groupKeys = allKeys.filter(k => {
  const m = matchData[k];
  return m && typeof m === "object" && m.evt === `${EVENT}@${GROUP}`;
});
console.log(`Group matches (${EVENT}@${GROUP}): ${groupKeys.length}`);

if (groupKeys.length === 0) {
  console.log("No group matches found");
  // Show some sample evt values
  const evts = new Set();
  for (const k of allKeys.slice(0, 20)) {
    if (matchData[k]?.evt) evts.add(matchData[k].evt);
  }
  console.log("Sample evt values:", [...evts].join(", "));
  await browser.close();
  process.exit(1);
}

// Phase 2: Get details for group matches
console.log("\nPhase 2: Getting match details...");
const allDetails = {};

for (let i = 0; i < groupKeys.length; i++) {
  const mk = groupKeys[i];
  const dPath = `events/${EVENT}@${GROUP}/details/${mk}`;
  const dResult = await queryAndCollect(dPath);
  
  if (dResult) {
    let dData = dResult;
    if (dData.d?.b?.d) dData = dData.d.b.d;
    if (dData && typeof dData === "object" && dData.list) {
      allDetails[mk] = dData;
    }
  }
  
  if ((i + 1) % 10 === 0) {
    console.log(`  ${i + 1}/${groupKeys.length} - ${Object.keys(allDetails).length} details found`);
  }
}

console.log(`Details found: ${Object.keys(allDetails).length}/${groupKeys.length}`);

// Phase 3: Get player data
console.log("\nPhase 3: Getting player data...");
const playerIds = new Set();
for (const [mk, data] of Object.entries(allDetails)) {
  if (data.list) {
    for (const [ts, ev] of Object.entries(data.list)) {
      if (ev.pl_id1) playerIds.add(ev.pl_id1);
    }
  }
}
console.log(`Unique player IDs: ${playerIds.size}`);

const playerNames = {};
const pArr = [...playerIds];

for (let i = 0; i < pArr.length; i += 30) {
  const batch = pArr.slice(i, i + 30);
  for (const plId of batch) {
    const pResult = await queryAndCollect(`events/${EVENT}@${GROUP}/player/${plId}`);
    if (pResult) {
      let pData = pResult;
      if (pData.d?.b?.d) pData = pData.d.b.d;
      if (pData && typeof pData === "object") {
        playerNames[plId] = pData.nome || pData.name || pData.num || "(no name)";
      }
    }
  }
  if ((i + 30) % 100 === 0 || i === 0) {
    console.log(`  Players: ${Math.min(i + 30, pArr.length)}/${pArr.length} - ${Object.keys(playerNames).length} names`);
  }
}

console.log(`Players found: ${Object.keys(playerNames).length}/${pArr.length}`);

// Save all
const output = {
  matchCount: groupKeys.length,
  detailsCount: Object.keys(allDetails).length,
  playerCount: Object.keys(playerNames).length,
  matches: matchData,
  details: allDetails,
  players: playerNames,
};

fs.writeFileSync("data/copa-ultimate.json", JSON.stringify(output, null, 2));
const mb = fs.statSync("data/copa-ultimate.json").size / 1024 / 1024;
console.log(`\nSaved data/copa-ultimate.json (${mb.toFixed(1)} MB)`);
console.log("Done!");

await browser.close();
