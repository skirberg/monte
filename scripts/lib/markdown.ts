// The Markdown twins: each content page's words as plain Markdown, at the page's path without its trailing slash plus .md
// (markdownPath in lib/seo.ts). Built from the same data the pages render, so a twin says what its page says and nothing
// more. scripts/make-api.ts writes them into public/ and lists them in llms.txt; tests/markdown.test.ts checks that
// every page with a twin has one.
import { Fragment, isValidElement, type ReactNode } from "react";
import { BOILERPLATE } from "@/lib/brand";
import { DISCLAIMER, TOOLS, prevNext, toolHref, type ToolInfo } from "@/lib/decide/tools";
import * as HOWS from "@/lib/decide/how";
import { GAME_EXPLAIN } from "@/lib/play/explain";
import { SECTION_CARDS, SITE_NAME, SOLVER_SEARCH, abs, gameHeading, hasMarkdownTwin, markdownPath } from "@/lib/seo";
import { GAMES, SITE_NAV, playHref, topicLabel } from "@/lib/site-data";
import { DATA, TOPICS, type StudyTopic } from "@/lib/study/data";
import { lessonDescription, lessonsFor, type Lesson, type Step } from "@/lib/study/lessons";
import { FORMULAS_PAGE, SHEET_SECTIONS, TERMS_PAGE } from "@/lib/study/reference";
import { study } from "@/lib/study/routes";
import { SOLVERS, defaults, type Solver, type Table } from "@/lib/study/solvers";

export const LICENSE_LINE = "License: CC BY 4.0, reuse with credit to monte.markets.";

export type TwinGroup = "Pages" | "Topics" | "Lessons" | "Decisions" | "Games" | "Solvers";
export type Twin = {
  /** The page's own path, like /learn/normal/. */
  path: string;
  /** The twin's path, like /learn/normal.md. */
  md: string;
  title: string;
  /** One line: what the page is for. */
  summary: string;
  group: TwinGroup;
  /** The page's own words, after the header. */
  body: string;
  /** The whole file: the header (H1, summary, canonical URL, license), then the body. */
  text: string;
};

/* ---------------- text ---------------- */

const oneLine = (s: string) => s.replace(/\s+/g, " ").trim();

