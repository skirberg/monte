"use client";

import * as React from "react";
import { Delete, RotateCcw, Shuffle } from "lucide-react";
import { cn } from "cn";
import { burstFrom, callout } from "@/lib/fun";

const N = 50;
const SIMS = 20000;

type Seq = boolean[]; // true = heads

function runs(s: Seq) {
  let r = s.length ? 1 : 0;
  for (let i = 1; i < s.length; i++) if (s[i] !== s[i - 1]) r++;
  return r;
}
function longest(s: Seq) {
  let best = 0, cur = 0;
  for (let i = 0; i < s.length; i++) {
    cur = i && s[i] === s[i - 1] ? cur + 1 : 1;
    best = Math.max(best, cur);
  }
  return best;
}
const flip = (): Seq => Array.from({ length: N }, () => Math.random() < 0.5);

/** Reference distributions from real coins: runs, longest streak and heads in fair sequences of 50. */
function reference() {
  const runs_ = new Array(N + 2).fill(0);
  const long_ = new Array(N + 2).fill(0);
  const heads_ = new Array(N + 2).fill(0);
  for (let k = 0; k < SIMS; k++) {
    const s = flip();
    runs_[runs(s)]++;
    long_[longest(s)]++;
    heads_[s.filter(Boolean).length]++;
  }
  return { runs: runs_, long: long_, heads: heads_ };
}
const atLeast = (c: number[], v: number) => c.slice(v).reduce((a, b) => a + b, 0) / SIMS;
const atMost = (c: number[], v: number) => c.slice(0, v + 1).reduce((a, b) => a + b, 0) / SIMS;
const mean = (c: number[]) => c.reduce((a, n, i) => a + n * i, 0) / SIMS;
/** Two-sided: how often a real coin lands at least this far out, in this direction, doubled. */
function test(c: number[], v: number) {
  const hi = atLeast(c, v);
  const lo = atMost(c, v);
  return { p: Math.min(1, 2 * Math.min(hi, lo)), high: hi < lo };
}
// Three tests at 2% each: a truly random sequence is wrongly flagged about 3% of the time (checked by simulation).
const ALPHA = 0.02;

function Grains({ s, label }: { s: Seq; label: string }) {
  return (
    <ol aria-label={label} className="grid grid-cols-10 gap-1.5 sm:gap-2">
      {Array.from({ length: N }, (_, i) => {
        const v = s[i];
        return (
          <li
            key={i}
            aria-label={v === undefined ? undefined : v ? "H" : "T"}
            className={cn(
              "grid aspect-square place-items-center rounded-full font-mono text-[10px] sm:text-xs",
              v === undefined ? "border border-dashed border-line" : v ? "bg-clay text-paper" : "border-2 border-ink text-ink",
            )}
          >
            {v === undefined ? "" : v ? "H" : "T"}
          </li>
        );
      })}
    </ol>
  );
}

const fmtP = (p: number) => (p < 0.001 ? "under 0.1%" : `${(p * 100).toFixed(1)}%`);

