import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

// Check Firebase Storage for JSON files containing player data
const storageUrls = [
  // Common patterns for data exports in Firebase Storage
  "https://firebasestorage.googleapis.com/v0/b/copafacil-web.appspot.com/o/events%2F-5qp1c%2Fplayers.json?alt=media",
  "https://firebasestorage.googleapis.com/v0/b/copafacil-web.appspot.com/o/events%2F-5qp1c%2Fscorers.json?alt=media",
  "https://firebasestorage.googleapis.com/v0/b/copafacil-web.appspot.com/o/events%2F-5qp1c%2Fstats.json?alt=media",
  "https://firebasestorage.googleapis.com/v0/b/copafacil-web.appspot.com/o/evts%2F-5qp1c%2Fartilheiros.json?alt=media",
  "https://firebasestorage.googleapis.com/v0/b/copafacil-web.appspot.com/o/evts%2F-5qp1c%2Fgoleadores.json?alt=media",
  "https://firebasestorage.googleapis.com/v0/b/copafacil-web.appspot.com/o/evts%2F-5qp1c%2Fplayers.json?alt=media",
  // Try with group ID
  "https://firebasestorage.googleapis.com/v0/b/copafacil-web.appspot.com/o/evts%2F-5qp1c%2F5jvbh%2Fplayers.json?alt=media",
  "https://firebasestorage.googleapis.com/v0/b/copafacil-web.appspot.com/o/evts%2F-5qp1c%2F5jvbh%2Fstats.json?alt=media",
  // Team-specific
  "https://firebasestorage.googleapis.com/v0/b/copafacil-web.appspot.com/o/evts%2F-5qp1c%2F5jvbh%2F-OqC_DyMZey8vTF5Shq5%2Fplayers.json?alt=media",
  // Check for the Firebase Functions exported data
  "https://firebasestorage.googleapis.com/v0/b/copafacil-web.appspot.com/o/evts%2F-5qp1c%2F5jvbh%2Fclassificacao.json?alt=media",
  "https://firebasestorage.googleapis.com/v0/b/copafacil-web.appspot.com/o/evts%2F-5qp1c%2F5jvbh%2Fresults.json?alt=media",
  // Try without alt=media 
  "https://firebasestorage.googleapis.com/v0/b/copafacil-web.appspot.com/o/evts%2F-5qp1c%2F5jvbh%2Fplayers",
];

for (const url of storageUrls) {
  try {
    const resp = await page.evaluate(async (u) => {
      try {
        const r = await fetch(u, { method: "HEAD" });
        return { status: r.status, ok: r.ok };
      } catch (e) {
        return { status: 0, error: e.message };
      }
    }, url);
    if (resp.ok || resp.status === 200) {
      console.log(`FOUND: ${url}`);
    } else if (resp.status === 404) {
      // Not found, skip
    } else {
      console.log(`${url}: status=${resp.status}`);
    }
  } catch {}
}

console.log("\nStorage check complete.");

// Also: let me check what other event-level paths are accessible
await page.goto("https://copafacil.com/-5qp1c@5jvbh", { waitUntil: "domcontentloaded", timeout: 20000 });
await page.waitForTimeout(5000);
await page.goto("about:blank", { waitUntil: "domcontentloaded" });

const result = await page.evaluate(async (config) => {
  const { initializeApp } = await import("https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js");
  const { getDatabase, ref, child, get } = await import("https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js");
  const app = initializeApp(config);
  const db = getDatabase(app);
  const rootRef = ref(db);
  const read = async p => { try { const s = await get(child(rootRef, p)); return s.exists() ? s.val() : null; } catch { return null; } };
  
  // Read the full event root to see ALL child paths
  const fullEvent = await read("events/-5qp1c");
  return fullEvent ? Object.keys(fullEvent) : null;
}, {
  apiKey: "AIzaSyDbR0mRSSb554WadsJgfOivSXLET84IIR0",
  databaseURL: "https://copafacil-web.firebaseio.com",
});

if (result) {
  console.log("\nAll top-level keys at events/-5qp1c:");
  result.forEach(k => console.log(`  ${k}`));
} else {
  console.log("\nCannot read events/-5qp1c root");
}

await browser.close();
