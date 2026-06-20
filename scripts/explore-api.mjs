import { chromium } from "playwright";
import fs from "fs";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

// Explore the copafacil.com REST APIs
const apis = [
  "https://copafacil.com/request/event?id=-5qp1c",
  "https://copafacil.com/request/more_info?id=-5qp1c&m=1776281620002",
  "https://copafacil.com/api/request/user/?uid=ZBJs7taX2wbT7LuUmPIbeAWRmt63&a=1",
  "https://copafacil.com/request/event?id=-5qp1c@5jvbh",
  "https://copafacil.com/request/more_info?id=-5qp1c@5jvbh&m=1776281620002",
];

console.log("=== API RESPONSES ===\n");
for (const url of apis) {
  try {
    const resp = await page.evaluate(async (u) => {
      const r = await fetch(u);
      const text = await r.text();
      return text.substring(0, 1000);
    }, url);
    console.log(`${url.substring(0, 80)}:`);
    console.log(`  ${resp}\n`);
  } catch (e) {
    console.log(`${url.substring(0, 80)}: ERROR ${e.message}\n`);
  }
}

// Also check: what other API endpoints might exist?
console.log("\n=== TRYING MORE API PATHS ===");
const morePaths = [
  "https://copafacil.com/request/standings?id=-5qp1c@5jvbh",
  "https://copafacil.com/request/top_scorers?id=-5qp1c@5jvbh",
  "https://copafacil.com/request/artilheiros?id=-5qp1c@5jvbh",
  "https://copafacil.com/request/players?id=-5qp1c@5jvbh&-OqC_DyMZey8vTF5Shq5",
  "https://copafacil.com/request/team?id=-5qp1c@5jvbh&-OqC_DyMZey8vTF5Shq5",
  "https://copafacil.com/request/stats?id=-5qp1c@5jvbh",
];

for (const url of morePaths) {
  try {
    const resp = await page.evaluate(async (u) => {
      const r = await fetch(u);
      const text = await r.text();
      return text.substring(0, 500);
    }, url);
    console.log(`${url.substring(0, 80)}:`);
    console.log(`  ${resp}\n`);
  } catch {
    console.log(`${url.substring(0, 80)}: ERROR\n`);
  }
}

// Now try loading the page and see what the app fetches when navigating to players
console.log("\n=== LOADING APP AND FETCHING /request/event ===");
await page.goto("https://copafacil.com/-5qp1c@5jvbh", { waitUntil: "load", timeout: 30000 });
await page.waitForTimeout(3000);

// Try clicking on the "Equipos" tab and see what MORE_INFO returns
const resp2 = await page.evaluate(async () => {
  const r = await fetch("https://copafacil.com/request/event?id=-5qp1c");
  const text = await r.text();
  return text;
});
// Save full response
fs.writeFileSync("data/api-event-response.json", resp2);
console.log(`Event API response saved (${(resp2.length / 1024).toFixed(0)} KB)`);

// Try to find player data via searching all strings in the response
console.log("\n=== SEARCHING FOR PLAYER DATA ===");
const resp3 = await page.evaluate(async () => {
  const r = await fetch("https://copafacil.com/request/more_info?id=-5qp1c@5jvbh&m=0");
  const text = await r.text();
  return text;
});
fs.writeFileSync("data/api-moreinfo-response.json", resp3);
console.log(`MoreInfo API response saved (${(resp3.length / 1024).toFixed(0)} KB)`);

await browser.close();
