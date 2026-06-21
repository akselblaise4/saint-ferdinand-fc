import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

let firebaseWS = null;
let nextRequestId = 500;

page.on("websocket", (ws) => {
  if (!ws.url().includes("firebaseio")) return;
  firebaseWS = ws;

  ws.on("framereceived", (frame) => {
    try {
      const text = (frame.payload || "").trim();
      if (text.includes("eventData") || text.includes("details") || text.includes("/events/-5qp1c@5jvbh") && text.length > 200) {
        console.log("\n*** RECV ***:", text.substring(0, 4000));
      }
    } catch {}
  });
});

await page.goto("https://copafacil.com/-5qp1c@5jvbh", { waitUntil: "domcontentloaded", timeout: 20000 });
console.log("Waiting for Flutter...");
await page.waitForTimeout(20000);

if (firebaseWS) {
  // Send a Firebase query for the details path
  const queryMsg = JSON.stringify({
    t: "d",
    d: { r: nextRequestId++, a: "q", b: { p: "/events/-5qp1c@5jvbh/details", h: "" } }
  });
  console.log("Sending Firebase query for details path:", queryMsg);
  firebaseWS.send(queryMsg);

  // Also query per-match details for a known match ID
  const matchIds = ["-OqC_FQbzrz6biJyLrgY", "-OqC_GXUXoNpefLZvgrA", "-OqC_DyMZey8vTF5Shq5"];
  for (const mid of matchIds) {
    const msg = JSON.stringify({
      t: "d",
      d: { r: nextRequestId++, a: "q", b: { p: "/events/-5qp1c@5jvbh/details/" + mid, h: "" } }
    });
    console.log("Sending query:", msg);
    firebaseWS.send(msg);
  }

  await page.waitForTimeout(5000);
} else {
  console.log("No Firebase WebSocket found!");
}

console.log("\n=== DONE ===");
await browser.close();
