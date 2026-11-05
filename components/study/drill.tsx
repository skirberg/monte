"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { track } from "@vercel/analytics";
import { Check, X } from "lucide-react";
import { cn } from "cn";
import { TOPICS, TOPIC_IDS, isTopicId, topicById, type TopicId } from "@/lib/study/data";
import { dailyQuestions, dayKey, generate, isCorrect, pickTopics, shownAnswer, type Question } from "@/lib/study/drill";
import { mt, plural } from "@/lib/study/math";
import { study } from "@/lib/study/routes";
import { getStudyProgress, hasAnyProgress, isWon, mastersTopic, recall, setScore, settleDue, statsFor, store, updateStudyProgress, useStudyProgress, wonCount } from "@/lib/study/progress";
import { awardBadge, awardXp } from "@/lib/study/events";
import { liveStreak, useProgress } from "@/lib/progress";
import { useStoredString } from "@/lib/hooks";
import { burstFrom, callout, celebrate } from "@/lib/fun";
import { Fold, blockTitle, btn, chip, eyebrow, input, linkBtn } from "@/components/study/ui";
import { sym } from "@/lib/study/symbols";

type Mode = "ten" | "mock" | "full" | "due" | "topic" | "daily";
/** `timed` is false for a set run without a clock; `inARow` counts right answers since the last miss. */
type Run = { qs: Question[]; i: number; correct: number; missed: Question[]; end: number; timed: boolean; inARow: number; mode: Mode; mock: boolean; answered: boolean; ok: boolean | null };
type Result = { pct: number; correct: number; n: number; answered: number; mastered: boolean; mock: boolean; whole: boolean; missed: Question[]; daily?: { grid: string; first: boolean; firstScore: number; share: string } };

/** Saved choice: "1" runs normal drills without a clock. Mock tests are always timed. */
const UNTIMED_KEY = "sigmaUntimed";

const scoreBand = (pct: number) => (pct >= 80 ? "80-100" : pct >= 60 ? "60-79" : pct >= 40 ? "40-59" : "0-39");
const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

const NOTHING_DUE = "Nothing is due yet. Run a drill first; any question you miss comes back here.";

function newRun(mode: Mode, mods: TopicId[], count: number, seconds: number, mock: boolean, fixed?: Question[], timed = true): Run {
  const qs = fixed ?? pickTopics(mods, count).map(generate);
  return { qs, i: 0, correct: 0, missed: [], end: Date.now() + seconds * 1000, timed: mock || timed, inARow: 0, mode, mock, answered: false, ok: null };
}

/**
 * The set a link asks for (?go=start, mock, due, daily or ?topic=id, with optional &n=5 and
 * &timer=off), built as the page first renders.
 */
function fromLink(params: URLSearchParams): { run?: Run; msg?: string } | null {
  const go = params.get("go"), topic = params.get("topic");
  const timed = params.get("timer") !== "off" && recall(UNTIMED_KEY) !== "1";
  if (go === "start") return { run: newRun("ten", TOPIC_IDS, 10, 600, false, undefined, timed) };
  if (go === "mock") return { run: newRun("mock", TOPIC_IDS, 20, 1800, true) };
  if (go === "daily") return { run: newRun("daily", TOPIC_IDS, 5, 600, false, dailyQuestions(), timed) };
  if (go === "due") {
    const list = getStudyProgress().due;
    return list.length ? { run: newRun("due", TOPIC_IDS, 0, 600, false, list.slice(0, 10).map(generate), timed) } : { msg: NOTHING_DUE };
  }
  if (isTopicId(topic)) {
    const n = Math.min(20, Math.max(3, Math.round(Number(params.get("n")) || 8)));
    return { run: newRun("topic", [topic], n, n * 60, false, undefined, timed) };
  }
  return go || topic ? {} : null;
}

