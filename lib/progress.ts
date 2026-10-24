"use client";

/**
 * One progress store for the whole site, saved in this browser only (no accounts).
 *
 * - XP rewards learning actions (a right answer, a finished drill, a card you knew), never page views.
 * - A daily goal and a streak, with a freeze earned every 7 days so one missed day does not wipe it.
 * - Monte chips: a play bankroll the games pay out from. Chips reward being well calibrated, not lucky,
 *   and are never money.
 * - Badges for real milestones.
 *
 * This is the only streak on the site: the study app, the games and /decide/ all move it by earning XP.
 *
 * Anything (study pages via lib/study/events.ts, games, /decide/) can award XP by dispatching
 * `window.dispatchEvent(new CustomEvent("monte:xp", { detail: { xp, reason } }))`;
 * <ProgressBridge /> listens and calls addXp. Every change fires "monte:progress".
 */

import * as React from "react";

const KEY = "monte-progress";
export const DAILY_GOAL = 50;
export const START_CHIPS = 1000;
/** Learning pays chips, so the games are fuelled by studying: XP measures learning and can't be spent; chips can. */
export const CHIPS_FOR = { goal: 100, level: 250, badge: 100 };

export type Progress = {
  xp: number;
  days: Record<string, number>;
  streak: number;
  lastDay: string | null;
  freezes: number;
  chips: number;
  badges: string[];
  counts: Record<string, number>;
};

export type ProgressEvent = { gained?: number; reason?: string; levelUp?: number; goalHit?: boolean; badge?: string; chips?: number };

export const BADGES: Record<string, { name: string; how: string }> = {
  "first-drill": { name: "First drill", how: "Finish a drill." },
  "topic-won": { name: "Topic mastered", how: "Score 80% on an 8-question topic drill." },
  "all-topics": { name: "Every topic", how: "Master all 14 topics." },
  "mock-pass": { name: "Test ready", how: "Score 80% on a mock test." },
  "cards-50": { name: "Card shark", how: "Master 50 flashcards." },
  "streak-7": { name: "Seven days", how: "Keep a 7-day streak." },
  "goal-hit": { name: "Daily goal", how: `Earn ${DAILY_GOAL} XP in a day.` },
  "calibrated": { name: "Well calibrated", how: "Finish 10 election calls with a Brier score under 0.2." },
  "high-roller": { name: "High roller", how: `Grow your chips to ${(START_CHIPS * 2).toLocaleString()}.` },
};

/** Level n starts at 50·n·(n − 1) XP: 0, 100, 300, 600, 1,000 … each level a little longer than the last. */
export function levelOf(xp: number) {
  let n = 1;
  while (50 * (n + 1) * n <= xp) n++;
  const start = 50 * n * (n - 1);
  const next = 50 * (n + 1) * n;
  return { level: n, into: xp - start, span: next - start };
}

/** Local calendar day as YYYY-MM-DD, built by hand so no locale can change the format. */
export function localDay(t = Date.now()) {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
/** The local day `by` calendar days from `t` (−1 is yesterday). Calendar arithmetic, so a 23- or
 *  25-hour day at a clock change never skips or repeats a date. */
export function shiftDay(t: number, by: number) {
  const d = new Date(t);
  d.setDate(d.getDate() + by);
  return localDay(d.getTime());
}
const today = () => localDay();
/** Whole days from a to b. Date-only strings parse as UTC midnight, so clock changes can't bend it. */
const dayDiff = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 864e5);

/** The streak as it stands on `day`: still alive if the last learning day was today or yesterday,
 *  or the missed days in between are covered by freezes. Otherwise it shows 0 until the next action. */
export function liveStreak(p: Pick<Progress, "streak" | "lastDay" | "freezes">, day = today()) {
  if (!p.lastDay) return 0;
  const gap = dayDiff(p.lastDay, day);
  return gap <= 1 || gap - 1 <= p.freezes ? p.streak : 0;
}

function blank(): Progress {
  return { xp: 0, days: {}, streak: 0, lastDay: null, freezes: 0, chips: START_CHIPS, badges: [], counts: {} };
}

export function getProgress(): Progress {
  if (typeof window === "undefined") return blank();
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...blank(), ...JSON.parse(raw) } : blank();
  } catch {
    return blank();
  }
}

function save(p: Progress, ev: ProgressEvent) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {}
  window.dispatchEvent(new CustomEvent<ProgressEvent>("monte:progress", { detail: ev }));
}

function giveBadge(p: Progress, id: string, ev: ProgressEvent) {
  if (!BADGES[id] || p.badges.includes(id)) return;
  p.badges.push(id);
  p.chips += CHIPS_FOR.badge;
  ev.badge = ev.badge ?? id;
}