export function FakeCoin() {
  const [seq, setSeq] = React.useState<Seq>([]);
  const [real, setReal] = React.useState<Seq | null>(null);
  const [dist, setDist] = React.useState<ReturnType<typeof reference> | null>(null);
  const resultRef = React.useRef<HTMLParagraphElement>(null);
  const done = seq.length === N;

  const add = React.useCallback((h: boolean) => setSeq((s) => (s.length < N ? [...s, h] : s)), []);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target;
      if (t instanceof Element && t.closest("input, textarea, select, [contenteditable]")) return;
      if (e.key === "h" || e.key === "H") add(true);
      else if (e.key === "t" || e.key === "T") add(false);
      else if (e.key === "Backspace") setSeq((s) => s.slice(0, -1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [add]);

  React.useEffect(() => {
    if (!done || dist) return;
    // 20,000 fair sequences take a few milliseconds; run after paint so the last grain shows first.
    const id = setTimeout(() => setDist(reference()), 30);
    return () => clearTimeout(id);
  }, [done, dist]);

  const r = done ? runs(seq) : 0;
  const L = done ? longest(seq) : 0;
  const heads = seq.filter(Boolean).length;
  const tRuns = dist ? test(dist.runs, r) : null;
  const tLong = dist ? test(dist.long, L) : null;
  const tHeads = dist ? test(dist.heads, heads) : null;
  const tidy = !!(tRuns && tLong && ((tRuns.p < ALPHA && tRuns.high) || (tLong.p < ALPHA && !tLong.high)));
  const streaky = !!(tRuns && tLong && ((tRuns.p < ALPHA && !tRuns.high) || (tLong.p < ALPHA && tLong.high)));
  const lopsided = !!(tHeads && tHeads.p < ALPHA);
  const faked = tidy || streaky || lopsided;

  React.useEffect(() => {
    if (!dist || !done) return;
    if (!faked) {
      burstFrom(resultRef.current, 18);
      callout("You fooled the test.");
    }
  }, [dist, done, faked]);

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
      <div className="space-y-6 lg:col-span-7">
        <p className="text-lg">
          Pretend you are a coin. Tap <b>H</b> or <b>T</b> fifty times (or press the H and T keys). Try to make it look truly random.
        </p>
        <div className="rounded-[28px] bg-sand p-4 sm:p-6">
          <Grains s={seq} label={`Your sequence, ${seq.length} of ${N}`} />
          <p className="mt-4 font-mono text-sm text-ink-muted tabular">
            {seq.length} of {N} · heads {heads}
          </p>
        </div>
        {!done ? (
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => add(true)} className="h-16 min-w-28 flex-1 rounded-2xl bg-clay font-display text-2xl font-[680] text-paper sm:flex-none">
              H
            </button>
            <button type="button" onClick={() => add(false)} className="h-16 min-w-28 flex-1 rounded-2xl border-2 border-ink font-display text-2xl font-[680] sm:flex-none">
              T
            </button>
            <button
              type="button"
              onClick={() => setSeq((s) => s.slice(0, -1))}
              disabled={!seq.length}
              className="inline-flex h-16 items-center gap-2 rounded-2xl px-4 text-ink-muted hover:bg-sand disabled:opacity-40"
              aria-label="Undo last flip"
            >
              <Delete className="size-5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setSeq([]);
              setReal(null);
            }}
            className="inline-flex h-12 items-center gap-2 rounded-full border border-line-strong px-6 font-medium hover:border-ink hover:bg-sand"
          >
            <RotateCcw className="size-4" /> Try again
          </button>
        )}
        {done && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-mono text-xs uppercase tracking-[0.08em] text-ink-muted">A real coin, for comparison</h2>
              <button type="button" onClick={() => setReal(flip())} className="inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-medium hover:bg-sand">
                <Shuffle className="size-4" /> {real ? "Flip again" : "Flip 50"}
              </button>
            </div>
            {real && (
              <div className="rounded-[28px] border border-line p-4 sm:p-6">
                <Grains s={real} label="A real random sequence" />
                <p className="mt-4 font-mono text-sm text-ink-muted tabular">
                  runs {runs(real)} · longest streak {longest(real)}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="lg:col-span-5" aria-live="polite">
        {!done ? (
          <div className="space-y-3 rounded-2xl border border-dashed border-line-strong p-6 text-ink-muted">
            <p className="font-mono text-xs uppercase tracking-[0.08em]">The verdict appears at 50</p>
            <p>Two things give fakes away: how often you switch between H and T, and how long your longest streak is.</p>
          </div>
        ) : !dist || !tRuns || !tLong || !tHeads ? (
          <p className="rounded-2xl bg-sand p-6 font-mono text-sm">Flipping {SIMS.toLocaleString()} real coins to compare…</p>
        ) : (
          <div className="space-y-6 rounded-2xl border border-line p-6">
            <p ref={resultRef} className={cn("font-display text-5xl font-[680] tracking-[-0.03em]", faked ? "text-ink" : "text-clay-ink")}>
              {faked ? "Faked." : "Passes."}
            </p>
            <table className="w-full font-mono text-sm tabular">
              <caption className="sr-only">Your flips compared with {SIMS.toLocaleString()} real sequences of 50</caption>
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-[0.08em] text-ink-muted">
                  <th scope="col" className="pb-2 font-normal">Measure</th>
                  <th scope="col" className="pb-2 text-right font-normal">You</th>
                  <th scope="col" className="pb-2 text-right font-normal">Real avg</th>
                  <th scope="col" className="pb-2 text-right font-normal">This rare</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line border-t border-line">
                {[
                  ["Switches", r, mean(dist.runs), tRuns.p],
                  ["Longest streak", L, mean(dist.long), tLong.p],
                  ["Heads", heads, mean(dist.heads), tHeads.p],
                ].map(([k, you, avg, p]) => (
                  <tr key={k as string}>
                    <th scope="row" className="py-3 text-left font-normal text-ink-muted">{k}</th>
                    <td className="py-3 text-right">{you}</td>
                    <td className="py-3 text-right">{(avg as number).toFixed(1)}</td>
                    <td className={cn("py-3 text-right", (p as number) < ALPHA && "font-semibold text-clay-ink")}>{fmtP(p as number)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-ink-muted">
              {tidy
                ? "Too tidy. Real coins repeat themselves more than people expect, so fakes switch too often and dodge long streaks."
                : streaky
                  ? "Too streaky. You switched less often than a real coin would."
                  : lopsided
                    ? "Too lopsided. A fair coin rarely lands that far from 25 heads in 50."
                    : "Your flips are as streaky as real ones. Most people switch too often; you did not."}{" "}
              &ldquo;This rare&rdquo; is how often real coins land at least that far from average, in either direction.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
