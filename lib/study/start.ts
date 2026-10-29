import { Phi, parseAnswer, tinv } from "./math";
import { isCorrect } from "./drill";

/**
 * "Same number, three questions": the first step of a statistics problem is deciding which question it is.
 * One value (z with σ), an average or total of many (z with σ/√n), a range for an unknown mean (an interval),
 * or not enough information (a condition the method needs is missing). The cases follow Quilici and Mayer (1996):
 * one story under different questions, and different stories under the same question. A worked example comes
 * first, then cases whose decision prompts drop away (Renkl and Atkinson, 2003). Seed 1 is the fixed first run; other seeds give new numbers.
 */
export type Kind = "one" | "mean" | "ci" | "none";
export const KINDS: { id: Kind; label: string }[] = [
  { id: "one", label: "One value" },
  { id: "mean", label: "An average or total of many" },
  { id: "ci", label: "A range for an unknown mean" },
  { id: "none", label: "Not enough information" },
];

export type Params = { mu: number; sd: number; n: number; cut: number; dir: "above" | "below"; xbar: number; t: boolean; /** A group size in the story that the math should ignore. */ group?: number };
export type Case = {
  story: string;
  kind: Kind;
  setup: string;
  q: string;
  /** Why this is the right kind of question. */
  why: string;
  /** null when the right answer is "not enough information". */
  answer: number | [number, number] | null;
  steps: string[];
  /** What the answer means, shown after it. */
  meaning?: string;
  /** Decimals for an interval's ends. */
  dp: number;
  unit: string;
  params: Params;
};

/** The three questions an expert asks before any formula. */
export const ASK = [
  "Who is the question about: one value, the average or total of many, or a mean you don't know yet?",
  "What is known: the true mean and SD, or only a sample?",
  "What has to be true: roughly normal values for one value; independent draws, and normal values or a large enough n, for an average; a random sample, and normal values or a large enough n, for a range.",
];

export function hintFor(i: number, total: number): "open" | "tap" | "none" {
  const third = Math.min(5, Math.floor(total / 3));
  return i < third ? "open" : i < third * 2 ? "tap" : "none";
}

/** The worked example: a juice line, mean 500 ml and SD 20 ml, and the number 508 asked three ways. */
export function worked(n: number) {
  const mu = 500, sd = 20, cut = 508, se = sd / Math.sqrt(n);
  return { mu, sd, cut, se, pOne: 1 - Phi((cut - mu) / sd), pAvg: 1 - Phi((cut - mu) / se), lo: cut - 1.96 * se, hi: cut + 1.96 * se };
}

// ---------- numbers, written the way the page shows them
const n2 = (x: number) => (Math.round(x * 100) / 100).toString();
const p4 = (x: number) => x.toFixed(4);
const dps = (x: number, d: number) => x.toFixed(d);
const num = (x: number) => x.toLocaleString("en-US");

