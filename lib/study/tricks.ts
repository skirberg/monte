import { DATA } from "./data";
import { Phi, fmt, mean, median, pick, plural, r2, r3, ri } from "./math";

// Quick math: mental-math tricks that save minutes on an exam, each with its own generator.
// Level 1 is easy, 2 is exam pace, 3 is hard; `lv` picks the value for the level.

export type Level = 1 | 2 | 3;
export type TrickCat = "pct" | "mul" | "sq" | "stats" | "frac" | "z" | "est";
/** A quick-math question. `loose` answers count within 15% (estimates, roots). */
export type MathQ = { q: string; a: number; h: string; loose?: boolean };
export type Trick = { id: string; name: string; how: string; ex: string; cat: TrickCat; g: (lv: Level) => MathQ };

const M = DATA.math;
const L = <T,>(lv: Level, a: T, b: T, c: T) => (lv === 1 ? a : lv === 2 ? b : c);

export const TRICKS: Trick[] = [
  {
    id: "pctswap", name: "Swap the percent", how: "a% of b equals b% of a. Pick whichever is easier.", ex: "8% of 25 = 25% of 8 = 2", cat: "pct",
    g: (lv) => {
      const a = pick(L(lv, [4, 5, 8, 10], [12, 15, 16, 25], [14, 18, 35, 45])), b = pick(L(lv, [25, 50, 100, 200], [75, 80, 120, 250], [64, 140, 350, 480]));
      return { q: `${a}% of ${b}`, a: (a * b) / 100, h: `Swap it: ${b}% of ${a}, which is ${b / 100} × ${a}` };
    },
  },
  {
    id: "ladder", name: "Percent ladder", how: "Find 10% by moving the decimal, halve it for 5%, take a tenth of it for 1%, then add the pieces.", ex: "17% of 340: 34 + 17 + 6.8 = 57.8", cat: "pct",
    g: (lv) => {
      const p = pick(L(lv, [5, 10, 15, 20], [15, 17, 22, 35], [13, 23, 37, 47])), n = pick(L(lv, [60, 120, 240, 400], [340, 260, 180, 480], [730, 910, 1240, 660]));
      return { q: `${p}% of ${n}`, a: (p * n) / 100, h: `10% = ${n / 10}, 5% = ${n / 20}, 1% = ${n / 100}. Build ${p}% from those.` };
    },
  },
  {
    id: "x5", name: "Times 5, 25, 50", how: "× 5 is half of × 10. × 25 is a quarter of × 100. × 50 is half of × 100.", ex: "48 × 25 = 4,800 ÷ 4 = 1,200", cat: "mul",
    g: (lv) => {
      const m = pick([5, 25, 50]), a = pick(L(lv, [12, 14, 16, 18, 22, 24], [28, 36, 44, 48, 64, 72], [76, 84, 96, 124, 132, 148]));
      return { q: `${a} × ${m}`, a: a * m, h: m === 5 ? `Half of ${a * 10}` : m === 25 ? `A quarter of ${a * 100}` : `Half of ${a * 100}` };
    },
  },
  {
    id: "d5", name: "Divide by 5", how: "Double it, then divide by 10.", ex: "135 ÷ 5 = 270 ÷ 10 = 27", cat: "mul",
    g: (lv) => {
      const c = pick(L(lv, [45, 65, 85, 115], [135, 175, 245, 315], [485, 635, 715, 895]));
      return { q: `${c} ÷ 5`, a: c / 5, h: `Double: ${c * 2}. Then ÷ 10.` };
    },
  },
  {
    id: "round", name: "Round, multiply, adjust", how: "Round one number to the nearest 10, multiply, then add or subtract the difference.", ex: "19 × 21 = 20 × 21 − 21 = 399", cat: "mul",
    g: (lv) => {
      const e = pick(L(lv, [9, 11, 19, 21], [29, 31, 39, 41], [49, 51, 59, 61, 99, 101])), f = ri(L(lv, 3, 11, 13), L(lv, 12, 30, 60)), r = Math.round(e / 10) * 10;
      return { q: `${e} × ${f}`, a: e * f, h: `${r} × ${f} = ${r * f}, then ${e < r ? "subtract " : "add "}${Math.abs(e - r) * f}` };
    },
  },
  {
    id: "sq", name: "Squares near a round number", how: "(a + b)² = a² + 2ab + b². Use a = 10, 20, 50, or 100.", ex: "23² = 400 + 120 + 9 = 529", cat: "sq",
    g: (lv) => {
      const a = pick(L(lv, [11, 12, 13, 15, 21, 25], [14, 16, 18, 22, 24, 31, 32], [41, 45, 52, 48, 61, 99, 102])), base = Math.round(a / 10) * 10, b = a - base;
      return { q: `${a}²`, a: a * a, h: `(${base}${b < 0 ? " − " : " + "}${Math.abs(b)})² = ${base * base}${b < 0 ? " − " : " + "}${Math.abs(2 * base * b)} + ${b * b}` };
    },
  },
  {
    id: "sqrt", name: "Square roots by squeezing", how: "Find the two perfect squares around it, then interpolate. Memorize √n for common sample sizes.", ex: "√50: between 7² = 49 and 8² = 64, so about 7.07", cat: "sq",
    g: (lv) => {
      const n = pick(L(lv, [16, 25, 36, 49, 64, 100], [20, 30, 50, 80, 200, 150], [45, 70, 90, 120, 130, 300])), lo = Math.floor(Math.sqrt(n));
      return {
        q: `√${n}, one decimal is fine`,
        a: Math.sqrt(n),
        h: `${lo}² = ${lo * lo} and ${lo + 1}² = ${(lo + 1) * (lo + 1)}. ${n} sits ${Math.round(((n - lo * lo) / (2 * lo + 1)) * 100)}% of the way up.`,
        loose: true,
      };
    },
  },
  {
    id: "meangap", name: "Mean by gaps from a base", how: "Pick a round base, add up the gaps from it, divide by n, and add back to the base.", ex: M.meangapEx, cat: "stats",
    g: (lv) => {
      const n = L(lv, 4, 5, 6), base = pick([50, 70, 100]), arr: number[] = [];
      for (let i = 0; i < n; i++) arr.push(base + ri(-12, 12));
      const gaps = arr.map((x) => x - base);
      return {
        q: `Mean of ${arr.join(", ")}`,
        a: mean(arr),
        h: `Base ${base}. Gaps: ${gaps.map((g) => (g >= 0 ? "+" : "") + g).join(", ")} = ${gaps.reduce((a, b) => a + b, 0)}. Divide by ${n}, add to ${base}.`,
      };
    },
  },
  {
    id: "median", name: "Median in two moves", how: "Sort, then take the middle. With an even count, average the two middles.", ex: "82, 74, 65, 80, 58 → 58, 65, 74, 80, 82 → 74", cat: "stats",
    g: (lv) => {
      const n = L(lv, 5, 6, 7), arr: number[] = [];
      for (let i = 0; i < n; i++) arr.push(ri(40, 99));
      const so = arr.slice().sort((a, b) => a - b);
      return { q: `Median of ${arr.join(", ")}`, a: median(arr), h: `Sorted: ${so.join(", ")}${n % 2 ? `. The middle is position ${(n + 1) / 2}` : `. Average positions ${n / 2} and ${n / 2 + 1}`}` };
    },
  },
  {
    id: "zdist", name: "How many SDs away", how: "(value − mean) ÷ SD. The sign matters. Then the anchors: 1 SD above is about 84% below it, 2 SD above is about 97.7%.", ex: M.zdistEx, cat: "stats",
    g: (lv) => {
      const mu = pick(M.zdistMu), s = pick(L(lv, [10, 20], [15, 16, 25], [12, 18, 35])), k = pick(L(lv, [-2, -1, 1, 2], [-1.5, -0.5, 0.5, 1.5, 2.5], [-1.25, 0.75, 1.75, -2.25])), x = mu + k * s;
      return { q: `Mean ${mu}, SD ${s}. How many SDs is ${x}?`, a: k, h: `(${x} − ${mu}) ÷ ${s} = ${x - mu} ÷ ${s}` };
    },
  },
  {
    id: "frac", name: "Probability fractions", how: "The fractions that show up constantly. Learn them as percents.", ex: "1/6 = 16.7%, 13/52 = 25%, 12/51 = 23.5%, 1/36 = 2.8%", cat: "frac",
    g: (lv) => {
      const f = pick(L(lv, [[1, 4], [1, 2], [3, 4], [1, 5], [13, 52], [1, 6]], [[1, 8], [1, 12], [12, 51], [4, 52], [5, 6], [2, 3]], [[1, 36], [3, 8], [26, 51], [5, 36], [11, 12], [3, 52]]));
      return {
        q: `${f[0]}/${f[1]} as a decimal, 2 places`,
        a: f[0] / f[1],
        h: f[1] === 52 ? `Think cards: ${f[0]} of 52. 13/52 is a quarter.` : f[1] === 51 ? `One card gone: ${f[0]} of 51, just above ${f[0]}/52.` : `1/${f[1]} is ${fmt(r3(1 / f[1]))}; multiply by ${f[0]}`,
      };
    },
  },
  {
    id: "pow", name: "Powers of 0.8 and 0.9", how: "None-of-n questions. Each step drops by 20% or 10%.", ex: M.powEx, cat: "frac",
    g: (lv) => {
      const b = pick(L(lv, [0.5, 0.8, 0.9], [0.7, 0.8, 0.9, 0.95], [0.75, 0.85, 0.95, 0.98])), k = pick(L(lv, [2, 3], [3, 4, 5], [5, 8, 10]));
      return { q: `${b}^${k}, 2 places`, a: b ** k, h: `${b} × ${b} = ${fmt(r3(b * b))}, then keep going ${plural(k - 2, "more time")}. Each step cuts ${Math.round((1 - b) * 100)}%.` };
    },
  },
  {
    id: "e", name: "e to a negative power", how: "Poisson P(0) and the empty-window question. Each step divides by about 2.7.", ex: "e⁻¹ = .37, e⁻² = .135, e⁻³ = .05, e⁻⁴ = .018", cat: "frac",
    g: (lv) => {
      const l = pick(L(lv, [1, 2], [1, 2, 3, 4], [3, 4, 5, 6]));
      return { q: `e^−${l}, 3 places`, a: Math.exp(-l), h: `Start at 1 and divide by 2.7 ${plural(l, "time")}. e^−1 = .37, e^−2 = .135, e^−3 = .05, e^−4 = .018.` };
    },
  },
  {
    id: "z", name: "z anchors", how: "The area to the left of z. Everything else is subtracting from these.", ex: "z = 1 → 84%, 1.645 → 95%, 1.96 → 97.5%, 2 → 97.7%", cat: "z",
    g: (lv) => {
      const z = pick(L(lv, [1, 2, 1.96], [0.5, 1, 1.28, 1.5, 1.645, 1.96, 2], [0.5, 1, 1.28, 1.5, 1.645, 1.96, 2, 2.5, 3]));
      const t = pick(L(lv, ["left", "right"], ["left", "right", "between"], ["left", "right", "between"]));
      const anchor = `Anchor: the area left of ${z} is ${fmt(r3(Phi(z)))}.`;
      if (t === "left") return { q: `Area to the left of z = ${z}, 2 places`, a: Phi(z), h: anchor };
      if (t === "right") return { q: `Area to the right of z = ${z}, 2 places`, a: 1 - Phi(z), h: `${anchor} Right is 1 minus that.` };
      return { q: `Area between z = −${z} and +${z}, 2 places`, a: 2 * Phi(z) - 1, h: `${anchor} Between is 2 × left − 1.` };
    },
  },
  {
    id: "se", name: "Standard error by √n", how: "σ ÷ √n. Use the √n table: √16 = 4, √25 = 5, √36 = 6, √49 = 7, √64 = 8, √100 = 10.", ex: M.seEx, cat: "est",
    g: (lv) => {
      const sg = pick(L(lv, M.seSg[0], M.seSg[1], M.seSg[2])), n = pick(L(lv, [16, 25, 36, 49, 100], [20, 36, 49, 64, 81], [30, 50, 75, 120, 200]));
      return { q: `Standard error: σ = ${sg}, n = ${n}`, a: sg / Math.sqrt(n), h: `√${n} ≈ ${fmt(r2(Math.sqrt(n)))}. Then ${sg} ÷ ${fmt(r2(Math.sqrt(n)))}`, loose: true };
    },
  },
  {
    id: "ball", name: "Ballpark it", how: "Round both numbers to one digit, multiply or divide, then nudge. Anything within 15% counts.", ex: "47 × 62 ≈ 50 × 60 = 3,000 (exactly 2,914)", cat: "est",
    g: (lv) => {
      if (pick(["prod", "div"]) === "prod") {
        const a = ri(L(lv, 11, 17, 23), L(lv, 49, 89, 199)), b = ri(L(lv, 11, 13, 17), L(lv, 29, 67, 99));
        const ra = Math.round(a / 10) * 10, rb = Math.round(b / 10) * 10;
        return { q: `About ${a} × ${b}?`, a: a * b, h: `≈ ${ra} × ${rb} = ${ra * rb}`, loose: true };
      }
      const c = ri(L(lv, 100, 300, 900), L(lv, 900, 2400, 9900)), d = pick(L(lv, [3, 4, 6, 8], [7, 9, 11, 13], [17, 23, 37, 53])), m = Math.round(c / d / 10) * 10;
      return { q: `About ${c} ÷ ${d}?`, a: c / d, h: `${d} × ${m} ≈ ${d * m}, close to ${c}`, loose: true };
    },
  },
];

