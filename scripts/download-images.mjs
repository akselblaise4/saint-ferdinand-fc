import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const OUTPUT_DIR = "public/images";
const IMAGES = [
  { query: "football-soccer-stadium-crowd", desc: "stadium-crowd" },
  { query: "football-player-action-kick", desc: "player-action" },
  { query: "football-team-celebration", desc: "team-celebration" },
  { query: "football-coach-tactics", desc: "coach" },
  { query: "soccer-ball-grass", desc: "soccer-ball" },
  { query: "football-fans-banner", desc: "fans-banner" },
  { query: "football-stadium-aerial", desc: "stadium-aerial" },
  { query: "football-goal-celebration", desc: "goal" },
  { query: "football-training-session", desc: "training" },
  { query: "soccer-player-portrait", desc: "player-portrait" },
  { query: "football-stadium-night-floodlights", desc: "stadium-night" },
  { query: "football-kit-jersey", desc: "kit" },
];

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
page.setDefaultTimeout(15000);

let downloaded = 0;

for (const img of IMAGES) {
  const url = `https://unsplash.com/s/photos/${img.query}`;
  console.log(`\n[${downloaded + 1}/${IMAGES.length}] Searching: ${url}`);
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 20000 });
    await page.waitForTimeout(2000);
    // Get first photo link
    const link = await page.$('a[href*="/photos/"]');
    if (!link) { console.log("  No photo found"); continue; }
    const href = await link.getAttribute("href");
    if (!href) { console.log("  No href"); continue; }
    const photoId = href.replace("/photos/", "");
    console.log(`  Photo ID: ${photoId}`);
    // Navigate to photo page
    await page.goto(`https://unsplash.com/photos/${photoId}`, { waitUntil: "networkidle", timeout: 20000 });
    await page.waitForTimeout(1000);
    // Click download button
    const dlBtn = await page.$('a[download]');
    if (dlBtn) {
      const dlHref = await dlBtn.getAttribute("href");
      if (dlHref) {
        const ext = dlHref.includes("force=true") ? "jpg" : "jpg";
        const filePath = path.join(OUTPUT_DIR, `${img.desc}.${ext}`);
        console.log(`  Downloading: ${dlHref.substring(0, 80)}...`);
        // Download via page
        const response = await page.goto(dlHref, { timeout: 30000 });
        if (response && response.ok()) {
          const buffer = await response.body();
          fs.writeFileSync(filePath, buffer);
          console.log(`  Saved: ${filePath} (${(buffer.length / 1024).toFixed(0)} KB)`);
          downloaded++;
        }
      }
    } else {
      // Try direct download URL pattern
      const dlUrl = `https://unsplash.com/photos/${photoId}/download?force=true`;
      console.log(`  Direct: ${dlUrl}`);
      const response = await page.goto(dlUrl, { timeout: 30000 });
      if (response && response.ok()) {
        const buffer = await response.body();
        const filePath = path.join(OUTPUT_DIR, `${img.desc}.jpg`);
        fs.writeFileSync(filePath, buffer);
        console.log(`  Saved: ${filePath} (${(buffer.length / 1024).toFixed(0)} KB)`);
        downloaded++;
      }
    }
  } catch (e) {
    console.log(`  Error: ${e.message?.substring(0, 80)}`);
  }
}

await browser.close();
console.log(`\nDone. Downloaded ${downloaded}/${IMAGES.length} images.`);
