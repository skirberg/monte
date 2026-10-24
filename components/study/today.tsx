"use client";

import Link from "next/link";
import { cn } from "cn";
import { TOPICS, TOOLS } from "@/lib/study/data";
import { study } from "@/lib/study/routes";
import { hasAnyProgress, isWon, statsFor, useStudyProgress, wonCount } from "@/lib/study/progress";
import { SourceList } from "@/components/study/sources";
import { blockTitle, btn } from "@/components/study/ui";

const STEPS = [
  ["Learn", "Read the one-line idea, try the example, and drag the lab until the number makes sense."],
  ["Practice", "Answer questions with fresh numbers. Score 80% on a topic to master it."],
  ["Check", "Misses come back in Due today, and the timed mock test shows how ready you are."],
];

const FIRST = TOPICS[0];
// Topic 1 has no lab of its own, so the lab step goes to the first topic that has one.
const LAB_TOPIC = FIRST.labs.length ? FIRST : (TOPICS.find((t) => t.labs.length) ?? FIRST);

/** A brand-new visitor's start: three small steps instead of fourteen empty meters. */
function FirstTen() {
  const steps = [
    { href: study.topic(FIRST.id), title: `Read topic 1: ${FIRST.name}`, sub: "One plain idea and a real example. About 4 minutes." },
    {
      href: `${study.topic(LAB_TOPIC.id)}#lab`,
      title: LAB_TOPIC === FIRST ? "Try its lab" : `Try a lab: ${LAB_TOPIC.short}`,
      sub: "Drag the sliders and watch the numbers move. About 3 minutes.",
    },
    { href: study.drillTopic(FIRST.id, 5, true), title: "Answer 5 questions", sub: `On ${FIRST.short.toLowerCase()}, with no timer. About 3 minutes.` },
  ];
  return (
    <section aria-labelledby="ft-t" className="grid content-start gap-4 rounded-[18px] bg-sand p-6">
      <div className="grid gap-1">
        <h2 id="ft-t" className="font-display text-xl font-[650] tracking-[-0.02em]">
          Your first ten minutes
        </h2>
        <p className="text-sm text-ink-muted">New here? Start with these three. No sign-up, nothing to install.</p>
      </div>
      <ol className="grid gap-2">
        {steps.map((s, i) => (
          <li key={s.title}>
            <Link href={s.href} className="grid grid-cols-[2rem_minmax(0,1fr)] items-start gap-3 rounded-[14px] bg-paper p-3 transition-colors hover:bg-sand-2">
              <span aria-hidden className="grid size-8 place-items-center rounded-full border-[1.5px] border-ink font-mono text-sm font-medium">
                {i + 1}
              </span>
              <span className="grid gap-0.5">
                <b className="font-semibold">{s.title}</b>
                <span className="text-sm text-ink-muted">{s.sub}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Today, the study home: where you stand, what is due, and every way in. A first visit gets a short path instead. */
export function Today() {
  const p = useStudyProgress();
  // The static page (and the first paint) has no progress to read, so it shows the new-visitor path;
  // a returning visitor's browser swaps in their numbers as soon as it hydrates.
  const fresh = !hasAnyProgress(p);
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
        {fresh ? (
          <FirstTen />
        ) : (
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
                Mock test
              </Link>
              <Link href={study.cards} className={btn.ghost}>
                Flashcards
              </Link>
            </div>
          </section>
        )}

        <section aria-labelledby="ht-t" className="grid content-start gap-3">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="ht-t" className={blockTitle}>
              Topics
            </h2>
            {!fresh && (
              <span className="text-sm text-ink-muted">
                {won} of {TOPICS.length} mastered
              </span>
            )}
          </div>
          <ol className="overflow-hidden rounded-[18px] border border-line">
            {TOPICS.map((t) => {
              const d = statsFor(p, t.id), w = isWon(p, t.id), v = Math.round((d.best || 0) * 100);
              return (
                <li key={t.id} className="border-b border-line last:border-b-0">
                  {/* Before any practice the list is just the way in: no column of 0% bars. */}
                  <Link
                    href={study.topic(t.id)}
                    className={cn(
                      "grid min-h-11 items-center gap-3 px-3 py-2 text-[15px] transition-colors hover:bg-sand",
                      fresh ? "grid-cols-[1.75rem_minmax(0,1fr)]" : "grid-cols-[1.75rem_minmax(0,1fr)_4rem_4.75rem]",
                    )}
                  >
                    <span className="font-mono text-xs tabular-nums text-ink-muted">{t.n}</span>
                    <span>{t.short}</span>
                    {!fresh && (
                      <>
                        <span aria-hidden className="h-1.5 overflow-hidden rounded-full bg-sand-2">
                          <i className="block h-full bg-clay" style={{ width: `${v}%` }} />
                        </span>
                        <span className={cn("text-right font-mono text-xs tabular-nums", w ? "text-clay-ink" : "text-ink-muted")}>{w ? "Mastered" : `${d.asked ? v : 0}%`}</span>
                      </>
                    )}
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
