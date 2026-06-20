/**
 * Copa Fácil Bot — Extrae datos reales vía Firebase RTDB.
 *
 * 1. Abre la página de Copa Fácil (establece sesión Firebase)
 * 2. Inyecta SDK Firebase en about:blank
 * 3. Lee TODOS los paths conocidos de la RTDB
 * 4. Estructura y guarda en data/
 */

import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const DATA_DIR = "data";
const EVENT_ID = "-5qp1c";
const GROUP = "5jvbh";
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDbR0mRSSb554WadsJgfOivSXLET84IIR0",
  authDomain: "copafacil-web.firebaseapp.com",
  databaseURL: "https://copafacil-web.firebaseio.com",
  projectId: "copafacil-web",
  storageBucket: "copafacil-web.appspot.com",
  messagingSenderId: "1084972798992",
  appId: "1:1084972798992:web:821f62c5b4373754c4e695",
};

fs.mkdirSync(DATA_DIR, { recursive: true });

function save(name, data) {
  const p = path.join(DATA_DIR, name);
  fs.writeFileSync(p, JSON.stringify(data, null, 2));
  const kb = (fs.statSync(p).size / 1024).toFixed(0);
  console.log(`  OK ${name} (${kb} KB)`);
}

async function readFirebasePaths(page, paths) {
  return await page.evaluate(async (opts) => {
    const { initializeApp } = await import(opts.appJs);
    const { getDatabase, ref, child, get } = await import(opts.dbJs);

    const app = initializeApp(opts.config);
    const db = getDatabase(app);
    const rootRef = ref(db);

    const result = {};
    for (const p of opts.paths) {
      try {
        const snap = await get(child(rootRef, p));
        result[p] = snap.exists() ? snap.val() : null;
      } catch (e) {
        result[p] = { error: String(e.message || e) };
      }
    }
    return result;
  }, {
    appJs: "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js",
    dbJs: "https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js",
    config: FIREBASE_CONFIG,
    paths: paths,
  });
}

async function main() {
  console.log("=== COPA FÁCIL BOT ===\n");

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  // 1. Seed — open Copa Fácil to establish Firebase session
  console.log("[1] Loading Copa Fácil (seeding Firebase)...");
  await page.goto(`https://copafacil.com/-${EVENT_ID}@${GROUP}`, {
    waitUntil: "domcontentloaded", timeout: 20000,
  });
  await page.waitForTimeout(8000);

  // 2. Go to about:blank and inject Firebase SDK
  console.log("[2] Reading Firebase RTDB...");
  await page.goto("about:blank", { waitUntil: "domcontentloaded" });

  // All known paths
  const paths = [
    // Group-specific
    `events/-5qp1c@5jvbh/info`,
    `events/-5qp1c@5jvbh/teams`,
    `events/-5qp1c@5jvbh/inf_up`,
    // Event-level
    `events/-5qp1c/attachevents`,
    `events/-5qp1c/midia`,
    `events/-5qp1c/ptr`,
    `events/-5qp1c/acess_count/user_anonimo`,
    // Try to find all groups and matches
    `events/-5qp1c@5jvbh`,
    `events/-5qp1c@5jvbh/matches`,
    `events/-5qp1c/matches`,
    `events/-5qp1c@5jvbh/games`,
    `events/-5qp1c/classificacao`,
    `events/-5qp1c@5jvbh/r4`,
    `events/-5qp1c@5jvbh/round1`,
    `events/-5qp1c@5jvbh/round_1`,
    // Look for other groups
    `events/-5qp1c@5jvbh/divisions`,
    `events/-5qp1c/divisions`,
    `events/-5qp1c/groups`,
    // Try without @ 
    `events/-5qp1c/5jvbh`,
    `events/-5qp1c/5jvbh/info`,
    `events/-5qp1c/5jvbh/teams`,
  ];

  const raw = await readFirebasePaths(page, paths);
  save("rtdb-raw.json", raw);

  // 3. Process
  const info = raw[`events/-5qp1c@5jvbh/info`];
  const teamsRaw = raw[`events/-5qp1c@5jvbh/teams`];

  // Standings: sort by latest pos, then by pts desc
  const standings = [];
  const teamList = [];
  let saints = null;

  if (teamsRaw && !teamsRaw.error) {
    Object.entries(teamsRaw).forEach(([id, t]) => {
      const stats = Object.entries(t.dt || {})
        .map(([ts, e]) => ({
          at: parseInt(ts),
          pos: e.colg ?? null,
          pts: e.col ?? null,
          rawStats: e.dt || null,
          suspended: e.SH || false,
        }))
        .sort((a, b) => b.at - a.at);

      const latest = stats.find(s => s.pos !== null && !s.suspended) || stats[0];

      const entry = {
        id, name: t.name, photo: t.url || null, playersCount: t.qtd_p || 0,
        latestPos: latest?.pos ?? null,
        latestPts: latest?.pts ?? null,
      };
      teamList.push(entry);
      if (latest?.pos !== null) standings.push(entry);

      if (t.name?.toLowerCase().includes("saint")) {
        saints = { id, name: t.name, photo: t.url, playersCount: t.qtd_p, stats };
        console.log(`\n=== SAINT FERDINAND ===`);
        console.log(`  Name: ${t.name}`);
        console.log(`  Photo: ${t.url}`);
        console.log(`  Players: ${t.qtd_p}`);
        const curr = stats.find(s => s.pos !== null);
        if (curr) {
          console.log(`  Position: ${curr.pos}º`);
          console.log(`  Points: ${curr.pts}`);
        }
      }
    });
  }

  standings.sort((a, b) => (a.latestPos || 999) - (b.latestPos || 999));

  // Media
  const midiaRaw = raw[`events/-5qp1c/midia`];
  const media = midiaRaw && !midiaRaw.error
    ? Object.entries(midiaRaw).map(([id, m]) => ({
        id, type: m.ic || "news",
        title: m.leg || "",
        url: m.i?.url || m.url,
        urlP: m.i?.urlP || m.urlP || null,
        evt: m.evt,
        timestamp: m.i?.m || null,
      }))
    : [];

  // Partners
  const ptrRaw = raw[`events/-5qp1c/ptr`];
  const partners = ptrRaw && !ptrRaw.error
    ? Object.entries(ptrRaw).map(([id, p]) => ({
        id, name: p.title, phone: p.numb, url: p.urlP || p.url_l,
      }))
    : [];

  // Attachments
  const attRaw = raw[`events/-5qp1c/attachevents`];
  const attachments = attRaw && !attRaw.error
    ? Object.entries(attRaw).map(([id, a]) => ({ id, title: a.title, url: a.url }))
    : [];

  // 4. Save
  const output = {
    fetchedAt: new Date().toISOString(),
    event: {
      id: EVENT_ID,
      group: GROUP,
      title: info?.info?.sub_title || "USS Liga Premier",
      sport: info?.sport,
      startDate: info?.d_i ? new Date(info.d_i).toISOString() : null,
      endDate: info?.d_f ? new Date(info.d_f).toISOString() : null,
      admin: info?.admin,
    },
    saints,
    standings,
    teams: teamList,
    matches: [],
    media,
    partners,
    attachments,
  };

  save("copa-data.json", output);

  console.log(`\n  Total teams: ${teamList.length}`);
  console.log(`  Media items: ${media.length}`);
  console.log(`  Partners: ${partners.length}`);
  console.log("\n=== DONE ===");

  await browser.close();
}

main().catch(err => {
  console.error("FATAL:", err);
  process.exit(1);
});
