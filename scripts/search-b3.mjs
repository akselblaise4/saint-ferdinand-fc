import { chromium } from "playwright";
import fs from "fs";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

const response = await page.goto("https://copafacil.b-cdn.net/main.dart.js?v=2026-10-04", { 
  waitUntil: "domcontentloaded", timeout: 60000 
});
const content = await response.text();

// Save for analysis
fs.writeFileSync("scripts/main.dart.js", content);
console.log("Saved main.dart.js (" + (content.length / 1024 / 1024).toFixed(1) + " MB)");

// Search B3 method
const b3Idx = content.indexOf(".a.B3(");
if (b3Idx >= 0) {
  console.log("\n=== Context around .a.B3(");
  console.log(content.substring(Math.max(0, b3Idx - 1000), b3Idx + 500));
}

// Search for B3 function definition
// Dart compiler creates minified method names
// B3 might be a method on a class
const b3DefIdx = content.indexOf('"B3"');
if (b3DefIdx >= 0) {
  console.log("\n=== B3 as string ===");
  console.log(content.substring(Math.max(0, b3DefIdx - 500), b3DefIdx + 500));
}

// Search for phone number auth patterns
const phoneIdx = content.indexOf("phone");
if (phoneIdx >= 0) {
  console.log("\n=== Phone auth patterns ===");
  const around = content.substring(phoneIdx, phoneIdx + 5000);
  const lines = around.split("\n").filter(l => l.length > 10).slice(0, 5);
  for (const l of lines) console.log(l.substring(0, 300));
}

// Search for signInAnonymously in the code
const anonymousIdx = content.indexOf("signInAnonymously");
if (anonymousIdx >= 0) {
  console.log("\n=== signInAnonymously context ===");
  console.log(content.substring(Math.max(0, anonymousIdx - 500), anonymousIdx + 500));
}

// Search for signInWithCustomToken
const customTokenIdx = content.indexOf("signInWithCustomToken");
if (customTokenIdx >= 0) {
  console.log("\n=== signInWithCustomToken context ===");
  console.log(content.substring(Math.max(0, customTokenIdx - 500), customTokenIdx + 500));
}

// Also look for the actual Firebase initialization with app options
const cqmIdx = content.indexOf("cQM(");
if (cqmIdx >= 0) {
  console.log("\n=== cQM (Firebase init) ===");
  console.log(content.substring(cqmIdx, cqmIdx + 600));
}

// The d0b method - what does it return?
const d0bIdx = content.indexOf("d0b");
if (d0bIdx >= 0) {
  console.log("\n=== d0b references ===");
  // Find function definition for d0b
  const defMatch = content.match(/d0b[\s\S]{0,1000}?function/);
  if (defMatch) console.log(defMatch[0].substring(0, 500));
}

await browser.close();
