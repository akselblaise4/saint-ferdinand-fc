import { chromium } from "playwright";
import fs from "fs";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ 
    viewport: { width: 1920, height: 1080 },
    locale: "pt-BR"
  });
  const page = await context.newPage();

  const wsMessages = [];
  const apiResponses = [];

  // Intercept WebSocket
  page.on("websocket", ws => {
    const url = ws.url();
    console.log(`WS connected: ${url.substring(0, 150)}`);
    ws.on("framesent", frame => {
      wsMessages.push({ dir: "sent", payload: frame.payload.substring(0, 300) });
    });
    ws.on("framereceived", frame => {
      wsMessages.push({ dir: "recv", payload: frame.payload.substring(0, 500) });
    });
  });

  // Listen for Firebase auth events in page
  await page.addInitScript(() => {
    // Intercept Firebase database references to extract data
    const origFetch = window.fetch;
    window.fetch = async (...args) => {
      const url = typeof args[0] === 'string' ? args[0] : args[0]?.url;
      if (url && (url.includes('firebaseio') || url.includes('firestore'))) {
        console.log('FETCH INTERCEPTED:', url);
      }
      return origFetch.apply(window, args);
    };
  });

  page.on("response", async res => {
    const url = res.url();
    if (url.includes(".json") || url.includes("firebaseio") || url.includes("firestore")) {
      try {
        const text = await res.text();
        apiResponses.push({ url: url.substring(0, 200), body: text.substring(0, 1000) });
        console.log(`FB RESP [${res.status()}]: ${url.substring(0, 120)}`);
      } catch(e) {}
    }
  });

  console.log("Loading page...");
  await page.goto("https://copafacil.com/-5qp1c@5jvbh", {
    waitUntil: "domcontentloaded",
    timeout: 20000,
  });

  console.log("Waiting...");
  await page.waitForTimeout(15000);

  console.log(`\n=== WS MESSAGES: ${wsMessages.length} ===`);
  wsMessages.forEach((m, i) => {
    console.log(`[${i+1}] ${m.dir}: ${m.payload.substring(0, 200)}`);
  });

  console.log(`\n=== API RESPONSES: ${apiResponses.length} ===`);
  apiResponses.forEach((r, i) => {
    console.log(`[${i+1}] ${r.url}`);
    console.log(`  ${r.body.substring(0, 300)}`);
  });

  // Try extracting semantics tree (Flutter accessibility)
  const semantics = await page.evaluate(() => {
    const nodes = document.querySelectorAll("[flutter-semantics]");
    return Array.from(nodes).map(n => n.getAttribute("flutter-semantics")).slice(0, 100);
  });
  console.log(`\n=== SEMANTICS: ${semantics.length} ===`);
  semantics.forEach((s, i) => console.log(`[${i+1}] ${s}`));

  // Take screenshot
  await page.screenshot({ path: "scripts/copafacil-ws.png", fullPage: false });

  await browser.close();
}

main().catch(console.error);
