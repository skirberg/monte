import { Phi, mt, tinv } from "@/lib/study/math";
import { makeCases, type Case } from "@/lib/study/start";
import { solverById, type Answers, type Values } from "@/lib/study/solvers";
import type { TopicId } from "@/lib/study/data";
import { dailyNumber } from "@/lib/play/daily";

/**
 * The Shuffle: one statistics question a day, the same for everyone, played as three-card monte. Three cups,
 * an answer under each. One is right (the grain); the other two are the answers a problem's story leads people
 * to: one value's spread used for an average, the other tail, the question turned around, chances added. You
 * see the three answers, the cups come down and are thrown, and you lift one. The right answer is computed by
 * the study code (the cases in lib/study/start.ts and the solvers in lib/study/solvers.ts), never typed.
 *
 * Each day's round depends only on the date: the number is the daily chart's (lib/play/daily.ts), so a day's
 * chart and Shuffle share it. Changing FAMILIES' order, a family's draws or SALT changes past and present
 * rounds for everyone: treat them as fixed, and add a new family at the end.
 */

export type Cup = {
  /** What is written on the table under the cup. A range is two lines. */
  label: string;
  lines?: [string, string];
  right: boolean;
  /** Two or three words under the cup once it is lifted: what the number is. */
  tag: string;
  /** One sentence on what this answer did, said when the cup is lifted. */
  note: string;
};

export type Family = "average" | "crate" | "range" | "shape" | "bayes" | "either" | "given" | "birthday" | "doors" | "edge";

export type ShuffleRound = {
  n: number;
  /** The day it belongs to, or null for a practice round. */
  day: string | null;
  family: Family;
  topic: TopicId;
  /** A game on the site that plays the same idea, when there is one. */
  game?: string;
  setup: string;
  q: string;
  /** In the order they stand before the throw: cup i starts in slot i. */
  cups: [Cup, Cup, Cup];
  /** The work, one step a line. */
  work: string[];
  /** The idea underneath, in one sentence. */
  grain: string;
  /** The work as a picture: the numbers components/play/shuffle-work.tsx draws, from the same code as the work. */
  fig: Fig;
  /** The throw: which two slots trade places, in order. */
  swaps: [number, number][];
};

/**
 * What the reveal draws (DESIGN.md, "The Shuffle", Nov 20 2026 design pass): every number comes from the same lines
 * that write the work, so the picture and the steps can never disagree.
 */
export type Fig =
  /** One value's curve and the average's (or a total's), the cutoff, and the grain's tail shaded. `grain` names the curve the question is about. */
  | { kind: "curves"; mu: number; sd: number; se: number; cut: number; cutLabel: string; dir: "above" | "below"; unit: string; one: string; many: string; grain: "average" | "one"; answer: number; trap: string; skew?: boolean }
  /** A skewed shape with the normal curve laid over it: the facts don't give the shape. */
  | { kind: "skew"; mu: number; sd: number; cut: number; unit: string; n: number; one: string; many: string }
  /** Three ranges on one line: the grain's, one value's, and the wrong critical number's. */
  | { kind: "ranges"; xbar: number; unit: string; dp: number; grain: [number, number]; wide: [number, number]; near: [number, number]; crit: string; nearTag: string; one: string }
  /** A thousand, as dots: who has it, who gets flagged. */
  | { kind: "people"; per: number; sick: number; hit: number; fa: number; who: [string, string]; answer: number }
  /** None, step by step: each one keeps (1 − p) of what is left. */
  | { kind: "chain"; p: number; n: number; none: number; least: number }
  /** Everyone, the given group inside it, and the overlap. */
  | { kind: "groups"; N: number; A: number; B: number; AB: number; a: string; b: string }
  /** People round a table, a line for every pair. */
  | { kind: "pairs"; n: number; k: number; share: number }
  /** The doors, with the chance as grains: the opened doors' grains move to the closed ones. */
  | { kind: "doors"; v: number; opened: number }
  /** The wheel's pockets and what a spin is worth. */
  | { kind: "wheel"; pockets: number; bet: number; win: number; lose: number; ev: number };

const SALT = 0x5eed;

