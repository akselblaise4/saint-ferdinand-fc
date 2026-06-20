import { chromium } from "playwright";
import fs from "fs";

async function main() {
  // Use headless: false to ensure WebGL/CanvasKit works
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--use-gl=angle', '--enable-webgl']
  });
  const context = await browser.newContext({ 
    viewport: { width: 1920, height: 1080 },
    locale: 'pt-BR'
  });
  const page = await context.newPage();

  const allData = [];

  page.on("response", async res => {
    const url = res.url();
    // Capture Firestore, Firebase Auth, and any data API calls
    if (
      url.includes("firestore.googleapis.com") ||
      url.includes("firebaseio.com") ||
      url.includes("identitytoolkit") ||
      url.includes("googleapis.com") ||
      url.includes("copafacil.com/api") ||
      (url.includes("copafacil") && url.includes(".json"))
    ) {
      try {
        const ct = res.headers()["content-type"] || "";
        let body = "";
        if (ct.includes("json") || ct.includes("text") || ct.includes("protobuf")) {
          const text = await res.text();
          body = text.substring(0, 2000);
        }
        allData.push({
          url: url.substring(0, 300),
          status: res.status(),
          contentType: ct.substring(0, 60),
          body
        });
      } catch(e) {}
    }
  });

  console.log("Loading Copa Fácil...");
  await page.goto("https://copafacil.com/-5qp1c@5jvbh", { 
    waitUntil: "networkidle", 
    timeout: 30000 
  });

  // Wait for Flutter to render and fetch data
  console.log("Waiting for Flutter...");
  await page.waitForTimeout(15000);

  // Log what we captured
  console.log(`\n=== CAPTURED ${allData.length} NETWORK RESPONSES ===`);
  allData.forEach((d, i) => {
    console.log(`\n[${i+1}] ${d.status} ${d.url}`);
    console.log(`  Type: ${d.contentType}`);
    if (d.body) console.log(`  Body: ${d.body.substring(0, 400)}`);
  });

  // Try to extract visible canvas text
  const canvasText = await page.evaluate(() => {
    const els = document.querySelectorAll('*');
    const texts = [];
    for (const el of els) {
      if (el.children.length === 0 && el.textContent?.trim()) {
        texts.push(el.tagName + ': ' + el.textContent.trim().substring(0, 100));
      }
    }
    return texts.slice(0, 50);
  });
  
  console.log("\n=== VISIBLE TEXT ===");
  canvasText.forEach(t => console.log(t));

  // Screenshot
  await page.screenshot({ path: "scripts/copafacil-loaded.png", fullPage: false });
  console.log("\nScreenshot saved.");

  await browser.close();
}

main().catch(console.error);
