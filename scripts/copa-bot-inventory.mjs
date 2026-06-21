/**
 * COPA BOT INVENTORY — Deep scan: reads ALL possible Firebase data
 * and produces a comprehensive organized report showing exactly
 * what data exists and what might be missing.
 *
 * Usage:
 *   node scripts/copa-bot-inventory.mjs           # full deep scan
 *   node scripts/copa-bot-inventory.mjs --quick   # skip match details
 *   node scripts/copa-bot-inventory.mjs --report  # show last report only
 */

import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = "data";

const CONFIG = {
  eventId: "-5qp1c",
  primaryGroup: "5jvbh",
  saintsId: "-OqC_DyMZey8vTF5Shq5",
  allGroups: ["5jvbh", "kjk7t", "sz2ln", "66786", "mp7pq", "8ard", "6d06s"],
  firebase: {
    apiKey: "AIzaSyDbR0mRSSb554WadsJgfOivSXLET84IIR0",
    databaseURL: "https://copafacil-web.firebaseio.com",
    projectId: "copafacil-web",
  },
  firebaseJs: "https://www.gstatic.com/firebasejs/11.9.1",
};

const ACTION_CODES = {
  1: "GOL", 2: "ASISTENCIA", 3: "CONDUCTA_INDEBIDA",
  4: "EXPULSION", 5: "AUTO_GOL", 6: "ATAJADA_PENAL",
  7: "TITULAR", 8: "SUPLENTE", 9: "TARJETA_AMARILLA",
  10: "CAMBIO", 11: "GOL_EN_CONTRA", 12: "PENAL_COBRADO",
  13: "PENAL_FALLADO", 14: "PENAL_ATAJADO",
  15: "LESION", 16: "INGRESO",
};

// ─── Helpers ─────────────────────────────────────────────────

function getActionLabel(ac) {
  return ACTION_CODES[ac] || `DESCONOCIDO_${ac}`;
}

function timestamp() {
  return new Date().toISOString().replace("T", " ").substring(0, 19);
}

function log(msg) {
  console.log(`[${timestamp()}] ${msg}`);
}

function sortObjectKeys(obj) {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(sortObjectKeys);
  const sorted = {};
  Object.keys(obj).sort().forEach(k => { sorted[k] = sortObjectKeys(obj[k]); });
  return sorted;
}

// ─── Browser / Firebase ──────────────────────────────────────

let browser, page;

async function init() {
  browser = await chromium.launch({ headless: true });
  page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto(`https://copafacil.com/-${CONFIG.eventId}@${CONFIG.primaryGroup}`, {
    waitUntil: "domcontentloaded", timeout: 30000,
  });
  await page.waitForTimeout(12000);
  log("Browser ready");
}

async function close() {
  if (browser) await browser.close();
}

