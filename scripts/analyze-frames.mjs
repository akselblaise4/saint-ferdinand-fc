import fs from "fs";

const raw = JSON.parse(fs.readFileSync("data/matchs-raw-frames.json", "utf8"));
console.log(`Total recent frames: ${raw.length}`);

// Find where the matchs response starts
for (let i = 0; i < raw.length; i++) {
  const text = raw[i].text;
  if (text.includes("matchs") || text.includes('"p":"')) {
    console.log(`\n=== Frame ${i} (idx=${raw[i].idx}) ===`);
    console.log(text.substring(0, 500));
    console.log(`[... total ${text.length} chars]`);
  }
}

// Show all frames around the matchs query (the frames after a specific point)
console.log("\n=== ALL frames (last 30) ===");
for (let i = Math.max(0, raw.length - 30); i < raw.length; i++) {
  const text = raw[i].text;
  const preview = text.length > 120 ? text.substring(0, 120) + "..." : text;
  console.log(`[${i}] idx=${raw[i].idx} len=${text.length}: ${preview}`);
}
