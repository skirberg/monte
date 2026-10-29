import { Phi, PhiInv, choose, fmt, mean, pick, r2, ri, tcdf, tinv } from "./math";
import type { SolverId } from "./routes";

// The Solve calculators: type the numbers from any problem and get every answer
// it could ask for, with the work. Ported line by line from the original engine, so every string,
// rounding and branch matches the original engine (scripts compare the two under one seed).

export type Field = {
  k: string;
  l: string;
  v: string;
  /** Text, not a number (no decimal keypad). */
  t?: boolean;
  /** Spans the whole input grid. */
  wide?: boolean;
  /** A select: [value, label]. */
  opts?: [value: string, label: string][];
};
export type Row = { q: string; a: string; w: string; hl: boolean; strong?: boolean };
/** The first cell of each body row is its row header. */
export type Table = { head: string[]; rows: string[][]; foot?: string[] };
export type Answers = { table?: Table; rows: Row[] };
export type Result = { err: string } | Answers;
export type Values = Record<string, string>;
export type Solver = {
  id: SolverId;
  title: string;
  sub: string;
  fields: Field[];
  presets: [label: string, values: Values][];
  rand: () => Values;
  run: (v: Values) => Result;
};

/** Parses what a student types: 0.7, 70%, 7/10, 1,200. NaN when blank or not a number. */
export function sNum(raw: string) {
  let v = String(raw).trim().replace(/,/g, "");
  if (!v) return NaN;
  const pc = /%$/.test(v);
  if (pc) v = v.slice(0, -1);
  const m = v.match(/^(-?\d*\.?\d+)\s*\/\s*(\d*\.?\d+)$/);
  let x = m ? +m[1] / +m[2] : +v;
  if (pc) x = x / 100;
  return x;
}
const sF = (x: number) => (isFinite(x) ? fmt(x) : "n/a");
function gcd(a: number, b: number) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}
const frac = (a: number, b: number) => {
  const g = gcd(a, b);
  return `${a / g}/${b / g}`;
};
const isProb = (x: number) => isFinite(x) && x >= 0 && x <= 1;
const blank = (s: string) => !String(s).trim();
const row = (q: string, a: string, w = "", hl = false): Row => ({ q, a, w, hl });
/** A bold answer: the one number the question is about. */
const strong = (q: string, a: string, w = "", hl = false): Row => ({ q, a, w, hl, strong: true });

const tree: Solver = {
  id: "tree",
  title: "Tree and Bayes",
  sub: "Two or three starting branches, then an outcome that either happens or not. Leave branch 3 blank for a two-branch tree. A blank P(branch) fills in as whatever is left.",
  fields: [
    { k: "a", l: "Branch 1 name", v: "Online", t: true },
    { k: "pa", l: "P(branch 1)", v: "0.6" },
    { k: "ha", l: "P(outcome | branch 1)", v: "0.3" },
    { k: "b", l: "Branch 2 name", v: "In store", t: true },
    { k: "pb", l: "P(branch 2)", v: "" },
    { k: "hb", l: "P(outcome | branch 2)", v: "0.1" },
    { k: "c", l: "Branch 3 name (optional)", v: "", t: true },
    { k: "pc", l: "P(branch 3)", v: "" },
    { k: "hc", l: "P(outcome | branch 3)", v: "" },
    { k: "h", l: "Outcome name", v: "Return", t: true },
  ],
  presets: [
    ["Online vs store returns", { a: "Online", pa: "0.6", ha: "0.3", b: "In store", pb: "", hb: "0.1", c: "", pc: "", hc: "", h: "Return" }],
    ["Interns and offers", { a: "Intern", pa: "0.4", ha: "0.7", b: "Non-intern", pb: "", hb: "0.25", c: "", pc: "", hc: "", h: "Offer" }],
    ["Three suppliers", { a: "Supplier A", pa: "0.5", ha: "0.02", b: "Supplier B", pb: "0.3", hb: "0.03", c: "Supplier C", pc: "", hc: "0.05", h: "Defect" }],
    ["Medical test", { a: "Sick", pa: "0.01", ha: "0.95", b: "Healthy", pb: "", hb: "0.05", c: "", pc: "", hc: "", h: "Positive" }],
  ],
  rand: () => {
    const three = Math.random() < 0.4;
    const pa = three ? pick([0.2, 0.3, 0.4, 0.5]) : pick([0.3, 0.4, 0.6, 0.65, 0.7, 0.75, 0.8]);
    const pb = three ? pick([0.2, 0.3]) : "";
    return {
      a: "A",
      b: "B",
      c: three ? "C" : "",
      pa: String(pa),
      pb: three ? String(pb) : "",
      pc: "",
      ha: String(ri(1, 9) / 10),
      hb: String(ri(1, 9) / 10),
      hc: three ? String(ri(1, 9) / 10) : "",
      h: "H",
    };
  },
  run: (v) => {
    const H = v.h || "H", nH = `not ${H}`;
    const raw: [string, string, string][] = [[v.a || "A", v.pa, v.ha], [v.b || "B", v.pb, v.hb]];
    if (String(v.c).trim() || String(v.pc).trim() || String(v.hc).trim()) raw.push([v.c || "C", v.pc, v.hc]);
    const blanks = raw.filter((r) => blank(r[1])).length;
    if (blanks > 1) return { err: "Give every branch probability except at most one; the blank one fills in as what is left." };
    const known = raw.reduce((s, r) => s + (blank(r[1]) ? 0 : sNum(r[1])), 0);
    const br = raw.map((r) => {
      const p = blank(r[1]) ? 1 - known : sNum(r[1]), h = sNum(r[2]);
      return { n: r[0], p, h, j: p * h, jn: p * (1 - h) };
    });
    if (br.some((b) => !isProb(b.p) || !isProb(b.h))) return { err: "Each probability has to be between 0 and 1. You can type 0.7, 70%, or 7/10." };
    const tot = br.reduce((s, b) => s + b.p, 0);
    if (Math.abs(tot - 1) > 1e-9) return { err: `The branch probabilities add to ${sF(tot)}. They have to add to exactly 1. For thirds, type 1/3.` };
    const pH = br.reduce((s, b) => s + b.j, 0), pN = 1 - pH, A = br[0];
    const fill = blanks ? ` (${br.filter((_, i) => blank(raw[i][1]))[0].n} = 1 minus the others)` : "";
    const cells: [string, number][] = [];
    br.forEach((b) => {
      cells.push([`${b.n} and ${H}`, b.j]);
      cells.push([`${b.n} and ${nH}`, b.jn]);
    });
    const top = cells.sort((x, y) => y[1] - x[1])[0];
    const table: Table = { head: ["", H, nH, "Total"], rows: br.map((b) => [b.n, sF(b.j), sF(b.jn), sF(b.p)]), foot: ["Total", sF(pH), sF(pN), "1"] };
    const ind = Math.abs(A.j - A.p * pH) < 1e-9;
    const rows: Row[] = [];
    rows.push(strong(`P(${H})`, sF(pH), `${br.map((b) => `${sF(b.p)} × ${sF(b.h)}`).join(" + ")} = ${br.map((b) => sF(b.j)).join(" + ")}. Add every ${H} branch${fill}.`, true));
    rows.push(row(`P(${nH})`, sF(pN), `1 − ${sF(pH)}`));
    br.forEach((b) => rows.push(row(`P(${H} | ${b.n})`, b.p > 0 ? sF(b.h) : "n/a", b.p > 0 ? "Given, so read it straight off the branch." : `${b.n} has probability 0, so this is undefined.`)));
    rows.push(row(`P(${A.n} and ${H})`, sF(A.j), `And means multiply along the branch: ${sF(A.p)} × ${sF(A.h)}`));
    br.forEach((b, i) => rows.push(row(`P(${b.n} | ${H})`, pH ? sF(b.j / pH) : "n/a", `Bayes: ${sF(b.j)} ÷ ${sF(pH)}${i === 0 ? `. The given (${H}) is the new total.` : ""}`, true)));
    br.forEach((b) => rows.push(row(`P(${b.n} | ${nH})`, pN ? sF(b.jn / pN) : "n/a", `${sF(b.jn)} ÷ ${sF(pN)}`)));
    rows.push(row(`P(${A.n} or ${H})`, sF(A.p + pH - A.j), `${sF(A.p)} + ${sF(pH)} − ${sF(A.j)}. Or means add, minus the overlap.`));
    rows.push(row(`Are ${A.n} and ${H} independent?`, ind ? "Yes" : "No", `P(${A.n} and ${H}) = ${sF(A.j)}${ind ? " equals " : " is not "}P(${A.n}) × P(${H}) = ${sF(A.p * pH)}.`));
    const flip = pH > 0 && A.p > 0, same = flip && Math.abs(A.j / pH - A.h) < 1e-9;
    rows.push(row(`Trap: is P(${A.n} | ${H}) the same as P(${H} | ${A.n})?`, flip ? `${same ? "Here, yes" : "No"}: ${sF(A.j / pH)} vs ${sF(A.h)}` : "n/a", flip ? `Flipping the given changes the denominator.${same ? " These numbers happen to match; usually they don't." : ""}` : "One of the givens has probability 0."));
    rows.push(row("Most likely single outcome", top[0], `${sF(top[1])}, the biggest branch.`));
    rows.push(row(`Two independent times: ${H} both`, sF(pH * pH), `${sF(pH)}²`));
    rows.push(row(`Two independent times: at least one ${H}`, sF(1 - pN * pN), `1 − ${sF(pN)}²`));
    return { table, rows };
  },
};

