import https from "https";
https.get("https://copafacil.com/-5qp1c@5jvbh", res => {
  let d = [];
  res.on("data", c => d.push(c));
  res.on("end", () => {
    const html = Buffer.concat(d).toString();
    // Find main.dart.js URL
    const m = html.match(/main\.dart[^"]*/);
    console.log("Dart JS path:", m ? m[0] : "NOT FOUND");
    console.log("Has Flutter:", html.includes("flutter") || html.includes("Flutter"));
    // Search for route patterns in the dart.js file reference
    const scripts = html.match(/src="[^"]*\.js[^"]*"/g) || [];
    scripts.forEach(s => console.log("  Script:", s));
    // Search for route-like words in HTML
    const routeWords = html.match(/partidos|matches|equipos|plantilla|fechas|fixtures|tabla|noticias|jugadores/gi);
    console.log("Route words in HTML:", routeWords ? [...new Set(routeWords)].join(", ") : "none");
  });
}).on("error", console.error);
