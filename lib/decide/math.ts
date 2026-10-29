/**
 * The math behind /decide. Pure functions, no imports, so a plain `node` script can load this file
 * and check every number the page shows.
 *
 * Conventions, stated once:
 * - Bookmaker's margin is the overround: the implied chances of both sides added up, minus 100%.
 *   (-110 / -110 adds to 104.76%, so the margin is 4.76%.)
 * - Option time is calendar days over 365.
 * - Option odds use a lognormal model with no drift (rate 0), the risk-neutral approximation.
 * - A test result: chances are per case tested; the 1,000 grid rounds by largest remainder so it always adds to 1,000.
 * - Warranty: expected cost is over the whole plan. With the plan you pay its price, plus the deductible if the bad thing happens.
 * - Goal: monthly steps. Each month the balance grows by a lognormal factor whose average is (1 + yearly return)^(1/12),
 *   then the monthly saving is added at the end of the month. "Reaching the goal" means at the end of the last year.
 * - A/B test: the z test pools both groups; the 95% range for the difference does not (the usual textbook pair).
 *   Sample size is per version, two-sided 5% level, 80% power.
 * - Staffing: arrivals in one hour are Poisson. Overload means more arrive in the hour than the team can serve in it.
 */

/* ---------------- shared ---------------- */

/** Normal CDF, the same approximation the rest of the site uses (Abramowitz and Stegun 7.1.26). */
export function Phi(z: number) {
  const s = z < 0 ? -1 : 1;
  const x = Math.abs(z) / Math.SQRT2;
  const t = 1 / (1 + 0.3275911 * x);
  const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
  return 0.5 * (1 + s * y);
}

/** Percentile of a sorted array, linear between neighbours. */
export function pctile(sorted: ArrayLike<number>, q: number) {
  const n = sorted.length;
  if (!n) return NaN;
  const i = (n - 1) * q;
  const lo = Math.floor(i);
  const hi = Math.ceil(i);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (i - lo);
}

/** Reads what people type: "95,000", "$1,200", "+150", "−110" (a typed minus sign), "2.5". NaN if it is not a number. */
export function readNumber(text: string) {
  const t = text.replace(/[\s,$¢%]/g, "").replace(/[\u2212\u2012\u2013\u2014]/g, "-");
  if (!/^[-+]?(\d+\.?\d*|\.\d+)$/.test(t)) return NaN;
  return Number(t);
}

/* ---------------- 1. Monte Carlo between options ---------------- */

/**
 * One draw from a triangular distribution with low a, most likely c and high b, from a uniform u in [0, 1).
 * This is the inverse of its CDF: below the peak the area grows like a square, so the draw uses a square root.
 */
export function triangular(a: number, c: number, b: number, u: number) {
  if (b <= a) return a;
  const f = (c - a) / (b - a);
  return u < f ? a + Math.sqrt(u * (b - a) * (c - a)) : b - Math.sqrt((1 - u) * (b - a) * (b - c));
}

/** Exact mean of a triangular distribution. */
export const triMean = (a: number, c: number, b: number) => (a + b + c) / 3;

/** Exact chance a triangular draw lands below x. */
export function triCdf(a: number, c: number, b: number, x: number) {
  if (x <= a) return 0;
  if (x >= b) return 1;
  if (x <= c) return ((x - a) ** 2) / ((b - a) * (c - a));
  return 1 - ((b - x) ** 2) / ((b - a) * (b - c));
}

export type Range = { worst: number; likely: number; best: number };

/** Low, peak and high of a range, whichever way round worst and best were typed. */
export function bounds(r: Range) {
  return { lo: Math.min(r.worst, r.best), mode: r.likely, hi: Math.max(r.worst, r.best) };
}

/** The likely value has to sit between worst and best. */
export function rangeOk(r: Range) {
  const { lo, mode, hi } = bounds(r);
  return [r.worst, r.likely, r.best].every(Number.isFinite) && mode >= lo && mode <= hi;
}

/**
 * Who comes out on top in draw i: the index with the best value, ties split evenly.
 * Adds to `wins` in place. `higher` says whether a bigger number is better.
 */
