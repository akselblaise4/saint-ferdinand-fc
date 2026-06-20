/**
 * Copa Fácil Bot v2 — Extrae TODOS los datos vía Firebase RTDB WebSocket.
 *
 * Estrategia: Usa Playwright para abrir la página (que establece la conexión
 * Firebase), luego inyecta el SDK de Firebase vía import() dinámico para
 * leer la RTDB directamente desde el browser.
 */

import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const DATA_DIR = "data";
const EVENT_ID = "-5qp1c";   // USS Liga Premier
const GROUP = "5jvbh";       // Grupo específico
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDbR0mRSSb554WadsJgfOivSXLET84IIR0",
  authDomain: "copafacil-web.firebaseapp.com",
  databaseURL: "https://copafacil-web.firebaseio.com",
  projectId: "copafacil-web",
  storageBucket: "copafacil-web.appspot.com",
  messagingSenderId: "1084972798992",
  appId: "1:1084972798992:web:821f62c5b4373754c4e695",
  measurementId: "G-W2PPHLK289",
};

fs.mkdirSync(DATA_DIR, { recursive: true });

function save(name, data) {
  const p = path.join(DATA_DIR, name);
  fs.writeFileSync(p, JSON.stringify(data, null, 2));
  console.log(`  OK ${p} (${(fs.statSync(p).length / 1024).toFixed(0)} KB)`);
}

async function main() {
  console.log("=== COPA FÁCIL BOT v2 ===\n");

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  // PAGE 1: Load Copa Fácil to establish Firebase session
  console.log("[1] Loading Copa Fácil to init Firebase...");
  await page.goto(`https://copafacil.com/-${EVENT_ID}@${GROUP}`, {
    waitUntil: "domcontentloaded", timeout: 20000,
  });
  // Wait for Firebase WebSocket to connect
  await page.waitForTimeout(10000);

  // PAGE 2: Load a blank page where we inject Firebase SDK
  console.log("[2] Injecting Firebase SDK on blank page...");
  await page.goto("about:blank", { waitUntil: "domcontentloaded" });

  // Inject Firebase JS SDK via dynamic import
  const rtdbData = await page.evaluate(async (config) => {
    // Dynamically import Firebase modules (they're small and cached from step 1)
    const { initializeApp } = await import(
      "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js"
    );
    const { getDatabase, ref, child, get } = await import(
      "https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js"
    );

    const app = initializeApp(config);
    const db = getDatabase(app);
    const rootRef = ref(db);

    // Helper to read a path
    async function readPath(rlPath) {
      try {
        const snap = await get(child(rootRef, rlPath));
        return snap.exists() ? snap.val() : null;
      } catch (e) {
        return { error: e.message };
      }
    }

    // Read ALL known paths
    const paths = [
      `events/${config.eventId}@${config.group}/info`,
      `events/${config.eventId}@${config.group}/teams`,
      `events/${config.eventId}@${config.group}/inf_up`,
      `events/${config.eventId}/attachevents`,
      `events/${config.eventId}/midia`,
      `events/${config.eventId}/ptr`,
      `events/${config.eventId}/acess_count/user_anonimo`,
      `events/${config.eventId}`,
      // Try to find matches/games
      `events/${config.eventId}@${config.group}/matches`,
      `events/${config.eventId}/matches`,
      `events/${config.eventId}@${config.group}/games`,
      `events/${config.eventId}/games`,
      `events/${config.eventId}@${config.group}/rounds`,
      `events/${config.eventId}/rounds`,
      `events/${config.eventId}/classificacao`,
      `events/${config.eventId}@${config.group}/players`,
      // Grouped queries under first team to find player list
      `events/${config.eventId}@${config.group}/teams/-OqC_DyMZey8vTF5Shq5`,
      // Try to find other group data
      `events/${config.eventId}@${config.group}`,
      // Try rounds/fechas
      `events/${config.eventId}@${config.group}/r4`,
      `events/${config.eventId}@${config.group}/fechas`,
      // Check for match data under this pattern
      `events/${config.eventId}@${config.group}/results`,
      `events/${config.eventId}@${config.group}/fixtures`,
    ];

    const result = {};
    for (const p of paths) {
      console.log(`  Reading: ${p}`);
      result[p] = await readPath(p);
    }
    return result;
  }, { ...FIREBASE_CONFIG, eventId: EVENT_ID, group: GROUP });

  console.log("\n[3] Processing results...");

  // Save raw data
  save("rtdb-raw.json", rtdbData);

  // Extract and structure each section
  const output = {
    fetchedAt: new Date().toISOString(),
    eventId: EVENT_ID,
    groupId: GROUP,
  };

  // INFO
  const info = rtdbData[`events/${EVENT_ID}@${GROUP}/info`];
  if (info && !info.error) {
    output.info = info;
    console.log(`  Info: "${info.info?.sub_title || info.parent}"`);
  }

  // TEAMS
  const teamsRaw = rtdbData[`events/${EVENT_ID}@${GROUP}/teams`];
  if (teamsRaw && !teamsRaw.error) {
    const teams = Object.entries(teamsRaw).map(([id, t]) => ({
      id,
      name: t.name || "?",
      nickname: t.nickname || "",
      photo: t.url || null,
      playersCount: t.qtd_p || 0,
      stats: t.dt ? Object.entries(t.dt).map(([ts, d]) => ({
        timestamp: parseInt(ts),
        points: d.col,
        groupPos: d.colg,
        data: d.dt,
        suspended: d.SH || false,
      })) : [],
    }));
    output.teams = teams;
    console.log(`  Teams: ${teams.length}`);
    console.log(`  Saints:`, teams.find(t => t.name.toLowerCase().includes("saint")));
  }

  // MIDIA (photos/news)
  const midia = rtdbData[`events/${EVENT_ID}/midia`];
  if (midia && !midia.error) {
    const mediaItems = Object.entries(midia).map(([id, m]) => ({
      id,
      evt: m.evt,
      url: m.i?.url || m.url,
      urlP: m.i?.urlP || m.urlP,
      type: m.ic || "news",
      timestamp: m.i?.m,
      leg: m.leg || "",
    }));
    output.media = mediaItems;
    console.log(`  Media items: ${mediaItems.length}`);
    // Separate news from photos
    output.news = mediaItems.filter(m => m.type === "news");
    output.photos = mediaItems.filter(m => m.type !== "news");
    console.log(`    News: ${output.news.length}, Photos: ${output.photos.length}`);
  }

  // PARTNERS
  const partners = rtdbData[`events/${EVENT_ID}/ptr`];
  if (partners && !partners.error) {
    output.partners = Object.entries(partners).map(([id, p]) => ({
      id, title: p.title, phone: p.numb, url: p.urlP || p.url_l, website: p.url_l,
    }));
    console.log(`  Partners: ${output.partners.length}`);
  }

  // ATTACHMENTS
  const atts = rtdbData[`events/${EVENT_ID}/attachevents`];
  if (atts && !atts.error) {
    output.attachments = Object.entries(atts).map(([id, a]) => ({
      id, title: a.title, url: a.url,
    }));
    console.log(`  Attachments: ${output.attachments.length}`);
  }

  save("copa-data-v2.json", output);
  console.log("\n=== DONE ===");

  await browser.close();
}

main().catch(console.error);
