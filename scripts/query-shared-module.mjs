import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

let detailsData = null;

page.on("websocket", (ws) => {
  if (!ws.url().includes("firebaseio")) return;
  ws.on("framereceived", (frame) => {
    const t = (frame.payload || "").trim();
    // Look for 'details' path in responses
    if (t.includes('"p":"events/-5qp1c@5jvbh/details') || t.includes('"p":"events/-5qp1c/details')) {
      detailsData = t;
      console.log("\n*** DETAILS DATA FOUND IN WS ***");
      console.log(t.substring(0, 5000));
    }
  });
});

await page.goto("https://copafacil.com/-5qp1c@5jvbh", { waitUntil: "domcontentloaded", timeout: 20000 });
console.log("Waiting for Flutter...");
await page.waitForTimeout(20000);

// Try to import the SAME Firebase SDK module that Flutter already loaded
// ES module cache should share the instance
const result = await page.evaluate(async () => {
  const r = {};
  
  try {
    // Import the EXACT same module URLs as the Flutter app
    // These should hit the browser's module cache
    const { getApp, getApps } = await import(
      "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js"
    );
    const { getDatabase, ref, get } = await import(
      "https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js"
    );
    
    // IMPORTANT: DO NOT call initializeApp! Just use getApp to get the existing app
    r.appsCount = getApps().length;
    
    if (getApps().length > 0) {
      const app = getApp();
      r.appName = app.name;
      
      // Now try getDatabase WITHOUT calling initializeApp first
      // If the module is shared, this should return the existing database
      const db = getDatabase(app);
      r.dbType = typeof db;
      
      // Now query the details path through the shared authenticated session
      const dbref = ref(db, "events/-5qp1c@5jvbh/details");
      
      try {
        const snap = await get(dbref);
        if (snap.exists()) {
          const val = snap.val();
          r.exists = true;
          r.keys = Object.keys(val).slice(0, 20);
          r.totalKeys = Object.keys(val).length;
          r.size = JSON.stringify(val).length;
          
          // Show first entry structure
          if (r.keys.length > 0) {
            const first = val[r.keys[0]];
            r.firstKey = r.keys[0];
            if (typeof first === "object") {
              r.firstEntryKeys = Object.keys(first);
              r.firstEntry = JSON.stringify(first).substring(0, 800);
            }
          }
        } else {
          r.exists = false;
        }
      } catch(e) {
        r.readError = e.message;
      }
    } else {
      r.noApps = true;
    }
  } catch(e) {
    r.error = e.message;
  }
  
  return r;
});

console.log(JSON.stringify(result, null, 2));

// Also check if any details data came through WS
if (detailsData) {
  console.log("\n=== WS Details Data Preview ===");
  console.log(detailsData.substring(0, 3000));
}

await browser.close();