/** A small seeded generator (mulberry32): the same numbers on every machine. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
type Rand = () => number;
const pickOf = <T,>(r: Rand, a: readonly T[]): T => a[Math.floor(r() * a.length)];

// ---------- numbers as they sit on the table

/** Percent with the fewest decimals that keep it honest: 26%, 5.9%, 0.4%. */
function pct(x: number, d: number) {
  if (x > 0 && x < 0.001) return "< 0.1%";
  if (x < 1 && x > 0.999) return "> 99.9%";
  const min = x < 0.1 ? 1 : 0;
  return `${(x * 100).toFixed(Math.max(d, min))}%`;
}
/** Labels for three probabilities, with one more decimal until no two read the same. */
export function pctLabels(xs: number[]) {
  for (let d = 0; d < 4; d++) {
    const out = xs.map((x) => pct(x, d));
    if (new Set(out).size === out.length) return out;
  }
  return xs.map((x) => pct(x, 4));
}
const money = (x: number) => `${x < 0 ? "−" : x > 0 ? "+" : ""}$${Math.abs(x).toFixed(2)}`;
const num = (x: number) => x.toLocaleString("en-US");
const n2 = (x: number) => (Math.round(x * 100) / 100).toString();
const p4 = (x: number) => x.toFixed(4);
const range = (lo: number, hi: number, dp: number) => [lo.toFixed(dp), hi.toFixed(dp)] as [string, string];

/** A family's round before it is dealt: the grain first, then the two traps. A probability gives `value` and gets its label at the deal. */
type Answer = { right: boolean; tag: string; note: string; value?: number; label?: string; lines?: [string, string] };
type Draft = Omit<ShuffleRound, "n" | "day" | "cups" | "swaps"> & { answers: [Answer, Answer, Answer] };

// ---------- the families

const NOUN: Record<string, [one: string, many: string]> = {
  juice: ["bottle", "bottles"],
  coffee: ["wait", "waits"],
  tennis: ["serve", "serves"],
  elevator: ["adult", "adults"],
  battery: ["phone", "phones"],
  commute: ["day", "days"],
  bolts: ["bolt", "bolts"],
  income: ["household", "households"],
};

const side = (z: number, dir: "above" | "below") => (dir === "above" ? 1 - Phi(z) : Phi(z));
const tailWord = (dir: "above" | "below") => (dir === "above" ? "more than" : "less than");

/** An average of many, or a total: the story is about single things, the question about the average. */
function average(r: Rand): Draft {
  const cases = makeCases(2 + Math.floor(r() * 1e6));
  const c = cases[pickOf(r, [1, 3, 8, 13])];
  const p = c.params;
  const [one, many] = NOUN[c.story];
  const se = p.sd / Math.sqrt(p.n);
  const right = c.answer as number;
  const single = side((p.cut - p.mu) / p.sd, p.dir);
  const other = side((p.cut - p.mu) / se, p.dir === "above" ? "below" : "above");
  const total = c.story === "elevator";
  return {
    family: "average",
    topic: "clt",
    setup: c.setup,
    q: c.q,
    work: c.steps,
    grain: total
      ? `A total of ${p.n} spreads by σ√n, far less than ${p.n} times one ${one}'s spread. The story is about one ${one}; the question is about all ${p.n}.`
      : `An average of ${p.n} spreads less than one ${one}: use σ/√n = ${n2(se)}, not σ = ${num(p.sd)}.`,
    fig: { kind: "curves", mu: p.mu, sd: p.sd, se, cut: p.cut, cutLabel: total ? `1,000 ÷ ${p.n}` : `${num(p.cut)}`, dir: p.dir, unit: c.unit, one, many: `average of ${p.n}`, skew: c.story === "coffee", grain: "average", answer: right, trap: `one ${one}` },
    answers: [
      { right: true, value: right, tag: "the grain", note: "" },
      {
        right: false,
        value: single,
        tag: `one ${one}`,
        note: total
          ? `That is the chance one adult weighs more than ${n2(p.cut)} kg. The question is about the total of ${p.n}.`
          : `That uses σ, the spread of one ${one}. An average of ${p.n} ${many} spreads less.`,
      },
      { right: false, value: other, tag: "other tail", note: `That is the other side: ${tailWord(p.dir === "above" ? "below" : "above")} the cutoff. The question asks ${tailWord(p.dir)}.` },
    ],
  };
}

