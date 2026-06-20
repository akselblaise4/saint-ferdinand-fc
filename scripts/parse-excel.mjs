const XLSX = require("xlsx");
const wb = XLSX.readFile("scripts/matches.xlsx");
console.log("Sheets:", wb.SheetNames);
wb.SheetNames.forEach(name => {
  const ws = wb.Sheets[name];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
  console.log(`\n=== Sheet: ${name} (${data.length} rows) ===`);
  data.forEach((row, i) => {
    console.log(`Row ${i}:`, JSON.stringify(row));
  });
});
