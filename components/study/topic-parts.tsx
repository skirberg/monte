"use client";

import * as React from "react";
import { ArrowRight, Check, Play, Square } from "lucide-react";
import { cn } from "cn";
import { topicById, type StudyTopic, type TopicId } from "@/lib/study/data";
import { stripTags } from "@/lib/study/math";
import { isWon, lessonsDone, statsFor, store, updateStudyProgress, useStudyProgress } from "@/lib/study/progress";
import { lessonsFor } from "@/lib/study/lessons";
import { study } from "@/lib/study/routes";
import Link from "next/link";
import { awardXp } from "@/lib/study/events";
import { Html, btn, linkBtn } from "@/components/study/ui";
import { useHydrated, useStoredString } from "@/lib/hooks";
import { GUESS } from "@/lib/study/guess";
import { feelRight, feelWrong } from "@/lib/feel";

/** Read it, practice it, master it: the three steps to own a topic. Checks fill in as you go. */
export function TopicPath({ id }: { id: TopicId }) {
  const p = useStudyProgress();
  const d = statsFor(p, id);
  const ls = lessonsFor(id), nDone = lessonsDone(p, id, ls.map((l) => l.slug));
  const steps = [
    { on: ls.length ? nDone === ls.length : !!p.read?.[id], label: "Learn", sub: ls.length ? `${nDone} of ${ls.length} lessons` : "Reach the end of the page" },
    { on: d.asked >= 4, label: "Practice", sub: d.asked ? `Best ${Math.round(d.best * 100)}%` : "Answer a few questions" },
    { on: isWon(p, id), label: "Master", sub: "80% on a drill of 8 or more" },
  ];
  return (
    <ol aria-label="Your progress on this topic" className="my-4 grid grid-cols-3 gap-2">
      {steps.map((s) => (
        <li key={s.label} className="flex items-start gap-2.5 rounded-[14px] bg-sand px-2.5 py-2 sm:px-3 sm:py-2.5">
          <span
            aria-hidden
            className={cn(
              "mt-px grid size-[22px] flex-none place-items-center rounded-full border-[1.5px]",
              s.on ? "border-clay bg-clay text-paper" : "border-line-strong",
            )}
          >
            {s.on && <Check className="size-[13px]" strokeWidth={3} />}
          </span>
          <span className="min-w-0">
            <b className="block whitespace-nowrap text-sm">
              {s.label}
              <span className="sr-only">{s.on ? ", done" : ", not yet"}</span>
            </b>
            <span className="hidden text-xs leading-tight text-ink-muted min-[30rem]:block">{s.sub}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

/** What Listen reads: the lesson in order, with symbols spelled out for the speech engine. */
function speechText(t: StudyTopic) {
  const w = t.why;
  return `${t.name}. ${stripTags(t.line)} ${w ? `${w.click} ${w.care} ` : ""}For example: ${stripTags(t.ex.text)} The trap: ${stripTags(t.trap)} Remember it: ${t.hook}`
    .replace(/x̄/g, "x bar").replace(/p̂/g, "p hat").replace(/μ₀/g, "mu zero").replace(/μ/g, "mu").replace(/σ²/g, "sigma squared")
    .replace(/σ/g, "sigma").replace(/√/g, "root ").replace(/H₀/g, "H zero").replace(/H₁/g, "H one").replace(/≥/g, " at least ")
    .replace(/≤/g, " at most ").replace(/−/g, " minus ").replace(/×/g, " times ").replace(/λ/g, "lambda").replace(/α/g, "alpha")
    .replace(/β/g, "beta").replace(/Φ/g, "phi").replace(/\s+/g, " ");
}

/** Listen: the browser's own speech engine reads the lesson aloud. No audio files, works offline. */
export function Listen({ id }: { id: TopicId }) {
  const t = topicById(id)!;
  const can = useHydrated() && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
  const [on, setOn] = React.useState(false);
  React.useEffect(() => {
    return () => {
      try {
        speechSynthesis.cancel();
      } catch {}
    };
  }, []);
  if (!can) return null;
  const text = speechText(t);
  const toggle = () => {
    speechSynthesis.cancel();
    if (on) return setOn(false);
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.onend = u.onerror = () => setOn(false);
    speechSynthesis.speak(u);
    setOn(true);
  };
  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-3.5 gap-y-2">
      <button type="button" aria-pressed={on} onClick={toggle} className={cn(btn.ghost, btn.on)}>
        {on ? <Square className="fill-current" /> : <Play className="fill-current" />}
        {on ? "Stop" : "Listen"}
      </button>
      <span className="text-sm text-ink-muted">About {Math.max(1, Math.round(text.split(" ").length / 150))} min read aloud</span>
    </div>
  );
}

/** Check yourself. Quiz mode hides each answer behind its own button; the setting is remembered. */
export function QuizList({ id }: { id: TopicId }) {
  const t = topicById(id)!;
  const stored = useStoredString("sigmaQuiz");
  const [chosen, setQuiz] = React.useState<boolean | null>(null);
  const quiz = chosen ?? stored !== "0";
  const [shown, setShown] = React.useState<Set<number>>(new Set());
  // Three questions to start; the rest wait behind one button.
  const [all, setAll] = React.useState(false);
  const FIRST = 3;
  const rest = t.qa.length - FIRST;
  const flip = () => {
    store("sigmaQuiz", quiz ? "0" : "1");
    setQuiz(!quiz);
    setShown(new Set());
  };
  return (
    <section aria-labelledby="qa-t" className="grid gap-3">
      <div className="flex items-center justify-between gap-4">
        <h2 id="qa-t" className="font-display text-heading font-semibold">
          Check yourself
        </h2>
        <button type="button" role="switch" aria-checked={quiz} onClick={flip} className="group flex min-h-11 items-center gap-2.5 text-sm">
          <span
            aria-hidden
            className="relative h-6 w-10 rounded-full border border-line-strong bg-sand-2 transition-colors after:absolute after:left-0.5 after:top-0.5 after:size-[18px] after:rounded-full after:bg-paper after:shadow after:transition-transform group-aria-checked:border-ink group-aria-checked:bg-ink group-aria-checked:after:translate-x-4"
          />
          Quiz mode
        </button>
      </div>
      <ol className="divide-y divide-line border-y border-line">
        {(all ? t.qa : t.qa.slice(0, FIRST)).map(([q, a, why], i) => {
          const open = !quiz || shown.has(i);
          return (
            <li key={i} className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 gap-y-2 py-3.5">
              <Html as="p" html={q} className="font-semibold" />
              {quiz ? (
                <button
                  type="button"
                  aria-expanded={open}
                  aria-controls={`ans-${i}`}
                  onClick={() => setShown((s) => new Set(s.has(i) ? [...s].filter((x) => x !== i) : [...s, i]))}
                  className={cn(linkBtn, "whitespace-nowrap")}
                >
                  {open ? "Hide answer" : "Show answer"}
                </button>
              ) : (
                <span />
              )}
              <div id={`ans-${i}`} hidden={!open} className="col-span-full grid gap-1">
                <Html html={a} className="justify-self-start rounded-lg bg-clay-tint px-2 py-0.5 font-semibold tabular-nums" />
                {why && <Html html={why} className="text-sm text-ink-muted" />}
              </div>
            </li>
          );
        })}
      </ol>
      {!all && rest > 0 && (
        <button type="button" onClick={() => setAll(true)} className={cn(linkBtn, "min-h-11 justify-self-start font-medium")}>
          {rest} more {rest === 1 ? "question" : "questions"}
        </button>
      )}
    </section>
  );
}

const ytId = (u: string) => String(u).match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/)?.[1] ?? null;

/** A video link that can also play in place. Nothing loads from YouTube until the click. */
export function WatchHere({ url, title }: { url: string; title: string }) {
  const v = ytId(url);
  const [open, setOpen] = React.useState(false);
  if (!v) return null;
  return (
    <>
      <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className={cn(linkBtn, "min-h-9")}>
        <Play className="size-3.5 fill-current" aria-hidden /> {open ? "Close video" : "Watch here"}
      </button>
      {open && (
        <div className="mb-2 mt-1 aspect-video overflow-hidden rounded-[18px] bg-sand-2">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${v}?autoplay=1&rel=0`}
            title={title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            loading="lazy"
            className="block size-full border-0"
          />
        </div>
      )}
    </>
  );
}

/**
 * Remembers this as the last topic open, and marks it read (XP once) when its last block is in view
 * after at least 8 seconds on the page, so scrolling straight to the bottom does not count.
 */
export function ReadMarker({ id }: { id: TopicId }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const read = !!useStudyProgress().read?.[id];
  React.useEffect(() => store("sigmaTopic", id), [id]);
  React.useEffect(() => {
    const el = ref.current?.parentElement;
    if (read || !el || !("IntersectionObserver" in window)) return;
    const shownAt = Date.now();
    let visible = false, timer = 0;
    const mark = () => {
      if (!visible) return;
      const wait = 8000 - (Date.now() - shownAt);
      if (wait > 0) {
        window.clearTimeout(timer);
        timer = window.setTimeout(mark, wait + 50);
        return;
      }
      io.disconnect();
      updateStudyProgress((p) => {
        p.read = { ...p.read, [id]: 1 };
      });
      awardXp(5, "read topic");
    };
    const io = new IntersectionObserver(
      (es) => {
        visible = es[0].isIntersecting;
        mark();
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(timer);
    };
  }, [id, read]);
  return <span ref={ref} hidden />;
}

/**
 * Guess first (lib/study/guess.ts): one question before the lesson explains anything. Every choice
 * answers back. The pick is remembered, so coming back shows what you chose.
 */
export function GuessFirst({ id }: { id: TopicId }) {
  const g = GUESS[id];
  const key = `monte-guess-${id}`;
  const saved = useStoredString(key);
  const [mine, setMine] = React.useState<string | null>(null);
  const pick = mine ?? saved ?? "";
  const setPick = (v: string) => {
    setMine(v);
    try {
      localStorage.setItem(key, v);
    } catch {}
  };
  if (!g) return null;
  const chosen = pick === "" ? null : g.options[Number(pick)];
  return (
    <section aria-labelledby="guess-t" className="grid gap-4 rounded-[18px] bg-sand p-5 md:p-6">
      <h2 id="guess-t" className="text-pretty font-display text-lead font-semibold leading-tight">
        {g.q}
      </h2>
      <div role="group" aria-label="Your guess" className="grid gap-2 sm:grid-cols-3">
        {g.options.map((o, i) => {
          const me = String(i) === pick;
          return (
            <button
              key={o.text}
              type="button"
              aria-pressed={me}
              onClick={() => {
                if (o.right) feelRight();
                else feelWrong();
                setPick(String(i));
              }}
              className={cn(
                "min-h-12 rounded-[14px] border bg-paper px-4 py-3 text-left font-medium transition-colors",
                me ? (o.right ? "border-success" : "border-danger") : "border-line-strong hover:border-ink",
                chosen && !me && o.right && "border-success",
              )}
            >
              {o.text}
            </button>
          );
        })}
      </div>
      <p role="status" className="min-h-6 max-w-[62ch] text-base empty:hidden">
        {chosen ? (
          <>
            <b className={chosen.right ? "text-success" : "text-danger"}>{chosen.right ? "Yes. " : "Not quite. "}</b>
            {chosen.why.replace(/^Right\. /, "")}
          </>
        ) : null}
      </p>
      {!chosen && <p className="text-sm text-ink-muted">Guess before you read. A wrong guess is how the lesson sticks.</p>}
    </section>
  );
}


/** The topic's lessons as a short path: done ones checked, the next one lit with a Start button. */
export function TopicLessons({ id }: { id: TopicId }) {
  const p = useStudyProgress();
  const ls = lessonsFor(id);
  if (!ls.length) return null;
  const nextI = ls.findIndex((l) => !p.lessons?.[`${id}/${l.slug}`]);
  return (
    <section aria-labelledby="lessons-t" className="grid gap-3">
      <h2 id="lessons-t" className="font-display text-xl font-semibold">
        {ls.length} lessons, about 3 minutes each
      </h2>
      <ol className="grid gap-2">
        {ls.map((l, i) => {
          const done = !!p.lessons?.[`${id}/${l.slug}`], next = i === nextI;
          return (
            <li key={l.slug}>
              <Link
                href={study.lesson(id, l.slug)}
                aria-current={next ? "step" : undefined}
                className={cn(
                  "grid grid-cols-[2.25rem_minmax(0,1fr)_auto] items-center gap-3 rounded-[14px] border px-3 py-2.5 transition-colors",
                  next ? "border-ink bg-sand hover:bg-sand-2" : "border-line hover:border-ink",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "grid size-9 place-items-center rounded-full border-2 font-mono text-sm tabular-nums",
                    done ? "border-clay bg-clay text-paper" : next ? "border-ink bg-ink text-paper" : "border-line-strong text-ink-muted",
                  )}
                >
                  {done ? <Check className="size-4" strokeWidth={3} /> : i + 1}
                </span>
                <span className="font-semibold">
                  {l.title}
                  {done && <span className="sr-only"> (done)</span>}
                </span>
                {next ? (
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-clay-ink">
                    {i === 0 ? "Start" : "Next"} <ArrowRight className="size-4" aria-hidden />
                  </span>
                ) : (
                  <span />
                )}
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