/** One value pulled from a group: the story has an n, and the math should ignore it. */
function crate(r: Rand): Draft {
  const c = makeCases(2 + Math.floor(r() * 1e6))[6];
  const p = c.params;
  const g = p.group!;
  const right = c.answer as number;
  const divided = side((p.cut - p.mu) / (p.sd / Math.sqrt(g)), p.dir);
  const other = side((p.cut - p.mu) / p.sd, "above");
  return {
    family: "crate",
    topic: "normal",
    setup: c.setup,
    q: c.q,
    work: c.steps,
    grain: `One bottle spreads by σ itself. The crate of ${g} is part of the story, not the math.`,
    fig: { kind: "curves", mu: p.mu, sd: p.sd, se: p.sd / Math.sqrt(g), cut: p.cut, cutLabel: `${num(p.cut)}`, dir: p.dir, unit: c.unit, one: "bottle", many: `÷ √${g}`, grain: "one", answer: right, trap: `÷ √${g}` },
    answers: [
      { right: true, value: right, tag: "the grain", note: "" },
      { right: false, value: divided, tag: `÷ √${g}`, note: `That divides by √${g}, as if the crate were averaged. Nothing is averaged: the question is about the one bottle you pull.` },
      { right: false, value: other, tag: "other tail", note: `That is the chance of more than ${num(p.cut)} ml. The question asks less than.` },
    ],
  };
}

/** A range for an unknown mean: the classic slips are σ for the standard error and the wrong critical number. */
function rangeFamily(r: Rand): Draft {
  const c = makeCases(2 + Math.floor(r() * 1e6))[pickOf(r, [2, 7, 10, 14])];
  const p = c.params;
  const [one] = NOUN[c.story];
  const se = p.sd / Math.sqrt(p.n);
  const crit = p.t ? tinv(0.975, p.n - 1) : 1.96;
  const [lo, hi] = c.answer as [number, number];
  const wide = range(p.xbar - crit * p.sd, p.xbar + crit * p.sd, c.dp);
  const slip = p.t ? 1.96 : 1.645;
  const near = range(p.xbar - slip * se, p.xbar + slip * se, c.dp);
  return {
    family: "range",
    topic: "ci",
    setup: c.setup,
    q: c.q,
    work: c.steps,
    grain: `A range for the mean uses the standard error, σ/√n. Single ${NOUN[c.story][1]} spread wider than their mean does.`,
    fig: { kind: "ranges", xbar: p.xbar, unit: c.unit, dp: c.dp, grain: [lo, hi], wide: [Number(wide[0]), Number(wide[1])], near: [Number(near[0]), Number(near[1])], crit: p.t ? crit.toFixed(3) : "1.96", nearTag: p.t ? "z, not t" : "90%", one },
    answers: [
      { right: true, lines: range(lo, hi, c.dp), tag: "the grain", note: "" },
      { right: false, lines: wide, tag: `one ${one}`, note: `That range uses ${p.t ? "s" : "σ"}: where single ${NOUN[c.story][1]} land, not where the mean is.` },
      {
        right: false,
        lines: near,
        tag: p.t ? "z, not t" : "90%, not 95%",
        note: p.t ? `That uses z = 1.96. Only s is known, so the 95% number comes from t with ${p.n - 1} degrees of freedom: ${crit.toFixed(3)}.` : "That uses 1.645, the 90% number. 95% takes 1.96.",
      },
    ],
  };
}

