"use client";

import { useSyncExternalStore } from "react";
import { TOPICS, type TopicId } from "./data";
import type { Mem } from "./memory";

/**
 * Study progress, saved in this browser only under the localStorage key `sigma`. The shape is the
 * one the original engine wrote, field for field, so nobody loses progress across the port.
 */
/** `best` is the best score on any set with four or more of the topic; `top` is the best on a set with eight or more,
 *  the only score that can master it. Saves from before `top` existed have none. */
export type TopicStats = { asked: number; correct: number; best: number; top?: number };
export type StudyProgress = {
  drill: Partial<Record<TopicId, TopicStats>>;
  /** Topic ids of missed questions, oldest first, at most 40. */
  due: TopicId[];
  /** The old study-only streak. No longer written or shown: the one streak lives in lib/progress.ts.
   *  Kept in the type so old saves still load and back up unchanged. */
  streak: { last: string | null; count: number };
  /** Best mock test score, 0 to 1: readiness. */
  mock: number;
  hw: Record<string, unknown>;
  /** Best 60-second sprint per quick-math category. */
  math: Record<string, number>;
  /** Flashcard Leitner box (0 to 4) per card key: three right in a row counts as mastered. */
  cards?: Record<string, number>;
  /** Flashcard memory per card key (lib/study/memory.ts): when each card is next due. */
  mem?: Record<string, Mem>;
  /** The local day each card last paid XP, so a card pays at most once a day. */
  cardXp?: Record<string, string>;
  /** Topics read to the end of the page. */
  read?: Partial<Record<TopicId, 1>>;
  /** Lessons finished, keyed topic/lesson (lib/study/lessons.ts). */
  lessons?: Record<string, 1>;
  /** Monte Daily: the first try on each local date, score and share grid. */
  daily?: Record<string, { c: number; g: string }>;
  /** Topics passed in Expert mode (EXPERT below). */
  expert?: Partial<Record<TopicId, 1>>;
  /** The local day a question on each topic was last answered right in a drill: how fresh a mastered topic is. */
  seen?: Partial<Record<TopicId, string>>;
};

const KEY = "sigma";
const fresh = (): StudyProgress => ({ drill: {}, due: [], streak: { last: null, count: 0 }, mock: 0, hw: {}, math: {} });
const SERVER = fresh();

let state: StudyProgress | null = null;
const subs = new Set<() => void>();

function load(): StudyProgress {
  const s = fresh();
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) Object.assign(s, JSON.parse(raw));
  } catch {}
  s.drill ||= {};
  s.due ||= [];
  s.streak ||= { last: null, count: 0 };
  s.math ||= {};
  // Topics mastered before freshness was tracked start their clock today, so nothing reads rusty on day one.
  const missing = TOPICS.filter((t) => statsWon(s.drill[t.id]) && !s.seen?.[t.id]);
  if (missing.length) {
    const today = todayKey();
    s.seen = { ...s.seen, ...Object.fromEntries(missing.map((t) => [t.id, today])) };
    try {
      localStorage.setItem(KEY, JSON.stringify(s));
    } catch {}
  }
  return s;
}

/** The local day as YYYY-MM-DD (the same key lib/progress.ts uses). */
export function todayKey(t = Date.now()) {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function current() {
  return (state ??= load());
}

/** Applies a change, saves it and tells every subscriber. */
export function updateStudyProgress(fn: (p: StudyProgress) => void) {
  const next = structuredClone(current());
  fn(next);
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  subs.forEach((f) => f());
}

function subscribe(f: () => void) {
  subs.add(f);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    state = load();
    f();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    subs.delete(f);
    window.removeEventListener("storage", onStorage);
  };
}

/** StudyProgress for rendering. The server and the first client paint see empty progress, so hydration matches. */
export function useStudyProgress() {
  return useSyncExternalStore(subscribe, current, () => SERVER);
}

export function getStudyProgress() {
  return current();
}

export const statsFor = (p: StudyProgress, id: TopicId): TopicStats => p.drill[id] ?? { asked: 0, correct: 0, best: 0 };
/** The fewest questions of one topic, answered in one set, that can master it. */
export const MASTER_SET = 8;
/**
 * A topic is mastered by one set: eight or more of its questions answered, 80% or better. Scores from separate sets
 * never add up to it, so four right in one set and four wrong in another is not mastered.
 * Saves from before `top` existed keep the mark only if their answers overall are 80% right as well.
 */
export const statsWon = (d?: TopicStats) => {
  if (!d) return false;
  if (d.top !== undefined) return d.top >= 0.8;
  return d.best >= 0.8 && d.asked >= MASTER_SET && d.correct / d.asked >= 0.8;
};
export const isWon = (p: StudyProgress, id: TopicId) => statsWon(p.drill[id]);
/** A topic's stats after a set in which `a` of its questions were answered and `c` of those were right. */
export function recordSet(d: TopicStats, a: number, c: number): TopicStats {
  const out = { ...d, asked: d.asked + a, correct: d.correct + c };
  if (a >= 4) out.best = Math.max(d.best, c / a);
  // An older save that had earned the mark carries it over, so a later weak set cannot take it away.
  if (a >= MASTER_SET) out.top = Math.max(d.top ?? (statsWon(d) ? d.best : 0), c / a);
  return out;
}
export const wonCount = (p: StudyProgress) => TOPICS.filter((t) => isWon(p, t.id)).length;
/** How many of a topic's lessons are finished. */
export const lessonsDone = (p: StudyProgress, id: TopicId, slugs: string[]) => slugs.filter((s) => p.lessons?.[`${id}/${s}`]).length;

