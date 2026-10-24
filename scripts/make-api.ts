// Writes the open data: static JSON under public/api/v1/ and public/llms.txt, both from the lesson
// content in lib/study/data. Run from the project root: npm run api
//
//   /api/v1/index.json     what is here, the license line and the date
//   /api/v1/topics.json    the 14 topics: idea, why it matters, formulas, hook, trap, page URL
//   /api/v1/terms.json     the glossary
//   /api/v1/formulas.json  the formula sheet, every row with a worked example
//   /api/v1/sources.json   the free courses, books and videos the site recommends
//
// Safe as a prebuild step: it never fails the build. Each file is written whole or not at all, and on
// any error the old files stay where they are.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { DATA, TOPICS } from "@/lib/study/data";
import { study } from "@/lib/study/routes";
import { SITE_NAME, SITE_URL, abs } from "@/lib/seo";

const OUT = "public/api/v1";
const LICENSE = `Free to use with a link to ${SITE_URL.replace("https://", "")}.`;

/** Plain text from the lesson strings: drop the few inline tags, keep a literal "<" or ">" in math. */
const plain = (s: string) =>
  s
    .replace(/<sup>(.*?)<\/sup>/g, (_, x: string) => x.replace(/[0-9]/g, (d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[+d]))
    .replace(/<\/?(mark|b|i|em|strong|sup|sub|br)\s*\/?>/g, "")
    .replace(/\s+/g, " ")
    .trim();

function write(file: string, body: string) {
  const path = file.includes("/") ? file : `${OUT}/${file}`;
  const tmp = `${path}.tmp`;
  writeFileSync(tmp, body);
  renameSync(tmp, path);
  console.log(`wrote ${path}`);
}
const json = (v: unknown) => JSON.stringify(v, null, 2) + "\n";

function main() {
  const byId = new Map(TOPICS.map((t) => [t.id, t]));
  const topicRef = (id: string) => ({ topic: id, topicName: byId.get(id as never)?.name ?? id, topicUrl: abs(study.topic(id)) });

  const topics = TOPICS.map((t) => ({
    id: t.id,
    n: t.n,
    name: t.name,
    short: t.short,
    line: plain(t.line),
    why: t.why ? { click: plain(t.why.click), care: plain(t.why.care), uses: t.why.uses.map(([field, use]) => ({ field, use: plain(use) })) } : null,
    formulas: t.formulas.map(([name, formula]) => ({ name, formula })),
    hook: plain(t.hook),
    trap: plain(t.trap),
    keywords: t.keywords ?? "",
    url: abs(study.topic(t.id)),
  }));

  const terms = DATA.terms.map(([term, topic, meaning, example]) => ({ term, meaning: plain(meaning), example: plain(example), ...topicRef(topic) }));

  const formulas = TOPICS.map((t) => ({
    topic: t.id,
    n: t.n,
    name: t.name,
    url: abs(study.topic(t.id)),
    rows: (DATA.sheet[t.id] ?? []).map(([name, formula, example, alias]) => ({ name, formula, example, ...(alias ? { alias } : {}) })),
  }));

  const sources = DATA.sources.list.map(([category, title, why, url, checked]) => ({ category, title, why: plain(why), url, checked }));

  // "updated" is the day the content last changed, not the build date, so a rebuild leaves the files alone.
  mkdirSync(OUT, { recursive: true });
  const hash = createHash("sha256").update(JSON.stringify({ topics, terms, formulas, sources })).digest("hex").slice(0, 16);
  let updated = new Date().toISOString().slice(0, 10);
  try {
    const old = JSON.parse(readFileSync(`${OUT}/index.json`, "utf8"));
    if (old.contentHash === hash && typeof old.updated === "string") updated = old.updated;
  } catch {}
  const meta = { site: SITE_URL, license: LICENSE, updated };

  write("topics.json", json({ ...meta, count: topics.length, topics }));
  write("terms.json", json({ ...meta, count: terms.length, terms }));
  write("formulas.json", json({ ...meta, count: formulas.reduce((n, t) => n + t.rows.length, 0), topics: formulas, page: abs(study.formulas) }));
  write("sources.json", json({ ...meta, count: sources.length, categories: DATA.sources.cats, sources }));

  const endpoint = (path: string, about: string, count: number) => ({ path: `/api/v1/${path}`, url: abs(`/api/v1/${path}`), about, count });
  write("index.json", json({
    name: `${SITE_NAME} open data`,
    about: "The lesson content behind monte.markets as static JSON: business statistics topics, a glossary, a formula sheet with worked examples, and recommended free sources. No key needed, read only.",
    version: 1,
    ...meta,
    contentHash: hash,
    endpoints: [
      endpoint("topics.json", "Every topic: the idea in one paragraph, why it matters, its formulas, a memory hook, the common trap and its page.", topics.length),
      endpoint("terms.json", "The glossary: each term with its meaning, an example and its topic.", terms.length),
      endpoint("formulas.json", "The formula sheet by topic, each row with a worked example.", formulas.reduce((n, t) => n + t.rows.length, 0)),
      endpoint("sources.json", "Free courses, books, videos and references, with why each is worth it and the date it was checked.", sources.length),
    ],
    plainText: abs("/llms.txt"),
  }));

  write("public/llms.txt", llms(topics, updated));
}

/** public/llms.txt, after the llms.txt convention: a title, a one-paragraph summary, then link lists. */
function llms(topics: { name: string; line: string; url: string }[], updated: string) {
  // Whole sentences from the start of the idea, enough to say what the topic is (at least 60 characters).
  const lead = (s: string) => {
    let out = "";
    for (const part of s.match(/[^.!?]+[.!?]+(\s|$)/g) ?? [s]) {
      out += part;
      if (out.trim().length >= 60) break;
    }
    return out.trim();
  };
  // The cheat sheet list comes from the manifest make-cheatsheets.tsx writes, so it is never stale.
  let sheets: { file: string; kind: string; title: string }[] = [];
  try {
    if (existsSync("public/cheatsheets/manifest.json")) sheets = JSON.parse(readFileSync("public/cheatsheets/manifest.json", "utf8")).sheets ?? [];
  } catch {}
  const lines = [
    `# ${SITE_NAME}`,
    "",
    `> ${SITE_NAME} (${SITE_URL}) is a free site for learning business statistics, one idea at a time. Fourteen topics from data and sampling to multiple regression, each with a plain explanation, a worked example, an interactive lab and timed drills. Games teach the same ideas with real data, and every formula is on one sheet with a worked example.`,
    "",
    `The lesson content is also published as static JSON (no key needed). ${LICENSE} Updated ${updated}.`,
    "",
    "## Start here",
    "",
    `- [Home](${abs("/")}): what the site is and where to begin`,
    `- [Study](${abs(study.today)}): learn, practice and solve, with progress kept in the browser`,
    `- [All topics](${abs(study.learn)}): the fourteen topics in teaching order`,
    `- [Formula sheet](${abs(study.formulas)}): every formula with a worked example`,
    `- [Glossary](${abs(study.terms)}): terms in plain words, each with an example`,
    `- [Play](${abs("/play/")}): games that each hide one statistics idea`,
    `- [Why statistics](${abs("/story/")}): the case for learning it`,
    `- [How it's built](${abs("/built/")}): the stack, the data sources and the math`,
    "",
    "## Topics",
    "",
    ...topics.map((t) => `- [${t.name}](${t.url}): ${lead(t.line)}`),
    "",
    "## Open data",
    "",
    `- [index.json](${abs("/api/v1/index.json")}): the list of endpoints, the license and the date`,
    `- [topics.json](${abs("/api/v1/topics.json")}): every topic with its idea, why it matters, formulas, hook, trap and URL`,
    `- [formulas.json](${abs("/api/v1/formulas.json")}): the formula sheet by topic, with worked examples`,
    `- [terms.json](${abs("/api/v1/terms.json")}): the glossary`,
    `- [sources.json](${abs("/api/v1/sources.json")}): recommended free courses, books and videos`,
  ];
  if (sheets.length) {
    lines.push("", "## Cheat sheets", "", "Phone-sized images (1080 x 1920 PNG), one per topic plus every formula across a few pages.", "");
    for (const s of sheets) lines.push(`- [${s.kind === "all" ? s.title : `${s.title} cheat sheet`}](${abs(`/cheatsheets/${s.file}`)})`);
  }
  return lines.join("\n") + "\n";
}

try {
  main();
} catch (e) {
  // Never fail the build over the open data: keep the old files and say why.
  console.warn(`open data skipped: ${e instanceof Error ? e.message : e}`);
}
