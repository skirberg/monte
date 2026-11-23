import DATA from "@/lib/play/data/drawit.json";
import { ROUNDS, type Round, type RoundDef } from "@/lib/play/drawit";

/**
 * The daily chart (home page, "What happens next?"): one chart a day, the same for everyone, like a daily word
 * game. It is a real stretch of one of the four series with a year (two for CO2) hidden, taken from the past so
 * there are months of different charts. The pick depends only on the date, never on when the data was fetched:
 * each day draws from the stretches that ended a few months before it (`lag`), so a new month of data
 * adds charts for later days and never changes an earlier day's chart.
 */


/** Daily No. 1. */
export const DAILY_START = "2026-11-19";

/**
 * Months shown plus hidden in a daily chart, the first month one may end on, and how many months before the
 * day it must have ended (`lag`): data that late is in every build by then. NOAA posts CO2 about two months on.
 */
const SHAPE: Record<string, { window: number; firstEnd: string; lag: number }> = {
  fireworks: { window: 48, firstEnd: "2024-11", lag: 3 },
  co2: { window: 96, firstEnd: "2017-12", lag: 4 },
  seaice: { window: 48, firstEnd: "2024-11", lag: 3 },
  potholes: { window: 48, firstEnd: "2025-08", lag: 3 },
};

const dayNumber = (day: string) => Date.UTC(+day.slice(0, 4), +day.slice(5, 7) - 1, +day.slice(8, 10)) / 86400000;
const monthIndex = (ym: string) => +ym.slice(0, 4) * 12 + (+ym.slice(5, 7) - 1);
const monthLabel = (i: number) => `${Math.floor(i / 12)}-${String((i % 12) + 1).padStart(2, "0")}`;

/** "2026-11-20" is 2 when "2026-11-19" is 1. */
export const dailyNumber = (day: string) => Math.round(dayNumber(day) - dayNumber(DAILY_START)) + 1;

/** The day before, as YYYY-MM-DD. */
export const dayBefore = (day: string) => addDays(day, -1);

/** A fixed pseudo-random number from two integers, the same on every machine. */
function hash(a: number, b: number) {
  let h = (a * 374761393 + b * 668265263) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
  return (h ^ (h >>> 16)) >>> 0;
}

/**
 * The end month of a series' k-th daily chart, as a month index. A shuffle bag: each appearance picks at random
 * from the stretches not yet used, and only once every one has been used does the bag refill (never with the
 * one just shown). Stretches that become available later join the bag as they arrive. It replays from No. 1,
 * so it depends only on dates.
 */
function endMonth(series: number, k: number, first: number, lag: number) {
  const used = new Set<number>();
  let last = -1;
  for (let j = 0; j <= k; j++) {
    const day = addDays(DAILY_START, j * ROUNDS.length + series);
    const latest = Math.max(first, monthIndex(day.slice(0, 7)) - lag);
    let pool: number[] = [];
    for (let m = first; m <= latest; m++) if (!used.has(m)) pool.push(m);
    if (!pool.length) {
      used.clear();
      for (let m = first; m <= latest; m++) if (m !== last) pool.push(m);
      if (!pool.length) pool = [latest];
    }
    last = pool[hash(series + 1, j) % pool.length];
    used.add(last);
  }
  return last;
}

function addDays(day: string, n: number) {
  return new Date(Date.UTC(+day.slice(0, 4), +day.slice(5, 7) - 1, +day.slice(8, 10) + n)).toISOString().slice(0, 10);
}

export type Daily = Round & { n: number; day: string };

/**
 * The daily chart for a day. The series rotate day by day; within a series the end month walks through its
 * stretches in a spread-out order, so the same series never shows the same year twice in a row.
 */
export function dailyRound(day: string, series: Record<string, [string, number][]> = seriesFromData()): Daily {
  const n = Math.max(1, dailyNumber(day));
  const which = (n - 1) % ROUNDS.length;
  const def: RoundDef = ROUNDS[which];
  const shape = SHAPE[def.id];
  const pts = series[def.ticker];
  const first = monthIndex(shape.firstEnd);
  const want = endMonth(which, Math.floor((n - 1) / ROUNDS.length), first, shape.lag);
  // The end month itself, or the nearest earlier one the data has.
  let end = -1;
  for (let m = want; m >= first - 24 && end < 0; m--) end = pts.findIndex((p) => p[0] === monthLabel(m));
  if (end < 0 || end + 1 < shape.window) end = pts.length - 1;
  const slice = pts.slice(Math.max(0, end + 1 - shape.window), end + 1);
  const values = slice.map((p) => p[1]);
  const cut = values.length - def.hide;
  return { ...def, n, day, window: shape.window, labels: slice.map((p) => p[0]), values, known: values.slice(0, cut), actual: values.slice(cut) };
}