const draws: Solver = {
  id: "draws",
  title: "Draws from a box",
  sub: "Balls, cards, or defective cameras. Two draws, with or without putting the first one back.",
  fields: [
    { k: "r", l: "Count of kind 1", v: "4" },
    { k: "b", l: "Count of kind 2", v: "8" },
    { k: "rn", l: "Kind 1 name", v: "Green", t: true },
    { k: "bn", l: "Kind 2 name", v: "White", t: true },
    { k: "m", l: "Replacement", v: "without", opts: [["without", "Without (default)"], ["with", "With"]] },
  ],
  presets: [
    ["4 green, 8 white", { r: "4", b: "8", rn: "Green", bn: "White", m: "without" }],
    ["Parts: 3 bad of 20", { r: "3", b: "17", rn: "Defective", bn: "Good", m: "without" }],
    ["Aces in a deck", { r: "4", b: "48", rn: "Ace", bn: "Other", m: "without" }],
  ],
  rand: () => ({ r: String(ri(3, 8)), b: String(ri(4, 12)), m: pick(["without", "without", "with"]) }),
  run: (v) => {
    const r = Math.round(sNum(v.r)), b = Math.round(sNum(v.b)), R = v.rn || "Kind 1", Bn = v.bn || "Kind 2", w = v.m === "with";
    if (!(r >= 1 && b >= 1 && r + b <= 100000)) return { err: "Both counts need to be whole numbers of at least 1." };
    const N = r + b, D = w ? N * N : N * (N - 1), r2 = w ? r : r - 1, b2 = w ? b : b - 1, rr = r * r2, rb = r * b, bb = b * b2;
    const F = (n: number) => `${frac(n, D)} = ${sF(n / D)}`;
    const s2 = w ? N : N - 1;
    const table: Table = {
      head: ["First, then second", "Work", "Probability"],
      rows: [
        [`${R}, ${R}`, `${r}/${N} × ${r2}/${s2}`, sF(rr / D)],
        [`${R}, ${Bn}`, `${r}/${N} × ${b}/${s2}`, sF(rb / D)],
        [`${Bn}, ${R}`, `${b}/${N} × ${r}/${s2}`, sF(rb / D)],
        [`${Bn}, ${Bn}`, `${b}/${N} × ${b2}/${s2}`, sF(bb / D)],
      ],
      foot: ["Total", "", "1"],
    };
    const pr2 = r / N, prr2 = rr / D / pr2, dep = Math.abs(r2 / s2 - pr2) > 1e-12;
    return {
      table,
      rows: [
        row(`P(${R} first)`, `${frac(r, N)} = ${sF(r / N)}`, `${r} of ${N}`),
        row(`P(${R} then ${R})`, F(rr), `${r}/${N} × ${r2}/${s2}${w ? ". Put back, so nothing changes." : `. One ${R} is gone, so both counts drop by 1.`}`, true),
        row(`P(${R} then ${Bn})`, F(rb), `${r}/${N} × ${b}/${s2}`, true),
        row(`P(${Bn} then ${R})`, F(rb), `${b}/${N} × ${r}/${s2}`),
        row(`P(${Bn} then ${Bn})`, F(bb), `${b}/${N} × ${b2}/${s2}`),
        row("One of each, either order", F(2 * rb), `Both orders: ${frac(rb, D)} + ${frac(rb, D)}. Trap: order matters in the line above, not here.`),
        row(`At least one ${R}`, F(D - bb), `1 − P(${Bn}, ${Bn})`),
        row(`At least one ${Bn}`, F(D - rr), `1 − P(${R}, ${R})`),
        row(`P(${Bn} second | ${R} first)`, `${frac(b, s2)} = ${sF(b / s2)}`, `Given, so shrink the box: ${b} ${Bn} left of ${s2}.`),
        row(`P(${R} second | ${R} first)`, `${frac(r2, s2)} = ${sF(r2 / s2)}`, `${r2} left of ${s2}`),
        row(`P(${R} on second), first unknown`, `${frac(r, N)} = ${sF(pr2)}`, "Same as the first draw. Trap question."),
        row(`P(${R} first | ${R} second)`, sF(prr2), `Bayes: P(${R},${R}) ÷ P(${R} second) = ${sF(rr / D)} ÷ ${sF(pr2)}`, true),
        row(
          "Are the draws independent?",
          dep ? "No" : "Yes",
          dep ? `P(${R} second | ${R} first) = ${sF(r2 / s2)}, not ${sF(pr2)}. Without replacement, the first draw changes the box.` : "With replacement, the box resets every time.",
        ),
      ],
    };
  },
};

