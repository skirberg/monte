"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "cn";
import { TOPICS, TOOLS } from "@/lib/study/data";
import { study } from "@/lib/study/routes";
import { hasAnyProgress, isWon, statsFor, useStudyProgress, wonCount, type StudyProgress } from "@/lib/study/progress";
import { Fold, btn, linkBtn } from "@/components/study/ui";

const FIRST = TOPICS[0];
// Topic 1 has no lab of its own, so the lab step goes to the first topic that has one.
const LAB_TOPIC = FIRST.labs.length ? FIRST : (TOPICS.find((t) => t.labs.length) ?? FIRST);

/** Done once a first full set is answered: five questions anywhere, a mock test or a Daily. */
const finishedFirstSet = (p: StudyProgress) =>
  Object.values(p.drill).reduce((n, d) => n + (d?.asked ?? 0), 0) >= 5 || (p.mock || 0) > 0 || Object.keys(p.daily ?? {}).length > 0;

/** A new visitor's start: three small steps instead of fourteen empty meters. Stays until the steps are done. */
function FirstTen({ p }: { p: StudyProgress }) {
  const steps = [
    { href: study.topic(FIRST.id), title: `Read topic 1: ${FIRST.name}`, sub: "One plain idea and a real example. About 4 minutes.", done: !!p.read?.[FIRST.id] },
    {
      href: `${study.topic(LAB_TOPIC.id)}#lab`,
      title: LAB_TOPIC === FIRST ? "Try its lab" : `Try a lab: ${LAB_TOPIC.short}`,
      sub: "Drag the sliders and watch the numbers move. About 3 minutes.",
      done: false,
    },
    { href: study.drillTopic(FIRST.id, 5, true), title: "Answer 5 questions", sub: `On ${FIRST.short.toLowerCase()}, with no timer. About 3 minutes.`, done: false },
  ];
  return (
    <section aria-labelledby="ft-t" className="grid content-start gap-4 rounded-[18px] bg-sand p-6">
      <div className="grid gap-1">
        <h2 id="ft-t" className="font-display text-xl font-[650] tracking-[-0.02em]">
          Your first ten minutes
        </h2>
        <p className="text-sm text-ink-muted">Three short steps. No sign-up.</p>
      </div>
      <ol className="grid gap-2">
        {steps.map((s, i) => (
          <li key={s.title}>
            <Link href={s.href} className="grid grid-cols-[2rem_minmax(0,1fr)] items-start gap-3 rounded-[14px] bg-paper p-3 transition-colors hover:bg-sand-2">
              <span
                aria-hidden
                className={cn("grid size-8 place-items-center rounded-full border-[1.5px] border-ink font-mono text-sm font-medium", s.done && "bg-ink text-paper")}
              >
                {s.done ? <Check className="size-4" strokeWidth={3} /> : i + 1}
              </span>
              <span className="grid gap-0.5">
                <b className="font-semibold">
                  {s.title}
                  {s.done && <span className="sr-only"> (done)</span>}
                </b>
                <span className="text-sm text-ink-muted">{s.sub}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Today, the study home: one job. A first visit gets a three-step path; a returning visitor gets their next set. Lists wait in folds. */
export function Today() {
  const p = useStudyProgress();
  // The static page (and the first paint) has no progress to read, so it shows the new-visitor path;
  // a returning visitor's browser swaps in their numbers as soon as it hydrates.
  const fresh = !hasAnyProgress(p);
  const newcomer = !finishedFirstSet(p);
  const due = p.due.length, won = wonCount(p);
  return (
    <div className="grid gap-8 pb-8 pt-8 md:pt-12">
      <div className="max-w-[640px]">
        {newcomer ? (
          <FirstTen p={p} />
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
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
              {/* The main button is whatever is waiting: misses first, then a fresh set. */}
              <Link href={study.drillStart(due ? "due" : "start")} className={btn.primary}>
                {due ? `Review ${due} missed` : "Start 10 questions"}
              </Link>
              {due > 0 && (
                <Link href={study.drillStart("start")} className={cn(linkBtn, "min-h-11 font-medium")}>
                  New set
                </Link>
              )}
              <Link href={study.drillStart("mock")} className={cn(linkBtn, "min-h-11 font-medium")}>
                Mock test
              </Link>
              <Link href={study.cards} className={cn(linkBtn, "min-h-11 font-medium")}>
                Flashcards
              </Link>
            </div>
          </section>
        )}
      </div>

      <div className="grid max-w-[640px] gap-3">
        <Fold title="Your topics" teaser={fresh ? `${TOPICS.length} topics, each building on the one before.` : `${won} of ${TOPICS.length} mastered.`}>
          <ol className="overflow-hidden rounded-[14px] border border-line">
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
        </Fold>
        <Fold title="Tools" teaser="Solvers that show the work, and Excel, R, Python and SQL guides.">
          <ul className="overflow-hidden rounded-[14px] border border-line">
            {[{ href: study.solve(), name: "Solve", blurb: "Type in the numbers from any problem and get every answer with the work." }, ...TOOLS.map((t) => ({ href: study.tools(t.id), name: t.name, blurb: t.blurb }))].map((t) => (
              <li key={t.href} className="border-b border-line last:border-b-0">
                <Link href={t.href} className="grid gap-0.5 px-4 py-3 transition-colors hover:bg-sand">
                  <b className="font-semibold">{t.name}</b>
                  <span className="text-sm text-ink-muted">{t.blurb}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Fold>
      </div>
    </div>
  );
}
