import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

// Try the Copa Fácil web version for player stats
// The web app might have a different API for statistics
const endpoints = [
  // Direct API paths
  { url: "https://copafacil.com/request/more_info?id=-5qp1c&m=1776281620002", desc: "Event info" },
  { url: "https://copafacil.com/request/event?id=-5qp1c@5jvbh", desc: "Group event info" },
  // Try specific endpoint names
  { url: "https://copafacil.com/request/players/stats?id=-5qp1c@5jvbh&t=-OqC_DyMZey8vTF5Shq5", desc: "Players stats" },
  { url: "https://copafacil.com/request/statistics/top_scorers?id=-5qp1c@5jvbh", desc: "Top scorers" },
  { url: "https://copafacil.com/request/event/statistics?id=-5qp1c@5jvbh", desc: "Event statistics" },
  // The 'm' parameter might be a team or match ID
  { url: "https://copafacil.com/request/more_info?id=-5qp1c@5jvbh&m=-OqC_DyMZey8vTF5Shq5", desc: "Team more_info" },
  { url: "https://copafacil.com/request/more_info?id=-5qp1c&t=-5qp1c@5jvbh", desc: "With t param" },
  // PHP-style API
  { url: "https://copafacil.com/api/request/stats?id=-5qp1c@5jvbh", desc: "API stats" },
  { url: "https://copafacil.com/api/request/players?id=-5qp1c@5jvbh&-OqC_DyMZey8vTF5Shq5", desc: "API players" },
  // New endpoint patterns
  { url: "https://copafacil.com/request/classificacao?id=-5qp1c@5jvbh", desc: "Classificação (standings)" },
  { url: "https://copafacil.com/request/tabela?id=-5qp1c@5jvbh", desc: "Tabela" },
  { url: "https://copafacil.com/request/pontuacao?id=-5qp1c@5jvbh", desc: "Pontuação" },
  // App endpoints
  { url: "https://copafacil.com/app/request/statistics?id=-5qp1c@5jvbh", desc: "App statistics" },
  { url: "https://copafacil.com/api/request/statistics?id=-5qp1c@5jvbh", desc: "API request statistics" },
];

for (const ep of endpoints) {
  try {
    const resp = await page.evaluate(async (url) => {
      const r = await fetch(url);
      const text = await r.text();
      return { status: r.status, type: r.headers.get("content-type") || "", body: text.substring(0, 300) };
    }, ep.url);
    if (resp.body.startsWith("{") || resp.body.startsWith("[")) {
      console.log(`${ep.desc}: JSON (${resp.body.length} chars)`);
      console.log(`  ${resp.body.substring(0, 200)}\n`);
    }
  } catch {}
}

await browser.close();
