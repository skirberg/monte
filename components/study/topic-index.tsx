"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "cn";
import { TOPICS, isTopicId, topicById } from "@/lib/study/data";
import { plainText } from "@/lib/study/math";
import { study } from "@/lib/study/routes";
import { topicMatches } from "@/lib/study/search";
import { isWon, lessonsDone, statsFor, useStudyProgress } from "@/lib/study/progress";
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
  const from = Math.max(0, TOPICS.findIndex((t) => t.id === placed));
  const nextId = (TOPICS.slice(from).find((t) => !isWon(p, t.id)) ?? TOPICS.find((t) => !isWon(p, t.id)))?.id;

  return (
    <div className="grid gap-6 pb-8">
      {lastTopic && !query && (
        <Link href={study.topic(lastTopic.id)} className="group flex items-center justify-between gap-4 rounded-[18px] bg-sand p-5 transition-colors hover:bg-sand-2">
          <span className="grid gap-1">
            <span className={eyebrow}>Pick up where you left off</span>
            <span className="font-display text-xl font-semibold">
              {lastTopic.n}. {lastTopic.name}
            </span>
          </span>
          <ArrowRight className="size-5 flex-none transition-transform group-hover:translate-x-0.5" aria-hidden />
        </Link>
      )}
      {/* The path (DESIGN.md, "Lessons"): fourteen stops in order, mastered ones filled in clay, the next one lit. */}
      <ol aria-label="Your path through the topics" className="relative grid">
        {shown.map((t, k) => {
          const d = statsFor(p, t.id), won = isWon(p, t.id), isNext = t.id === nextId;
          const ls = lessonsFor(t.id), nDone = lessonsDone(p, t.id, ls.map((l) => l.slug));
          const nextLesson = ls.find((l) => !p.lessons?.[`${t.id}/${l.slug}`]);
          const status = won ? "Mastered" : d.asked ? `Best ${Math.round(d.best * 100)}%` : nDone ? `${nDone} of ${ls.length} lessons` : p.read?.[t.id] ? "Read" : "";
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
                  won && "border-clay bg-clay text-paper",
                  isNext && "border-ink bg-ink text-paper shadow-[0_0_0_6px_var(--clay-tint)]",
                  !won && !isNext && "border-line-strong bg-paper text-ink-muted",
                )}
              >
                {won ? <Check className="size-5" strokeWidth={3} /> : t.n}
              </span>
              <Link
                href={isNext && nextLesson ? study.lesson(t.id, nextLesson.slug) : study.topic(t.id)}
                aria-current={isNext ? "step" : undefined}
                className={cn(
                  "group mb-3 grid gap-1 rounded-[18px] px-4 py-3 transition-colors hover:bg-sand",
                  isNext && "bg-sand py-4 hover:bg-sand-2",
                )}
              >
                <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <span className="font-display text-lg font-semibold leading-snug">{t.short}</span>
                  {isNext ? (
                    <span className="text-sm font-medium text-clay-ink">Up next</span>
                  ) : (
                    status && <span className={cn("text-sm text-ink-muted", won && "text-clay-ink")}>{status}</span>
                  )}
                </span>
                {isNext && (
                  <>
                    <span className="max-w-[60ch] text-sm text-ink-muted">{plainText(t.line)}</span>
                    <span className="btn btn-primary btn-sm mt-2 justify-self-start">
                      {nextLesson ? (nDone ? `Lesson ${nDone + 1}: ${nextLesson.title}` : `Start: ${nextLesson.title}`) : "Drill it"} <ArrowRight className="size-4" aria-hidden />
                    </span>
                  </>
                )}
              </Link>
            </li>
          );
        })}
      </ol>
      {!shown.length && (
        <p className="rounded-[18px] border border-dashed border-line-strong p-4 text-sm text-ink-muted">
          No topics match. Try a simpler word like mean, SD, given, or Poisson.
        </p>
      )}
    </div>
  );
}
