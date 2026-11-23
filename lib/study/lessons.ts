import { snippet } from "../seo";
import type { TopicId } from "./data";
import type { Lesson } from "./lesson-kit";
import { LESSONS_A } from "./lessons-a";
import { LESSONS_B } from "./lessons-b";
import { LESSONS_C } from "./lessons-c";

export type { Lesson, Step, Choice } from "./lesson-kit";

/** Every topic's lessons, in order. Five per topic. */
export const LESSONS = { ...LESSONS_A, ...LESSONS_B, ...LESSONS_C } as Record<TopicId, Lesson[]>;

export const lessonsFor = (id: TopicId): Lesson[] => LESSONS[id] ?? [];
export const lessonBySlug = (id: TopicId, slug: string) => lessonsFor(id).find((l) => l.slug === slug);
/**
 * The lesson's rule and takeaway, whole sentences up to a search result's length, so each lesson's search result (and its
 * Markdown twin) says its own idea. Undefined for a lesson with no explanation step.
 */
export const lessonRule = (l: Lesson) => {
  const says = l.steps.flatMap((s) => ("say" in s ? [s.say] : []));
  return says.length ? snippet(says.join(" ")) : undefined;
};
/** The lesson's description: its rule, or a plain line about it when it has none. */
export const lessonDescription = (topicName: string, l: Lesson) => lessonRule(l) ?? `A three-minute lesson on ${topicName.toLowerCase()}: a question first, then the idea.`;
/** The key a finished lesson is saved under in study progress. */
export const lessonKey = (id: TopicId, slug: string) => `${id}/${slug}`;

/** How a run of a lesson went: right answers out of its questions, given the option picked at each step. */
export function lessonScore(l: Lesson, picks: Record<number, number>) {
  let asked = 0, right = 0;
  l.steps.forEach((s, i) => {
    if (!("ask" in s)) return;
    asked++;
    if (s.options[picks[i]]?.right) right++;
  });
  return { asked, right, clean: asked > 0 && right === asked };
}