/** Not enough to tell: the facts look complete, but the method needs a shape they don't give. */
function shape(r: Rand): Draft {
  const cases = makeCases(2 + Math.floor(r() * 1e6));
  const c: Case = cases[pickOf(r, [4, 12])];
  const p = c.params;
  if (c.story === "coffee") {
    const asIfNormal = 1 - Phi((p.cut - p.mu) / p.sd);
    return {
      family: "shape",
      topic: "normal",
      setup: c.setup,
      q: c.q,
      work: ["It is one wait, and the waits are skewed.", "The normal curve can't be trusted for a single skewed value.", "The mean and SD don't give the shape, so no number follows from these facts."],
      grain: "Check the shape before the formula. One value needs normal values; an average of many is more forgiving.",
      fig: { kind: "skew", mu: p.mu, sd: p.sd, cut: p.cut, unit: c.unit, n: 1, one: "wait", many: "waits" },
      answers: [
        { right: true, label: "Can't tell", tag: "the grain", note: "" },
        { right: false, value: asIfNormal, tag: "as if normal", note: `That treats one skewed wait as normal: z = (${num(p.cut)} − ${num(p.mu)}) / ${num(p.sd)}. The mean and SD are not enough for one value.` },
        { right: false, value: 1 - asIfNormal, tag: "other tail", note: "That is the normal curve's other side, and the normal curve doesn't fit one skewed wait either way." },
      ],
    };
  }
  const se = p.sd / Math.sqrt(p.n);
  const avg = 1 - Phi((p.cut - p.mu) / se);
  const one = 1 - Phi((p.cut - p.mu) / p.sd);
  return {
    family: "shape",
    topic: "clt",
    setup: c.setup,
    q: c.q,
    work: [`It is an average of only ${p.n} values from a strongly skewed list.`, "An average that small is still skewed, so the normal curve would be a guess.", "It takes a larger n, or the real shape of the incomes."],
    grain: "The central limit theorem needs enough values. A handful from a skewed list is still skewed.",
    fig: { kind: "skew", mu: p.mu, sd: p.sd, cut: p.cut, unit: c.unit, n: p.n, one: "household", many: "households" },
    answers: [
      { right: true, label: "Can't tell", tag: "the grain", note: "" },
      { right: false, value: avg, tag: "too few", note: `That uses z with σ/√${p.n}. Right formula, but ${p.n} strongly skewed incomes are too few for the normal curve.` },
      { right: false, value: one, tag: "one household", note: "That uses σ, the spread of one income, and treats it as normal. The question is about an average." },
    ],
  };
}

/** A positive result: the question turned around, P(positive | it) for P(it | positive). */
function bayes(r: Rand): Draft {
  const story = pickOf(r, ["test", "spam", "fraud"] as const);
  const p = story === "spam" ? pickOf(r, [0.1, 0.2, 0.3]) : pickOf(r, [0.01, 0.02, 0.05]);
  const s = pickOf(r, [0.8, 0.85, 0.99]);
  const f = pickOf(r, [0.05, 0.08, 0.1]);
  const name = { test: ["Has it", "Doesn't", "Positive"], spam: ["Spam", "Real", "Flagged"], fraud: ["Fraud", "Honest", "Flagged"] }[story];
  const v: Values = { a: name[0], pa: String(p), ha: String(s), b: name[1], pb: "", hb: String(f), c: "", pc: "", hc: "", h: name[2] };
  const res = solverById("tree").run(v) as Answers;
  const row = (q: string) => res.rows.find((x) => x.q === q)!;
  const all = row(`P(${name[2]})`), post = row(`P(${name[0]} | ${name[2]})`);
  const right = Number(post.a);
  const per = 1000;
  const sick = Math.round(per * p), hit = Math.round(sick * s), fa = Math.round((per - sick) * f);
  const pc = (x: number) => `${+(x * 100).toFixed(1)}%`;
  const copy = {
    test: { setup: `A screening test catches ${pc(s)} of people who have a condition. It also flags ${pc(f)} of people who don't. ${pc(p)} of people have it.`, q: "Your test is positive. What's the chance you have it?", who: ["have it", "don't"], thing: "people", rest: "people who don't have it", pass: "how often people who don't have it test negative" },
    spam: { setup: `A mail filter catches ${pc(s)} of spam. It also flags ${pc(f)} of real mail. ${pc(p)} of your mail is spam.`, q: "An email gets flagged. What's the chance it's spam?", who: ["are spam", "are real"], thing: "emails", rest: "real emails", pass: "how often real mail gets through" },
    fraud: { setup: `A bank's check flags ${pc(s)} of fraud. It also flags ${pc(f)} of honest payments. ${pc(p)} of payments are fraud.`, q: "A payment gets flagged. What's the chance it's fraud?", who: ["are fraud", "are honest"], thing: "payments", rest: "honest payments", pass: "how often honest payments pass" },
  }[story];
  return {
    family: "bayes",
    topic: "prob",
    setup: copy.setup,
    q: copy.q,
    work: [
      `Out of ${num(per)} ${copy.thing}: ${num(sick)} ${copy.who[0]} and ${num(hit)} of them get flagged; ${num(per - sick)} ${copy.who[1]} and ${num(fa)} of them get flagged too.`,
      `P(${name[2]}) = ${all.w.split(". ")[0]} = ${all.a}`,
      `P(${name[0]} | ${name[2]}) = ${post.w.split(". ")[0].replace("Bayes: ", "")} = ${post.a}`,
    ],
    grain: `Start from how rare it is. Of the ${num(hit + fa)} flagged, ${num(fa)} are ${copy.rest}.`,
    fig: { kind: "people", per, sick, hit, fa, who: copy.who as [string, string], answer: right },
    answers: [
      { right: true, value: right, tag: "the grain", note: "" },
      { right: false, value: s, tag: "turned around", note: `That is the chance of a flag if it's true: P(${name[2]} | ${name[0]}). The question turned around.` },
      { right: false, value: 1 - f, tag: "the other group", note: `That is ${copy.pass}. It says nothing yet about the flagged ones.` },
    ],
  };
}

