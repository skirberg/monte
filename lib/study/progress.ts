"use client";

import { useSyncExternalStore } from "react";
import { TOPICS, type TopicId } from "./data";

/**
 * Study progress, saved in this browser only under the localStorage key `sigma`. The shape is the
 * one the original engine wrote, field for field, so nobody loses progress across the port.
 */
export type TopicStats = { asked: number; correct: number; best: number };
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
  /** Flashcard Leitner box (0 to 4) per card key. */
  cards?: Record<string, number>;
  /** The local day each card last paid XP, so a card pays at most once a day. */
  cardXp?: Record<string, string>;
  /** Topics read to the end of the page. */
  read?: Partial<Record<TopicId, 1>>;
  /** Monte Daily: the first try on each local date, score and share grid. */
  daily?: Record<string, { c: number; g: string }>;
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
  return s;
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
/** A topic is mastered at 80% or better on a drill set of at least four, with eight questions asked overall. */
export const isWon = (p: StudyProgress, id: TopicId) => {
  const d = statsFor(p, id);
  return d.best >= 0.8 && d.asked >= 8;
};
export const wonCount = (p: StudyProgress) => TOPICS.filter((t) => isWon(p, t.id)).length;

/** The "Topic mastered" badge: a single-topic drill of 8 or more questions at 80% or better. */
/** The due list after a set: each answered due question leaves once, then the misses come back. Unanswered ones stay. */
export function settleDue(due: TopicId[], answered: TopicId[], missed: TopicId[]) {
  const left = due.slice();
  for (const id of answered) {
    const i = left.indexOf(id);
    if (i >= 0) left.splice(i, 1);
  }
  return [...left, ...missed].slice(-40);
}
export const mastersTopic = (mode: string, n: number, pct: number) => mode === "topic" && n >= 8 && pct >= 0.8;

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
