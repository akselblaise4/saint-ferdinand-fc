import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 430, height: 932 } });

await page.goto("https://copafacil.com/-5qp1c@5jvbh", { waitUntil: "domcontentloaded", timeout: 20000 });
await page.waitForTimeout(15000);

// Check window.flutterWebRenderer for navigation methods
const rendererInfo = await page.evaluate(() => {
  const info = {};
  if (window.flutterWebRenderer) {
    const keys = Object.getOwnPropertyNames(window.flutterWebRenderer);
    info.rendererKeys = keys.slice(0, 20);
    // Check prototypes too
    for (const key in window.flutterWebRenderer) {
      if (typeof window.flutterWebRenderer[key] === "function") {
        info.methods = info.methods || [];
        info.methods.push(key);
      }
    }
  }
  return info;
});
console.log("=== Flutter Web Renderer ===");
console.log(JSON.stringify(rendererInfo, null, 2));

// Check flutterCanvasKit
const canvasKitInfo = await page.evaluate(() => {
  if (window.flutterCanvasKit) {
    const keys = Object.keys(window.flutterCanvasKit);
    return { keys: keys.slice(0, 20) };
  }
  return null;
});
console.log("\n=== Flutter CanvasKit ===");
console.log(JSON.stringify(canvasKitInfo, null, 2));

// Check if URL hash changes on interaction
console.log("\n=== URL / Hash Monitor ===");
const urlHistory = [];
page.on("framenavigated", frame => {
  if (frame === page.mainFrame()) {
    urlHistory.push(frame.url());
    console.log("URL: " + frame.url());
  }
});

// Try clicking bottom nav buttons more precisely
// Let's find the flutter-view element dimensions
const viewportInfo = await page.evaluate(() => {
  const fv = document.querySelector("flutter-view");
  const canvas = document.querySelector("canvas");
  return {
    flutterView: fv ? { w: fv.clientWidth, h: fv.clientHeight, x: fv.getBoundingClientRect().x, y: fv.getBoundingClientRect().y } : null,
    canvas: canvas ? { w: canvas.width, h: canvas.height } : null,
  };
});
console.log("\nViewport:", JSON.stringify(viewportInfo, null, 2));

// Also check for any clickable non-canvas elements
const clickableElements = await page.evaluate(() => {
  const els = document.querySelectorAll("a, button, [role=button], [onclick]");
  return Array.from(els).map(el => ({
    tag: el.tagName,
    text: (el.textContent || "").substring(0, 30),
    rect: el.getBoundingClientRect().toJSON(),
    visible: el.checkVisibility(),
  }));
});
console.log("\nClickable DOM elements:", clickableElements.length);
clickableElements.forEach(el => console.log("  " + el.tag + " '" + el.text + "' x:" + Math.round(el.rect.x) + " y:" + Math.round(el.rect.y) + " w:" + Math.round(el.rect.width) + " h:" + Math.round(el.rect.height) + " visible:" + el.visible));

await browser.close();
