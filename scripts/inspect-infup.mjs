import fs from "fs";

const raw = fs.readFileSync("data/captured-session.json", "utf8");
const data = JSON.parse(raw);

// Find inf_up response
console.log("=== INF_UP DATA ===");
for (const resp of data.allResponses) {
  if (resp.includes("inf_up")) {
    try {
      // Parse and truncate to find the structure
      const startIdx = resp.indexOf('{"t":"d"');
      if (startIdx >= 0) {
        const json = resp.substring(startIdx);
        const parsed = JSON.parse(json);
        const path = parsed?.d?.b?.p || "";
        console.log("Path:", path);
        const d = parsed?.d?.b?.d;
        if (d && typeof d === "object") {
          console.log("Keys:", Object.keys(d));
          
          // at = player data
          if (d.at && typeof d.at === "object") {
            const atKeys = Object.keys(d.at);
            console.log(`'at' has ${atKeys.length} entries`);
            for (const plId of atKeys.slice(0, 5)) {
              const pl = d.at[plId];
              console.log(`  ${plId}: nome="${pl.nome}", num=${pl.num}, url="${(pl.url||'').substring(0,60)}"`);
            }
          }
          
          // gr = groups?
          if (d.gr && typeof d.gr === "object") {
            console.log(`'gr' has ${Object.keys(d.gr).length} entries`);
          }
          
          // Check for other fields
          for (const k of Object.keys(d)) {
            if (k !== 'at' && k !== 'gr') {
              const v = d[k];
              if (typeof v === 'object') {
                console.log(`${k}: object with ${Object.keys(v).length} keys`);
              } else {
                console.log(`${k}: ${v}`);
              }
            }
          }
        }
        break;
      }
    } catch(e) {
      console.log("Parse error:", e.message.substring(0, 100));
    }
  }
}

console.log("\n=== Also looking for UPDATE responses that contain 'pl' field ===");
for (const resp of data.allResponses) {
  if (resp.includes('"dt"') && resp.includes('"name"') && !resp.includes('inf_up')) {
    // Check if it's a teams update
    try {
      const startIdx = resp.indexOf('{"t":"d"');
      if (startIdx >= 0) {
        const json = resp.substring(startIdx);
        const parsed = JSON.parse(json);
        const path = parsed?.d?.b?.p || "";
        const d = parsed?.d?.b?.d;
        if (path && (path.includes("teams") || path.includes("inf_up"))) {
          console.log("Extra data at:", path, "keys:", d ? Object.keys(d).slice(0,5) : "null");
        }
      }
    } catch {}
  }
}

// Check what queries the bot made for details
console.log("\n=== DETAILS QUERIES IN SESSION ===");
for (const q of data.allQueries || []) {
  if (q.includes("details")) {
    try {
      const parsed = JSON.parse(q);
      const path = parsed?.d?.b?.p || "";
      console.log("  Query path:", path);
    } catch {}
  }
}
