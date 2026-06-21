import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

// Fetch main.dart.js
const response = await page.goto("https://copafacil.b-cdn.net/main.dart.js?v=2026-10-04", { 
  waitUntil: "domcontentloaded", timeout: 30000 
});
const content = await response.text();
console.log("main.dart.js size:", content.length);

// Search for auth-related code
const patterns = [
  "signIn", "signInAnonymously", "signInWithCustomToken", "signInWithEmailAndPassword",
  "signInWithCredential", "GoogleAuthProvider", "FacebookAuthProvider",
  "onAuthStateChanged", "currentUser", "getIdToken",
  "auth", "Auth", "AUTH",
  "customToken", "anonymous",
  "ADMIN_ONLY", "admin-restricted",
];

for (const p of patterns) {
  const idx = content.indexOf(p);
  if (idx >= 0) {
    console.log(`\n"${p}" found at position ${idx}:`);
    console.log(content.substring(Math.max(0, idx - 200), idx + 300));
  }
}

// Search for the API key usage context
const apiIdx = content.indexOf("AIzaSyDbR0mRSSb554WadsJgfOivSXLET84IIR0");
if (apiIdx >= 0) {
  console.log("\n\n=== API Key context ===");
  console.log(content.substring(Math.max(0, apiIdx - 500), apiIdx + 500));

  // Also look for databaseURL next to the API key
  const preContext = content.substring(Math.max(0, apiIdx - 2000), apiIdx + 1000);
  const dbUrlMatch = preContext.match(/databaseURL["']?[=:]["']([^"']+)/);
  if (dbUrlMatch) console.log("databaseURL:", dbUrlMatch[1]);
}

// Search for any token, credential, or authentication token pattern
const tokenPatterns = [
  /["']token["'].{0,100}/gi,
  /["']credential["'].{0,100}/gi,
  /signInWithCustomToken/gi,
];

for (const regex of tokenPatterns) {
  const matches = content.match(regex);
  if (matches) {
    console.log(`\n=== Matches for ${regex} ===`);
    for (const m of matches.slice(0, 3)) {
      console.log(m.substring(0, 200));
    }
  }
}

await browser.close();
