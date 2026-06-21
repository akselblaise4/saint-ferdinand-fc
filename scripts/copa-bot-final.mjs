import { chromium } from "playwright";
import fs from "fs";

const EVENT = "-5qp1c";
const GROUP = "5jvbh";

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();

// Patch WebSocket to capture Firebase instance for sending messages
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

let wsSendFn = null;

// Capture the FIRST WebSocket connection to Firebase
page.on("websocket", (ws) => {
  if (!ws.url().includes("firebaseio")) return;
  if (wsSendFn) return;
  
  console.log("Firebase WS URL:", ws.url().substring(0, 120));
  const wsUrl = ws.url();
  
  wsSendFn = async (path) => {
    const r = Date.now() % 100000 + 10000;
    const msg = JSON.stringify({ t: "d", d: { r, a: "q", b: { p: "/" + path, h: "" } } });
    
    return new Promise((resolve) => {
      let chunks = [];
      let collecting = false;
      let currentPath = null;
      let gotAck = false;
      
      const handler = (frame) => {
        const text = frame.payload || "";
        
        // Ack response with our request ID
        if (text.includes(`"r":${r}`)) {
          gotAck = true;
          if (collecting && !text.includes('"b":{"s":"ok","d":{}}')) {
            chunks.push(text);
          }
          return;
        }
        
        if (gotAck && text.includes('"s":"ok"')) {
          // This might be the ack itself or a subsequent ack
          return;
        }
        
        // After ack, all data frames are part of the response
        if (gotAck && !collecting) {
          // First data frame after ack - check for path
          const m = text.match(/"p":"([^"]+)"/);
          if (m) {
            currentPath = m[1];
            collecting = true;
            chunks = [text];
          }
        } else if (collecting) {
          chunks.push(text);
        }
      };
      
      ws.on("framereceived", handler);
      
      // Send via page.evaluate
      page.evaluate((m) => {
        // Find the Firebase WebSocket by iterating through page objects
        // The WebSocket was patched in initScript
        if (window.__fbWebSocket && window.__fbWebSocket.readyState === WebSocket.OPEN) {
          window.__fbWebSocket.send(m);
        }
      }, msg).catch(() => {});
      
      // Timeout after 20s
      setTimeout(() => {
        ws.removeListener("framereceived", handler);
        if (collecting) {
          resolve({ path: currentPath, chunks });
        } else {
          resolve(null);
        }
      }, 20000);
    });
  };
});

page.on("websocket", (ws) => {
  if (!ws.url().includes("firebaseio") || wsSendFn) return;
  // Fallback: if first WS didn't work, use this one
  // (But we already handle it above)
});

await page.goto(`https://copafacil.com/${EVENT}@${GROUP}`, { waitUntil: "domcontentloaded", timeout: 30000 });
await page.waitForTimeout(20000);

if (!wsSendFn) {
  console.log("No WebSocket captured");
  await browser.close();
  process.exit(1);
}

console.log("WS captured, querying matchs...");
const result = await wsSendFn(`events/${EVENT}/matchs`);

if (result && result.chunks.length > 0) {
  console.log(`Matchs response: ${result.chunks.length} chunks, path: ${result.path}`);
  console.log("Chunk 1:", result.chunks[0].substring(0, 200));
  
  // Reconstruct: all chunks together form the full JSON
  const fullText = result.chunks.join("");
  
  // Parse the reconstructed JSON
  try {
    const parsed = JSON.parse(fullText);
    const matchData = parsed?.d?.b?.d;
    
    if (matchData && typeof matchData === "object") {
      const keys = Object.keys(matchData);
      console.log(`\n✅ Parsed! ${keys.length} matches`);
      
      const groupKeys = keys.filter(k => {
        const m = matchData[k];
        return m && m.evt === `${EVENT}@${GROUP}`;
      });
      console.log(`Group matches: ${groupKeys.length}`);
      
      // Save match data
      fs.writeFileSync("data/matchs-full.json", JSON.stringify(matchData, null, 2));
      
      // Now query details for all group matches
      console.log("\nQuerying details for all group matches...");
      const allDetails = {};
      
      for (let i = 0; i < groupKeys.length; i++) {
        const mk = groupKeys[i];
        const dResult = await wsSendFn(`events/${EVENT}@${GROUP}/details/${mk}`);
        
        if (dResult && dResult.chunks.length > 0) {
          const dText = dResult.chunks.join("");
          try {
            const dParsed = JSON.parse(dText);
            const dData = dParsed?.d?.b?.d;
            if (dData && typeof dData === "object" && dData.list) {
              allDetails[mk] = dData;
            }
          } catch {}
        }
        
        if ((i + 1) % 5 === 0) {
          console.log(`  ${i + 1}/${groupKeys.length} - ${Object.keys(allDetails).length} details found`);
        }
      }
      
      console.log(`\nDetails found: ${Object.keys(allDetails).length}/${groupKeys.length}`);
      
      // Collect player IDs
      const playerIds = new Set();
      for (const [mk, data] of Object.entries(allDetails)) {
        if (data.list) {
          for (const [ts, ev] of Object.entries(data.list)) {
            if (ev.pl_id1) playerIds.add(ev.pl_id1);
          }
        }
      }
      console.log(`Player IDs: ${playerIds.size}`);
      
      // Query player data
      console.log("Querying player data...");
      const playerNames = {};
      const pArr = [...playerIds];
      
      for (let i = 0; i < pArr.length; i += 20) {
        const batch = pArr.slice(i, i + 20);
        for (const plId of batch) {
          const pResult = await wsSendFn(`events/${EVENT}@${GROUP}/player/${plId}`);
          if (pResult && pResult.chunks.length > 0) {
            const pText = pResult.chunks.join("");
            try {
              const pParsed = JSON.parse(pText);
              const pData = pParsed?.d?.b?.d;
              if (pData && typeof pData === "object") {
                playerNames[plId] = pData.nome || pData.name || pData.num || "(no name)";
              }
            } catch {}
          }
        }
        if ((i + 20) % 100 === 0) {
          console.log(`  Players: ${Math.min(i + 20, pArr.length)}/${pArr.length} - ${Object.keys(playerNames).length} found`);
        }
      }
      
      console.log(`Players found: ${Object.keys(playerNames).length}/${pArr.length}`);
      
      // Save everything
      const output = {
        matchCount: groupKeys.length,
        detailsCount: Object.keys(allDetails).length,
        playerCount: Object.keys(playerNames).length,
        details: allDetails,
        players: playerNames,
      };
      
      fs.writeFileSync("data/copa-all.json", JSON.stringify(output, null, 2));
      const size = fs.statSync("data/copa-all.json").size;
      console.log(`\nSaved data/copa-all.json (${(size / 1024 / 1024).toFixed(1)} MB)`);
    }
  } catch (e) {
    console.log("Parse error:", e.message);
    // Save raw for debugging
    fs.writeFileSync("data/matchs-raw-chunks.txt", result.chunks.join("\n---CHUNK---\n"));
  }
} else {
  console.log("No matchs response");
}

await browser.close();
