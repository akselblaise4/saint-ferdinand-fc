import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 430, height: 932 } });

await page.goto("https://copafacil.com/-5qp1c@5jvbh", {
  waitUntil: "domcontentloaded", timeout: 20000,
});
await page.waitForTimeout(15000);

// Try to access Flutter internals
const flutterState = await page.evaluate(() => {
  const info = {};

  // Check for Dart/Flutter global state
  for (const key of Object.getOwnPropertyNames(window)) {
    if (key.includes("dart") || key.includes("Dart") || key.includes("main_")) info[key] = typeof window[key];
  }

  // Check flutterWebRenderer (it was an array before)
  if (window.flutterWebRenderer) {
    const fwr = window.flutterWebRenderer;
    info.flutterWebRendererType = typeof fwr;
    info.flutterWebRendererKeys = Object.getOwnPropertyNames(fwr || {}).slice(0, 10);
    // Check if it's an array
    if (Array.isArray(fwr)) {
      info.flutterWebRendererLength = fwr.length;
      for (let i = 0; i < fwr.length && i < 3; i++) {
        const item = fwr[i];
        if (item) {
          const keys = Object.getOwnPropertyNames(item).slice(0, 10);
          info["fwr[" + i + "]"] = "type=" + typeof item + " keys=" + keys.join(",");
        }
      }
    }
  }

  // Try to find the main app instance
  // In compiled Flutter/Dart, classes are accessed through module/namespace objects
  const mainKeys = [];
  for (const key of Object.keys(window)) {
    if (key.startsWith("main") || key.startsWith("dart") || key.startsWith("app")) {
      mainKeys.push(key);
    }
  }
  info.mainKeys = mainKeys;

  return info;
});

console.log("=== Flutter Internal State ===");
console.log(JSON.stringify(flutterState, null, 2));

// Check the Dart main function for route management
const mainSource = await page.evaluate(() => {
  // Look for self or globalThis objects that might hold the app
  const result = {};
  
  // Check if there's a __dart_ module system
  if (typeof self.__dart_deferred_imports__ !== "undefined") result.hasDartDeferred = true;
  
  // Look for the loaded Flutter modules
  if (typeof self.dartLoaders !== "undefined") result.hasDartLoaders = true;
  
  // The dart2js compiled code uses an "A" object as the main module
  // Try to find it in various scopes
  for (const k of Object.keys(self)) {
    if (k.length === 1 && k >= "A" && k <= "Z") {
      const val = self[k];
      if (val && typeof val === "object" && Object.keys(val).length > 50) {
        result["self." + k] = "object with " + Object.keys(val).length + " keys (likely dart module)";
      }
    }
  }
  
  return result;
});

console.log("\n=== Dart Modules ===");
console.log(JSON.stringify(mainSource, null, 2));

// Now let's try finding the navigator/routing state by accessing Dart's main module
const routes = await page.evaluate(() => {
  // Find the A module (dart2js compiled code)
  const A = self.A || self.B || self.C || self.D || self.E;
  if (!A) return { error: "No dart module found" };
  
  // Look for route-related functions or state
  const routeKeys = [];
  for (const key of Object.keys(A)) {
    if (typeof key === "string" && 
        (key.includes("route") || key.includes("Route") || 
         key.includes("navigat") || key.includes("Navigat") ||
         key.includes("match") || key.includes("Match") ||
         key.includes("page") || key.includes("Page") ||
         key.includes("_current") || key.includes("currentRoute"))) {
      routeKeys.push(key);
    }
  }
  
  return { moduleKeys: Object.keys(A).length, routeRelated: routeKeys.slice(0, 20) };
});

console.log("\n=== Dart Module Route Analysis ===");
console.log(JSON.stringify(routes, null, 2));

await browser.close();
