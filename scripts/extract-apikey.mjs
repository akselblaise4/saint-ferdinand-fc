import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

await page.goto("https://copafacil.com/-5qp1c@5jvbh", { waitUntil: "domcontentloaded", timeout: 30000 });
await page.waitForTimeout(8000);

const result = await page.evaluate(() => {
  const scripts = document.querySelectorAll("script");
  for (const s of scripts) {
    const t = s.textContent || s.innerHTML || "";
    if (t.includes("AIza")) {
      const m = t.match(/AIza[0-9A-Za-z_-]+/);
      if (m) return { apiKey: m[0], snippet: t.substring(0, 500) };
    }
  }
  // Also check script src
  for (const s of scripts) {
    if (s.src && s.src.includes("main.dart")) {
      return { dartUrl: s.src };
    }
  }
  return { error: "not found" };
});

console.log(JSON.stringify(result, null, 2));

if (result.dartUrl) {
  console.log("\nFetching main.dart.js...");
  const response = await page.goto(result.dartUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
  const content = await response.text();
  const m = content.match(/AIza[0-9A-Za-z_-]+/);
  if (m) console.log("API key in main.dart.js:", m[0]);
  
  // Try anonymous sign-in with this API key
  if (m) {
    const apiKey = m[0];
    console.log("\nTrying anonymous auth via REST API...");
    
    const authResp = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ returnSecureToken: true }),
      }
    );
    const authData = await authResp.json();
    console.log("Auth response:", JSON.stringify(authData, null, 2));
    
    if (authData.idToken) {
      console.log("\n✅ Anonymous auth SUCCESS!");
      console.log("idToken:", authData.idToken.substring(0, 50) + "...");
      
      // Now try to access the details path
      const dbUrl = "https://copafacil-web.firebaseio.com";
      const detailsResp = await fetch(
        `${dbUrl}/events/-5qp1c@5jvbh/details/1780501700822.json?auth=${authData.idToken}`
      );
      const detailsData = await detailsResp.json();
      console.log("\nDetails data:", JSON.stringify(detailsData).substring(0, 1000));
    }
  }
}

await browser.close();