export function scoreDraw(values: number[], higher: boolean, wins: number[]) {
  let best = higher ? -Infinity : Infinity;
  for (const v of values) best = higher ? Math.max(best, v) : Math.min(best, v);
  const top = values.reduce((n, v) => n + (v === best ? 1 : 0), 0);
  values.forEach((v, k) => {
    if (v === best) wins[k] += 1 / top;
  });
}

/* ---------------- 2. A bet ---------------- */

export type OddsFormat = "american" | "decimal" | "fractional";

/** Decimal odds (what $1 returns, stake included) from American odds. -110 → 1.909, +150 → 2.5. */
export function americanToDecimal(a: number) {
  if (!Number.isFinite(a) || Math.abs(a) < 100) return NaN;
  return a > 0 ? 1 + a / 100 : 1 + 100 / -a;
}

/** Decimal odds from a fraction like "3/2" or "10/11" (profit over stake). A bare number counts as n/1. */
export function fractionalToDecimal(text: string) {
  const m = text.trim().match(/^(\d+(?:\.\d+)?)\s*(?:\/|-|to|:)\s*(\d+(?:\.\d+)?)$/i);
  const n = m ? Number(m[1]) : readNumber(text);
  const d = m ? Number(m[2]) : 1;
  if (!(n > 0) || !(d > 0)) return NaN;
  return 1 + n / d;
}

/** Decimal odds from whatever the person typed, in the chosen format. */
export function toDecimal(format: OddsFormat, text: string) {
  if (format === "american") return americanToDecimal(readNumber(text));
  if (format === "fractional") return fractionalToDecimal(text);
  const d = readNumber(text);
  return d > 1 ? d : NaN;
}

/** The chance the odds imply, margin included: the break-even chance for the bet. */
export const impliedFromDecimal = (d: number) => 1 / d;

/** Back the other way, for showing a line in another format. */
export function decimalToAmerican(d: number) {
  if (!(d > 1)) return NaN;
  return d >= 2 ? Math.round((d - 1) * 100) : Math.round(-100 / (d - 1));
}

/** A tidy fraction for decimal odds, by continued fractions with small numbers (1.909 → 10/11). */
export function decimalToFractional(d: number) {
  if (!(d > 1)) return "";
  const x = d - 1;
  let [h0, h1, k0, k1] = [0, 1, 1, 0];
  let v = x;
  for (let i = 0; i < 12; i++) {
    const a = Math.floor(v);
    [h0, h1] = [h1, a * h1 + h0];
    [k0, k1] = [k1, a * k1 + k0];
    if (Math.abs(h1 / k1 - x) < 0.005 || v - a < 1e-9 || k1 > 100) break;
    v = 1 / (v - a);
  }
  return `${h1}/${k1}`;
}

/** Show a decimal line in a format, as text someone could type back in. */
export function formatOdds(format: OddsFormat, d: number) {
  if (!(d > 1)) return "";
  if (format === "decimal") return d.toFixed(2).replace(/\.?0+$/, "") || "1";
  if (format === "fractional") return decimalToFractional(d);
  const a = decimalToAmerican(d);
  return a > 0 ? `+${a}` : String(a);
}

/** Both sides' implied chances added up, and the margin: how far past 100% they go. */
export function overround(pA: number, pB: number) {
  const book = pA + pB;
  return { book, margin: book - 1, fairA: pA / book, fairB: pB / book, hold: 1 - 1 / book };
}

/** Expected profit on a $100 stake at decimal odds d if the real chance is p. */
export const evPer100 = (p: number, d: number) => p * (d - 1) * 100 - (1 - p) * 100;

/** Kelly fraction: the share of your bankroll the growth-maximizing bettor stakes. 0 means no bet. */
export function kelly(p: number, d: number) {
  const b = d - 1;
  if (!(b > 0)) return 0;
  return Math.max(0, (b * p - (1 - p)) / b);
}

/* ---------------- 3. A prediction market price ---------------- */

/**
 * A contract pays 100 cents if the event happens. Buying Yes at `price` cents with `fee` cents per contract,
 * when your chance is p, earns 100p − price − fee cents on average.
 */