const events: Solver = {
  id: "events",
  title: "Two events",
  sub: "Give P(A), P(B), and P(A and B). Venn questions, given, independent, mutually exclusive.",
  fields: [
    { k: "pa", l: "P(A)", v: "0.6" },
    { k: "pb", l: "P(B)", v: "0.5" },
    { k: "pab", l: "P(A and B)", v: "0.3" },
  ],
  presets: [
    ["Die: 6 given over 3", { pa: "1/6", pb: "1/2", pab: "1/6" }],
    ["Independent", { pa: "0.6", pb: "0.5", pab: "0.3" }],
    ["Mutually exclusive", { pa: "0.25", pb: "0.45", pab: "0" }],
  ],
  rand: () => {
    const pa = ri(2, 7) / 10, pb = ri(2, 7) / 10;
    // Every candidate is drawn before pick chooses one, as the original did.
    let pab = pick([Math.round(pa * pb * 100) / 100, Math.round(((Math.min(pa, pb) * ri(1, 9)) / 10) * 100) / 100, 0]);
    if (pa + pb - pab > 1) pab = Math.round((pa + pb - 1) * 100) / 100 + 0.05;
    return { pa: String(pa), pb: String(pb), pab: String(Math.round(pab * 100) / 100) };
  },
  run: (v) => {
    const a = sNum(v.pa), b = sNum(v.pb), ab = sNum(v.pab);
    if (!isProb(a) || !isProb(b) || !isProb(ab)) return { err: "Each probability has to be between 0 and 1." };
    if (ab > Math.min(a, b) + 1e-12 || a + b - ab > 1 + 1e-12)
      return { err: "Those numbers are impossible: P(A and B) cannot be bigger than P(A) or P(B), and P(A or B) cannot pass 1." };
    const u = a + b - ab, ind = Math.abs(ab - a * b) < 1e-9, me = ab < 1e-12;
    const table: Table = {
      head: ["", "B", "not B", "Total"],
      rows: [["A", sF(ab), sF(a - ab), sF(a)], ["not A", sF(b - ab), sF(1 - u), sF(1 - a)]],
      foot: ["Total", sF(b), sF(1 - b), "1"],
    };
    return {
      table,
      rows: [
        row("P(A or B)", sF(u), `${sF(a)} + ${sF(b)} − ${sF(ab)}. Subtract the overlap once.`, true),
        row("P(A | B)", b ? sF(ab / b) : "n/a", `${sF(ab)} ÷ ${sF(b)}. B is the new total.`, true),
        row("P(B | A)", a ? sF(ab / a) : "n/a", `${sF(ab)} ÷ ${sF(a)}`, true),
        row("P(not A)", sF(1 - a), `1 − ${sF(a)}`),
        row("P(neither)", sF(1 - u), "1 − P(A or B)"),
        row("P(A only)", sF(a - ab), `${sF(a)} − ${sF(ab)}`),
        row("P(exactly one)", sF(u - ab), "P(A or B) − P(A and B)"),
        row("Independent?", ind ? "Yes" : "No", `P(A) × P(B) = ${sF(a * b)}${ind ? " equals " : " is not "}P(A and B) = ${sF(ab)}.`),
        row(
          "Mutually exclusive?",
          me ? "Yes" : "No",
          me ? "P(A and B) = 0. So they are dependent (if both can happen): knowing A tells you B did not." : `They overlap, P(A and B) = ${sF(ab)}.`,
        ),
      ],
    };
  },
};

const trials: Solver = {
  id: "trials",
  title: "Repeated trials",
  sub: "Same chance every time, independent: free throws, coin flips, dice. None, at least one, exactly k.",
  fields: [
    { k: "p", l: "P(success) each time", v: "0.7" },
    { k: "n", l: "Number of trials n", v: "5" },
    { k: "k", l: "Exactly k", v: "4" },
  ],
  presets: [
    ["Free throws: 70%, 5 shots", { p: "0.7", n: "5", k: "4" }],
    ["Coin: 3 flips", { p: "0.5", n: "3", k: "2" }],
    ["Die: a six in 4 rolls", { p: "1/6", n: "4", k: "1" }],
  ],
  rand: () => {
    const n = ri(2, 6);
    return { p: String(pick([0.1, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.7])), n: String(n), k: String(ri(1, n)) };
  },
  run: (v) => {
    const p = sNum(v.p), n = Math.round(sNum(v.n)), k = Math.round(sNum(v.k));
    if (!isProb(p)) return { err: "P(success) has to be between 0 and 1." };
    if (!(n >= 1 && n <= 200)) return { err: "n has to be a whole number from 1 to 200." };
    if (!(k >= 0 && k <= n)) return { err: "k has to be between 0 and n." };
    const q = 1 - p, none = Math.pow(q, n), ex = choose(n, k) * Math.pow(p, k) * Math.pow(q, n - k);
    let le = 0;
    for (let i = 0; i <= k; i++) le += choose(n, i) * Math.pow(p, i) * Math.pow(q, n - i);
    const ge = 1 - le + ex;
    const table: Table | undefined =
      n <= 10
        ? { head: ["Successes", "Probability"], rows: Array.from({ length: n + 1 }, (_, y) => [String(y), sF(choose(n, y) * Math.pow(p, y) * Math.pow(q, n - y))]) }
        : undefined;
    return {
      table,
      rows: [
        row("P(none)", sF(none), `${sF(q)}^${n}. And means multiply.`, true),
        row("P(at least one)", sF(1 - none), `1 − ${sF(q)}^${n}. Always use the complement.`, true),
        row(`P(all ${n})`, sF(Math.pow(p, n)), `${sF(p)}^${n}`),
        row(`P(exactly ${k})`, sF(ex), `${choose(n, k)} × ${sF(p)}^${k} × ${sF(q)}^${n - k}. The ${choose(n, k)} counts the orders.`, true),
        row(`P(at most ${k})`, sF(le), `Add exactly 0 through ${k}`),
        row(`P(at least ${k})`, sF(ge), `1 − P(at most ${k - 1})`),
        row(
          `P(exactly ${k} | at least one)`,
          k >= 1 ? sF(ex / (1 - none)) : "n/a",
          k >= 1 ? `${sF(ex)} ÷ ${sF(1 - none)}. Given at least one, so that is the new total.` : "k = 0 cannot happen given at least one.",
        ),
        row("Expected number np", sF(n * p), `${n} × ${sF(p)}`),
        row("SD √(npq)", sF(Math.sqrt(n * p * q)), `√(${n} × ${sF(p)} × ${sF(q)})`),
      ],
    };
  },
};