function seriesFromData() {
  return Object.fromEntries(Object.entries(DATA.series).map(([k, v]) => [k, v.points as [string, number][]]));
}

/** Your result on one day's chart, saved so a return visit shows it again and tomorrow can show it as yesterday. */
export type DailyResult = { n: number; you: number; rule: number; guess: number[] };
/** A run of days, one result a day: the daily chart's store (`monte-daily`) and the Shuffle's (`monte-shuffle`). */
export type DayStore<R> = { streak: number; best: number; last: string | null; days: Record<string, R> };
export type DailyStore = DayStore<DailyResult>;

export const emptyDaily = <R = DailyResult,>(): DayStore<R> => ({ streak: 0, best: 0, last: null, days: {} });

/** Read a saved store, tolerating anything malformed. */
export function parseDaily<R = DailyResult>(raw: string | null): DayStore<R> {
  try {
    const s = JSON.parse(raw ?? "null");
    if (!s || typeof s !== "object") return emptyDaily();
    return {
      streak: Number.isFinite(s.streak) ? s.streak : 0,
      best: Number.isFinite(s.best) ? s.best : 0,
      last: typeof s.last === "string" ? s.last : null,
      days: s.days && typeof s.days === "object" ? s.days : {},
    };
  } catch {
    return emptyDaily();
  }
}

/** The store after playing `day`'s chart. Playing it twice changes nothing; a missed day starts the streak again. */
export function recordDaily<R>(s: DayStore<R>, day: string, result: R): DayStore<R> {
  if (s.days[day]) return s;
  const streak = s.last === dayBefore(day) ? s.streak + 1 : s.last === day ? s.streak : 1;
  const days: Record<string, R> = { ...s.days, [day]: result };
  // Keep two weeks: enough for yesterday and a little history.
  for (const k of Object.keys(days).sort().slice(0, -14)) delete days[k];
  return { streak, best: Math.max(s.best, streak), last: day, days };
}

/** The streak as of `day`: still alive if the last chart played was today or yesterday. */
export const streakOn = (s: DayStore<unknown>, day: string) => (s.last === day || s.last === dayBefore(day) ? s.streak : 0);

const BARS = "▁▂▃▄▅▆▇█";

/** Two lines as bar characters on one shared scale, at most 12 wide (pairs are averaged for two-year charts). */
export function sparks(a: number[], b: number[]) {
  const squeeze = (xs: number[]) => (xs.length <= 12 ? xs : Array.from({ length: Math.ceil(xs.length / 2) }, (_, i) => (xs[2 * i] + (xs[2 * i + 1] ?? xs[2 * i])) / 2));
  const [sa, sb] = [squeeze(a), squeeze(b)];
  const lo = Math.min(...sa, ...sb);
  const hi = Math.max(...sa, ...sb);
  const bar = (v: number) => BARS[hi > lo ? Math.round(((v - lo) / (hi - lo)) * (BARS.length - 1)) : 0];
  return [sa.map(bar).join(""), sb.map(bar).join("")] as const;
}

/** What Share copies or sends: the number, the chart, the real line and yours as bars, both scores. */
export function shareText(r: Daily, res: DailyResult, streak: number, url: string) {
  const [real, mine] = sparks(r.actual, res.guess);
  const mark = res.you > res.rule ? " ✓" : "";
  return [
    `Monte daily chart ${r.n}: ${r.name}`,
    `Real ${real}`,
    `Me   ${mine}`,
    `Me ${res.you}, ${r.ruleName.toLowerCase()} ${res.rule}${mark}`,
    ...(streak > 1 ? [`${streak} days in a row`] : []),
    url,
  ].join("\n");
}

/** "5h 12m" until local midnight. */
export function untilMidnight(now: Date) {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const mins = Math.max(0, Math.ceil((next.getTime() - now.getTime()) / 60000));
  return mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m`;
}
