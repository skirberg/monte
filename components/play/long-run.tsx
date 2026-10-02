"use client";

import * as React from "react";
import { cn } from "cn";
import DATA from "@/lib/play/data/returns.json";
import { money, pct, pctile } from "@/lib/play/sim";

type Asset = "sp500" | "smallcap" | "tbond" | "tbill";
const ASSETS: { id: Asset; name: string }[] = [
  { id: "sp500", name: "S&P 500" },
  { id: "smallcap", name: "Small caps" },
  { id: "tbond", name: "10-year Treasuries" },
  { id: "tbill", name: "T-bills (cash)" },
];
const START = 10000;
const PATHS = 2000;

function stats(r: number[]) {
  const n = r.length;
  const mean = r.reduce((a, b) => a + b, 0) / n;
  const geo = Math.exp(r.reduce((a, x) => a + Math.log(1 + x), 0) / n) - 1;
  const sd = Math.sqrt(r.reduce((a, x) => a + (x - mean) ** 2, 0) / (n - 1));
  let worst = 0;
  let best = 0;
  r.forEach((x, i) => {
    if (x < r[worst]) worst = i;
    if (x > r[best]) best = i;
  });
  return { mean, geo, sd, worst, best, down: r.filter((x) => x < 0).length / n };
}

function Bars({ years, r }: { years: number[]; r: number[] }) {
  const W = 640;
  const H = 220;
  const lo = Math.min(-0.5, ...r);
  const hi = Math.max(0.6, ...r);
  const Y = (v: number) => 10 + ((hi - v) / (hi - lo)) * (H - 36);
  const bw = (W - 40) / r.length;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`Annual returns from ${years[0]} to ${years[years.length - 1]}`}>
      {[-0.4, 0, 0.4].map((t) => (
        <g key={t}>
          <line x1={36} x2={W - 4} y1={Y(t)} y2={Y(t)} stroke={t === 0 ? "var(--ink)" : "var(--line)"} strokeWidth={t === 0 ? 1.5 : 1} />
          <text x={30} y={Y(t) + 4} textAnchor="end" className="font-mono" fontSize="11" fill="var(--ink-muted)">
            {t > 0 ? "+" : t < 0 ? "−" : ""}
            {Math.abs(t * 100)}%
          </text>
        </g>
      ))}
      {r.map((v, i) => (
        <rect key={years[i]} x={36 + i * bw + 0.5} width={Math.max(1, bw - 1)} y={v >= 0 ? Y(v) : Y(0)} height={Math.abs(Y(v) - Y(0))} fill={v >= 0 ? "var(--clay)" : "var(--line-strong)"}>
          <title>{`${years[i]}: ${pct(v, 1)}`}</title>
        </rect>
      ))}
      {[years[0], 1950, 1975, 2000, years[years.length - 1]].map((yr) => {
        const i = years.indexOf(yr);
        return i < 0 ? null : (
          <text key={yr} x={36 + i * bw + bw / 2} y={H - 8} textAnchor="middle" className="font-mono" fontSize="11" fill="var(--ink-muted)">
            {yr}
          </text>
        );
      })}
    </svg>
  );
}

type Fan = { years: number; bands: number[][]; naive: number[] };