export const marketEvYes = (p: number, price: number, fee: number) => 100 * p - price - fee;
/** The No side at 100 − price, same fee. */
export const marketEvNo = (p: number, price: number, fee: number) => 100 * (1 - p) - (100 - price) - fee;
/** The chance you need for Yes to break even, fees included. */
export const marketBreakEven = (price: number, fee: number) => (price + fee) / 100;

/* ---------------- 4. An options trade ---------------- */

/** Years from calendar days. */
export const years = (days: number) => days / 365;

/** The rule of thumb for a one standard deviation move by expiry: price × volatility × √(time in years). */
export const oneSdMove = (S: number, sigma: number, days: number) => S * sigma * Math.sqrt(years(days));

/**
 * Chance the stock finishes above K at expiry, lognormal with no drift:
 * ln(S_T) is normal with mean ln(S) − σ²T/2 and spread σ√T, so P(S_T > K) = Φ(d2),
 * d2 = (ln(S/K) − σ²T/2) / (σ√T).
 */
export function probAbove(S: number, K: number, sigma: number, days: number) {
  const T = years(days);
  if (!(S > 0) || !(K > 0) || !(sigma > 0) || !(T > 0)) return NaN;
  const sd = sigma * Math.sqrt(T);
  return Phi((Math.log(S / K) - (sigma * sigma * T) / 2) / sd);
}

/** The price at expiry where the trade gets its premium back. */
export const breakeven = (kind: "call" | "put", K: number, premium: number) => (kind === "call" ? K + premium : K - premium);

/** Lognormal density of the price at expiry, for drawing the curve. */
export function priceDensity(x: number, S: number, sigma: number, days: number) {
  const T = years(days);
  const sd = sigma * Math.sqrt(T);
  if (!(x > 0) || !(sd > 0)) return 0;
  const m = Math.log(S) - (sigma * sigma * T) / 2;
  return Math.exp(-((Math.log(x) - m) ** 2) / (2 * sd * sd)) / (x * sd * Math.sqrt(2 * Math.PI));
}

/** Black-Scholes price with rate 0, only to keep the example premiums honest. */
export function modelPrice(kind: "call" | "put", S: number, K: number, sigma: number, days: number) {
  const T = years(days);
  const sd = sigma * Math.sqrt(T);
  const d1 = (Math.log(S / K) + (sigma * sigma * T) / 2) / sd;
  const d2 = d1 - sd;
  return kind === "call" ? S * Phi(d1) - K * Phi(d2) : K * Phi(-d2) - S * Phi(-d1);
}

/* ---------------- 5. A test result (base rates, Bayes) ---------------- */

/**
 * The four groups as shares of everyone tested, for a thing with base rate `base`, a test that catches it with chance `catches`
 * and false-alarms with chance `falseAlarm` (all 0 to 1), and the two chances people actually want.
 */
export function testResult(base: number, catches: number, falseAlarm: number) {
  const tp = base * catches;
  const fn = base * (1 - catches);
  const fp = (1 - base) * falseAlarm;
  const tn = (1 - base) * (1 - falseAlarm);
  const pos = tp + fp;
  const neg = fn + tn;
  return { tp, fn, fp, tn, pos, neg, realIfPos: pos > 0 ? tp / pos : NaN, realIfNeg: neg > 0 ? fn / neg : NaN, falseShare: pos > 0 ? fp / pos : NaN };
}

/** Whole counts from shares that add to 1, rounded by largest remainder so they add to exactly n. */
export function wholeCounts(shares: number[], n: number) {
  const raw = shares.map((s) => s * n);
  const out = raw.map(Math.floor);
  let left = n - out.reduce((a, b) => a + b, 0);
  const order = raw.map((r, i) => [r - Math.floor(r), i] as const).sort((a, b) => b[0] - a[0]);
  for (let j = 0; left > 0 && j < order.length; j++, left--) out[order[j][1]]++;
  return out;
}

/* ---------------- 6. A warranty or insurance ---------------- */

