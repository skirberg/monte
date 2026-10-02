"use client";

import * as React from "react";
import { Phi } from "@/lib/site-data";
import { binom, chunked, pct } from "@/lib/play/sim";

const DAYS = 20;
const ALPHA = 0.05;
const RUNS = 1000;

/** Two-proportion z-test, two-sided p-value (pooled standard error). */
function pValue(ca: number, na: number, cb: number, nb: number) {
  const p = (ca + cb) / (na + nb);
  const se = Math.sqrt(p * (1 - p) * (1 / na + 1 / nb));
  if (!se) return 1;
  const z = (cb / nb - ca / na) / se;
  return 2 * (1 - Phi(Math.abs(z)));
}

/** One experiment: the p-value after each day. */
function experiment(base: number, lift: number, perDay: number) {
  let ca = 0, cb = 0, n = 0;
  const ps: number[] = [];
  for (let d = 0; d < DAYS; d++) {
    ca += binom(perDay, base);
    cb += binom(perDay, Math.min(1, base * (1 + lift)));
    n += perDay;
    ps.push(pValue(ca, n, cb, n));
  }
  return ps;
}

function PChart({ ps }: { ps: number[] }) {
  const W = 560;
  const H = 240;
  const L = 44;
  const X = (d: number) => L + (d / (DAYS - 1)) * (W - L - 12);
  // log scale so the 0.05 line has room
  const lo = Math.log10(0.001);
  const Y = (p: number) => 14 + ((0 - Math.log10(Math.max(p, 0.001))) / (0 - lo)) * (H - 44);
  const d = ps.map((p, i) => `${i ? "L" : "M"}${X(i).toFixed(1)} ${Y(p).toFixed(1)}`).join(" ");
  const firstHit = ps.findIndex((p) => p < ALPHA);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`P-value by day for one test. ${firstHit >= 0 ? `It dipped below 0.05 on day ${firstHit + 1}.` : "It never dipped below 0.05."} Final p-value ${ps[ps.length - 1]?.toFixed(3)}.`}>
      {[1, 0.1, 0.05, 0.01, 0.001].map((t) => (
        <g key={t}>
          <line x1={L} x2={W - 12} y1={Y(t)} y2={Y(t)} stroke={t === ALPHA ? "var(--clay)" : "var(--line)"} strokeWidth={t === ALPHA ? 2 : 1} strokeDasharray={t === ALPHA ? "6 5" : undefined} />
          <text x={L - 8} y={Y(t) + 4} textAnchor="end" className="font-mono" fontSize="11" fill={t === ALPHA ? "var(--clay-ink)" : "var(--ink-muted)"}>
            {t}
          </text>
        </g>
      ))}
      {[1, 5, 10, 15, 20].map((day) => (
        <text key={day} x={X(day - 1)} y={H - 8} textAnchor="middle" className="font-mono" fontSize="11" fill="var(--ink-muted)">
          day {day}
        </text>
      ))}
      {ps.length > 0 && <path d={d} fill="none" stroke="var(--ink)" strokeWidth={2.5} strokeLinejoin="round" />}
      {firstHit >= 0 && <circle cx={X(firstHit)} cy={Y(ps[firstHit])} r={7} fill="var(--clay)" stroke="var(--paper)" strokeWidth={3} />}
    </svg>
  );
}

