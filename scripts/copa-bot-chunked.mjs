import { chromium } from "playwright";
import fs from "fs";

const EVENT = "-5qp1c";
const GROUP = "5jvbh";

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage({ viewport: { width: 1920, height: 1080 } });

const wsFrames = [];

page.on("websocket", (ws) => {
  if (!ws.url().includes("firebaseio")) return;
  ws.on("framereceived", (frame) => {
    wsFrames.push({ time: Date.now(), payload: frame.payload || "" });
  });
});

await page.goto(`https://copafacil.com/${EVENT}@${GROUP}`, { waitUntil: "domcontentloaded", timeout: 30000 });
await page.waitForTimeout(30000);

console.log(`Captured ${wsFrames.length} WS frames`);

// Look for frames that start a matchs response
let matchsFrames = [];
let inMatchs = false;
let matchsAckReceived = false;

for (const f of wsFrames) {
  const payload = f.payload;
  
  // Detect start of matchs data response
  if (payload.includes('"p":"events/-5qp1c/matchs"') || payload.includes('"p":"/events/-5qp1c/matchs"')) {
    inMatchs = true;
    matchsAckReceived = false;
    matchsFrames = [f];
    continue;
  }
  
  // Detect end (ack response)
  if (inMatchs && payload.includes('"s":"ok"')) {
    matchsFrames.push(f);
    matchsAckReceived = true;
    break;
  }
  
  if (inMatchs) {
    matchsFrames.push(f);
  }
}

if (matchsFrames.length > 0) {
  console.log(`Matchs response: ${matchsFrames.length} frames`);
  
  // First 2 frames for debugging
  console.log("Frame 1:", matchsFrames[0].payload.substring(0, 300));
  console.log("Frame 2:", matchsFrames[1]?.payload?.substring(0, 200));
  
  // Try to extract the data path from the start frame
  const startFrame = matchsFrames[0].payload;
  const pathMatch = startFrame.match(/"p":"([^"]+)"/);
  const dataPath = pathMatch ? pathMatch[1] : "?";
  console.log("Path:", dataPath);
  
  // Try to reconstruct by finding the JSON structure
  // The first frame contains: {"t":"d","d":{"b":{"p":"path","d":...DATA_STARTS...
  // and subsequent frames are the CONTINUATION of the data
  // The last "ok" frame can be ignored
  
  // Extract the prefix before "d":{
  const prefixMatch = startFrame.match(/^(.*?"d"\s*:\s*\{)/s);
  if (prefixMatch) {
    const prefix = prefixMatch[0];
    // Get the start of data after "d":{
    const dataStart = startFrame.substring(prefixMatch[0].length);
    
    // Concatenate all middle frames (excluding start and ack)
    let fullData = dataStart;
    for (let i = 1; i < matchsFrames.length - 1; i++) {
      fullData += matchsFrames[i].payload;
    }
    
    // Strip the ack frame if present
    // Now we need to close the JSON by adding }}}}
    // The original JSON was: {"t":"d","d":{"b":{"p":"path","d":{...}},"a":"d"}}
    // We stripped {"t":"d","d":{ and the data follows
    // After all data, we need: }},"a":"d"}}
    
    // Actually let's just try parsing as-is first
    try {
      // Try wrapping it: prefix + data + closing
      const reconstructed = prefix + fullData + '}},"a":"d"}}';
      const parsed = JSON.parse(reconstructed);
      const matchData = parsed?.d?.b?.d;
      
      if (matchData && typeof matchData === "object") {
        const keys = Object.keys(matchData);
        console.log(`\nParsed matchs data! ${keys.length} matches`);
        
        // Filter for our group
        const groupKeys = keys.filter(k => {
          const m = matchData[k];
          return m && m.evt === `${EVENT}@${GROUP}`;
        });
        console.log(`Group matches: ${groupKeys.length}`);
        
        // Save the data
        fs.writeFileSync("data/matchs-reconstructed.json", JSON.stringify(matchData, null, 2));
        
        // Now we have match IDs! Let's query details for each.
        console.log("\nQuerying details...");
        
        // Get a queryable WS reference
        const hasWs = await page.evaluate(() => !!window.__fbWebSocket);
        if (hasWs) {
          for (let i = 0; i < Math.min(groupKeys.length, 5); i++) {
            const mk = groupKeys[i];
            const r = 20000 + i;
            const msg = JSON.stringify({ t: "d", d: { r, a: "q", b: { p: `/events/${EVENT}@${GROUP}/details/${mk}`, h: "" } } });
            
            const b4 = wsFrames.length;
            await page.evaluate((m) => window.__fbWebSocket?.send(m), msg);
            await page.waitForTimeout(3000);
            
            // Look for the details response in new frames
            for (let j = b4; j < wsFrames.length; j++) {
              if (wsFrames[j].payload.includes(mk) && wsFrames[j].payload.includes("list")) {
                console.log(`  ${mk}: details found (frame ${j})`);
                break;
              }
            }
          }
          
          // Save all new frames
          const newFrames = wsFrames.filter(f => f.time > Date.now() - 60000);
          const detailsResponses = newFrames
            .filter(f => f.payload.includes("details") || f.payload.includes("list"))
            .map(f => f.payload.substring(0, 500));
          
          // Try to find the complete details responses  
          console.log("\nDetails frames:", detailsResponses.length > 0 ? detailsResponses.length : "none found");
          if (detailsResponses.length > 0) {
            // Reconstruct each detail response
            const detailsResults = {};
            let inDetail = false;
            let detailKey = "";
            let detailParts = [];
            
            for (const f of wsFrames.slice(b4)) {
              const p = f.payload;
              if (p.includes('"p":"') && p.includes('"d"')) {
                // Start of a new response
                if (inDetail && detailKey) {
                  // Save previous
                  detailsResults[detailKey] = detailParts.join("");
                }
                const pathM = p.match(/"p":"events\/[^@]+@[^/]+\/details\/(\d+)"/);
                if (pathM) {
                  detailKey = pathM[1];
                  inDetail = true;
                  detailParts = [p];
                } else {
                  inDetail = false;
                }
              } else if (inDetail && detailKey) {
                if (p.includes('"s":"ok"')) {
                  // End of response
                  detailsResults[detailKey] = detailParts.join("");
                  inDetail = false;
                  detailKey = "";
                  detailParts = [];
                } else {
                  detailParts.push(p);
                }
              }
            }
            
            if (Object.keys(detailsResults).length > 0) {
              console.log(`Reconstructed ${Object.keys(detailsResults).length} detail responses`);
              for (const [mk, raw] of Object.entries(detailsResults)) {
                try {
                  const parsed = JSON.parse(raw);
                  const data = parsed?.d?.b?.d;
                  if (data?.list) {
                    const count = Object.keys(data.list).length;
                    console.log(`  ${mk}: ${count} events`);
                  }
                } catch (e) {
                  console.log(`  ${mk}: parse error (${e.message.substring(0, 50)})`);
                }
              }
            }
          }
        }
      }
    } catch (e) {
      console.log("Parse error:", e.message.substring(0, 100));
      // Save raw for debugging
      fs.writeFileSync("data/matchs-raw-reconstruction.txt", 
        "Prefix: " + prefix + "\n\nData:\n" + fullData.substring(0, 5000));
    }
  }
} else {
  console.log("No matchs response found in captured frames");
}

await browser.close();
