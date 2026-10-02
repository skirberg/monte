"use client";

import * as React from "react";
import { RotateCcw } from "lucide-react";
import { cn } from "cn";
import { burstFrom, callout } from "@/lib/fun";
import { useHydrated, useStoredString } from "@/lib/hooks";

const ROUNDS = 10;
const N = 60;
const IN = 0.1;
const BEST_KEY = "sigmaGuessR";

function gauss() {
  const u = 1 - Math.random();
  const v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/** Sample r of the points actually drawn, not the target used to make them. */
function pearson(pts: [number, number][]) {
  const n = pts.length;
  const mx = pts.reduce((s, p) => s + p[0], 0) / n;
  const my = pts.reduce((s, p) => s + p[1], 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (const [x, y] of pts) {
    sxy += (x - mx) * (y - my);
    sxx += (x - mx) ** 2;
    syy += (y - my) ** 2;
  }
  return sxy / Math.sqrt(sxx * syy);
}

function makeRound(): { pts: [number, number][]; r: number } {
  const target = (Math.random() * 2 - 1) * 0.97;
  const pts: [number, number][] = Array.from({ length: N }, () => {
    const x = gauss();
    return [x, target * x + Math.sqrt(1 - target * target) * gauss()];
  });
  return { pts, r: pearson(pts) };
}

const fmt = (r: number) => (r < 0 ? "−" : "") + Math.abs(r).toFixed(2);

function Scatter({ pts, line, className }: { pts: [number, number][]; line?: number; className?: string }) {
  const S = 400;
  const pad = 22;
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const ext = (a: number[]) => [Math.min(...a), Math.max(...a)];
  const [x0, x1] = ext(xs);
  const [y0, y1] = ext(ys);
  const X = (v: number) => pad + ((v - x0) / (x1 - x0 || 1)) * (S - 2 * pad);
  const Y = (v: number) => S - pad - ((v - y0) / (y1 - y0 || 1)) * (S - 2 * pad);
  // least-squares line, shown after the call
  let ln: React.ReactNode = null;
  if (line !== undefined) {
    const mx = xs.reduce((s, v) => s + v, 0) / xs.length;
    const my = ys.reduce((s, v) => s + v, 0) / ys.length;
    let sxy = 0, sxx = 0;
    pts.forEach(([x, y]) => {
      sxy += (x - mx) * (y - my);
      sxx += (x - mx) ** 2;
    });
    const b = sxy / sxx;
    ln = <line x1={X(x0)} y1={Y(my + b * (x0 - mx))} x2={X(x1)} y2={Y(my + b * (x1 - mx))} stroke="var(--ink)" strokeWidth={2.5} strokeLinecap="round" />;
  }
  return (
    <svg viewBox={`0 0 ${S} ${S}`} className={className} role="img" aria-label={`Scatter plot of ${pts.length} points`}>
      <rect x={pad / 2} y={pad / 2} width={S - pad} height={S - pad} rx={16} fill="none" stroke="var(--line)" />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={X(x)} cy={Y(y)} r={5.5} fill="var(--clay)" opacity={0.9} />
      ))}
      {ln}
    </svg>
  );
}

