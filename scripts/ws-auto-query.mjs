import { chromium } from "playwright";
import fs from "fs";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

const EVENT_ID = "-5qp1c";
const GROUP_ID = "5jvbh";
const PREFIX = `${EVENT_ID}@${GROUP_ID}`;

const capturedResponses = {};
let wsReady = false;

page.on("websocket", (ws) => {
  if (!ws.url().includes("firebaseio")) return;
  console.log("WS connected:", ws.url().substring(0, 80));

  // Track all responses
  ws.on("framereceived", (frame) => {
    const text = frame.payload || "";
    try {
      const parsed = JSON.parse(text);
      if (parsed?.d?.b?.p && parsed?.d?.b?.d) {
        capturedResponses[parsed.d.b.p] = parsed.d.b.d;
      }
    } catch {}
  });

  // Once connected, mark ready
  ws.on("open", () => { wsReady = true; });
});

await page.goto(`https://copafacil.com/${EVENT_ID}@${GROUP_ID}`, {
  waitUntil: "domcontentloaded",
  timeout: 30000,
});

console.log("Waiting for Flutter app to initialize (30s)...");
await page.waitForTimeout(30000);
console.log(`Captured ${Object.keys(capturedResponses).length} responses so far`);

// Now query specific player paths via the WebSocket
// We need to find player IDs from the match data in existing matchs
const matchsData = capturedResponses[`events/${EVENT_ID}/matchs`];
let matchIds = [];
if (matchsData && typeof matchsData === "object") {
  matchIds = Object.keys(matchsData);
  console.log(`Found ${matchIds.length} matches`);
}

// We also need to query the m_set and results for group-specific data
// Let's query the group paths we need
const neededPaths = [
  `events/${PREFIX}/m_set`,
  `events/${PREFIX}/results`,
  `events/${PREFIX}/table_itens`,
  `events/${PREFIX}/name_groups`,
  `events/${PREFIX}/p_e`,
  `events/${PREFIX}/staff`,
  `events/${PREFIX}/form`,
  `events/${PREFIX}/fs`,
];

// Also query match details for each match
for (const mid of matchIds.slice(0, 30)) {
  neededPaths.push(`events/${PREFIX}/details/${mid}`);
}

// Now use page.evaluate to send Firebase queries over the WebSocket
// We access the WebSocket from the page context and send a Firebase "q" (query) message
console.log(`Sending ${neededPaths.length} queries...`);

let queryId = 100;
const responseData = {};
const pendingQueries = new Map();

// Listen for more responses on the page-level WebSocket
page.on("websocket", (ws) => {
  if (!ws.url().includes("firebaseio")) return;
  ws.on("framereceived", (frame) => {
    const text = frame.payload || "";
    try {
      const parsed = JSON.parse(text);
      if (parsed?.d?.b?.p && parsed?.d?.b?.d) {
        responseData[parsed.d.b.p] = parsed.d.b.d;
      }
      // Handle responses with request IDs
      if (parsed?.d?.r !== undefined) {
        pendingQueries.set(parsed.d.r, parsed);
      }
    } catch {}
  });
});

// Send Firebase queries via page.evaluate
// The Firebase WebSocket protocol is simple JSON
for (let i = 0; i < neededPaths.length; i++) {
  const path = neededPaths[i];
  const r = queryId++;
  
  await page.evaluate(({ path, r }) => {
    // Find the active Firebase WebSocket
    // The Firebase SDK stores WebSocket connections internally
    // We can find them through the Firebase database's internal repo
    return new Promise((resolve) => {
      // Access the Firebase WebSocket through the database internals
      const wsList = [];
      // Try to find the Firebase WebSocket by iterating over the database's internal state
      // We access repoManager via the firebase module
      import("https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js").then((mod) => {
        const dbMod = mod;
        resolve("database module loaded");
      }).catch((e) => {
        resolve("error: " + e.message);
      });
    });
  }, { path, r });
  
  if (i % 20 === 0) console.log(`Queried ${i}/${neededPaths.length} paths`);
}

// Actually, let's try a simpler approach - inject a script that patches the WebSocket class
// to intercept and send our own messages
console.log("\nTrying direct WebSocket query approach...");

// Find the WebSocket page objects and send queries through Playwright's WS API
// Playwright can't send arbitrary WS frames, only observe them.
// We need page.evaluate to send messages through the page's WebSocket.

// Let's try a different strategy: intercept the WebSocket constructor
// to get access to the actual WebSocket object
const wsSendResult = await page.evaluate(async (paths) => {
  let firebaseWs = null;
  let found = false;
  
  // Try to find the Firebase WebSocket by patching WebSocket
  // The Flutter app already created WebSockets, so we patch after the fact
  // by looking at all active WebSocket objects in the page
  
  // First, try to use the Firebase SDK directly but without getDatabase
  try {
    // Import the app module to get Firebase app configs
    const { getApp, getApps } = await import(
      "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js"
    );
    
    if (getApps().length > 0) {
      const app = getApp();
      
      // Instead of calling getDatabase(), we access the internal Firebase state
      // through the app options
      const dbUrl = app.options.databaseURL;
      
      // The Firebase WebSocket URL pattern is known:
      // wss://{project}.firebaseio.com/.ws?ns={project}&...v=5
      
      // Iterate over window to find Firebase internals
      for (const key of Object.keys(window)) {
        try {
          const val = window[key];
          if (val && typeof val === "object" && val.INTERNAL) {
            // Found Firebase app internal
          }
        } catch {}
      }
      
      return { apps: getApps().length, dbUrl };
    }
    return { apps: 0 };
  } catch (e) {
    return { error: e.message };
  }
}, neededPaths);

console.log("WS send result:", JSON.stringify(wsSendResult, null, 2));

// Check what we got in capturedResponses
console.log("\n=== Captured responses by group path ===");
const groupPaths = Object.keys(capturedResponses).filter(p => p.includes(PREFIX));
for (const p of groupPaths.sort()) {
  const data = capturedResponses[p];
  if (typeof data === "object") {
    console.log(`  ${p}: object with ${Object.keys(data).length} keys`);
  } else {
    console.log(`  ${p}: ${typeof data} = ${data}`);
  }
}

// Also check new response data
console.log("\n=== New responses after queries ===");
for (const p of Object.keys(responseData).sort()) {
  const data = responseData[p];
  if (typeof data === "object") {
    console.log(`  ${p}: object with ${Object.keys(data).length} keys`);
  } else {
    console.log(`  ${p}: ${typeof data} = ${data}`);
  }
}

// Save results
fs.writeFileSync("data/ws-queried-data.json", JSON.stringify({
  captured: capturedResponses,
  new: responseData,
}, null, 2));

console.log("\nSaved to data/ws-queried-data.json");

await browser.close();
