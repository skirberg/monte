// Monte as an MCP server: the site's own calculators and lesson data, so a chat app can get the same verified numbers
// and link back to the page that shows them. Everything here is read-only and pure: no keys, no storage, no network.
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { DATA, TOPICS, TOPIC_IDS, topicById, type TopicId } from "../../lib/study/data";
import { lessonsFor } from "../../lib/study/lessons";
import { SOLVER_IDS, study, type SolverId } from "../../lib/study/routes";
import { SOLVERS, defaults, solverById, type Answers, type Values } from "../../lib/study/solvers";
import { abSampleSize, abTest, abTooSmall, testResult, warranty } from "../../lib/decide/math";

const SITE = "https://monte.markets";
const url = (path: string) => `${SITE}${path}`;

/** Plain text from the lesson strings (a few inline tags, superscripts kept as digits). */
const plain = (s: string) =>
  String(s)
    .replace(/<sup>(.*?)<\/sup>/g, (_, x: string) => x.replace(/[0-9]/g, (d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[+d]))
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();

const pct = (x: number, d = 1) => (Number.isFinite(x) ? `${(x * 100).toFixed(d)}%` : "n/a");
const money = (x: number) => (Number.isFinite(x) ? `$${x.toFixed(2)}` : "never");

/** Every tool answers twice: a short readable text and the same facts as structured data. */
function reply(text: string, data: Record<string, unknown>) {
  return { content: [{ type: "text" as const, text }], structuredContent: data };
}

function answersText(title: string, r: Answers) {
  const lines = [title];
  if (r.table) {
    lines.push(r.table.head.join(" | "));
    for (const row of r.table.rows) lines.push(row.join(" | "));
    if (r.table.foot) lines.push(r.table.foot.join(" | "));
  }
  r.rows.forEach((row, i) => lines.push(`${i + 1}. ${plain(row.q)} = ${plain(row.a)}${row.w ? `  (${plain(row.w)})` : ""}`));
  return lines.join("\n");
}

/**
 * Every tool only reads Monte's own code and data: nothing is written, nothing outside is called, and the same
 * input gives the same answer. Directories (Claude's, ChatGPT's) check that all four hints are set.
 */
const READ_ONLY = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false } as const;

