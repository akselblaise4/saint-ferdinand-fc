import { chromium } from "playwright";
import { CONFIG } from "./config.js";
import { logger } from "./logger.js";

/**
 * CORE BOT ENGINE
 * Precision: retry/backoff, validation, data quality scoring
 * Automation: auto-discovery, incremental, change detection
 * Calibration: adaptive timing, config via CONFIG
 * Collection: comprehensive RTDB + Firestore + media + stats + players
 */
export class CopaBot {
  constructor(config = {}) {
    this.cfg = { ...CONFIG, ...config };
    this.browser = null;
    this.page = null;
    this.metrics = { startedAt: null, queries: 0, errors: 0, retries: 0 };
  }

  // =============================================================
  // LIFECYCLE
  // =============================================================

  async init() {
    this.metrics.startedAt = Date.now();
    this.browser = await chromium.launch({ headless: this.cfg.browser.headless });
    this.page = await this.browser.newPage({ viewport: this.cfg.browser.viewport });

    this.page.on("pageerror", err => {
      logger.warn(`Page error: ${err.message.substring(0, 100)}`);
      this.metrics.errors++;
    });

    logger.info("Browser launched");
    return this;
  }

  async navigate(eventId, group) {
    const url = `https://copafacil.com/-${eventId}@${group}`;
    logger.info(`Navigating to ${url}`);

    await this.page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: this.cfg.browser.pageLoadTimeout,
    });

    await this.page.waitForTimeout(this.cfg.browser.waitAfterLoadMs);

    logger.info("Page loaded");
    return this;
  }

  async close() {
    if (this.browser) await this.browser.close();
    const elapsed = ((Date.now() - this.metrics.startedAt) / 1000).toFixed(0);
    logger.info(`Bot closed. ${this.metrics.queries} queries, ${this.metrics.errors} errors, ${this.metrics.retries} retries, ${elapsed}s elapsed`);
  }

  // =============================================================
  // FIREBASE RTDB DIRECT READ (via Firebase SDK)
  // =============================================================

  async readMany(paths) {
    const result = {};
    const batches = this._chunk(paths, this.cfg.rateLimit.queriesPerBatch);

    for (const batch of batches) {
      const batchResult = await Promise.allSettled(
        batch.map(p => this._readSingle(p))
      );
      batch.forEach((p, i) => {
        result[p] = batchResult[i].status === "fulfilled" ? batchResult[i].value : { __error: batchResult[i].reason?.message };
      });
      if (batches.length > 1) await this._sleep(this.cfg.rateLimit.betweenBatchesMs);
    }
    return result;
  }

  async _readSingle(path) {
    for (let attempt = 1; attempt <= this.cfg.retry.maxAttempts; attempt++) {
      try {
        const data = await this.page.evaluate(async (opts) => {
          const { initializeApp } = await import(opts.appJs);
          const { getDatabase, ref, child, get } = await import(opts.dbJs);
          const app = initializeApp(opts.config, opts.name);
          const db = getDatabase(app);
          const snap = await get(child(ref(db), opts.path));
          return snap.exists() ? snap.val() : null;
        }, {
          appJs: `${this.cfg.firebase.firebaseJs}/firebase-app.js`,
          dbJs: `${this.cfg.firebase.firebaseJs}/firebase-database.js`,
          config: this.cfg.firebase,
          path,
          name: `rtdb-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        });

        this.metrics.queries++;
        if (data !== null) logger.detailed("RTDB_OK", { path, keys: typeof data === "object" ? Object.keys(data).length : "scalar" });
        return data;

      } catch (err) {
        this.metrics.errors++;
        if (attempt < this.cfg.retry.maxAttempts) {
          const delay = this._backoff(attempt);
          this.metrics.retries++;
          logger.warn(`Retry ${attempt}/${this.cfg.retry.maxAttempts} for ${path} in ${delay}ms: ${err.message.substring(0, 80)}`);
          await this._sleep(delay);
        } else {
          logger.error(`Failed ${path}: ${err.message.substring(0, 120)}`);
          throw err;
        }
      }
    }
  }

  // =============================================================
  // FIRESTORE
  // =============================================================

  async queryFirestore(collections) {
    const result = {};
    for (const col of collections) {
      try {
        const name = `fs-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const data = await this.page.evaluate(async (opts) => {
          const { initializeApp } = await import(opts.appJs);
          const { getFirestore, collection, getDocs, query, limit: qLimit } = await import(opts.fsJs);
          const app = initializeApp(opts.config, opts.name);
          const fs = getFirestore(app);
          const q = query(collection(fs, opts.col), qLimit(5));
          const snap = await getDocs(q);
          return snap.empty ? "EMPTY" : snap.docs.map(d => ({ id: d.id, ...d.data() }));
        }, {
          appJs: `${this.cfg.firebase.firebaseJs}/firebase-app.js`,
          fsJs: `${this.cfg.firebase.firebaseJs}/firebase-firestore.js`,
          config: this.cfg.firebase,
          col, name,
        });
        result[col] = data;
        this.metrics.queries++;
      } catch (err) {
        result[col] = `ERR: ${err.message.substring(0, 80)}`;
        this.metrics.errors++;
      }
    }
    return result;
  }

  // =============================================================
  // STATS DECODER (Calibrated)
  // =============================================================

  decodeStats(encoded) {
    if (!encoded || typeof encoded !== "string") return null;

    const raw = {};
    encoded.split("#").forEach(pair => {
      const [k, v] = pair.split("=");
      if (k !== undefined && v !== undefined) raw[parseInt(k)] = isNaN(Number(v)) ? v : Number(v);
    });

    const fields = this.cfg.statsFields;
    const decoded = {};
    Object.entries(fields).forEach(([key, name]) => {
      if (raw[key] !== undefined) decoded[name] = raw[key];
    });

    return decoded;
  }

  // =============================================================
  // DATA PROCESSING
  // =============================================================

  processTeams(teamsRaw, saintsId = null) {
    if (!teamsRaw) return { all: [], standings: {}, standingsByGroup: [] };

    const all = [];
    const saintsHistory = [];

    Object.entries(teamsRaw).forEach(([id, t]) => {
      const entriesSorted = Object.entries(t.dt || {})
        .map(([ts, e]) => ({
          at: parseInt(ts),
          date: new Date(parseInt(ts)).toISOString(),
          pos: e.colg ?? null,
          pts: e.col ?? null,
          groupPts: e.col != null ? e.col : null,
          group: e.g || null,
          suspended: e.SH || false,
          stats: this.decodeStats(e.dt),
        }))
        .sort((a, b) => a.at - b.at);

      const regular = entriesSorted.find(e => e.group);
      const latestRegular = regular || entriesSorted.find(e => e.pos !== null && !e.suspended);
      const latestOverall = [...entriesSorted].reverse().find(e => e.pos !== null && e.stats);

      const team = {
        id, name: t.name, photo: t.url || null, playersCount: t.qtd_p || 0,
        season: {
          group: regular?.group || null,
          pos: regular?.pos ?? null,
          pts: regular?.pts ?? null,
          stats: regular?.stats || null,
        },
        latest: {
          pos: latestOverall?.pos ?? null,
          pts: latestOverall?.pts ?? null,
          stats: latestOverall?.stats || null,
        },
        entries: entriesSorted,
      };
      all.push(team);

      if (saintsId && id === saintsId) {
        saintsHistory.push(...entriesSorted);
      }
    });

    const groups = this._buildStandings(all);
    const standingsByGroup = groups.map(g => ({
      group: g.letter,
      teams: g.teams.sort((a, b) => (a.season.pos || 999) - (b.season.pos || 999)),
    }));
    const flatStandings = standingsByGroup.flatMap(g => g.teams.map(t => ({ ...t, group: g.group })));

    return { all, standings: flatStandings, standingsByGroup, saintsHistory };
  }

  processMatches(allMatches, groupId, saintsId, teamNames = {}) {
    if (!allMatches) return { all: [], saints: [], byGroup: {} };

    const all = [];
    const saints = [];

    Object.entries(allMatches).forEach(([id, m]) => {
      if (m.evt !== groupId) return;

      const isSaints = m.team1 === saintsId || m.team2 === saintsId;
      const localHour = m.d_i ? new Date(m.d_i - (m.gmt || 14400000)).getUTCHours() : null;

      let turno = null;
      if (localHour === 20 || localHour === 8) turno = 1;
      else if (localHour === 21 || localHour === 9) turno = 2;
      else if (localHour === 22 || localHour === 10) turno = 3;
      else if (localHour !== null) turno = `${localHour}:00`;

      const isPlayoff = m.title && /final|cuartos|semifinal/i.test(m.title);

      const entry = {
        id, dateTimestamp: m.d_i || null,
        date: m.d_i ? new Date(m.d_i).toISOString().split("T")[0] : null,
        localHour, turno,
        team1: { id: m.team1, name: teamNames.get(m.team1) || m.team1 },
        team2: { id: m.team2, name: teamNames.get(m.team2) || m.team2 },
        score1: m.dt?.qt_g1 ?? null,
        score2: m.dt?.qt_g2 ?? null,
        penalties1: m.dt?.qt_p1 ?? null,
        penalties2: m.dt?.qt_p2 ?? null,
        title: m.title || null, round: m.round || "",
        phase: isPlayoff ? (m.title || "playoff") : "regular",
        isPlayoff, isSaints,
        finished: !!m.finished, status: m.st,
        next1: m.next1 || null, pos_eli: m.pos_eli ?? null,
      };
      all.push(entry);
      if (isSaints) saints.push(entry);
    });

    all.sort((a, b) => (a.dateTimestamp || 0) - (b.dateTimestamp || 0));
    saints.sort((a, b) => (a.dateTimestamp || 0) - (b.dateTimestamp || 0));

    return { all, saints, byGroup: { [groupId]: all } };
  }

  processMatchDetails(allDetails, playerNamesMap, teamNames, allMatches, groupId, saintsId) {
    const ACTION_LABELS = {
      1: "goal", 2: "assist", 3: "misconduct", 4: "red_card",
      5: "own_goal", 6: "penalty_save", 7: "starter", 8: "substitute",
      9: "yellow_card", 10: "substitution", 11: "goal_against",
      12: "penalty_taken", 13: "penalty_missed", 14: "penalty_saved"
    };
    const ACTION_LABELS_ES = {
      1: "GOL", 2: "ASISTENCIA", 3: "CONDUCTA_INDEBIDA", 4: "EXPULSION",
      5: "AUTOGOL", 6: "ATAJA_PENAL", 7: "TITULAR", 8: "SUPLENTE",
      9: "TARJETA_AMARILLA", 10: "CAMBIO", 11: "GOL_EN_CONTRA",
      12: "PENAL_COBRADO", 13: "PENAL_FALLADO", 14: "PENAL_ATAJADO"
    };

    const getTeamName = (tid) => teamNames.get(tid) || tid;
    const getPlayerName = (pid) => playerNamesMap[pid] || null;

    const result = {};

    Object.entries(allDetails).forEach(([matchId, detail]) => {
      if (!detail?.list) return;

      const teamsInMatch = new Set();
      const sections = { lineup: [], goals: [], cards: [], subs: [], misconduct: [], others: [] };

      Object.entries(detail.list).forEach(([ts, ev]) => {
        const ac = ev.ac || 0;
        const pid = ev.pl_id1 || null;
        const entry = {
          timestamp: parseInt(ts),
          actionCode: ac,
          action: ACTION_LABELS[ac] || `unknown_${ac}`,
          actionLabel: ACTION_LABELS_ES[ac] || `DESCONOCIDO_${ac}`,
          playerId: pid,
          playerName: getPlayerName(pid),
          teamId: ev.team1,
          teamName: getTeamName(ev.team1),
          minute: ac !== 7 ? (ev.val1 ?? null) : null,
          val2: ev.val2 ?? null,
          val3: ev.val3 ?? null,
          msg: ev.msg || null,
        };
        if (ev.team1) teamsInMatch.add(ev.team1);

        if (ac === 7) sections.lineup.push(entry);
        else if (ac === 1 || ac === 5 || ac === 11) sections.goals.push(entry);
        else if (ac === 4 || ac === 9) sections.cards.push(entry);
        else if (ac === 10) sections.subs.push(entry);
        else if (ac === 3) sections.misconduct.push(entry);
        else sections.others.push(entry);
      });

      [sections.lineup, sections.goals, sections.cards, sections.subs, sections.misconduct, sections.others].forEach(arr => {
        arr.sort((a, b) => a.timestamp - b.timestamp);
      });

      const teamsArr = Array.from(teamsInMatch).map(tid => ({ id: tid, name: getTeamName(tid) }));
      let mvp = null;
      if (detail.best) {
        const bestKey = Object.keys(detail.best)[0];
        if (bestKey) {
          mvp = { playerId: bestKey, playerName: getPlayerName(bestKey), rating: detail.best[bestKey]?.num_val || null };
        }
      }

      const match = allMatches?.[matchId];
      const matchContext = match ? {
        date: match.d_i ? new Date(match.d_i).toISOString().split("T")[0] : null,
        localHour: match.d_i ? new Date(match.d_i - (match.gmt || 14400000)).getUTCHours() : null,
        team1: { id: match.team1, name: getTeamName(match.team1) },
        team2: { id: match.team2, name: getTeamName(match.team2) },
        score1: match.dt?.qt_g1 ?? null,
        score2: match.dt?.qt_g2 ?? null,
        title: match.title || null,
        place: match.l || null,
      } : null;

      result[matchId] = {
        matchId,
        matchContext,
        teams: teamsArr,
        numEvents: Object.keys(detail.list).length,
        mvp,
        info: detail.info || null,
        sections,
        allEvents: Object.values(detail.list).length,
      };
    });

    return result;
  }

  processPlayers(allPlayersRaw, teamNames) {
    const roster = {};
    const allPlayers = [];

    Object.entries(allPlayersRaw).forEach(([pid, p]) => {
      if (!p || typeof p !== "object") return;

      const name = p.nome || p.name || null;
      const teamId = p.team || null;
      const teamName = teamId ? (teamNames.get(teamId) || teamId) : null;

      // Decode player stats
      const stats = this.decodeStats(p.dt);

      // Parse name - may be tab-separated
      let firstName = null, lastName = null;
      if (name) {
        const parts = name.split("\t").filter(Boolean);
        if (parts.length >= 2) {
          firstName = parts[0];
          lastName = parts.slice(1).join(" ");
        } else {
          firstName = name;
        }
      }

      const playerEntry = {
        id: pid,
        name, firstName, lastName,
        teamId, teamName,
        photo: p.url || null,
        stats,
        statsHistory: p.fs || null,
      };
      allPlayers.push(playerEntry);

      if (teamId) {
        if (!roster[teamId]) roster[teamId] = { teamId, teamName, players: [] };
        roster[teamId].players.push(playerEntry);
      }
    });

    allPlayers.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    Object.values(roster).forEach(r => r.players.sort((a, b) => (a.name || "").localeCompare(b.name || "")));

    return { all: allPlayers, byTeam: roster };
  }

  processTopScorers(allDetails, playerNamesMap, teamNames, matchesById, groupId) {
    const scorersMap = {};

    Object.entries(allDetails).forEach(([matchId, detail]) => {
      if (!detail?.list) return;

      // Find match info
      const match = matchesById?.[matchId];
      const matchDate = match?.d_i ? new Date(match.d_i).toISOString().split("T")[0] : null;
      const opponentTeamId = null; // determined per goal below
      const matchHomeTeam = match?.team1 || null;
      const matchAwayTeam = match?.team2 || null;

      Object.entries(detail.list).forEach(([ts, ev]) => {
        const ac = ev.ac || 0;
        if (ac !== 1 && ac !== 5) return; // goals and own goals
        const pid = ev.pl_id1;
        if (!pid) return;

        const teamScored = ev.team1;
        const opponentId = teamScored === matchHomeTeam ? matchAwayTeam : (teamScored === matchAwayTeam ? matchHomeTeam : null);

        if (!scorersMap[pid]) {
          scorersMap[pid] = {
            playerId: pid, playerName: playerNamesMap[pid] || null,
            teamId: teamScored, teamName: teamNames.get(teamScored) || teamScored,
            goals: 0, ownGoals: 0, goalsByMatch: [],
          };
        }
        scorersMap[pid].goals++;
        if (ac === 5) scorersMap[pid].ownGoals++;
        scorersMap[pid].goalsByMatch.push({
          matchId, date: matchDate,
          opponentId, opponentName: opponentId ? (teamNames.get(opponentId) || opponentId) : null,
          minute: ev.val1 ?? null,
          isOwnGoal: ac === 5,
        });
      });
    });

    const topScorers = Object.values(scorersMap).sort((a, b) => b.goals - a.goals);
    topScorers.forEach((s, i) => s.overallRank = i + 1);
    return topScorers;
  }

  enrichMediaWithVenue(allMedia, allMatches, groupId, placesMap) {
    if (!allMedia) return { all: [], filtered: [] };

    // Build a date-to-matches lookup for this group
    const dateMatchMap = {};
    Object.entries(allMatches).forEach(([id, m]) => {
      if (m.evt !== `-5qp1c@${groupId}`) return;
      const d = m.d_i ? new Date(m.d_i).toISOString().split("T")[0] : null;
      if (!d) return;
      if (!dateMatchMap[d]) dateMatchMap[d] = [];
      dateMatchMap[d].push(m);
    });

    const all = [];
    Object.entries(allMedia).forEach(([id, m]) => {
      const ts = m.i?.m || null;
      const leg = m.leg || "";

      // Extract date from leg text (e.g., "Fotos Fecha 8 Martes 16/6")
      let matchedDate = null;
      let turno = null;
      let cancha = null;

      // Try to find a matching match by checking dates mentioned in leg
      const dateMatch = leg.match(/(\d{1,2})\/(\d{1,2})/);
      if (dateMatch) {
        const day = parseInt(dateMatch[1]);
        const month = parseInt(dateMatch[2]);
        // Find matches around that date
        for (const [dStr, matchesOnDate] of Object.entries(dateMatchMap)) {
          const md = new Date(dStr);
          if (md.getDate() === day && (md.getMonth() + 1) === month) {
            matchedDate = dStr;
            const firstMatch = matchesOnDate[0];
            if (firstMatch) {
              const localHour = firstMatch.d_i ? new Date(firstMatch.d_i - (firstMatch.gmt || 14400000)).getUTCHours() : null;
              if (localHour === 20 || localHour === 8) turno = 1;
              else if (localHour === 21 || localHour === 9) turno = 2;
              else if (localHour === 22 || localHour === 10) turno = 3;
              else if (localHour !== null) turno = localHour;
              const placeId = firstMatch.l;
              if (placeId && placesMap[placeId]) cancha = placesMap[placeId].title || placesMap[placeId].name || null;
            }
            break;
          }
        }
      }

      all.push({
        id, type: m.ic || "news",
        title: leg,
        url: m.i?.url || m.url,
        urlDrive: m.i?.urlP || m.urlP || null,
        evt: m.evt, timestamp: ts,
        date: ts ? new Date(ts).toISOString() : null,
        matchedDate, turno, cancha,
      });
    });

    const filtered = all.filter(m => m.evt === groupId);
    filtered.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    return { all, filtered };
  }

  processMedia(allMedia, groupId) {
    if (!allMedia) return { all: [], filtered: [] };

    const all = [];
    Object.entries(allMedia).forEach(([id, m]) => {
      const ts = m.i?.m || null;
      all.push({
        id, type: m.ic || "news",
        title: m.leg || "",
        url: m.i?.url || m.url,
        urlDrive: m.i?.urlP || m.urlP || null,
        evt: m.evt, timestamp: ts,
        date: ts ? new Date(ts).toISOString() : null,
      });
    });

    const filtered = all.filter(m => m.evt === groupId);
    filtered.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    return { all, filtered };
  }

  // =============================================================
  // DATA QUALITY & VALIDATION (Calibration)
  // =============================================================

  validateTeamData(teamsData) {
    if (!teamsData) return { valid: false, score: 0, issues: ["No team data"] };
    const issues = [];
    const teamCount = Object.keys(teamsData).length;

    if (teamCount < this.cfg.validation.minTeamsPerGroup * 2) {
      issues.push(`Too few teams: ${teamCount}`);
    }

    let missingData = 0;
    Object.entries(teamsData).forEach(([id, t]) => {
      if (!t.name) missingData++;
      if (!t.dt || Object.keys(t.dt).length === 0) missingData++;
      if ((t.qtd_p || 0) < this.cfg.validation.minPlayersPerTeam) missingData++;
    });

    const missingPct = missingData / teamCount;
    if (missingPct > this.cfg.validation.acceptMissingPct) {
      issues.push(`High missing data rate: ${(missingPct * 100).toFixed(0)}%`);
    }

    const score = Math.max(0, 1 - (issues.length * 0.2) - missingPct);
    return { valid: score >= this.cfg.validation.qualityMinScore, score, issues };
  }

  validateMatchData(matches) {
    if (!matches || Object.keys(matches).length === 0) {
      return { valid: false, score: 0, issues: ["No match data"] };
    }
    const issues = [];
    let invalidScores = 0;
    let total = 0;

    Object.entries(matches).forEach(([id, m]) => {
      total++;
      if (m.dt) {
        const s1 = m.dt.qt_g1;
        const s2 = m.dt.qt_g2;
        if ((s1 !== undefined && s1 > this.cfg.validation.maxScore) ||
            (s2 !== undefined && s2 > this.cfg.validation.maxScore)) {
          invalidScores++;
        }
      }
    });

    if (invalidScores > total * 0.1) issues.push(`Unusual scores in ${invalidScores}/${total} matches`);
    const score = Math.max(0, 1 - issues.length * 0.25);
    return { valid: score >= 0.5, score, issues };
  }

  // =============================================================
  // DIFF / CHANGE DETECTION (Incremental)
  // =============================================================

  async computeDiff(oldData, newData) {
    if (!oldData) return { hasChanged: true, isFirstRun: true, changes: ["initial"], stats: this._computeStats(newData) };

    const changes = [];
    let hasChanged = false;

    if (this._countKeys(oldData.matches) !== this._countKeys(newData.matches)) {
      changes.push("match_count_changed");
      hasChanged = true;
    }
    if (this._countKeys(oldData.teams) !== this._countKeys(newData.teams)) {
      changes.push("team_count_changed");
      hasChanged = true;
    }
    if (JSON.stringify(oldData.standings) !== JSON.stringify(newData.standings)) {
      changes.push("standings_changed");
      hasChanged = true;
    }
    if (JSON.stringify(oldData.media) !== JSON.stringify(newData.media)) {
      changes.push("media_changed");
      hasChanged = true;
    }

    return { hasChanged, isFirstRun: false, changes, stats: this._computeStats(newData) };
  }

  _computeStats(data) {
    return {
      teams: data.allTeams?.length || 0,
      matches: data.allMatches?.length || 0,
      media: data.allMedia?.length || 0,
      players: data.playerCount || 0,
      groups: data.standingsByGroup?.length || 0,
    };
  }

  // =============================================================
  // AUTO-DISCOVERY (Automation)
  // =============================================================

  async discoverGroups(eventId) {
    logger.info("Auto-discovering groups...");
    const { allGroups } = this.cfg.event;
    const results = [];

    for (const gid of allGroups) {
      try {
        const info = await this._readSingle(`events/${eventId}@${gid}/info`);
        if (info) {
          results.push({
            id: gid,
            title: info.info?.sub_title || info.sub_title || gid,
            teams: null,
          });
          logger.info(`  Discovered group ${gid}: ${results[results.length - 1].title}`);
        }
      } catch {
        logger.debug(`  Group ${gid} not found`);
      }
    }
    return results;
  }

  async discoverPaths(eventId, groupId) {
    const found = [];
    for (const p of this.cfg.discovery.knownPaths) {
      try {
        const data = await this._readSingle(`events/${eventId}@${groupId}/${p}`);
        if (data !== null) found.push(p);
      } catch { /* not found */ }
    }
    return found;
  }

  // =============================================================
  // HELPERS
  // =============================================================

  _buildStandings(teams) {
    const groupMap = {};
    teams.forEach(t => {
      const g = t.season.group || "?";
      if (!groupMap[g]) groupMap[g] = { letter: g, teams: [] };
      if (t.season.pos !== null) groupMap[g].teams.push(t);
    });
    return Object.values(groupMap).sort((a, b) => a.letter.localeCompare(b.letter));
  }

  _chunk(arr, size) {
    const result = [];
    for (let i = 0; i < arr.length; i += size) result.push(arr.slice(i, i + size));
    return result;
  }

  _backoff(attempt) {
    const delay = Math.min(
      this.cfg.retry.baseDelayMs * Math.pow(2, attempt - 1),
      this.cfg.retry.maxDelayMs
    );
    const jitter = delay * this.cfg.retry.jitterFactor * (Math.random() * 2 - 1);
    return Math.max(100, Math.round(delay + jitter));
  }

  _sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  _countKeys(obj) {
    return obj && typeof obj === "object" ? Object.keys(obj).length : 0;
  }
}
