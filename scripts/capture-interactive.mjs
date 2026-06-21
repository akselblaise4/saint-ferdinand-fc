import { chromium } from "playwright";
import fs from "fs";

const browser = await chromium.launch({
  headless: false,
  args: ["--start-maximized"],
});
const page = await browser.newPage({});

const captured = { queries: [], responses: [] };
let totalBytes = 0;

page.on("websocket", (ws) => {
  if (!ws.url().includes("firebaseio")) return;
  ws.on("framesent", (frame) => {
    const text = frame.payload || "";
    if (text.length > 20) { captured.queries.push({ time: Date.now(), data: text }); totalBytes += text.length; }
  });
  ws.on("framereceived", (frame) => {
    const text = frame.payload || "";
    if (text.length > 20) { captured.responses.push({ time: Date.now(), data: text }); totalBytes += text.length; }
  });
});

function saveNow() {
  const essential = {
    capturedAt: new Date().toISOString(),
    queriesCount: captured.queries.length,
    responsesCount: captured.responses.length,
    detailsResponses: captured.responses
      .filter(r => r.data.includes("details"))
      .map(r => {
        try {
          const parsed = JSON.parse(r.data);
          return { path: parsed?.d?.b?.p, data: parsed?.d?.b?.d };
        } catch { return null; }
      }).filter(Boolean),
    allQueries: captured.queries.map(q => q.data),
    allResponses: captured.responses.map(r => r.data),
  };
  fs.writeFileSync("data/captured-session.json", JSON.stringify(essential, null, 2));
  return essential.detailsResponses.length;
}

// Auto-save every 10 seconds
setInterval(() => {
  const dc = saveNow();
  console.log(`[${new Date().toLocaleTimeString()}] Queries: ${captured.queries.length} | Responses: ${captured.responses.length} | Con 'details': ${dc} | ${(totalBytes / 1024).toFixed(0)} KB`);
}, 10000);

await page.goto("https://copafacil.com/-5qp1c@5jvbh", { waitUntil: "domcontentloaded", timeout: 30000 });
await page.waitForTimeout(12000);

console.log("\n========================================");
console.log("✅ LISTO! Chrome abierto con Copa Fácil.");
console.log("Navegá tranquilo y hace click en los partidos");
console.log("para ver goles, tarjetas, etc.");
console.log("Cuando termines, decime 'YA' en el chat.");
console.log("========================================\n");

// Keep alive
process.stdin.resume();
await new Promise(() => {});
