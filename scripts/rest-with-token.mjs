import { chromium } from "playwright";
import fs from "fs";

const EVENT = "-5qp1c";
const GROUP = "5jvbh";

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage({ viewport: { width: 1920, height: 1080 } });

let authToken = null;

// Intercept the secure_code API call to capture auth token
await page.route("**/api2/secure_code", async (route) => {
  const headers = route.request().headers();
  const auth = headers["authorization"];
  if (auth) {
    authToken = auth.replace("Bearer ", "");
    console.log("CAPTURED AUTH TOKEN:", authToken.substring(0, 50) + "...");
  }
  await route.continue();
});

await page.goto(`https://copafacil.com/${EVENT}@${GROUP}`, { waitUntil: "domcontentloaded", timeout: 30000 });
await page.waitForTimeout(20000);

if (authToken) {
  console.log("\n=== Testing REST API with captured token ===");
  
  // Try matchs
  const dbUrl = "https://copafacil-web.firebaseio.com";
  
  const matchsResp = await fetch(`${dbUrl}/events/${EVENT}/matchs.json?auth=${authToken}`);
  const matchsData = await matchsResp.json();
  
  if (matchsData && typeof matchsData === "object" && !matchsData.error) {
    const keys = Object.keys(matchsData);
    console.log(`✅ Matchs: ${keys.length} matches`);
    
    // Filter for our group
    const groupKeys = keys.filter(k => {
      const m = matchsData[k];
      return m && typeof m === "object" && m.evt === `${EVENT}@${GROUP}`;
    });
    console.log(`   Group matches (${EVENT}@${GROUP}): ${groupKeys.length}`);
    
    // Save match data
    fs.writeFileSync("data/matchs-rest.json", JSON.stringify({
      allKeys: keys,
      groupKeys,
      data: matchsData,
    }, null, 2));
    
    // Try details for a match
    if (groupKeys.length > 0) {
      const sampleKey = groupKeys[0];
      console.log(`\nQuerying details for ${sampleKey}...`);
      const detailsResp = await fetch(`${dbUrl}/events/${EVENT}@${GROUP}/details/${sampleKey}.json?auth=${authToken}`);
      const detailsData = await detailsResp.json();
      
      if (detailsData && typeof detailsData === "object" && detailsData.list) {
        const listKeys = Object.keys(detailsData.list);
        console.log(`✅ Details: ${listKeys.length} events`);
        console.log(`   Sample: ${JSON.stringify(detailsData.list[listKeys[0]])}`);
      } else {
        console.log("Details response:", JSON.stringify(detailsData).substring(0, 300));
      }
    }
    
    // Try querying ALL details
    console.log("\nQuerying all match details via REST...");
    const allDetails = {};
    for (let i = 0; i < groupKeys.length; i++) {
      const mk = groupKeys[i];
      try {
        const resp = await fetch(`${dbUrl}/events/${EVENT}@${GROUP}/details/${mk}.json?auth=${authToken}`);
        const data = await resp.json();
        if (data && typeof data === "object" && data.list) {
          allDetails[mk] = data;
        }
      } catch (e) {
        console.log(`  Error for ${mk}: ${e.message}`);
      }
      if ((i + 1) % 20 === 0) console.log(`  ${i + 1}/${groupKeys.length} - ${Object.keys(allDetails).length} found`);
    }
    console.log(`Total details found: ${Object.keys(allDetails).length}/${groupKeys.length}`);
    
    // Collect player IDs
    const playerIds = new Set();
    for (const [mk, data] of Object.entries(allDetails)) {
      if (data.list) {
        for (const [ts, ev] of Object.entries(data.list)) {
          if (ev.pl_id1) playerIds.add(ev.pl_id1);
        }
      }
    }
    console.log(`Unique player IDs: ${playerIds.size}`);
    
    // Query player names
    console.log("Querying player data...");
    const playerNames = {};
    let pCount = 0;
    for (const plId of playerIds) {
      try {
        const resp = await fetch(`${dbUrl}/events/${EVENT}@${GROUP}/player/${plId}.json?auth=${authToken}`);
        const data = await resp.json();
        if (data && typeof data === "object") {
          playerNames[plId] = data.nome || data.name || data.num || "(no name)";
        }
      } catch {}
      pCount++;
      if (pCount % 50 === 0) console.log(`  Players: ${pCount}/${playerIds.size} - ${Object.keys(playerNames).length} found`);
    }
    
    // Save all data
    fs.writeFileSync("data/copa-complete-rest.json", JSON.stringify({
      token: authToken,
      matchCount: groupKeys.length,
      detailsCount: Object.keys(allDetails).length,
      playerCount: Object.keys(playerNames).length,
      matches: matchsData,
      details: allDetails,
      players: playerNames,
    }, null, 2));
    
    console.log("\nSaved data/copa-complete-rest.json");
    console.log(`Matches: ${Object.keys(allDetails).length}, Players: ${Object.keys(playerNames).length}`);
  } else {
    console.log("Error reading matchs:", JSON.stringify(matchsData).substring(0, 300));
  }
} else {
  console.log("No auth token captured - the API call might not have been made");
  console.log("Flutter app might use a different auth flow");
}

await browser.close();