function FanChart({ fan }: { fan: Fan }) {
  const W = 640;
  const H = 260;
  const L = 64;
  const top = Math.max(fan.bands[fan.years][4], fan.naive[fan.years]);
  const X = (t: number) => L + (t / fan.years) * (W - L - 12);
  // log scale keeps the bad and good futures readable on one chart
  const lmin = Math.log(Math.min(START / 2, fan.bands[fan.years][0]));
  const lmax = Math.log(top);
  const Y = (v: number) => 12 + ((lmax - Math.log(v)) / (lmax - lmin)) * (H - 40);
  const line = (k: number) => fan.bands.map((b, t) => `${t ? "L" : "M"}${X(t).toFixed(1)} ${Y(b[k]).toFixed(1)}`).join(" ");
  const area = (a: number, b: number) =>
    `${fan.bands.map((p, t) => `${t ? "L" : "M"}${X(t).toFixed(1)} ${Y(p[b]).toFixed(1)}`).join(" ")} ${fan.bands
      .map((p, t) => [X(t), Y(p[a])] as const)
      .reverse()
      .map(([x, y]) => `L${x.toFixed(1)} ${y.toFixed(1)}`)
      .join(" ")} Z`;
  const ticks = [START, START * 10, START * 100].filter((v) => v <= top * 1.05 && Math.log(v) >= lmin);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`Range of ${PATHS} simulated futures over ${fan.years} years. Middle outcome ${money(fan.bands[fan.years][2])}.`}>
      {ticks.map((v) => (
        <g key={v}>
          <line x1={L} x2={W - 12} y1={Y(v)} y2={Y(v)} stroke="var(--line)" />
          <text x={L - 8} y={Y(v) + 4} textAnchor="end" className="font-mono" fontSize="11" fill="var(--ink-muted)">
            {money(v)}
          </text>
        </g>
      ))}
      <path d={area(0, 4)} fill="var(--clay)" opacity={0.14} />
      <path d={area(1, 3)} fill="var(--clay)" opacity={0.28} />
      <path d={line(2)} fill="none" stroke="var(--ink)" strokeWidth={2.5} />
      <path d={fan.naive.map((v, t) => `${t ? "L" : "M"}${X(t).toFixed(1)} ${Y(v).toFixed(1)}`).join(" ")} fill="none" stroke="var(--clay-ink)" strokeWidth={2} strokeDasharray="6 5" />
      <text x={X(0)} y={H - 8} className="font-mono" fontSize="11" fill="var(--ink-muted)">
        today
      </text>
      <text x={X(fan.years)} y={H - 8} textAnchor="end" className="font-mono" fontSize="11" fill="var(--ink-muted)">
        year {fan.years}
      </text>
    </svg>
  );
}

