import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

let eventDataFound = false;

page.on("websocket", (ws) => {
  const url = ws.url();
  if (!url.includes("firebaseio")) return;

  console.log("\n=== WebSocket connected");

  ws.on("framesent", (frame) => {
    try {
      const text = frame.payload || "";
      if (text.length < 20) return;

      // Filter out keep-alive and connection frames
      if (text.startsWith('{"t":"k"') || text.startsWith('{"t":"c"') || text.startsWith('{"t":"n"')) return;

      // Look for eventData or match-related queries
      if (text.includes("eventData") || text.includes("/events/") || text.includes("match")) {
        console.log("\nSENT:", text.substring(0, 1000));
      }

      // Print all non-trivial frames for analysis
      if (!eventDataFound && text.length < 500) {
        console.log("SENT (other):", text.substring(0, 300));
      }
    } catch {}
  });

  ws.on("framereceived", (frame) => {
    try {
      const text = frame.payload || "";
      if (text.length < 50) return;

      if (text.includes("eventData") || text.includes("EventData")) {
        eventDataFound = true;
        console.log("\n*** EVENTDATA FOUND ***");
        console.log("RECV:", text.substring(0, 2000));
      }

      // Look for data responses containing match event data
      if (text.includes("goals") || text.includes("cards") || text.includes("tarjetas") || text.includes("goles")) {
        console.log("\n*** GOALS/CARDS DATA ***");
        console.log("RECV:", text.substring(0, 2000));
      }

      // Large data responses
      if (text.length > 500 && !text.startsWith('{"t":"d"')) {
        console.log("\nRECV (large):", text.substring(0, 500));
      }
    } catch {}
  });
});

await page.goto("https://copafacil.com/-5qp1c@5jvbh", { waitUntil: "domcontentloaded", timeout: 20000 });
console.log("Page loaded, waiting 25s for Flutter data sync...");
await page.waitForTimeout(25000);

console.log("\n=== DONE ===");
await browser.close();
