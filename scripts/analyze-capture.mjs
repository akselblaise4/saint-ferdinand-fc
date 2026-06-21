import fs from "fs";
import path from "path";

const raw = fs.readFileSync("data/captured-session.json", "utf8");
const data = JSON.parse(raw);

console.log("=== Estadísticas generales ===");
console.log("Queries:", data.queriesCount || data.allQueries?.length || 0);
console.log("Responses:", data.responsesCount || data.allResponses?.length || 0);
console.log("Frames con 'details':", data.detailsResponses?.length || 0);

// Analyze details responses
if (data.detailsResponses && data.detailsResponses.length > 0) {
  console.log("\n=== DATOS DE DETALLES DE PARTIDOS ENCONTRADOS ===");
  
  for (const r of data.detailsResponses) {
    console.log("\n---");
    console.log("Path:", r.path);
    const matchId = r.path?.split("/").pop();
    console.log("Match ID:", matchId);
    
    if (r.data && typeof r.data === "object") {
      const entryKeys = Object.keys(r.data);
      console.log("Total entries:", entryKeys.length);
      
      // Show first 3 entries
      for (let i = 0; i < Math.min(3, entryKeys.length); i++) {
        const entryKey = entryKeys[i];
        const entry = r.data[entryKey];
        console.log(`\n[Entry ${i + 1}: ${entryKey}]`);
        if (typeof entry === "object") {
          console.log("Fields:", Object.keys(entry));
          // Show first item inside entry
          const innerKeys = Object.keys(entry);
          for (let j = 0; j < Math.min(2, innerKeys.length); j++) {
            const item = entry[innerKeys[j]];
            console.log(`  Item "${innerKeys[j]}":`, JSON.stringify(item));
          }
        } else {
          console.log("Value:", entry);
        }
      }
      
      // Try to find the structure pattern
      const firstKey = entryKeys[0];
      const firstEntry = r.data[firstKey];
      if (typeof firstEntry === "object") {
        const innerKeys = Object.keys(firstEntry);
        const sampleItem = firstEntry[innerKeys[0]];
        console.log("\n[STRUCTURE SAMPLE]");
        console.log("Entry keys:", innerKeys.slice(0, 5));
        if (typeof sampleItem === "object") {
          console.log("Item fields:", Object.keys(sampleItem));
          console.log("Full sample item:", JSON.stringify(sampleItem, null, 2));
        }
      }
    }
  }
} else {
  console.log("\n❌ NO se encontraron datos de 'details' en la sesión.");
  console.log("Posibles razones:");
  console.log("- No hiciste click en ningún partido");
  console.log("- Los detalles no se cargan vía WebSocket (quizás REST)");
  
  // Let's also search through all responses manually for anything match-related
  console.log("\n=== Buscando en todas las responses... ===");
  const allResponses = data.allResponses || [];
  const acPatterns = [];
  for (const resp of allResponses) {
    if (resp.includes('"ac"') || resp.includes('"pl_id1"') || resp.includes('"val1"') || resp.includes('"val2"')) {
      acPatterns.push(resp.substring(0, 500));
    }
  }
  if (acPatterns.length > 0) {
    console.log("Encontradas responses con patrones de eventos:");
    acPatterns.forEach((p, i) => {
      console.log(`[${i}] ${p}`);
    });
  } else {
    console.log("No se encontraron patrones de eventos (ac, pl_id1, val1, val2) en ninguna response.");
    
    // Show first and last few responses to understand the data
    console.log("\nPrimeras 3 responses grandes:");
    let count = 0;
    for (const resp of allResponses) {
      if (resp.length > 200) {
        console.log(`[${count}] ${resp.substring(0, 300)}...`);
        count++;
        if (count >= 3) break;
      }
    }
    
    console.log("\nÚltimos paths consultados (de queries):");
    const allQueries = data.allQueries || [];
    const paths = new Set();
    for (const q of allQueries.slice(-50)) {
      const m = q.match(/"p":"([^"]+)"/);
      if (m) paths.add(m[1]);
    }
    paths.forEach(p => console.log("  " + p));
  }
}
