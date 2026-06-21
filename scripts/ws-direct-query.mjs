import { chromium } from "playwright";
import fs from "fs";

const EVENT = "-5qp1c";
const GROUP = "5jvbh";

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" });
const page = await context.newPage({ viewport: { width: 1920, height: 1080 } });

// Store WebSocket reference and all responses
const firebaseData = {};
let queryId = 1;

page.on("websocket", (ws) => {
  if (!ws.url().includes("firebaseio")) return;
  console.log("Firebase WS connected");

  ws.on("framereceived", (frame) => {
    const text = frame.payload || "";
    try {
      const parsed = JSON.parse(text);
      // Multiple response formats
      if (parsed?.d?.b?.p && parsed?.d?.b?.d !== undefined) {
        firebaseData[parsed.d.b.p] = parsed.d.b.d;
      }
      // Also handle response format: {"d":{"r":...,"b":{"p":"...","d":...}}}
      if (parsed?.d?.b?.p && parsed?.d?.b?.d !== undefined) {
        // already handled above
      }
    } catch {}
  });
});

await page.goto(`https://copafacil.com/${EVENT}@${GROUP}`, {
  waitUntil: "domcontentloaded",
  timeout: 30000,
});

console.log("Waiting for Flutter init (30s)...");
await page.waitForTimeout(30000);
console.log(`Auto-captured ${Object.keys(firebaseData).length} paths so far`);

// Now send queries through the page context using the Firebase WebSocket
// We patch the WebSocket to find the right instance
const result = await page.evaluate(async () => {
  // Try to find and use the Firebase WebSocket by patching before init
  // But we're already after init, so we need another approach
  
  // Create a Proxy around the native WebSocket class
  // to intercept the Firebase WebSocket
  const NativeWS = window.WebSocket;
  let fbWs = null;
  
  // Monkey-patch to intercept the next WebSocket
  const origSend = WebSocket.prototype.send;
  const origClose = WebSocket.prototype.close;
  
  // Check all existing WebSocket-like objects
  // We can use a workaround - override send to capture the FB socket
  WebSocket.prototype.send = new Proxy(WebSocket.prototype.send, {
    apply(target, thisArg, args) {
      if (!fbWs && thisArg && args[0] && typeof args[0] === "string") {
        const msg = args[0];
        if (msg.includes("firebaseio") || msg.startsWith('{"t":"d"')) {
          fbWs = thisArg;
        }
      }
      return Reflect.apply(target, thisArg, args);
    }
  });
  
  // Wait a moment for any new connections
  await new Promise(r => setTimeout(r, 2000));
  
  if (!fbWs) {
    // Try another approach: iterate over all page WebSockets
    // by checking for pending connections
    return { error: "Could not find Firebase WebSocket" };
  }
  
  return { found: true };
});

console.log("Result:", JSON.stringify(result));

// If the proxy approach didn't work, let's try to use the Firebase SDK
// but bypass the "Database initialized multiple times" error
console.log("\nTrying Firebase SDK approach with direct repo access...");

const sdkResult = await page.evaluate(async () => {
  try {
    const { getApp, getApps } = await import(
      "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js"
    );
    
    if (getApps().length === 0) return { error: "No apps" };
    const app = getApp();
    
    // Try to access the database internals directly
    // The Firebase SDK stores repos using a naming convention
    // Let's look at the app's internal state
    const appInternals = app;
    
    // Check for the database module in the import cache
    // Dynamic imports are cached per URL
    const dbModule = await import(
      "https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js"
    );
    
    // The repoManager might be accessible through the module
    // In Firebase v11, the database module has internal state
    
    // Try to call getDatabase() but catch the specific error
    try {
      const db = dbModule.getDatabase(app);
      return { success: true, dbType: typeof db };
    } catch (e) {
      const msg = e.message;
      
      // The error is about multiple initialization.
      // We can fix this by temporarily clearing the repo map
      // Firebase stores repos using a key derived from the database URL
      // Key format: `${dbUrl}#${apiKey}`
      
      // Access the internal repository map through the module
      // Firebase uses a `Provider` pattern with `getImmediate`
      // But the Flutter plugin initializes differently...
      
      return { error: msg, dbKeys: Object.keys(dbModule).filter(k => k.includes('repo') || k.includes('Repo') || k.includes('Manager')) };
    }
  } catch (e) {
    return { error: e.message };
  }
});

console.log("SDK result:", JSON.stringify(sdkResult, null, 2));

// If none of these work, fall back to the interactive approach
// We'll generate the list of player paths we need
// and the user can run the interactive capture again

// First, get the match IDs we already have
const matchIds = [];
for (const p of Object.keys(firebaseData)) {
  const m = p.match(/details\/(\d+)/);
  if (m) matchIds.push(m[1]);
}

// Get the player IDs from match events we captured
const playerIds = new Set();
for (const matchId of matchIds) {
  const events = firebaseData[`events/${EVENT}@${GROUP}/details/${matchId}`];
  if (events?.list && typeof events.list === "object") {
    for (const [ts, ev] of Object.entries(events.list)) {
      if (ev.pl_id1) playerIds.add(ev.pl_id1);
    }
  }
}

console.log(`\nMatch IDs found: ${matchIds.length}`);
console.log(`Player IDs found: ${playerIds.size}`);
console.log(`Total auto-captured paths: ${Object.keys(firebaseData).length}`);

// Save what we have
fs.writeFileSync("data/headless-data.json", JSON.stringify({
  firebaseData,
  matchIds: [...matchIds],
  playerIds: [...playerIds],
}, null, 2));

console.log("\nSaved to data/headless-data.json");

await browser.close();
