/**
 * COPA FÁCIL ULTIMATE BOT
 * Extrae TODO: RTDB + Firestore + media filtrada + stats decodificados
 */

import { chromium } from "playwright";
import fs from "fs";

const EVENT_ID = "-5qp1c";
const GROUP = "5jvbh";
const SAINTS_ID = "-OqC_DyMZey8vTF5Shq5";
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDbR0mRSSb554WadsJgfOivSXLET84IIR0",
  authDomain: "copafacil-web.firebaseapp.com",
  databaseURL: "https://copafacil-web.firebaseio.com",
  projectId: "copafacil-web",
  storageBucket: "copafacil-web.appspot.com",
  messagingSenderId: "1084972798992",
  appId: "1:1084972798992:web:821f62c5b4373754c4e695",
};

const DATA_DIR = "data";
fs.mkdirSync(DATA_DIR, { recursive: true });
function save(name, data) {
  const p = `${DATA_DIR}/${name}`;
  fs.writeFileSync(p, JSON.stringify(data, null, 2));
  console.log(`  OK ${name} (${(fs.statSync(p).size / 1024).toFixed(0)} KB)`);
}

// Stats decoder: "1=7#2=2#3=0#4=5#0=6#5=19#6=32#7=-13#..."
// Field mapping (discovered via cross-reference with match scores):
//   0=points, 1=played, 2=wins, 3=draws, 4=losses, 5=GF, 6=GA, 7=GD,
//   8=yellow, 9=red, 18=GF/GA ratio, others unknown
function decodeStats(encoded) {
  if (!encoded || typeof encoded !== "string") return null;
  const map = {};
  encoded.split("#").forEach(pair => {
    const [k, v] = pair.split("=");
    if (k !== undefined && v !== undefined) map[parseInt(k)] = isNaN(Number(v)) ? v : Number(v);
  });
  return {
    points: map[0], played: map[1], wins: map[2], draws: map[3], losses: map[4],
    goalsFor: map[5], goalsAgainst: map[6], goalDiff: map[7],
    yellowCards: map[8], redCards: map[9],
    efficiency: map[18],
  };
}

