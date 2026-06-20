import https from "https";

// Download chunk of dart.js around "matches" area
https.get("https://copafacil.b-cdn.net/main.dart.js?v=2026-10-04", { headers: { Range: "bytes=39000-50000" } }, res => {
  let d = [];
  res.on("data", c => d.push(c));
  res.on("end", () => {
    const js = Buffer.concat(d).toString();
    console.log("--- Around 'matches' in dart.js ---");
    console.log(js);
  });
}).on("error", console.error);
