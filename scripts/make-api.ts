// Writes the open data: static JSON under public/api/v1/, the Markdown twins, public/llms.txt and public/llms-full.txt,
// all from the content in lib/. Run from the project root: npm run api
//
//   /api/v1/index.json     what is here, the license line and the date
//   /api/v1/topics.json    the 14 topics: idea, why it matters, formulas, hook, trap, page URL
//   /api/v1/terms.json     the glossary
//   /api/v1/formulas.json  the formula sheet, every row with a worked example
//   /api/v1/sources.json   the free courses, books and videos the site recommends
//   /index.md, /learn/<topic>.md, /learn/<topic>/<lesson>.md, /learn/formulas.md, /learn/terms.md,
//   /solve/<id>.md, /decide/<id>.md, /play/<slug>.md
//                          each content page as plain Markdown (scripts/lib/markdown.ts)
//
// Safe as a prebuild step: it never fails the build. Each file is written whole or not at all, and on
// any error the old files stay where they are.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { DATA, TOPICS } from "@/lib/study/data";
import { study } from "@/lib/study/routes";
import { REPO_PUBLIC, SITE_NAME, SITE_URL, abs } from "@/lib/seo";
import { LESSONS, lessonsFor } from "@/lib/study/lessons";
import { qaLines, stepText, twins, type Twin, type TwinGroup } from "./lib/markdown";

const OUT = "public/api/v1";
// The code's licence is named only while the code can be read (REPO_PUBLIC in lib/seo.ts).
const LICENSE = `CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/): reuse it with credit to ${SITE_URL.replace("https://", "")}.${REPO_PUBLIC ? " Code: MIT." : ""}`;

/** Plain text from the lesson strings: drop the few inline tags, keep a literal "<" or ">" in math. */
const plain = (s: string) =>
  s
    .replace(/<sup>(.*?)<\/sup>/g, (_, x: string) => x.replace(/[0-9]/g, (d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[+d]))
    .replace(/<\/?(mark|b|i|em|strong|sup|sub|br)\s*\/?>/g, "")
    .replace(/\s+/g, " ")
    .trim();

function write(file: string, body: string, quiet = false) {
  const path = file.includes("/") ? file : `${OUT}/${file}`;
  const tmp = `${path}.tmp`;
  writeFileSync(tmp, body);
  renameSync(tmp, path);
  if (!quiet) console.log(`wrote ${path}`);
}
const json = (v: unknown) => JSON.stringify(v, null, 2) + "\n";

/** The folders under public/ that hold twins besides public/index.md. A twin there that no page has any more is removed. */
const TWIN_DIRS = ["learn", "solve", "decide", "play"];

/** Writes every twin into public/ (all are built before any is written), then removes twins whose page is gone. */
function writeTwins(list: Twin[]) {
  const keep = new Set(list.map((t) => join("public", t.md)));
  for (const t of list) {
    const file = join("public", t.md);
    mkdirSync(dirname(file), { recursive: true });
    write(file, t.text, true);
  }
  const stale: string[] = [];
  const walk = (d: string) => {
    if (!existsSync(d)) return;
    for (const f of readdirSync(d)) {
      const p = join(d, f);
      if (statSync(p).isDirectory()) walk(p);
      else if (p.endsWith(".md") && !keep.has(p)) stale.push(p);
    }
  };
  TWIN_DIRS.forEach((d) => walk(join("public", d)));
  for (const p of stale) {
    unlinkSync(p);
    console.log(`removed ${p}`);
  }
  console.log(`wrote ${list.length} Markdown twins`);
}

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

  // "updated" is the day the content last changed, not the build date, so a rebuild leaves the files alone. The hash
  // covers everything the study pages show (each topic's quiz, example and links, the hooks and every lesson too), so
  // app/sitemap.ts can give those pages this date as their last change.
  mkdirSync(OUT, { recursive: true });
  const pages = { topics: DATA.topics, hooks: DATA.hooks, lessons: LESSONS };
  const hash = createHash("sha256").update(JSON.stringify({ topics, terms, formulas, sources, pages })).digest("hex").slice(0, 16);
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

  // The twins have their own guard: if one cannot be built, the committed twins stay and the rest still gets written.
  let list: Twin[] = [];
  try {
    list = twins();
    writeTwins(list);
  } catch (e) {
    list = [];
    console.warn(`Markdown twins skipped: ${e instanceof Error ? e.message : e}`);
  }

  write("public/llms.txt", llms(topics, updated, list));
  write("public/llms-full.txt", llmsFull(updated, list));
}

