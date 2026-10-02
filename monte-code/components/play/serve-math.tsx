"use client";

import * as React from "react";
import { cn } from "cn";
import { ATP_2025, hold, impliedServePoints, setWin } from "@/lib/play/tennis";

const W = 520;
const H = 360;
const PAD = { l: 48, r: 16, t: 16, b: 40 };
const P0 = 0.3;
const P1 = 0.9;
const X = (p: number) => PAD.l + ((p - P0) / (P1 - P0)) * (W - PAD.l - PAD.r);
const Y = (v: number) => H - PAD.b - v * (H - PAD.t - PAD.b);

const CURVE = (() => {
  let d = "";
  for (let i = 0; i <= 120; i++) {
    const p = P0 + (i / 120) * (P1 - P0);
    d += `${i ? " L" : "M"}${X(p).toFixed(1)} ${Y(hold(p)).toFixed(1)}`;
  }
  return d;
})();

const pc = (v: number) => `${(v * 100).toFixed(1)}%`;

function Slider({ id, label, value, onChange }: { id: string; label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-ink-muted">
          {label}
        </label>
        <span className="font-mono text-xl tabular">{(value * 100).toFixed(Number.isInteger(Math.round(value * 1000) / 10) ? 0 : 1)}%</span>
      </div>
      <input
        id={id}
        type="range"
        min={40}
        max={80}
        step={1}
        value={Math.round(value * 100)}
        onChange={(e) => onChange(+e.target.value / 100)}
        className="h-11 w-full accent-[var(--clay)]"
      />
    </div>
  );
}

export function ServeMath() {
  const [p, setP] = React.useState(0.6);
  const [r, setR] = React.useState(0.6);
  const h = hold(p);
  const s = setWin(p, r);
  const edgePoints = p - r;

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-7">
        <figure className="rounded-[28px] bg-sand p-4 sm:p-6">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`Chart: chance of holding serve rises from ${pc(hold(0.4))} at 40% of serve points won to ${pc(hold(0.8))} at 80%. You are at ${Math.round(p * 100)}%: ${pc(h)}.`}>
            {[0, 0.25, 0.5, 0.75, 1].map((v) => (
              <g key={v}>
                <line x1={PAD.l} x2={W - PAD.r} y1={Y(v)} y2={Y(v)} stroke="var(--line)" />
                <text x={PAD.l - 10} y={Y(v) + 4} textAnchor="end" className="font-mono" fontSize="12" fill="var(--ink-muted)">
                  {v * 100}%
                </text>
              </g>
            ))}
            {[0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9].map((v) => (
              <text key={v} x={X(v)} y={H - 14} textAnchor="middle" className="font-mono" fontSize="12" fill="var(--ink-muted)">
                {Math.round(v * 100)}%
              </text>
            ))}
            {/* points = games, for reference */}
            <line x1={X(P0)} y1={Y(P0)} x2={X(P1)} y2={Y(P1)} stroke="var(--line-strong)" strokeDasharray="5 6" />
            <path d={CURVE} fill="none" stroke="var(--ink)" strokeWidth={3} strokeLinejoin="round" />
            <line x1={X(p)} x2={X(p)} y1={Y(0)} y2={Y(h)} stroke="var(--clay)" strokeWidth={2} />
            <line x1={PAD.l} x2={X(p)} y1={Y(h)} y2={Y(h)} stroke="var(--clay)" strokeWidth={2} strokeDasharray="4 5" />
            <circle cx={X(p)} cy={Y(h)} r={8} fill="var(--clay)" stroke="var(--paper)" strokeWidth={3} />
          </svg>
          <figcaption className="mt-2 flex flex-wrap justify-between gap-2 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">
            <span>Serve points won → service games held</span>
            <span>Dashed: if games just matched points</span>
          </figcaption>
        </figure>
      </div>

      <div className="space-y-8 lg:col-span-5">
        <div className="space-y-5">
          <Slider id="serve-you" label="You win on your serve" value={p} onChange={setP} />
          <Slider id="serve-them" label="They win on their serve" value={r} onChange={setR} />
        </div>
        <section aria-labelledby="real-t" className="space-y-3 rounded-2xl bg-sand p-5">
          <h2 id="real-t" className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">
            Serve like a real player · ATP 2025
          </h2>
          <div className="flex flex-wrap gap-2">
            {ATP_2025.holds.map((pl) => {
              const v = impliedServePoints(pl.hold);
              const on = Math.abs(v - p) < 1e-9;
              return (
                <button
                  key={pl.name}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setP(v)}
                  className={cn(
                    "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm transition-colors",
                    on ? "border-ink bg-ink text-paper" : "border-line-strong hover:border-ink",
                  )}
                >
                  <span aria-hidden>{pl.short}</span>
                  <span className="sr-only">{pl.name}</span> <span className="font-mono text-xs opacity-75 tabular">held {(pl.hold * 100).toFixed(1)}%</span>
                </button>
              );
            })}
            <button
              type="button"
              aria-pressed={Math.abs(impliedServePoints(1 - ATP_2025.sinnerReturn) - r) < 1e-9}
              onClick={() => setR(impliedServePoints(1 - ATP_2025.sinnerReturn))}
              className={cn(
                "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm transition-colors",
                Math.abs(impliedServePoints(1 - ATP_2025.sinnerReturn) - r) < 1e-9 ? "border-ink bg-ink text-paper" : "border-line-strong hover:border-ink",
              )}
            >
              Opponent facing Sinner <span className="font-mono text-xs opacity-75 tabular">held {((1 - ATP_2025.sinnerReturn) * 100).toFixed(1)}%</span>
            </button>
          </div>
          <p className="text-sm text-ink-muted">
            Real hold rates from the{" "}
            <a href={ATP_2025.source} className="underline underline-offset-4 hover:text-ink" target="_blank" rel="noreferrer">
              ATP Tour, 2025 season
            </a>
            . Each button sets the serve-point rate that reproduces that hold rate in this model, so the sliders can land between whole
            numbers.
          </p>
        </section>
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-line" aria-live="polite">
          <div className="bg-paper p-5">
            <dt className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">You hold serve</dt>
            <dd className="mt-1 font-mono text-4xl font-medium tracking-[-0.04em] text-clay-ink tabular">{pc(h)}</dd>
          </div>
          <div className="bg-paper p-5">
            <dt className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">You win the set</dt>
            <dd className="mt-1 font-mono text-4xl font-medium tracking-[-0.04em] text-clay-ink tabular">{pc(s)}</dd>
          </div>
        </dl>
        <p className="text-ink-muted">
          {Math.abs(edgePoints) < 0.005
            ? "Even on serve, so the set is a coin flip: exactly 50%. Nudge your slider up two points and watch it swing."
            : `Win ${Math.abs(edgePoints * 100).toFixed(Math.abs(edgePoints * 100) % 1 ? 1 : 0)} ${edgePoints > 0 ? "more" : "fewer"} serve points per 100 than they do and your chance of the set ${edgePoints > 0 ? "climbs" : "drops"} from 50% to ${pc(s)}. Small edges compound.`}
        </p>
      </div>
    </div>
  );
}
