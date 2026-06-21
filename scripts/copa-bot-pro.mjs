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

  // After reading matches, discover and READ match details + player data
  const allMatchesFromDb = rtdbData[`events/${EVENT_ID}/matchs`];
  if (allMatchesFromDb) {
    const groupDetailIds = Object.entries(allMatchesFromDb)
      .filter(([, m]) => m?.evt === `${EVENT_ID}@${GROUP}`)
      .map(([id]) => id);

    logger.info(`Reading ${groupDetailIds.length} match details...`);
    const detailPaths = groupDetailIds.map(id => `events/${EVENT_ID}@${GROUP}/details/${id}`);
    const detailResults = await bot.readMany(detailPaths);
    rtdbData["__details"] = detailResults;

    rtdbData["__players"] = await bot.readMany([`events/${EVENT_ID}@${GROUP}/player`]);
  }

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
  // PROCESS DATA
  // =============================================================
  logger.info("\n[2] Processing data...");

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

  // --- Calculate form for standings ---
  const teamForm = {};
  standings.forEach(t => teamForm[t.id] = []);
  allMatchesProcessed.forEach(m => {
    if (m.finished && m.score1 !== null) {
      [m.team1.id, m.team2.id].forEach(tid => {
        if (teamForm[tid]) {
          const isHome = m.team1.id === tid;
          const sc = isHome ? m.score1 : m.score2;
          const oc = isHome ? m.score2 : m.score1;
          teamForm[tid].push(sc > oc ? "W" : sc < oc ? "L" : "D");
        }
      });
    }
  });
  Object.keys(teamForm).forEach(id => {
    teamForm[id] = teamForm[id].slice(-5);
  });

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

  // --- Match details (events per match) ---
  const allDetails = rtdbData["__details"] || {};
  const allPlayersRaw = rtdbData["__players"]?.[`events/${EVENT_ID}@${GROUP}/player`] || {};

  // Process players
  const playerNamesMap = {};
  Object.entries(allPlayersRaw).forEach(([pid, p]) => {
    if (p && typeof p === "object") {
      playerNamesMap[pid] = p.nome || p.name || p.num || null;
    }
  });

  // Build match map keyed by the full detail path for correlation
  const matchesById = {};
  if (allMatches) {
    Object.entries(allMatches).forEach(([id, m]) => {
      if (m?.evt === `${EVENT_ID}@${GROUP}`) {
        const detailKey = `events/${EVENT_ID}@${GROUP}/details/${id}`;
        matchesById[detailKey] = m;
      }
    });
  }

  // Enhanced match details with sections
  const matchDetails = bot.processMatchDetails(allDetails, playerNamesMap, teamNames, matchesById, `${EVENT_ID}@${GROUP}`, SAINTS_ID);

  // Merge match details into each MatchEntry so modals show events
  const matchDetailKeys = {};
  const allDetailsByMid={};Object.keys(matchDetails).forEach(k=>{const mid=k.split('/details/').pop();if(mid)allDetailsByMid[mid]=allDetails[k];});Object.keys(matchDetails).forEach(k => {
    const mid = k.split('/details/').pop();
    if (mid) matchDetailKeys[mid] = matchDetails[k];
  });
  const mergeDetails = (match) => {
    const detail = matchDetailKeys[match.id];
    if (detail) {
      const rawDetail = allDetailsByMid[match.id];
      const mappedList = Object.entries(rawDetail?.list || {}).map(([ts, ev]) => ({
        id: match.id + '_' + ts,
        matchId: match.id,
        ac: ev.ac || 0,
        pl_id1: ev.pl_id1 || null,
        team1: ev.team1 || null,
        val1: ev.val1 ?? null,
        val2: ev.val2 ?? null,
        val3: ev.val3 ?? null,
        playerName: playerNamesMap[ev.pl_id1] || null,
      }));
      match.details = { list: mappedList, info: detail.info, best: detail.best };
    }
    const rawMatch = allMatches?.[match.id];
    if (rawMatch?.l && allPlaces[rawMatch.l]) {
      match.venue = allPlaces[rawMatch.l].title || allPlaces[rawMatch.l].name || null;
    }
  };
  allMatchesProcessed.forEach(m => mergeDetails(m));
  saintsMatches.forEach(m => mergeDetails(m));

  // Enhanced top scorers with match context
  const topScorers = bot.processTopScorers(allDetails, playerNamesMap, teamNames, matchesById, `${EVENT_ID}@${GROUP}`);
  const saintsScorers = topScorers.filter(s => s.teamId === SAINTS_ID);

  // Enhanced player roster
  const playersData = bot.processPlayers(allPlayersRaw, teamNames);

  // Enriched media with venue info
  const placesLookup = {};