/**
 * public/llms-full.txt: the whole course as plain text in one file, so an assistant answering a statistics
 * question can read the idea, the formulas, the example and every lesson's rule without opening 84 pages.
 */
function llmsFull(updated: string, list: Twin[]) {
  const group = (g: TwinGroup) => list.filter((t) => t.group === g);
  const out = [
    `# ${SITE_NAME}: business statistics, the full text`,
    "",
    `> Every topic and lesson on ${SITE_URL}: the idea in plain words, why it matters, a worked example, the formulas, the common trap, the questions with their answers and every lesson step by step. Then the formula sheet, the decisions, the games and the solvers. ${LICENSE} Updated ${updated}.`,
    "",
  ];
  for (const t of TOPICS) {
    out.push(`## ${t.n}. ${t.name}`, "", `Page: ${abs(study.topic(t.id))}`, "", plain(t.line), "");
    if (t.why) {
      out.push(`Why it matters: ${plain(t.why.click)} ${plain(t.why.care)}`, "");
      for (const [field, use] of t.why.uses) out.push(`- ${field}: ${plain(use)}`);
      out.push("");
    }
    out.push(`Example (${t.ex.tag}): ${plain(t.ex.text)}`, "", "Formulas:", "");
    for (const [name, formula] of t.formulas) out.push(`- ${plain(name)}: ${plain(formula)}`);
    out.push(`- Remember it: ${plain(t.hook)}`, "", `The trap: ${plain(t.trap)}`, "");
    if (t.qa.length) out.push("Check yourself:", "", qaLines(t), "");
    if (t.links.length) {
      out.push("Videos and further reading:", "");
      for (const [title, url, about] of t.links) out.push(`- [${title}](${url}): ${about}`);
      out.push("");
    }
    const lessons = lessonsFor(t.id);
    if (lessons.length) {
      out.push("Lessons:", "");
      for (const l of lessons) out.push(`### ${l.title}`, "", `Page: ${abs(study.lesson(t.id, l.slug))}`, "", ...l.steps.flatMap((s) => [stepText(s), ""]));
    }
  }
  // The rest comes from the twins, their headings pushed down to sit under these.
  const embed = (t: Twin, level: number) => [
    `${"#".repeat(level)} ${t.title}`,
    "",
    `Page: ${abs(t.path)}`,
    "",
    t.summary,
    "",
    t.body.replace(/^(#{2,5}) /gm, (_, h: string) => `${"#".repeat(Math.min(6, h.length + level - 1))} `),
    "",
  ];
  const sheet = list.find((t) => t.path === study.formulas);
  if (sheet) out.push(...embed(sheet, 2));
  for (const g of ["Decisions", "Games", "Solvers"] as const) {
    if (!group(g).length) continue;
    out.push(`## ${g}`, "");
    for (const t of group(g)) out.push(...embed(t, 3));
  }
  out.push("## Glossary", "");
  for (const [term, topic, meaning, example] of DATA.terms) out.push(`- ${term} (${abs(study.topic(topic))}): ${plain(meaning)} Example: ${plain(example)}`);
  return out.join("\n").replace(/\n{3,}/g, "\n\n") + "\n";
}

/** public/llms.txt, after the llms.txt convention: a title, a one-paragraph summary, then link lists. */
function llms(topics: { name: string; line: string; url: string }[], updated: string, list: Twin[]) {
  // A page's link goes to its Markdown twin when it has one.
  const twinUrl = (url: string) => {
    const t = list.find((x) => abs(x.path) === url);
    return t ? abs(t.md) : url;
  };
  const page = (label: string, path: string, about: string) => `- [${label}](${twinUrl(abs(path))}): ${about}`;
  const shortName = new Map<string, string>(TOPICS.map((t) => [t.id, t.short]));
  const group = (g: TwinGroup, label = (t: Twin) => t.title) => list.filter((t) => t.group === g).map((t) => `- [${label(t)}](${abs(t.md)}): ${t.summary}`);
  const section = (title: string, items: string[]) => (items.length ? ["", `## ${title}`, "", ...items] : []);
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
    ...(list.length
      ? [
          "Each content page (the home page, every topic and lesson, the formula sheet, the glossary, every decision, game and solver) is also plain Markdown at its path without the trailing slash, plus .md: /learn/normal/ is /learn/normal.md and the home page is /index.md. Each page names its twin with `<link rel=\"alternate\" type=\"text/markdown\">`, and the lists below link to the twins.",
          "",
        ]
      : []),
    "## Start here",
    "",
    page("Home", "/", "what the site is and where to begin"),
    `- [Study](${abs(study.today)}): learn, practice and solve, with progress kept in the browser`,
    `- [All topics](${abs(study.learn)}): the fourteen topics in teaching order`,
    page("Formula sheet", study.formulas, "every formula with a worked example"),
    page("Glossary", study.terms, "terms in plain words, each with an example"),
    `- [The Shuffle](${abs("/shuffle/")}): one statistics question a day under three cups, the same for everyone: follow the right answer through the shuffle, then see the work`,
    `- [Daily chart](${abs("/daily/")}): one real chart a day, the same for everyone: draw what happens next, then see the real line`,
    `- [Play](${abs("/play/")}): games that each hide one statistics idea`,
    `- [Why statistics](${abs("/story/")}): the case for learning it`,
    `- [About](${abs("/about/")}): where Monte began, what it promises and who makes it`,
    `- [How it's built](${abs("/built/")}): the stack, the data sources, the math and the credits`,
    "",
    "## Topics",
    "",
    ...topics.map((t) => `- [${t.name}](${twinUrl(t.url)}): ${lead(t.line)}`),
    ...section("Lessons", group("Lessons", (t) => `${shortName.get(t.path.split("/")[2]) ?? ""}: ${t.title}`)),
    ...section("Decisions", group("Decisions")),
    ...section("Games", group("Games")),
    ...section("Solvers", group("Solvers")),
    "",
    "## Open data",
    "",
    `- [llms-full.txt](${abs("/llms-full.txt")}): every topic and lesson, the formula sheet, the decisions, the games and the solvers as plain text in one file`,
    `- [index.json](${abs("/api/v1/index.json")}): the list of endpoints, the license and the date`,
    `- [topics.json](${abs("/api/v1/topics.json")}): every topic with its idea, why it matters, formulas, hook, trap and URL`,
    `- [formulas.json](${abs("/api/v1/formulas.json")}): the formula sheet by topic, with worked examples`,
    `- [terms.json](${abs("/api/v1/terms.json")}): the glossary`,
    `- [sources.json](${abs("/api/v1/sources.json")}): recommended free courses, books and videos`,
  ];
  lines.push(
    "",
    "## MCP server",
    "",
    "A remote MCP server (Streamable HTTP, no key, read-only) answers with the same code as the site: https://mcp.monte.markets/mcp",
    "",
    "- `list_topics`, `get_topic`: the fourteen topics, each with its idea, example, trap, formulas and lessons",
    "- `search_terms`: the glossary",
    "- `list_solvers`, `solve`: eleven solvers that return every answer with its working",
    "- `test_result`, `warranty`, `ab_test`: is this test result real, should I buy the warranty, did my change really work",
    "",
    "## About",
    "",
    `- [Privacy](${abs("/privacy/")}): no accounts; progress stays in the browser`,
    `- [Terms](${abs("/terms/")}): free to use and reuse with a link`,
    `- [Brand](${abs("/brand/")}): the logo to download, the colours, the type, the voice and ready-to-paste descriptions`,
    `- [Design tokens](${abs("/brand/colors/monte.tokens.json")}): every colour (light, dark and high contrast), corner and duration the site is built from, in the W3C Design Tokens format`,
  );
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