function rng(seed: number) {
  let a = seed * 7919 + 17;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function probCase(base: Omit<Case, "answer" | "steps" | "dp" | "params">, p: Omit<Params, "xbar" | "t">, lines?: (se: number, z: number) => string[]): Case {
  const se = base.kind === "mean" ? p.sd / Math.sqrt(p.n) : p.sd;
  const z = (p.cut - p.mu) / se;
  const answer = p.dir === "above" ? 1 - Phi(z) : Phi(z);
  const sign = p.dir === "above" ? ">" : "<";
  const v = base.kind === "mean" ? "x̄" : "X";
  const tail = p.dir === "above" ? `1 − Φ(${n2(z)})` : `Φ(${n2(z)})`;
  const steps =
    lines?.(se, z) ??
    (base.kind === "mean"
      ? [`SE = σ/√n = ${num(p.sd)}/√${p.n} = ${n2(se)}`, `z = (${num(p.cut)} − ${num(p.mu)}) / ${n2(se)} = ${n2(z)}`, `P(${v} ${sign} ${num(p.cut)}) = ${tail} = ${p4(answer)}`]
      : [`z = (${num(p.cut)} − ${num(p.mu)}) / ${num(p.sd)} = ${n2(z)}`, `P(${v} ${sign} ${num(p.cut)}) = ${tail} = ${p4(answer)}`]);
  return { ...base, answer, steps, dp: 0, params: { ...p, xbar: 0, t: false } };
}

function ciCase(base: Omit<Case, "answer" | "steps" | "dp" | "params" | "kind">, p: { sd: number; n: number; xbar: number; t: boolean }, dp: number): Case {
  const se = p.sd / Math.sqrt(p.n), crit = p.t ? tinv(0.975, p.n - 1) : 1.96, m = crit * se;
  const answer: [number, number] = [p.xbar - m, p.xbar + m];
  const f = (x: number) => dps(x, dp + 1);
  const steps = [
    `SE = ${p.t ? "s" : "σ"}/√n = ${num(p.sd)}/√${p.n} = ${f(se)}`,
    p.t ? `Only s is known, so use t with n − 1 = ${p.n - 1} degrees of freedom: t = ${crit.toFixed(3)}` : `σ is known, so use z = 1.96 for 95%`,
    `Margin = ${p.t ? crit.toFixed(3) : "1.96"} × ${f(se)} = ${f(m)}`,
    `${num(p.xbar)} ± ${f(m)} = ${dps(answer[0], dp)} to ${dps(answer[1], dp)} ${base.unit}`,
  ];
  return { ...base, kind: "ci", answer, steps, dp, params: { mu: 0, cut: 0, dir: "above", ...p } };
}

const none = (base: Omit<Case, "answer" | "steps" | "dp" | "params" | "kind">, p: Partial<Params>): Case => ({
  ...base,
  kind: "none",
  answer: null,
  steps: [],
  dp: 0,
  params: { mu: 0, sd: 0, n: 0, cut: 0, dir: "above", xbar: 0, t: false, ...p },
});

/** Fifteen cases in a fixed order of kinds, with numbers drawn from the seed. Seed 1 always takes the first option. */
export function makeCases(seed = 1): Case[] {
  const r = rng(seed);
  const pick = <T,>(a: readonly T[]): T => (seed === 1 ? a[0] : a[Math.floor(r() * a.length)]);

  // The juice line: one story, four questions.
  // SD and n go in pairs so the standard error stays near 4 ml and no answer lands in a far tail.
  const [jSd, jN] = pick([[20, 25], [16, 16], [24, 36]] as const), jCut = pick([508, 506, 510]), jLow = pick([480, 485, 475]);
  const jX = pick([508, 507, 509]), jCrate = pick([24, 12, 30]);
  const juice = "A juice line fills bottles. The fills are roughly normal";
  // The coffee shop: an average of skewed waits works; one skewed wait doesn't.
  const cMu = pick([4, 5, 6]), [cSd, cN] = pick([[2, 64], [2.5, 100], [3, 81]] as const);
  const cCut = cMu + pick([0.5, 0.4, 0.6]), cOne = cMu + pick([3, 4, 2.5]);
  const coffee = `At a coffee shop, wait times are moderately skewed: most drinks come in a few minutes, and a few take longer. The mean wait is ${cMu} minutes and the SD is ${cSd} minutes.`;
  // The tennis serve.
  const [tSd, tN] = pick([[10, 16], [8, 16], [12, 36]] as const), tCut = pick([165, 168, 170]), tAvg = pick([184, 183, 185]);
  // The rest.
  const bSd = pick([3, 2.5, 4]), bN = pick([36, 25, 64]), bX = pick([20.5, 19.8, 21.2]);
  const eN = pick([12, 11, 13]);
  const dN = pick([9, 12, 15]), dX = pick([31, 28, 34]);
  const kN = pick([25, 16, 20]), kX = pick([42, 38, 45]), kS = pick([10, 8, 12]);
  const lSd = pick([25, 20, 30]), lCut = pick([760, 765, 750]);
  const iN = pick([5, 4, 6]), iCut = pick([80, 85, 75]);
  const oSd = pick([0.2, 0.25, 0.15]), oN = pick([16, 25, 36]), oX = pick([50.1, 50.08, 49.94]);

  return [
    probCase(
      { story: "juice", kind: "one", setup: `${juice}: mean 500 ml, SD ${jSd} ml.`, q: `What's the chance a single bottle has more than ${jCut} ml?`, why: "It's about one bottle, and the fills are roughly normal, so z uses σ itself.", unit: "ml" },
      { mu: 500, sd: jSd, n: 1, cut: jCut, dir: "above" },
    ),
    probCase(
      { story: "juice", kind: "mean", setup: `Same line: mean 500 ml, SD ${jSd} ml. A quality check takes ${jN} bottles at random and averages them.`, q: `What's the chance their average is more than ${jCut} ml?`, why: `It's the average of ${jN} bottles. Averages wander less than single bottles, so z uses the standard error σ/√n.`, unit: "ml" },
      { mu: 500, sd: jSd, n: jN, cut: jCut, dir: "above" },
    ),
    ciCase(
      { story: "juice", setup: `After a repair, nobody knows the line's true mean anymore. The SD is still ${jSd} ml; it hasn't changed in years. A random sample of ${jN} bottles averages ${jX} ml.`, q: "Give a 95% range for the line's true mean.", why: "The mean is what you don't know, and you have a sample: that's a range for the mean. σ is known, so use z = 1.96.", unit: "ml", meaning: `This is a range for the line's mean, not for bottles. Single bottles still spread about ${Math.round(1.96 * jSd)} ml either side of the mean.` },
      { sd: jSd, n: jN, xbar: jX, t: false },
      1,
    ),
    probCase(
      { story: "coffee", kind: "mean", setup: coffee, q: `Over a busy day of ${cN} independent orders, about what's the chance the average wait is more than ${cCut} minutes? Use the normal approximation.`, why: `It's the average of ${cN} waits. The waits themselves are skewed, but for moderate skew like this, an average of ${cN} independent ones is usually close to normal (the central limit theorem). So z gives an approximate answer; a few very long waits would make it worse.`, unit: "min" },
      { mu: cMu, sd: cSd, n: cN, cut: cCut, dir: "above" },
    ),
    none(
      { story: "coffee", setup: coffee, q: `What's the chance one customer waits more than ${cOne} minutes?`, why: "It's one wait, and the waits are skewed, so the normal curve can't be trusted for a single value. You'd need the real shape of the waits, not just the mean and SD.", unit: "min" },
      { mu: cMu, sd: cSd, cut: cOne },
    ),
    probCase(
      { story: "tennis", kind: "one", setup: `A player's first serves are roughly normal: mean 180 km/h, SD ${tSd} km/h.`, q: `What's the chance one serve is slower than ${tCut} km/h?`, why: "It's about one serve, and the speeds are roughly normal, so z uses σ.", unit: "km/h" },
      { mu: 180, sd: tSd, n: 1, cut: tCut, dir: "below" },
    ),
    probCase(
      { story: "juice", kind: "one", setup: `Back at the juice line (mean 500 ml, SD ${jSd} ml), a crate holds ${jCrate} bottles.`, q: `You pull one bottle out of the crate. What's the chance it has less than ${jLow} ml?`, why: `There's an n in the story, but nothing is averaged: the question is about the one bottle you pull. The ${jCrate} doesn't enter the math.`, unit: "ml" },
      { mu: 500, sd: jSd, n: 1, cut: jLow, dir: "below", group: jCrate },
    ),
    ciCase(
      { story: "battery", setup: `Battery life is roughly normal, and the phone maker's long testing puts its SD at ${bSd} hours. A random sample of ${bN} phones from a new batch averages ${bX} hours.`, q: "Give a 95% range for the new batch's true mean battery life.", why: "The batch's mean is unknown and you have a sample, so it's a range for the mean. σ comes from long testing, so use z.", unit: "hours", meaning: "This is a range for the batch's mean. A single phone can land well outside it." },
      { sd: bSd, n: bN, xbar: bX, t: false },
      2,
    ),
    probCase(
      { story: "elevator", kind: "mean", setup: `An elevator's limit is 1,000 kg. Adult weights are roughly normal, with mean 80 kg and SD 15 kg.`, q: `${eN} adults get in, unrelated to each other. What's the chance their total weight is over the limit?`, why: `A total of ${eN} is an average in disguise: it's over 1,000 exactly when the average is over 1,000/${eN}. The total's SD is σ√n.`, unit: "kg" },
      { mu: 80, sd: 15, n: eN, cut: 1000 / eN, dir: "above" },
      (_se, z) => {
        const m = 80 * eN, s = 15 * Math.sqrt(eN), p = 1 - Phi(z);
        return [`Total: mean nμ = ${eN} × 80 = ${num(m)} kg, SD σ√n = 15 × √${eN} = ${n2(s)} kg`, `z = (1,000 − ${num(m)}) / ${n2(s)} = ${n2(z)}`, `P(total > 1,000) = 1 − Φ(${n2(z)}) = ${p4(p)}`];
      },
    ),
    none(
      { story: "delivery", setup: `A delivery app timed a random sample of ${dN} deliveries. They averaged ${dX} minutes.`, q: "Give a 95% range for the true mean delivery time.", why: "A range needs a spread: σ, or the sample's own SD s. Without one there's no margin of error to add and subtract.", unit: "min" },
      { n: dN, xbar: dX },
    ),
    ciCase(
      { story: "commute", setup: `You timed your commute on ${kN} random days. The times look roughly normal. They averaged ${kX} minutes, with a sample SD of ${kS} minutes.`, q: "Give a 95% range for your true mean commute.", why: "Your true mean is unknown and you have a sample, so it's a range for the mean. Only s is known, so use t.", unit: "min", meaning: "This is a range for your average commute. A single bad day can still run far past it." },
      { sd: kS, n: kN, xbar: kX, t: true },
      1,
    ),
    probCase(
      { story: "bakery", kind: "one", setup: `A bakery's loaves weigh roughly normal amounts: mean 800 g, SD ${lSd} g.`, q: `What's the chance one loaf weighs less than ${lCut} g?`, why: "It's about one loaf, and the weights are roughly normal, so z uses σ.", unit: "g" },
      { mu: 800, sd: lSd, n: 1, cut: lCut, dir: "below" },
    ),
    none(
      { story: "income", setup: "Household incomes in a town are strongly skewed: most are modest, and a few are very large. The mean is $68k and the SD is $40k.", q: `Pick ${iN} households at random. What's the chance their average income is more than $${iCut}k?`, why: `An average of only ${iN} values from a strongly skewed list isn't close to normal yet, so z would be a guess. It takes a larger n, or the real shape of the incomes.`, unit: "$k" },
      { mu: 68, sd: 40, n: iN, cut: iCut },
    ),
    probCase(
      { story: "tennis", kind: "mean", setup: `Same player: first serves average 180 km/h, SD ${tSd} km/h, roughly normal.`, q: `In one match they hit ${tN} first serves. What's the chance the average is more than ${tAvg} km/h?`, why: `It's the average of ${tN} serves, so z uses σ/√n.`, unit: "km/h" },
      { mu: 180, sd: tSd, n: tN, cut: tAvg, dir: "above" },
    ),
    ciCase(
      { story: "bolts", setup: `A machine cuts bolts to a 50 mm target. Lengths are roughly normal, with a known SD of ${oSd} mm. A random sample of ${oN} bolts averages ${oX} mm.`, q: "Give a 95% range for the machine's true mean length.", why: "The machine's mean is unknown and you have a sample, so it's a range for the mean. σ is known, so use z.", unit: "mm", meaning: Math.abs(oX - 50) <= (1.96 * oSd) / Math.sqrt(oN) ? "50 mm sits inside the range, so this sample gives no clear sign the machine is off target." : "50 mm sits outside the range, so the machine's mean looks off target." },
      { sd: oSd, n: oN, xbar: oX, t: false },
      3,
    ),
  ];
}

export type Graded = { ok: boolean; slip?: string };
const near = (a: number, raw: string) => isCorrect({ q: "P(", a, why: "", mod: "clt" }, raw);

/** Grades a probability, and names the usual slip when the number matches one. */
export function gradeNumber(c: Case, raw: string): Graded {
  const v = parseAnswer(raw);
  if (!raw.trim() || Number.isNaN(v)) return { ok: false, slip: "Type a probability, like 0.25 or 25%." };
  const a = c.answer as number;
  if (near(a, raw)) return { ok: true };
  if (v > 1 && !raw.includes("%")) return { ok: false, slip: "A probability is between 0 and 1. Type 0.25, or 25%." };
  const p = c.params;
  // A slip can land in a far tail, where a student types 0 or 1; count those as the slip.
  const pv = raw.includes("%") ? v / 100 : v;
  const slip = (want: number) => (want < 0.0005 ? pv >= 0 && pv < 0.0005 : want > 0.9995 ? pv > 0.9995 && pv <= 1 : near(want, raw));
  const zOf = (se: number) => (p.cut - p.mu) / se;
  const side = (z: number, dir = p.dir) => (dir === "above" ? 1 - Phi(z) : Phi(z));
  const se = c.kind === "mean" ? p.sd / Math.sqrt(p.n) : p.sd;
  if (slip(side(zOf(se), p.dir === "above" ? "below" : "above"))) return { ok: false, slip: `That's the other side of the cutoff. "${p.dir === "above" ? "More" : "Less"} than" means the ${p.dir === "above" ? "right" : "left"} tail.` };
  if (c.kind === "mean" && slip(side(zOf(p.sd)))) return { ok: false, slip: "That uses σ, the spread of single values. An average spreads less: use the standard error σ/√n." };
  if (c.kind === "one" && p.group && slip(side(zOf(p.sd / Math.sqrt(p.group))))) return { ok: false, slip: "That divides by √n, but nothing is averaged here. One value spreads by σ itself." };
  return { ok: false };
}

/** Grades a 95% interval, in either order, and names the usual slip. */
export function gradeInterval(c: Case, a: string, b: string): Graded {
  const x = parseAnswer(a), y = parseAnswer(b);
  if ([x, y].some(Number.isNaN)) return { ok: false, slip: "Type both ends of the range." };
  const [lo, hi] = [Math.min(x, y), Math.max(x, y)];
  const [tl, th] = c.answer as [number, number];
  const m = (th - tl) / 2, mid = (th + tl) / 2, tol = Math.max(m * 0.03, 0.5 * 10 ** -c.dp);
  if (Math.abs(lo - tl) <= tol && Math.abs(hi - th) <= tol) return { ok: true };
  const p = c.params, se = p.sd / Math.sqrt(p.n), got = (hi - lo) / 2;
  const is = (want: number) => Math.abs(got - want) <= Math.max(want * 0.03, 0.5 * 10 ** -c.dp) && Math.abs((hi + lo) / 2 - mid) <= tol;
  const crit = p.t ? tinv(0.975, p.n - 1) : 1.96;
  if (is(crit * p.sd)) return { ok: false, slip: "That margin uses σ, the spread of single values. The mean's range uses σ/√n." };
  if (p.t && is(1.96 * se)) return { ok: false, slip: `Only s is known here, so the 95% number comes from t with ${p.n - 1} degrees of freedom (${crit.toFixed(3)}), not 1.96.` };
  if (!p.t && is(tinv(0.975, p.n - 1) * se)) return { ok: false, slip: "σ is known here, so use z = 1.96, not t." };
  if (is(1.645 * se) || is(2.576 * se)) return { ok: false, slip: p.t ? `That's a 90% or 99% z number. Here only s is known, so for 95% use t with ${p.n - 1} degrees of freedom: ${crit.toFixed(3)}.` : "That's the 90% or 99% number. For 95%, z = 1.96." };
  if (Math.abs((hi + lo) / 2 - mid) > tol) return { ok: false, slip: `The range is centered on the sample mean, ${p.xbar}.` };
  return { ok: false };
}

/** What a wrong pick missed, in one line, before the reason. */
export function pickNote(c: Case, picked: Kind) {
  if (picked === c.kind) return c.why;
  const lead =
    c.kind === "none"
      ? "Check what has to be true first."
      : picked === "none"
        ? "There's enough here."
        : c.kind === "ci"
          ? "Here the mean is the thing you don't know."
          : picked === "ci"
            ? "The true mean is given, so there's nothing to estimate."
            : c.kind === "one"
              ? "Nothing is averaged here."
              : "Look at who the question is about.";
  return `${lead} ${c.why}`;
}
