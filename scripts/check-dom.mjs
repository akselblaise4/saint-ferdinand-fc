import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 430, height: 932 } });

await page.goto("https://copafacil.com/-5qp1c@5jvbh", { waitUntil: "domcontentloaded", timeout: 20000 });
await page.waitForTimeout(15000);

// Look for any DOM elements created by Flutter
const elements = await page.evaluate(() => {
  const result = [];
  // Check for canvas element
  const canvas = document.querySelector("canvas");
  result.push("Canvas: " + (canvas ? canvas.width + "x" + canvas.height : "NONE"));
  // Check for flt- elements (Flutter canvas elements)
  const fltElements = document.querySelectorAll("[class*='flt'], [id*='flt']");
  result.push("flt elements: " + fltElements.length);
  // Check all child elements of body
  const bodyChildren = document.querySelectorAll("body > *");
  bodyChildren.forEach(el => {
    result.push("  <" + el.tagName.toLowerCase() + (el.id ? "#" + el.id : "") + (el.className ? "." + el.className.substring(0, 30) : "") + ">");
  });
  return result;
});

console.log("=== Page DOM Analysis ===");
elements.forEach(e => console.log(e));

// Check if there's a Flutter loader/engine global
const flutterGlobals = await page.evaluate(() => {
  const keys = [];
  for (const key of Object.keys(window)) {
    if (key.toLowerCase().includes("flutter") || key.toLowerCase().includes("flt")) keys.push(key);
  }
  // Check for any global that might be the Flutter app
  return keys;
});
console.log("\n=== Flutter-related globals ===");
if (flutterGlobals.length === 0) console.log("None found");
else flutterGlobals.forEach(k => console.log("  window." + k));

// Try to find the Flutter web app entry points
const navigationMethods = await page.evaluate(() => {
  const result = {};
  // Check for common Flutter navigation patterns
  if (typeof window.flutterWebRenderer !== "undefined") result.flutterWebRenderer = true;
  if (typeof window.__flutter !== "undefined") result.__flutter = true;
  return result;
});
console.log("\n=== Flutter engine access ===");
console.log(JSON.stringify(navigationMethods));

await browser.close();