/** Markdown from a content string: its few inline tags (<mark>, <b>, <i>, <sup>) become Markdown; a literal "<" in math stays. */
export const md = (s: string) =>
  oneLine(
    String(s)
      .replace(/<sup>(.*?)<\/sup>/g, (_, x: string) => x.replace(/[0-9]/g, (d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[+d]))
      .replace(/<(mark|b|strong)>(.*?)<\/\1>/g, (_, _t: string, x: string) => `**${x.trim()}**`)
      .replace(/<(i|em)>(.*?)<\/\1>/g, (_, _t: string, x: string) => `*${x.trim()}*`)
      .replace(/<\/?(sub|br)\s*\/?>/g, " "),
  );
/** The same as plain text, for one-line summaries: the tags go and nothing takes their place. */
export const plain = (s: string) =>
  oneLine(
    String(s)
      .replace(/<sup>(.*?)<\/sup>/g, (_, x: string) => x.replace(/[0-9]/g, (d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[+d]))
      .replace(/<\/?(mark|b|strong|i|em|sub|br)\s*\/?>/g, ""),
  );

/** Where a link to one of the site's pages goes: its Markdown twin when it has one, the page itself when not. */
const to = (path: string) => (!path.includes("?") && hasMarkdownTwin(path) ? abs(markdownPath(path)) : abs(path));
const link = (label: string, path: string) => `[${label}](${to(path)})`;

/**
 * Paragraphs from the JSX the pages render (the games' "What's going on", the decisions' "How this works"):
 * <b> and <i> become Markdown emphasis, <code> stays code, a link points at its page's twin, and a heading-style
 * paragraph (font-display) becomes a heading at `heading`.
 */
function blocks(node: ReactNode, heading = "##"): string[] {
  const walk = (n: ReactNode): string => {
    if (n == null || typeof n === "boolean") return "";
    if (typeof n === "string" || typeof n === "number") return String(n);
    if (Array.isArray(n)) return n.map(walk).join("");
    if (!isValidElement(n)) return "";
    const props = n.props as { children?: ReactNode; href?: string; className?: string };
    const inner = walk(props.children);
    if (n.type === Fragment) return inner;
    switch (n.type) {
      case "b":
      case "strong":
        return `**${inner.trim()}**`;
      case "i":
      case "em":
        return `*${inner.trim()}*`;
      case "code":
        return `\`${inner.trim()}\``;
      case "a":
        return props.href?.startsWith("/") ? link(inner.trim(), props.href) : `[${inner.trim()}](${props.href})`;
      case "p":
      case "div":
        return `\n\n${props.className?.includes("font-display") ? `${heading} ` : ""}${inner}\n\n`;
      default:
        return inner;
    }
  };
  return walk(node).split(/\n{2,}/).map(oneLine).filter(Boolean);
}

/** A numbered item whose follow-on lines (sub-bullets) line up under its text. */
const numbered = (i: number, first: string, rest: string[] = []) => {
  const lead = `${i + 1}. `;
  return [lead + first, ...rest.map((r) => " ".repeat(lead.length) + r)].join("\n");
};

/** A Markdown table; a "|" in a cell (P(A | B)) is escaped so it stays in its cell. */
function table(t: Table) {
  const cell = (s: string) => md(s).replace(/\|/g, "\\|") || " ";
  const row = (r: string[]) => `| ${r.map(cell).join(" | ")} |`;
  return [row(t.head), `| ${t.head.map(() => "---").join(" | ")} |`, ...t.rows.map(row), ...(t.foot ? [row(t.foot)] : [])].join("\n");
}

/** A twin: the H1, the one-line summary, the canonical URL and the license, then the page's own words. */
function twin(path: string, group: TwinGroup, title: string, summary: string, body: (string | false | undefined | null)[]): Twin {
  const head = [`# ${title}`, `> ${oneLine(summary)}`, `Canonical URL: ${abs(path)}`, LICENSE_LINE].join("\n\n");
  const words = body.filter((b): b is string => !!b && !!b.trim()).join("\n\n");
  return { path, md: markdownPath(path), title, summary: oneLine(summary), group, body: words, text: `${head}\n\n${words}\n` };
}

/* ---------------- study ---------------- */

/** A topic's "Check yourself" questions, each with its answer and why. */
export const qaLines = (t: StudyTopic) =>
  t.qa.map(([q, a, why], j) => numbered(j, md(q), [`- Answer: ${md(a)}`, ...(why ? [`- Why: ${md(why)}`] : [])])).join("\n");

function topicTwin(t: StudyTopic): Twin {
  const lessons = lessonsFor(t.id);
  const i = TOPICS.indexOf(t), prev = TOPICS[i - 1], next = TOPICS[i + 1];
  return twin(study.topic(t.id), "Topics", t.name, plain(t.line), [
    `Topic ${t.n} of ${TOPICS.length} in ${link("Learn", study.learn)}.`,
    lessons.length > 0 && `## ${lessons.length} lessons · 3 min each`,
    lessons.map((l, j) => numbered(j, link(l.title, study.lesson(t.id, l.slug)))).join("\n"),
    t.qa.length > 0 && "## Check yourself",
    qaLines(t),
    "## The idea in one page",
    md(t.line),
    t.why && md(t.why.click),
    t.why?.uses.map(([field, use]) => `- **${field}**: ${md(use)}`).join("\n"),
    `${t.ex.tag} example: ${md(t.ex.text)}`,
    "## The trap",
    md(t.trap),
    "## Formulas",
    [...t.formulas, ["Remember it", t.hook] as const].map(([name, f]) => `- ${md(name)}: ${md(f)}`).join("\n"),
    t.links.length > 0 && "## Videos and further reading",
    t.links.map(([title, url, about]) => `- [${title}](${url}): ${about}`).join("\n"),
    "## Next",
    [
      `- [Drill this topic](${abs(study.drillTopic(t.id))})`,
      prev && `- Previous topic: ${link(prev.short, study.topic(prev.id))}`,
      next && `- Next topic: ${link(next.short, study.topic(next.id))}`,
    ]
      .filter(Boolean)
      .join("\n"),
  ]);
}

/** One lesson step: an explanation as a paragraph, a question with every choice, its answer back, and the right one marked. */
export const stepText = (s: Step) =>
  "say" in s
    ? md(s.say)
    : [`**Question:** ${md(s.ask)}`, s.options.map((o) => `- ${o.right ? `**${md(o.text)}** (right answer)` : md(o.text)}: ${md(o.why)}`).join("\n")].join("\n\n");

function lessonTwin(t: StudyTopic, l: Lesson): Twin {
  const list = lessonsFor(t.id), i = list.indexOf(l), next = list[i + 1];
  return twin(study.lesson(t.id, l.slug), "Lessons", l.title, lessonDescription(t.name, l), [
    `Lesson ${i + 1} of ${list.length} in ${link(t.name, study.topic(t.id))}.`,
    ...l.steps.map(stepText),
    next ? `Next: ${link(next.title, study.lesson(t.id, next.slug))}` : `Next: [Drill this topic, 8 questions](${abs(study.drillTopic(t.id, 8))})`,
  ]);
}

function formulasTwin(): Twin {
  return twin(FORMULAS_PAGE.path, "Pages", FORMULAS_PAGE.title, FORMULAS_PAGE.description, [
    ...SHEET_SECTIONS.flatMap((s) => [
      `## ${s.title}`,
      s.rows.map((r) => [`- **${md(r.t)}**: ${md(r.f)}`, ...(r.x ? [`  - ${s.kind === "topic" ? "Example: " : ""}${md(r.x)}`] : [])].join("\n")).join("\n"),
    ]),
  ]);
}

function termsTwin(): Twin {
  return twin(TERMS_PAGE.path, "Pages", TERMS_PAGE.title, TERMS_PAGE.description, [
    `[Study them as flashcards](${abs(study.cards)})`,
    ...TOPICS.flatMap((t) => {
      const rows = DATA.terms.filter((x) => x[1] === t.id);
      if (!rows.length) return [];
      return [
        `## ${t.n}. ${t.name}`,
        rows.map(([term, , meaning, example]) => `- **${md(term)}**: ${md(meaning)}\n  - Example: ${md(example)}`).join("\n"),
        `Read the topic: ${link(t.name, study.topic(t.id))}`,
      ];
    }),
  ]);
}

function solverTwin(s: Solver): Twin {
  const n = SOLVERS.indexOf(s) + 1;
  const field = new Map(s.fields.map((f) => [f.k, f]));
  // A select shows its label, not its code.
  const shown = (k: string, v: string) => field.get(k)?.opts?.find(([code]) => code === v)?.[1] ?? v;
  const inputs = s.fields.map((f) =>
    [
      `- ${md(f.l)}: ${f.v ? md(shown(f.k, f.v)) : "blank"}`,
      ...(f.opts ? [`  - Choices: ${f.opts.map(([, label]) => md(label)).join("; ")}`] : []),
      ...(f.when ? [`  - Shown when ${md(field.get(f.when[0])?.l ?? f.when[0])} is ${f.when[1].map((v) => md(shown(f.when![0], v))).join(" or ")}`] : []),
    ].join("\n"),
  );
  // Given values the way Copy work writes them: "label: value; label: value".
  const given = (vals: Record<string, string>) =>
    Object.entries(vals)
      .filter(([, v]) => String(v).trim())
      .map(([k, v]) => `${md(field.get(k)?.l ?? k)}: ${md(shown(k, v))}`)
      .join("; ");
  const result = s.run(defaults(s));
  return twin(study.solve(s.id), "Solvers", SOLVER_SEARCH[s.id].heading, plain(s.sub), [
    `Solver ${n} of ${SOLVERS.length}.`,
    "## Inputs, with the starting numbers",
    inputs.join("\n"),
    s.presets.length > 0 && "## Examples",
    s.presets.map(([label, vals]) => `- **${md(label)}**: ${given(vals)}`).join("\n"),
    !("err" in result) && "## Answers for the starting numbers",
    !("err" in result) && result.table && table(result.table),
    !("err" in result) && result.rows.map((r, i) => numbered(i, `${md(r.q)} = **${md(r.a)}**`, r.w ? [`- Work: ${md(r.w)}`] : [])).join("\n"),
    "## All solvers",
    SOLVERS.map((x) => `- ${x === s ? `${x.title} (this one)` : link(x.title, study.solve(x.id))}`).join("\n"),
  ]);
}

/* ---------------- decide and play ---------------- */

/** "How this works" for a decision: HOW_CHOOSE for choose, and so on (lib/decide/how.tsx). */
const howFor = (id: string) => (HOWS as unknown as Record<string, HOWS.How | undefined>)[`HOW_${id.toUpperCase()}`];

function toolTwin(t: ToolInfo): Twin {
  const how = howFor(t.id);
  if (!how) throw new Error(`no "How this works" for decision ${t.id} in lib/decide/how.tsx`);
  const { next } = prevNext(t.id);
  return twin(toolHref(t.id), "Decisions", t.heading, t.lede, [
    `${link("Decide", "/decide/")}: ${t.kicker}. ${t.description}`,
    `What it teaches: ${t.teaches}.`,
    "## How this works, step by step",
    ...how.steps.flatMap((s, i) => [`### ${i + 1}. ${s.title}`, ...blocks(s.body), ...(s.math ? [`Formula: ${blocks(s.math).join(" ")}`] : [])]),
    ...(how.after ? blocks(how.after, "##") : []),
    DISCLAIMER,
    next && `Next decision: ${link(next.heading, toolHref(next.id))}`,
    link(`All ${TOOLS.length} decisions`, "/decide/"),
  ]);
}

function gameTwin(g: (typeof GAMES)[number]): Twin {
  const i = GAMES.indexOf(g), next = GAMES[(i + 1) % GAMES.length];
  return twin(playHref(g.slug), "Games", gameHeading(g.slug, g.name), g.line, [
    `Game ${i + 1} of ${GAMES.length} in ${link("Play", playHref())}.`,
    "## What’s going on",
    ...blocks(GAME_EXPLAIN[g.slug]),
    `Learn the idea: ${link(topicLabel(g.topic), study.topic(g.topic))}`,
    `Next game: ${link(next.name, playHref(next.slug))}`,
  ]);
}

/* ---------------- home ---------------- */

function homeTwin(): Twin {
  const daily = SECTION_CARDS.find((c) => c.slug === "daily")!;
  const shuffleCard = SECTION_CARDS.find((c) => c.slug === "shuffle")!;
  const first = TOPICS[0];
  const featured = GAMES.filter((g) => ["monty-hall", "election", "house-edge", "long-run"].includes(g.slug));
  return twin("/", "Pages", SITE_NAME, BOILERPLATE.short, [
    "Drop enough grains. The shape appears.",
    `${link("Start the first idea, 4 min", study.topic(first.id))}, or [try 5 questions, no timer](${abs(study.drillTopic(first.id, 5, true))}).`,
    "## Find the grain",
    `${shuffleCard.line} ${link("The Shuffle", "/shuffle/")}`,
    "## Fourteen topics",
    TOPICS.map((t, i) => numbered(i, `${link(t.name, study.topic(t.id))}: ${plain(t.line)}`)).join("\n"),
    "## What happens next?",
    `${daily.line} ${link("The daily chart", "/daily/")}`,
    "## The biggest poll ever taken called the wrong winner.",
    link("Read 14 true stories like it", "/story/"),
    "## Games",
    featured.map((g) => `- ${link(g.name, playHref(g.slug))}: ${g.line}`).join("\n"),
    "## Menu",
    [...SITE_NAV.map((n) => `- ${link(n.label, n.href)}`), `- ${link("Formula sheet", FORMULAS_PAGE.path)}`, `- ${link("Terms", TERMS_PAGE.path)}`, `- [Every page in Markdown](${abs("/llms.txt")})`].join("\n"),
  ]);
}

/** Every twin, home first, then the reference pages, topics with their lessons, decisions, games and solvers. */
export function twins(): Twin[] {
  return [
    homeTwin(),
    formulasTwin(),
    termsTwin(),
    ...TOPICS.flatMap((t) => [topicTwin(t), ...lessonsFor(t.id).map((l) => lessonTwin(t, l))]),
    ...TOOLS.map(toolTwin),
    ...GAMES.map(gameTwin),
    ...SOLVERS.map(solverTwin),
  ];
}
