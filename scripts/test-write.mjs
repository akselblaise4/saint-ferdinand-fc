import fs from "fs";
fs.writeFileSync("data/test-from-script.txt", "test " + Date.now());
console.log("Written");