export function LongRun() {
  const [asset, setAsset] = React.useState<Asset>("sp500");
  const [years, setYears] = React.useState(30);
  const [fan, setFan] = React.useState<(Fan & { lose: number; finals: number[] }) | null>(null);
  const r = DATA[asset] as number[];
  const s = React.useMemo(() => stats(r), [r]);

  const simulate = () => {
    const paths: number[][] = [];
    for (let k = 0; k < PATHS; k++) {
      const p = [START];
      let v = START;
      for (let t = 0; t < years; t++) {
        v *= 1 + r[Math.floor(Math.random() * r.length)]; // bootstrap: draw a real historical year at random
        p.push(v);
      }
      paths.push(p);
    }
    const bands = Array.from({ length: years + 1 }, (_, t) => {
      const col = paths.map((p) => p[t]).sort((a, b) => a - b);
      return [0.05, 0.25, 0.5, 0.75, 0.95].map((q) => pctile(col, q));
    });
    const naive = Array.from({ length: years + 1 }, (_, t) => START * (1 + s.mean) ** t);
    const finals = paths.map((p) => p[years]).sort((a, b) => a - b);
    setFan({ years, bands, naive, lose: finals.filter((v) => v < START).length / PATHS, finals });
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Asset">
        {ASSETS.map((a) => (
          <button
            key={a.id}
            type="button"
            role="radio"
            aria-checked={asset === a.id}
            onClick={() => {
              setAsset(a.id);
              setFan(null);
            }}
            className={cn("inline-flex min-h-11 items-center rounded-full border px-4 text-sm transition-colors", asset === a.id ? "border-ink bg-ink text-paper" : "border-line-strong hover:border-ink")}
          >
            {a.name}
          </button>
        ))}
      </div>

      <section className="grid gap-8 lg:grid-cols-12 lg:gap-12" aria-labelledby="hist-t">
        <div className="lg:col-span-7">
          <h2 id="hist-t" className="mb-3 font-mono text-xs uppercase tracking-[0.08em] text-ink-muted">
            Every year since {DATA.years[0]}, total return
          </h2>
          <div className="rounded-[28px] bg-sand p-4 sm:p-6">
            <Bars years={DATA.years} r={r} />
          </div>
        </div>
        <div className="space-y-5 lg:col-span-5">
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-line font-mono tabular">
            {[
              ["Average year", pct(s.mean, 1)],
              ["What money actually grew at", pct(s.geo, 1)],
              ["Spread (SD)", pct(s.sd, 1)],
              ["Down years", pct(s.down, 0)],
              [`Worst · ${DATA.years[s.worst]}`, pct(r[s.worst], 1)],
              [`Best · ${DATA.years[s.best]}`, pct(r[s.best], 1)],
            ].map(([k, v], i) => (
              <div key={k} className="bg-paper p-4">
                <dt className="text-[11px] uppercase tracking-[0.08em] text-ink-muted">{k}</dt>
                <dd className={cn("mt-1 text-xl", i === 1 && "text-clay-ink")}>{v}</dd>
              </div>
            ))}
          </dl>
          <p className="text-ink-muted">
            The average year was {pct(s.mean, 1)}, but a dollar invested in {DATA.years[0]} grew at {pct(s.geo, 1)} a year. The gap,{" "}
            {pct(s.mean - s.geo, 1)}, is <b className="font-semibold text-ink">volatility drag</b>: lose 50% then gain 50% and you are down 25%.
          </p>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-12 lg:gap-12" aria-labelledby="mc-t">
        <div className="space-y-5 lg:col-span-5">
          <h2 id="mc-t" className="font-display text-2xl font-[650]">
            Simulate {PATHS.toLocaleString()} futures
          </h2>
          <p className="text-ink-muted">
            Invest {money(START)}. Each simulated year is a real year from history drawn at random, so every crash and boom stays in the deck.
          </p>
          <div>
            <div className="flex items-baseline justify-between gap-3">
              <label htmlFor="lr-years" className="text-ink-muted">
                Years invested
              </label>
              <span className="font-mono text-lg tabular">{years}</span>
            </div>
            <input
              id="lr-years"
              type="range"
              min={5}
              max={40}
              value={years}
              onChange={(e) => {
                setYears(+e.target.value);
                setFan(null);
              }}
              className="h-11 w-full accent-[var(--clay)]"
            />
          </div>
          <button type="button" onClick={simulate} className="inline-flex h-12 items-center rounded-full bg-ink px-6 font-medium text-paper hover:bg-ink/85">
            {fan ? "Simulate again" : "Run the simulation"}
          </button>
        </div>
        <div className="space-y-4 lg:col-span-7" aria-live="polite">
          {fan ? (
            <>
              <div className="rounded-[28px] bg-sand p-4 sm:p-6">
                <FanChart fan={fan} />
              </div>
              <dl className="grid grid-cols-2 gap-3 font-mono text-sm tabular sm:grid-cols-4">
                {[
                  ["Bad case (5th pct)", money(fan.bands[fan.years][0])],
                  ["Middle outcome", money(fan.bands[fan.years][2])],
                  ["Average-year line", money(fan.naive[fan.years])],
                  ["Chance of losing money", pct(fan.lose, 1)],
                ].map(([k, v], i) => (
                  <div key={k}>
                    <dt className="text-[11px] uppercase tracking-[0.08em] text-ink-muted">{k}</dt>
                    <dd className={cn("text-xl", i === 2 && "text-clay-ink")}>{v}</dd>
                  </div>
                ))}
              </dl>
              <p className="text-sm text-ink-muted">
                Shaded: the middle 50% and 90% of futures. Solid: the middle outcome. Dashed: what you would get if every year paid the average. The
                middle outcome lands below the dashed line because of volatility drag.
              </p>
            </>
          ) : (
            <div className="grid min-h-56 place-items-center rounded-[28px] bg-sand text-sm text-ink-muted">Your futures appear here</div>
          )}
        </div>
      </section>

      <p className="text-sm text-ink-muted">
        Data:{" "}
        <a href={DATA.source.url} target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-ink">
          {DATA.source.name}
        </a>
        , updated {DATA.source.updated}. Annual total returns, {DATA.years[0]} to {DATA.years[DATA.years.length - 1]}. A teaching model, not investment advice.
      </p>
    </div>
  );
}
