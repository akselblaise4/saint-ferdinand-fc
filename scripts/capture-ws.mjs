import { chromium } from "playwright";
import fs from "fs";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  const wsFrames = [];

  page.on("websocket", ws => {
    const url = ws.url();
    if (url.includes("firebaseio.com")) {
      console.log("\n=== FIREBASE WS CONNECTED ===");
      console.log(`URL: ${url.substring(0, 300)}`);
      wsFrames.push({ event: "connect", url });
      
      ws.on("framesent", frame => {
        try {
          // Firebase RTDB wire protocol uses JSON-like tokens
          wsFrames.push({ dir: "SENT", data: frame.payload.substring(0, 500) });
        } catch (e) {}
      });
      ws.on("framereceived", frame => {
        try {
          wsFrames.push({ dir: "RECV", data: frame.payload.substring(0, 500) });
        } catch (e) {}
      });
    }
  });

  console.log("Loading Copa Fácil...");
  await page.goto("https://copafacil.com/-5qp1c@5jvbh", {
    waitUntil: "domcontentloaded",
    timeout: 20000,
  });
  console.log("Waiting for Flutter + Firebase...");
  await page.waitForTimeout(15000);

  console.log(`\n=== WS FRAMES: ${wsFrames.length} ===`);
  wsFrames.forEach((f, i) => {
    if (f.event === "connect") {
      console.log(`\n[CONNECT] ${f.url}`);
    } else {
      console.log(`\n[${f.dir}] ${f.data.substring(0, 400)}`);
    }
  });

  // Try to read Firebase auth state
  const firebaseState = await page.evaluate(async () => {
    const result = {};
    // Check all IndexedDB databases
    try {
      const dbs = await indexedDB.databases();
      result.databases = dbs.map(d => d.name);
    } catch (e) {
      result.idbError = e.message;
    }
    // Check localStorage for Firebase tokens
    result.localStorage = {};
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key) {
        result.localStorage[key] = window.localStorage.getItem(key).substring(0, 100);
      }
    }
    // Check sessionStorage
    result.sessionStorage = {};
    for (let i = 0; i < window.sessionStorage.length; i++) {
      const key = window.sessionStorage.key(i);
      if (key) {
        result.sessionStorage[key] = window.sessionStorage.getItem(key).substring(0, 100);
      }
    }
    return result;
  });

  console.log("\n=== BROWSER STORAGE ===");
  console.log(JSON.stringify(firebaseState, null, 2));

  await browser.close();
  
  fs.writeFileSync("data/ws-frames.json", JSON.stringify(wsFrames, null, 2));
  console.log("\nSaved WS frames.");
}

main().catch(console.error);
