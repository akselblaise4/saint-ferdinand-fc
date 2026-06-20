import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 430, height: 932 } }); // mobile

// Track ALL Firebase queries
const firebaseQueries = [];
page.on("websocket", ws => {
  if (ws.url().includes("firebaseio.com")) {
    const startTime = Date.now();
    ws.on("framesent", frame => {
      try {
        const msg = JSON.parse(frame.payload);
        if (msg.t === "d" && msg.d.a === "q") {
          firebaseQueries.push({
            time: Date.now() - startTime,
            path: msg.d.b.p,
            dir: "sent",
            r: msg.d.r,
          });
        }
      } catch (e) {}
    });
    ws.on("framereceived", frame => {
      try {
        const msg = JSON.parse(frame.payload);
        if (msg.t === "d" && msg.d.r) {
          firebaseQueries.push({
            time: Date.now() - startTime,
            r: msg.d.r,
            dir: "recv",
            status: msg.d.b?.s,
          });
        }
      } catch (e) {}
    });
  }
});

console.log("[1] Loading Copa Fácil...");
await page.goto("https://copafacil.com/-5qp1c@5jvbh", {
  waitUntil: "domcontentloaded", timeout: 20000,
});
await page.waitForTimeout(15000);

// Try to get accessibility tree
console.log("\n[2] Checking accessibility tree...");
const snapshot = await page.accessibility.snapshot();
if (snapshot) {
  console.log("Accessibility root:", JSON.stringify(snapshot).substring(0, 500));
} else {
  console.log("No accessibility tree available (Flutter CanvasKit)");
}

// Try clicking at bottom nav to switch tabs (Partidos / Matches tab)
console.log("\n[3] Clicking navigation tabs...");
const tabPositions = [
  { label: "tab 1 (home)", x: 55, y: 900 },
  { label: "tab 2 (partidos)", x: 165, y: 900 },
  { label: "tab 3", x: 275, y: 900 },
  { label: "tab 4", x: 385, y: 900 },
];

for (const tab of tabPositions) {
  const before = firebaseQueries.length;
  console.log(`  Clicking ${tab.label} at (${tab.x}, ${tab.y})...`);
  await page.mouse.click(tab.x, tab.y);
  await page.waitForTimeout(3000);
  const after = firebaseQueries.length;
  console.log(`    New queries: ${after - before}`);
}

console.log("\n[4] All Firebase queries seen:");
const uniquePaths = [...new Set(firebaseQueries.filter(q => q.path).map(q => q.path))];
uniquePaths.forEach(p => console.log(`  ${p}`));

// Now try to find match data after all the navigation
const pathsToCheck = [
  ...uniquePaths.filter(p => p.includes("match") || p.includes("game") || p.includes("round") || p.includes("fecha")),
];

if (pathsToCheck.length > 0) {
  console.log("\n[5] Checking match-related paths found...");
  const rtdbPaths = await page.evaluate(async (opts) => {
    const { initializeApp } = await import(opts.appJs);
    const { getDatabase, ref, child, get } = await import(opts.dbJs);
    const app = initializeApp(opts.config);
    const db = getDatabase(app);
    const rootRef = ref(db);

    const result = {};
    for (const p of opts.paths) {
      try {
        const snap = await get(child(rootRef, p));
        result[p] = snap.exists() ? snap.val() : null;
      } catch (e) {
        result[p] = { error: e.message };
      }
    }
    return result;
  }, {
    appJs: "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js",
    dbJs: "https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js",
    config: {
      apiKey: "AIzaSyDbR0mRSSb554WadsJgfOivSXLET84IIR0",
      databaseURL: "https://copafacil-web.firebaseio.com",
    },
    paths: pathsToCheck,
  });
  console.log("  Results:", JSON.stringify(rtdbPaths, null, 2).substring(0, 500));
} else {
  console.log("\n[5] No match-related paths found. The Flutter app uses routes not captured via WebSocket.");
}

// Also try to interact with the page via keyboard or touch events to trigger navigation
console.log("\n[6] Trying touch navigation...");
// Swipe left to navigate to next tab
await page.touchscreen.tap(300, 900);
await page.waitForTimeout(5000);

const morePaths = [...new Set(firebaseQueries.filter(q => q.path).map(q => q.path))];
const newPaths = morePaths.filter(p => !uniquePaths.includes(p));
if (newPaths.length > 0) {
  console.log("  New paths after tap:", newPaths.join(", "));
}

console.log("\n=== DONE ===");
console.log(`Total Firebase queries captured: ${firebaseQueries.length}`);

// Try to dump the full Flutter app HTML for any canvas data
const html = await page.content();
console.log(`Page HTML length: ${html.length}`);

await browser.close();
