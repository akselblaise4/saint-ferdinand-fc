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

await page.goto(`https://copafacil.com/${EVENT}@${GROUP}`, { waitUntil: "domcontentloaded", timeout: 30000 });
await page.waitForTimeout(25000);

const ready = await page.evaluate(() => !!window.__fbWebSocket);
console.log("WS ready:", ready, "Frames:", allFrames.length);

// Send a query and analyze what comes back
const r = 99999;
const path = `events/${EVENT}/matchs`;
const msg = JSON.stringify({ t: "d", d: { r, a: "q", b: { p: "/" + path, h: "" } } });
console.log("Sending query for:", path);

const startIdx = allFrames.length;
await page.evaluate((m) => window.__fbWebSocket?.send(m), msg);

// Wait for 5 seconds
await page.waitForTimeout(5000);

const newFrames = allFrames.slice(startIdx);
console.log("\nNew frames after query:", newFrames.length);

for (let i = 0; i < newFrames.length; i++) {
  const f = newFrames[i];
  const preview = f.text.length > 150 ? f.text.substring(0, 150) + "..." : f.text;
  console.log(`[${i}] seq=${f.seq} len=${f.text.length}: ${preview}`);
}

// Now try to reconstruct by finding the start of the multipart response
// Look for the first frame with {"t":"d","d":{"b":{"p":
for (let i = 0; i < newFrames.length; i++) {
  if (newFrames[i].text.startsWith('{"t":"d","d":{"b":{"p"')) {
    console.log(`\nMultipart start at frame ${i}, seq=${newFrames[i].seq}`);
    console.log("Full text (first 500):", newFrames[i].text.substring(0, 500));
    
    // Collect all subsequent data frames until we hit the ack
    let parts = [newFrames[i].text];
    for (let j = i + 1; j < newFrames.length; j++) {
      const text = newFrames[j].text;
      if (text.includes('"s":"ok"') && text.includes('"r"')) {
        console.log(`Ack at frame ${j}`);
        break;
      }
      parts.push(text);
    }
    
    const combined = parts.join("");
    console.log("\nCombined length:", combined.length);
    
    // Try to parse
    try {
      const parsed = JSON.parse(combined);
      console.log("Parsed successfully!");
      const data = parsed?.d?.b?.d;
      if (data && typeof data === "object") {
        console.log("Match keys:", Object.keys(data).length);
        const groupKeys = Object.keys(data).filter(k => {
          const m = data[k];
          return m && typeof m === "object" && m.evt === `${EVENT}@${GROUP}`;
        });
        console.log("Group keys:", groupKeys.length);
        if (groupKeys.length > 0) {
          console.log("Sample:", groupKeys[0]);
        }
      }
    } catch(e) {
      console.log("Parse error:", e.message);
      // Try finding the JSON boundaries
      // The combined text has format:
      // {"t":"d","d":{"b":{"p":"path","d":DATA_DATA_DATA},"a":"d"}}
      // But wait - maybe the },"a":"d"}} is at the end and we need to close earlier
      
      // Find the last "a":"d"}}
      const aEnd = combined.lastIndexOf('"a":"d"');
      if (aEnd > 0) {
        console.log("Found 'a':'d' at position", aEnd);
        const trunc = combined.substring(0, aEnd + 8) + "}";
        try {
          const parsed = JSON.parse(trunc);
          console.log("Truncated parse succeeded!");
          const data = parsed?.d?.b?.d;
          console.log("Data type:", typeof data, data ? Object.keys(data).length : "null");
        } catch(e2) {
          console.log("Truncated parse error:", e2.message);
        }
      }
    }
    break;
  }
}

await browser.close();
