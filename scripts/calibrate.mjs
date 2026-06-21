/**
 * Calibration Tool — Tune bot parameters for optimal performance.
 * Tests different config values and reports quality scores.
 *
 * Usage:
 *   node scripts/calibrate.mjs              # full calibration
 *   node scripts/calibrate.mjs --quick      # quick calibration (fewer tests)
 *   node scripts/calibrate.mjs --report     # load last results and report
 */

import { CONFIG } from "./lib/config.js";
import { logger } from "./lib/logger.js";
import { CopaBot } from "./lib/bot-core.js";

const TESTS = {
  retryDelay: [
    { label: "fast", retry: { baseDelayMs: 200, maxDelayMs: 2000 } },
    { label: "moderate", retry: { baseDelayMs: 1000, maxDelayMs: 10000 } },
    { label: "conservative", retry: { baseDelayMs: 3000, maxDelayMs: 30000 } },
  ],
  batchSize: [
    { label: "single", rateLimit: { queriesPerBatch: 1, batchDelayMs: 200 } },
    { label: "small", rateLimit: { queriesPerBatch: 3, batchDelayMs: 400 } },
    { label: "medium", rateLimit: { queriesPerBatch: 5, batchDelayMs: 500 } },
    { label: "aggressive", rateLimit: { queriesPerBatch: 10, batchDelayMs: 300 } },
  ],
};

async function runTest(eventId, groupId, configOverrides) {
  const start = Date.now();
  const bot = new CopaBot(configOverrides);
  let queries = 0, errors = 0;

  try {
    await bot.init();
    await bot.navigate(eventId, groupId);

    const paths = [
      `events/${eventId}@${groupId}/info`,
      `events/${eventId}@${groupId}/teams`,
      `events/${eventId}/matchs`,
    ];

    const result = await bot.readMany(paths);
    queries = bot.metrics.queries;
    errors = bot.metrics.errors;

    const teamData = result[`events/${eventId}@${groupId}/teams`];
    const matchData = result[`events/${eventId}/matchs`];
    const quality = {
      teams: teamData ? bot.validateTeamData(teamData) : { score: 0 },
      matches: matchData ? bot.validateMatchData(matchData) : { score: 0 },
    };

    await bot.close();

    return {
      duration: Date.now() - start,
      queries,
      errors,
      teamQuality: quality.teams.score,
      matchQuality: quality.matches.score,
      avgQueryMs: queries ? Math.round((Date.now() - start) / queries) : null,
    };
  } catch (err) {
    await bot.close().catch(() => {});
    return { duration: Date.now() - start, queries, errors, error: err.message, teamQuality: 0, matchQuality: 0, avgQueryMs: null };
  }
}

async function main() {
  logger.info("=== CALIBRATION TOOL ===");
  const { id: EVENT_ID, primaryGroup: GROUP } = CONFIG.event;
  const quick = process.argv.includes("--quick");
  const reportOnly = process.argv.includes("--report");

  if (reportOnly) {
    try {
      const fs = await import("fs");
      const report = JSON.parse(fs.readFileSync("data/calibration-report.json", "utf8"));
      logger.info("\n=== LAST CALIBRATION REPORT ===");
      Object.entries(report).forEach(([category, results]) => {
        logger.info(`\n${category}:`);
        results.sort((a, b) => (b.teamQuality + b.matchQuality) - (a.teamQuality + a.matchQuality));
        results.forEach(r => {
          const score = ((r.teamQuality + r.matchQuality) / 2 * 100).toFixed(0);
          logger.info(`  ${r.label.padEnd(15)} score=${score}% dur=${(r.duration/1000).toFixed(1)}s avgQ=${r.avgQueryMs}ms err=${r.errors}`);
        });
      });
      return;
    } catch { logger.error("No calibration report found"); return; }
  }

  const results = {};

  // --- Retry delay test ---
  logger.info("\n[1] Testing retry delays...");
  results.retryDelay = [];
  const retryTests = quick ? TESTS.retryDelay.slice(0, 2) : TESTS.retryDelay;
  for (const t of retryTests) {
    logger.info(`  Testing: ${t.label}`);
    const r = await runTest(EVENT_ID, GROUP, { retry: t.retry });
    r.label = t.label;
    results.retryDelay.push(r);
    logger.info(`    duration=${(r.duration/1000).toFixed(1)}s quality=${((r.teamQuality+r.matchQuality)/2*100).toFixed(0)}%`);
  }

  // --- Batch size test ---
  logger.info("\n[2] Testing batch sizes...");
  results.batchSize = [];
  const batchTests = quick ? TESTS.batchSize.slice(1, 3) : TESTS.batchSize;
  for (const t of batchTests) {
    logger.info(`  Testing: ${t.label}`);
    const r = await runTest(EVENT_ID, GROUP, { rateLimit: t.rateLimit });
    r.label = t.label;
    results.batchSize.push(r);
    logger.info(`    duration=${(r.duration/1000).toFixed(1)}s quality=${((r.teamQuality+r.matchQuality)/2*100).toFixed(0)}%`);
  }

  // --- Recommendations ---
  logger.info("\n=== RECOMMENDATIONS ===");
  for (const [category, items] of Object.entries(results)) {
    items.sort((a, b) => (b.teamQuality + b.matchQuality) - (a.teamQuality + a.matchQuality));
    const best = items[0];
    logger.info(`Best ${category}: ${best.label} (quality ${((best.teamQuality+best.matchQuality)/2*100).toFixed(0)}%, ${(best.duration/1000).toFixed(1)}s)`);
  }

  // Save report
  logger.saveReport("calibration-report.json", results);
  logger.success("Calibration complete. Results saved to calibration-report.json");
  logger.info("Run with --report to view again");
}

main().catch(err => { console.error(err); process.exit(1); });
