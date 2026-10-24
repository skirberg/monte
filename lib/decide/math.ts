/**
 * The math behind /decide. Pure functions, no imports, so a plain `node` script can load this file
 * and check every number the page shows.
 *
 * Conventions, stated once:
 * - Bookmaker's margin is the overround: the implied chances of both sides added up, minus 100%.
 *   (-110 / -110 adds to 104.76%, so the margin is 4.76%.)
 * - Option time is calendar days over 365.
 * - Option odds use a lognormal model with no drift (rate 0), the risk-neutral approximation.
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
