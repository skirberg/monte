"use client";

import Link from "next/link";
import { ArrowRight, Check, Star } from "lucide-react";
import { cn } from "@/lib/cn";
import { TOPICS, isTopicId, topicById } from "@/lib/study/data";
import { study } from "@/lib/study/routes";
import { topicMatches } from "@/lib/study/search";
import { isExpert, isRusty, isWon, lessonsDone, statsFor, todayKey, useStudyProgress } from "@/lib/study/progress";
import { lessonsFor } from "@/lib/study/lessons";
import { useStoredString } from "@/lib/hooks";
import { useLearnQuery } from "@/components/study/learn-bar";
import { eyebrow } from "@/components/study/ui";

/** Learn home: every topic with where you stand on it, and a way back to the last one you read. */
export function TopicIndex() {
  const p = useStudyProgress();
  const query = useLearnQuery();
  const last = useStoredString("sigmaTopic");
  const lastTopic = isTopicId(last) ? topicById(last) : undefined;
  const shown = TOPICS.filter((t) => topicMatches(t.id, query));
  // Up next: the first topic not yet mastered, from where placement said to start (if it ran).
  const placed = useStoredString("monte-start");
  // Keep it fresh: a mastered topic left alone two weeks shows hollow, "Rusty", until a right answer refreshes it.
  const today = todayKey();
  const from = Math.max(0, TOPICS.findIndex((t) => t.id === placed));
  // Find your level skipped every topic before its start: shown dashed until you test out or study them.
  const nextId = (TOPICS.slice(from).find((t) => !isWon(p, t.id)) ?? TOPICS.find((t) => !isWon(p, t.id)))?.id;

  return (
    <div className="grid gap-6 pb-8">
      {lastTopic && !query && (
        <Link href={study.topic(lastTopic.id)} className="group flex items-center justify-between gap-4 rounded-card bg-sand p-5 transition-colors hover:bg-sand-2">
          <span className="grid gap-1">
            <span className={eyebrow}>Pick up where you left off</span>
            <span className="font-display text-xl font-semibold">
              {lastTopic.n}. {lastTopic.short}
            </span>
          </span>
          <ArrowRight className="size-5 flex-none transition-transform group-hover:translate-x-0.5" aria-hidden />
        </Link>
      )}
      {/* The path (DESIGN.md, "Lessons"): fourteen stops in order, mastered ones filled in clay, the next one lit. */}
      <ol aria-label="Your path through the topics" className="relative grid">
        {shown.map((t, k) => {
          const d = statsFor(p, t.id), won = isWon(p, t.id), expert = isExpert(p, t.id), isNext = t.id === nextId, rusty = isRusty(p, t.id, today);
          const ls = lessonsFor(t.id), nDone = lessonsDone(p, t.id, ls.map((l) => l.slug));
          const nextLesson = ls.find((l) => !p.lessons?.[`${t.id}/${l.slug}`]);
          const skipped = !won && TOPICS.indexOf(t) < from;
          const status = rusty ? "Rusty" : expert ? "Expert" : won ? "Mastered" : d.asked ? `Best ${Math.round(d.best * 100)}%` : nDone ? `${nDone} of ${ls.length} lessons` : p.read?.[t.id] ? "Read" : skipped ? "Skipped" : "";
          const last = k === shown.length - 1;
          return (
            <li key={t.id} className="relative grid grid-cols-[2.75rem_minmax(0,1fr)] gap-x-4">
              {/* The line between stops: clay up to the last mastered one. */}
              {!last && (
                <span aria-hidden className={cn("absolute left-[1.375rem] top-11 bottom-0 w-0.5 -translate-x-1/2", won ? "bg-clay" : "bg-line")} />
              )}
              <span
                aria-hidden
                className={cn(
                  "relative z-10 mt-1.5 grid size-11 place-items-center rounded-full border-2 font-mono text-sm tabular-nums",
                  won && (rusty ? "border-clay bg-paper text-clay-ink" : "border-clay bg-clay text-paper"),
                  expert && "ring-2 ring-clay ring-offset-2 ring-offset-paper",
                  isNext && "border-ink bg-ink text-paper shadow-[0_0_0_6px_var(--clay-tint)]",
                  !won && !isNext && "border-line-strong bg-paper text-ink-muted",
                  skipped && !isNext && "border-dashed",
                )}
              >
                {expert ? <Star className="size-5 fill-current" strokeWidth={2} /> : won ? <Check className="size-5" strokeWidth={3} /> : t.n}
              </span>
              {isNext ? (
                // Up next: two ways in, the next lesson or a test out (Duolingo's "jump here"): pass the 8-question drill and it's mastered.
                <div className="mb-3 grid min-w-0 gap-1 rounded-card bg-sand px-4 py-4">
                  <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <Link href={study.topic(t.id)} className="font-display text-lg font-semibold leading-snug underline-offset-4 hover:underline">
                      {t.short}
                    </Link>
                    <span className="text-sm font-medium text-ink">Up next</span>
                  </span>
                  <span className="mt-2 flex flex-wrap gap-2">
                    {/* max-w-full and truncate: a long lesson name never pushes the card past a 320px phone. */}
                    <Link href={nextLesson ? study.lesson(t.id, nextLesson.slug) : study.drillTopic(t.id)} aria-current="step" className="btn btn-primary btn-sm max-w-full">
                      <span className="truncate">{nextLesson ? (nDone ? `Lesson ${nDone + 1}` : "Start") : "Drill it"}</span>
                      <ArrowRight className="size-4 shrink-0" aria-hidden />
                    </Link>
                    {nextLesson && (
                      <Link href={study.drillTopic(t.id)} className="btn btn-secondary btn-sm">
                        Test out
                      </Link>
                    )}
                  </span>
                </div>
              ) : (
              <Link
                href={study.topic(t.id)}
                className="group mb-3 grid min-w-0 grid-cols-[minmax(0,1fr)] gap-1 rounded-card px-4 py-3 transition-colors hover:bg-sand"
              >
                <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <span className="font-display text-lg font-semibold leading-snug">{t.short}</span>
                  {status && <span className={cn("text-sm text-ink-muted", won && !rusty && "text-clay-ink")}>{status}</span>}
                </span>
              </Link>
              )}
            </li>
          );
        })}
      </ol>
      {!shown.length && (
        <p className="rounded-card border border-dashed border-line-strong p-4 text-sm text-ink-muted">
          No topics match. Try a simpler word like mean, SD, given, or Poisson.
        </p>
      )}
    </div>
  );
}