/** Add XP for a learning action. Also moves the streak and checks the daily goal and level. */
export function addXp(amount: number, reason = "") {
  const p = getProgress();
  const d = today();
  const ev: ProgressEvent = { gained: amount, reason };
  const before = levelOf(p.xp).level;
  const hadGoal = (p.days[d] ?? 0) >= DAILY_GOAL;

  if (p.lastDay !== d) {
    const gap = p.lastDay ? dayDiff(p.lastDay, d) : 1;
    if (gap <= 0) {
      // The clock moved back (travel, a changed setting): keep the streak as it is.
    } else if (gap === 1) p.streak += 1;
    else if (gap - 1 <= p.freezes) {
      // Each freeze covers one missed day.
      p.freezes -= gap - 1;
      p.streak += 1;
    } else p.streak = 1;
    if (gap > 0) p.lastDay = d;
    if (p.streak > 0 && p.streak % 7 === 0) p.freezes = Math.min(2, p.freezes + 1);
    if (p.streak >= 7) giveBadge(p, "streak-7", ev);
  }

  p.xp += amount;
  p.days[d] = (p.days[d] ?? 0) + amount;
  const after = levelOf(p.xp).level;
  if (after > before) {
    ev.levelUp = after;
    p.chips += CHIPS_FOR.level * (after - before);
  }
  if (!hadGoal && p.days[d] >= DAILY_GOAL) {
    ev.goalHit = true;
    p.chips += CHIPS_FOR.goal;
    giveBadge(p, "goal-hit", ev);
  }
  save(p, ev);
}

export function unlockBadge(id: string) {
  const p = getProgress();
  const ev: ProgressEvent = {};
  giveBadge(p, id, ev);
  if (ev.badge) save(p, ev);
}

/** Change the chip balance (never below 0) and return the new balance. */
export function addChips(delta: number, reason = "") {
  const p = getProgress();
  p.chips = Math.max(0, Math.round(p.chips + delta));
  const ev: ProgressEvent = { chips: delta, reason };
  if (p.chips >= START_CHIPS * 2) giveBadge(p, "high-roller", ev);
  save(p, ev);
  return p.chips;
}

/** Out of chips? One refill a day back to the starting stack. */
export function refillChips() {
  const p = getProgress();
  const d = today();
  if (p.chips > 0 || p.counts[`refill:${d}`]) return false;
  p.counts[`refill:${d}`] = 1;
  p.chips = START_CHIPS;
  save(p, { chips: START_CHIPS, reason: "refill" });
  return true;
}

/** Live progress for React components. Null until mounted, so server HTML never depends on storage. */
export function useProgress() {
  const [p, setP] = React.useState<Progress | null>(null);
  React.useEffect(() => {
    const read = () => setP(getProgress());
    read();
    window.addEventListener("monte:progress", read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener("monte:progress", read);
      window.removeEventListener("storage", read);
    };
  }, []);
  return p;
}

// ---------- Backup and move: progress lives in this browser, so let people carry it.
/** Every key Monte writes: progress, study progress and preferences, the games' bests and history. */
const KEYS = [KEY, "sigma", "sigmaTopic", "sigmaQuiz", "sigmaUntimed", "sigmaMode", "sigmaGuessR", "monteElectionCalls", "monteElectionStreak"];
/** Keys made per tool, found by prefix (monte-decide:<tool> holds the day its XP was last paid). */
const PREFIXES = ["monte-decide:"];
export const isMonteKey = (k: string) => KEYS.includes(k) || PREFIXES.some((p) => k.startsWith(p));

function monteKeys() {
  const out = new Set(KEYS);
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && isMonteKey(k)) out.add(k);
    }
  } catch {}
  return [...out];
}

/** Everything Monte saved in this browser, as one short code to paste on another device.
 *  Version 2 keeps each value as the exact string stored, so plain strings (a topic id, a date) survive. */
export function exportProgress() {
  const data: Record<string, string> = {};
  for (const k of monteKeys()) {
    try {
      const v = localStorage.getItem(k);
      if (v != null) data[k] = v;
    } catch {}
  }
  const json = JSON.stringify({ app: "monte", v: 2, at: new Date().toISOString(), data });
  return btoa(unescape(encodeURIComponent(json)));
}

/** Restore from a code or a backup file's text. Returns false if it isn't a Monte backup.
 *  Only Monte's own keys are written. Version 1 codes held parsed JSON, so their values are re-encoded. */
export function importProgress(text: string) {
  let obj: { app?: string; v?: number; data?: Record<string, unknown> } | null = null;
  const raw = text.trim();
  try {
    obj = JSON.parse(raw.startsWith("{") ? raw : decodeURIComponent(escape(atob(raw))));
  } catch {
    return false;
  }
  if (!obj || obj.app !== "monte" || !obj.data || typeof obj.data !== "object") return false;
  const asIs = (obj.v ?? 1) >= 2;
  for (const [k, v] of Object.entries(obj.data)) {
    if (!isMonteKey(k) || v === undefined) continue;
    try {
      localStorage.setItem(k, asIs && typeof v === "string" ? v : JSON.stringify(v));
    } catch {}
  }
  window.dispatchEvent(new CustomEvent("monte:progress", { detail: {} }));
  return true;
}

/** What to say when a milestone lands, for the toast and screen readers. Empty when nothing did. */
export function milestoneText(ev: ProgressEvent) {
  const parts: string[] = [];
  if (ev.levelUp) parts.push(`Level ${ev.levelUp} reached.`);
  if (ev.goalHit) parts.push("Daily goal done.");
  if (ev.badge && !(ev.goalHit && ev.badge === "goal-hit")) parts.push(`Badge earned: ${BADGES[ev.badge]?.name ?? ev.badge}.`);
  return parts.join(" ");
}
