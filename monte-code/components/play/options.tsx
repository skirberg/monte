"use client";

import * as React from "react";
import { cn } from "cn";
import { Phi } from "@/lib/site-data";
import { gauss } from "@/lib/play/sim";

type Kind = "call" | "put";
const S0 = 100;
const BATCH = 2000;
const MAX = 100000;
const SHOW_PATHS = 40;
const STEPS = 48;

/** Black-Scholes price for a European option on a non-dividend stock. */
function blackScholes(kind: Kind, S: number, K: number, T: number, r: number, s: number) {
  const d1 = (Math.log(S / K) + (r + (s * s) / 2) * T) / (s * Math.sqrt(T));
  const d2 = d1 - s * Math.sqrt(T);
  return kind === "call" ? S * Phi(d1) - K * Math.exp(-r * T) * Phi(d2) : K * Math.exp(-r * T) * Phi(-d2) - S * Phi(-d1);
}

/** Risk-neutral price at expiry: geometric Brownian motion with drift r. */
const terminal = (T: number, r: number, s: number) => S0 * Math.exp((r - (s * s) / 2) * T + s * Math.sqrt(T) * gauss());

function pricePaths(T: number, r: number, s: number) {
  return Array.from({ length: SHOW_PATHS }, () => {
    const dt = T / STEPS;
    const p = [S0];
    let v = S0;
    for (let i = 0; i < STEPS; i++) {
      v *= Math.exp((r - (s * s) / 2) * dt + s * Math.sqrt(dt) * gauss());
      p.push(v);
    }
    return p;
  });
}

type Est = { n: number; sum: number; sq: number; trail: { n: number; m: number; se: number }[] };
const empty = (): Est => ({ n: 0, sum: 0, sq: 0, trail: [] });