const poisson: Solver = {
  id: "poisson",
  title: "Poisson counts",
  sub: "Arrivals, calls, defects: a rate per unit of time or space. Scale the rate to the window first.",
  fields: [
    { k: "r", l: "Rate per unit", v: "4" },
    { k: "u", l: "Unit name", v: "hour", t: true },
    { k: "t", l: "Window, in units", v: "1" },
    { k: "k", l: "Count k", v: "3" },
  ],
  presets: [
    ["Calls: 4 an hour, exactly 3", { r: "4", u: "hour", t: "1", k: "3" }],
    ["Calls: 1 or fewer in 30 minutes", { r: "4", u: "hour", t: "0.5", k: "1" }],
    ["Typos: 1.5 a page, 2 pages", { r: "1.5", u: "page", t: "2", k: "2" }],
  ],
  rand: () => ({ r: String(pick([1, 1.5, 2, 3, 4, 5])), t: String(pick([0.5, 1, 2, 3])), k: String(ri(0, 6)) }),
  run: (v) => {
    const r = sNum(v.r), t = sNum(v.t), k = Math.round(sNum(v.k)), U = v.u || "unit";
    if (!(r > 0) || !(t > 0)) return { err: "Rate and window both have to be above 0." };
    if (!(k >= 0 && k <= 500)) return { err: "k has to be a whole number of 0 or more." };
    const L = r * t;
    const pf = (y: number) => {
      let lp = -L + y * Math.log(L);
      for (let i = 2; i <= y; i++) lp -= Math.log(i);
      return Math.exp(lp);
    };
    let le = 0;
    for (let i = 0; i <= k; i++) le += pf(i);
    const lt = le - pf(k), top = Math.min(40, Math.max(k, Math.ceil(L + 3 * Math.sqrt(L))));
    let cum = 0;
    const tr: string[][] = [];
    for (let i = 0; i <= top; i++) {
      cum += pf(i);
      tr.push([String(i), sF(pf(i)), sF(cum)]);
    }
    const p1 = 1 - Math.exp(-L);
    return {
      table: { head: ["Count", "P(exactly)", "P(this many or fewer)"], rows: tr },
      rows: [
        strong("λ for this window", sF(L), `${sF(r)} per ${U} × ${sF(t)} ${U}${t === 1 ? "" : "s"}. Scale the rate first; this is the step people miss.`, true),
        row(`P(exactly ${k})`, sF(pf(k)), `e^−${sF(L)} × ${sF(L)}^${k} / ${k}!`, true),
        row(`P(${k} or fewer)`, sF(le), `Add P(0) through P(${k})`, true),
        row(`P(fewer than ${k})`, sF(lt), `Add P(0) through P(${k - 1})`),
        row(`P(at least ${k})`, sF(1 - lt), `1 − P(${k - 1} or fewer)`),
        row(`P(more than ${k})`, sF(1 - le), `1 − P(${k} or fewer)`),
        row("P(none)", sF(Math.exp(-L)), `e^−${sF(L)}`),
        row("P(at least one)", sF(p1), `1 − e^−${sF(L)}`),
        row(
          `P(exactly ${k} | at least one)`,
          k >= 1 ? sF(pf(k) / p1) : "0",
          k >= 1 ? `P(${k}) / P(at least one) = ${sF(pf(k))} / ${sF(p1)}. Given at least one, divide by that.` : "Once you know at least one happened, zero is ruled out.",
        ),
        row("Mean and variance", sF(L), `Both equal λ for a Poisson. SD = √λ = ${sF(Math.sqrt(L))}`),
      ],
    };
  },
};

const normal: Solver = {
  id: "normal",
  title: "Normal curve",
  sub: "Mean and SD, then any value. More than, less than, between, the top or bottom cutoff, several in a row, and averages of n.",
  fields: [
    { k: "mu", l: "Mean μ", v: "500" },
    { k: "sd", l: "SD σ", v: "40" },
    { k: "a", l: "Value x", v: "540" },
    { k: "b", l: "Second value (for between)", v: "" },
    { k: "pct", l: "Top or bottom %", v: "5" },
    { k: "m", l: "How many in a row (all below x)", v: "3" },
    { k: "n", l: "Sample size n (for the average)", v: "16" },
  ],
  presets: [
    ["Battery: over 540 hours", { mu: "500", sd: "40", a: "540", b: "", pct: "5", m: "1", n: "1" }],
    ["Between 450 and 560", { mu: "500", sd: "40", a: "450", b: "560", pct: "5", m: "1", n: "1" }],
    ["Three all under 480", { mu: "500", sd: "40", a: "480", b: "", pct: "5", m: "3", n: "1" }],
    ["Average of 16 under 510", { mu: "500", sd: "40", a: "510", b: "", pct: "5", m: "1", n: "16" }],
  ],
  rand: () => {
    const mu = pick([50, 100, 266, 500, 72]), sd = pick([5, 8, 10, 15, 16, 40]), a = mu + sd * pick([-2, -1.5, -1, -0.5, 0.5, 1, 1.25, 2]);
    return {
      mu: String(mu),
      sd: String(sd),
      a: String(a),
      b: Math.random() < 0.5 ? String(mu + sd * pick([1, 1.5, 2])) : "",
      pct: String(pick([5, 10, 20, 25])),
      m: String(pick([1, 2, 3])),
      n: String(pick([1, 16, 25, 36, 49])),
    };
  },
  run: (v) => {
    const mu = sNum(v.mu), sd = sNum(v.sd), a = sNum(v.a), b = blank(v.b) ? null : sNum(v.b), pc = sNum(v.pct);
    const m = Math.round(sNum(v.m) || 1), n = Math.round(sNum(v.n) || 1);
    if (!isFinite(mu) || !(sd > 0) || !isFinite(a)) return { err: "Type a mean, an SD above 0, and a value." };
    /** The printed z-table answer, when rounding z to 2 decimals moves it. */
    const zt = (z: number) => {
      const zr = Math.round(z * 100) / 100;
      return Math.abs(zr - z) > 1e-9 && Math.abs(Phi(zr) - Phi(z)) >= 0.0005 ? ` (z-table with z rounded to ${zr.toFixed(2)}: ${sF(Phi(zr))})` : "";
    };
    const z = (a - mu) / sd, lo = Phi(z), rows: Row[] = [];
    rows.push(strong(`z for x = ${sF(a)}`, sF(z), `(x − μ) / σ = (${sF(a)} − ${sF(mu)}) / ${sF(sd)}. How many SDs from the mean.`, true));
    rows.push(row(`P(X < ${sF(a)})`, sF(lo), `Φ(${sF(z)})${zt(z)}`, true));
    rows.push(row(`P(X > ${sF(a)})`, sF(1 - lo), `1 − Φ(${sF(z)})`, true));
    if (b !== null && isFinite(b)) {
      const lo2 = Math.min(a, b), hi2 = Math.max(a, b), z1 = (lo2 - mu) / sd, z2 = (hi2 - mu) / sd;
      rows.push(row(`P(${sF(lo2)} < X < ${sF(hi2)})`, sF(Phi(z2) - Phi(z1)), `Φ(${sF(z2)}) − Φ(${sF(z1)}) = ${sF(Phi(z2))} − ${sF(Phi(z1))}`, true));
    }
    if (pc > 0 && pc < 100) {
      const p = pc / 100, zc = PhiInv(1 - p);
      rows.push(
        row(`Top ${sF(pc)}% starts at`, sF(mu + zc * sd), `μ + zσ with z = ${zc.toFixed(2)}: ${sF(mu)} + ${zc.toFixed(2)} × ${sF(sd)}. Work backwards: area first, then z, then x.`, true),
      );
      rows.push(row(`Bottom ${sF(pc)}% ends at`, sF(mu - zc * sd), `${sF(mu)} − ${zc.toFixed(2)} × ${sF(sd)}`));
    }
    if (m >= 2) {
      rows.push(row(`All ${m} below ${sF(a)}`, sF(Math.pow(lo, m)), `${sF(lo)}^${m}. Independent, so multiply.`, true));
      rows.push(row(`All ${m} above ${sF(a)}`, sF(Math.pow(1 - lo, m)), `${sF(1 - lo)}^${m}`));
      rows.push(row(`At least one of ${m} above ${sF(a)}`, sF(1 - Math.pow(lo, m)), `1 − ${sF(lo)}^${m}`));
    }
    if (n >= 2) {
      const se = sd / Math.sqrt(n), zm = (a - mu) / se;
      rows.push(row("Standard error of the average", sF(se), `σ / √n = ${sF(sd)} / √${n}. Averages wobble less than single values.`));
      rows.push(row(`z for an average of ${sF(a)}`, sF(zm), `(${sF(a)} − ${sF(mu)}) / ${sF(se)}`));
      rows.push(row(`P(average of ${n} < ${sF(a)})`, sF(Phi(zm)), `Φ(${sF(zm)})${zt(zm)}`, true));
      rows.push(row(`P(average of ${n} > ${sF(a)})`, sF(1 - Phi(zm)), `1 − Φ(${sF(zm)})`));
    }
    rows.push(
      row(
        "Empirical rule check",
        `68% within ${sF(mu - sd)} to ${sF(mu + sd)}; 95% within ${sF(mu - 2 * sd)} to ${sF(mu + 2 * sd)}; 99.7% within ${sF(mu - 3 * sd)} to ${sF(mu + 3 * sd)}`,
        "Plus or minus 1, 2, and 3 SDs.",
      ),
    );
    return { rows };
  },
};

