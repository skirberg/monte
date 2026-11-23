"use client";

import * as React from "react";
import { ArrowRight, Check, Play, Square, Star } from "lucide-react";
import { cn } from "@/lib/cn";
import { topicById, type TopicId } from "@/lib/study/data";
import { speechText } from "@/lib/study/speech";
import { EXPERT, isExpert, isWon, lessonsDone, statsFor, store, updateStudyProgress, useStudyProgress } from "@/lib/study/progress";
import { lessonsFor } from "@/lib/study/lessons";
import { study } from "@/lib/study/routes";
import Link from "next/link";
import { awardXp } from "@/lib/study/events";
import { Html, btn, linkBtn } from "@/components/study/ui";
import { useHydrated, useStoredString } from "@/lib/hooks";

/** Read it, practice it, master it: the three steps to own a topic. Checks fill in as you go. */
export function TopicPath({ id }: { id: TopicId }) {
  const p = useStudyProgress();
  const d = statsFor(p, id);
  const ls = lessonsFor(id), nDone = lessonsDone(p, id, ls.map((l) => l.slug));
  const won = isWon(p, id), expert = isExpert(p, id);
  const steps = [
    { on: ls.length ? nDone === ls.length : !!p.read?.[id], label: "Learn", sub: ls.length ? `${nDone} of ${ls.length} lessons` : "Reach the end of the page" },
    { on: d.asked >= 4, label: "Practice", sub: d.asked ? `Best ${Math.round(d.best * 100)}%` : "Answer a few questions" },
    // Mastered opens Expert; passing it turns this step into a star.
    expert
      ? { on: true, star: true, label: "Expert", sub: `${Math.round(EXPERT.n * EXPERT.pass)} of ${EXPERT.n} on the fast clock` }
      : { on: won, label: "Master", sub: "80% on a drill of 8 or more" },
  ];
  return (
    <>
    <ol aria-label="Your progress on this topic" className="my-4 grid grid-cols-3 gap-2">
      {steps.map((s) => (
        <li key={s.label} className="flex items-start gap-2.5 rounded-inner bg-sand px-2.5 py-2 sm:px-3 sm:py-2.5">
          <span
            aria-hidden
            className={cn(
              "mt-px grid size-[22px] flex-none place-items-center rounded-full border-[1.5px]",
              s.on ? "border-clay bg-clay text-paper" : "border-line-strong",
            )}
          >
            {s.on && ("star" in s ? <Star className="size-[13px] fill-current" strokeWidth={2} /> : <Check className="size-[13px]" strokeWidth={3} />)}
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
    {/* One next step: test out to master it, or Expert once it is mastered. */}
    {!expert && (
      <Link href={won ? study.drillExpert(id) : study.drillTopic(id)} className={cn(btn.ghost, "btn-sm")}>
        {won ? <Star className="size-4" aria-hidden /> : null}
        {won ? "Go Expert" : "Test out"}
      </Link>
    )}
    </>
  );
}

/**
 * Listen: plays the topic's narration (public/audio/<topic>.mp3, read by Kokoro-82M from scripts/make-audio.py).
 * If the file is missing or will not play, the browser's own speech engine reads the same text instead.
 */
export function Listen({ id }: { id: TopicId }) {
  const t = topicById(id)!;
  const hydrated = useHydrated();
  const [on, setOn] = React.useState(false);
  const audio = React.useRef<HTMLAudioElement | null>(null);
  // Each press of Listen is one run. Stop and unmount end the run, so a late callback from it (a play() rejected by
  // the pause, an error from a half-loaded file) does nothing instead of starting the browser voice.
  const run = React.useRef(0);
  const stop = React.useCallback(() => {
    run.current++;
    audio.current?.pause();
    try {
      speechSynthesis.cancel();
    } catch {}
  }, []);
  React.useEffect(() => stop, [stop]);
  if (!hydrated) return null;
  const text = speechText(t);
  const speak = () => {
    if (!("speechSynthesis" in window)) return setOn(false);
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.onend = u.onerror = () => setOn(false);
    speechSynthesis.speak(u);
  };
  const toggle = () => {
    stop();
    if (on) return setOn(false);
    setOn(true);
    const mine = run.current;
    const a = (audio.current ??= new Audio(`/audio/${id}.mp3`));
    a.currentTime = 0;
    a.onended = () => {
      if (run.current === mine) setOn(false);
    };
    // The file failed (missing, blocked or offline): read the same words with the browser voice, once, and only if
    // this run is still the current one.
    let fellBack = false;
    const fallback = () => {
      if (fellBack || run.current !== mine) return;
      fellBack = true;
      speak();
    };
    a.onerror = fallback;
    a.play().catch((e: unknown) => {
      if (!(e instanceof DOMException && e.name === "AbortError")) fallback();
    });
  };
  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-3.5 gap-y-2">
      <button type="button" aria-pressed={on} onClick={toggle} className={cn(btn.ghost, btn.on)}>
        {on ? <Square className="fill-current" /> : <Play className="fill-current" />}
        {on ? "Stop" : "Listen"}
      </button>
      <span className="text-sm text-ink-muted">About {Math.max(1, Math.round(text.split(" ").length / 150))} min</span>
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
              <Html as="p" html={q} className="max-w-measure font-semibold" />
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
                {why && <Html html={why} className="max-w-measure text-sm text-ink-muted" />}
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
        <div className="mb-2 mt-1 aspect-video overflow-hidden rounded-card bg-sand-2">
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

/** The topic's lessons as a short path: done ones checked, the next one lit with a Start button. */
export function TopicLessons({ id }: { id: TopicId }) {
  const p = useStudyProgress();
  const ls = lessonsFor(id);
  if (!ls.length) return null;
  const nextI = ls.findIndex((l) => !p.lessons?.[`${id}/${l.slug}`]);
  return (
    <section aria-labelledby="lessons-t" className="grid gap-3">
      <h2 id="lessons-t" className="font-display text-xl font-semibold">
        {ls.length} lessons · 3 min each
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
                  "grid grid-cols-[2.25rem_minmax(0,1fr)_auto] items-center gap-3 rounded-inner border px-3 py-2.5 transition-colors",
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
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-ink">
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