/** At least one: adding the chances counts the overlaps more than once. */
function either(r: Rand): Draft {
  const story = pickOf(r, ["flights", "parcels", "bulbs"] as const);
  let p = pickOf(r, [0.1, 0.15, 0.2]);
  let n = pickOf(r, [3, 4, 5]);
  if (n * p > 0.8) [p, n] = [0.1, n];
  const res = solverById("trials").run({ p: String(p), n: String(n), k: "1" }) as Answers;
  const row = (q: string) => res.rows.find((x) => x.q === q)!;
  const least = row("P(at least one)"), none = row("P(none)");
  const pc = `${Math.round(p * 100)}%`;
  const copy = {
    flights: { setup: `Each of your ${n} flights this month has a ${pc} chance of a long delay, independently.`, q: "What's the chance at least one is delayed?" },
    parcels: { setup: `Each of ${n} parcels has a ${pc} chance of arriving late, independently.`, q: "What's the chance at least one arrives late?" },
    bulbs: { setup: `Each of ${n} new bulbs has a ${pc} chance of failing this year, independently.`, q: "What's the chance at least one fails?" },
  }[story];
  return {
    family: "either",
    topic: "prob",
    setup: copy.setup,
    q: copy.q,
    work: [`P(none) = ${none.w.split(". ")[0]} = ${none.a}`, `P(at least one) = ${least.w.split(". ")[0]} = ${least.a}`],
    grain: "At least one is 1 minus none. Adding the chances counts the overlaps more than once.",
    fig: { kind: "chain", p, n, none: Number(none.a), least: Number(least.a) },
    answers: [
      { right: true, value: Number(least.a), tag: "the grain", note: "" },
      { right: false, value: n * p, tag: "chances added", note: `That adds ${n} × ${pc}, which counts the times two go wrong together more than once. With ${Math.round(1 / p) + 1} of them it would pass 100%.` },
      { right: false, value: Number(none.a), tag: "that's none", note: "That is the chance none of them goes wrong. At least one is 1 minus that." },
    ],
  };
}

/** A given: the new total is the group you were told about. */
function given(r: Rand): Draft {
  const story = pickOf(r, ["bank", "runners"] as const);
  const N = pickOf(r, [200, 400, 500]);
  const A = Math.round(N * pickOf(r, [0.3, 0.4, 0.5]));
  const B = Math.round(N * pickOf(r, [0.2, 0.25, 0.35]));
  const AB = Math.round(Math.min(A, B) * pickOf(r, [0.3, 0.4, 0.6]));
  const res = solverById("events").run({ pa: String(A / N), pb: String(B / N), pab: String(AB / N) }) as Answers;
  const ba = res.rows.find((x) => x.q === "P(B | A)")!;
  const copy = {
    bank: { setup: `Of ${num(N)} customers, ${num(A)} have a credit card, ${num(B)} have a loan, and ${num(AB)} have both.`, q: "Pick a card holder at random. What's the chance they have a loan?", a: "card holders", b: "loan" },
    runners: { setup: `Of ${num(N)} runners, ${num(A)} trained on hills, ${num(B)} got hurt, and ${num(AB)} did both.`, q: "Pick a hill runner at random. What's the chance they got hurt?", a: "hill runners", b: "hurt" },
  }[story];
  return {
    family: "given",
    topic: "prob",
    setup: copy.setup,
    q: copy.q,
    work: [`Only the ${num(A)} ${copy.a} count: they are the new total.`, `${num(AB)} of them ${story === "bank" ? "have a loan" : "got hurt"}: ${num(AB)} ÷ ${num(A)} = ${ba.a}`],
    grain: `The given is the new total. Count inside the ${num(A)} ${copy.a}, not everyone.`,
    fig: { kind: "groups", N, A, B, AB, a: copy.a, b: story === "bank" ? "loan" : "hurt" },
    answers: [
      { right: true, value: AB / A, tag: "the grain", note: "" },
      { right: false, value: AB / N, tag: "out of everyone", note: `That is ${num(AB)} out of all ${num(N)}: the chance of both. Given a ${story === "bank" ? "card" : "hill runner"}, divide by the ${num(A)}.` },
      { right: false, value: AB / B, tag: "turned around", note: `That divides by the ${num(B)} ${story === "bank" ? "with a loan" : "who got hurt"}: the question turned around.` },
    ],
  };
}

