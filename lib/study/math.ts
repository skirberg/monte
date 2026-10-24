// Numerical helpers for the study app: distributions, tables, formatting. Same approximations the
// original engine used, so every drill answer and solver row comes out the same as before.

/** Abramowitz and Stegun 7.1.26. */
export function erf(x: number) {
  const s = x < 0 ? -1 : 1;
  x = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * x);
  const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
  return s * y;
}
export const Phi = (z: number) => 0.5 * (1 + erf(z / Math.SQRT2));
export function PhiInv(p: number) {
  let lo = -6, hi = 6;
  for (let i = 0; i < 60; i++) {
    const m = (lo + hi) / 2;
    if (Phi(m) < p) lo = m;
    else hi = m;
  }
  return (lo + hi) / 2;
}
export function fact(n: number) {
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}
export function choose(n: number, k: number) {
  if (k < 0 || k > n) return 0;
  let r = 1;
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
  return r;
}
export const binom = (k: number, n: number, p: number) => choose(n, k) * p ** k * (1 - p) ** (n - k);
export const pois = (k: number, l: number) => (Math.exp(-l) * l ** k) / fact(k);

export type Conf = 90 | 95 | 99;
const T: Record<number, Record<Conf, number>> = {
  1: { 90: 6.314, 95: 12.706, 99: 63.657 }, 2: { 90: 2.92, 95: 4.303, 99: 9.925 }, 3: { 90: 2.353, 95: 3.182, 99: 5.841 },
  4: { 90: 2.132, 95: 2.776, 99: 4.604 }, 5: { 90: 2.015, 95: 2.571, 99: 4.032 }, 6: { 90: 1.943, 95: 2.447, 99: 3.707 },
  7: { 90: 1.895, 95: 2.365, 99: 3.499 }, 8: { 90: 1.86, 95: 2.306, 99: 3.355 }, 9: { 90: 1.833, 95: 2.262, 99: 3.25 },
  10: { 90: 1.812, 95: 2.228, 99: 3.169 }, 11: { 90: 1.796, 95: 2.201, 99: 3.106 }, 12: { 90: 1.782, 95: 2.179, 99: 3.055 },
  13: { 90: 1.771, 95: 2.16, 99: 3.012 }, 14: { 90: 1.761, 95: 2.145, 99: 2.977 }, 15: { 90: 1.753, 95: 2.131, 99: 2.947 },
  16: { 90: 1.746, 95: 2.12, 99: 2.921 }, 17: { 90: 1.74, 95: 2.11, 99: 2.898 }, 18: { 90: 1.734, 95: 2.101, 99: 2.878 },
  19: { 90: 1.729, 95: 2.093, 99: 2.861 }, 20: { 90: 1.725, 95: 2.086, 99: 2.845 }, 24: { 90: 1.711, 95: 2.064, 99: 2.797 },
  29: { 90: 1.699, 95: 2.045, 99: 2.756 }, 30: { 90: 1.697, 95: 2.042, 99: 2.75 }, 40: { 90: 1.684, 95: 2.021, 99: 2.704 },
  60: { 90: 1.671, 95: 2.0, 99: 2.66 }, 120: { 90: 1.658, 95: 1.98, 99: 2.617 },
};
export const Z: Record<Conf, number> = { 90: 1.645, 95: 1.96, 99: 2.576 };
/** t critical value from the printed table: the nearest row at or below df, z past 120. */
export function tcrit(df: number, conf: Conf) {
  if (df > 120) return Z[conf];
  const keys = Object.keys(T).map(Number).sort((a, b) => a - b);
  let best = keys[0];
  keys.forEach((k) => {
    if (k <= df) best = k;
  });
  return T[best][conf];
}