const samp: Solver = {
  id: "samp",
  title: "Sampling distribution, sample by sample",
  sub: "A small population, typed in. Every possible sample of size n, its mean, and the exact distribution of x̄, with or without replacement.",
  fields: [
    { k: "pop", l: "Population values, separated by commas", v: "1, 2, 3, 6", t: true, wide: true },
    { k: "n", l: "Sample size n", v: "2" },
    { k: "rep", l: "Drawing", v: "w", opts: [["w", "With replacement"], ["wo", "Without replacement"]] },
    { k: "c", l: "Cutoff c, for P(x̄ ≤ c)", v: "2" },
  ],
  presets: [
    ["Four values, n = 2", { pop: "1, 2, 3, 6", n: "2", rep: "w", c: "2" }],
    ["Five prices, 3 different ones", { pop: "4, 5, 7, 9, 10", n: "3", rep: "wo", c: "6" }],
    ["Two dice, average roll", { pop: "1, 2, 3, 4, 5, 6", n: "2", rep: "w", c: "2.5" }],
  ],
  rand: () => {
    const N = pick([4, 5]), p: number[] = [];
    for (let i = 0; i < N; i++) p.push(ri(1, 12));
    const n = pick([2, 3]);
    return { pop: p.join(", "), n: String(n), rep: pick(["w", "wo"]), c: String(Math.round(mean(p))) };
  },
  run: (v) => {
    const pop = String(v.pop)
      .split(/[,;\s]+/)
      .filter((x) => x !== "")
      .map(sNum);
    const N = pop.length, n = Math.round(sNum(v.n)), wr = v.rep === "w", c = blank(v.c) ? NaN : sNum(v.c);
    if (N < 2 || pop.some((x) => !isFinite(x))) return { err: "Type at least two numbers, separated by commas." };
    if (N > 12) return { err: "Keep the population to 12 values or fewer." };
    if (!(n >= 1)) return { err: "n has to be a whole number of at least 1." };
    if (!wr && n > N) return { err: `Without replacement, n can be at most ${N}.` };
    const tot = Math.round(wr ? Math.pow(N, n) : choose(N, n));
    if (tot > 100000) return { err: `That makes ${tot.toLocaleString()} samples. Use a smaller population or n.` };
    const mu = mean(pop);
    let ss = 0;
    pop.forEach((x) => (ss += (x - mu) * (x - mu)));
    const sig = Math.sqrt(ss / N);
    // Every sample: with replacement each position runs over all N; without, only later indexes.
    const means: number[] = [];
    const go = (start: number, acc: number, depth: number) => {
      if (depth === n) {
        means.push(acc / n);
        return;
      }
      for (let i = wr ? 0 : start; i < N; i++) go(i + 1, acc + pop[i], depth + 1);
    };
    go(0, 0, 0);
    const E = mean(means);
    let vv = 0;
    means.forEach((m) => (vv += (m - E) * (m - E)));
    const se = Math.sqrt(vv / means.length), fpc = Math.sqrt((N - n) / (N - 1));
    const bins: Record<string, number> = {};
    means.forEach((m) => {
      const key = fmt(m);
      bins[key] = (bins[key] || 0) + 1;
    });
    let cum = 0;
    const tr = Object.keys(bins)
      .sort((a, b) => +a - +b)
      .map((key) => {
        cum += bins[key];
        return [key, String(bins[key]), sF(bins[key] / tot), sF(cum / tot)];
      });
    const rows: Row[] = [
      strong("Population mean μ", sF(mu), `Σx / N = ${sF(mu * N)} / ${N}`, true),
      row("Population SD σ", sF(sig), `Divide by N = ${N} because this is the whole population. σ² = ${sF(ss / N)}.`),
      row(
        "Possible samples",
        tot.toLocaleString(),
        wr
          ? `N^n = ${N}^${n}. Order counts and repeats are allowed, so every one is equally likely.`
          : `C(N, n) = C(${N}, ${n}). No repeats, order ignored, each set equally likely.`,
        true,
      ),
      row("Average of all the sample means", sF(E), "It equals μ: x̄ is an unbiased estimator.", true),
      row(
        "Standard error of x̄",
        sF(se),
        wr
          ? `σ / √n = ${sF(sig)} / √${n}. Same as the SD of the list of means.`
          : `σ / √n × √[(N − n)/(N − 1)] = ${sF(sig / Math.sqrt(n))} × ${sF(fpc)}. Drawing without replacement from a small population shrinks it.`,
        true,
      ),
    ];
    if (isFinite(c)) {
      let k = 0;
      means.forEach((m) => {
        if (m <= c + 1e-9) k++;
      });
      rows.push(row(`P(x̄ ≤ ${sF(c)}), exact`, sF(k / tot), `${k} of the ${tot.toLocaleString()} samples have a mean of ${sF(c)} or less.`, true));
      if (se > 0)
        rows.push(row("Normal approximation", sF(Phi((c - mu) / se)), `z = (${sF(c)} − ${sF(mu)}) / ${sF(se)} = ${sF((c - mu) / se)}. Rough at a small n; the exact count above is the answer.`));
    }
    return { table: { head: ["x̄", "Samples", "P(x̄)", "P(x̄ or less)"], rows: tr }, rows };
  },
};