/** The birthday problem: count pairs, not people. */
function birthday(r: Rand): Draft {
  const n = pickOf(r, [20, 23, 25, 27]);
  const res = solverById("bday").run({ n: String(n), d: "365" }) as Answers;
  const row = (start: string) => res.rows.find((x) => x.q.startsWith(start))!;
  const share = row("P(at least two"), diff = row("P(all different"), yours = row("P(someone shares YOUR"), pairs = row("Number of pairs");
  const k = Number(pairs.a.replace(/,/g, ""));
  return {
    family: "birthday",
    topic: "prob",
    setup: `${n} people are in a room. Birthdays fall evenly over 365 days.`,
    q: "What's the chance at least two of them share a birthday?",
    work: [`P(all different) = ${diff.w} = ${diff.a}`, `P(at least two share) = 1 − ${diff.a} = ${share.a}`, `Why so high: ${n} people make ${num(k)} pairs, and every pair is a chance to match.`],
    grain: `Count pairs, not people. ${n} people make ${num(k)} pairs.`,
    fig: { kind: "pairs", n, k, share: Number(share.a) },
    answers: [
      { right: true, value: Number(share.a), tag: "the grain", note: "" },
      { right: false, value: Number(yours.a), tag: "your birthday", note: "That is the chance someone shares your birthday. Any pair counts, not only pairs with you." },
      { right: false, value: k / 365, tag: "pairs added", note: `That adds ${num(k)} pairs' chances of 1 in 365. Adding counts the overlaps more than once.` },
    ],
  };
}

/** Monty Hall and its cousins: the host knows, so his choice carries information. */
function doors(r: Rand): Draft {
  const v = pickOf(r, [3, 3, 4, 5] as const);
  if (v === 3)
    return {
      family: "doors",
      topic: "prob",
      game: "monty-hall",
      setup: "A car is behind one of three doors. You pick door 1. The host, who knows where the car is, opens door 3: a goat.",
      q: "What's the chance the car is behind door 2?",
      work: ["Door 1 had a 1 in 3 chance, and the host's move can't change it: he can always show a goat.", "The other 2 in 3 sat on doors 2 and 3 together.", "He opened door 3 knowing it was empty, so door 2 now holds the whole 2 in 3."],
      grain: "The host knows. A choice made with knowledge carries information.",
      fig: { kind: "doors", v: 3, opened: 1 },
      answers: [
        { right: true, label: "67%", tag: "the grain", note: "" },
        { right: false, label: "50%", tag: "even split", note: "Two doors left doesn't make them even. The host chose door 3 because it was empty." },
        { right: false, label: "33%", tag: "where it started", note: "That is where door 2 started. The host's choice moved door 3's share onto it." },
      ],
    };
  const opened = v === 4 ? 1 : 2;
  const left = v - 1 - opened;
  const each = (1 - 1 / v) / left;
  const share = `${v - 1}/${v}`;
  return {
    family: "doors",
    topic: "prob",
    game: "monty-hall",
    setup: `A car is behind one of ${v} doors. You pick door 1. The host, who knows where the car is, opens ${opened === 1 ? "one other door" : "two other doors"}: ${opened === 1 ? "a goat" : "goats"}.`,
    q: "Door 2 is still closed. What's the chance the car is behind it?",
    work: [`Door 1 keeps its 1 in ${v}: the host can always show goats.`, `The other ${share} sat on the ${v - 1} other doors, and now only ${left} of them are closed.`, `Each closed one holds ${share} ÷ ${left} = ${p4(each)}`],
    grain: "The host knows. A choice made with knowledge carries information.",
    fig: { kind: "doors", v, opened },
    answers: [
      { right: true, value: each, tag: "the grain", note: "" },
      { right: false, value: 1 / (left + 1), tag: "even split", note: "Three closed doors are not three even chances. The host opened only empty doors." },
      { right: false, value: 1 / v, tag: "where it started", note: `That is where it started, 1 in ${v}. The host's doors gave their share to the closed ones.` },
    ],
  };
}