Object.entries(allPlaces).forEach(([id, p]) => { placesLookup[id] = p; });
  const enrichedMedia = bot.enrichMediaWithVenue(allMedia, allMatches, GROUP, placesLookup);

  // Resolve Drive subfolders: from parent folder → specific match subfolder by turno+cancha
  const enrichedWithSubfolders = await bot.resolveDriveSubfolders(enrichedMedia.filtered || []);

  // Fetch actual Drive photos from each resolved subfolder
  for (const m of enrichedWithSubfolders) {
    if (m.driveSubfolder) {
      const subId = m.driveSubfolder.match(/folders\/([a-zA-Z0-9_-]+)/)?.[1];
      if (subId) {
        const photos = await bot.fetchDriveFolderImages(subId);
        if (photos.length > 0) {
          m.drivePhotos = photos.slice(0, 12);
        }
      }
    }
  }

  // Link media items to saints matches by Fecha number
  const mediaByFecha = {};
  enrichedWithSubfolders.forEach(m => {
    const fm = m.title.match(/Fecha[_\s]*(\d+)/i);
    if (fm) mediaByFecha[parseInt(fm[1])] = m;
  });
  const enrichedFilteredFinal = enrichedWithSubfolders;
  saintsMatches.forEach((m, i) => {
    const fecha = i + 1;
    const mediaItem = mediaByFecha[fecha] || enrichedFilteredFinal.find(em => em.matchedDate === m.date && em.cancha === m.venue);
    if (mediaItem) {
      m.media = [{
        url: mediaItem.drivePhotos?.[0]?.thumbnail || mediaItem.drivePhotos?.[0]?.url || mediaItem.url,
        urlDrive: mediaItem.driveSubfolder || mediaItem.urlDrive,
        urlParentDrive: mediaItem.urlDrive,
        title: mediaItem.title,
        type: mediaItem.type,
        matchedDate: mediaItem.matchedDate,
        cancha: mediaItem.cancha,
        turno: mediaItem.turno,
        drivePhotos: mediaItem.drivePhotos || [],
      }];
    }
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
    standings: standings.map(s => ({ ...s, form: teamForm[s.id] || [] })),
    standingsByGroup: standingsByGroup.map(g => ({
      ...g,
      teams: g.teams.map(t => ({ ...t, form: teamForm[t.id] || [] }))
    })),
    teams: allTeams.map(t => ({ ...t, form: teamForm[t.id] || [] })),
    media: { all: allMediaProcessed, saintsGroup: saintsMedia, enriched: enrichedMedia },
    matches: {
      total: allMatchesProcessed.length,
      items: allMatchesProcessed,
      saints: saintsMatches,
    },
    players: {
      total: playersData.all.length,
      items: playersData.all,
      byTeam: playersData.byTeam,
    },
    matchDetails: {
      total: Object.keys(matchDetails).length,
      items: matchDetails,
      totalEvents: Object.values(matchDetails).reduce((s, e) => s + e.allEvents, 0),
    },
    topScorers: {
      overall: topScorers,
      saints: saintsScorers,
      lastUpdated: new Date().toISOString(),
    },
    attachments: Object.entries(allAttachments).map(([id, a]) => ({ id, title: a.title, url: a.url })),
    partners: Object.entries(allPartners).map(([id, p]) => ({ id, name: p.title, phone: p.numb, url: p.urlP || p.url_l })),
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

  const totalEvents = Object.values(matchDetails).reduce((s, e) => s + e.allEvents, 0);
  logger.info(`\nMedia: ${allMediaProcessed.length} total, ${saintsMedia.length} saints`);
  logger.info(`📊 Match Details: ${Object.keys(matchDetails).length} matches, ${totalEvents} events`);
  const goalCount = topScorers.reduce((s, t) => s + t.goals, 0);
  logger.info(`🥅 Top Scorers: ${topScorers.length} players, ${goalCount} goals`);
  topScorers.slice(0, 3).forEach(s => logger.info(`    ${(s.playerName || "???").padEnd(25)} ${s.goals} goles (${s.teamName})`));
  if (saintsScorers.length > 0) {
    logger.info(`  Saint Ferdinand top scorer: ${saintsScorers[0].playerName || "???"} (${saintsScorers[0].goals} goles)`);
  }
  logger.info(`🧑 Players: ${playersData.all.length} total, ${Object.keys(playersData.byTeam).length} teams with roster`);
  logger.info(`📸 Media enriched: ${enrichedMedia.filtered.length} saints group items`);

  logger.info(`Changes: ${changes.changes.join(", ") || "none"}`);

  await bot.close();
  logger.info("=== DONE ===");
}

main().catch(err => {
  logger.error(`FATAL: ${err.message}`);
  console.error(err);
  process.exit(1);
});