const ci: Solver = {
  id: "ci",
  title: "Confidence intervals and sample size",
  sub: "Mean with s (t), mean with σ known (z), or a proportion. Then the sample size for a target margin.",
  fields: [
    { k: "kind", l: "Type", v: "t", opts: [["t", "Mean, s from the sample (t)"], ["z", "Mean, σ known (z)"], ["p", "Proportion"]] },
    { k: "cl", l: "Confidence", v: "0.95", opts: [["0.90", "90%"], ["0.95", "95%"], ["0.99", "99%"]] },
    { k: "n", l: "Sample size n", v: "25" },
    { k: "xbar", l: "Mean x̄ (mean types)", v: "42.5" },
    { k: "s", l: "SD s or σ (mean types)", v: "6.2" },
    { k: "x", l: "Count with the trait (proportion)", v: "" },
    { k: "e", l: "Target E (for sample size)", v: "2" },
    { k: "em", l: "E is", v: "m", opts: [["m", "The margin (±)"], ["l", "The full length"]] },
  ],
  presets: [
    ["Delivery times: 95%, n 25", { kind: "t", cl: "0.95", n: "25", xbar: "42.5", s: "6.2", x: "", e: "2", em: "m" }],
    ["Survey: 240 of 400 say yes", { kind: "p", cl: "0.95", n: "400", xbar: "", s: "", x: "240", e: "0.06", em: "l" }],
  ],
  rand: () => {
    const k = pick(["t", "z", "p"]), n = pick([16, 25, 36, 49, 100, 400]);
    if (k === "p") {
      const x = Math.round(n * pick([0.2, 0.35, 0.5, 0.6, 0.72]));
      return { kind: k, cl: pick(["0.90", "0.95", "0.99"]), n: String(n), xbar: "", s: "", x: String(x), e: String(pick([0.03, 0.05, 0.06, 0.1])), em: pick(["m", "l"]) };
    }
    return {
      kind: k,
      cl: pick(["0.90", "0.95", "0.99"]),
      n: String(n),
      xbar: String(pick([42.5, 71.2, 80, 120])),
      s: String(pick([6.2, 10.5, 12, 15])),
      x: "",
      e: String(pick([1, 2, 3, 5])),
      em: "m",
    };
  },
  run: (v) => {
    const kind = v.kind, cl = +v.cl, n = Math.round(sNum(v.n)), a = 1 - cl, zc = +PhiInv(1 - a / 2).toFixed(3), E = sNum(v.e);
    const E1 = isFinite(E) && E > 0 ? (v.em === "l" ? E / 2 : E) : NaN, rows: Row[] = [], lvl = `${Math.round(cl * 100)}%`;
    if (!(n >= 2)) return { err: "n has to be a whole number of at least 2." };
    if (kind === "p") {
      const x = sNum(v.x);
      if (!(x >= 0 && x <= n)) return { err: "Type the count with the trait, between 0 and n." };
      const ph = x / n, q = 1 - ph, se = Math.sqrt((ph * q) / n), me = zc * se, big = n * ph >= 10 && n * q >= 10;
      rows.push(row("p̂", sF(ph), `${sF(x)} / ${n}`));
      if (big) rows.push(strong(`${lvl} interval for p`, `${sF(ph - me)} to ${sF(ph + me)}`, `p̂ ± z√[p̂(1 − p̂)/n] = ${sF(ph)} ± ${zc} × ${sF(se)} = ${sF(ph)} ± ${sF(me)}`, true));
      else {
        // Too few of one outcome for p̂ ± z·SE (0 of 10 would give "0 to 0"). The Wilson interval stays honest here.
        const z2 = zc * zc, c = (ph + z2 / (2 * n)) / (1 + z2 / n), h = (zc * Math.sqrt((ph * q) / n + z2 / (4 * n * n))) / (1 + z2 / n);
        rows.push(strong(`${lvl} interval for p (small sample)`, `${sF(Math.max(0, c - h))} to ${sF(Math.min(1, c + h))}`, `The usual p̂ ± z·SE needs at least 10 of each outcome; here it would say ${sF(ph - me)} to ${sF(ph + me)}. This is the Wilson interval, which works with few successes.`, true));
        rows.push(row(`Usual formula, not reliable here`, `${sF(ph - me)} to ${sF(ph + me)}`, `p̂ ± z√[p̂(1 − p̂)/n] = ${sF(ph)} ± ${zc} × ${sF(se)}`));
      }
      rows.push(row("Margin of error", sF(me), `${zc} × ${sF(se)}${big ? "" : ", from the usual formula"}`));
      rows.push(row("Interval for the complement (1 − p)", `${sF(q - me)} to ${sF(q + me)}`, `${sF(q)} ± ${sF(me)}. Trap: read whether the question asks about those with the trait or without.`));
      rows.push(row("Normal check", n * ph >= 10 && n * q >= 10 ? "OK" : "Too small", `np̂ = ${sF(n * ph)} and n(1 − p̂) = ${sF(n * q)}; both need to be at least 10.`));
      if (isFinite(E1)) {
        const n0 = (zc * zc * 0.25) / (E1 * E1), n1 = (zc * zc * ph * q) / (E1 * E1);
        rows.push(
          row(
            "Sample size, no prior guess (p = 0.5)",
            String(Math.ceil(n0 - 1e-9)),
            `z²(0.5)(0.5) / E² = ${zc}² × 0.25 / ${sF(E1)}² = ${sF(n0)}. Round up.${v.em === "l" ? ` Length ${sF(E)} means E = ${sF(E1)}.` : ""}`,
            true,
          ),
        );
        rows.push(row(`Sample size using p̂ = ${sF(ph)}`, String(Math.ceil(n1 - 1e-9)), `z² p̂(1 − p̂) / E² = ${sF(n1)}. Round up.`, true));
      }
    } else {
      const xb = sNum(v.xbar), s = sNum(v.s);
      if (!isFinite(xb) || !(s > 0)) return { err: "Type the mean and an SD above 0." };
      const se2 = s / Math.sqrt(n), crit = kind === "t" ? +tinv(1 - a / 2, n - 1).toFixed(3) : zc, me2 = crit * se2;
      rows.push(row("Critical value", `${kind === "t" ? "t = " : "z = "}${crit}`, kind === "t" ? `t with n − 1 = ${n - 1} df, ${lvl} two-sided. σ unknown, so t.` : "σ known, so z."));
      rows.push(row("Standard error", sF(se2), `s / √n = ${sF(s)} / √${n}`));
      rows.push(strong(`${lvl} interval for μ`, `${sF(xb - me2)} to ${sF(xb + me2)}`, `x̄ ± ${crit} × ${sF(se2)} = ${sF(xb)} ± ${sF(me2)}`, true));
      rows.push(row("Margin of error", sF(me2), `${crit} × ${sF(se2)}`));
      if (isFinite(E1)) {
        const nz = Math.pow((zc * s) / E1, 2), nt = Math.pow((crit * s) / E1, 2);
        rows.push(row(`Sample size for ± ${sF(E1)} (z)`, String(Math.ceil(nz - 1e-9)), `(zσ/E)² = (${zc} × ${sF(s)} / ${sF(E1)})² = ${sF(nz)}. Round up. The usual textbook answer.`, true));
        if (kind === "t") rows.push(row(`Same, if you keep t = ${crit}`, String(Math.ceil(nt - 1e-9)), `(${crit} × ${sF(s)} / ${sF(E1)})² = ${sF(nt)}. Check which one your book or teacher uses.`));
      }
    }
    rows.push(
      row(
        "What it means",
        `We are ${lvl} confident the true value is in this range`,
        `Not a ${lvl} chance for this one interval; ${lvl} of intervals built this way catch the truth.`,
      ),
    );
    return { rows };
  },
};

