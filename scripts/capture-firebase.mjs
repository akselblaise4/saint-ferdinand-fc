import { chromium } from "playwright";
import fs from "fs";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  // Intercept ALL fetch/XHR requests to Firebase
  const allReqs = [];
  await page.route("**/*", async (route, request) => {
    const url = request.url();
    if (
      url.includes("firebaseio.com") ||
      url.includes("firestore.googleapis") ||
      url.includes("identitytoolkit") ||
      url.includes("copafacil.com/api2") ||
      (url.includes("copafacil.com") && url.includes(".json"))
    ) {
      const response = await route.fetch();
      try {
        const body = await response.text();
        allReqs.push({
          url: url.substring(0, 300),
          method: request.method(),
          status: response.status(),
          body: body.substring(0, 3000),
        });
      } catch (e) {}
      return response;
    }
    return route.continue();
  });

  console.log("Loading page...");
  await page.goto("https://copafacil.com/-5qp1c@5jvbh", {
    waitUntil: "domcontentloaded",
    timeout: 20000,
  });
  console.log("Waiting for Firebase init...");
  await page.waitForTimeout(15000);

  console.log(`\n=== ALL FIREBASE/API REQUESTS: ${allReqs.length} ===`);
  allReqs.forEach((r, i) => {
    console.log(`\n[${i+1}] ${r.method} ${r.status} ${r.url}`);
    if (r.body.length > 0) {
      console.log(`  Body (${r.body.length} chars): ${r.body.substring(0, 600)}`);
    }
  });

  // Try to get Firebase auth token from the page
  const authData = await page.evaluate(async () => {
    // Try accessing firebase from window
    const results = {};
    // Check localStorage for Firebase auth
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes("firebase") || key.includes("token") || key.includes("auth"))) {
        results[key] = localStorage.getItem(key).substring(0, 200);
      }
    }
    // Check indexedDB for firebase auth
    results.indexedDB = await new Promise(resolve => {
      const req = indexedDB.databases();
      req.then(dbs => {
        resolve(dbs.map(d => d.name).filter(n => n?.includes("firebase")));
      }).catch(() => resolve([]));
    });
    return results;
  });
  console.log("\n=== AUTH DATA ===");
  console.log(JSON.stringify(authData, null, 2));

  await page.screenshot({ path: "data/bot-auth.png" });
  await browser.close();

  fs.writeFileSync("data/firebase-requests.json", JSON.stringify(allReqs, null, 2));
  console.log("\nSaved.");
}

main().catch(console.error);
