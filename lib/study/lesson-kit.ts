import type { TopicId } from "./data";

/**
 * Lessons (DESIGN.md, "Lessons"): each topic split into five small lessons, one idea each, the way
 * Brilliant builds a course. Every lesson opens with a question before it explains anything, says the
 * rule in a sentence or two, asks again so you use it, and ends on the one thing to keep.
 */
export type Choice = { text: string; why: string; right?: boolean };
export type Step = { ask: string; options: Choice[] } | { say: string };
export type Lesson = { slug: string; title: string; steps: Step[] };

/** A question. Mark the right choice with `true`. Every choice answers back. */
export const ask = (q: string, ...options: [text: string, why: string, right?: boolean][]): Step => {
  // Lessons are written with the right answer first; the order is then turned by a hash of the question,
  // so the right answer lands in a different place from question to question, the same way every time.
  const list = options.map(([text, why, right]) => ({ text, why, right }));
  let h = 0;
  for (const ch of q) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const turn = h % list.length;
  return { ask: q, options: [...list.slice(turn), ...list.slice(0, turn)] };
};
/** A short explanation between questions. */
export const say = (s: string): Step => ({ say: s });
export const lesson = (slug: string, title: string, ...steps: Step[]): Lesson => ({ slug, title, steps });

export type LessonBook = Partial<Record<TopicId, Lesson[]>>;
