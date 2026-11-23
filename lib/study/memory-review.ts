import { Rating, createEmptyCard, fsrs, type Card, type State } from "ts-fsrs";
import type { Mem } from "./memory";

/**
 * The scheduler behind the flashcards: FSRS (ts-fsrs, MIT), the open scheduler built into Anki, fitted on millions of real reviews.
 * It aims to show each card when you would still recall it 9 times in 10. Whole days only (no same-session steps:
 * a missed card already comes back in the same round), and no random fuzz, so the same answers give the same dates.
 */
const scheduler = fsrs({ request_retention: 0.9, enable_fuzz: false, enable_short_term: false });

const round = (x: number) => Math.round(x * 1e4) / 1e4;

/** A card's memory after one answer at `now` (ms): Got it is Good, Again is Again. */
export function review(m: Mem | undefined, got: boolean, now: number): Mem {
  const card: Card = m
    ? { ...createEmptyCard(new Date(m.last)), due: new Date(m.due), stability: m.s, difficulty: m.d, reps: m.reps, lapses: m.lapses, state: m.state as State, last_review: new Date(m.last) }
    : createEmptyCard(new Date(now));
  const next = scheduler.next(card, new Date(now), got ? Rating.Good : Rating.Again).card;
  return { due: next.due.getTime(), s: round(next.stability), d: round(next.difficulty), reps: next.reps, lapses: next.lapses, state: next.state, last: now };
}
