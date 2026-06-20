import { chromium } from "playwright";
import fs from "fs";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, locale: "pt-BR" });
  const page = await context.newPage();

  const apiCalls = [];
  page.on("response", async res => {
    const url = res.url();
    if (url.includes("copafacil.com/api/") || url.includes("copafacil.com/api2/")) {
      try {
        const ct = res.headers()["content-type"] || "";
        let body = null;
        if (ct.includes("json")) body = await res.json();
        else if (ct.includes("text")) body = await res.text();
        apiCalls.push({ url, status: res.status(), body });
      } catch (e) {}
    }
  });

  await page.goto("https://copafacil.com/-5qp1c@5jvbh", { waitUntil: "networkidle", timeout: 30000 });
  console.log("Page loaded. Waiting for Flutter render...");
  await page.waitForTimeout(10000);

  // Try extracting Flutter semantics tree
  const semantics = await page.evaluate(() => {
    // Flutter renders semantics as a flat tree in the DOM
    const all = document.querySelectorAll("*");
    const results = [];
    
    // Try to find Flutter-specific elements
    for (const el of all) {
      const tag = el.tagName.toLowerCase();
      // Flutter creates elements with specific classes or attributes
      const text = el.textContent?.trim();
      const cls = el.className;
      const id = el.id;
      const rect = el.getBoundingClientRect();
      
      // Skip hidden/invisible elements
      if (rect.width === 0 || rect.height === 0) continue;
      
      // Catch all non-empty text elements
      if (text && text.length > 0 && text.length < 200 && el.children.length === 0) {
        results.push({ tag, text: text.substring(0, 100), cls: cls?.substring(0, 60) });
      }
    }
    return results.slice(0, 200);
  });

  console.log(`\n=== DOM TEXT ELEMENTS: ${semantics.length} ===`);
  semantics.forEach(s => console.log(`${s.tag.padEnd(8)} "${s.text}" [${s.cls}]`));

  // Also try to find Flutter semantics via its specific attributes
  const flutterSem = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('[flutter-semantics], [aria-label], [role]'))
      .map(el => ({
        tag: el.tagName,
        label: el.getAttribute("aria-label"),
        role: el.getAttribute("role"),
        text: el.textContent?.trim().substring(0, 100),
        rect: el.getBoundingClientRect(),
      }))
      .filter(el => (el.label || el.text) && el.rect.width > 0 && el.rect.height > 0)
      .slice(0, 100);
  });

  console.log(`\n=== FLUTTER SEMANTICS: ${flutterSem.length} ===`);
  flutterSem.forEach(s => console.log(`[${s.role}] "${s.label || s.text}"`));

  // Screenshot
  await page.screenshot({ path: "scripts/copafacil-dom.png", fullPage: false });

  // Save API calls
  fs.writeFileSync("scripts/copafacil-apis.json", JSON.stringify(apiCalls, null, 2));
  console.log(`\nSaved ${apiCalls.length} API calls.`);

  await browser.close();
}

main().catch(console.error);