/**
 * Expected cost of each choice over the plan. Skip it: the chance times the loss. Buy it: the price,
 * plus the deductible when the bad thing happens. Break-even is the chance where the two are equal.
 */
export function warranty(price: number, chanceOf: number, loss: number, deductible = 0) {
  const skip = chanceOf * loss;
  const buy = price + chanceOf * deductible;
  const covered = loss - deductible;
  // times: the price over the average loss the plan pays for, the plan's markup. 2 means you pay $2 for every $1 it pays out on average.
  const avgPaid = chanceOf * covered;
  return { skip, buy, extra: buy - skip, breakEven: covered > 0 ? price / covered : Infinity, times: avgPaid > 0 ? price / avgPaid : Infinity };
}

/* ---------------- 7. A savings goal ---------------- */

/** One standard normal draw from two uniforms (Box-Muller). `rand` returns a number in [0, 1). */
export function randn(rand: () => number) {
  let u = 0;
  while (u === 0) u = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand());
}

/** Monthly log-return mean and spread for a yearly return r and yearly volatility sigma, so the average monthly factor is (1 + r)^(1/12). */
export function monthlyStep(r: number, sigma: number) {
  const sd = sigma / Math.sqrt(12);
  return { mu: Math.log(1 + r) / 12 - (sd * sd) / 2, sd };
}

/**
 * One possible future, month by month: grow, then add the monthly saving. Writes the balance at the start and at
 * each year end into `out` from `at` (years + 1 numbers) and returns the final balance.
 */
export function goalPath(start: number, monthly: number, years: number, mu: number, sd: number, rand: () => number, out?: Float64Array, at = 0) {
  let w = start;
  if (out) out[at] = w;
  for (let y = 1; y <= years; y++) {
    for (let m = 0; m < 12; m++) w = w * Math.exp(mu + sd * randn(rand)) + monthly;
    if (out) out[at + y] = w;
  }
  return w;
}

/** The exact average final balance, for checking the simulation: start grown at r, plus each month's saving grown for the months left. */
export function goalMean(start: number, monthly: number, years: number, r: number) {
  const n = years * 12;
  const g = (1 + r) ** (1 / 12);
  return start * (1 + r) ** years + (Math.abs(g - 1) < 1e-12 ? monthly * n : (monthly * (g ** n - 1)) / (g - 1));
}

/** What you put in by the end of each year, start included. */
export const putIn = (start: number, monthly: number, year: number) => start + monthly * 12 * year;

/* ---------------- 8. An A/B test ---------------- */

/** Two-sided z values used below: 95% (1.96) and 80% power (0.84). */
export const Z95 = 1.959964;
export const Z80 = 0.841621;

/**
 * Rates, lift, the pooled two-proportion z test and its two-sided p-value, and the unpooled 95% range for B − A.
 * p uses 2·Φ(−|z|) so small p-values keep their digits.
 */
export function abTest(nA: number, xA: number, nB: number, xB: number) {
  const pA = xA / nA;
  const pB = xB / nB;
  const diff = pB - pA;
  const pool = (xA + xB) / (nA + nB);
  const sePool = Math.sqrt(pool * (1 - pool) * (1 / nA + 1 / nB));
  const z = sePool > 0 ? diff / sePool : 0;
  const p = sePool > 0 ? Math.min(1, Math.max(0, 2 * Phi(-Math.abs(z)))) : 1;
  // When a rate is 0% or 100% the usual range collapses to zero width. Then use the plus-four range
  // (Agresti and Caffo): one success and one failure added to each version.
  const edge = xA === 0 || xA === nA || xB === 0 || xB === nB;
  const [a4, b4] = edge ? [(xA + 1) / (nA + 2), (xB + 1) / (nB + 2)] : [pA, pB];
  const se = edge ? Math.sqrt((a4 * (1 - a4)) / (nA + 2) + (b4 * (1 - b4)) / (nB + 2)) : Math.sqrt((pA * (1 - pA)) / nA + (pB * (1 - pB)) / nB);
  const mid = b4 - a4;
  return { pA, pB, diff, lift: pA > 0 ? diff / pA : NaN, z, p, se, lo: Math.max(-1, mid - Z95 * se), hi: Math.min(1, mid + Z95 * se) };
}

