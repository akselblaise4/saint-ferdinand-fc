/**
 * Copa Bot Config - Calibration & Tuning
 * All parameters are adjustable for precision/performance balance.
 */
export const CONFIG = {
  // === Event targets (auto-discoverable) ===
  event: {
    id: "-5qp1c",
    primaryGroup: "5jvbh",
    saintsId: "-OqC_DyMZey8vTF5Shq5",
    allGroups: ["5jvbh", "kjk7t", "sz2ln", "66786", "mp7pq", "8ard", "6d06s"],
  },

  // === Firebase ===
  firebase: {
    apiKey: "AIzaSyDbR0mRSSb554WadsJgfOivSXLET84IIR0",
    authDomain: "copafacil-web.firebaseapp.com",
    databaseURL: "https://copafacil-web.firebaseio.com",
    projectId: "copafacil-web",
    storageBucket: "copafacil-web.appspot.com",
    messagingSenderId: "1084972798992",
    appId: "1:1084972798992:web:821f62c5b4373754c4e695",
    firebaseJs: "https://www.gstatic.com/firebasejs/11.9.1",
  },

  // === Browser ===
  browser: {
    headless: true,
    viewport: { width: 1920, height: 1080 },
    pageLoadTimeout: 30000,
    waitAfterLoadMs: 10000,
    waitForFlutterMs: 15000,
  },

  // === Retry & Backoff (Calibration) ===
  retry: {
    maxAttempts: 3,
    baseDelayMs: 1000,
    maxDelayMs: 10000,
    jitterFactor: 0.2,
  },

  // === Rate Limiting ===
  rateLimit: {
    queriesPerBatch: 5,
    batchDelayMs: 500,
    betweenBatchesMs: 1500,
    queryTimeoutMs: 15000,
  },

  // === Data Validation Thresholds ===
  validation: {
    maxScore: 50,
    minPlayersPerTeam: 5,
    maxPlayersPerTeam: 40,
    minTeamsPerGroup: 4,
    maxTeamsPerGroup: 30,
    acceptMissingPct: 0.1,
    qualityMinScore: 0.7,
  },

  // === Stats Decoder Field Map ===
  statsFields: {
    0: "points", 1: "played", 2: "wins", 3: "draws", 4: "losses",
    5: "goalsFor", 6: "goalsAgainst", 7: "goalDiff",
    8: "yellowCards", 9: "redCards", 10: "secondYellow",
    11: "ownGoals", 12: "cleanSheets", 13: "penaltiesScored",
    14: "penaltiesAgainst", 15: "redCardsOpponent",
    16: "suspensions", 17: "fouls",
    18: "efficiency", 19: "pointsPerGame",
  },

  // === Path Discovery (for auto-detection) ===
  discovery: {
    knownPaths: [
      "info", "teams", "inf_up", "matchs", "m_set",
      "attachevents", "midia", "ptr", "places", "players",
    ],
    subEventPaths: ["info", "teams", "details"],
    playerPath: "player",
  },
};
