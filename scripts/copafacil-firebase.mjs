import { chromium } from "playwright";
import fs from "fs";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    locale: "pt-BR",
  });
  const page = await context.newPage();

  console.log("Loading Copa Fácil...");
  await page.goto("https://copafacil.com/-5qp1c@5jvbh", {
    waitUntil: "domcontentloaded",
    timeout: 20000,
  });

  console.log("Waiting for Firebase + Flutter init...");
  await page.waitForTimeout(12000);

  // Try to access Firebase SDK from the browser context
  const firebaseData = await page.evaluate(async () => {
    const results = {};

    // Check if firebase is available globally
    results.hasFirebase = typeof firebase !== "undefined";
    results.hasFirebaseApp = typeof firebase?.app !== "undefined";
    results.apps = firebase?.apps?.length || 0;

    if (firebase?.apps?.length > 0) {
      const app = firebase.apps[0];
      results.appName = app.name;
      results.projectId = app.options?.projectId;
      results.databaseURL = app.options?.databaseURL;

      // Try to read from RTDB
      try {
        const db = firebase.database(app);
        const ref = db.ref("events/-5qp1c");
        const snap = await ref.once("value");
        results.eventData = snap.val();
      } catch (e) {
        results.rtdbError = e.message;
      }
    }

    return results;
  });

  console.log("\n=== FIREBASE DATA ===");
  console.log(JSON.stringify(firebaseData, null, 2).substring(0, 3000));

  // If Firebase wasn't available globally, try to access it via the Flutter engine's injected objects
  if (!firebaseData.hasFirebase) {
    const altData = await page.evaluate(() => {
      // Look for Firebase-like objects in window
      const keys = Object.keys(window).filter(k =>
        k.toLowerCase().includes("firebase") ||
        k.toLowerCase().includes("firestore") ||
        k.toLowerCase().includes("rtdb")
      );
      // Check for Flutter's plugin registrant
      const flutterKeys = Object.keys(window).filter(k =>
        k.startsWith("flutter") || k.startsWith("_flutter")
      );
      return { firebaseKeys: keys, flutterKeys };
    });
    console.log("\n=== ALTERNATIVE ===");
    console.log(JSON.stringify(altData, null, 2));
  }

  await page.screenshot({ path: "scripts/copafacil-final.png" });
  await browser.close();

  // Save what we got
  fs.writeFileSync("scripts/copafacil-firebase.json", JSON.stringify(firebaseData, null, 2));
  console.log("\nSaved to scripts/copafacil-firebase.json");
}

main().catch(console.error);
