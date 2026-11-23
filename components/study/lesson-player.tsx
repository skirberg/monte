"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Check, CornerLeftUp, RotateCcw } from "lucide-react";
import { cn } from "@/lib/cn";
import type { TopicId } from "@/lib/study/data";
import { lessonKey, lessonScore, type Lesson } from "@/lib/study/lessons";
import { study } from "@/lib/study/routes";
import { updateStudyProgress } from "@/lib/study/progress";
import { awardXp } from "@/lib/study/events";
import { feelRight, feelWrong } from "@/lib/feel";
import { sym } from "@/lib/study/symbols";
import { Fold, Html, btn } from "@/components/study/ui";

/**
 * One lesson, one step at a time (DESIGN.md, "Lessons"). Steps stack as you go, so the lesson reads top to
 * bottom like a conversation; only the newest one waits for you. A question waits for a pick, says why, then
 * Continue. The bar on top fills one segment per step.
 *
 * The end says how many were right. Only a clean run counts the lesson as done (progress, XP, the grains);
 * a run with a miss gets the work, the topic's trap and a retry, never a celebration. Nothing flies over the
 * text: the grains settle in their own row and a milestone toast lands in the slot under the score.
 */
export function LessonPlayer({ topic, lesson, next, trap }: { topic: TopicId; lesson: Lesson; next: { href: string; label: string }; trap?: string }) {
  const [at, setAt] = React.useState(0);
  const [picks, setPicks] = React.useState<Record<number, number>>({});
  const [run, setRun] = React.useState(0);
  const topRef = React.useRef<HTMLDivElement>(null);
  const endRef = React.useRef<HTMLDivElement>(null);
  const scoreRef = React.useRef<HTMLParagraphElement>(null);
  const steps = lesson.steps, done = at >= steps.length;
  const score = lessonScore(lesson, picks);

  // Saved after the summary is on the page, so a milestone toast finds its slot there.
  React.useEffect(() => {
    if (!done || !score.clean) return;
    // XP once per lesson: replaying a finished lesson is practice, not new progress.
    let first = false;
    updateStudyProgress((p) => {
      const key = lessonKey(topic, lesson.slug);
      first = !p.lessons?.[key];
      p.lessons = { ...(p.lessons ?? {}), [key]: 1 };
    });
    if (first) awardXp(10, "lesson");
    // Once per finished run: picks cannot change while done, and a retry sets done back to false first.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const advance = () => {
    const finished = at + 1 >= steps.length;
    setAt(at + 1);
    requestAnimationFrame(() => {
      // A run with a miss has a longer summary: bring its score to the top so "1 of 2 right." is what you see.
      if (finished && !score.clean) scoreRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      else endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      // The button you pressed is gone; the score takes focus so a screen reader reads the result.
      if (finished) scoreRef.current?.focus({ preventScroll: true });
    });
  };
  const retry = () => {
    setPicks({});
    setAt(0);
    setRun((r) => r + 1);
    requestAnimationFrame(() => {
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      topRef.current?.parentElement?.querySelector<HTMLButtonElement>("[aria-label='Your answer'] button")?.focus({ preventScroll: true });
    });
  };
  const misses = steps.flatMap((s, i) => ("ask" in s && !s.options[picks[i]]?.right ? [{ s, picked: s.options[picks[i]], at: i }] : []));
  const asked = steps.flatMap((s, i) => ("ask" in s ? [i] : []));

  return (
    <div className="grid gap-6">
      <div ref={topRef} aria-hidden className="flex scroll-mt-24 gap-1">
        {steps.map((_, i) => (
          <span key={i} className={cn("h-1.5 flex-1 rounded-full transition-colors", i < at || done ? (done && !score.clean ? "bg-ink/30" : "bg-clay") : i === at ? "bg-ink/30" : "bg-sand-2")} />
        ))}
      </div>

      <ol key={run} className="grid gap-5">
        {steps.slice(0, Math.min(at + 1, steps.length)).map((s, i) => {
          const live = i === at;
          if ("say" in s)
            return (
              <li key={i} className="grid gap-4">
                <p className="max-w-measure text-lead leading-relaxed">{sym(s.say)}</p>
                {live && (
                  <button type="button" className={cn(btn.primary, "justify-self-start")} onClick={advance} autoFocus={i > 0}>
                    {i === steps.length - 1 ? "Finish" : "Continue"} <ArrowRight aria-hidden />
                  </button>
                )}
              </li>
            );
          const pick = picks[i], chosen = pick === undefined ? null : s.options[pick];
          return (
            <li key={i} id={stepId(run, i)} className="grid scroll-mt-24 gap-4 rounded-card bg-sand p-5 md:p-6">
              <p className="text-pretty text-lg font-semibold leading-snug">{sym(s.ask)}</p>
              <div role="group" aria-label="Your answer" className="grid gap-2">
                {s.options.map((o, k) => (
                  <button
                    key={o.text}
                    type="button"
                    disabled={chosen !== null}
                    aria-pressed={pick === k}
                    onClick={() => {
                      setPicks((p) => ({ ...p, [i]: k }));
                      if (o.right) feelRight();
                      else feelWrong();
                    }}
                    className="choice"
                    data-state={pick === k ? (o.right ? "right" : "wrong") : chosen && o.right ? "right" : undefined}
                  >
                    {sym(o.text)}
                  </button>
                ))}
              </div>
              {chosen && (
                <p role="status" className="max-w-measure">
                  <b className={chosen.right ? "text-success" : "text-danger"}>{chosen.right ? "Yes. " : "Not quite. "}</b>
                  {sym(chosen.why.replace(/^Yes[.,] (right: )?/, ""))}
                </p>
              )}
              {chosen && live && (
                <button type="button" className={cn(btn.primary, "justify-self-start")} onClick={advance} autoFocus>
                  Continue <ArrowRight aria-hidden />
                </button>
              )}
            </li>
          );
        })}
      </ol>

      {done && score.clean && (
        <section aria-label="Lesson done" className="grid gap-3 border-t border-line pt-6">
          <p ref={scoreRef} tabIndex={-1} className="flex items-center gap-2 font-display text-xl font-semibold outline-none">
            <Check className="size-5 text-clay" strokeWidth={3} aria-hidden /> {lesson.title}{lesson.title.includes(":") ? ", done" : ": done"}
          </p>
          <p className="flex items-center gap-3">
            <span className="tabular">
              {score.right} of {score.asked} right.
            </span>
            {/* The grains settle in their own row beside the score, never over the lesson. Fun mode only. */}
            <span aria-hidden className="fun-only flex items-end gap-1.5">
              {Array.from({ length: score.right }, (_, k) => (
                <span key={k} className="grain-drop size-2.5 rounded-full bg-clay" style={{ animationDelay: `${k * 90}ms` }} />
              ))}
            </span>
          </p>
          <div data-milestone-slot className="empty:hidden" />
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href={next.href} className={btn.primary}>
              {next.label} <ArrowRight aria-hidden />
            </Link>
            <Link href={study.topic(topic)} className={quietLink}>
              Back to the topic
            </Link>
          </div>
        </section>
      )}
      {done && !score.clean && (
        <section aria-label="Lesson finished with a miss" className="grid gap-5 border-t border-line pt-6">
          <div className="grid gap-1">
            <p ref={scoreRef} tabIndex={-1} className="flex scroll-mt-24 flex-wrap items-center gap-x-3 font-display text-xl font-semibold tabular outline-none">
              {score.right} of {score.asked} right.
              {/* One grain per question, in order: clay for right, a ring for a miss, like a share row. */}
              <span aria-hidden className="flex items-center gap-1.5">
                {asked.map((k) => (
                  <span key={k} className={cn("size-3 rounded-full", steps[k] && "ask" in steps[k] && steps[k].options[picks[k]]?.right ? "bg-clay" : "border-2 border-line-strong")} />
                ))}
              </span>
            </p>
            <p>
              <b className="text-danger">Not quite. </b>Here is the work.
            </p>
          </div>
          {/* Each miss as a change: your pick struck through, the answer in clay, why it holds. The question and
              why your pick fails are right above, where you answered; a link goes back to it. */}
          <ul className="grid gap-5">
            {misses.map(({ s, picked, at: k }) => {
              const right = s.options.find((o) => o.right)!;
              return (
                <li key={s.ask} className="relative grid max-w-measure gap-1 border-l-2 border-clay pl-4 pr-12">
                  <a href={`#${stepId(run, k)}`} aria-label="See the question" title="See the question" className="absolute right-0 top-0 grid size-11 place-items-center rounded-full text-ink-muted transition-colors hover:bg-sand hover:text-ink">
                    <CornerLeftUp className="size-5" aria-hidden />
                  </a>
                  <p className="flex flex-wrap items-baseline gap-x-2 font-semibold">
                    {picked && (
                      <>
                        <s className="font-normal text-ink-muted decoration-danger decoration-2">{sym(bare(picked.text))}</s>
                        <span className="sr-only">, the answer: </span>
                      </>
                    )}
                    <span className="text-success">{sym(bare(right.text))}</span>
                  </p>
                  <p>{sym(right.why.replace(/^Yes[.,] (right: )?/, ""))}</p>
                </li>
              );
            })}
          </ul>
          {trap && (
            <Fold title="The trap in this topic" level="h3">
              <Html as="p" html={trap} className="max-w-measure" />
            </Fold>
          )}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <button type="button" className={btn.primary} onClick={retry}>
              <RotateCcw aria-hidden /> Try the lesson again
            </button>
            <Link href={next.href} className={btn.ghost}>
              {next.label} <ArrowRight aria-hidden />
            </Link>
            <Link href={study.topic(topic)} className={quietLink}>
              Back to the topic
            </Link>
          </div>
        </section>
      )}
      {/* Scroll anchor; the bottom margin keeps Continue above the phone tab bar. */}
      <div ref={endRef} className="scroll-mb-28 lg:scroll-mb-8" />
    </div>
  );
}

const quietLink = "inline-flex min-h-11 items-center font-medium text-ink underline-offset-4 underline decoration-line-strong hover:decoration-ink";
/** A question step's anchor, fresh for each run so a retry never jumps to an old one. */
const stepId = (run: number, i: number) => `q-${run}-${i}`;
/** Option text without its closing stop, so it can sit inside a sentence. */
const bare = (t: string) => t.replace(/[.!?]+$/, "");