export const CATS: Record<TrickCat, string> = { pct: "Percents", mul: "Multiply and divide", sq: "Squares and roots", stats: "Stats speed", frac: "Fractions and powers", z: "z anchors", est: "Estimation" };

export const HABITS: [string, string][] = [
  ["Say the trick out loud, then the answer", "Saying 25 × 48 is a quarter of 4,800 builds the pathway. Saying 1,200 alone doesn't."],
  ["Estimate before every calculator step on an exam", "Each problem becomes a free rep, and it catches typos. If the calculator disagrees with your ballpark by 10×, you typed it wrong."],
  ["Two 60-second sprints a day", "Speed comes from many short retrievals spread over days, not one long session."],
  ["One trick per day in Learn mode", "Pick a trick, press Practice, do ten with hints on. Tomorrow, do it in a sprint."],
  ["Level up only above 80%", "Accuracy first. Speed follows once the method is automatic."],
];

/** True when the typed answer is close enough: 15% for estimates, else 2% or 0.006. */
export function mathCorrect(q: MathQ, v: number) {
  const tol = q.loose ? Math.abs(q.a) * 0.15 : Math.max(Math.abs(q.a) * 0.02, 0.006);
  return !Number.isNaN(v) && Math.abs(v - q.a) <= tol;
}
