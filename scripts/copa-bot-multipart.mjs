import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");

const EVENT = "-5qp1c";
const GROUP = "5jvbh";

console.log("CWD:", process.cwd());
console.log("DATA_DIR:", DATA_DIR);
console.log("DATA_DIR exists:", fs.existsSync(DATA_DIR));
// Ensure data dir exists
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

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
const allFrames = [];
let frameSeq = 0;

page.on("websocket", (ws) => {
  if (!ws.url().includes("firebaseio")) return;
  ws.on("framereceived", (frame) => {
    allFrames.push({ seq: frameSeq++, text: frame.payload || "", time: Date.now() });
  });
});

await page.goto(`https://copafacil.com/${EVENT}@${GROUP}`, { waitUntil: "domcontentloaded", timeout: 30000 });
await page.waitForTimeout(25000);

const ready = await page.evaluate(() => !!window.__fbWebSocket);
if (!ready) { console.log("WS not ready"); await browser.close(); process.exit(1); }
console.log(`Ready. ${allFrames.length} frames captured.`);

async function firebaseQuery(path) {
  const r = Date.now() % 1000000 + 100000;
  const msg = JSON.stringify({ t: "d", d: { r, a: "q", b: { p: "/" + path, h: "" } } });
  const startIdx = allFrames.length;

  await page.evaluate((m) => window.__fbWebSocket?.send(m), msg);

  // Wait dynamically - check every 50ms until ack arrives
  const startTime = Date.now();
  const maxWait = path.includes("matchs") ? 15000 : path.includes("details") ? 3000 : 2000;
  await new Promise(resolve => {
    const check = setInterval(() => {
      for (let i = startIdx; i < allFrames.length; i++) {
        if (allFrames[i].text.includes(`"r":${r}`) || allFrames[i].text.includes('"s":"ok"')) {
          clearInterval(check);
          resolve();
          return;
        }
      }
      if (Date.now() - startTime > maxWait) {
        clearInterval(check);
        resolve();
      }
    }, 50);
  });
  // Small extra wait for trailing data frames
  await new Promise(r => setTimeout(r, 200));

  const newFrames = allFrames.slice(startIdx);
  let dataStart = -1;
  let ackIdx = -1;

  for (let i = 0; i < newFrames.length; i++) {
    if (newFrames[i].text.includes(`"p":"${path}"`)) {
      if (dataStart < 0) dataStart = i;
    }
    if (newFrames[i].text.includes('"s":"ok"') && ackIdx < 0) {
      ackIdx = i;
    }
  }

  if (dataStart < 0 || ackIdx < 0) return null;

  const parts = [];
  for (let i = dataStart; i < ackIdx; i++) {
    parts.push(newFrames[i].text);
  }
  const combined = parts.join("");

  try {
    const parsed = JSON.parse(combined);
    let data = parsed;
    while (data?.d?.b?.d) data = data.d.b.d;
    if (data?.b?.d && typeof data.b.d === "object") data = data.b.d;
    return data;
  } catch {
    return null;
  }
}

// Phase 1: Matchs
console.log("Phase 1: Matchs...");
const matchData = await firebaseQuery(`events/${EVENT}/matchs`);
if (!matchData || typeof matchData !== "object") {
  console.log("Failed to get matchs"); await browser.close(); process.exit(1);
}

const allKeys = Object.keys(matchData);
const groupKeys = allKeys.filter(k => matchData[k]?.evt === `${EVENT}@${GROUP}`);
console.log(`  Total: ${allKeys.length}, Group: ${groupKeys.length}`);

// Phase 2: Details
console.log("Phase 2: Match details...");
const allDetails = {};
for (let i = 0; i < groupKeys.length; i++) {
  const mk = groupKeys[i];
  const dData = await firebaseQuery(`events/${EVENT}@${GROUP}/details/${mk}`);
  if (dData?.list) allDetails[mk] = dData;
  if ((i + 1) % 20 === 0) console.log(`  ${i + 1}/${groupKeys.length} - ${Object.keys(allDetails).length} details`);
}
console.log(`  Details: ${Object.keys(allDetails).length}/${groupKeys.length}`);

// Save intermediate details
fs.writeFileSync(path.join(DATA_DIR, "copa-details-only.json"), JSON.stringify(allDetails, null, 2));
console.log("  (Saved intermediate details)");

// Phase 3: Players
console.log("Phase 3: Players...");
const playerIds = new Set();
for (const [mk, data] of Object.entries(allDetails)) {
  if (data.list) {
    for (const ev of Object.values(data.list)) {
      if (ev.pl_id1) playerIds.add(ev.pl_id1);
    }
  }
}
console.log(`  Player IDs: ${playerIds.size}`);

const playerNames = {};
const pArr = [...playerIds];
for (let i = 0; i < pArr.length; i += 30) {
  for (const plId of pArr.slice(i, i + 30)) {
    const pData = await firebaseQuery(`events/${EVENT}@${GROUP}/player/${plId}`);
    if (pData) playerNames[plId] = pData.nome || pData.name || "(no name)";
  }
  if ((i + 30) % 150 === 0) {
    console.log(`  Players: ${Math.min(i + 30, pArr.length)}/${pArr.length} - ${Object.keys(playerNames).length} names`);
    // Save intermediate
    fs.writeFileSync(path.join(DATA_DIR, "copa-players-temp.json"), JSON.stringify(playerNames, null, 2));
  }
}
console.log(`  Players: ${Object.keys(playerNames).length}/${pArr.length}`);

// Save
const output = { matchCount: groupKeys.length, detailsCaptured: Object.keys(allDetails).length, playerNames: Object.keys(playerNames).length, details: allDetails, players: playerNames };
const outPath = path.join(DATA_DIR, "copa-all-data.json");
fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
const mb = fs.statSync(outPath).size / 1024 / 1024;
console.log(`\nSaved ${outPath} (${mb.toFixed(1)} MB)`);

await browser.close();
