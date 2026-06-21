/**
 * COPA FÁCIL PRO BOT
 * Precision: retry+backoff, data validation, quality scoring
 * Automation: auto-discovery, change detection, incremental
 * Calibration: fully configurable, adaptive timing
 * Collection: RTDB + Firestore + media + stats + players + top scorers
 *
 * Usage:
 *   node scripts/copa-bot-pro.mjs                    # full run
 *   node scripts/copa-bot-pro.mjs --quick            # skip Firestore, fewer details
 *   node scripts/copa-bot-pro.mjs --validate-only    # validate existing data only
 *   node scripts/copa-bot-pro.mjs --config path      # custom config
 */

import path from "path";
import { fileURLToPath } from "url";
import { CONFIG } from "./lib/config.js";
import { logger } from "./lib/logger.js";
import { CopaBot } from "./lib/bot-core.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = "data";

// --- Parse CLI flags ---
const flags = process.argv.slice(2).reduce((acc, f) => {
  if (f.startsWith("--")) acc[f.replace("--", "")] = true;
  return acc;
}, {});

async function main() {
  logger.info("=== COPA FÁCIL PRO BOT ===");
  if (flags["quick"]) logger.info("Mode: QUICK (skipping Firestore)");
  if (flags["validate-only"]) logger.info("Mode: VALIDATE ONLY");

  const { id: EVENT_ID, primaryGroup: GROUP, saintsId: SAINTS_ID } = CONFIG.event;

  const bot = new CopaBot();
  await bot.init();
  await bot.navigate(EVENT_ID, GROUP);

  // =============================================================
  // AUTO-DISCOVERY
  // =============================================================
  if (flags["discover"]) {
    logger.info("\n=== DISCOVERY ===");
    const groups = await bot.discoverGroups(EVENT_ID);
    const paths = await bot.discoverPaths(EVENT_ID, GROUP);
    logger.info(`Groups: ${groups.map(g => g.id).join(", ")}`);
    logger.info(`Paths: ${paths.join(", ")}`);
    await bot.close();
    return;
  }

  // =============================================================
  // RTDB READ
  // =============================================================
  logger.info("\n[1] Reading Firebase RTDB...");

  const rtdbPaths = [
    `events/${EVENT_ID}@${GROUP}/info`,
    `events/${EVENT_ID}@${GROUP}/teams`,
    `events/${EVENT_ID}@${GROUP}/inf_up`,
    `events/${EVENT_ID}@${GROUP}/m_set`,
    `events/${EVENT_ID}/attachevents`,
    `events/${EVENT_ID}/midia`,
    `events/${EVENT_ID}/ptr`,
    `events/${EVENT_ID}/matchs`,
    `events/${EVENT_ID}/places`,
  ];

  // Sub-event data
  for (const gid of CONFIG.event.allGroups) {
    if (gid !== GROUP) {
      rtdbPaths.push(`events/${EVENT_ID}@${gid}/info`);
      rtdbPaths.push(`events/${EVENT_ID}@${gid}/teams`);
    }
  }

  const rtdbData = await bot.readMany(rtdbPaths);

  // Validation
  const teamQuality = bot.validateTeamData(rtdbData[`events/${EVENT_ID}@${GROUP}/teams`]);
  const matchQuality = bot.validateMatchData(rtdbData[`events/${EVENT_ID}/matchs`]);
  logger.info(`Data quality — teams: ${(teamQuality.score * 100).toFixed(0)}% ${teamQuality.valid ? "OK" : "LOW"}`);
  logger.info(`Data quality — matches: ${(matchQuality.score * 100).toFixed(0)}% ${matchQuality.valid ? "OK" : "LOW"}`);

  // Load previous for diff detection
  let prevData = null;
  try {
    const prev = await import(`../${DATA_DIR}/copa-data-ultimate.json`, { assert: { type: "json" } });
    prevData = prev.default;
  } catch { /* first run */ }

  // =============================================================
  // FIRESTORE (skip if quick or validate-only)
  // =============================================================
  let firestoreData = {};
  if (!flags["quick"] && !flags["validate-only"]) {
    logger.info("\n[2] Reading Firestore...");
    firestoreData = await bot.queryFirestore([
      "matches", "games", "events", "tournaments",
      `events/${EVENT_ID}/matches`, `events/${EVENT_ID}@${GROUP}/matches`,
      "results", "fixtures", "players",
    ]);
  }

  // =============================================================
  // PROCESS DATA
  // =============================================================
  logger.info("\n[3] Processing data...");

  const teamsRaw = rtdbData[`events/${EVENT_ID}@${GROUP}/teams`];
  const info = rtdbData[`events/${EVENT_ID}@${GROUP}/info`];
  const allMedia = rtdbData[`events/${EVENT_ID}/midia`];
  const allMatches = rtdbData[`events/${EVENT_ID}/matchs`];
  const allMSet = rtdbData[`events/${EVENT_ID}@${GROUP}/m_set`];
  const allPlaces = rtdbData[`events/${EVENT_ID}/places`] || {};
  const allAttachments = rtdbData[`events/${EVENT_ID}/attachevents`] || {};
  const allPartners = rtdbData[`events/${EVENT_ID}/ptr`] || {};

  // --- Team names map ---
  const teamNames = new Map();
  if (teamsRaw) Object.entries(teamsRaw).forEach(([id, t]) => teamNames.set(id, t.name));

  // --- Process teams & standings ---
  const { all: allTeams, standings, standingsByGroup, saintsHistory } = bot.processTeams(teamsRaw, SAINTS_ID);

  // --- Process matches ---
  const { all: allMatchesProcessed, saints: saintsMatches } = bot.processMatches(allMatches, `${EVENT_ID}@${GROUP}`, SAINTS_ID, teamNames);

  // --- Process media ---
  const { all: allMediaProcessed, filtered: saintsMedia } = bot.processMedia(allMedia, GROUP);

  // --- Divisions ---
  const divisions = CONFIG.event.allGroups.map(gid => {
    const divInfo = rtdbData[`events/${EVENT_ID}@${gid}/info`];
    const divTeams = rtdbData[`events/${EVENT_ID}@${gid}/teams`];
    return {
      id: gid,
      title: divInfo?.info?.sub_title || divInfo?.sub_title || `División ${gid}`,
      teamsCount: divTeams ? Object.keys(divTeams).length : 0,
    };
  });

  // --- Saints data ---
  const saintsTeam = allTeams.find(t => t.id === SAINTS_ID);

  // --- Change detection ---
  const changes = await bot.computeDiff(
    prevData ? { matches: prevData.matches?.items, teams: prevData.standings, standings: prevData.standings, media: prevData.media?.all } : null,
    { allMatches: allMatchesProcessed, allTeams, standings, allMedia: allMediaProcessed, standingsByGroup, playerCount: 0 }
  );

  if (!changes.hasChanged && !flags["validate-only"]) {
    logger.info("No changes detected since last run. Skipping write (use --force to override).");
    if (!flags["force"]) {
      await bot.close();
      return;
    }
  }

  logger.info(`Changes: ${changes.changes.join(", ") || "none"}`);

  // =============================================================
  // BUILD OUTPUT
  // =============================================================
  const output = {
    fetchedAt: new Date().toISOString(),
    botVersion: "pro-1.0",
    quality: {
      teams: { score: teamQuality.score, valid: teamQuality.valid, issues: teamQuality.issues },
      matches: { score: matchQuality.score, valid: matchQuality.valid, issues: matchQuality.issues },
    },
    changeInfo: changes,
    event: {
      id: EVENT_ID, group: GROUP,
      title: info?.info?.sub_title || "USS Liga Premier",
      sport: info?.sport, admin: info?.admin,
      startDate: info?.d_i ? new Date(info.d_i).toISOString() : null,
      endDate: info?.d_f ? new Date(info.d_f).toISOString() : null,
      urlCover: info?.url_c || null,
    },
    divisions,
    saints: {
      id: SAINTS_ID,
      name: saintsTeam?.name || "SAINT FERDINAND",
      photo: saintsTeam?.photo || null,
      playersCount: saintsTeam?.playersCount || 0,
      group: saintsTeam?.season?.group || "C",
      season: saintsTeam?.season || null,
      latest: saintsTeam?.latest || null,
      statsHistory: saintsHistory,
    },
    standings,
    standingsByGroup,
    media: { all: allMediaProcessed, saintsGroup: saintsMedia },
    matches: {
      total: allMatchesProcessed.length,
      items: allMatchesProcessed,
      saints: saintsMatches,
    },
    topScorers: {
      overall: [],
      saints: [],
      lastUpdated: null,
    },
    attachments: Object.entries(allAttachments).map(([id, a]) => ({ id, title: a.title, url: a.url })),
    partners: Object.entries(allPartners).map(([id, p]) => ({ id, name: p.title, phone: p.numb, url: p.urlP || p.url_l })),
    firestore: firestoreData,
  };

  // =============================================================
  // SAVE
  // =============================================================
  if (!flags["validate-only"]) {
    logger.saveReport("copa-data-ultimate.json", output);
    logger.saveReport("copa-data.json", output);
    logger.saveReport("rtdb-raw.json", rtdbData);
  }

  // =============================================================
  // REPORT
  // =============================================================
  logger.info("\n=== REPORT ===");
  logger.info(`Event: ${output.event.title}`);
  logger.info(`Quality: ${(teamQuality.score * 100).toFixed(0)}% teams, ${(matchQuality.score * 100).toFixed(0)}% matches`);
  logger.info(`Divisions: ${divisions.length}`);
  divisions.forEach(d => logger.info(`  ${d.id}: ${d.title} (${d.teamsCount} equipos)`));

  logger.info(`\nSaint Ferdinand:`);
  logger.info(`  Group: ${output.saints.group} | Pos: ${saintsTeam?.season?.pos || "?"} | Pts: ${saintsTeam?.season?.pts || "?"}`);
  logger.info(`  Stats history: ${saintsHistory.length} entries`);
  saintsHistory.slice(-5).forEach(s => {
    if (s.stats) logger.info(`    ${s.date.substring(0, 10)} pos=${s.pos} pts=${s.stats.points} P=${s.stats.played} W=${s.stats.wins} D=${s.stats.draws} L=${s.stats.losses} GF=${s.stats.goalsFor} GA=${s.stats.goalsAgainst}`);
  });

  logger.info(`\nStandings: ${standings.length} teams in ${standingsByGroup.length} groups`);
  standingsByGroup.forEach(g => {
    logger.info(`  Group ${g.group}: ${g.teams.length} teams`);
    g.teams.slice(0, 3).forEach(t => logger.info(`    #${t.season.pos} ${t.name} (${t.season.pts} pts)`));
  });

  logger.info(`\nMatches: ${allMatchesProcessed.length} total, ${saintsMatches.length} saints`);
  saintsMatches.slice(-5).forEach(m => {
    const home = m.team1.id === SAINTS_ID ? "vs" : "@";
    const score = m.score1 !== null ? `${m.score1}-${m.score2}` : "?";
    logger.info(`    ${m.date} ${home} ${m.team2.name.padEnd(20)} ${score}`);
  });

  logger.info(`\nMedia: ${allMediaProcessed.length} total, ${saintsMedia.length} saints`);
  logger.info(`Changes: ${changes.changes.join(", ") || "none"}`);

  await bot.close();
  logger.info("=== DONE ===");
}

main().catch(err => {
  logger.error(`FATAL: ${err.message}`);
  console.error(err);
  process.exit(1);
});
