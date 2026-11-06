"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "cn";
import { TOPICS, TOOLS } from "@/lib/study/data";
import { study } from "@/lib/study/routes";
import { hasAnyProgress, isWon, statsFor, useStudyProgress, wonCount, type StudyProgress } from "@/lib/study/progress";
import { Fold, btn, linkBtn } from "@/components/study/ui";
import { GUESS } from "@/lib/study/guess";
import { feelRight, feelWrong } from "@/lib/feel";
import { useStoredString } from "@/lib/hooks";
import type { TopicId } from "@/lib/study/data";


/** Done once a first full set is answered: five questions anywhere, a mock test or a Daily. */
const finishedFirstSet = (p: StudyProgress) =>
  Object.values(p.drill).reduce((n, d) => n + (d?.asked ?? 0), 0) >= 5 || (p.mock || 0) > 0 || Object.keys(p.daily ?? {}).length > 0;

/** A new visitor's start: three small steps instead of fourteen empty meters. Stays until the steps are done. */
function FirstTen({ p }: { p: StudyProgress }) {
  const placed = useStoredString(START_KEY);
  const FIRST = TOPICS.find((t) => t.id === placed) ?? TOPICS[0];
  const LAB_TOPIC = FIRST.labs.length ? FIRST : (TOPICS.slice(FIRST.n - 1).find((t) => t.labs.length) ?? FIRST);
  const steps = [
    { href: study.topic(FIRST.id), title: `Read topic ${FIRST.n}: ${FIRST.name}`, sub: "One plain idea and a real example. About 4 minutes.", done: !!p.read?.[FIRST.id] },
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
        <h2 id="ft-t" className="font-display text-xl font-semibold">
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

// Placement (DESIGN.md, "Lessons"): four of the guess-first questions, easiest to hardest. Your start is the
// first one you miss; get all four and you start after the last. Learned from Brilliant's first run, which asks
// questions "to map your current knowledge" before building a plan.
const PLACE: TopicId[] = ["center", "prob", "clt", "test"];
const START_KEY = "monte-start";

function Placement() {
  const [step, setStep] = React.useState(-1);
  const [pick, setPick] = React.useState<number | null>(null);
  const [missed, setMissed] = React.useState<TopicId | null>(null);
  const done = step >= PLACE.length;
  const startId: TopicId = done ? (missed ?? TOPICS[TOPICS.findIndex((t) => t.id === PLACE[PLACE.length - 1]) + 1].id) : "data";
  const start = TOPICS.find((t) => t.id === startId)!;

  React.useEffect(() => {
    if (!done) return;
    try {
      localStorage.setItem(START_KEY, startId);
      // Same-tab listeners (the first-ten-minutes box) only hear storage events another tab fires.
      window.dispatchEvent(new StorageEvent("storage", { key: START_KEY }));
    } catch {}
  }, [done, startId]);

  if (step < 0)
    return (
      <section aria-labelledby="pl-t" className="flex flex-wrap items-center justify-between gap-4 rounded-[18px] border border-line p-5">
        <div className="grid gap-0.5">
          <h2 id="pl-t" className="font-semibold">Know some statistics already?</h2>
          <p className="text-sm text-ink-muted">Four quick questions find where you should start.</p>
        </div>
        <button type="button" className={btn.ghost} onClick={() => setStep(0)}>
          Find my start
        </button>
      </section>
    );

  if (done)
    return (
      <section aria-labelledby="pl-t" className="grid gap-3 rounded-[18px] border border-line p-5">
        <h2 id="pl-t" className="font-display text-xl font-semibold">
          Start at topic {start.n}: {start.name}
        </h2>
        <p className="text-sm text-ink-muted">
          {start.n === 1 ? "Topic 1 it is. Everything builds from here." : `Topics 1 to ${start.n - 1} are there to skim whenever you want them.`}
        </p>
        <Link href={study.topic(start.id)} className={cn(btn.primary, "justify-self-start")}>
          Start topic {start.n} <ArrowRight aria-hidden />
        </Link>
      </section>
    );

  const id = PLACE[step], g = GUESS[id], chosen = pick === null ? null : g.options[pick];
  return (
    <section aria-labelledby="pl-t" className="grid gap-4 rounded-[18px] border border-line p-5">
      <p className="text-sm text-ink-muted">
        Question {step + 1} of {PLACE.length}
      </p>
      <h2 id="pl-t" className="text-pretty font-display text-lead font-semibold leading-tight">
        {g.q}
      </h2>
      <div role="group" aria-label="Your answer" className="grid gap-2">
        {g.options.map((o, i) => (
          <button
            key={o.text}
            type="button"
            disabled={pick !== null}
            aria-pressed={pick === i}
            onClick={() => {
              setPick(i);
              if (o.right) feelRight();
              else {
                feelWrong();
                setMissed((m) => m ?? id);
              }
            }}
            className={cn(
              "min-h-12 rounded-[14px] border bg-paper px-4 py-3 text-left font-medium transition-colors disabled:cursor-default",
              pick === i ? (o.right ? "border-success" : "border-danger") : pick !== null && o.right ? "border-success" : "border-line-strong enabled:hover:border-ink",
            )}
          >
            {o.text}
          </button>
        ))}
      </div>
      {chosen && (
        <>
          <p role="status" className="max-w-[62ch]">
            <b className={chosen.right ? "text-success" : "text-danger"}>{chosen.right ? "Yes. " : "Not quite. "}</b>
            {chosen.why.replace(/^Right\. /, "")}
          </p>
          <button
            type="button"
            className={cn(btn.primary, "justify-self-start")}
            onClick={() => {
              setPick(null);
              // A miss ends it: that topic is your start.
              setStep(!chosen.right ? PLACE.length : step + 1);
            }}
          >
            {!chosen.right || step + 1 >= PLACE.length ? "See where to start" : "Next question"}
          </button>
        </>
      )}
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
    <div className="grid gap-8 py-block">
      <div className="max-w-[640px]">
        {newcomer ? (
          <div className="grid gap-4">
            <FirstTen p={p} />
            <Placement />
          </div>
        ) : (
          <section aria-labelledby="hp-t" className="grid content-start gap-4 rounded-[18px] bg-sand p-6">
            <h2 id="hp-t" className="font-display text-xl font-semibold">
              Practice
            </h2>
            <div className="grid gap-1">
              <p className="text-sm text-ink-muted">Due today</p>
              <p className="font-mono text-figure font-medium leading-none tracking-tight tabular-nums">{due}</p>
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
                      "grid min-h-11 items-center gap-3 px-3 py-2 text-base transition-colors hover:bg-sand",
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
