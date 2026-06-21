import { chromium } from "playwright";
import fs from "fs";

const EVENT = "-5qp1c";
const GROUP = "5jvbh";
const PREFIX = `${EVENT}@${GROUP}`;

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();

await context.addInitScript(() => {
  const NativeWebSocket = window.WebSocket;
  const origSend = NativeWebSocket.prototype.send;
  NativeWebSocket.prototype.send = function(data) {
    if (typeof data === "string" && !window.__fbWebSocket && data.length > 20 && data.includes('"a":"q"')) {
      window.__fbWebSocket = this;
    }
    return origSend.call(this, data);
  };
});

const page = await context.newPage({ viewport: { width: 1920, height: 1080 } });

const allResponses = [];
const autoCapturedData = {};

page.on("websocket", (ws) => {
  if (!ws.url().includes("firebaseio")) return;
  ws.on("framereceived", (frame) => {
    const text = frame.payload || "";
    if (text.length > 30) {
      allResponses.push(text);
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
  waitUntil: "domcontentloaded", timeout: 30000
});

console.log("Waiting for Flutter init...");
await page.waitForTimeout(25000);

console.log("=== Auto-captured data paths ===");
for (const p of Object.keys(autoCapturedData).sort()) {
  const d = autoCapturedData[p];
  console.log(`  ${p}: ${typeof d} ${typeof d === "object" ? Object.keys(d).length + " keys" : d}`);
}

// Now let's try the query approach more carefully
const hasWs = await page.evaluate(() => !!window.__fbWebSocket);
console.log("\nFirebase WS:", hasWs ? "captured" : "NOT captured");

// Send query for matchs data and monitor response
const r = 9999;
const msg = JSON.stringify({ t: "d", d: { r, a: "q", b: { p: `/events/${EVENT}/matchs`, h: "" } } });
console.log("Sending:", msg);

const beforeCount = allResponses.length;
await page.evaluate((m) => {
  if (window.__fbWebSocket && window.__fbWebSocket.readyState === 1) {
    window.__fbWebSocket.send(m);
    return "sent";
  }
  return "not sent (ws not ready)";
}, msg);

console.log("Waiting for response...");
await page.waitForTimeout(10000);

const newResponses = allResponses.slice(beforeCount);
console.log(`\nNew responses: ${newResponses.length}`);
for (const r of newResponses) {
  console.log("  " + r.substring(0, 500));
}

// Check if matchs data is in auto-captured
const matchsPath = `events/${EVENT}/matchs`;
if (autoCapturedData[matchsPath]) {
  const md = autoCapturedData[matchsPath];
  if (typeof md === "object") {
    const matchIds = [];
    for (const [k, v] of Object.entries(md)) {
      if (v && typeof v === "object" && v.dt) matchIds.push(v.dt);
    }
    console.log(`\nFound ${matchIds.length} matches in auto-captured data!`);
    console.log("First 5:", matchIds.slice(0, 5));
    
    // Now query details for these matches
    console.log("\nQuerying details for first 3 matches...");
    for (const mid of matchIds.slice(0, 3)) {
      const path = `events/${PREFIX}/details/${mid}`;
      const dmsg = JSON.stringify({ t: "d", d: { r: mid % 10000, a: "q", b: { p: "/" + path, h: "" } } });
      const b4 = allResponses.length;
      await page.evaluate((m) => window.__fbWebSocket?.send(m), dmsg);
      await page.waitForTimeout(3000);
      
      for (let j = b4; j < allResponses.length; j++) {
        try {
          const parsed = JSON.parse(allResponses[j]);
          if (parsed?.d?.b?.p === path) {
            const evData = parsed.d.b.d;
            const evCount = evData?.list ? Object.keys(evData.list).length : 0;
            console.log(`  ${mid}: ${evCount} events - ${JSON.stringify(evData).substring(0, 200)}`);
          }
        } catch {}
      }
    }
  }
}

await browser.close();