export function GuessR() {
  const [round, setRound] = React.useState(() => makeRound());
  const [i, setI] = React.useState(0);
  const [guess, setGuess] = React.useState(0);
  const [called, setCalled] = React.useState(false);
  const [misses, setMisses] = React.useState<number[]>([]);
  const [streak, setStreak] = React.useState(0);
  const [bestStreak, setBestStreak] = React.useState(0);
  const stored = useStoredString(BEST_KEY);
  const [bestNow, setBest] = React.useState<number | null>(null);
  const best = bestNow ?? (stored ? +stored : null);
  const callRef = React.useRef<HTMLParagraphElement>(null);
  const done = i >= ROUNDS;
  // Rounds are random, so plots render only after hydration (the server's round is never shown).
  const ready = useHydrated();

  const miss = Math.abs(guess - round.r);
  const isIn = miss <= IN;

  const call = () => {
    if (called) return;
    setCalled(true);
    const m = Math.abs(guess - round.r);
    const next = [...misses, m];
    setMisses(next);
    if (m <= IN) {
      const s = streak + 1;
      setStreak(s);
      setBestStreak((b) => Math.max(b, s));
      requestAnimationFrame(() => burstFrom(callRef.current));
      if (s >= 3) callout(`${s} in a row.`);
    } else setStreak(0);
    if (next.length === ROUNDS) {
      const avg = next.reduce((a, b) => a + b, 0) / ROUNDS;
      if (best === null || avg < best) {
        setBest(avg);
        try {
          localStorage.setItem(BEST_KEY, String(avg));
        } catch {}
      }
    }
  };

  const nextRound = () => {
    setRound(makeRound());
    setI((v) => v + 1);
    setGuess(0);
    setCalled(false);
  };

  const restart = () => {
    setMisses([]);
    setStreak(0);
    setBestStreak(0);
    setI(0);
    setGuess(0);
    setCalled(false);
    setRound(makeRound());
  };

  const avg = misses.length ? misses.reduce((a, b) => a + b, 0) / misses.length : 0;

  return (
    <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-7">
        <div className="relative rounded-[28px] bg-sand p-3 sm:p-5">
          {ready ? <Scatter pts={round.pts} line={called ? round.r : undefined} className="w-full" /> : <div className="aspect-square" />}
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:col-span-5">
        <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl bg-line font-mono tabular">
          {[
            ["Round", `${Math.min(i + 1, ROUNDS)}/${ROUNDS}`],
            ["Streak", String(streak)],
            ["Best avg miss", best === null ? "–" : best.toFixed(2)],
          ].map(([k, v]) => (
            <div key={k} className="bg-paper p-4">
              <dt className="text-[11px] uppercase tracking-[0.08em] text-ink-muted">{k}</dt>
              <dd className="mt-1 text-xl">{v}</dd>
            </div>
          ))}
        </dl>

        {!done ? (
          <>
            <div>
              <label htmlFor="r-guess" className="font-mono text-xs uppercase tracking-[0.08em] text-ink-muted">
                Your call for r
              </label>
              <p className="mt-1 font-mono text-[clamp(3.2rem,7vw,4.8rem)] font-medium leading-none tracking-[-0.05em] tabular">
                {fmt(guess)}
              </p>
              <input
                id="r-guess"
                type="range"
                min={-1}
                max={1}
                step={0.01}
                value={guess}
                disabled={called}
                onChange={(e) => setGuess(+e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (called ? nextRound() : call())}
                className="mt-4 h-11 w-full accent-[var(--clay)] disabled:opacity-60"
              />
              <div className="flex justify-between font-mono text-xs text-ink-muted">
                <span>−1 perfect down</span>
                <span>0 none</span>
                <span>+1 perfect up</span>
              </div>
            </div>

            <div aria-live="polite">
              {called ? (
                <div className="space-y-4 rounded-2xl border border-line p-5">
                  <p ref={callRef} className={cn("font-display text-4xl font-[680]", isIn ? "text-clay-ink" : "text-ink")}>
                    {isIn ? "In." : "Out."}
                  </p>
                  <p className="font-mono text-sm tabular">
                    r = {fmt(round.r)} · you said {fmt(guess)} · off by {miss.toFixed(2)}
                  </p>
                  <button
                    type="button"
                    onClick={nextRound}
                    autoFocus
                    className="inline-flex h-11 items-center rounded-full bg-ink px-6 font-medium text-paper hover:bg-ink/85"
                  >
                    {i + 1 === ROUNDS ? "See your score" : "Next plot"}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={call}
                  className="inline-flex h-12 items-center rounded-full bg-ink px-7 font-medium text-paper hover:bg-ink/85"
                >
                  Make the call
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="space-y-4 rounded-2xl border border-line p-6" aria-live="polite">
            <p className="font-mono text-xs uppercase tracking-[0.08em] text-ink-muted">Average miss over {ROUNDS} plots</p>
            <p className="font-mono text-6xl font-medium tracking-[-0.05em] text-clay-ink tabular">{avg.toFixed(2)}</p>
            <p className="text-ink-muted">
              {avg <= 0.08
                ? "Sharp. You read scatter plots like a regression table."
                : avg <= 0.15
                  ? "Solid eye. Weak and moderate correlations are the hard ones."
                  : "Warm-up set. Watch how tight the cloud is around a line, not how steep it is."}{" "}
              Longest streak: {bestStreak}.
            </p>
            <button
              type="button"
              onClick={restart}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-ink px-6 font-medium text-paper hover:bg-ink/85"
            >
              <RotateCcw className="size-4" /> Play again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