export function AbTest() {
  const [base, setBase] = React.useState(0.05);
  const [lift, setLift] = React.useState(0);
  const [perDay, setPerDay] = React.useState(500);
  const [one, setOne] = React.useState<number[]>([]);
  const [rates, setRates] = React.useState<{ peek: number; end: number; runs: number } | null>(null);
  const [busy, setBusy] = React.useState(0);

  const runOne = () => setOne(experiment(base, lift, perDay));

  const runMany = async () => {
    let peek = 0;
    let end = 0;
    setBusy(0.001);
    await chunked(
      RUNS,
      50,
      (from, to) => {
        for (let i = from; i < to; i++) {
          const ps = experiment(base, lift, perDay);
          if (ps.some((p) => p < ALPHA)) peek++;
          if (ps[ps.length - 1] < ALPHA) end++;
        }
      },
      (done) => setBusy(done / RUNS),
    );
    setRates({ peek: peek / RUNS, end: end / RUNS, runs: RUNS });
    setBusy(0);
  };

  const changed = (fn: () => void) => {
    fn();
    setRates(null);
    setOne([]);
  };

  const firstHit = one.findIndex((p) => p < ALPHA);
  const aa = lift === 0;

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
      <div className="space-y-6 lg:col-span-7">
        <div className="rounded-[28px] bg-sand p-4 sm:p-6">
          {one.length ? <PChart ps={one} /> : <div className="grid aspect-[7/3] place-items-center text-sm text-ink-muted">Run one test to see its p-value move day by day</div>}
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={runOne} className="inline-flex h-12 items-center rounded-full bg-ink px-6 font-medium text-paper hover:bg-ink/85">
            {one.length ? "Run another test" : "Run one test"}
          </button>
          <button type="button" onClick={runMany} disabled={!!busy} className="inline-flex h-12 items-center rounded-full border border-line-strong px-6 font-medium hover:border-ink hover:bg-sand disabled:opacity-60">
            {busy ? `Running… ${Math.round(busy * 100)}%` : `Run ${RUNS.toLocaleString()} tests`}
          </button>
        </div>
        {one.length > 0 && (
          <p className="text-ink-muted" aria-live="polite">
            {firstHit >= 0
              ? `Peeking would have declared a winner on day ${firstHit + 1}${aa ? ", even though both versions are identical." : "."}`
              : "This one never crossed 0.05, so peeking would not have fooled you this time."}{" "}
            Final p-value after {DAYS} days: {one[one.length - 1].toFixed(3)}.
          </p>
        )}
      </div>

      <div className="space-y-6 lg:col-span-5">
        <div className="space-y-4">
          {[
            { id: "ab-base", label: "Conversion rate of the current page", value: base, set: setBase, min: 1, max: 20, show: pct(base, 0) },
            { id: "ab-lift", label: "True lift of the new version", value: lift, set: setLift, min: 0, max: 30, show: lift ? `+${Math.round(lift * 100)}%` : "none (A/A test)" },
          ].map((f) => (
            <div key={f.id}>
              <div className="flex items-baseline justify-between gap-3">
                <label htmlFor={f.id} className="text-ink-muted">
                  {f.label}
                </label>
                <span className="font-mono text-lg tabular">{f.show}</span>
              </div>
              <input id={f.id} type="range" min={f.min} max={f.max} value={Math.round(f.value * 100)} onChange={(e) => changed(() => f.set(+e.target.value / 100))} className="h-11 w-full accent-[var(--clay)]" />
            </div>
          ))}
          <div>
            <div className="flex items-baseline justify-between gap-3">
              <label htmlFor="ab-n" className="text-ink-muted">
                Visitors per version per day
              </label>
              <span className="font-mono text-lg tabular">{perDay.toLocaleString()}</span>
            </div>
            <input id="ab-n" type="range" min={100} max={2000} step={100} value={perDay} onChange={(e) => changed(() => setPerDay(+e.target.value))} className="h-11 w-full accent-[var(--clay)]" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-line" aria-live="polite">
          <div className="bg-paper p-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">Checked once, day {DAYS}</p>
            <p className="mt-1 font-mono text-4xl font-medium tracking-[-0.04em] tabular">{rates ? pct(rates.end, 1) : "–"}</p>
            <p className="mt-1 text-xs text-ink-muted">{aa ? "false winners" : "tests that found the lift"}</p>
          </div>
          <div className="bg-paper p-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">Peeked every day</p>
            <p className="mt-1 font-mono text-4xl font-medium tracking-[-0.04em] text-clay-ink tabular">{rates ? pct(rates.peek, 1) : "–"}</p>
            <p className="mt-1 text-xs text-ink-muted">{aa ? "false winners" : "tests that ever looked significant"}</p>
          </div>
        </div>
        <p className="text-sm text-ink-muted">
          {aa
            ? "With no real difference, a fair test should cry wolf about 5% of the time. Run 1,000 tests and compare the two columns."
            : "Now there is a real lift. Both columns rise, but only the left one is a test you can trust at the 5% level."}
        </p>
      </div>
    </div>
  );
}
