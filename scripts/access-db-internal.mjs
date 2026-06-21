import { chromium } from "playwright";
import fs from "fs";

const EVENT = "-5qp1c";
const GROUP = "5jvbh";

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage({ viewport: { width: 1920, height: 1080 } });

await page.goto(`https://copafacil.com/${EVENT}@${GROUP}`, { waitUntil: "domcontentloaded", timeout: 30000 });
await page.waitForTimeout(25000);

// Try to access Firebase internal state via page.evaluate
console.log("Trying to access Firebase internals...");

const result = await page.evaluate(async () => {
  const output = {};
  
  try {
    const { getApp, getApps } = await import(
      "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js"
    );
    const dbMod = await import(
      "https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js"
    );
    
    if (getApps().length === 0) return { error: "No apps" };
    const app = getApp();
    output.appName = app.name;
    output.appOptions = JSON.stringify(app.options).substring(0, 300);
    
    // Access internal container
    const container = app._container;
    if (container) {
      output.hasContainer = true;
      
      // Try to get providers
      const providers = container.getProviders();
      output.providers = providers.map(p => p.name).filter(n => n);
      
      // Try to find database provider
      for (const p of providers) {
        if (p.name && (p.name.includes("database") || p.name.includes("Database"))) {
          try {
            // getImmediate on the provider
            const inst = p.getImmediate();
            output.databaseInstance = typeof inst;
            if (inst && typeof inst === "object") {
              output.databaseKeys = Object.keys(inst).slice(0, 10);
              
              // Try to get a repo reference and query data
              if (inst._repo && inst._instance) {
                output.hasRepo = true;
              }
            }
          } catch(e) {
            output.databaseError = e.message.substring(0, 100);
          }
        }
        
        // Also check for auth provider
        if (p.name && (p.name.includes("auth") || p.name.includes("Auth"))) {
          try {
            const auth = p.getImmediate();
            output.authType = typeof auth;
            if (auth && auth.currentUser) {
              output.currentUser = auth.currentUser.uid;
            }
          } catch(e) {
            output.authError = e.message.substring(0, 100);
          }
        }
      }
    } else {
      output.noContainer = true;
      // Try direct internal properties
      output.appKeys = Object.keys(app).filter(k => !k.startsWith("_"));
      output.internalKeys = Object.keys(app).filter(k => k.startsWith("_"));
      output.internalSamples = {};
      for (const k of Object.keys(app).filter(k => k.startsWith("_"))) {
        const v = app[k];
        if (v && typeof v === "object") {
          output.internalSamples[k] = Object.keys(v).slice(0, 5);
        } else {
          output.internalSamples[k] = typeof v;
        }
      }
    }
  } catch(e) {
    output.error = e.message.substring(0, 200);
  }
  
  return output;
});

console.log(JSON.stringify(result, null, 2));

// If we found the database instance, try to query via app internals
if (result.databaseInstance || result.hasContainer) {
  console.log("\nDatabase instance found! Trying to query directly...");
  
  const queryResult = await page.evaluate(async (eventId, groupId) => {
    const output = {};
    
    try {
      const { getApp } = await import(
        "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js"
      );
      const dbMod = await import(
        "https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js"
      );
      
      const app = getApp();
      const container = app._container;
      
      // Find database provider and get instance
      for (const p of container.getProviders()) {
        if (p.name && p.name.includes("database")) {
          try {
            const db = p.getImmediate();
            
            if (db) {
              const ref = dbMod.ref(db, `events/${eventId}/matchs`);
              const snap = await dbMod.get(ref);
              if (snap.exists()) {
                const val = snap.val();
                output.matchCount = Object.keys(val).length;
                
                // Filter group matches
                const groupKeys = Object.keys(val).filter(k => {
                  const m = val[k];
                  return m && m.evt === `${eventId}@${groupId}`;
                });
                output.groupCount = groupKeys.length;
                output.sampleKeys = groupKeys.slice(0, 5);
                
                // Query details for first match
                if (groupKeys.length > 0) {
                  const mk = groupKeys[0];
                  const dRef = dbMod.ref(db, `events/${eventId}@${groupId}/details/${mk}`);
                  const dSnap = await dbMod.get(dRef);
                  if (dSnap.exists()) {
                    const dVal = dSnap.val();
                    output.sampleDetail = dVal.list ? Object.keys(dVal.list).length + " events" : "no list";
                  }
                }
              } else {
                output.matchsExists = false;
              }
            }
          } catch(e) {
            output.dbError = e.message.substring(0, 200);
          }
        }
      }
    } catch(e) {
      output.error = e.message.substring(0, 200);
    }
    
    return output;
  }, EVENT, GROUP);
  
  console.log(JSON.stringify(queryResult, null, 2));
}

await browser.close();
