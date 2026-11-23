import DATA from "@/lib/play/data/drawit.json";

/**
 * "What happens next?" (home page): a real series with its last stretch hidden. You draw the rest, then
 * see the real line and how a plain rule did. Data: lib/play/data/drawit.json, written by
 * scripts/fetch-drawit.ts from Tickerz's public history files. The window slides as new numbers come in.
 */

export type Rule = "season" | "season-drift" | "median";

export type RoundDef = {
  id: string;
  ticker: keyof typeof DATA.series;
  name: string;
  /** For screen readers only: what the line counts. */
  unit: string;
  /** Points shown plus hidden, counted back from the newest. */
  window: number;
  hide: number;
  /** Points in a year. */
  period: number;
  rule: Rule;
  /** One or two words: the dashed line's name. */
  ruleName: string;
  /** Where Tickerz reads it, for the logo link's label. */
  source: string;
  /** Page on tickerz.com for this number. */
  slug: string;
  /** What the real line shows, one short line. */
  idea: string;
  fmt: (v: number) => string;
};

const k = (v: number) => (Math.abs(v) >= 10_000 ? `${Math.round(v / 1000)}k` : Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(1)}k` : `${Math.round(v)}`);

/** Four series with a shape you can feel. Each must be true and fun to draw. */
export const ROUNDS: RoundDef[] = [
  {
    id: "fireworks",
    ticker: "BOOM",
    name: "NYC fireworks",
    unit: "fireworks complaints to 311 a month",
    window: 71,
    hide: 12,
    period: 12,
    rule: "season",
    ruleName: "Last year",
    source: "NYC 311",
    slug: "boom",
    idea: "Every July, about the same as last July. That's a season.",
    fmt: k,
  },
  {
    id: "co2",
    ticker: "PPM",
    name: "CO\u2082 in the air",
    unit: "parts per million at Mauna Loa, monthly",
    window: 96,
    hide: 24,
    period: 12,
    rule: "season-drift",
    ruleName: "Last year + rise",
    source: "NOAA",
    slug: "ppm",
    idea: "Up every year, down every summer. A trend plus a season.",
    fmt: (v) => v.toFixed(0),
  },
  {
    id: "seaice",
    ticker: "ICE",
    name: "Arctic sea ice",
    unit: "million square kilometres, monthly average",
    window: 48,
    hide: 12,
    period: 12,
    rule: "season",
    ruleName: "Last year",
    source: "NSIDC",
    slug: "ice",
    idea: "Lowest every September. Last year beats any straight line.",
    fmt: (v) => v.toFixed(0),
  },
  {
    id: "potholes",
    ticker: "POTHOLE",
    name: "Chicago potholes",
    unit: "complaints to 311 a month",
    window: 62,
    hide: 12,
    period: 12,
    rule: "season",
    ruleName: "Last year",
    source: "Chicago 311",
    slug: "pothole",
    idea: "Freeze, crack, complain, every spring. Same timing, bigger size.",
    fmt: k,
  },
];

export type Round = RoundDef & { labels: string[]; values: number[]; known: number[]; actual: number[] };

/** The round's window from the newest data: what is shown (`known`) and what is hidden (`actual`). */
export function buildRound(def: RoundDef, series: [string, number][] = DATA.series[def.ticker].points as [string, number][]): Round {
  const pts = series.slice(-def.window);
  const values = pts.map((p) => p[1]);
  const cut = values.length - def.hide;
  return { ...def, labels: pts.map((p) => p[0]), values, known: values.slice(0, cut), actual: values.slice(cut) };
}

const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

/**
 * The plain rule's forecast for the hidden points, from the shown points only.
 * season: the same point a year earlier (its own forecast when that is hidden too).
 * season-drift: the same, plus the average rise from one year to the next.
 * median: the median of the shown points.
 */
export function ruleForecast(known: number[], hide: number, rule: Rule, period: number): number[] {
  if (rule === "median") return Array(hide).fill(median(known));
  const all = [...known];
  let drift = 0;
  if (rule === "season-drift" && known.length >= 2 * period) {
    const n = known.length;
    const last = known.slice(n - period).reduce((a, b) => a + b, 0) / period;
    const prev = known.slice(n - 2 * period, n - period).reduce((a, b) => a + b, 0) / period;
    drift = last - prev;
  }
  for (let i = 0; i < hide; i++) {
    const back = all.length - period;
    all.push(back >= 0 ? all[back] + drift : all[all.length - 1]);
  }
  return all.slice(known.length);
}

export function rmse(a: number[], b: number[]) {
  return Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0) / a.length);
}

/** 0 to 100: 100 is the real line exactly; an error half the chart's height or more is 0. */
export function score(guess: number[], actual: number[], range: number) {
  if (!(range > 0)) return 0;
  return Math.max(0, Math.min(100, Math.round(100 * (1 - (2 * rmse(guess, actual)) / range))));
}

/**
 * Drawing: set hidden point `to.i` to `to.v` and fill every point between it and `from` with a straight line,
 * so a fast swipe leaves no gaps. Index -1 is the last shown point. Returns a new array.
 */
export function drawTo(guess: (number | null)[], from: { i: number; v: number }, to: { i: number; v: number }): (number | null)[] {
  const out = [...guess];
  const lo = Math.min(from.i, to.i);
  const hi = Math.max(from.i, to.i);
  for (let i = Math.max(0, lo); i <= hi; i++) {
    const t = hi === lo ? 1 : (i - from.i) / (to.i - from.i);
    out[i] = from.v + (to.v - from.v) * t;
  }
  return out;
}

/** The point to draw from when a stroke starts at `i`: the nearest filled point before it, or the last shown one. */
export function anchorFor(guess: (number | null)[], i: number, last: number) {
  for (let j = i - 1; j >= 0; j--) if (guess[j] != null) return { i: j, v: guess[j] as number };
  return { i: -1, v: last };
}

/** Today's round, the same for everyone on the same day. */
export function roundOfDay(day: string, n = ROUNDS.length) {
  let h = 0;
  for (const ch of day) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h % n;
}

/** "You beat last year." / "Dead even." / "Last year wins." */
export function verdict(you: number, rule: number, ruleName: string) {
  if (you > rule) return `You beat ${ruleName.toLowerCase()}.`;
  if (you >= rule - 5) return "Dead even.";
  return `${ruleName} wins.`;
}

/** "Jul 2026" for a month, "Jan 10, 2026" for a week. */
export function periodText(label: string) {
  const [y, m, d] = label.split("-").map(Number);
  const month = new Date(Date.UTC(y, m - 1, d || 1)).toLocaleString("en-US", { month: "short", timeZone: "UTC" });
  return d ? `${month} ${d}, ${y}` : `${month} ${y}`;
}