/** The house edge: even money is not an even game. */
function edge(r: Rand): Draft {
  const pockets = pickOf(r, [38, 37]);
  const bet = pickOf(r, [5, 10, 20]);
  const win = (18 / pockets) * bet, lose = ((pockets - 18) / pockets) * bet;
  const ev = win - lose;
  const green = pockets === 38 ? "two green, 0 and 00" : "one green, 0";
  return {
    family: "edge",
    topic: "rv",
    game: "house-edge",
    setup: `A roulette wheel has ${pockets} pockets: 18 red, 18 black and ${green}. You bet $${bet} on red, and red pays even money.`,
    q: "What do you expect to win or lose per spin?",
    work: [`Win: 18/${pockets} × $${bet} = $${win.toFixed(2)}`, `Lose: ${pockets - 18}/${pockets} × $${bet} = $${lose.toFixed(2)}`, `Expected: $${win.toFixed(2)} − $${lose.toFixed(2)} = −$${Math.abs(ev).toFixed(2)} a spin`],
    grain: "Expected value weighs every outcome by its chance. The green pockets are the house's edge.",
    fig: { kind: "wheel", pockets, bet, win, lose, ev },
    answers: [
      { right: true, label: money(ev), tag: "the grain", note: "" },
      { right: false, label: money(0), tag: "even money", note: `Even money is not an even game: ${pockets === 38 ? "the green pockets win" : "the green pocket wins"} for the house.` },
      { right: false, label: money(win), tag: "wins only", note: "That counts the wins and forgets the losses." },
    ],
  };
}

const FAMILIES: [Family, (r: Rand) => Draft][] = [
  ["average", average],
  ["bayes", bayes],
  ["range", rangeFamily],
  ["either", either],
  ["crate", crate],
  ["doors", doors],
  ["given", given],
  ["shape", shape],
  ["birthday", birthday],
  ["edge", edge],
];

/** How many swaps a throw has: gentle on Monday, hardest on Saturday, like the week of a newspaper crossword. */
export function swapCount(day: string | null) {
  if (!day) return 6;
  return [7, 5, 5, 6, 7, 8, 9][new Date(`${day}T12:00:00Z`).getUTCDay()];
}

/** The throw: pairs of slots, never the same pair twice running (that would look like nothing moved). */
export function throwFor(count: number, r: Rand): [number, number][] {
  const PAIRS: [number, number][] = [[0, 1], [1, 2], [0, 2]];
  const out: [number, number][] = [];
  let last = -1;
  for (let i = 0; i < count; i++) {
    let k = Math.floor(r() * 3);
    if (k === last) k = (k + 1 + Math.floor(r() * 2)) % 3;
    out.push(PAIRS[k]);
    last = k;
  }
  return out;
}

/** Where each cup ends up after the throw: slot of cup i. */
export function afterThrow(swaps: [number, number][]) {
  const at = [0, 1, 2];
  for (const [a, b] of swaps) {
    const ca = at.indexOf(a), cb = at.indexOf(b);
    at[ca] = b;
    at[cb] = a;
  }
  return at;
}