/**
 * The z test above needs enough of both outcomes. Under "no difference", each version should expect
 * at least 5 who did it and 5 who didn't; below that the p-value and range are not trustworthy.
 */
export function abTooSmall(nA: number, xA: number, nB: number, xB: number) {
  const pool = (xA + xB) / (nA + nB);
  return Math.min(nA * pool, nA * (1 - pool), nB * pool, nB * (1 - pool)) < 5;
}

/** Visitors needed in each version to detect a change from pA to pB 80% of the time at the two-sided 5% level. */
export function abSampleSize(pA: number, pB: number) {
  if (!(pA !== pB)) return Infinity;
  const bar = (pA + pB) / 2;
  const top = Z95 * Math.sqrt(2 * bar * (1 - bar)) + Z80 * Math.sqrt(pA * (1 - pA) + pB * (1 - pB));
  return Math.ceil((top * top) / (pB - pA) ** 2);
}

/* ---------------- 9. Staffing ---------------- */

/** Chance of exactly k arrivals in an hour when lam arrive on average. Terms are built by multiplying, so it works up to lam ≈ 700. */
export function poissonPmf(k: number, lam: number) {
  if (k < 0 || !(lam > 0)) return k === 0 ? 1 : 0;
  let t = Math.exp(-lam);
  for (let i = 1; i <= k; i++) t *= lam / i;
  return t;
}

/** Chance of k or fewer arrivals. */
export function poissonCdf(k: number, lam: number) {
  if (k < 0) return 0;
  if (!(lam > 0)) return 1;
  let t = Math.exp(-lam);
  let sum = t;
  for (let i = 1; i <= k; i++) {
    t *= lam / i;
    sum += t;
  }
  return Math.min(1, sum);
}

/** Chance of more than k arrivals. Past the average it adds up the tail itself, so tiny chances keep their digits. */
export function poissonOver(k: number, lam: number) {
  if (!(lam > 0)) return 0;
  if (k < 0) return 1;
  if (k < lam) return Math.max(0, 1 - poissonCdf(k, lam));
  let t = poissonPmf(k, lam);
  let tail = 0;
  for (let i = k + 1; i < k + 100000; i++) {
    t *= lam / i;
    tail += t;
    if (t <= tail * 1e-17) break;
  }
  return tail;
}

/** Smallest k with at least a share q of hours at or below it. */
export function poissonQuantile(q: number, lam: number) {
  let t = Math.exp(-lam);
  let sum = t;
  let k = 0;
  while (sum < q && k < 100000) {
    k++;
    t *= lam / k;
    sum += t;
  }
  return k;
}

/** How many a team of `staff` can serve in an hour: whole people only. */
export const capacity = (staff: number, perPerson: number) => Math.floor(staff * perPerson + 1e-9);

/** Chance an hour brings more than `staff` people can serve. */
export const overload = (lam: number, perPerson: number, staff: number) => poissonOver(capacity(staff, perPerson), lam);

/** The fewest staff that keep the overload chance at or under `target`, up to `max`. NaN if none do. */
export function fewestStaff(lam: number, perPerson: number, target: number, max = 200) {
  for (let s = 1; s <= max; s++) if (overload(lam, perPerson, s) <= target) return s;
  return NaN;
}

/* ---------------- running in frames ---------------- */

/**
 * Runs `step(from, to)` over `total` items, `slice` per animation frame, so the page never freezes.
 * Returns a cancel function. `onFrame` runs after each slice, `onDone` once at the end.
 */
export function inFrames(total: number, slice: number, step: (from: number, to: number) => void, onFrame: (done: number) => void, onDone: () => void) {
  let i = 0;
  let id = 0;
  let stopped = false;
  const tick = () => {
    if (stopped) return;
    const to = Math.min(total, i + slice);
    step(i, to);
    i = to;
    onFrame(i);
    if (i < total) id = requestAnimationFrame(tick);
    else onDone();
  };
  id = requestAnimationFrame(tick);
  return () => {
    stopped = true;
    cancelAnimationFrame(id);
  };
}
