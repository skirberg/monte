"use client";

import Link from "next/link";
import { cn } from "cn";
import { TOPICS, TOOLS } from "@/lib/study/data";
import { study } from "@/lib/study/routes";
import { isWon, statsFor, useStudyProgress, wonCount } from "@/lib/study/progress";
import { SourceList } from "@/components/study/sources";
import { blockTitle, btn } from "@/components/study/ui";

const STEPS = [
  ["Learn", "Read the one-line idea, try the example, and drag the lab until the number makes sense."],
  ["Practice", "Answer timed questions with fresh numbers. Score 80% on a topic to win its match."],
  ["Check", "Misses come back in Due today, and the timed closed-book mock shows how ready you are."],
];

/** Today, the study home: where you stand, what is due, and every way in. */
export function Today() {
  const p = useStudyProgress();
  const due = p.due.length, won = wonCount(p);
  return (
    <div className="grid gap-12 pb-8 pt-10 md:pt-16">
      <div className="grid gap-x-10 gap-y-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section aria-labelledby="how-t" className="grid content-start gap-4">
          <h2 id="how-t" className={blockTitle}>
            How to use it
          </h2>
          <ol className="grid gap-4">
            {STEPS.map(([b, s], i) => (
              <li key={b} className="grid grid-cols-[2rem_1fr] items-start gap-3">
                <span aria-hidden className="grid size-8 place-items-center rounded-full border-[1.5px] border-ink font-mono text-sm font-medium">
                  {i + 1}
                </span>
                <span className="grid gap-0.5">
                  <b>{b}</b>
                  <span className="text-sm text-ink-muted">{s}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>
        <section aria-labelledby="hp-t" className="grid content-start gap-4 rounded-[18px] bg-sand p-6">
          <h2 id="hp-t" className="font-display text-xl font-[650] tracking-[-0.02em]">
            Practice
          </h2>
          <div className="grid gap-1">
            <p className="text-sm text-ink-muted">Due today</p>
            <p className="font-mono text-[56px] font-medium leading-none tracking-[-0.04em] tabular-nums">{due}</p>
            <p className="text-sm text-ink-muted">{due ? "Questions you missed, back for another try." : "Nothing due. Misses from any drill show up here."}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Link href={study.drillStart("start")} className={cn(btn.primary, "col-span-2")}>
              Start 10 questions
            </Link>
            <Link href={study.drillStart("mock")} className={btn.ghost}>
              Mock exam
            </Link>
            <Link href={study.cards} className={btn.ghost}>
              Flashcards
            </Link>
          </div>
        </section>

        <section aria-labelledby="ht-t" className="grid content-start gap-3">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="ht-t" className={blockTitle}>
              Topics
            </h2>
            <span className="text-sm text-ink-muted">
              {won} of {TOPICS.length} won
            </span>
          </div>
          <ol className="overflow-hidden rounded-[18px] border border-line">
            {TOPICS.map((t) => {
              const d = statsFor(p, t.id), w = isWon(p, t.id), v = Math.round((d.best || 0) * 100);
              return (
                <li key={t.id} className="border-b border-line last:border-b-0">
                  <Link href={study.topic(t.id)} className="grid min-h-11 grid-cols-[1.75rem_minmax(0,1fr)_4rem_2.75rem] items-center gap-3 px-3 py-2 text-[15px] transition-colors hover:bg-sand">
                    <span className="font-mono text-xs tabular-nums text-ink-muted">{t.n}</span>
                    <span>{t.short}</span>
                    <span aria-hidden className="h-1.5 overflow-hidden rounded-full bg-sand-2">
                      <i className="block h-full bg-clay" style={{ width: `${v}%` }} />
                    </span>
                    <span className={cn("text-right font-mono text-xs tabular-nums", w ? "text-clay-ink" : "text-ink-muted")}>{w ? "Won" : `${d.asked ? v : 0}%`}</span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>
        <section aria-labelledby="htl-t" className="grid content-start gap-3">
          <h2 id="htl-t" className={blockTitle}>
            Tools
          </h2>
          <ul className="overflow-hidden rounded-[18px] border border-line">
            {[{ href: study.solve(), name: "Solve", blurb: "Type in the numbers from any problem and get every answer with the work." }, ...TOOLS.map((t) => ({ href: study.tools(t.id), name: t.name, blurb: t.blurb }))].map((t) => (
              <li key={t.href} className="border-b border-line last:border-b-0">
                <Link href={t.href} className="grid gap-0.5 px-4 py-3 transition-colors hover:bg-sand">
                  <b className="font-semibold">{t.name}</b>
                  <span className="text-sm text-ink-muted">{t.blurb}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <section aria-labelledby="hs-t" className="grid max-w-[760px] gap-3">
        <h2 id="hs-t" className={blockTitle}>
          Sources
        </h2>
        <SourceList limit={6} moreHref={study.sources} />
      </section>
    </div>
  );
}