const test: Solver = {
  id: "test",
  title: "Hypothesis tests",
  sub: "A mean with σ known (z), a mean with s (t), or a proportion. Pick the direction of H₁ and α; get the statistic, the p-value and the decision in words.",
  fields: [
    { k: "kind", l: "Test", v: "z", opts: [["z", "Mean, σ known (z)"], ["t", "Mean, s from the sample (t)"], ["p", "Proportion (z)"]] },
    { k: "side", l: "H₁", v: "two", opts: [["two", "Not equal (two-sided)"], ["less", "Less than (left tail)"], ["greater", "Greater than (right tail)"]] },
    { k: "h0", l: "H₀ value, μ₀ or p₀", v: "250" },
    { k: "n", l: "Sample size n", v: "36" },
    { k: "xbar", l: "Sample mean x̄ (mean tests)", v: "247.5" },
    { k: "s", l: "σ or s (mean tests)", v: "6" },
    { k: "x", l: "Count with the trait (proportion)", v: "" },
    { k: "a", l: "α", v: "0.05", opts: [["0.10", "0.10"], ["0.05", "0.05"], ["0.01", "0.01"]] },
  ],
  presets: [
    ["Machine: 247.5 against 250", { kind: "z", side: "two", h0: "250", n: "36", xbar: "247.5", s: "6", x: "", a: "0.05" }],
    ["Bags under 500 g? (t)", { kind: "t", side: "less", h0: "500", n: "16", xbar: "492", s: "12", x: "", a: "0.05" }],
    ["230 of 400 prefer A", { kind: "p", side: "two", h0: "0.5", n: "400", xbar: "", s: "", x: "230", a: "0.05" }],
  ],
  rand: () => {
    const k = pick(["z", "t", "p"]), side = pick(["two", "less", "greater"]), a = pick(["0.10", "0.05", "0.01"]);
    if (k === "p") {
      const n = pick([100, 200, 400]), p0 = pick([0.3, 0.4, 0.5]);
      return { kind: k, side, h0: String(p0), n: String(n), xbar: "", s: "", x: String(Math.round(n * (p0 + pick([-0.07, -0.04, 0.03, 0.06])))), a };
    }
    const mu = pick([50, 100, 250, 500]), s = pick([4, 6, 10, 12]), n2 = pick([16, 25, 36]);
    return { kind: k, side, h0: String(mu), n: String(n2), xbar: String(r2(mu + (pick([-2.3, -1.4, 1.2, 2.1]) * s) / Math.sqrt(n2))), s: String(s), x: "", a };
  },
  run: (v) => {
    const kind = v.kind, side = v.side, h0 = sNum(v.h0), n = Math.round(sNum(v.n)), a = +v.a, sym = kind === "p" ? "p" : "μ";
    const op = ({ two: "≠", less: "<", greater: ">" } as Record<string, string>)[side];
    const rows: Row[] = [];
    let est: number, se: number, df: number | null = null;
    if (!isFinite(h0)) return { err: "Type the H₀ value." };
    if (!(n >= 2)) return { err: "n has to be a whole number of at least 2." };
    if (kind === "p") {
      const x = sNum(v.x);
      if (!(h0 > 0 && h0 < 1)) return { err: "p₀ has to be between 0 and 1." };
      if (!(x >= 0 && x <= n)) return { err: "Type the count with the trait, between 0 and n." };
      est = x / n;
      se = Math.sqrt((h0 * (1 - h0)) / n);
    } else {
      est = sNum(v.xbar);
      const s = sNum(v.s);
      if (!isFinite(est) || !(s > 0)) return { err: "Type the sample mean and an SD above 0." };
      se = s / Math.sqrt(n);
      if (kind === "t") df = n - 1;
    }
    const stat = (est - h0) / se;
    const cdf = (q: number) => (df ? tcdf(q, df) : Phi(q));
    const inv = (q: number) => (df ? tinv(q, df) : PhiInv(q));
    const pval = side === "two" ? 2 * (1 - cdf(Math.abs(stat))) : side === "less" ? cdf(stat) : 1 - cdf(stat);
    const crit = side === "two" ? inv(1 - a / 2) : inv(1 - a);
    // The z test for p needs np₀ and n(1 − p₀) of at least 10; below that its p-value can't support a decision.
    const L = kind === "t" ? "t" : "z", rej = pval < a, small = kind === "p" && (n * h0 < 10 || n * (1 - h0) < 10);
    const critTxt = side === "two" ? `±${crit.toFixed(3)}` : `${side === "less" ? "−" : ""}${crit.toFixed(3)}`;
    rows.push(row("Hypotheses", `H₀: ${sym} = ${sF(h0)}   H₁: ${sym} ${op} ${sF(h0)}`, "H₀ holds the equals sign. H₁ is the claim you want evidence for."));
    rows.push(
      row(
        "Standard error",
        sF(se),
        kind === "p" ? `√[p₀(1 − p₀) / n] = √(${sF(h0)} × ${sF(1 - h0)} / ${n}). It uses p₀, not p̂.` : `${kind === "t" ? "s" : "σ"} / √n = ${sF(sNum(v.s))} / √${n}`,
      ),
    );
    rows.push(strong(`Test statistic ${L}`, sF(stat), `(${kind === "p" ? "p̂" : "x̄"} − ${sF(h0)}) / ${sF(se)}${kind === "p" ? `, with p̂ = ${sF(est)}` : ""}${df ? `. ${df} df.` : ""}`, true));
    rows.push(
      row(
        "Critical value",
        `${L} = ${critTxt}`,
        `${side === "two" ? `Two-sided: α/2 = ${sF(a / 2)} in each tail.` : `One-sided: all of α = ${sF(a)} in one tail.`} Reject if the statistic is past it.`,
      ),
    );
    rows.push(row("p-value", sF(pval), side === "two" ? `2 × P(${L} > |${sF(stat)}|)` : side === "less" ? `P(${L} < ${sF(stat)})` : `P(${L} > ${sF(stat)})`, true));
    rows.push(
      strong(
        "Decision",
        small ? "No call: sample too small" : rej ? "Reject H₀" : "Fail to reject H₀",
        small
          ? `np₀ = ${sF(n * h0)} and n(1 − p₀) = ${sF(n * (1 - h0))}; the z test needs both at least 10, so this p-value is not reliable. An exact binomial test is the right tool here.`
          : rej
            ? `p-value ${sF(pval)} < α = ${sF(a)}`
            : `p-value ${sF(pval)} ≥ α = ${sF(a)}. That does not prove H₀; the evidence is just not strong enough.`,
        true,
      ),
    );
    rows.push(
      row(
        "In words",
        small ? "Not enough data for this test to say." : rej ? `The data are strong evidence that ${sym} ${op} ${sF(h0)}.` : `The data are not strong evidence that ${sym} ${op} ${sF(h0)}.`,
        `Say it about the population, at α = ${sF(a)}.`,
      ),
    );
    if (kind === "p")
      rows.push(row("Normal check", n * h0 >= 10 && n * (1 - h0) >= 10 ? "OK" : "Too small", `np₀ = ${sF(n * h0)} and n(1 − p₀) = ${sF(n * (1 - h0))}; both need to be at least 10.`));
    else if (side === "two") {
      const m = crit * se;
      rows.push(
        row(
          `${Math.round((1 - a) * 100)}% interval for μ`,
          `${sF(est - m)} to ${sF(est + m)}`,
          `${est - m <= h0 && h0 <= est + m ? "Contains " : "Leaves out "}${sF(h0)}, which matches the decision. A two-sided test and its interval always agree.`,
        ),
      );
    }
    return { rows };
  },
};

