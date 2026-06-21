import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

// Listen for WebSocket frames
page.on("websocket", (ws) => {
  if (!ws.url().includes("firebaseio")) return;
  ws.on("framesent", (frame) => {
    const t = (frame.payload || "").trim();
    // Look for queries to paths we haven't seen before
    if (t.includes('"a":"q"') || t.includes("eventData")) {
      console.log("WS SENT:", t.substring(0, 600));
    }
  });
  ws.on("framereceived", (frame) => {
    const t = (frame.payload || "").trim();
    if (t.includes("eventData") || t.includes("goals") || t.includes("cards")) {
      console.log("*** EVENTDATA RESPONSE ***:", t.substring(0, 3000));
    }
  });
});

await page.goto("https://copafacil.com/-5qp1c@5jvbh", { waitUntil: "domcontentloaded", timeout: 20000 });
console.log("Waiting for Flutter...");
await page.waitForTimeout(20000);

// Try to extract Firebase auth and access eventData through the Flutter app's own Firebase
const result = await page.evaluate(async () => {
  const results = {};

  // 1. Check localStorage and sessionStorage for auth tokens
  results.localStorage = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k.includes("firebase") || k.includes("auth") || k.includes("token")) {
      results.localStorage[k] = localStorage.getItem(k).substring(0, 200);
    }
  }

  // 2. Check IndexedDB for Firebase auth
  try {
    const dbs = await indexedDB.databases();
    results.indexedDB = dbs.map(d => d.name);
  } catch {
    results.indexedDB = "error";
  }

  // 3. Try to read firebase auth from IndexedDB
  try {
    const token = await new Promise((resolve) => {
      const req = indexedDB.open("firebaseLocalStorageDb");
      req.onsuccess = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains("firebaseLocalStorage")) {
          resolve("no store");
          return;
        }
        const tx = db.transaction("firebaseLocalStorage", "readonly");
        const store = tx.objectStore("firebaseLocalStorage");
        const all = store.getAll();
        all.onsuccess = () => resolve(JSON.stringify(all.result).substring(0, 1000));
        all.onerror = () => resolve("read error");
      };
      req.onerror = () => resolve("open error");
    });
    results.authToken = token;
  } catch (e) {
    results.authToken = e.message;
  }

  // 4. Try to find the Firebase app instance initialized by Flutter
  // The Flutter firebase_database plugin stores the database ref internally
  // Check for firebase_database plugin's internal refs
  results.flutterFirebaseKeys = Object.keys(window)
    .filter(k => k.includes("firebase") || k.includes("Firebase"))
    .map(k => ({ key: k, type: typeof window[k] }));

  // 5. Try to use the Firebase SDK directly from the Flutter-loaded modules
  // The Flutter app imports Firebase JS SDK dynamically
  // Check if we can access it through the module cache
  results.moduleKeys = Object.keys(window)
    .filter(k => k.includes("_flutter") || k.includes("dart")) || [];

  return results;
});

console.log(JSON.stringify(result, null, 2));

await browser.close();
