"use client";

import * as React from "react";
import { cn } from "cn";
import { money, pct, pctile } from "@/lib/play/sim";

type Wheel = "european" | "american";
type Bet = "red" | "number";

const POCKETS: Record<Wheel, number> = { european: 37, american: 38 };
const EDGE: Record<Wheel, number> = { european: -1 / 37, american: -2 / 38 };
const STAKE = 10;
const PLAYERS = 1000;
const PLAYER_SPINS = 1000;

/** One spin: +payout on a win, −1 on a loss, per $1 staked. Pockets 1–18 are red; 0 (and 00) are green. */
function spin(wheel: Wheel, bet: Bet) {
  const p = Math.floor(Math.random() * POCKETS[wheel]);
  if (bet === "red") return p >= 1 && p <= 18 ? 1 : -1;
  return p === 17 ? 35 : -1;
}

function Toggle<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: [T, string][]; onChange: (v: T) => void }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex rounded-full bg-sand p-0.5">
      {options.map(([v, l]) => (
        <button
          key={v}
          type="button"
          role="radio"
          aria-checked={value === v}
          onClick={() => onChange(v)}
          className={cn(
            "h-11 flex-1 rounded-full px-4 text-sm transition-colors",
            value === v ? "bg-paper font-medium text-ink shadow-[0_0_0_1px_var(--line)]" : "text-ink-muted hover:text-ink",
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

function Path({ points }: { points: number[] }) {
  const W = 560;
  const H = 220;
  const pad = 28;
  const n = Math.max(points.length - 1, 1);
  const lo = Math.min(0, ...points);
  const hi = Math.max(0, ...points);
  const span = hi - lo || 1;
  const X = (i: number) => pad + (i / n) * (W - pad - 8);
  const Y = (v: number) => 12 + (1 - (v - lo) / span) * (H - 40);
  const d = points.map((v, i) => `${i ? "L" : "M"}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`Your bankroll over ${points.length - 1} spins, ending at ${money(points[points.length - 1])}`}>
      <line x1={pad} x2={W - 8} y1={Y(0)} y2={Y(0)} stroke="var(--line-strong)" strokeDasharray="4 5" />
      <text x={pad - 6} y={Y(0) + 4} textAnchor="end" className="font-mono" fontSize="11" fill="var(--ink-muted)">
        $0
      </text>
      {points.length > 1 && <path d={d} fill="none" stroke="var(--ink)" strokeWidth={2} strokeLinejoin="round" />}
      {points.length > 1 && <circle cx={X(points.length - 1)} cy={Y(points[points.length - 1])} r={5} fill="var(--clay)" />}
    </svg>
  );
}

function Histogram({ values }: { values: number[] }) {
  const W = 560;
  const H = 180;
  const bins = 32;
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const w = (hi - lo) / bins || 1;
  const counts = new Array(bins).fill(0);
  values.forEach((v) => counts[Math.min(bins - 1, Math.floor((v - lo) / w))]++);
  const max = Math.max(...counts);
  const bw = (W - 16) / bins;
  const zeroX = 8 + ((0 - lo) / (hi - lo || 1)) * (W - 16);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Histogram of 1,000 players' results after 1,000 spins">
      {counts.map((c, i) => {
        const left = lo + i * w;
        const h = (c / max) * (H - 36);
        return <rect key={i} x={8 + i * bw + 1} y={H - 24 - h} width={bw - 2} height={h} rx={2} fill={left + w <= 0 ? "var(--line-strong)" : "var(--clay)"} />;
      })}
      {zeroX >= 8 && zeroX <= W - 8 && <line x1={zeroX} x2={zeroX} y1={6} y2={H - 24} stroke="var(--ink)" strokeWidth={1.5} strokeDasharray="4 4" />}
      <text x={8} y={H - 6} className="font-mono" fontSize="11" fill="var(--ink-muted)">
        {money(lo)}
      </text>
      <text x={W - 8} y={H - 6} textAnchor="end" className="font-mono" fontSize="11" fill="var(--ink-muted)">
        {money(hi)}
      </text>
    </svg>
  );
}

export function HouseEdge() {
  const [wheel, setWheel] = React.useState<Wheel>("european");
  const [bet, setBet] = React.useState<Bet>("red");
  const [path, setPath] = React.useState<number[]>([0]);
  const [wagered, setWagered] = React.useState(0);
  const [crowd, setCrowd] = React.useState<number[] | null>(null);

  const reset = (w = wheel, b = bet) => {
    setWheel(w);
    setBet(b);
    setPath([0]);
    setWagered(0);
    setCrowd(null);
  };

  const play = (n: number) => {
    setPath((p) => {
      const out = p.slice();
      let bank = out[out.length - 1];
      for (let i = 0; i < n; i++) {
        bank += STAKE * spin(wheel, bet);
        out.push(bank);
      }
      return out;
    });
    setWagered((w) => w + n * STAKE);
  };

  const runCrowd = () => {
    const finals: number[] = [];
    for (let k = 0; k < PLAYERS; k++) {
      let b = 0;
      for (let i = 0; i < PLAYER_SPINS; i++) b += STAKE * spin(wheel, bet);
      finals.push(b);
    }
    setCrowd(finals);
  };

  const net = path[path.length - 1];
  const spins = path.length - 1;
  const expected = EDGE[wheel] * wagered;
  const sorted = crowd ? [...crowd].sort((a, b) => a - b) : null;
  const ahead = crowd ? crowd.filter((v) => v > 0).length / crowd.length : 0;
  const crowdMean = crowd ? crowd.reduce((a, b) => a + b, 0) / crowd.length : 0;

  return (
    <div className="space-y-10">
      <div className="grid gap-3 sm:grid-cols-2">
        <Toggle
          label="Wheel"
          value={wheel}
          onChange={(w) => reset(w, bet)}
          options={[
            ["european", "European wheel · one 0"],
            ["american", "American wheel · 0 and 00"],
          ]}
        />
        <Toggle
          label="Bet"
          value={bet}
          onChange={(b) => reset(wheel, b)}
          options={[
            ["red", "$10 on red · pays 1 to 1"],
            ["number", "$10 on 17 · pays 35 to 1"],
          ]}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
        <div className="space-y-5 lg:col-span-7">
          <div className="rounded-[28px] bg-sand p-4 sm:p-6">
            <Path points={path} />
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => play(1)} className="inline-flex h-12 items-center rounded-full bg-ink px-6 font-medium text-paper hover:bg-ink/85">
              Spin once
            </button>
            <button type="button" onClick={() => play(100)} className="inline-flex h-12 items-center rounded-full border border-line-strong px-6 font-medium hover:border-ink hover:bg-sand">
              Spin 100
            </button>
            <button type="button" onClick={() => play(1000)} className="inline-flex h-12 items-center rounded-full border border-line-strong px-6 font-medium hover:border-ink hover:bg-sand">
              Spin 1,000
            </button>
            <button type="button" onClick={() => reset()} className="inline-flex h-12 items-center rounded-full px-4 text-ink-muted hover:bg-sand">
              Reset
            </button>
          </div>
        </div>
        <dl className="grid grid-cols-2 content-start gap-px overflow-hidden rounded-2xl bg-line font-mono tabular lg:col-span-5" aria-live="polite">
          {[
            ["Spins", spins.toLocaleString()],
            ["Wagered", money(wagered)],
            ["You are", money(net)],
            ["Expected", money(expected)],
            ["Your return per $1", wagered ? pct(net / wagered, 2) : "–"],
            ["House edge", pct(EDGE[wheel], 2)],
          ].map(([k, v]) => (
            <div key={k} className="bg-paper p-4">
              <dt className="text-[11px] uppercase tracking-[0.08em] text-ink-muted">{k}</dt>
              <dd className={cn("mt-1 text-xl", k === "House edge" && "text-clay-ink")}>{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      <section aria-labelledby="crowd-t" className="grid gap-6 rounded-[28px] border border-line p-5 sm:p-7 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-4">
          <h2 id="crowd-t" className="font-display text-2xl font-[650]">A thousand players</h2>
          <p className="text-ink-muted">
            One person can get lucky. Simulate {PLAYERS.toLocaleString()} players each betting {money(STAKE)} a spin for {PLAYER_SPINS.toLocaleString()} spins and
            see who the wheel pays.
          </p>
          <button type="button" onClick={runCrowd} className="inline-flex h-11 items-center rounded-full bg-ink px-5 text-sm font-medium text-paper hover:bg-ink/85">
            {crowd ? "Run them again" : "Run 1,000 players"}
          </button>
        </div>
        <div className="space-y-4 lg:col-span-8" aria-live="polite">
          {sorted ? (
            <>
              <Histogram values={sorted} />
              <dl className="grid grid-cols-3 gap-3 font-mono text-sm tabular">
                <div>
                  <dt className="text-[11px] uppercase tracking-[0.08em] text-ink-muted">Still ahead</dt>
                  <dd className="text-2xl text-clay-ink">{pct(ahead, 1)}</dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-[0.08em] text-ink-muted">Average result</dt>
                  <dd className="text-2xl">{money(crowdMean)}</dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-[0.08em] text-ink-muted">Middle player</dt>
                  <dd className="text-2xl">{money(pctile(sorted, 0.5))}</dd>
                </div>
              </dl>
              <p className="text-sm text-ink-muted">
                Expected per player: {money(EDGE[wheel] * STAKE * PLAYER_SPINS)}. The casino&rsquo;s take from all of them together lands almost exactly on
                the edge, because it is the one playing a million spins.
              </p>
            </>
          ) : (
            <div className="grid h-full min-h-40 place-items-center rounded-2xl bg-sand text-sm text-ink-muted">Results appear here</div>
          )}
        </div>
      </section>
    </div>
  );
}