async function readPath(pathStr) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const name = `inv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const data = await page.evaluate(async (opts) => {
        const { initializeApp } = await import(opts.appJs);
        const { getDatabase, ref, child, get } = await import(opts.dbJs);
        const app = initializeApp(opts.config, opts.name);
        const db = getDatabase(app);
        const snap = await get(child(ref(db), opts.path));
        return snap.exists() ? snap.val() : null;
      }, {
        appJs: `${CONFIG.firebaseJs}/firebase-app.js`,
        dbJs: `${CONFIG.firebaseJs}/firebase-database.js`,
        config: CONFIG.firebase, path: pathStr, name,
      });
      return data;
    } catch (err) {
      if (attempt < 3) {
        await new Promise(r => setTimeout(r, 1000 * attempt));
      } else {
        return { __error: err.message.substring(0, 120) };
      }
    }
  }
}

async function readPaths(paths, batchSize = 5, delayMs = 200) {
  const result = {};
  const batches = [];
  for (let i = 0; i < paths.length; i += batchSize) {
    batches.push(paths.slice(i, i + batchSize));
  }
  for (const batch of batches) {
    const res = await Promise.allSettled(batch.map(p => readPath(p)));
    batch.forEach((p, i) => { result[p] = res[i].status === "fulfilled" ? res[i].value : { __error: res[i].reason?.message }; });
    if (batches.length > 1 && delayMs > 0) await new Promise(r => setTimeout(r, delayMs));
  }
  return result;
}

// ─── Decode Stats ─────────────────────────────────────────────

function decodeStats(encoded) {
  if (!encoded || typeof encoded !== "string") return null;
  const fields = { 0: "points", 1: "played", 2: "wins", 3: "draws", 4: "losses", 5: "goalsFor", 6: "goalsAgainst", 7: "goalDiff", 8: "yellowCards", 9: "redCards", 10: "secondYellow", 11: "ownGoals", 12: "cleanSheets", 13: "penaltiesScored", 14: "penaltiesAgainst", 15: "redCardsOpponent", 16: "suspensions", 17: "fouls", 18: "efficiency", 19: "pointsPerGame" };
  const raw = {};
  encoded.split("#").forEach(pair => {
    const [k, v] = pair.split("=");
    if (k !== undefined && v !== undefined) raw[parseInt(k)] = isNaN(Number(v)) ? v : Number(v);
  });
  const decoded = {};
  Object.entries(fields).forEach(([key, name]) => {
    if (raw[key] !== undefined) decoded[name] = raw[key];
  });
  return decoded;
}

// ─── Main Inventory ───────────────────────────────────────────

async function main() {
  const quick = process.argv.includes("--quick");
  const reportOnly = process.argv.includes("--report");

  if (reportOnly) {
    try {
      const report = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "inventory-report.json"), "utf8"));
      printReport(report);
    } catch { log("No inventory report found. Run without --report first."); }
    return;
  }

  const startTime = Date.now();
  log("=== COPA BOT INVENTORY (DEEP SCAN) ===");
  const { eventId: E, primaryGroup: G, allGroups: GROUPS, saintsId: SAINTS } = CONFIG;

  await init();

  // ──────────────────────────────────────────────────────────
  // PHASE 1: Read all standard paths + extra discovery
  // ──────────────────────────────────────────────────────────
  log("\n[1] Reading standard paths...");
  const standardPaths = [
    `events/${E}@${G}/info`,
    `events/${E}@${G}/teams`,
    `events/${E}@${G}/inf_up`,
    `events/${E}@${G}/m_set`,
    `events/${E}/attachevents`,
    `events/${E}/midia`,
    `events/${E}/ptr`,
    `events/${E}/matchs`,
    `events/${E}/places`,
    // Discovery paths
    `events/${E}@${G}/name_groups`,
    `events/${E}@${G}/fs`,
    `events/${E}@${G}/players`,
    `events/${E}@${G}/setting`,
    `events/${E}@${G}/standings`,
    `events/${E}/acess_count/user_anonimo`,
  ];
  for (const gid of GROUPS) {
    standardPaths.push(`events/${E}@${gid}/info`);
    standardPaths.push(`events/${E}@${gid}/teams`);
  }
  const rtdb = await readPaths([...new Set(standardPaths)]);
  log(`Read ${Object.keys(rtdb).length} paths`);

  // ──────────────────────────────────────────────────────────
  // PHASE 2: Read match DETAILS for the primary group
  // ──────────────────────────────────────────────────────────
  const matchesRaw = rtdb[`events/${E}/matchs`];
  const groupMatches = [];
  if (matchesRaw && typeof matchesRaw === "object") {
    Object.entries(matchesRaw).forEach(([id, m]) => {
      if (m && typeof m === "object" && m.evt === `${E}@${G}`) {
        groupMatches.push({ id, ...m });
      }
    });
  }
  log(`\n[2] Reading details for ${groupMatches.length} group matches...`);

  const details = {};
  const detailIds = groupMatches.map(m => m.id);
  // Read all detail paths in one go with larger batches
  const detailPaths = detailIds.map(id => `events/${E}@${G}/details/${id}`);
  const res = await readPaths(detailPaths, 5, 300);
  Object.entries(res).forEach(([p, v]) => {
    if (v && typeof v === "object" && !v.__error && v.list) {
      const id = p.split("/").pop();
      details[id] = v;
    }
  });
  log(`Details found: ${Object.keys(details).length}/${detailIds.length}`);

  // ──────────────────────────────────────────────────────────
  // PHASE 3: Read PLAYER data
  // ──────────────────────────────────────────────────────────
  log("\n[3] Reading player data...");
  const playerIds = new Set();
  Object.values(details).forEach(d => {
    if (d.list) {
      Object.values(d.list).forEach(ev => {
        if (ev.pl_id1) playerIds.add(ev.pl_id1);
        if (ev.pl_id2) playerIds.add(ev.pl_id2);
      });
    }
  });

  log(`Unique player IDs: ${playerIds.size}`);
  const playerData = {};

  // BULK read: get entire /player directory in ONE call (fastest!)
  log("  Reading entire /player directory (single query)...");
  const bulkPlayers = await readPath(`events/${E}@${G}/player`);
  if (bulkPlayers && typeof bulkPlayers === "object" && !bulkPlayers.__error) {
    let found = 0;
    Object.entries(bulkPlayers).forEach(([pid, p]) => {
      if (p && typeof p === "object") { playerData[pid] = p; found++; }
    });
    log(`  Bulk read: ${found} players in one query`);
  } else {
    log(`  Bulk /player failed or empty, querying individual IDs...`);
    // Fallback: read in large batches
    const pArr = [...playerIds];
    for (let i = 0; i < pArr.length; i += 50) {
      const batch = pArr.slice(i, i + 50);
      const paths = batch.map(pid => `events/${E}@${G}/player/${pid}`);
      const res = await readPaths(paths);
      Object.entries(res).forEach(([p, v]) => {
        if (v && typeof v === "object" && !v.__error) {
          const pid = p.split("/").pop();
          playerData[pid] = v;
        }
      });
    }
  }
  log(`Players found: ${Object.keys(playerData).length}/${playerIds.size}`);

  // ──────────────────────────────────────────────────────────
  // PHASE 4: Analyze & Organize
  // ──────────────────────────────────────────────────────────
  log("\n[4] Analyzing data...");

  const info = rtdb[`events/${E}@${G}/info`];
  const teamsRaw = rtdb[`events/${E}@${G}/teams`];
  const allMedia = rtdb[`events/${E}/midia`];
  const allMSet = rtdb[`events/${E}@${G}/m_set`] || {};
  const allPlaces = rtdb[`events/${E}/places`] || {};

  // --- Teams analysis ---
  const teamNames = new Map();
  const allTeams = [];
  if (teamsRaw) {
    Object.entries(teamsRaw).forEach(([id, t]) => {
      teamNames.set(id, t.name);
      const entries = Object.entries(t.dt || {}).map(([ts, e]) => ({
        at: parseInt(ts), date: new Date(parseInt(ts)).toISOString(),
        pos: e.colg ?? null, pts: e.col ?? null, group: e.g || null,
        suspended: e.SH || false, stats: decodeStats(e.dt),
      })).sort((a, b) => a.at - b.at);
      allTeams.push({
        id, name: t.name, photo: !!t.url,
        playersCount: t.qtd_p || 0,
        hasPhoto: !!t.url,
        entriesCount: entries.length,
        lastStats: entries.length > 0 ? entries[entries.length - 1] : null,
        coach: t.tec || null,
      });
    });
  }

  // --- Match analysis ---
  const allGroupMatches = [];
  const saintsMatches = [];
  const matchPhases = {};
  Object.entries(matchesRaw || {}).forEach(([id, m]) => {
    if (m.evt !== `${E}@${G}`) return;
    const isSaints = m.team1 === SAINTS || m.team2 === SAINTS;
    const t1 = teamNames.get(m.team1) || m.team1;
    const t2 = teamNames.get(m.team2) || m.team2;
    const detail = details[id];
    const events = detail?.list ? Object.values(detail.list) : [];
    const detailInfo = detail?.info || null;

    // Count action types
    const actionCounts = {};
    let goals1 = 0, goals2 = 0;
    if (details[id]?.list) {
      Object.values(details[id].list).forEach(ev => {
        const ac = ev.ac;
        actionCounts[ac] = (actionCounts[ac] || 0) + 1;
        if (ac === 1 || ac === 5) {
          if (ev.team1 === m.team1) goals1++;
          else if (ev.team1 === m.team2) goals2++;
        }
      });
    }

    const phase = m.title?.includes("final") || m.title?.includes("Cuartos") || m.title?.includes("Semifinal") ? "playoff" : "regular";

    const entry = {
      id, date: m.d_i ? new Date(m.d_i).toISOString().split("T")[0] : "?",
      team1: { id: m.team1, name: t1 },
      team2: { id: m.team2, name: t2 },
      score: m.dt ? `${m.dt.qt_g1 ?? "?"}-${m.dt.qt_g2 ?? "?"}` : "?-?",
      penalties: m.dt?.qt_p1 !== undefined ? `${m.dt.qt_p1}-${m.dt.qt_p2}` : null,
      phase, isSaints,
      title: m.title || null,
      round: m.m_set ? (allMSet[m.m_set]?.title || null) : null,
      venue: allPlaces[m.l]?.title || null,
      finished: !!m.finished,
      hasDetails: !!details[id],
      eventsCount: events.length,
      actionSummary: actionCounts,
      detailInfo,
    };
    allGroupMatches.push(entry);
    if (isSaints) saintsMatches.push(entry);
    matchPhases[phase] = (matchPhases[phase] || 0) + 1;
  });

  // --- Details / Actions analysis ---
  const actionTotals = {};
  const playerActions = {};
  let totalEvents = 0;
  Object.values(details).forEach(d => {
    if (d.list) {
      Object.values(d.list).forEach(ev => {
        totalEvents++;
        const ac = ev.ac || 0;
        actionTotals[ac] = (actionTotals[ac] || 0) + 1;
        const pid = ev.pl_id1 || "unknown";
        if (!playerActions[pid]) playerActions[pid] = { total: 0, byAction: {} };
        playerActions[pid].total++;
        playerActions[pid].byAction[ac] = (playerActions[pid].byAction[ac] || 0) + 1;
      });
    }
  });

  // --- Compute top scorers ---
  const scorers = {};
  Object.values(details).forEach(d => {
    if (d.list) {
      Object.values(d.list).forEach(ev => {
        if (ev.ac === 1) {
          const pid = ev.pl_id1;
          const team = ev.team1;
          if (!scorers[pid]) scorers[pid] = { playerId: pid, name: playerData[pid]?.nome || playerData[pid]?.name || pid, teamId: team, teamName: teamNames.get(team) || team, goals: 0, matches: new Set() };
          scorers[pid].goals++;
          scorers[pid].matches.add(d);
        }
      });
    }
  });
  const sortedScorers = Object.values(scorers)
    .map(s => ({ ...s, matches: s.matches.size }))
    .sort((a, b) => b.goals - a.goals);

  const saintsScorers = sortedScorers.filter(s => s.teamId === SAINTS);

  // --- Divisions inventory ---
  const divisions = GROUPS.map(gid => {
    const divInfo = rtdb[`events/${E}@${gid}/info`];
    const divTeams = rtdb[`events/${E}@${gid}/teams`];
    return {
      id: gid,
      title: divInfo?.info?.sub_title || divInfo?.sub_title || gid,
      teamsCount: divTeams ? Object.keys(divTeams).length : 0,
      hasInfo: !!divInfo,
      hasTeams: !!divTeams,
    };
  });

  // --- Bracket reconstruction ---
  const bracketRounds = {};
  groupMatches.forEach(m => {
    const round = m.round || (m.isPlayoff ? m.title : "regular") || "unknown";
    if (!bracketRounds[round]) bracketRounds[round] = [];
    bracketRounds[round].push(m);
  });

  // --- Places ---
  const placesList = Object.entries(allPlaces).map(([id, p]) => ({ id, name: p.title, address: p.address || null }));

  // ──────────────────────────────────────────────────────────
  // PHASE 5: Build Report
  // ──────────────────────────────────────────────────────────
  const report = {
    scanTimestamp: new Date().toISOString(),
    scanDurationMs: Date.now() - startTime,
    event: {
      id: E, group: G,
      title: info?.info?.sub_title || "?",
      sport: info?.sport === 11 ? "Fútbol 7" : `Sport ${info?.sport}`,
      parent: info?.parent || null,
      admin: info?.admin || null,
      startDate: info?.d_i ? new Date(info.d_i).toISOString() : "?",
      endDate: info?.d_f ? new Date(info.d_f).toISOString() : "?",
      premium: info?.premium2 || 0,
      tournamentPlan: info?.tournament_plan || null,
      groupCount: info?.inf_g || null,
      hasCoverPhoto: !!info?.url_c,
      settings: {
        as_red: info?.evt_data?.as_red, as_yellow: info?.evt_data?.as_yellow,
        blue: info?.blue, first: info?.first, last: info?.last,
        newInscription: info?.new_inscription,
      },
      lastUpdate: rtdb[`events/${E}@${G}/inf_up`] ? new Date(rtdb[`events/${E}@${G}/inf_up`]).toISOString() : "?",
    },

    categories: {
      eventInfo: {
        status: "OK",
        pathsRead: standardPaths.filter(p => p.includes("info")),
        details: {
          fieldCount: info ? Object.keys(info).length : 0,
          fields: info ? Object.keys(info) : [],
        },
      },
      teams: {
        status: teamsRaw ? "OK" : "MISSING",
        total: allTeams.length,
        details: {
          withPhoto: allTeams.filter(t => t.hasPhoto).length,
          withoutPhoto: allTeams.filter(t => !t.hasPhoto).length,
          withCoach: allTeams.filter(t => t.coach).length,
          totalPlayersCount: allTeams.reduce((s, t) => s + t.playersCount, 0),
          avgStatsEntries: (allTeams.reduce((s, t) => s + t.entriesCount, 0) / allTeams.length).toFixed(1),
        },
        teams: allTeams.sort((a, b) => (a.lastStats?.pos || 999) - (b.lastStats?.pos || 999)),
      },
      matches: {
        status: matchesRaw ? "OK" : "MISSING",
        totalAllGroups: matchesRaw ? Object.keys(matchesRaw).length : 0,
        groupMatches: allGroupMatches.length,
        saintsMatches: saintsMatches.length,
        phases: matchPhases,
        withDetails: allGroupMatches.filter(m => m.hasDetails).length,
        withoutDetails: allGroupMatches.filter(m => !m.hasDetails).length,
        withVenue: allGroupMatches.filter(m => m.venue).length,
        finished: allGroupMatches.filter(m => m.finished).length,
        upcoming: allGroupMatches.filter(m => !m.finished).length,
      },
      matchDetails: {
        status: Object.keys(details).length > 0 ? "OK" : "MISSING",
        totalCaptured: Object.keys(details).length,
        totalAvailable: detailIds.length,
        coveragePct: detailIds.length > 0 ? ((Object.keys(details).length / detailIds.length) * 100).toFixed(1) : 0,
        totalEvents: totalEvents,
        actionsByCode: Object.entries(actionTotals)
          .sort((a, b) => b[1] - a[1])
          .map(([code, count]) => ({ code: parseInt(code), label: getActionLabel(parseInt(code)), count })),
      },
      players: {
        status: Object.keys(playerData).length > 0 ? "OK" : "MISSING",
        uniqueIds: playerIds.size,
        withNames: Object.values(playerData).filter(p => p.nome || p.name).length,
        withoutNames: Object.values(playerData).filter(p => !p.nome && !p.name).length,
        withNumbers: Object.values(playerData).filter(p => p.num).length,
      },
      topScorers: {
        status: sortedScorers.length > 0 ? "OK" : "MISSING",
        total: sortedScorers.length,
        saints: saintsScorers.length,
        knownNames: sortedScorers.filter(s => s.name !== s.playerId).length,
        unknownNames: sortedScorers.filter(s => s.name === s.playerId).length,
        top10: sortedScorers.slice(0, 10),
        saintsTop: saintsScorers.slice(0, 10),
      },
      media: {
        status: allMedia ? "OK" : "MISSING",
        total: allMedia ? Object.keys(allMedia).length : 0,
        byGroup: {},
        saintsGroup: 0,
      },
      attachments: {
        status: rtdb[`events/${E}/attachevents`] ? "OK" : "MISSING",
        total: rtdb[`events/${E}/attachevents`] ? Object.keys(rtdb[`events/${E}/attachevents`]).length : 0,
      },
      partners: {
        status: rtdb[`events/${E}/ptr`] ? "OK" : "MISSING",
        total: rtdb[`events/${E}/ptr`] ? Object.keys(rtdb[`events/${E}/ptr`]).length : 0,
        list: rtdb[`events/${E}/ptr`] ? Object.values(rtdb[`events/${E}/ptr`]).map(p => ({ name: p.title, phone: p.numb })) : [],
      },
      places: {
        status: allPlaces && Object.keys(allPlaces).length > 0 ? "OK" : "EMPTY",
        total: allPlaces ? Object.keys(allPlaces).length : 0,
        list: placesList,
      },
      divisions: {
        status: "OK",
        total: divisions.length,
        list: divisions,
      },
      brackets: {
        rounds: Object.keys(bracketRounds).length,
        roundNames: Object.keys(bracketRounds),
        matchesPerRound: Object.fromEntries(
          Object.entries(bracketRounds).map(([r, ms]) => [r, ms.length])
        ),
      },
      extraPaths: {
        name_groups: rtdb[`events/${E}@${G}/name_groups`] ? "FOUND" : "NOT_FOUND",
        fs: rtdb[`events/${E}@${G}/fs`] ? "FOUND" : "NOT_FOUND",
        players: rtdb[`events/${E}@${G}/players`] ? "FOUND" : "NOT_FOUND",
        setting: rtdb[`events/${E}@${G}/setting`] ? "FOUND" : "NOT_FOUND",
        standings: rtdb[`events/${E}@${G}/standings`] ? "FOUND" : "NOT_FOUND",
        access_count: rtdb[`events/${E}/acess_count/user_anonimo`] ? "FOUND" : "NOT_FOUND",
      },
    },

    // The raw "what's missing" analysis
    gapAnalysis: {
      missingDetails: detailIds.length - Object.keys(details).length,
      detailsList: detailIds.filter(id => !details[id]),
      missingPlayers: playerIds.size - Object.keys(playerData).length,
      missingScorerNames: sortedScorers.filter(s => s.name === s.playerId).length,
      teamsWithoutCoach: allTeams.filter(t => !t.coach).length,
      teamsWithoutPhoto: allTeams.filter(t => !t.hasPhoto).length,
      matchesWithoutVenue: allGroupMatches.filter(m => !m.venue).length,
      matchesWithoutDetails: allGroupMatches.filter(m => !m.hasDetails).length,
      unknownPaths: Object.entries({
        name_groups: `events/${E}@${G}/name_groups`,
        fs: `events/${E}@${G}/fs`,
        players: `events/${E}@${G}/players`,
        setting: `events/${E}@${G}/setting`,
        standings: `events/${E}@${G}/standings`,
      }).filter(([, p]) => !rtdb[p] || rtdb[p].__error).map(([k]) => k),
    },
  };

  // Media by group
  if (allMedia) {
    const byGroup = {};
    Object.values(allMedia).forEach(m => {
      const g = m.evt || "unknown";
      byGroup[g] = (byGroup[g] || 0) + 1;
    });
    report.categories.media.byGroup = byGroup;
    report.categories.media.saintsGroup = byGroup[G] || 0;
  }

  // ──────────────────────────────────────────────────────────
  // PHASE 6: Save & Print
  // ──────────────────────────────────────────────────────────
  fs.writeFileSync(path.join(DATA_DIR, "inventory-report.json"), JSON.stringify(sortObjectKeys(report), null, 2));
  log(`\nReport saved: data/inventory-report.json (${(fs.statSync(path.join(DATA_DIR, "inventory-report.json")).size / 1024).toFixed(0)} KB)`);

  // Also save raw data for analysis
  fs.writeFileSync(path.join(DATA_DIR, "inventory-raw.json"), JSON.stringify(sortObjectKeys({
    playerData,
    details: Object.keys(details).length,
    allTeams: allTeams.length,
  }), null, 2));

  printReport(report);

  await close();
  log(`\nScan completed in ${((Date.now() - startTime) / 1000).toFixed(0)}s`);
}

// ─── Print Report ────────────────────────────────────────────

function printReport(r) {
  const c = r.categories;
  console.log("\n" + "=".repeat(72));
  console.log("  COPA BOT INVENTORY REPORT");
  console.log("=".repeat(72));
  console.log(`  Event:      ${r.event.title}`);
  console.log(`  Sport:      ${r.event.sport}`);
  console.log(`  Period:     ${r.event.startDate?.substring(0, 10)} → ${r.event.endDate?.substring(0, 10)}`);
  console.log(`  Scan time:  ${(r.scanDurationMs / 1000).toFixed(0)}s`);
  console.log("─".repeat(72));

  // CATEGORY 1: Event Info
  console.log(`\n  📋 EVENT INFO          ${statusBadge(c.eventInfo.status)}`);
  console.log(`     Fields:             ${c.eventInfo.details.fieldCount}`);
  console.log(`     Groups in event:    ${r.event.groupCount || "?"}`);
  console.log(`     Last update:        ${r.event.lastUpdate?.substring(0, 19) || "?"}`);
  console.log(`     Settings:           ${JSON.stringify(r.event.settings)}`);

  // CATEGORY 2: Divisions
  console.log(`\n  🏆 DIVISIONS           ${statusBadge(c.divisions.status)}`);
  c.divisions.list.forEach(d => {
    console.log(`     ${d.id.padEnd(6)} ${d.title.padEnd(35)} ${d.teamsCount} equipos`);
  });

  // CATEGORY 3: Teams
  console.log(`\n  👥 TEAMS               ${statusBadge(c.teams.status)}`);
  console.log(`     Total:              ${c.teams.total}`);
  console.log(`     With photo:         ${c.teams.details.withPhoto}/${c.teams.total}`);
  console.log(`     With coach:         ${c.teams.details.withCoach}/${c.teams.total}`);
  console.log(`     Total players:      ${c.teams.details.totalPlayersCount}`);
  console.log(`     Avg stats entries:  ${c.teams.details.avgStatsEntries}`);
  if (c.teams.teams) {
    console.log(`     Top 5 teams:`);
    c.teams.teams.slice(0, 5).forEach(t => {
      console.log(`       #${t.lastStats?.pos ?? "?"} ${t.name.padEnd(25)} ${t.lastStats?.stats?.points || "?"}pts (${t.playersCount} players)`);
    });
  }

  // CATEGORY 4: Matches
  console.log(`\n  ⚽ MATCHES             ${statusBadge(c.matches.status)}`);
  console.log(`     Total (all groups): ${c.matches.totalAllGroups}`);
  console.log(`     Group matches:      ${c.matches.groupMatches}`);
  console.log(`     Saints matches:     ${c.matches.saintsMatches}`);
  console.log(`     Finished:           ${c.matches.finished}`);
  console.log(`     Upcoming:           ${c.matches.upcoming}`);
  console.log(`     With details:       ${c.matches.withDetails}/${c.matches.groupMatches}`);
  console.log(`     With venue:         ${c.matches.withVenue}/${c.matches.groupMatches}`);
  console.log(`     Phases:             ${JSON.stringify(c.matches.phases)}`);

  // CATEGORY 5: Match Details
  console.log(`\n  📊 MATCH DETAILS       ${statusBadge(c.matchDetails.status)}`);
  console.log(`     Coverage:           ${c.matchDetails.coveragePct}% (${c.matchDetails.totalCaptured}/${c.matchDetails.totalAvailable})`);
  console.log(`     Total events:       ${c.matchDetails.totalEvents}`);
  if (c.matchDetails.actionsByCode) {
    console.log(`     Action breakdown:`);
    c.matchDetails.actionsByCode.slice(0, 8).forEach(a => {
      console.log(`       ${a.label.padEnd(18)} ${String(a.count).padStart(4)} (código ${a.code})`);
    });
  }

  // CATEGORY 6: Players
  console.log(`\n  🧑 PLAYERS             ${statusBadge(c.players.status)}`);
  console.log(`     Unique IDs:         ${c.players.uniqueIds}`);
  console.log(`     With names:         ${c.players.withNames}`);
  console.log(`     With numbers:       ${c.players.withNumbers}`);

  // CATEGORY 7: Top Scorers
  console.log(`\n  🥅 TOP SCORERS         ${statusBadge(c.topScorers.status)}`);
  console.log(`     Total scorers:      ${c.topScorers.total}`);
  console.log(`     Known names:        ${c.topScorers.knownNames}`);
  console.log(`     Unknown (ID only):  ${c.topScorers.unknownNames}`);
  if (c.topScorers.top10?.length > 0) {
    console.log(`     General top 10:`);
    c.topScorers.top10.forEach((s, i) => {
      console.log(`       ${String(i + 1).padStart(2)}. ${(s.name || "???").padEnd(25)} ${String(s.goals).padStart(2)} goles  (${s.teamName})`);
    });
  }
  if (c.topScorers.saintsTop?.length > 0) {
    console.log(`     Saint Ferdinand:`);
    c.topScorers.saintsTop.forEach((s, i) => {
      console.log(`       ${String(i + 1).padStart(2)}. ${(s.name || "???").padEnd(25)} ${String(s.goals).padStart(2)} goles`);
    });
  }

  // CATEGORY 8: Media
  console.log(`\n  📸 MEDIA               ${statusBadge(c.media.status)}`);
  console.log(`     Total:              ${c.media.total}`);
  console.log(`     Saints group:       ${c.media.saintsGroup}`);
  if (c.media.byGroup) {
    Object.entries(c.media.byGroup).forEach(([g, n]) => {
      console.log(`       ${g.padEnd(6)} ${n} items`);
    });
  }

  // CATEGORY 9: Attachments & Partners
  console.log(`\n  📎 ATTACHMENTS         ${statusBadge(c.attachments.status)}`);
  console.log(`     Total:              ${c.attachments.total}`);
  console.log(`\n  🤝 PARTNERS            ${statusBadge(c.partners.status)}`);
  if (c.partners.list) {
    c.partners.list.forEach(p => console.log(`     ${p.name.padEnd(25)} ${p.phone || ""}`));
  }

  // CATEGORY 10: Places
  console.log(`\n  📍 PLACES              ${statusBadge(c.places.status)}`);
  if (c.places.list?.length > 0) {
    c.places.list.forEach(p => console.log(`     ${p.id.padEnd(8)} ${p.name}`));
  }

  // CATEGORY 11: Brackets
  console.log(`\n  🏅 BRACKETS            OK`);
  Object.entries(c.brackets.matchesPerRound).forEach(([r, n]) => {
    console.log(`     ${r.padEnd(25)} ${n} partidos`);
  });

  // CATEGORY 12: Extra paths discovered
  console.log(`\n  🔍 EXTRA PATHS`);
  Object.entries(c.extraPaths).forEach(([name, status]) => {
    console.log(`     ${name.padEnd(20)} ${status === "FOUND" ? "✅ FOUND" : "❌ NOT FOUND"}`);
  });

  // GAP ANALYSIS
  console.log("\n" + "─".repeat(72));
  console.log("  GAP ANALYSIS — What's Missing");
  console.log("─".repeat(72));
  const gaps = r.gapAnalysis;
  let hasGaps = false;
  if (gaps.missingDetails > 0) { console.log(`  ❌ ${gaps.missingDetails} matches without detail data`); hasGaps = true; }
  if (gaps.missingPlayers > 0) { console.log(`  ❌ ${gaps.missingPlayers} player IDs without name data`); hasGaps = true; }
  if (gaps.missingScorerNames > 0) { console.log(`  ❌ ${gaps.missingScorerNames} scorers with unknown names (just IDs)`); hasGaps = true; }
  if (gaps.teamsWithoutCoach > 0) { console.log(`  ❌ ${gaps.teamsWithoutCoach} teams without coach data`); hasGaps = true; }
  if (gaps.teamsWithoutPhoto > 0) { console.log(`  ❌ ${gaps.teamsWithoutPhoto} teams without photo`); hasGaps = true; }
  if (gaps.matchesWithoutVenue > 0) { console.log(`  ❌ ${gaps.matchesWithoutVenue} matches without venue`); hasGaps = true; }
  if (gaps.unknownPaths.length > 0) { console.log(`  ❌ Firebase paths not found: ${gaps.unknownPaths.join(", ")}`); hasGaps = true; }
  if (!hasGaps) console.log("  ✅ No gaps detected — all available data captured!");

  console.log("\n" + "=".repeat(72) + "\n");
}

function statusBadge(status) {
  if (status === "OK") return "✅";
  if (status === "FOUND") return "✅";
  if (status === "MISSING") return "❌";
  if (status === "EMPTY") return "⚠️";
  return "❓";
}

main().catch(err => { console.error("FATAL:", err); process.exit(1); });
