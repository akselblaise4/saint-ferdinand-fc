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
const allFrames = [];
let frameSeq = 0;

page.on("websocket", (ws) => {
  if (!ws.url().includes("firebaseio")) return;
  ws.on("framereceived", (frame) => {
    allFrames.push({ seq: frameSeq++, text: frame.payload || "", time: Date.now() });
  });
});

await page.goto(`https://copafacil.com/${EVENT}@${GROUP}`, {
  waitUntil: "domcontentloaded", timeout: 30000
});
await page.waitForTimeout(25000);

const ready = await page.evaluate(() => !!window.__fbWebSocket);
console.log("WS ready:", ready, "Frames:", allFrames.length);

// Query a path and collect MULTIPART response
async function queryMultipart(path) {
  const r = Date.now() % 100000 + 20000;
  const msg = JSON.stringify({ t: "d", d: { r, a: "q", b: { p: "/" + path, h: "" } } });
  
  const startIdx = allFrames.length;
  await page.evaluate((m) => window.__fbWebSocket?.send(m), msg);
  
  // Wait for multipart count frame, then all chunks, then ack
  await new Promise(resolve => {
    const check = setInterval(() => {
      for (let i = startIdx; i < allFrames.length; i++) {
        // Look for the ack with our request ID
        if (allFrames[i].text.includes(`"r":${r}`) && allFrames[i].text.includes('"s":"ok"')) {
          clearInterval(check);
          resolve();
          return;
        }
      }
      if (Date.now() - startIdx > 20000) {
        clearInterval(check);
        resolve();
      }
    }, 100);
  });
  
  // Find the multipart sequence in the captured frames
  // Pattern: [maybe count frame] [chunk 1] [chunk 2] ... [ack]
  // Where chunk 1 starts with {"t":"d","d":{"b":{"p":...
  // And the count frame (if present) is just a number string
  
  const newFrames = allFrames.slice(startIdx);
  
  // Find where the data starts - look for first frame with "p":"ourpath"
  let dataStart = -1;
  let dataEnd = -1;
  for (let i = 0; i < newFrames.length; i++) {
    if (newFrames[i].text.includes(`"p":"${path}"`) || newFrames[i].text.includes(`"p":"/${path}"`)) {
      dataStart = i;
    }
    // Find ack
    if (newFrames[i].text.includes('"s":"ok"')) {
      dataEnd = i;
      break;
    }
  }
  
  if (dataStart < 0) {
    // Try just looking for response with request ID
    for (let i = 0; i < newFrames.length; i++) {
      if (newFrames[i].text.includes(`"r":${r}`)) {
        dataEnd = i;
        break;
      }
    }
    // The data might be BEFORE the ack
    // Look backward from ack
    if (dataEnd > 0) {
      for (let i = dataEnd - 1; i >= 0; i--) {
        if (newFrames[i].text.includes('{"t":"d","d":{"b":{"p"')) {
          dataStart = i;
          break;
        }
      }
    }
  }
  
  if (dataStart < 0) {
    console.log("Could not find data start for", path);
    return null;
  }
  
  // The data frames are from dataStart to dataEnd (exclusive)
  const dataFrames = newFrames.slice(dataStart, dataEnd > 0 ? dataEnd : undefined);
  
  if (dataFrames.length === 0) return null;
  
  // Concatenate all data frames
  const concatenated = dataFrames.map(f => f.text).join("");
  
  // Try to parse
  try {
    return JSON.parse(concatenated);
  } catch {
    // The concatenation might have the JSON wrapper broken at chunk boundaries
    // Try more sophisticated reconstruction
    try {
      // Strategy: re-wrap the data as a proper JSON
      // Frame 1: {"t":"d","d":{"b":{"p":"path","d": DATA_FRAGMENT_1
      // Frame 2..N: DATA_FRAGMENT_2..N  
      // (no wrapper, just raw continuation)
      
      // So the full data = everything from data frames concatenated
      // The first frame has the complete JSON prefix
      // The rest are just raw continuations
      
      // Let's try to find the structure boundaries
      const combined = concatenated;
      
      // Find the position where the actual data value starts
      // It's at `"d":` followed by `{` or `[`
      const dMatch = combined.match(/("d"\s*:\s*)([{\[])/);
      if (dMatch) {
        const prefixEnd = dMatch.index + dMatch[1].length;
        const dataStartChar = dMatch[2];
        const dataEndChar = dataStartChar === "{" ? "}" : "]";
        
        // The data value starts at prefixEnd
        // We need to figure out where it ends
        // Try progressively adding closing characters
        let depth = 0;
        let inString = false;
        let escape = false;
        let dataEndPos = -1;
        
        for (let i = prefixEnd; i < combined.length; i++) {
          const c = combined[i];
          if (escape) { escape = false; continue; }
          if (c === "\\" && inString) { escape = true; continue; }
          if (c === '"') { inString = !inString; continue; }
          if (inString) continue;
          if (c === dataStartChar) depth++;
          if (c === dataEndChar) { depth--; if (depth === 0) { dataEndPos = i; break; } }
        }
        
        if (dataEndPos > 0) {
          const fullDataValue = combined.substring(prefixEnd, dataEndPos + 1);
          // Now rebuild the full JSON
          const newJson = combined.substring(0, prefixEnd) + fullDataValue + '},"a":"d"}}';
          return JSON.parse(newJson);
        }
      }
    } catch {}
    
    // Final attempt: just try wrapping with various closings
    const attempts = [
      '}},"a":"d"}}',
      '"}}',
      "}}",
      ',"a":"d"}}',
    ];
    for (const suffix of attempts) {
      try {
        return JSON.parse(concatenated + suffix);
      } catch {}
      try {
        // Remove trailing whitespace/non-JSON and add suffix
        const cleaned = concatenated.replace(/[^}"]*$/, "") + suffix;
        return JSON.parse(cleaned);
      } catch {}
    }
    
    return null;
  }
}

// Phase 1: Get matchs
console.log("\nPhase 1: Getting matchs...");
const matchsResp = await queryMultipart(`events/${EVENT}/matchs`);

if (!matchsResp) {
  console.log("Failed to get matchs");
  // Save last 30 frames for analysis
  fs.writeFileSync("data/debug-frames.json", JSON.stringify(allFrames.slice(-30), null, 2));
  await browser.close();
  process.exit(1);
}

let matchData = matchsResp;
// Navigate through response wrappers
while (matchData && typeof matchData === "object" && matchData.d?.b?.d) {
  matchData = matchData.d.b.d;
}
// Also handle case where data is nested differently
if (matchData && typeof matchData === "object" && matchData.b?.d && typeof matchData.b.d === "object") {
  matchData = matchData.b.d;
}

if (!matchData || typeof matchData !== "object") {
  console.log("Unexpected match data structure:", JSON.stringify(matchData).substring(0, 200));
  await browser.close();
  process.exit(1);
}

const allKeys = Object.keys(matchData);
const groupKeys = allKeys.filter(k => {
  const m = matchData[k];
  return m && typeof m === "object" && m.evt === `${EVENT}@${GROUP}`;
});
console.log(`Total: ${allKeys.length}, Group: ${groupKeys.length}`);

if (groupKeys.length === 0) {
  console.log("No group matches found");
  await browser.close();
  process.exit(1);
}

// Phase 2: Details
console.log("Phase 2: Getting details...");
const allDetails = {};

for (let i = 0; i < groupKeys.length; i++) {
  const mk = groupKeys[i];
  const dResp = await queryMultipart(`events/${EVENT}@${GROUP}/details/${mk}`);
  if (dResp) {
    let dData = dResp;
    while (dData && typeof dData === "object" && dData.d?.b?.d) dData = dData.d.b.d;
    if (dData?.b?.d && typeof dData.b.d === "object") dData = dData.b.d;
    
    if (dData && typeof dData === "object" && dData.list) {
      allDetails[mk] = dData;
    }
  }
  if ((i + 1) % 10 === 0) {
    console.log(`  ${i+1}/${groupKeys.length} - ${Object.keys(allDetails).length} details`);
  }
}
console.log(`Details: ${Object.keys(allDetails).length}/${groupKeys.length}`);

// Phase 3: Player data
console.log("Phase 3: Getting players...");
const playerIds = new Set();
for (const [mk, data] of Object.entries(allDetails)) {
  if (data.list) {
    for (const [ts, ev] of Object.entries(data.list)) {
      if (ev.pl_id1) playerIds.add(ev.pl_id1);
    }
  }
}
console.log(`Player IDs: ${playerIds.size}`);

const playerNames = {};
const pArr = [...playerIds];

for (let i = 0; i < pArr.length; i += 30) {
  for (const plId of pArr.slice(i, i + 30)) {
    const pResp = await queryMultipart(`events/${EVENT}@${GROUP}/player/${plId}`);
    if (pResp) {
      let pData = pResp;
      while (pData && typeof pData === "object" && pData.d?.b?.d) pData = pData.d.b.d;
      if (pData?.b?.d && typeof pData.b.d === "object") pData = pData.b.d;
      if (pData && typeof pData === "object") {
        playerNames[plId] = pData.nome || pData.name || pData.num || "(no name)";
      }
    }
  }
  if ((i + 30) % 100 === 0) {
    console.log(`  Players: ${Math.min(i+30, pArr.length)}/${pArr.length} - ${Object.keys(playerNames).length} names`);
  }
}
console.log(`Players: ${Object.keys(playerNames).length}/${pArr.length}`);

// Save
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

await browser.close();