function Meter({ k, v, bar, c }: { k: string; v: string; bar?: number; c?: string }) {
  return (
    <div className="grid content-start gap-1.5 p-4">
      <span className={eyebrow}>{k}</span>
      <span className="font-mono text-[28px] font-medium tabular-nums tracking-[-0.03em]">{v}</span>
      {bar != null && (
        <span className="h-2 overflow-hidden rounded-full bg-sand-2">
          <i className="block h-full bg-clay" style={{ width: `${bar}%` }} />
        </span>
      )}
      {c && <span className="text-xs text-ink-muted">{c}</span>}
    </div>
  );
}

/** Practice > Drill: sets with fresh numbers (timed unless you turn the clock off), the mock test, Due today and Monte Daily. */
export function Drill() {
  const p = useStudyProgress();
  const site = useProgress();
  const router = useRouter();
  const params = useSearchParams();
  const [mix, setMix] = React.useState<Set<TopicId>>(() => new Set(TOPIC_IDS));
  // Links like /study/practice/drill/?go=mock start a set as the page opens; see `fromLink`.
  const [link] = React.useState(() => fromLink(params));
  const [run, setRun] = React.useState<Run | null>(link?.run ?? null);
  const [result, setResult] = React.useState<Result | null>(null);
  const [msg, setMsg] = React.useState(link?.msg ?? "");
  const [value, setValue] = React.useState("");
  const [now, setNow] = React.useState(() => Date.now());
  const inRef = React.useRef<HTMLInputElement>(null);
  const nextRef = React.useRef<HTMLButtonElement>(null);
  const cardRef = React.useRef<HTMLElement>(null);

  const due = p.due.length, won = wonCount(p), answeredAll = Object.values(p.drill).reduce((n, d) => n + (d?.asked ?? 0), 0);
  const fresh = !hasAnyProgress(p);
  const streak = site ? liveStreak(site) : 0;
  // No timer: saved in this browser, read without a hydration mismatch, and changed here at once.
  const storedUntimed = useStoredString(UNTIMED_KEY) === "1";
  const [untimedPick, setUntimedPick] = React.useState<boolean | null>(null);
  const untimed = untimedPick ?? storedUntimed;
  const toggleUntimed = () => {
    setUntimedPick(!untimed);
    store(UNTIMED_KEY, untimed ? "0" : "1");
  };

  const focusCard = () =>
    requestAnimationFrame(() => {
      cardRef.current?.scrollIntoView({ block: "nearest" });
      inRef.current?.focus({ preventScroll: true });
    });

  const start = (mode: Mode, mods: TopicId[], count: number, seconds: number, mock: boolean, fixed?: Question[]) => {
    setMsg("");
    setResult(null);
    setValue("");
    setRun(newRun(mode, mods, count, seconds, mock, fixed, !untimed));
    setNow(Date.now());
    track("Drill started", { mode });
    focusCard();
  };

  const startDue = () => {
    const list = getStudyProgress().due;
    if (!list.length) {
      setRun(null);
      setResult(null);
      setMsg(NOTHING_DUE);
      return;
    }
    // Nothing leaves the list until it is answered; finish() settles it.
    start("due", TOPIC_IDS, 0, 600, false, list.slice(0, 10).map(generate));
  };

  // A set started from a link: report it and tidy the address.
  React.useEffect(() => {
    if (!link) return;
    if (link.run) {
      track("Drill started", { mode: link.run.mode });
      focusCard();
    }
    router.replace(study.drill, { scroll: false });
  }, [link, router]);

  const finish = React.useCallback((r: Run) => {
    const n = r.qs.length, answered = r.correct + r.missed.length, whole = r.mock || r.mode === "daily", pc = setScore(r.correct, answered, n, whole);
    const per: Partial<Record<TopicId, { a: number; c: number }>> = {};
    r.qs.forEach((q) => (per[q.mod] ??= { a: 0, c: 0 }));
    r.qs.slice(0, answered).forEach((q) => {
      per[q.mod]!.a++;
      if (!r.missed.includes(q)) per[q.mod]!.c++;
    });
    let daily: Result["daily"];
    updateStudyProgress((s) => {
      (Object.keys(per) as TopicId[]).forEach((id) => {
        const d = { ...statsFor(s, id) };
        d.asked += per[id]!.a;
        d.correct += per[id]!.c;
        if (per[id]!.a >= 4) d.best = Math.max(d.best, per[id]!.c / per[id]!.a);
        s.drill[id] = d;
      });
      if (r.mock) s.mock = Math.max(s.mock || 0, pc);
      if (r.mode === "daily") {
        const grid = r.qs.map((q, i) => (i < answered && !r.missed.includes(q) ? "🟧" : "⬜")).join(""), dk = dayKey();
        s.daily ??= {};
        const first = !s.daily[dk];
        if (first) s.daily[dk] = { c: r.correct, g: grid };
        daily = { grid, first, firstScore: s.daily[dk].c, share: `Monte Daily ${dk}  ${r.correct}/${n}\n${grid}\nmonte.markets${study.drillStart("daily")}` };
      }
      s.due = settleDue(s.due, r.mode === "due" ? r.qs.slice(0, answered).map((q) => q.mod) : [], r.missed.map((q) => q.mod));
    });
    // A set ended before any answer earns nothing.
    // Mastery needs the whole set answered, so ending early on a hot streak never masters a topic.
    const mastered = mastersTopic(r.mode, answered, pc);
    if (answered) {
      awardXp(answered >= n ? 20 : 5, "drill finished");
      awardBadge("first-drill");
      if (mastered) awardBadge("topic-won");
      if (r.mock && pc >= 0.8) awardBadge("mock-pass");
      if (wonCount(getStudyProgress()) === TOPICS.length) awardBadge("all-topics");
    }
    if (daily?.first) awardXp(15, "daily");
    track("Drill finished", { mode: r.mode, score: scoreBand(Math.round(pc * 100)) });
    if (pc >= 0.8) celebrate(mastered ? "Topic mastered." : "Great set.");
    setRun(null);
    setResult({ pct: Math.round(pc * 100), correct: r.correct, n, answered, mastered, mock: r.mock, whole, missed: r.missed, daily });
  }, []);

  // The clock: tick twice a second, finish when it runs out. Untimed sets have no clock.
  React.useEffect(() => {
    if (!run?.timed) return;
    const id = window.setInterval(() => {
      setNow(Date.now());
      if (Date.now() >= run.end) finish(run);
    }, 500);
    return () => window.clearInterval(id);
  }, [run, finish]);

  const check = () => {
    if (!run || run.answered || !value.trim()) return;
    const q = run.qs[run.i], ok = isCorrect(q, value.trim());
    const inARow = ok ? run.inARow + 1 : 0;
    setRun({ ...run, answered: true, ok, inARow, correct: run.correct + (ok ? 1 : 0), missed: ok ? run.missed : [...run.missed, q] });
    awardXp(ok ? 10 : 2, "drill");
    if (ok) {
      burstFrom(inRef.current);
      // A word of praise only for a run of three or more, so it still means something.
      if (inARow >= 3) callout();
    }
    requestAnimationFrame(() => nextRef.current?.focus({ preventScroll: true }));
  };
  const next = () => {
    if (!run) return;
    if (run.i + 1 >= run.qs.length) return finish(run);
    setRun({ ...run, i: run.i + 1, answered: false, ok: null });
    setValue("");
    requestAnimationFrame(() => inRef.current?.focus({ preventScroll: true }));
  };

  const left = run ? Math.max(0, Math.round((run.end - now) / 1000)) : 0;
  const q = run?.qs[run.i];
  const done = run ? run.correct + run.missed.length : 0;
  const card = "grid gap-5 rounded-[18px] border border-line bg-paper p-5 shadow-[0_1px_0_var(--line),0_12px_32px_-24px_color-mix(in_oklch,var(--ink)_30%,transparent)] md:p-7";
  const resultMsg = result
    ? `${result.correct} of ${result.whole ? result.n : result.answered} correct${
        result.answered < result.n ? (result.whole ? ` (${result.n - result.answered} left unanswered count as wrong)` : `, ended with ${result.n - result.answered} not answered`) : ""
      }. ${
        result.mastered
          ? "Topic mastered."
          : result.pct >= 80
            ? "Strong set."
            : result.pct >= 60
              ? "Close. One more set and you have it."
              : "Warm-up set. Read the misses below, then go again."
      }`
    : "";

  return (
    <div className="grid gap-6 pb-8">
      {/* Meters only once there is something to measure. */}
      {!fresh && (
        <div role="group" aria-label="Your progress" className="grid grid-cols-2 divide-line overflow-hidden rounded-[18px] border border-line md:grid-cols-4 md:divide-x [&>*:nth-child(-n+2)]:border-b [&>*:nth-child(-n+2)]:border-line md:[&>*:nth-child(-n+2)]:border-b-0 [&>*:nth-child(odd)]:border-r [&>*:nth-child(odd)]:border-line md:[&>*:nth-child(odd)]:border-r-0">
          <Meter k="Topics mastered" v={`${won} of ${TOPICS.length}`} bar={Math.round((won / TOPICS.length) * 100)} />
          <Meter k="Answered" v={String(answeredAll)} c="Questions, across every set" />
          <Meter k="Streak" v={plural(streak, "day")} c="Learn something each day" />
          <Meter k="Due today" v={String(due)} c="Missed questions come back" />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10">
        <div className="grid min-w-0 content-start gap-4">
          {!run && !result && (
            <section aria-labelledby="ds-t" className={card}>
              <div className="grid gap-1.5">
                <h2 id="ds-t" className={blockTitle}>
                  Start a drill
                </h2>
                <p className="text-sm text-ink-muted">
                  10 questions with fresh numbers, {mix.size === TOPICS.length || !mix.size ? "from every topic" : `from ${plural(mix.size, "topic")}`}, {untimed ? "no timer" : "10 minutes on the clock"}.
                </p>
              </div>
              <div>
                <button type="button" data-start="ten" className={btn.primary} onClick={() => start("ten", mix.size ? [...mix] : TOPIC_IDS, 10, 600, false)}>
                  Start 10 questions
                </button>
              </div>
              <p role="status" className="text-sm empty:hidden">
                {msg}
              </p>
              <div className="flex flex-wrap gap-x-5 gap-y-1">
                <button type="button" data-start="mock" className={cn(linkBtn, "min-h-11 font-medium")} onClick={() => start("mock", TOPIC_IDS, 20, 1800, true)}>
                  Mock test
                </button>
                {due > 0 ? (
                  <button type="button" data-start="due" className={cn(linkBtn, "min-h-11 font-medium")} onClick={startDue}>
                    Due today ({due})
                  </button>
                ) : (
                  <button type="button" data-start="daily" className={cn(linkBtn, "min-h-11 font-medium")} onClick={() => start("daily", TOPIC_IDS, 5, 600, false, dailyQuestions())}>
                    Monte Daily
                  </button>
                )}
              </div>
              <Fold title="Choose topics and timer" teaser={mix.size === TOPICS.length || !mix.size ? "All topics" : plural(mix.size, "topic")} level="h3" className="-mx-1">
                <div className="grid gap-4">
                  <div role="group" aria-label="Topics in the mix" className="flex flex-wrap gap-2">
                    {TOPICS.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        aria-pressed={mix.has(t.id)}
                        className={chip}
                        onClick={() => setMix((m) => new Set(m.has(t.id) ? [...m].filter((x) => x !== t.id) : [...m, t.id]))}
                      >
                        {t.n}. {t.short}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <button type="button" aria-pressed={untimed} aria-describedby="untimed-note" className={chip} onClick={toggleUntimed}>
                      <span aria-hidden className={cn("grid size-4 place-items-center rounded-[4px] border-[1.5px]", untimed ? "border-ink bg-ink text-paper" : "border-line-strong")}>
                        {untimed && <Check className="size-3" strokeWidth={3} />}
                      </span>
                      No timer
                    </button>
                    <span id="untimed-note" className="text-sm text-ink-muted">
                      Mock tests keep their clock.
                    </span>
                  </div>
                  <button type="button" data-start="full" className={cn(linkBtn, "min-h-11 justify-self-start")} onClick={() => start("full", TOPIC_IDS, 20, 7200, true)}>
                    Full mock: 20 questions, 2 hours
                  </button>
                  <p className="text-sm text-ink-muted">Answers count within 2%, or rounded to two significant figures. Type decimals like 0.42, not 42%.</p>
                </div>
              </Fold>
            </section>
          )}

          {run && q && (
            <section ref={cardRef} aria-labelledby="d-q" className={card}>
              <div className="flex items-center justify-between gap-3 font-mono text-[11px] uppercase tracking-[0.06em] text-ink-muted">
                <span>
                  {run.mode === "daily" ? `Monte Daily, ${dayKey()}: ` : ""}Question {run.i + 1} of {run.qs.length}
                  {done ? `, score ${run.correct} of ${done}` : ""}
                </span>
                {run.timed ? (
                  <span role="timer" aria-label="Time left" className={cn("text-[22px] font-medium normal-case tracking-normal tabular-nums", left < 30 && "text-danger")}>
                    {clock(left)}
                  </span>
                ) : (
                  <span>No timer</span>
                )}
              </div>
              <div className="grid gap-2">
                <p className={eyebrow}>{topicById(q.mod)?.short}</p>
                <p id="d-q" className="text-[clamp(1.15rem,1rem+0.6vw,1.4rem)] font-medium leading-snug">
                  {sym(mt(q.q))}
                </p>
              </div>
              <div className="flex gap-2">
                <label htmlFor="d-in" className="sr-only">
                  Your answer
                </label>
                <input
                  ref={inRef}
                  id="d-in"
                  type="text"
                  // The iOS decimal keypad has no letters and no minus key.
                  inputMode={q.text || (q.a as number) < 0 ? "text" : "decimal"}
                  autoComplete="off"
                  placeholder={q.text ? "Type a word" : "Your answer"}
                  value={value}
                  disabled={run.answered}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key !== "Enter") return;
                    e.preventDefault();
                    if (!run.answered) check();
                    else next();
                  }}
                  className={cn(input, "font-mono text-lg")}
                />
                {run.answered ? (
                  <button ref={nextRef} type="button" className={cn(btn.primary, "flex-none")} onClick={next}>
                    {run.i + 1 >= run.qs.length ? "See my score" : "Next question"}
                  </button>
                ) : (
                  <button type="button" className={cn(btn.primary, "flex-none")} onClick={check}>
                    Check
                  </button>
                )}
              </div>
              <div role="status" className="grid gap-1 empty:hidden">
                {run.answered && (
                  <>
                    <p className={cn("flex items-center gap-1.5 font-semibold", run.ok ? "text-success" : "text-danger")}>
                      {run.ok ? <Check className="size-4" aria-hidden /> : <X className="size-4" aria-hidden />}
                      {run.ok ? "Correct" : "Not quite"}
                    </p>
                    <p className="text-sm text-ink-muted">
                      Answer <span className="rounded-lg bg-clay-tint px-1.5 py-0.5 font-mono font-semibold text-ink">{sym(mt(shownAnswer(q)))}</span>
                    </p>
                    <p className="text-sm text-ink-muted">{sym(mt(q.why))}</p>
                    {!run.ok && <p className="text-sm text-ink-muted">This one comes back in Due today.</p>}
                  </>
                )}
              </div>
              <div>
                <button type="button" className={linkBtn} onClick={() => finish(run)}>
                  End this drill
                </button>
              </div>
            </section>
          )}

          {result && (
            <section aria-labelledby="r-score" className={card}>
              <div className="grid gap-2">
                <p id="r-score" className="font-mono text-[clamp(40px,6vw,64px)] font-medium leading-none tracking-[-0.04em] tabular-nums">
                  {result.pct}%
                </p>
                <p>{resultMsg}</p>
              </div>
              {result.daily && <DailyShare d={result.daily} correct={result.correct} n={result.n} />}
              {result.missed.length > 0 && (
                <div className="grid gap-3">
                  <h2 className="text-sm text-ink-muted">Missed questions, back in Due today</h2>
                  <ol className="divide-y divide-line border-y border-line">
                    {result.missed.map((m, i) => (
                      <li key={i} className="grid gap-1 py-3">
                        <p>{sym(mt(m.q))}</p>
                        <span className="justify-self-start rounded-lg bg-clay-tint px-1.5 py-0.5 font-mono font-semibold">{sym(mt(shownAnswer(m)))}</span>
                        <span className="text-sm text-ink-muted">{sym(mt(m.why))}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
              <div>
                <button type="button" className={btn.primary} onClick={() => setResult(null)}>
                  Drill again
                </button>
              </div>
            </section>
          )}
        </div>

        <aside aria-labelledby="draw-t" className="hidden content-start gap-3 lg:grid">
          <div className="grid gap-1">
            <h2 id="draw-t" className={blockTitle}>
              Your topics
            </h2>
            <p className="text-sm text-ink-muted">Tap one for 8 questions. Score 80% to master it.</p>
          </div>
          <ol className="overflow-hidden rounded-[18px] border border-line">
            {TOPICS.map((t) => {
              const d = statsFor(p, t.id), w = isWon(p, t.id), v = Math.round((d.best || 0) * 100);
              return (
                <li key={t.id} className="border-b border-line last:border-b-0">
                  <button type="button" onClick={() => start("topic", [t.id], 8, 480, false)} className="grid min-h-11 w-full grid-cols-[1.5rem_minmax(0,1fr)_4rem] items-center gap-3 px-3 py-2 text-left text-[15px] transition-colors hover:bg-sand">
                    <span className="font-mono text-xs tabular-nums text-ink-muted">{t.n}</span>
                    <span className="grid">
                      {t.short}
                      {(w || d.asked > 0) && <span className={cn(eyebrow, w && "text-clay-ink")}>{w ? `Mastered, best ${v}%` : `Best ${v}%`}</span>}
                    </span>
                    <span aria-hidden className="h-1.5 overflow-hidden rounded-full bg-sand-2">
                      <i className="block h-full bg-clay" style={{ width: `${v}%` }} />
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </aside>
      </div>
    </div>
  );
}

function DailyShare({ d, correct, n }: { d: NonNullable<Result["daily"]>; correct: number; n: number }) {
  const [label, setLabel] = React.useState("Share result");
  const share = async () => {
    const flash = (m: string) => {
      setLabel(m);
      setTimeout(() => setLabel("Share result"), 1600);
    };
    if (navigator.share) return navigator.share({ text: d.share }).catch(() => {});
    try {
      await navigator.clipboard.writeText(d.share);
      flash("Copied");
    } catch {
      flash("Copy failed");
    }
  };
  return (
    <div className="grid justify-items-start gap-2.5 rounded-[18px] bg-sand p-5">
      <p className="text-[34px] leading-none tracking-[6px]" aria-label={`${correct} of ${n} right`}>
        {d.grid}
      </p>
      <p className="text-sm text-ink-muted">{d.first ? "Same five questions for everyone today. New set tomorrow." : `Your first try today was ${d.firstScore} of ${n}. That one counts.`}</p>
      <button type="button" className={btn.primary} onClick={share}>
        {label}
      </button>
    </div>
  );
}
