import { chromium } from "playwright";
import fs from "fs";

const OUTPUT = "scripts/copafacil-data.json";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ 
    viewport: { width: 1920, height: 1080 },
    locale: "pt-BR"
  });
  const page = await context.newPage();

  const captured = [];

  page.on("response", async res => {
    const url = res.url();
    if (
      url.includes("copafacil.com/api/") ||
      url.includes("copafacil.com/api2/") ||
      (url.includes("copafacil") && (url.includes("match") || url.includes("team") || url.includes("player")))
    ) {
      try {
        const ct = res.headers()["content-type"] || "";
        let body = null;
        if (ct.includes("json")) {
          body = await res.json();
        } else if (ct.includes("text")) {
          body = await res.text();
        }
        captured.push({
          url: url,
          status: res.status(),
          contentType: ct,
          body: body,
        });
        console.log(`Captured [${res.status()}] ${url.substring(0, 120)}`);
      } catch(e) {}
    }
  });

  // Navigate to the USS Liga Premier event page
  await page.goto("https://copafacil.com/-5qp1c@5jvbh", {
    waitUntil: "networkidle",
    timeout: 30000,
  });

  // Wait for Flutter to fully initialize and render
  console.log("Waiting for Flutter app to render...");
  await page.waitForTimeout(10000);

  // Try clicking different navigation tabs to trigger data loads
  // The app likely has buttons for: Matchs, Classificacao, Times, Midias
  
  // First, let's try to interact with the canvas by clicking at common positions
  // Let's take screenshots to see what's rendered
  await page.screenshot({ path: "scripts/copafacil-initial.png", fullPage: false });

  // Get all the API data captured so far
  console.log(`\n=== CAPTURED ${captured.length} API CALLS ===`);
  captured.forEach((c, i) => {
    console.log(`\n[${i+1}] ${c.status} ${c.url}`);
    if (c.body && typeof c.body === "object") {
      const str = JSON.stringify(c.body).substring(0, 500);
      console.log(`  Data: ${str}`);
    } else if (c.body) {
      console.log(`  Body: ${c.body.substring(0, 500)}`);
    }
  });

  // Save full data
  fs.writeFileSync(OUTPUT, JSON.stringify(captured, null, 2));
  console.log(`\nFull data saved to ${OUTPUT}`);

  await browser.close();
}

main().catch(console.error);