export const sum = (a: number[]) => a.reduce((s, x) => s + x, 0);
export const mean = (a: number[]) => sum(a) / a.length;
export function sd(a: number[]) {
  const m = mean(a);
  return Math.sqrt(a.reduce((s, x) => s + (x - m) * (x - m), 0) / (a.length - 1));
}
export function median(a: number[]) {
  const b = a.slice().sort((x, y) => x - y);
  const n = b.length;
  return n % 2 ? b[(n - 1) / 2] : (b[n / 2 - 1] + b[n / 2]) / 2;
}
export const r2 = (x: number) => Math.round(x * 100) / 100;
export const r3 = (x: number) => Math.round(x * 1000) / 1000;
export const r4 = (x: number) => Math.round(x * 10000) / 10000;
export const ri = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
export const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];
/** Four decimal places at most; tiny non-zero values say so instead of showing 0, and big ones get commas. */
export function fmt(x: number) {
  if (x !== 0 && Number.isFinite(x) && Math.abs(x) < 0.00005) return x < 0 ? "> −0.0001" : "< 0.0001";
  const v = Math.round(x * 10000) / 10000;
  return Math.abs(v) >= 10000 ? v.toLocaleString("en-US") : v.toString();
}
export function gauss() {
  const u = 1 - Math.random(), v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
export const stripTags = (s: string) => String(s).replace(/<[^>]+>/g, " ");
/** Content HTML as one line of plain text (descriptions, previews). */
export const plainText = (s: string) => String(s).replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
export const plural = (n: number, w: string) => `${n} ${n === 1 ? w : /(ch|sh|s|x)$/.test(w) ? `${w}es` : `${w}s`}`;
/** A real minus sign before negative numbers in question text. */
export const mt = (s: string) => String(s).replace(/(^|[\s(,=[])-(?=\d)/g, "$1−");
export const shuffle = <T,>(a: T[]) => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/** Parses what a student types: 0.42, 42%, 3/8, 1,200, $40, −2 (any minus sign). NaN when it is not a number. */
export function parseAnswer(raw: string) {
  if (raw.includes("/")) {
    const [a, b] = raw.split("/");
    return parseFloat(a) / parseFloat(b);
  }
  return parseFloat(raw.replace(/[%,$\s]/g, "").replace(/[−–]/g, "-"));
}
/** A local calendar day, YYYY-MM-DD, so streaks and Monte Daily turn over at the student's midnight. */
export function localDay(t: number) {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ---------- t distribution (solvers): log gamma, incomplete beta, t CDF and its inverse
function lgam(x: number) {
  const c = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
  let y = x, t = x + 5.5;
  t -= (x + 0.5) * Math.log(t);
  let s = 1.000000000190015;
  for (let i = 0; i < 6; i++) s += c[i] / ++y;
  return -t + Math.log((2.5066282746310005 * s) / x);
}
function betacf(a: number, b: number, x: number) {
  const qab = a + b, qap = a + 1, qam = a - 1, tiny = 1e-30;
  let c = 1, d = 1 - (qab * x) / qap;
  if (Math.abs(d) < tiny) d = tiny;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= 200; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d; if (Math.abs(d) < tiny) d = tiny;
    c = 1 + aa / c; if (Math.abs(c) < tiny) c = tiny;
    d = 1 / d; h *= d * c;
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d; if (Math.abs(d) < tiny) d = tiny;
    c = 1 + aa / c; if (Math.abs(c) < tiny) c = tiny;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < 3e-12) break;
  }
  return h;
}
function ibeta(a: number, b: number, x: number) {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const bt = Math.exp(lgam(a + b) - lgam(a) - lgam(b) + a * Math.log(x) + b * Math.log(1 - x));
  return x < (a + 1) / (a + b + 2) ? (bt * betacf(a, b, x)) / a : 1 - (bt * betacf(b, a, 1 - x)) / b;
}
export function tcdf(t: number, df: number) {
  const p = 0.5 * ibeta(df / 2, 0.5, df / (df + t * t));
  return t > 0 ? 1 - p : p;
}
export function tinv(p: number, df: number) {
  let lo = -200, hi = 200;
  for (let i = 0; i < 200; i++) {
    const m = (lo + hi) / 2;
    if (tcdf(m, df) < p) lo = m;
    else hi = m;
  }
  return (lo + hi) / 2;
}
