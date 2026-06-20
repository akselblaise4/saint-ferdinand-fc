import https from "https";

https.get("https://copafacil.b-cdn.net/main.dart.js?v=2026-10-04", { headers: { Range: "bytes=0-500000" } }, res => {
  let d = [];
  res.on("data", c => d.push(c));
  res.on("end", () => {
    const js = Buffer.concat(d).toString();
    const patterns = ["partidos", "matches", "plantill", "equipos", "fechas", "calendario", "tabla", "noticias"];
    patterns.forEach(p => {
      const idx = js.indexOf(p);
      if (idx >= 0) {
        console.log(p + " at " + idx + ": " + js.substring(Math.max(0, idx - 30), idx + 50));
      }
    });
    console.log("--- Firebase patterns ---");
    const fbase = ["once(", "firebase", "database", "child("];
    fbase.forEach(p => {
      const idx = js.indexOf(p);
      if (idx >= 0) console.log(p + " at " + idx + ": " + js.substring(idx, idx + 80));
    });
  });
}).on("error", console.error);
