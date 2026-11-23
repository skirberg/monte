"use client";

import * as React from "react";
import { track } from "@vercel/analytics";
import Link from "next/link";
import { ArrowRight, Check, RotateCw } from "lucide-react";
import { cn } from "@/lib/cn";
import { TOPICS, TOOLS, type TopicId } from "@/lib/study/data";
import { study } from "@/lib/study/routes";
import { hasAnyProgress, isRusty, isWon, rustyTopics, statsFor, todayKey, useStudyProgress, wonCount, type StudyProgress } from "@/lib/study/progress";
import { Fold, btn, linkBtn } from "@/components/study/ui";
import { GUESS } from "@/lib/study/guess";
import { feelRight, feelWrong } from "@/lib/feel";
import { useStoredString } from "@/lib/hooks";
import { dueToday } from "@/lib/study/memory";
import { PLACE_MAX, placeAnswer, placeNext, placeResult, placeStart, secondQuestion } from "@/lib/study/placement";


/** Done once a first full set is answered: five questions anywhere, a mock test or a Daily. */
const finishedFirstSet = (p: StudyProgress) =>
  Object.values(p.drill).reduce((n, d) => n + (d?.asked ?? 0), 0) >= 5 || (p.mock || 0) > 0 || Object.keys(p.daily ?? {}).length > 0;

/**
 * Keep it fresh (DESIGN.md, "Lessons"): mastered topics left alone two weeks, named, and five mixed questions
 * over them. Learned from Khan Academy, where mastery needs refreshing, and spaced review in general: a little
 * practice after a gap holds what was learned far better than more practice right away.
 */
function KeepFresh({ rusty }: { rusty: TopicId[] }) {
  const names = rusty.map((id) => TOPICS.find((t) => t.id === id)!.short);
  // Topic names have "and" in them, so the list is commas: "2 topics could use a refresh: Data and sampling, Where is the middle."
  const list = `${names.length === 1 ? "One topic" : `${names.length} topics`} could use a refresh: ${names.slice(0, 3).join(", ")}${names.length > 3 ? `, and ${names.length - 3} more` : ""}.`;
  return (
    <section aria-labelledby="kf-t" className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-card border border-line p-5">
      <div className="grid min-w-0 gap-0.5">
        <h2 id="kf-t" className="font-semibold">
          Keep it fresh
        </h2>
        <p className="text-sm text-ink-muted">{list}</p>
      </div>
      <Link href={study.drillStart("review")} className={btn.ghost}>
        <RotateCw className="size-4" aria-hidden /> Refresh
      </Link>
    </section>
  );
}

/** Flashcards waiting, for someone who has only used the cards so far (the Practice box carries the count after that). */
function CardsDue({ n }: { n: number }) {
  return (
    <section aria-labelledby="cd-t" className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-line p-5">
      <div className="grid min-w-0 gap-0.5">
        <h2 id="cd-t" className="font-semibold">
          {n} {n === 1 ? "card" : "cards"} due
        </h2>
        <p className="text-sm text-ink-muted">Each comes back just before you would forget it.</p>
      </div>
      <Link href={`${study.cards}?go=due`} className={btn.ghost}>
        <RotateCw className="size-4" aria-hidden /> Review
      </Link>
    </section>
  );
}