async function main() {
  console.log("=== COPA FÁCIL ULTIMATE BOT ===\n");

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  // Seed Firebase session
  console.log("[1] Loading Copa Fácil...");
  await page.goto(`https://copafacil.com/-${EVENT_ID}@${GROUP}`, { waitUntil: "domcontentloaded", timeout: 20000 });
  await page.waitForTimeout(10000);
  await page.goto("about:blank", { waitUntil: "domcontentloaded" });

  // ============================================================
  // STEP 1: Firebase RTDB — ALL DATA
  // ============================================================
  console.log("\n[2] Reading Firebase RTDB...");

  const rtdbData = await page.evaluate(async (opts) => {
    const { initializeApp } = await import(opts.appJs);
    const { getDatabase, ref, child, get } = await import(opts.dbJs);
    const app = initializeApp(opts.config);
    const db = getDatabase(app);
    const rootRef = ref(db);
    const read = async p => { try { const s = await get(child(rootRef, p)); return s.exists() ? s.val() : null; } catch (e) { return { __error: e.message }; } };

    const paths = [
      // Main group
      `events/${opts.eid}@${opts.gid}/info`,
      `events/${opts.eid}@${opts.gid}/teams`,
      `events/${opts.eid}@${opts.gid}/inf_up`,
      // Event data
      `events/${opts.eid}/attachevents`,
      `events/${opts.eid}/midia`,
      `events/${opts.eid}/ptr`,
      // All sub-events info
      `events/${opts.eid}@kjk7t/info`,
      `events/${opts.eid}@sz2ln/info`,
      `events/${opts.eid}@66786/info`,
      `events/${opts.eid}@mp7pq/info`,
      `events/${opts.eid}@8ard/info`,
      `events/${opts.eid}@6d06s/info`,
      // All sub-events teams
      `events/${opts.eid}@kjk7t/teams`,
      `events/${opts.eid}@sz2ln/teams`,
      `events/${opts.eid}@66786/teams`,
      `events/${opts.eid}@mp7pq/teams`,
      `events/${opts.eid}@8ard/teams`,
      `events/${opts.eid}@6d06s/teams`,
      // Match data
      `events/${opts.eid}/matchs`,
      `events/${opts.eid}@${opts.gid}/m_set`,
      `events/${opts.eid}/places`,
    ];
    const result = {};
    for (const p of paths) { result[p] = await read(p); }
    return result;
  }, { appJs: "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js",
      dbJs: "https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js",
      config: FIREBASE_CONFIG, eid: EVENT_ID, gid: GROUP });

  save("rtdb-full.json", rtdbData);

  // ============================================================
  // STEP 2: Firebase Firestore — match data
  // ============================================================
  console.log("\n[3] Reading Firebase Firestore...");

  const firestoreData = await page.evaluate(async (opts) => {
    const { initializeApp } = await import(opts.appJs);
    const { getFirestore, collection, getDocs, query, limit: qLimit } = await import(opts.fsJs);
    const app = initializeApp(opts.config);
    const fs = getFirestore(app);

    const result = {};
    // Try common collections
    const collections = [
      "matches", "games", "events", "tournaments",
      `events/-5qp1c/matches`,
      `events/-5qp1c@5jvbh/matches`,
      "results", "fixtures",
    ];
    for (const col of collections) {
      try {
        const q = query(collection(fs, col), qLimit(3));
        const snap = await getDocs(q);
        result[col] = snap.empty ? "EMPTY" : snap.docs.map(d => ({ id: d.id, data: d.data() }));
      } catch (e) {
        result[col] = "ERR: " + e.message.substring(0, 80);
      }
    }
    return result;
  }, { appJs: "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js",
      fsJs: "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js",
      config: FIREBASE_CONFIG });

  save("firestore.json", firestoreData);
  console.log("  Firestore results:");
  Object.entries(firestoreData).forEach(([k, v]) => {
    if (Array.isArray(v)) console.log(`    ${k}: ${v.length} docs`);
    else console.log(`    ${k}: ${String(v).substring(0, 60)}`);
  });

  // ============================================================
  // STEP 3: PROCESS ALL DATA
  // ============================================================
  console.log("\n[4] Processing data...");

  const info = rtdbData[`events/${EVENT_ID}@${GROUP}/info`];
  const teamsRaw = rtdbData[`events/${EVENT_ID}@${GROUP}/teams`];
  const allMedia = rtdbData[`events/${EVENT_ID}/midia`];

  // --- SAINT FERDINAND ---
  const saintsRaw = teamsRaw?.[SAINTS_ID];
  const saintsStats = saintsRaw?.dt ? Object.entries(saintsRaw.dt)
    .map(([ts, e]) => ({
      at: parseInt(ts),
      date: new Date(parseInt(ts)).toISOString(),
      position: e.colg ?? null,
      points: e.col ?? null,
      group: e.g || null,
      suspended: e.SH || false,
      stats: decodeStats(e.dt),
    }))
    .sort((a, b) => a.at - b.at) : [];

  // --- ALL TEAMS — use FIRST dt entry for regular season, LAST dt entry for playoffs ---
  const allTeams = [];
  const standings = [];
  if (teamsRaw) {
    Object.entries(teamsRaw).forEach(([id, t]) => {
      const entriesSorted = Object.entries(t.dt || {})
        .map(([ts, e]) => {
      const stats = decodeStats(e.dt);
      return { at: parseInt(ts), pos: e.colg, pts: e.col, groupPts: stats?.points ?? null, group: e.g, suspended: e.SH || false, stats };
    })
        .sort((a, b) => a.at - b.at); // chronological

      // Regular season = first entry with group letter
      const regular = entriesSorted.find(e => e.group);
      // Latest non-suspended regular-phase = last entry with valid position from regular season
      const latestRegular = regular || entriesSorted.find(e => e.pos !== null && !e.suspended);
      // For playoffs/overall: latest entry with position (even if suspended, as long as it has data)
      const latestOverall = [...entriesSorted].reverse().find(e => e.pos !== null && e.stats);

      const team = {
        id, name: t.name, photo: t.url || null, playersCount: t.qtd_p || 0,
        season: {
          group: regular?.group || null,
          pos: regular?.pos ?? null,
          pts: regular?.groupPts ?? null,
          stats: regular?.stats || null,
        },
        latest: {
          pos: latestOverall?.pos ?? null,
          pts: latestOverall?.groupPts ?? null,
          stats: latestOverall?.stats || null,
        },
        allEntries: entriesSorted,
      };
      allTeams.push(team);
    });
  }
  // Standings: sort by regular season group position, then pos+stats
  const withPos = allTeams.filter(t => t.season.pos !== null);
  const groupLetters = [...new Set(withPos.map(t => t.season.group).filter(Boolean))].sort();
  const standingsByGroup = {};
  groupLetters.forEach(g => {
    standingsByGroup[g] = allTeams
      .filter(t => t.season.group === g && t.season.pos !== null)
      .sort((a, b) => (a.season.pos || 999) - (b.season.pos || 999));
  });
  // Overall standings = merged groups sorted by (group letter, then position)
  const allStandings = groupLetters.flatMap(g => standingsByGroup[g] || []);

  // --- MEDIA FILTERED FOR SAINT FERDINAND'S GROUP ---
  // Each media item has a UNIQUE Google Drive folder (urlP) per match date!
  const mediaItems = [];
  const saintsMedia = [];
  if (allMedia) {
    // Build a per-date Drive URL map from saints group media
    const driveByDate = {};
    Object.entries(allMedia).forEach(([id, m]) => {
      if (m.evt === GROUP && m.i?.urlP) {
        const date = m.i?.m ? new Date(m.i.m).toISOString().substring(0, 10) : null;
        if (date) driveByDate[date] = m.i.urlP;
      }
    });

    Object.entries(allMedia).forEach(([id, m]) => {
      const ts = m.i?.m || null;
      const date = ts ? new Date(ts).toISOString() : null;
      const dateOnly = date ? date.substring(0, 10) : null;
      const item = {
        id, type: m.ic || "news",
        title: m.leg || "",
        url: m.i?.url || m.url,
        urlDrive: m.i?.urlP || m.urlP || null,  // Unique per-fecha Google Drive folder!
        thumbnail: m.urlT || null,  // YouTube thumbnail if applicable
        evt: m.evt,
        timestamp: ts,
        date: date,
        dateOnly,
        // Link to the specific match date's Drive album
        matchDriveUrl: driveByDate[dateOnly] || null,
      };
      mediaItems.push(item);
      if (m.evt === GROUP) saintsMedia.push(item);
    });
  }
  saintsMedia.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

  // --- MATCH DATA ---
  const allMatches = rtdbData[`events/${EVENT_ID}/matchs`];
  const allMSet = rtdbData[`events/${EVENT_ID}@${GROUP}/m_set`];
  const allPlaces = rtdbData[`events/${EVENT_ID}/places`];

  // Build lookups
  const teamNames = new Map();
  if (teamsRaw) Object.entries(teamsRaw).forEach(([id, t]) => teamNames.set(id, t.name));
  const roundNames = new Map();
  if (allMSet) Object.entries(allMSet).forEach(([id, r]) => roundNames.set(id, r.title));
  const placeNames = new Map();
  if (allPlaces) Object.entries(allPlaces).forEach(([id, p]) => placeNames.set(id, p.title));

  // Build match lists
  const groupMatches = [];
  const saintsMatches = [];
  if (allMatches) {
    Object.entries(allMatches).forEach(([id, m]) => {
      if (m.evt !== `${EVENT_ID}@${GROUP}`) return;
      const isSaints = m.team1 === SAINTS_ID || m.team2 === SAINTS_ID;
      // Determine turno from local time (GMT-4 = Chile)
      const localHour = m.d_i ? new Date(m.d_i - (m.gmt || 14400000)).getUTCHours() : null;
      let turno = null;
      if (localHour === 20 || localHour === 8) turno = 1;
      else if (localHour === 21 || localHour === 9) turno = 2;
      else if (localHour === 22 || localHour === 10) turno = 3;
      else if (localHour !== null) turno = `${localHour}:00`;

      // Detect playoff: titles like "Cuartos de final", "Semifinal", "Final"
      const isPlayoff = m.title && (m.title.includes("final") || m.title.includes("Cuartos") || m.title.includes("Semifinal") || m.title.includes("Final"));
      // Get playoff phase from m_set title when it's a playoff round
      const roundTitle = roundNames.get(m.m_set) || "";
      const phase = (roundTitle === "Cuartos de final" || roundTitle === "Semifinal" || roundTitle === "Final") ? roundTitle : "regular";

      const entry = {
        id,
        date: m.d_i ? new Date(m.d_i).toISOString().split("T")[0] : null,
        dateTimestamp: m.d_i || null,
        localHour,
        turno,
        round: roundTitle,
        phase,
        bracketFs: m.fs || null,
        venue: placeNames.get(m.l) || null,
        team1: { id: m.team1, name: teamNames.get(m.team1) || m.team1 },
        team2: { id: m.team2, name: teamNames.get(m.team2) || m.team2 },
        score1: m.dt?.qt_g1 ?? null,
        score2: m.dt?.qt_g2 ?? null,
        penalties1: m.dt?.qt_p1 ?? null,
        penalties2: m.dt?.qt_p2 ?? null,
        title: m.title || null,
        next1: m.next1 || null,
        pos_eli: m.pos_eli ?? null,
        name1: m.name1 || null,
        name2: m.name2 || null,
        finished: !!m.finished,
        status: m.st,
        isPlayoff,
        isSaints,
      };
      groupMatches.push(entry);
      if (isSaints) saintsMatches.push(entry);
    });
  }
  groupMatches.sort((a, b) => (a.dateTimestamp || 0) - (b.dateTimestamp || 0));
  saintsMatches.sort((a, b) => (a.dateTimestamp || 0) - (b.dateTimestamp || 0));

  // --- SUB-EVENTS (all divisions) ---
  const divisions = ["5jvbh", "kjk7t", "sz2ln", "66786", "mp7pq", "8ard", "6d06s"];
  const allDivisions = divisions.map(id => {
    const divInfo = rtdbData[`events/${EVENT_ID}@${id}/info`];
    const divTeams = rtdbData[`events/${EVENT_ID}@${id}/teams`];
    return {
      id,
      title: divInfo?.info?.sub_title || divInfo?.sub_title || `División ${id}`,
      teamsCount: divTeams ? Object.keys(divTeams).length : 0,
    };
  });

  // ============================================================
  // STEP 5: BUILD OUTPUT
  // ============================================================
  const saintsTeam = allTeams.find(t => t.id === SAINTS_ID);

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
      urlCover: info?.url_c || null,
    },
    divisions: allDivisions,
    saints: {
      id: SAINTS_ID,
      name: saintsRaw?.name || "SAINT FERDINAND",
      photo: saintsRaw?.url || null,
      playersCount: saintsRaw?.qtd_p || 0,
      group: saintsTeam?.season?.group || "C",
      season: saintsTeam?.season || null,
      latest: saintsTeam?.latest || null,
      statsHistory: saintsStats,
    },
    standings: allStandings,
    standingsByGroup,
    media: {
      all: mediaItems,
      saintsGroup: saintsMedia,
    },
    matches: {
      total: groupMatches.length,
      items: groupMatches,
      saints: saintsMatches,
    },
    // Top scorers — data computed client-side by Flutter, not in RTDB.
    // This structure is ready for manual import or future API integration.
    topScorers: {
      overall: [],    // [{ player: "Name", team: "Team", goals: N, position: N }]
      saints: [],     // Saint Ferdinand players only, with overall rank
      lastUpdated: null,
    },
    attachments: rtdbData[`events/${EVENT_ID}/attachevents`]
      ? Object.entries(rtdbData[`events/${EVENT_ID}/attachevents`]).map(([id, a]) => ({ id, title: a.title, url: a.url })) : [],
    partners: rtdbData[`events/${EVENT_ID}/ptr`]
      ? Object.entries(rtdbData[`events/${EVENT_ID}/ptr`]).map(([id, p]) => ({ id, name: p.title, phone: p.numb, url: p.urlP || p.url_l })) : [],
    firestore: firestoreData,
  };

  save("copa-data-ultimate.json", output);
  save("copa-data.json", output);

  // ============================================================
  // REPORT
  // ============================================================
  console.log("\n=== REPORT ===");
  console.log(`Event: ${output.event.title}`);
  console.log(`Divisions: ${allDivisions.length}`);
  allDivisions.forEach(d => console.log(`  ${d.id}: ${d.title} (${d.teamsCount} equipos)`));

  console.log(`\nSaint Ferdinand:`);
  console.log(`  Group: ${output.saints.group}`);
  console.log(`  Pos: ${saintsTeam?.season?.pos || "?"} | Pts: ${saintsTeam?.season?.pts || "?"}`);
  console.log(`  Players: ${output.saints.playersCount}`);
  console.log(`  Stats history: ${saintsStats.length} entries`);
  saintsStats.forEach(s => {
    const st = s.stats;
    if (st) console.log(`    ${s.date.substring(0, 10)} pos=${s.position} pts=${st.points} P=${st.played} W=${st.wins} D=${st.draws} L=${st.losses} GF=${st.goalsFor} GA=${st.goalsAgainst} YC=${st.yellowCards} suspended=${s.suspended}`);
    else console.log(`    ${s.date.substring(0, 10)} pos=${s.position} pts=${s.points} (no stats) suspended=${s.suspended}`);
  });

  console.log(`\nStandings: ${allStandings.length} teams in ${groupLetters.length} groups`);
  groupLetters.forEach(g => {
    const list = standingsByGroup[g] || [];
    console.log(`  Group ${g}: ${list.length} teams`);
    list.slice(0, 4).forEach(t => console.log(`    #${t.season.pos} ${t.name} (${t.season.pts} pts)`));
  });

  console.log(`\nMatches: ${groupMatches.length} total`);
  console.log(`  Saints matches: ${saintsMatches.length}`);
  saintsMatches.forEach(m => {
    const home = m.team1.id === SAINTS_ID ? "vs" : "@";
    const score = m.score1 !== null ? `${m.score1}-${m.score2}` : "?";
    console.log(`    ${m.date} ${home} ${m.team2.name.padEnd(20)} ${score} ${m.round || ""}${m.title ? " (" + m.title + ")" : ""}`);
  });

  console.log(`\nMedia: ${mediaItems.length} total`);
  console.log(`  Saints group media: ${saintsMedia.length}`);
  saintsMedia.slice(0, 5).forEach(m => console.log(`    ${m.date?.substring(0, 10) || "?"} ${m.title?.substring(0, 50)}`));

  console.log("\nFirestore:");
  Object.entries(firestoreData).forEach(([k, v]) => {
    if (Array.isArray(v)) {
      console.log(`  ${k}: ${v.length} documentos`);
      if (v.length > 0) console.log(`    ${JSON.stringify(v[0]).substring(0, 200)}`);
    } else console.log(`  ${k}: ${String(v).substring(0, 60)}`);
  });

  await browser.close();
  console.log("\n=== DONE ===");
}

main().catch(err => { console.error("FATAL:", err); process.exit(1); });
