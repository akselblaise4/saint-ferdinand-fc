import { chromium } from "playwright";
import fs from "fs";

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDbR0mRSSb554WadsJgfOivSXLET84IIR0",
  databaseURL: "https://copafacil-web.firebaseio.com",
};

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto("https://copafacil.com/-5qp1c@5jvbh", { waitUntil: "domcontentloaded", timeout: 20000 });
await page.waitForTimeout(8000);
await page.goto("about:blank", { waitUntil: "domcontentloaded" });

const data = await page.evaluate(async (config) => {
  const { initializeApp } = await import("https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js");
  const { getDatabase, ref, child, get } = await import("https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js");
  const app = initializeApp(config);
  const db = getDatabase(app);
  const rootRef = ref(db);
  const read = async p => { try { const s = await get(child(rootRef, p)); return s.exists() ? s.val() : null; } catch { return null; } };

  return {
    matches: await read("events/-5qp1c/matchs"),
    teams: await read("events/-5qp1c@5jvbh/teams"),
    mset: await read("events/-5qp1c@5jvbh/m_set"),
  };
}, FIREBASE_CONFIG);

const teamNames = new Map();
if (data.teams) Object.entries(data.teams).forEach(([id, t]) => teamNames.set(id, t.name));

const mset = data.mset || {};
const allMatches = data.matches || {};

// Group match_sets by fs (freeze snapshot = playoff bracket)
const brackets = {};
Object.entries(mset).forEach(([mid, m]) => {
  const bracketId = m.fs;
  if (!brackets[bracketId]) brackets[bracketId] = { fs: bracketId, phases: {} };
  const phase = m.title;
  if (!brackets[bracketId].phases[phase]) brackets[bracketId].phases[phase] = { title: phase, matchSetId: mid, matches: [] };
  brackets[bracketId].phases[phase].matchSetId = mid;
});

// Assign matches to their bracket phases
Object.entries(allMatches).forEach(([mid, m]) => {
  if (m.evt !== "-5qp1c@5jvbh") return;
  if (!m.m_set) return;
  // Find which bracket/phase this belongs to
  Object.entries(brackets).forEach(([fsId, bracket]) => {
    Object.entries(bracket.phases).forEach(([phase, phaseData]) => {
      if (phaseData.matchSetId === m.m_set) {
        phaseData.matches.push({
          id: mid,
          team1: teamNames.get(m.team1) || m.team1?.substring(0, 10),
          team2: teamNames.get(m.team2) || m.team2?.substring(0, 10),
          team1Id: m.team1,
          team2Id: m.team2,
          score1: m.dt?.qt_g1 ?? null,
          score2: m.dt?.qt_g2 ?? null,
          penalties1: m.dt?.qt_p1 ?? null,
          penalties2: m.dt?.qt_p2 ?? null,
          title: m.title || null,
          next1: m.next1 || null,
          pos_eli: m.pos_eli ?? null,
          name1: m.name1 || null,
          name2: m.name2 || null,
          date: m.d_i ? new Date(m.d_i).toISOString().substring(0, 10) : null,
          finished: !!m.finished,
        });
      }
    });
  });
});

// Sort phases
const phaseOrder = ["Cuartos de final", "Semifinal", "Final"];
Object.entries(brackets).forEach(([fsId, bracket]) => {
  const sorted = {};
  phaseOrder.forEach(p => { if (bracket.phases[p]) sorted[p] = bracket.phases[p]; });
  bracket.phases = sorted;
});

// Find SFFC's bracket
const saintsId = "-OqC_DyMZey8vTF5Shq5";
let sffcBracket = null;
Object.entries(brackets).forEach(([fsId, bracket]) => {
  Object.values(bracket.phases).forEach(phase => {
    phase.matches.forEach(m => {
      if (m.team1Id === saintsId || m.team2Id === saintsId) sffcBracket = { ...bracket, bracketId: fsId };
    });
  });
});

const output = {
  brackets,
  sffcBracket,
  saintFerdinand: { id: saintsId, name: "SAINT FERDINAND" },
};

fs.writeFileSync("data/playoff-brackets.json", JSON.stringify(output, null, 2));
console.log("Brackets saved.");
console.log(`Total brackets: ${Object.keys(brackets).length}`);
console.log(`SFFC bracket: ${sffcBracket ? "FOUND (fs=" + sffcBracket.bracketId + ")" : "NOT FOUND"}`);

if (sffcBracket) {
  console.log("\nSFFC BRACKET:");
  Object.entries(sffcBracket.phases).forEach(([phase, p]) => {
    console.log(`\n  ${phase}:`);
    p.matches.forEach(m => {
      const score = m.score1 !== null ? `${m.score1}-${m.score2}` : "?";
      const pen = m.penalties1 !== null ? ` (${m.penalties1}-${m.penalties2} pen)` : "";
      console.log(`    ${m.team1} vs ${m.team2}: ${score}${pen}${m.title ? " [" + m.title + "]" : ""}${m.next1 ? " → " + m.next1 : ""}`);
    });
  });
}

await browser.close();
