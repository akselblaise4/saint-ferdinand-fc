import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 430, height: 932 } });

// Capture ALL network requests
const allUrls = new Set();
const apiResponses = [];

page.on("request", req => {
  const url = req.url();
  // Filter for interesting endpoints
  if (url.includes("firebaseio") || url.includes("copafacil") || url.includes("api")) {
    if (!allUrls.has(url)) {
      allUrls.add(url);
      console.log("REQ: " + url.substring(0, 200));
    }
  }
});

page.on("response", async res => {
  const url = res.url();
  if (url.includes("copy") || url.includes("excel") || url.includes("share")) {
    try {
      const text = await res.text();
      apiResponses.push({ url, body: text.substring(0, 300) });
    } catch (e) {}
  }
});

console.log("Loading Copa Fácil...");
await page.goto("https://copafacil.com/-5qp1c@5jvbh", {
  waitUntil: "domcontentloaded", timeout: 20000,
});
await page.waitForTimeout(20000); // extra time for all requests

console.log("\n=== ALL NETWORK URLS ===");
[...allUrls].sort().forEach(u => console.log(u));

// Try clicking various parts of the Flutter app
console.log("\n=== CLICKING NAVIGATION ===");

// Let me be more strategic. The Flutter app likely has bottom tabs.
// On mobile (430px wide), typical Flutter bottom nav has 4-5 tabs.
// Let's try different y positions for the bottom bar (varies by phone)
const navYs = [880, 890, 900, 910, 920];
for (const ny of navYs) {
  // Try 5 horizontal positions (tabs)
  for (let i = 0; i < 5; i++) {
    const nx = Math.round(43 + i * 86);
    const before = allUrls.size;
    try {
      await page.mouse.click(nx, ny);
      await page.waitForTimeout(3000);
      if (allUrls.size > before) {
        console.log("  HIT at (" + nx + "," + ny + ") => " + (allUrls.size - before) + " new URLs");
      }
    } catch (e) {}
  }
}

// Also try tapping on the content area (teams list)
console.log("\n=== CLICKING TEAM LIST ===");
// Team rows typically at y=100 to y=700
for (let y = 100; y <= 700; y += 60) {
  const before = allUrls.size;
  try {
    await page.mouse.click(215, y); // center of screen
    await page.waitForTimeout(1500);
    if (allUrls.size > before) {
      console.log("  DATA LOADED at y=" + y + " => " + (allUrls.size - before) + " new URLs");
      // Re-read the data
    }
  } catch (e) {}
}

// Also try the URL pattern with different paths
console.log("\n=== TRYING URL ROUTES ===");
const routes = ["partidos", "fixtures", "matches", "jogos", "calendario", 
  "resultados", "results", "games", "partidos/1", "ronda/1",
  "partidos/-5qp1c@5jvbh", "matchs"];

for (const route of routes) {
  const before = allUrls.size;
  try {
    await page.goto("https://copafacil.com/" + route, {
      waitUntil: "domcontentloaded", timeout: 10000,
    });
    await page.waitForTimeout(4000);
    if (allUrls.size > before) {
      console.log("  URL /" + route + " => " + (allUrls.size - before) + " new URLs");
    }
  } catch (e) {}
}

console.log("\n=== API RESPONSES ===");
apiResponses.forEach(r => {
  console.log(r.url.substring(0, 100) + " => " + r.body.substring(0, 200));
});

console.log("\n=== TRYING FIREBASE PATHS WITH GROUP LETTERS ===");
await page.goto("about:blank", { waitUntil: "domcontentloaded" });

const extraPaths = await page.evaluate(async () => {
  const { initializeApp } = await import("https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js");
  const { getDatabase, ref, child, get } = await import("https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js");
  const app = initializeApp({
    apiKey: "AIzaSyDbR0mRSSb554WadsJgfOivSXLET84IIR0",
    databaseURL: "https://copafacil-web.firebaseio.com",
  });
  const db = getDatabase(app);
  const rootRef = ref(db);
  const read = async p => { try { const s = await get(child(rootRef, p)); return s.exists() ? "EXISTS" : null; } catch (e) { return "ERR:" + e.message.substring(0, 30); } };

  // Try group letter paths
  const letters = ["A", "B", "C", "D"];
  const paths = [];
  for (const l of letters) {
    paths.push("events/-5qp1c@" + l);
    paths.push("events/-5qp1c@" + l + "/info");
    paths.push("events/-5qp1c@" + l + "/teams");
    paths.push("events/-5qp1c@" + l + "/matches");
  }
  // Try other match path patterns
  paths.push("events/-5qp1c@5jvbh/resultados");
  paths.push("events/-5qp1c@5jvbh/calendario");
  paths.push("events/-5qp1c@5jvbh/partidos");
  paths.push("data/events/-5qp1c@5jvbh/matches");
  paths.push("matches");
  paths.push("matches/-5qp1c");
  paths.push("matches/-5qp1c@5jvbh");
  paths.push("events/-5qp1c@5jvbh/Match");
  paths.push("events/-5qp1c@5jvbh/matches/list");
  paths.push("events/-5qp1c@5jvbh/rounds/1");
  paths.push("events/-5qp1c@5jvbh/rounds/all");
  // Try each team as a match container
  paths.push("events/-5qp1c@5jvbh/teams/-OqC_DyMZey8vTF5Shq5/matches");
  paths.push("events/-5qp1c@5jvbh/teams/-OqC_DyMZey8vTF5Shq5/games");
  paths.push("events/-5qp1c@5jvbh/teams/-OqC_DyMZey8vTF5Shq5/resultados");
  // Try the sibling group (same event, different sub-event)
  paths.push("events/-5qp1c@5jvbh/related/matches");
  paths.push("events/-5qp1c@5jvbh/related/fixtures");

  const result = {};
  for (const p of paths) {
    result[p] = await read(p);
  }
  return result;
});

console.log("RTDB path search results:");
Object.entries(extraPaths).forEach(([k, v]) => {
  if (v !== null) console.log("  " + k + " => " + v);
});

await browser.close();
