"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "cn";
import type { TopicId } from "@/lib/study/data";
import { lessonKey, type Lesson } from "@/lib/study/lessons";
import { study } from "@/lib/study/routes";
import { updateStudyProgress } from "@/lib/study/progress";
import { awardXp } from "@/lib/study/events";
import { burstFrom, celebrate } from "@/lib/fun";
import { feelRight, feelWrong } from "@/lib/feel";
import { sym } from "@/lib/study/symbols";
import { btn } from "@/components/study/ui";

/**
 * One lesson, one step at a time (DESIGN.md, "Lessons"). Steps stack as you go, so the lesson reads top to
 * bottom like a conversation; only the newest one waits for you. A question waits for a pick, says why, then
 * Continue. The bar on top fills one segment per step.
 */
export function LessonPlayer({ topic, lesson, next }: { topic: TopicId; lesson: Lesson; next: { href: string; label: string } }) {
  const [at, setAt] = React.useState(0);
  const [picks, setPicks] = React.useState<Record<number, number>>({});
  const endRef = React.useRef<HTMLDivElement>(null);
  const steps = lesson.steps, done = at >= steps.length;

  const advance = () => {
    const n = at + 1;
    setAt(n);
    if (n >= steps.length) {
      updateStudyProgress((p) => {
        p.lessons = { ...(p.lessons ?? {}), [lessonKey(topic, lesson.slug)]: 1 };
      });
      awardXp(10, "lesson");
      celebrate("Lesson done.");
    }
    requestAnimationFrame(() => endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
  };

  return (
    <div className="grid gap-6">
      <div aria-hidden className="flex gap-1">
        {steps.map((_, i) => (
          <span key={i} className={cn("h-1.5 flex-1 rounded-full transition-colors", i < at || done ? "bg-clay" : i === at ? "bg-ink/30" : "bg-sand-2")} />
        ))}
      </div>

      <ol className="grid gap-5">
        {steps.slice(0, Math.min(at + 1, steps.length)).map((s, i) => {
          const live = i === at;
          if ("say" in s)
            return (
              <li key={i} className="grid gap-4">
                <p className="max-w-[62ch] text-lead leading-relaxed">{sym(s.say)}</p>
                {live && (
                  <button type="button" className={cn(btn.primary, "justify-self-start")} onClick={advance} autoFocus={i > 0}>
                    {i === steps.length - 1 ? "Finish" : "Continue"} <ArrowRight aria-hidden />
                  </button>
                )}
              </li>
            );
          const pick = picks[i], chosen = pick === undefined ? null : s.options[pick];
          return (
            <li key={i} className="grid gap-4 rounded-[18px] bg-sand p-5 md:p-6">
              <p className="text-pretty font-display text-lead font-semibold leading-tight">{sym(s.ask)}</p>
              <div role="group" aria-label="Your answer" className="grid gap-2">
                {s.options.map((o, k) => (
                  <button
                    key={o.text}
                    type="button"
                    disabled={chosen !== null}
                    aria-pressed={pick === k}
                    onClick={(e) => {
                      setPicks((p) => ({ ...p, [i]: k }));
                      if (o.right) {
                        feelRight();
                        burstFrom(e.currentTarget, 8);
                      } else feelWrong();
                    }}
                    className={cn(
                      "min-h-12 rounded-[14px] border bg-paper px-4 py-3 text-left font-medium transition-colors disabled:cursor-default",
                      pick === k ? (o.right ? "border-success" : "border-danger") : chosen && o.right ? "border-success" : "border-line-strong enabled:hover:border-ink",
                    )}
                  >
                    {sym(o.text)}
                  </button>
                ))}
              </div>
              {chosen && (
                <p role="status" className="max-w-[62ch]">
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

      {done && (
        <section aria-label="Lesson done" className="grid gap-3 border-t border-line pt-6">
          <p className="flex items-center gap-2 font-display text-xl font-semibold">
            <Check className="size-5 text-clay" strokeWidth={3} aria-hidden /> {lesson.title}: done
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href={next.href} className={btn.primary}>
              {next.label} <ArrowRight aria-hidden />
            </Link>
            <Link href={study.topic(topic)} className="inline-flex min-h-11 items-center font-medium text-clay-ink underline-offset-4 hover:underline">
              Back to the topic
            </Link>
          </div>
        </section>
      )}
      <div ref={endRef} />
    </div>
  );
}
