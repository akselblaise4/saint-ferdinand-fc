import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  const requests = [];

  page.on("request", req => {
    const url = req.url();
    if (url.includes("firebase") || url.includes("firestore") || url.includes("googleapis") || url.includes("copafacil.b-cdn.net")) {
      requests.push({ type: "request", url: url.substring(0, 200), method: req.method() });
    }
  });

  page.on("response", async res => {
    const url = res.url();
    if (url.includes("firebasestorage") || url.includes("firestore") || url.includes("googleapis.com")) {
      try {
        const ct = res.headers()["content-type"] || "";
        let body = "";
        if (ct.includes("json")) {
          body = JSON.stringify(await res.json()).substring(0, 500);
        } else if (ct.includes("protobuf")) {
          body = `[protobuf ${res.headers()["content-length"] || "?"} bytes]`;
        }
        requests.push({ type: "response", url: url.substring(0, 200), contentType: ct.substring(0, 50), body: body.substring(0, 300) });
      } catch (e) {
        // ignore
      }
    }
  });

  console.log("Navigating to Copa Fácil...");
  await page.goto("https://copafacil.com/-5qp1c@5jvbh", { waitUntil: "networkidle", timeout: 60000 });

  console.log("Waiting for Flutter app to load...");
  await page.waitForTimeout(8000);

  // Take screenshot
  await page.screenshot({ path: "scripts/copafacil-screenshot.png", fullPage: false });
  console.log("Screenshot saved.");

  // Try to extract any visible text
  const text = await page.evaluate(() => document.body.innerText);
  console.log("Page text:", text?.substring(0, 1000));

  // Try clicking around if buttons are visible
  const buttons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("button, a, [role=button], canvas")).map(el => ({
      tag: el.tagName,
      text: el.textContent?.substring(0, 50),
      rect: el.getBoundingClientRect(),
      classes: el.className?.substring(0, 100),
    })).filter(b => b.rect.width > 0 && b.rect.height > 0);
  });
  console.log(`Found ${buttons.length} interactive elements`);
  buttons.slice(0, 20).forEach(b => console.log(`  ${b.tag}: "${b.text}" at ${b.rect.x},${b.rect.y} ${b.rect.width}x${b.rect.height}`));

  // Print network requests
  console.log("\n=== NETWORK REQUESTS ===");
  requests.forEach(r => {
    console.log(`[${r.type}] ${r.method || ""} ${r.url}`);
    if (r.body) console.log(`  Body: ${r.body}`);
  });

  await browser.close();
}

main().catch(console.error);