/** Builds a round from a family and a seed: the grain at a seeded slot, labels made distinct, the throw drawn. */
function build(n: number, day: string | null, family: (r: Rand) => Draft, seed: number): ShuffleRound {
  const r = rng(seed);
  const d = family(r);
  // Probabilities get labels together, so no two cups read the same.
  const priced = d.answers.flatMap((a, i) => (a.value === undefined ? [] : [i]));
  const pl = pctLabels(priced.map((i) => d.answers[i].value as number));
  const cups: Cup[] = d.answers.map((a, i) => ({
    label: a.label ?? (a.lines ? `${a.lines[0]}–${a.lines[1]}` : pl[priced.indexOf(i)]),
    ...(a.lines ? { lines: a.lines } : {}),
    right: a.right,
    tag: a.tag,
    note: a.note,
  }));
  // The grain starts in a seeded slot, the two traps in a seeded order around it.
  const at = Math.floor(r() * 3);
  const traps = r() < 0.5 ? [cups[1], cups[2]] : [cups[2], cups[1]];
  const others = [0, 1, 2].filter((s) => s !== at);
  const placed: Cup[] = [];
  placed[at] = cups[0];
  placed[others[0]] = traps[0];
  placed[others[1]] = traps[1];
  // A probability worked to four places ends on the cup's own number.
  const work = d.work.map(mt);
  const last = work.length - 1;
  if (/\d\.\d+$/.test(work[last]) && cups[0].label.endsWith("%")) work[last] = `${work[last]}, about ${cups[0].label}`;
  return {
    n,
    day,
    family: d.family,
    topic: d.topic,
    ...(d.game ? { game: d.game } : {}),
    setup: d.setup,
    q: d.q,
    cups: placed as [Cup, Cup, Cup],
    work,
    grain: d.grain,
    fig: d.fig,
    swaps: throwFor(swapCount(day), r),
  };
}

const hash = (a: number, b: number) => {
  let h = (a * 374761393 + b * 668265263 + SALT) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
  return (h ^ (h >>> 16)) >>> 0;
};

/**
 * The family for day n: a shuffle bag, every family once before any repeats. Where one bag meets the next, a
 * family from the last three days of the old bag never lands in the first three of the new one.
 */
export function familyOf(n: number) {
  const k = FAMILIES.length;
  const cycle = Math.floor((n - 1) / k);
  let prev: number[] = [];
  let bag: number[] = [];
  for (let c = 0; c <= cycle; c++) {
    const r = rng(hash(c, 7));
    bag = Array.from({ length: k }, (_, i) => i);
    for (let i = k - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      const t = bag[i];
      bag[i] = bag[j];
      bag[j] = t;
    }
    const tail = prev.slice(-3);
    for (let i = 0; i < 3 && tail.length; i++) {
      if (!tail.includes(bag[i])) continue;
      const j = bag.findIndex((x, at) => at >= 3 && !tail.includes(x));
      const t = bag[i];
      bag[i] = bag[j];
      bag[j] = t;
    }
    prev = bag;
  }
  return bag[(n - 1) % k];
}

/** The day's round, the same for everyone. */
export function shuffleRound(day: string): ShuffleRound {
  const n = Math.max(1, dailyNumber(day));
  const [, family] = FAMILIES[familyOf(n)];
  return build(n, day, family, hash(n, 1));
}

/** A practice round: any family, fresh numbers, not saved. */
export function practiceRound(seed: number): ShuffleRound {
  const [, family] = FAMILIES[seed % FAMILIES.length];
  return build(0, null, family, hash(seed, 3));
}

export const FAMILY_IDS = FAMILIES.map(([id]) => id);
export const roundOfFamily = (id: Family, seed: number) => build(0, null, FAMILIES.find(([f]) => f === id)![1], hash(seed, 5));

// ---------- results, sharing

/** Your Shuffle on one day: how many lifts it took, and which cups (by id) you lifted in order. */
export type ShuffleResult = { n: number; lifts: number; picks: number[] };

const ORDINAL = ["first", "second", "third"];
/** "Found the grain on the first lift." */
export const liftsText = (lifts: number) => `Found the grain on the ${ORDINAL[lifts - 1] ?? `${lifts}th`} lift`;

/** What Share sends: the number, one circle per lift (the grain in clay), how many lifts, the run of days, the link. No spoilers. */
export function shareShuffle(res: ShuffleResult, streak: number, url: string) {
  const row = `${"⚪".repeat(Math.max(0, res.lifts - 1))}🟠`;
  return [`Monte Shuffle ${res.n}`, `${row} ${liftsText(res.lifts)}`, ...(streak > 1 ? [`${streak} days in a row`] : []), url].join("\n");
}
