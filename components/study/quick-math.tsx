"use client";

import * as React from "react";
import { track } from "@vercel/analytics";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "cn";
import { fmt, mt, parseAnswer, pick, plural, r3 } from "@/lib/study/math";
import { CATS, HABITS, TRICKS, mathCorrect, type Level, type MathQ, type Trick, type TrickCat } from "@/lib/study/tricks";
import { touchStreak, updateStudyProgress, useStudyProgress } from "@/lib/study/progress";
import { awardXp } from "@/lib/study/events";
import { burstFrom } from "@/lib/fun";
import { blockTitle, btn, chip, input, segBtn } from "@/components/study/ui";

type Q = MathQ & { t: Trick };
type Sprint = { pool: Trick[]; learn: boolean; secs: number; label: string; end: number; n: number; c: number; missed: Q[]; q: Q; last: { ok: boolean; q: Q } | null; level: Level };
type Done = { n: number; c: number; missed: Q[]; learn: boolean; secs: number; level: Level };

const ask = (pool: Trick[], lv: Level): Q => {
  const t = pick(pool);
  return { ...t.g(lv), t };
};
const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
const card = "grid gap-5 rounded-[18px] border border-line bg-paper p-5 shadow-[0_1px_0_var(--line),0_12px_32px_-24px_color-mix(in_oklch,var(--ink)_30%,transparent)] md:p-7";

