"use client";

import { useSyncExternalStore } from "react";
import { TOPICS, type TopicId } from "./data";
import { localDay } from "./math";

/**
 * Study progress, saved in this browser only under the localStorage key `sigma`. The shape is the
 * one the original engine wrote, field for field, so nobody loses progress across the port.
 */
export type TopicStats = { asked: number; correct: number; best: number };
export type StudyProgress = {
  drill: Partial<Record<TopicId, TopicStats>>;
  /** Topic ids of missed questions, oldest first, at most 40. */
  due: TopicId[];
  /** Last day practiced (local date, YYYY-MM-DD) and the run of consecutive days. */
  streak: { last: string | null; count: number };
  /** Best mock exam score, 0 to 1: exam readiness. */
  mock: number;
  hw: Record<string, unknown>;
  /** Best 60-second sprint per quick-math category. */
  math: Record<string, number>;
  /** Flashcard Leitner box (0 to 4) per card key. */
  cards?: Record<string, number>;
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

const day = localDay;
/** Counts today toward the streak, by the student's local calendar day. */
export function touchStreak() {
  const today = day(Date.now());
  if (current().streak.last === today) return;
  updateStudyProgress((p) => {
    p.streak.count = p.streak.last === day(Date.now() - 864e5) ? p.streak.count + 1 : 1;
    p.streak.last = today;
  });
}

export const statsFor = (p: StudyProgress, id: TopicId): TopicStats => p.drill[id] ?? { asked: 0, correct: 0, best: 0 };
/** A topic is won at 80% or better on a drill set of at least four, with eight questions asked overall. */
export const isWon = (p: StudyProgress, id: TopicId) => {
  const d = statsFor(p, id);
  return d.best >= 0.8 && d.asked >= 8;
};
export const wonCount = (p: StudyProgress) => TOPICS.filter((t) => isWon(p, t.id)).length;

// ---------- small preferences kept beside progress, same keys as before
export function recall(key: "sigmaTopic" | "sigmaQuiz") {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
export function store(key: "sigmaTopic" | "sigmaQuiz", value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {}
}
