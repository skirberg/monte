"use client";

import * as React from "react";
import { Check, Play, Square } from "lucide-react";
import { cn } from "cn";
import { topicById, type StudyTopic, type TopicId } from "@/lib/study/data";
import { stripTags } from "@/lib/study/math";
import { isWon, statsFor, store, updateStudyProgress, useStudyProgress } from "@/lib/study/progress";
import { awardXp } from "@/lib/study/events";
import { Html, btn, linkBtn } from "@/components/study/ui";
import { useHydrated, useStoredString } from "@/lib/hooks";

/** Read it, practice it, win it: the three steps to own a topic. Checks fill in as you go. */
export function TopicPath({ id }: { id: TopicId }) {
  const p = useStudyProgress();
  const d = statsFor(p, id);
  const steps = [
    { on: !!p.read?.[id], label: "Read it", sub: "Reach the end of the page" },
    { on: d.asked >= 4, label: "Practice it", sub: d.asked ? `Best ${Math.round(d.best * 100)}%` : "Answer a few questions" },
    { on: isWon(p, id), label: "Win it", sub: "80% on a drill of 8 or more" },
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
            <b className="block text-sm">
              {s.label}
              <span className="sr-only">{s.on ? ", done" : ", not yet"}</span>
            </b>
            <span className="hidden text-[12.5px] leading-tight text-ink-muted min-[30rem]:block">{s.sub}</span>
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
  const flip = () => {
    store("sigmaQuiz", quiz ? "0" : "1");
    setQuiz(!quiz);
    setShown(new Set());
  };
  return (
    <section aria-labelledby="qa-t" className="grid gap-3">
      <div className="flex items-center justify-between gap-4">
        <h2 id="qa-t" className="font-display text-[clamp(1.35rem,1.2rem+0.6vw,1.6rem)] font-[650] tracking-[-0.02em]">
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
        {t.qa.map(([q, a, why], i) => {
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

/** Remembers this as the last topic open, and marks it read once its last block scrolls into view (XP once). */
export function ReadMarker({ id }: { id: TopicId }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const read = !!useStudyProgress().read?.[id];
  React.useEffect(() => store("sigmaTopic", id), [id]);
  React.useEffect(() => {
    const el = ref.current?.parentElement;
    if (read || !el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (es) => {
        if (!es[0].isIntersecting) return;
        io.disconnect();
        updateStudyProgress((p) => {
          p.read = { ...p.read, [id]: 1 };
        });
        awardXp(5, "read topic");
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [id, read]);
  return <span ref={ref} hidden />;
}
