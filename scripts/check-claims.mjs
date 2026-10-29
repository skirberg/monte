// Reads every lesson line and story and asks Jev (TypeSafe) whether a line overclaims: cause from observed
// data, an estimate stated as fact, a test said to prove something, a rule of thumb stated as always true,
// or a statement a statistics teacher would mark wrong. A development check only; nothing here ships.
// Flags are leads to read, not verdicts. Needs TYPESAFE_API_KEY. At $0.042 per million tokens a run is well under a dollar.
//   node scripts/check-claims.mjs            run and print flagged lines
//   node scripts/check-claims.mjs --dry      count the lines and requests, send nothing
import { readFileSync, writeFileSync } from "node:fs";

const DRY = process.argv.includes("--dry");
const FLAG = 0.7;
const QUESTIONS = {
  cause: "Does this line say one thing causes or changes another, when the data described were only observed, not from a randomized experiment?",
  certain: "Does this line state an estimate, a probability or a statistical result as a certain fact or a guaranteed limit?",
  proof: "Does this line say a statistical test or result proves something, or rules out luck entirely?",
  always: "Does this line state a rule of thumb, such as n over 30, as if it always holds?",
  wrong: "Does this line contain a statistical claim that a careful statistics teacher would mark as wrong?",
};

// Every string of six or more words in the lesson data, with where it lives, grouped by topic.
const data = JSON.parse(readFileSync(new URL("../lib/study/data.json", import.meta.url), "utf8"));
const groups = new Map();
const add = (group, where, text) => {
  const t = String(text).replace(/<[^>]+>/g, "").trim();
  if (t.split(/\s+/).length < 6) return;
  if (!groups.has(group)) groups.set(group, []);
  groups.get(group).push({ where, text: t });
};
const walk = (group, v, path) => {
  if (typeof v === "string") add(group, path, v);
  else if (Array.isArray(v)) v.forEach((x, i) => walk(group, x, `${path}[${i}]`));
  else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) if (!["links", "keywords", "labs", "id", "K"].includes(k)) walk(group, x, `${path}.${k}`);
};
for (const t of data.topics) walk(`topic ${t.id}`, t, `topics[${t.id}]`);
for (const k of ["sheet", "hooks", "fw", "terms", "math"]) walk(k, data[k], k);
const story = readFileSync(new URL("../app/story/page.tsx", import.meta.url), "utf8");
for (const m of story.matchAll(/body: "((?:[^"\\]|\\.)*)"/g)) add("story", `story body ${m.index}`, m[1]);

// One request per group: the lines are the state, and each line gets every question.
const MAX_LINES = 40;
const batches = [];
for (const [group, lines] of groups) for (let i = 0; i < lines.length; i += MAX_LINES) batches.push({ group, lines: lines.slice(i, i + MAX_LINES) });
const total = batches.reduce((s, b) => s + b.lines.length, 0);
console.log(`${total} lines in ${batches.length} requests, ${Object.keys(QUESTIONS).length} questions per line.`);
if (DRY) process.exit(0);

const key = process.env.TYPESAFE_API_KEY;
if (!key) {
  console.error("Set TYPESAFE_API_KEY first (from console.typesafe.ai/keys). Don't paste it into a chat.");
  process.exit(1);
}

const flagged = [];
for (const b of batches) {
  const questions = {};
  b.lines.forEach((_, i) => {
    for (const [id, q] of Object.entries(QUESTIONS)) questions[`${i}_${id}`] = { type: "noul", instructions: `About \`lines[${i}]\`: ${q}` };
  });
  const res = await fetch("https://api.typesafe.ai/v1/systemone", {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({ model: "jev-latest", state: { lesson: `Statistics lesson text, ${b.group}`, lines: b.lines.map((l) => l.text) }, questions }),
  });
  if (!res.ok) throw new Error(`${b.group}: HTTP ${res.status} ${await res.text()}`);
  const { answers } = await res.json();
  b.lines.forEach((l, i) => {
    const hits = Object.keys(QUESTIONS).filter((id) => answers[`${i}_${id}`]?.noul >= FLAG).map((id) => `${id} ${answers[`${i}_${id}`].noul.toFixed(2)}`);
    if (hits.length) flagged.push({ ...l, hits });
  });
  process.stdout.write(".");
}
console.log(`\n${flagged.length} of ${total} lines flagged at ${FLAG} or above.\n`);
for (const f of flagged) console.log(`${f.where}\n  ${f.text}\n  ${f.hits.join(", ")}\n`);
writeFileSync(new URL("../brand/claims-flagged.json", import.meta.url), JSON.stringify(flagged, null, 1));