/** The "Topic mastered" badge: a single-topic drill of 8 or more questions at 80% or better. */
/**
 * A finished set's score. Practice sets ended early count only the questions answered, so stopping at 3 of 10
 * never reads as 30%. Mock tests count every question, the way a real test would.
 */
export const setScore = (correct: number, answered: number, n: number, mock: boolean) => (mock ? (n ? correct / n : 0) : answered ? correct / answered : 0);

/** The due list after a set: each answered due question leaves once, then the misses come back. Unanswered ones stay. */
export function settleDue(due: TopicId[], answered: TopicId[], missed: TopicId[]) {
  const left = due.slice();
  for (const id of answered) {
    const i = left.indexOf(id);
    if (i >= 0) left.splice(i, 1);
  }
  return [...left, ...missed].slice(-40);
}
export const mastersTopic = (mode: string, n: number, pct: number) => (mode === "topic" || mode === "expert") && n >= MASTER_SET && pct >= 0.8;

/** Expert mode, opened by mastering a topic: ten questions against a fast clock, and nine must be right. */
export const EXPERT = { n: 10, seconds: 36, pass: 0.9 } as const;
/** Expert needs the whole set answered: running out the clock on question 9 is not a pass. */
export const passesExpert = (answered: number, correct: number) => answered >= EXPERT.n && correct / EXPERT.n >= EXPERT.pass;
export const isExpert = (p: StudyProgress, id: TopicId) => !!p.expert?.[id];

/** True once anything at all has been studied: a drill, a miss, a card, a topic read, a sprint, a Daily. */
export function hasAnyProgress(p: StudyProgress) {
  const some = (o: object | undefined) => !!o && Object.keys(o).length > 0;
  return some(p.drill) || p.due.length > 0 || (p.mock || 0) > 0 || some(p.cards) || some(p.read) || some(p.math) || some(p.daily);
}

/**
 * Rates a flashcard in place: Got it moves it up one box (at most 4), Again sends it to box 0.
 * Returns the XP earned: 3 only when the card moved up a box and has not paid yet today, else 0,
 * so rating the same card over and over earns nothing.
 */
export function rateCard(p: StudyProgress, key: string, got: boolean, day: string) {
  const from = p.cards?.[key] ?? 0, to = got ? Math.min(4, from + 1) : 0;
  p.cards = { ...p.cards, [key]: to };
  if (to <= from || p.cardXp?.[key] === day) return 0;
  p.cardXp = { ...p.cardXp, [key]: day };
  return 3;
}

// ---------- small preferences kept beside progress, same keys as before
type PrefKey = "sigmaTopic" | "sigmaQuiz" | "sigmaUntimed";
export function recall(key: PrefKey) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
export function store(key: PrefKey, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {}
}

/**
 * Keep it fresh. Mastery is earned once and never taken away, but a mastered topic left alone for RUSTY_DAYS
 * reads as rusty: a nudge, like Khan Academy's mastery that needs refreshing, without losing the mark.
 * Any drill question on it answered right makes it fresh again; a review mixes the rustiest ones.
 */
export const RUSTY_DAYS = 14;
const dayNum = (day: string) => Date.UTC(+day.slice(0, 4), +day.slice(5, 7) - 1, +day.slice(8, 10)) / 86400000;
/** Whole days from `a` to `b`. */
export const daysBetween = (a: string, b: string) => Math.round(dayNum(b) - dayNum(a));
/** Days since a mastered topic was last practised, or 0 for one not mastered or with no record. */
export const staleDays = (p: StudyProgress, id: TopicId, today: string) => (isWon(p, id) && p.seen?.[id] ? Math.max(0, daysBetween(p.seen[id]!, today)) : 0);
export const isRusty = (p: StudyProgress, id: TopicId, today: string) => staleDays(p, id, today) >= RUSTY_DAYS;
/** Rusty topics, the longest left alone first. */
export const rustyTopics = (p: StudyProgress, today: string) =>
  TOPICS.filter((t) => isRusty(p, t.id, today))
    .sort((a, b) => staleDays(p, b.id, today) - staleDays(p, a.id, today))
    .map((t) => t.id);
/** A review's topics: `n` questions over the mastered topics, longest left alone first, taking turns. Empty with none mastered. */
export function reviewTopics(p: StudyProgress, today: string, n = 5): TopicId[] {
  const won = TOPICS.filter((t) => isWon(p, t.id))
    .sort((a, b) => staleDays(p, b.id, today) - staleDays(p, a.id, today))
    .map((t) => t.id);
  return won.length ? Array.from({ length: n }, (_, i) => won[i % won.length]) : [];
}