const bday: Solver = {
  id: "bday",
  title: "Birthday problem",
  sub: "Chance that at least two people in a room share a birthday. Type the head count.",
  fields: [
    { k: "n", l: "People in the room", v: "40" },
    { k: "d", l: "Days in a year", v: "365" },
  ],
  presets: [
    ["A room of 40", { n: "40", d: "365" }],
    ["22 people", { n: "22", d: "365" }],
    ["23 people", { n: "23", d: "365" }],
  ],
  rand: () => ({ n: String(ri(5, 70)), d: "365" }),
  run: (v) => {
    const n = Math.round(sNum(v.n)), d = Math.round(sNum(v.d));
    if (!(d >= 2 && d <= 10000)) return { err: "Days has to be a whole number, normally 365." };
    if (!(n >= 1 && n <= 5000)) return { err: "People has to be a whole number of at least 1." };
    /** P(k people all have different birthdays). */
    const diff = (k: number) => {
      if (k > d) return 0;
      let p = 1;
      for (let i = 0; i < k; i++) p *= (d - i) / d;
      return p;
    };
    const first = (t: number) => {
      for (let k = 1; k <= d + 1; k++) if (1 - diff(k) >= t) return k;
      return d + 1;
    };
    const pd = diff(n), pairs = (n * (n - 1)) / 2, you = 1 - Math.pow((d - 1) / d, n - 1), n50 = first(0.5), n99 = first(0.99);
    const ks = [2, 10, 20, 22, 23, 30, 40, 50, 57, n].filter((k, i, a) => a.indexOf(k) === i).sort((a, b) => a - b);
    return {
      table: { head: ["People", "P(shared birthday)"], rows: ks.map((k) => [String(k) + (k === n ? " (yours)" : ""), sF(1 - diff(k))]) },
      rows: [
        strong(`P(at least two share a birthday), n = ${n}`, sF(1 - pd), "1 − P(all different). Complement, the same move as at least one.", true),
        row("P(all different birthdays)", sF(pd), `${d}/${d} × ${d - 1}/${d} × ${d - 2}/${d} × ... × ${Math.max(d - n + 1, 0)}/${d} (${n} fractions)`),
        row("P(someone shares YOUR birthday)", sF(you), `1 − (${d - 1}/${d})^${n - 1}. Different question: only pairs that include you count.`, true),
        row("Number of pairs", sF(pairs), `${n} × ${n - 1} / 2. Why it climbs so fast: every pair is a chance to match.`),
        row("Expected matching pairs", sF(pairs / d), `${sF(pairs)} / ${d}`),
        row("People needed for a 50% chance", String(n50), d === 365 ? "The famous answer: 23 people" : ""),
        row("People needed for a 99% chance", String(n99), ""),
        row("Assumption to say out loud", "Equal odds for every day, no leap day, no twins", "Real birthdays cluster a little, which makes a match slightly more likely."),
      ],
    };
  },
};

const data: Solver = {
  id: "data",
  title: "Describe data",
  sub: "Paste a list. Mean, median, mode, range, variance, SD, with the work written out step by step.",
  fields: [{ k: "x", l: "Numbers, separated by commas or spaces", v: "32, 25, 41, 25, 38, 29, 44, 25, 36", t: true, wide: true }],
  presets: [
    ["Commute minutes", { x: "32, 25, 41, 25, 38, 29, 44, 25, 36" }],
    ["Weekly sales", { x: "12, 18, 9, 15, 18, 21, 14" }],
  ],
  rand: () => {
    const n = ri(6, 9), a: number[] = [];
    for (let i = 0; i < n; i++) a.push(ri(50, 90));
    if (Math.random() < 0.6) a[ri(1, n - 1)] = a[0];
    return { x: a.join(", ") };
  },
  run: (v) => {
    const xs = String(v.x).split(/[\s,;]+/).filter(Boolean).map(Number);
    if (xs.length < 2 || xs.some((x) => !isFinite(x))) return { err: "Type at least two numbers, separated by commas or spaces." };
    const n = xs.length, S = xs.reduce((a, b) => a + b, 0), m = S / n, so = xs.slice().sort((a, b) => a - b);
    const med = n % 2 ? so[(n - 1) / 2] : (so[n / 2 - 1] + so[n / 2]) / 2;
    const cnt: Record<string, number> = {};
    let mx = 0;
    so.forEach((x) => {
      cnt[x] = (cnt[x] || 0) + 1;
      if (cnt[x] > mx) mx = cnt[x];
    });
    const modes = Object.keys(cnt).filter((k) => cnt[k] === mx).map(Number).sort((a, b) => a - b);
    const dev = xs.map((x) => x - m), ss = dev.reduce((a, d) => a + d * d, 0), sx2 = xs.reduce((a, x) => a + x * x, 0), s2 = ss / (n - 1);
    const modeTxt = mx === 1 ? "No mode" : modes.join(" and ") + (modes.length === 2 ? " (bimodal)" : "");
    return {
      rows: [
        row(`Sorted (n = ${n})`, so.join(", "), "Sort first. Median and mode fall out."),
        row("Mean x̄", sF(m), `Σx / n = ${sF(S)} / ${n}`, true),
        row("Median", sF(med), n % 2 ? `Middle value, position ${(n + 1) / 2}` : `Average of positions ${n / 2} and ${n / 2 + 1}: (${so[n / 2 - 1]} + ${so[n / 2]}) / 2`, true),
        row("Mode", modeTxt, mx === 1 ? "Every value shows up once." : `Shows up ${mx} times.`, true),
        row("Range", sF(so[n - 1] - so[0]), `${so[n - 1]} − ${so[0]}`, true),
        row("Deviations from x̄", dev.map((d) => sF(d)).join(", "), "They add to 0, which checks the mean."),
        row("Squared deviations, Σ", sF(ss), dev.map((d) => sF(d * d)).join(" + ")),
        row("Sample variance s²", sF(s2), `${sF(ss)} / ${n - 1}. Sample, so divide by n − 1.`, true),
        row("Sample SD s", sF(Math.sqrt(s2)), `√${sF(s2)}`, true),
        row("Shortcut check", sF((sx2 - (S * S) / n) / (n - 1)), `[Σx² − (Σx)²/n] / (n − 1) = (${sF(sx2)} − ${sF((S * S) / n)}) / ${n - 1}`),
        row("If the question says population", `${sF(ss / n)} and σ = ${sF(Math.sqrt(ss / n))}`, `Divide by n = ${n} instead.`),
        row("Mean vs median", m < med ? "Mean below median: maybe a left tail" : m > med ? "Mean above median: maybe a right tail" : "Equal", "The mean chases a tail; the median does not move. A hint about shape, not proof: plot it to be sure."),
      ],
    };
  },
};

/** In the order the Solve page numbers them. */
export const SOLVERS: Solver[] = [tree, draws, events, trials, poisson, normal, samp, ci, test, bday, data];
const BY_ID = new Map(SOLVERS.map((s) => [s.id, s]));
export const solverById = (id: SolverId) => BY_ID.get(id)!;
/** Starting values: every field's default. */
export const defaults = (s: Solver): Values => Object.fromEntries(s.fields.map((f) => [f.k, f.v]));

/** The plain-text "Copy work": title, what was given (select labels, not codes), then each answer with its why. */
export function copyText(s: Solver, values: Values, r: Answers) {
  const given = s.fields
    .filter((f) => String(values[f.k]).trim())
    .map((f) => {
      let val = values[f.k];
      if (f.opts) {
        const o = f.opts.find((x) => x[0] === val);
        val = o ? o[1] : val;
      }
      return `${f.l}: ${val}`;
    })
    .join("; ");
  return `${s.title}\nGiven: ${given}\n\n${r.rows.map((x) => `${x.q} = ${x.a}${x.w ? `\n   ${x.w}` : ""}`).join("\n")}`;
}
