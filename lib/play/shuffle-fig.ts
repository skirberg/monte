/**
 * The shapes the Shuffle's reveal draws (components/play/shuffle-work.tsx). Pure functions, so a test can hold
 * each picture to the numbers the work writes: a curve's area is one, a skewed shape keeps the mean and SD it was
 * given, a range is as wide as its margin.
 */

export type Pdf = (x: number) => number;

export const normal = (mu: number, sd: number): Pdf => (x) => Math.exp(-(((x - mu) / sd) ** 2) / 2) / (sd * Math.sqrt(2 * Math.PI));

/** A gamma shape with this mean and SD (right-skewed, starts at 0). Unnormalized: `sample` scales it to area one. */
export const gamma = (mean: number, sd: number): Pdf => {
  const k = (mean / sd) ** 2, theta = (sd * sd) / mean;
  return (x) => (x <= 0 ? 0 : Math.exp((k - 1) * Math.log(x) - x / theta));
};

/** A lognormal shape with this mean and SD (a longer right tail than the gamma's). Unnormalized. */
export const lognormal = (mean: number, sd: number): Pdf => {
  const s2 = Math.log(1 + (sd / mean) ** 2), m = Math.log(mean) - s2 / 2;
  return (x) => (x <= 0 ? 0 : Math.exp(-((Math.log(x) - m) ** 2) / (2 * s2)) / x);
};

/** `f` on `count` even steps from lo to hi, scaled so the area under it is one. */
export function sample(f: Pdf, lo: number, hi: number, count = 140): [number, number][] {
  const dx = (hi - lo) / (count - 1);
  const pts: [number, number][] = Array.from({ length: count }, (_, i) => [lo + i * dx, f(lo + i * dx)]);
  let area = 0;
  for (let i = 1; i < count; i++) area += ((pts[i][1] + pts[i - 1][1]) / 2) * dx;
  return area > 0 ? pts.map(([x, y]) => [x, y / area]) : pts;
}

/** The mean and SD of a sampled shape (trapezoids), to check a skewed shape kept what it was given. */
export function moments(pts: [number, number][]) {
  let m0 = 0, m1 = 0, m2 = 0;
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i][0] - pts[i - 1][0];
    for (const [x, y] of [pts[i - 1], pts[i]]) {
      m0 += (y * dx) / 2;
      m1 += (x * y * dx) / 2;
      m2 += (x * x * y * dx) / 2;
    }
  }
  const mean = m1 / m0;
  return { area: m0, mean, sd: Math.sqrt(m2 / m0 - mean * mean) };
}

/** Where the dots of a thousand go: the flagged who have it, those who have it and slip through, the false alarms, the rest. */
export function crowd(per: number, sick: number, hit: number, fa: number) {
  return Array.from({ length: per }, (_, i) => (i < hit ? "hit" : i < sick ? "miss" : i < sick + fa ? "false" : "rest") as "hit" | "miss" | "false" | "rest");
}

/** None, one at a time: what is left before each, and what goes wrong at each. Their sum is at least one. */
export function chain(p: number, n: number) {
  return Array.from({ length: n }, (_, i) => {
    const left = (1 - p) ** i;
    return { left, lost: left * p };
  });
}

/** The doors' chance as grains: 2 per door to start, the opened doors' grains shared among the closed ones. */
export function doorGrains(v: number, opened: number) {
  const left = v - 1 - opened;
  const yours = 2, each = (2 * v - 2) / left;
  return Array.from({ length: v }, (_, d) => (d === 0 ? yours : d <= left ? each : 0));
}
