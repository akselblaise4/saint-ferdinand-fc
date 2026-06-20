import https from "https";
import { read, utils } from "xlsx";

const ids = ["5jvbh", "kjk7t", "sz2ln", "66786", "mp7pq", "8ard", "6d06s"];
const results = {};

function fetchExcel(eventId, groupId) {
  return new Promise(resolve => {
    const url = `https://copafacil.com/share/excel/matchs/${eventId}/${groupId}/-`;
    https.get(url, res => {
      let d = [];
      res.on("data", c => d.push(c));
      res.on("end", () => {
        const buf = Buffer.concat(d);
        try {
          const wb = read(buf);
          const sheet = wb.Sheets["Sheet1"];
          const rows = utils.sheet_to_json(sheet);
          resolve({ url, size: buf.length, rows: rows.length, data: rows.length > 0 ? rows : null });
        } catch (e) {
          resolve({ url, size: buf.length, rows: 0, error: e.message });
        }
      });
    }).on("error", e => resolve({ url, error: e.message, rows: 0 }));
  });
}

// Also try the table export
async function fetchTable(eventId, groupId) {
  return new Promise(resolve => {
    const url = `https://copafacil.com/share/excel/table/${eventId}/${groupId}/-`;
    https.get(url, res => {
      let d = [];
      res.on("data", c => d.push(c));
      res.on("end", () => {
        const buf = Buffer.concat(d);
        try {
          const wb = read(buf);
          const sheet = wb.Sheets["Sheet1"];
          const rows = utils.sheet_to_json(sheet);
          resolve({ url, size: buf.length, rows: rows.length, data: rows.length > 0 ? rows[0] : null });
        } catch (e) {
          resolve({ url, size: buf.length, rows: 0, error: e.message });
        }
      });
    }).on("error", e => resolve({ url, error: e.message, rows: 0 }));
  });
}

async function main() {
  console.log("=== Testing ALL Excel exports ===\n");
  
  // Match exports
  console.log("--- MATCH EXPORTS ---");
  for (const id of ids) {
    const r = await fetchExcel("-5qp1c", id);
    console.log(`  ${id}: ${r.rows} rows (${r.size} bytes)`);
    if (r.rows > 0) {
      console.log(`    Sample:`, JSON.stringify(r.data[0]).substring(0, 200));
    }
  }
  
  // Also try at event level without group
  const r2 = await fetchExcel("-5qp1c", "-");
  console.log(`  ALL: ${r2.rows} rows (${r2.size} bytes)`);

  // Table exports
  console.log("\n--- TABLE EXPORTS ---");
  const tblIds = ["5jvbh", "A", "B", "C", "D"];
  for (const id of tblIds) {
    const r = await fetchTable("-5qp1c", id);
    console.log(`  ${id}: ${r.rows} rows (${r.size} bytes)`);
    if (r.rows > 0) {
      console.log(`    Sample:`, JSON.stringify(r.data).substring(0, 200));
    }
  }

  console.log("\nDone.");
}

main().catch(console.error);
