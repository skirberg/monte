import { TOPICS, type TopicId } from "./data";
import { lessonsFor } from "./lessons";

/**
 * Find your level (DESIGN.md, "Lessons"): the guess-first questions, asked as a search along the path.
 * Each topic it asks about halves the stretch of topics where your start can be: knowing it moves the search later,
 * not knowing it earlier. Fourteen topics take at most four of these. Knowing a topic takes two right answers, its
 * guess-first question and one from its lessons (secondQuestion), so one lucky tap cannot skip a topic.
 * You start at the first topic the search says you don't know yet. Topics before it are marked skipped, there to
 * read or test out of.
 */
export type Place = { lo: number; hi: number; asked: number };

/** Most questions a placement can ask: enough halvings to narrow fourteen topics to one. */
export const PLACE_MAX = Math.ceil(Math.log2(TOPICS.length));

export const placeStart = (): Place => ({ lo: 0, hi: TOPICS.length - 1, asked: 0 });

/** The topic to ask about next, or null when the search is done. */
export function placeNext(s: Place): TopicId | null {
  return s.lo >= s.hi ? null : TOPICS[(s.lo + s.hi) >> 1].id;
}

/** The search after one answer. */
export function placeAnswer(s: Place, right: boolean): Place {
  const mid = (s.lo + s.hi) >> 1;
  return right ? { lo: mid + 1, hi: s.hi, asked: s.asked + 1 } : { lo: s.lo, hi: mid, asked: s.asked + 1 };
}

/** Where you start once the search is done. */
export const placeResult = (s: Place): TopicId => TOPICS[s.lo].id;

export type PlaceQuestion = { q: string; options: { text: string; right?: boolean; why: string }[] };

/** A topic's second placement question: the first question in its middle lesson, where the topic gets going. */
export function secondQuestion(id: TopicId): PlaceQuestion {
  const ls = lessonsFor(id);
  for (const l of [ls[2], ...ls]) {
    const step = l?.steps.find((s) => "ask" in s);
    if (step && "ask" in step) return { q: step.ask, options: step.options };
  }
  throw new Error(`no lesson question for ${id}`);
}
