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
/** The key a finished lesson is saved under in study progress. */
export const lessonKey = (id: TopicId, slug: string) => `${id}/${slug}`;