/** Practice > Quick math: the mental-math tricks, a learn mode with hints and timed sprints. */
export function QuickMath() {
  const p = useStudyProgress();
  const [cats, setCats] = React.useState<Set<TrickCat>>(() => new Set(Object.keys(CATS) as TrickCat[]));
  const [level, setLevel] = React.useState<Level>(1);
  const [run, setRun] = React.useState<Sprint | null>(null);
  const [done, setDone] = React.useState<Done | null>(null);
  const [value, setValue] = React.useState("");
  const [now, setNow] = React.useState(0);
  const inRef = React.useRef<HTMLInputElement>(null);
  const cardRef = React.useRef<HTMLElement>(null);

  const start = (secs: number, pool: Trick[], learn: boolean, label: string, mode: string) => {
    touchStreak();
    setDone(null);
    setValue("");
    setRun({ pool, learn, secs, label, end: Date.now() + secs * 1000, n: 0, c: 0, missed: [], q: ask(pool, level), last: null, level });
    setNow(Date.now());
    track("Quick math started", { mode });
    requestAnimationFrame(() => {
      cardRef.current?.scrollIntoView({ block: "nearest" });
      inRef.current?.focus({ preventScroll: true });
    });
  };
  const selected = () => {
    const list = [...cats], pool = TRICKS.filter((t) => cats.has(t.cat));
    return { pool: pool.length ? pool : TRICKS, list };
  };

  const finish = React.useCallback((r: Sprint) => {
    if (!r.learn && r.secs === 60) {
      const k = r.label || "mixed";
      updateStudyProgress((s) => {
        s.math = { ...s.math, [k]: Math.max(s.math[k] || 0, r.c) };
      });
    }
    setRun(null);
    setDone({ n: r.n, c: r.c, missed: r.missed, learn: r.learn, secs: r.secs, level: r.level });
  }, []);

  React.useEffect(() => {
    if (!run || run.learn) return;
    const id = window.setInterval(() => {
      setNow(Date.now());
      if (Date.now() >= run.end) finish(run);
    }, 250);
    return () => window.clearInterval(id);
  }, [run, finish]);

  const answer = (skip: boolean) => {
    if (!run) return;
    const raw = value.trim();
    if (!skip && !raw) return;
    const ok = !skip && mathCorrect(run.q, parseAnswer(raw));
    if (ok) {
      awardXp(2, "quick math");
      burstFrom(inRef.current, 10);
    }
    setRun({ ...run, n: run.n + 1, c: run.c + (ok ? 1 : 0), missed: ok ? run.missed : [...run.missed, run.q], last: { ok, q: run.q }, q: ask(run.pool, run.level) });
    setValue("");
    inRef.current?.focus({ preventScroll: true });
  };

  const left = run ? Math.max(0, Math.round((run.end - now) / 1000)) : 0;
  const bests = Object.keys(p.math);
  const rate = done && done.n ? Math.round((done.c / done.n) * 100) : 0;

  return (
    <div className="grid gap-8 pb-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10">
        <div className="grid content-start gap-4">
          {!run && !done && (
            <section aria-labelledby="ms-t" className={card}>
              <div className="grid gap-2">
                <h2 id="ms-t" className={blockTitle}>
                  Quick math
                </h2>
                <p className="text-sm text-ink-muted">Two ways in. Learn shows the trick on every question with no clock. Sprint is the timed test. Start on level 1 and move up when accuracy is above 80%.</p>
              </div>
              <div className="grid gap-2">
                <p id="cat-label" className="text-sm text-ink-muted">
                  Categories
                </p>
                <div role="group" aria-labelledby="cat-label" className="flex flex-wrap gap-2">
                  {(Object.keys(CATS) as TrickCat[]).map((k) => (
                    <button key={k} type="button" aria-pressed={cats.has(k)} className={chip} onClick={() => setCats((c) => new Set(c.has(k) ? [...c].filter((x) => x !== k) : [...c, k]))}>
                      {CATS[k]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid gap-2">
                <p id="lvl-label" className="text-sm text-ink-muted">
                  Level
                </p>
                <div role="group" aria-labelledby="lvl-label" className="flex w-fit gap-0.5 rounded-full bg-sand p-[3px]">
                  {([1, 2, 3] as Level[]).map((l) => (
                    <button key={l} type="button" aria-pressed={level === l} className={segBtn} onClick={() => setLevel(l)}>
                      {l} {["easy", "exam", "hard"][l - 1]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" className={btn.primary} onClick={() => start(0, selected().pool, true, "", "learn")}>
                  Learn, untimed with hints
                </button>
                <button
                  type="button"
                  className={btn.ghost}
                  onClick={() => {
                    const s = selected();
                    start(60, s.pool, false, s.list.length === 1 ? s.list[0] : "mixed", "sprint 60s");
                  }}
                >
                  Sprint 60 seconds
                </button>
                <button type="button" className={btn.ghost} onClick={() => start(180, selected().pool, false, "", "sprint 3min")}>
                  Sprint 3 minutes
                </button>
              </div>
              <p className="text-sm text-ink-muted [&_b]:font-semibold [&_b]:text-ink">
                {bests.length ? (
                  <>
                    Best 60-second sprints:{" "}
                    {bests.map((k, i) => (
                      <React.Fragment key={k}>
                        {i > 0 && ", "}
                        <b>
                          {CATS[k as TrickCat] ?? "Mixed"} {p.math[k]}
                        </b>
                      </React.Fragment>
                    ))}
                  </>
                ) : (
                  "No sprints yet. Your best score per category shows here."
                )}
              </p>
            </section>
          )}

          {run && (
            <section ref={cardRef} aria-labelledby="m-q" className={card}>
              <div className="flex items-center justify-between gap-3 font-mono text-[11px] uppercase tracking-[0.06em] text-ink-muted">
                <span>
                  Answered {run.n}, correct {run.c}
                </span>
                <span role="timer" aria-label="Time left" className={cn("text-[22px] font-medium normal-case tracking-normal tabular-nums", !run.learn && left < 10 && "text-danger")}>
                  {run.learn ? "No clock" : clock(left)}
                </span>
              </div>
              <div className="grid gap-2">
                <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink-muted">{run.q.t.name}</p>
                <p id="m-q" className="font-mono text-[clamp(1.6rem,1.2rem+1.6vw,2.4rem)] font-medium tabular-nums">
                  {mt(run.q.q)}
                </p>
                {run.learn && <p className="text-sm text-ink-muted">Trick: {run.q.h}</p>}
              </div>
              <div className="flex gap-2">
                <label htmlFor="m-in" className="sr-only">
                  Your answer
                </label>
                <input
                  ref={inRef}
                  id="m-in"
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      answer(false);
                    }
                  }}
                  className={cn(input, "font-mono text-lg")}
                />
                <button type="button" className={cn(btn.primary, "flex-none")} onClick={() => answer(false)}>
                  Check
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" className={btn.ghost} onClick={() => answer(true)}>
                  Show me
                </button>
                <button type="button" className={btn.ghost} onClick={() => finish(run)}>
                  Stop
                </button>
              </div>
              <span aria-hidden className="h-1.5 overflow-hidden rounded-full bg-sand-2">
                <i className="block h-full bg-clay" style={{ width: `${run.n ? (run.c / run.n) * 100 : 0}%` }} />
              </span>
              <div role="status" className="grid gap-1 empty:hidden">
                {run.last && (
                  <>
                    <p className={cn("flex items-center gap-1.5 font-semibold", run.last.ok ? "text-success" : "text-danger")}>
                      {run.last.ok ? <Check className="size-4" aria-hidden /> : <X className="size-4" aria-hidden />}
                      {run.last.q.q} = {fmt(r3(run.last.q.a))}
                    </p>
                    {!run.last.ok && <p className="text-sm text-ink-muted">{run.last.q.h}</p>}
                  </>
                )}
              </div>
            </section>
          )}

          {done && (
            <section aria-labelledby="ms-score" className={card}>
              <div className="grid gap-2">
                <p id="ms-score" className="font-mono text-[clamp(40px,6vw,64px)] font-medium leading-none tracking-[-0.04em] tabular-nums">
                  {plural(done.c, "correct answer")}
                </p>
                <p>
                  {done.n} answered{done.learn ? "" : ` in ${done.secs} seconds`}, {rate}% accuracy, level {done.level}.{" "}
                  {rate < 70 ? "Accuracy first: drop a level or use Learn mode on the missed tricks." : rate >= 85 && done.level < 3 ? "Clean. Move up a level." : "Good set. Same again tomorrow."}
                </p>
              </div>
              {done.missed.length > 0 && (
                <div className="grid gap-3">
                  <h2 className="text-sm text-ink-muted">Missed, with the trick</h2>
                  <ol className="divide-y divide-line border-y border-line">
                    {done.missed.map((m, i) => (
                      <li key={i} className="grid gap-1 py-3">
                        <p>{m.q}</p>
                        <span className="justify-self-start rounded-lg bg-clay-tint px-1.5 py-0.5 font-mono font-semibold">{fmt(r3(m.a))}</span>
                        <span className="text-sm text-ink-muted">{m.h}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
              <div>
                <button type="button" className={btn.primary} onClick={() => setDone(null)}>
                  Back to setup
                </button>
              </div>
            </section>
          )}
        </div>

        <aside aria-labelledby="habits-t" className="grid content-start gap-3">
          <h2 id="habits-t" className={blockTitle}>
            How to practice so it sticks
          </h2>
          <ul className="divide-y divide-line border-y border-line">
            {HABITS.map(([b, s], i) => (
              <li key={b} className="grid grid-cols-[1.5rem_1fr] gap-x-2 py-3.5">
                <span className="font-mono text-sm text-clay-ink">{i + 1}</span>
                <span className="grid gap-0.5">
                  <b>{b}</b>
                  <span className="text-sm text-ink-muted">{s}</span>
                </span>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      <section aria-labelledby="tricks-t" className="grid gap-3">
        <h2 id="tricks-t" className={blockTitle}>
          The tricks, each with its own practice
        </h2>
        <ul className="divide-y divide-line border-y border-line">
          {TRICKS.map((t, i) => (
            <li key={t.id}>
              <details open={i === 0} className="group">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 font-semibold [&::-webkit-details-marker]:hidden">
                  {t.name}
                  <ChevronDown className="size-4 flex-none text-ink-muted transition-transform group-open:rotate-180" aria-hidden />
                </summary>
                <div className="grid justify-items-start gap-2 pb-4.5">
                  <p className="text-sm">{t.how}</p>
                  <p className="font-mono text-sm tabular-nums text-ink-muted">{t.ex}</p>
                  <button type="button" className={btn.ghost} onClick={() => start(0, [t], true, "", "learn")}>
                    Practice this trick
                  </button>
                </div>
              </details>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
