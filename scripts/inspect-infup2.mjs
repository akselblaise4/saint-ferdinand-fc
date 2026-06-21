import fs from "fs";

const raw = fs.readFileSync("data/captured-session.json", "utf8");
const data = JSON.parse(raw);

// Find ALL responses that contain "inf_up" 
console.log("=== ALL RESPONSES WITH 'inf_up' ===");
let count = 0;
for (const resp of data.allResponses) {
  if (resp.includes("inf_up")) {
    count++;
    console.log(`\n[Response ${count}] length=${resp.length}`);
    console.log(resp.substring(0, 1000));
    if (resp.length > 1000) console.log(`... (truncated, total ${resp.length} chars)`);
  }
}
console.log(`\nTotal 'inf_up' responses: ${count}`);

// Also find all responses with 'nome' (player name field)
console.log("\n=== FIRST RESPONSE WITH 'nome' ===");
for (const resp of data.allResponses) {
  if (resp.includes('"nome"')) {
    console.log(`length=${resp.length}`);
    console.log(resp.substring(0, 2000));
    break;
  }
}

// Check allQueries for the full path hierarchy
console.log("\n=== ALL QUERIED PATHS ===");
const paths = new Set();
for (const q of data.allQueries || []) {
  try {
    const parsed = JSON.parse(q);
    const p = parsed?.d?.b?.p || "";
    if (p) paths.add(p);
  } catch {}
}
for (const p of [...paths].sort()) {
  console.log("  " + p);
}