/** A new visitor's start: three small steps instead of fourteen empty meters. Stays until the steps are done. */
function FirstTen({ p }: { p: StudyProgress }) {
  const placed = useStoredString(START_KEY);
  const FIRST = TOPICS.find((t) => t.id === placed) ?? TOPICS[0];
  const LAB_TOPIC = FIRST.labs.length ? FIRST : (TOPICS.slice(FIRST.n - 1).find((t) => t.labs.length) ?? FIRST);
  const steps = [
    { href: study.topic(FIRST.id), title: `Read topic ${FIRST.n}: ${FIRST.short}`, sub: "4 min", done: !!p.read?.[FIRST.id] },
    {
      href: `${study.topic(LAB_TOPIC.id)}#lab`,
      title: LAB_TOPIC === FIRST ? "Try its lab" : `Try a lab: ${LAB_TOPIC.short}`,
      sub: "3 min",
      done: false,
    },
    { href: study.drillTopic(FIRST.id, 5, true), title: "Answer 5 questions, no timer", sub: "3 min", done: false },
  ];
  // The ten minutes as a route (Citymapper's trip, the Learn path's court line): a stop per step on one line, its
  // length in minutes beside it. The next stop is lit in ink, a done one filled. No numbers in circles.
  const next = steps.findIndex((s) => !s.done);
  return (
    <section aria-labelledby="ft-t" className="grid content-start gap-3 rounded-card bg-sand p-6">
      <h2 id="ft-t" className="flex items-baseline justify-between gap-3 font-display text-xl font-semibold">
        Your first ten minutes
        <span className="font-sans text-sm font-normal text-ink-muted">No sign-up</span>
      </h2>
      <ol className="relative grid">
        <span aria-hidden className="absolute bottom-6 left-[7px] top-6 w-0.5 bg-line-strong" />
        {steps.map((s, i) => (
          <li key={s.title}>
            <Link href={s.href} className="group relative grid min-h-12 grid-cols-[1rem_minmax(0,1fr)_auto] items-center gap-3 py-1.5">
              <span
                aria-hidden
                className={cn(
                  "z-10 grid size-4 place-items-center rounded-full border-2 ring-4 ring-sand",
                  s.done ? "border-ink bg-ink text-paper" : i === next ? "border-ink bg-paper" : "border-line-strong bg-sand",
                )}
              >
                {s.done && <Check className="size-2.5" strokeWidth={4} />}
              </span>
              <b className={cn("font-semibold underline decoration-transparent underline-offset-4 transition-colors group-hover:decoration-ink", s.done && "text-ink-muted")}>
                {s.title}
                {s.done && <span className="sr-only"> (done)</span>}
              </b>
              <span className="font-mono text-sm text-ink-muted tabular">{s.sub}</span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

// Find your level (DESIGN.md, "Lessons"): a search along the path (lib/study/placement.ts). Each topic it asks
// about gets two questions, its guess-first question and one from its lessons; both right moves the search later.
// At most four topics, so at most eight questions. Learned from Brilliant's first run, which asks questions "to map
// your current knowledge" before building a plan, and Duolingo's placement, which lets you skip what you know.
const START_KEY = "monte-start";

function Placement() {
  const [on, setOn] = React.useState(false);
  const [place, setPlace] = React.useState(placeStart);
  const [pick, setPick] = React.useState<number | null>(null);
  // 0: the topic's guess question; 1: a question from its lessons, asked only after a right guess.
  const [part, setPart] = React.useState<0 | 1>(0);
  const [answered, setAnswered] = React.useState(0);
  const id = placeNext(place);
  const done = on && id === null;
  const startId = placeResult(place);
  const start = TOPICS.find((t) => t.id === startId)!;

  React.useEffect(() => {
    if (!done) return;
    try {
      localStorage.setItem(START_KEY, startId);
      // Same-tab listeners (the first-ten-minutes box) only hear storage events another tab fires.
      window.dispatchEvent(new StorageEvent("storage", { key: START_KEY }));
    } catch {}
    track("Level found", { start: TOPICS.findIndex((t) => t.id === startId) + 1, answered });
  }, [done, startId, answered]);

  if (!on)
    return (
      <section aria-labelledby="pl-t" className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-line p-5">
        <div className="grid gap-0.5">
          <h2 id="pl-t" className="font-semibold">Know some statistics already?</h2>
        </div>
        <button
          type="button"
          className={btn.ghost}
          onClick={() => {
            setOn(true);
            track("Level started");
          }}
        >
          Find my level
        </button>
      </section>
    );

  if (done)
    return (
      <section aria-labelledby="pl-t" className="grid gap-3 rounded-card border border-line p-5">
        <h2 id="pl-t" className="font-display text-xl font-semibold">
          Start at topic {start.n}: {start.short}
        </h2>
        <p className="text-sm text-ink-muted">
          {start.n === 1 ? "Topic 1 it is. Everything builds from here." : `Topics 1 to ${start.n - 1} are marked skipped. Test out of any of them to master it.`}
        </p>
        <Link href={study.topic(start.id)} className={cn(btn.primary, "justify-self-start")}>
          Start topic {start.n} <ArrowRight aria-hidden />
        </Link>
      </section>
    );

  const g = part === 0 ? GUESS[id!] : secondQuestion(id!), chosen = pick === null ? null : g.options[pick];
  // After this answer: a right guess asks the topic's second question; anything else moves the search.
  const moves = chosen ? part === 1 || !chosen.right : false;
  const after = chosen && moves ? placeAnswer(place, !!chosen.right) : place;
  return (
    <section aria-labelledby="pl-t" className="grid gap-4 rounded-card border border-line p-5">
      {/* At most eight questions; a dot fills for each one answered. */}
      <p className="flex flex-wrap items-center gap-1.5">
        <span className="sr-only">
          Question {answered + 1}, at most {PLACE_MAX * 2}
        </span>
        {Array.from({ length: PLACE_MAX * 2 }, (_, k) => (
          <span key={k} aria-hidden className={cn("h-1.5 w-5 rounded-full", k < answered ? "bg-clay" : k === answered ? "bg-ink" : "bg-line")} />
        ))}
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
              else feelWrong();
            }}
            className="choice"
            data-state={pick === i ? (o.right ? "right" : "wrong") : pick !== null && o.right ? "right" : undefined}
          >
            {o.text}
          </button>
        ))}
      </div>
      {chosen && (
        <>
          <p role="status" className="max-w-measure">
            <b className={chosen.right ? "text-success" : "text-danger"}>{chosen.right ? "Yes. " : "Not quite. "}</b>
            {chosen.why.replace(/^Right\. /, "")}
          </p>
          <button
            type="button"
            className={cn(btn.primary, "justify-self-start")}
            onClick={() => {
              setPick(null);
              setAnswered((n) => n + 1);
              setPart(moves ? 0 : 1);
              setPlace(after);
            }}
          >
            {moves && placeNext(after) === null ? "See my level" : "Next question"}
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
  const today = todayKey();
  const rusty = rustyTopics(p, today);
  // Flashcards the memory model says are due by tonight (lib/study/memory.ts).
  const cardsDue = dueToday(p.mem, Date.parse(`${today}T12:00:00`));
  return (
    <div className="grid gap-8 py-block">
      <div className="max-w-[640px]">
        {newcomer ? (
          <div className="grid gap-4">
            {cardsDue > 0 && <CardsDue n={cardsDue} />}
            <FirstTen p={p} />
            <Placement />
          </div>
        ) : (
          <section aria-labelledby="hp-t" className="grid content-start gap-4 rounded-card bg-sand p-6">
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
              <Link href={cardsDue ? `${study.cards}?go=due` : study.cards} className={cn(linkBtn, "min-h-11 font-medium")}>
                {cardsDue ? `${cardsDue} ${cardsDue === 1 ? "card" : "cards"} due` : "Flashcards"}
              </Link>
            </div>
          </section>
        )}
        {rusty.length > 0 && <KeepFresh rusty={rusty} />}
      </div>

      <div className="grid max-w-[640px] gap-3">
        <Fold title="Your topics" teaser={fresh ? undefined : `${won} of ${TOPICS.length} mastered`}>
          <ol className="overflow-hidden rounded-inner border border-line">
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
                        <span className={cn("text-right font-mono text-xs tabular-nums", w && !isRusty(p, t.id, today) ? "text-clay-ink" : "text-ink-muted")}>
                          {w ? (isRusty(p, t.id, today) ? "Rusty" : "Mastered") : `${d.asked ? v : 0}%`}
                        </span>
                      </>
                    )}
                  </Link>
                </li>
              );
            })}
          </ol>
        </Fold>
        <Fold title="Tools">
          <ul className="overflow-hidden rounded-inner border border-line">
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