function PathsChart({ paths, K, kind }: { paths: number[][]; K: number; kind: Kind }) {
  const W = 560;
  const H = 240;
  const all = paths.flat().concat([K]);
  const lo = Math.min(...all) * 0.97;
  const hi = Math.max(...all) * 1.03;
  const X = (i: number) => 10 + (i / STEPS) * (W - 60);
  const Y = (v: number) => 10 + ((hi - v) / (hi - lo)) * (H - 30);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`${paths.length} simulated stock price paths and the strike at ${K}`}>
      {paths.map((p, k) => {
        const end = p[p.length - 1];
        const itm = kind === "call" ? end > K : end < K;
        return <path key={k} d={p.map((v, i) => `${i ? "L" : "M"}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join(" ")} fill="none" stroke={itm ? "var(--clay)" : "var(--line-strong)"} strokeWidth={itm ? 1.4 : 1} opacity={itm ? 0.9 : 0.7} />;
      })}
      <line x1={10} x2={W - 50} y1={Y(K)} y2={Y(K)} stroke="var(--ink)" strokeWidth={1.5} strokeDasharray="6 5" />
      <text x={W - 46} y={Y(K) + 4} className="font-mono" fontSize="11" fill="var(--ink)">
        K {K}
      </text>
      <text x={W - 46} y={Y(S0) + 4} className="font-mono" fontSize="11" fill="var(--ink-muted)">
        {S0 === K ? "" : `S ${S0}`}
      </text>
    </svg>
  );
}

function Convergence({ trail, target }: { trail: Est["trail"]; target: number }) {
  const W = 560;
  const H = 200;
  const L = 48;
  if (!trail.length) return null;
  const spread = Math.max(...trail.map((t) => Math.abs(t.m - target) + 2 * t.se), target * 0.02, 0.05);
  const lo = target - spread;
  const hi = target + spread;
  const X = (n: number) => L + (Math.log10(n) - Math.log10(BATCH)) / (Math.log10(MAX) - Math.log10(BATCH) || 1) * (W - L - 12);
  const Y = (v: number) => 12 + ((hi - v) / (hi - lo)) * (H - 40);
  const band = `${trail.map((t, i) => `${i ? "L" : "M"}${X(t.n).toFixed(1)} ${Y(t.m + 1.96 * t.se).toFixed(1)}`).join(" ")} ${[...trail]
    .reverse()
    .map((t) => `L${X(t.n).toFixed(1)} ${Y(t.m - 1.96 * t.se).toFixed(1)}`)
    .join(" ")} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`Monte Carlo estimate after ${trail[trail.length - 1].n.toLocaleString()} paths: ${trail[trail.length - 1].m.toFixed(3)}, Black-Scholes ${target.toFixed(3)}`}>
      <path d={band} fill="var(--clay)" opacity={0.2} />
      <line x1={L} x2={W - 12} y1={Y(target)} y2={Y(target)} stroke="var(--ink)" strokeWidth={1.5} strokeDasharray="6 5" />
      <text x={L - 6} y={Y(target) + 4} textAnchor="end" className="font-mono" fontSize="11" fill="var(--ink)">
        {target.toFixed(2)}
      </text>
      <path d={trail.map((t, i) => `${i ? "L" : "M"}${X(t.n).toFixed(1)} ${Y(t.m).toFixed(1)}`).join(" ")} fill="none" stroke="var(--clay-ink)" strokeWidth={2.5} />
      {[BATCH, 10000, MAX].map((n) => (
        <text key={n} x={X(n)} y={H - 8} textAnchor="middle" className="font-mono" fontSize="11" fill="var(--ink-muted)">
          {n.toLocaleString()} paths
        </text>
      ))}
    </svg>
  );
}

export function Options() {
  const [kind, setKind] = React.useState<Kind>("call");
  const [K, setK] = React.useState(100);
  const [sigma, setSigma] = React.useState(0.2);
  const [rate, setRate] = React.useState(0.05);
  const [months, setMonths] = React.useState(12);
  const [est, setEst] = React.useState<Est>(empty);
  const [paths, setPaths] = React.useState<number[][]>([]);
  const T = months / 12;
  const bs = blackScholes(kind, S0, K, T, rate, sigma);

  const change = (fn: () => void) => {
    fn();
    setEst(empty());
    setPaths([]);
  };

  const simulate = (batches: number) => {
    setPaths(pricePaths(T, rate, sigma));
    setEst((e) => {
      const out = { ...e, trail: [...e.trail] };
      for (let b = 0; b < batches && out.n < MAX; b++) {
        for (let i = 0; i < BATCH; i++) {
          const ST = terminal(T, rate, sigma);
          const pay = Math.exp(-rate * T) * Math.max(kind === "call" ? ST - K : K - ST, 0);
          out.sum += pay;
          out.sq += pay * pay;
        }
        out.n += BATCH;
        const m = out.sum / out.n;
        out.trail.push({ n: out.n, m, se: Math.sqrt(Math.max(out.sq / out.n - m * m, 0) / out.n) });
      }
      return out;
    });
  };

  const last = est.trail[est.trail.length - 1];
  const fields = [
    { id: "op-k", label: "Strike price", value: K, show: `$${K}`, min: 60, max: 140, step: 1, set: (v: number) => setK(v) },
    { id: "op-s", label: "Volatility (σ, per year)", value: Math.round(sigma * 100), show: `${Math.round(sigma * 100)}%`, min: 5, max: 80, step: 1, set: (v: number) => setSigma(v / 100) },
    { id: "op-r", label: "Interest rate", value: Math.round(rate * 100), show: `${Math.round(rate * 100)}%`, min: 0, max: 10, step: 1, set: (v: number) => setRate(v / 100) },
    { id: "op-t", label: "Time to expiry", value: months, show: `${months} months`, min: 1, max: 24, step: 1, set: (v: number) => setMonths(v) },
  ];

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
      <div className="space-y-6 lg:col-span-7">
        <div className="rounded-[28px] bg-sand p-4 sm:p-6">
          {paths.length ? <PathsChart paths={paths} K={K} kind={kind} /> : <div className="grid aspect-[7/3] place-items-center text-sm text-ink-muted">Simulated stock paths appear here</div>}
        </div>
        <div className="rounded-[28px] border border-line p-4 sm:p-6">{last ? <Convergence trail={est.trail} target={bs} /> : <p className="py-10 text-center text-sm text-ink-muted">The Monte Carlo estimate will close in on the dashed Black-Scholes line</p>}</div>
      </div>

      <div className="space-y-6 lg:col-span-5">
        <div role="radiogroup" aria-label="Option type" className="flex rounded-full bg-sand p-0.5">
          {(["call", "put"] as const).map((k) => (
            <button
              key={k}
              type="button"
              role="radio"
              aria-checked={kind === k}
              onClick={() => change(() => setKind(k))}
              className={cn("h-11 flex-1 rounded-full text-sm transition-colors", kind === k ? "bg-paper font-medium text-ink shadow-[0_0_0_1px_var(--line)]" : "text-ink-muted hover:text-ink")}
            >
              {k === "call" ? "Call: the right to buy" : "Put: the right to sell"}
            </button>
          ))}
        </div>
        <p className="text-sm text-ink-muted">The stock trades at ${S0} today.</p>
        {fields.map((f) => (
          <div key={f.id}>
            <div className="flex items-baseline justify-between gap-3">
              <label htmlFor={f.id} className="text-ink-muted">
                {f.label}
              </label>
              <span className="font-mono text-lg tabular">{f.show}</span>
            </div>
            <input id={f.id} type="range" min={f.min} max={f.max} step={f.step} value={f.value} onChange={(e) => change(() => f.set(+e.target.value))} className="h-11 w-full accent-[var(--clay)]" />
          </div>
        ))}

        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-line" aria-live="polite">
          <div className="bg-paper p-5">
            <dt className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">Black-Scholes</dt>
            <dd className="mt-1 font-mono text-4xl font-medium tracking-[-0.04em] tabular">${bs.toFixed(2)}</dd>
          </div>
          <div className="bg-paper p-5">
            <dt className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">Monte Carlo{last ? ` · ${last.n.toLocaleString()} paths` : ""}</dt>
            <dd className="mt-1 font-mono text-4xl font-medium tracking-[-0.04em] text-clay-ink tabular">{last ? `$${last.m.toFixed(2)}` : "–"}</dd>
            {last && <dd className="mt-1 font-mono text-xs text-ink-muted tabular">± ${(1.96 * last.se).toFixed(3)} (95%)</dd>}
          </div>
        </dl>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => simulate(1)} disabled={est.n >= MAX} className="inline-flex h-12 items-center rounded-full bg-ink px-6 font-medium text-paper hover:bg-ink/85 disabled:opacity-50">
            Simulate {BATCH.toLocaleString()} paths
          </button>
          <button type="button" onClick={() => simulate(MAX / BATCH)} disabled={est.n >= MAX} className="inline-flex h-12 items-center rounded-full border border-line-strong px-6 font-medium hover:border-ink hover:bg-sand disabled:opacity-50">
            Go to {MAX.toLocaleString()}
          </button>
        </div>
      </div>
    </div>
  );
}