export function createServer() {
  const server = new McpServer({ name: "monte", version: "1.1.0", title: "Monte statistics" });

  server.registerTool(
    "list_topics",
    {
      title: "List topics",
      description: "The 14 statistics topics on Monte, in order, with their page links.",
      inputSchema: {},
      annotations: READ_ONLY,
    },
    async () => {
      const topics = TOPICS.map((t) => ({ id: t.id, n: t.n, name: t.name, url: url(study.topic(t.id)) }));
      return reply(topics.map((t) => `${t.n}. ${t.name} (${t.id}) ${t.url}`).join("\n"), { topics });
    },
  );

  server.registerTool(
    "get_topic",
    {
      title: "Get a topic",
      description: "One topic in plain English: the idea, why it matters, a worked example, the usual trap, the formulas and the five lessons, with links.",
      inputSchema: { topic: z.enum(TOPIC_IDS as [TopicId, ...TopicId[]]).describe("Topic id from list_topics, like normal or clt") },
      annotations: READ_ONLY,
    },
    async ({ topic }) => {
      const t = topicById(topic)!;
      const data = {
        id: t.id,
        name: t.name,
        idea: plain(t.line),
        why: t.why ? plain(`${t.why.click} ${t.why.care}`) : undefined,
        example: plain(t.ex.text),
        trap: plain(t.trap),
        remember: t.hook,
        formulas: t.formulas.map(([name, f]) => ({ name, formula: f })),
        lessons: lessonsFor(t.id).map((l) => ({ title: l.title, url: url(study.lesson(t.id, l.slug)) })),
        url: url(study.topic(t.id)),
      };
      const text = [
        `${t.n}. ${t.name}`,
        data.idea,
        data.why && `Why it matters: ${data.why}`,
        `Example: ${data.example}`,
        `The trap: ${data.trap}`,
        `Formulas: ${data.formulas.map((f) => `${f.name}: ${f.formula}`).join("; ")}`,
        `Remember: ${data.remember}`,
        `Lessons: ${data.lessons.map((l) => l.title).join(", ")}`,
        data.url,
      ]
        .filter(Boolean)
        .join("\n");
      return reply(text, data);
    },
  );

  server.registerTool(
    "search_terms",
    {
      title: "Search the glossary",
      description: "Statistics terms in plain English with an example each, matched on the term or its meaning.",
      inputSchema: { query: z.string().min(1).describe("A word or phrase, like standard error or p-value") },
      annotations: READ_ONLY,
    },
    async ({ query }) => {
      const q = query.toLowerCase().trim();
      const hits = DATA.terms
        .filter(([term, , meaning]) => term.toLowerCase().includes(q) || meaning.toLowerCase().includes(q))
        .slice(0, 10)
        .map(([term, topic, meaning, example]) => ({ term, meaning: plain(meaning), example: plain(example), topic, url: url(study.topic(topic)) }));
      const text = hits.length ? hits.map((h) => `${h.term}: ${h.meaning} Example: ${h.example}`).join("\n") : `No term matches "${query}".`;
      return reply(text, { terms: hits });
    },
  );

  server.registerTool(
    "list_solvers",
    {
      title: "List solvers",
      description: "The 11 solvers and the inputs each one takes (key, label, default value, and choices where there are some). Use with solve.",
      inputSchema: {},
      annotations: READ_ONLY,
    },
    async () => {
      const solvers = SOLVERS.map((s) => ({
        id: s.id,
        title: s.title,
        about: plain(s.sub),
        inputs: s.fields.map((f) => ({ key: f.k, label: plain(f.l), default: f.v, ...(f.opts ? { choices: f.opts.map(([v]) => v) } : {}) })),
        url: url(study.solve(s.id)),
      }));
      const text = solvers.map((s) => `${s.id}: ${s.title}. Inputs: ${s.inputs.map((i) => `${i.key} (${i.label}, default ${i.default || "blank"})`).join(", ")}`).join("\n");
      return reply(text, { solvers });
    },
  );

  server.registerTool(
    "solve",
    {
      title: "Solve a problem",
      description:
        "Runs one of Monte's solvers and returns every answer with its working, exactly as the solver page shows it. Inputs you leave out keep the solver's defaults. Numbers may be written as 0.7, 70% or 7/10.",
      inputSchema: {
        solver: z.enum(SOLVER_IDS as unknown as [SolverId, ...SolverId[]]).describe("Solver id from list_solvers, like tree, normal or ci"),
        inputs: z.record(z.string(), z.string()).optional().describe("Input key to value, as text, for example {\"mu\": \"500\", \"sd\": \"20\"}"),
      },
      annotations: READ_ONLY,
    },
    async ({ solver, inputs }) => {
      const s = solverById(solver);
      // A misnamed input would otherwise be ignored and the preset problem answered as if it were the caller's.
      const known = new Set(s.fields.map((f) => f.k));
      const unknown = Object.keys(inputs ?? {}).filter((k) => !known.has(k));
      if (unknown.length)
        return { ...reply(`${s.title} has no input ${unknown.join(", ")}. Its inputs: ${[...known].join(", ")}.`, { error: "unknown inputs", unknown, inputs: [...known] }), isError: true };
      const values: Values = { ...defaults(s), ...(inputs ?? {}) };
      const r = s.run(values);
      const page = url(study.solve(s.id));
      if ("err" in r) return { ...reply(`${s.title}: ${plain(r.err)}`, { error: plain(r.err), inputs: values, url: page }), isError: true };
      const answers = r.rows.map((row) => ({ question: plain(row.q), answer: plain(row.a), working: plain(row.w) }));
      return reply(`${answersText(s.title, r)}\nSee it worked on the page: ${page}`, { solver: s.id, inputs: values, table: r.table, answers, url: page });
    },
  );

  server.registerTool(
    "test_result",
    {
      title: "Is this test result real?",
      description: "For a positive result, the chance you really have the thing, from how common it is, how often the test catches it and how often it false-alarms (Bayes).",
      inputSchema: {
        how_common: z.number().min(0).max(1).describe("Base rate, 0 to 1, like 0.01 for 1 in 100"),
        catches: z.number().min(0).max(1).describe("Sensitivity: chance the test is positive when you have it, 0 to 1"),
        false_alarms: z.number().min(0).max(1).describe("Chance the test is positive when you do not have it, 0 to 1"),
      },
      annotations: READ_ONLY,
    },
    async ({ how_common, catches, false_alarms }) => {
      const r = testResult(how_common, catches, false_alarms);
      const per1000 = { truePositives: Math.round(r.tp * 1000), falseAlarms: Math.round(r.fp * 1000) };
      const text = `If you test positive, the chance you really have it is ${pct(r.realIfPos)}. Test 1,000 people: about ${per1000.truePositives} who have it test positive, and so do ${per1000.falseAlarms} who don't. If you test negative, the chance you still have it is ${pct(r.realIfNeg, 2)}.\n${url("/decide/bayes/")}`;
      return reply(text, { realIfPositive: r.realIfPos, stillIfNegative: r.realIfNeg, per1000, url: url("/decide/bayes/") });
    },
  );

  server.registerTool(
    "warranty",
    {
      title: "Should I buy the warranty?",
      description: "Expected cost of buying versus skipping a warranty or insurance plan, the break-even chance and the plan's markup.",
      inputSchema: {
        price: z.number().min(0).describe("Price of the plan, in dollars"),
        chance: z.number().min(0).max(1).describe("Chance the bad thing happens over the whole plan, 0 to 1"),
        cost: z.number().positive().describe("What it costs you if it happens and you have no plan, in dollars"),
        deductible: z.number().min(0).optional().describe("What you still pay with the plan, in dollars"),
      },
      annotations: READ_ONLY,
    },
    async ({ price, chance, cost, deductible = 0 }) => {
      const w = warranty(price, chance, cost, deductible);
      // Same half-cent tie rule as the warranty page (components/decide/warranty.tsx).
      const cheaper = w.extra > 0.005 ? "skip" : w.extra < -0.005 ? "buy" : "even";
      const verdict = cheaper === "skip" ? `Skipping saves ${money(w.extra)} on average.` : cheaper === "buy" ? `Buying saves ${money(-w.extra)} on average.` : "The two cost the same on average.";
      const text = `Skip it: ${money(w.skip)} on average. Buy it: ${money(w.buy)} on average. ${verdict} The plan pays off on average only above a ${pct(w.breakEven)} chance; its markup is ${Number.isFinite(w.times) ? `${w.times.toFixed(2)}x` : "infinite"}.\n${url("/decide/warranty/")}`;
      return reply(text, { skipAverage: w.skip, buyAverage: w.buy, cheaper, breakEvenChance: w.breakEven, markup: w.times, url: url("/decide/warranty/") });
    },
  );

  server.registerTool(
    "ab_test",
    {
      title: "Did my change really work?",
      description: "Two-proportion z test for an A/B test: the two rates, the lift, the p-value, a 95% range for the difference, and visitors needed per version to detect this gap.",
      inputSchema: {
        visitors_a: z.number().int().positive(),
        conversions_a: z.number().int().min(0),
        visitors_b: z.number().int().positive(),
        conversions_b: z.number().int().min(0),
      },
      annotations: READ_ONLY,
    },
    async ({ visitors_a, conversions_a, visitors_b, conversions_b }) => {
      if (conversions_a > visitors_a || conversions_b > visitors_b) return { ...reply("Conversions can't be more than visitors.", { error: "conversions > visitors" }), isError: true };
      const r = abTest(visitors_a, conversions_a, visitors_b, conversions_b);
      const small = abTooSmall(visitors_a, conversions_a, visitors_b, conversions_b);
      const need = abSampleSize(r.pA, r.pB);
      const text = `A: ${pct(r.pA, 2)}, B: ${pct(r.pB, 2)} (lift ${pct(r.lift)}). p = ${r.p.toPrecision(3)}. 95% range for B minus A: ${pct(r.lo, 2)} to ${pct(r.hi, 2)}.${small ? " Too few conversions for the z test to be trusted." : ""} To detect this gap 80% of the time: ${Number.isFinite(need) ? need.toLocaleString("en-US") : "n/a"} visitors per version.\n${url("/decide/abtest/")}`;
      return reply(text, { rateA: r.pA, rateB: r.pB, lift: r.lift, z: r.z, p: r.p, range95: [r.lo, r.hi], tooSmall: small, visitorsNeededEach: need, url: url("/decide/abtest/") });
    },
  );

  return server;
}
