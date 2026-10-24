"use client";

import * as React from "react";
import { goalMean, goalPath, inFrames, monthlyStep, pctile, putIn, readNumber } from "@/lib/decide/math";
import { useMediaQuery } from "@/lib/hooks";
import { HowItWorks, NumField, Presets, Stat, Stats, chance, dollars, useToolXp } from "@/components/decide/fields";

const PATHS = 5000;
const PER_FRAME = 500;
/** Futures drawn as thin lines, so the fan is not only a shape. */
const SAMPLE = 24;

type Preset = { label: string; note: string; start: string; monthly: string; years: string; ret: string; vol: string; goal: string };

/** Made-up assumptions, round and plausible. */
const PRESETS: Preset[] = [
  {
    label: "Emergency fund, savings account",
    note: "$1,000 to start and $300 a month in a savings account paying about 4%. The rate can drift a little, so a 1% wobble. The goal: $12,000, about six months of costs, in three years.",
    start: "1,000",
    monthly: "300",
    years: "3",
    ret: "4",
    vol: "1",
    goal: "12,000",
  },
  {
    label: "Stock index plan",
    note: "$5,000 to start and $500 a month in a broad stock index fund for 20 years. We assume 7% a year on average, with typical yearly swings of 15%. The goal: $250,000.",
    start: "5,000",
    monthly: "500",
    years: "20",
    ret: "7",
    vol: "15",
    goal: "250,000",
  },
  {
    label: "Riskier portfolio",
    note: "$10,000 to start and $400 a month for 15 years in a handful of fast-growing stocks. We assume 10% a year on average, with swings of 30%. The goal: $200,000.",
    start: "10,000",
    monthly: "400",
    years: "15",
    ret: "10",
    vol: "30",
    goal: "200,000",
  },
];

type Result = {
  years: number;
  done: number;
  samples: number[][];
  /** Sorted final balances, once every path is in. */
  finals: Float64Array | null;
  bands: { p10: number[]; p50: number[]; p90: number[] } | null;
  put: number[];
};

/** How many sorted values are at or above x. */
function countAtLeast(sorted: Float64Array, x: number) {
  let lo = 0;
  let hi = sorted.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (sorted[mid] < x) lo = mid + 1;
    else hi = mid;
  }
  return sorted.length - lo;
}

/** $250k, $1.2M, $900: short labels for the chart's axis. */
function compact(v: number) {
  const a = Math.abs(v);
  if (a >= 1e6) return `$${(v / 1e6).toFixed(a >= 1e7 ? 0 : 1).replace(/\.0$/, "")}M`;
  if (a >= 1e3) return `$${(v / 1e3).toFixed(a >= 1e4 ? 0 : 1).replace(/\.0$/, "")}k`;
  return `$${Math.round(v)}`;
}

export function Goal() {
  const [preset, setPreset] = React.useState(1);
  const [start, setStart] = React.useState(PRESETS[1].start);
  const [monthly, setMonthly] = React.useState(PRESETS[1].monthly);
  const [years, setYears] = React.useState(PRESETS[1].years);
  const [ret, setRet] = React.useState(PRESETS[1].ret);
  const [vol, setVol] = React.useState(PRESETS[1].vol);
  const [goal, setGoal] = React.useState(PRESETS[1].goal);
  const [res, setRes] = React.useState<Result | null>(null);
  const [runs, setRuns] = React.useState(0);
  const xp = useToolXp("goal");
  const cancel = React.useRef<() => void>(() => {});

  const S = readNumber(start);
  const m = monthly.trim() === "" ? 0 : readNumber(monthly);
  const Y = readNumber(years);
  const r = readNumber(ret) / 100;
  const v = readNumber(vol) / 100;
  const G = readNumber(goal);
  const errors = [
    !(S >= 0) && "The start amount is $0 or more.",
    !(m >= 0) && "The monthly amount is $0 or more.",
    S + m <= 0 && "Put in something, at the start or each month.",
    !(Number.isInteger(Y) && Y >= 1 && Y <= 50) && "Years is a whole number from 1 to 50.",
    !(r >= -0.2 && r <= 0.3) && "The yearly return runs from −20% to 30%.",
    !(v >= 0 && v <= 0.8) && "Volatility runs from 0% to 80%.",
  ].filter(Boolean) as string[];
  const goalOk = G > 0;
  const ready = errors.length === 0;

  // One run: 5,000 futures, 500 per frame, each recorded at every year end for the fan.
  const run = React.useCallback(() => {
    cancel.current();
    const s0 = readNumber(start);
    const m0 = monthly.trim() === "" ? 0 : readNumber(monthly);
    const y0 = readNumber(years);
    const r0 = readNumber(ret) / 100;
    const v0 = readNumber(vol) / 100;
    if (!(s0 >= 0 && m0 >= 0 && s0 + m0 > 0 && Number.isInteger(y0) && y0 >= 1 && y0 <= 50 && r0 >= -0.2 && r0 <= 0.3 && v0 >= 0 && v0 <= 0.8)) return;
    const { mu, sd } = monthlyStep(r0, v0);
    const stride = y0 + 1;
    const yearly = new Float64Array(PATHS * stride);
    const finals = new Float64Array(PATHS);
    const put = Array.from({ length: stride }, (_, y) => putIn(s0, m0, y));
    const samplesOf = (n: number) => Array.from({ length: Math.min(n, SAMPLE) }, (_, i) => Array.from(yearly.subarray(i * stride, (i + 1) * stride)));
    // With reduced motion the fan appears finished instead of drawing in; the work still runs in frames.
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!still) setRes({ years: y0, done: 0, samples: [], finals: null, bands: null, put });
    cancel.current = inFrames(
      PATHS,
      PER_FRAME,
      (from, to) => {
        for (let i = from; i < to; i++) finals[i] = goalPath(s0, m0, y0, mu, sd, Math.random, yearly, i * stride);
      },
      (done) => {
        if (done < PATHS && !still) setRes({ years: y0, done, samples: samplesOf(done), finals: null, bands: null, put });
      },
      () => {
        const col = new Float64Array(PATHS);
        const bands = { p10: [] as number[], p50: [] as number[], p90: [] as number[] };
        for (let y = 0; y < stride; y++) {
          for (let i = 0; i < PATHS; i++) col[i] = yearly[i * stride + y];
          col.sort();
          bands.p10.push(pctile(col, 0.1));
          bands.p50.push(pctile(col, 0.5));
          bands.p90.push(pctile(col, 0.9));
        }
        finals.sort();
        setRes({ years: y0, done: PATHS, samples: samplesOf(PATHS), finals, bands, put });
        setRuns((n) => n + 1);
      },
    );
  }, [start, monthly, years, ret, vol]);

  // Run on load and shortly after a number changes. The goal is read live from the finished run, so changing it never re-runs.
  const runRef = React.useRef(run);
  React.useEffect(() => {
    runRef.current = run;
  }, [run]);
  React.useEffect(() => {
    // Stop the run in flight as soon as a number changes, then start a fresh one once typing pauses.
    cancel.current();
    const t = setTimeout(() => runRef.current(), 250);
    return () => clearTimeout(t);
  }, [start, monthly, years, ret, vol]);
  React.useEffect(() => () => cancel.current(), []);

  const choose = (i: number) => {
    const p = PRESETS[i];
    setPreset(i);
    setStart(p.start);
    setMonthly(p.monthly);
    setYears(p.years);
    setRet(p.ret);
    setVol(p.vol);
    setGoal(p.goal);
    xp();
  };
  const edit = (set: (v: string) => void) => (val: string) => {
    set(val);
    setPreset(-1);
    xp();
  };

  // Results only show while every box is valid, so old numbers never sit beside a broken input.
  const finished = ready && res?.finals && res.bands ? res : null;
  const fin = finished?.finals ?? null;
  const hits = fin && goalOk ? countAtLeast(fin, G) : 0;
  const p10 = fin ? pctile(fin, 0.1) : NaN;
  const p50 = fin ? pctile(fin, 0.5) : NaN;
  const p90 = fin ? pctile(fin, 0.9) : NaN;
  const mean = ready ? goalMean(S, m, Y, r) : NaN;
  const put = ready ? putIn(S, m, Y) : NaN;

  let read = ready ? "Playing out 5,000 futures…" : "Fix the numbers in red and the futures run again.";
  if (finished && fin) {
    read = `${goalOk ? `In ${chance(hits / PATHS, 0)} of ${PATHS.toLocaleString()} futures you reach ${dollars(G)} after ${Y} year${Y === 1 ? "" : "s"}. ` : ""}The middle future ends at ${dollars(p50)}, and 8 in 10 end between ${dollars(p10)} and ${dollars(p90)}. You put in ${dollars(put)}.`;
    if (mean > p50 * 1.05) read += ` The average, ${dollars(mean)}, is higher than the middle because a few lucky futures pull it up. Plan on the middle, not the average.`;
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="space-y-6 lg:col-span-5">
          <div className="space-y-2">
            <Presets label="Example plans" items={PRESETS.map((x) => x.label)} value={preset} onChange={choose} />
            <p className="text-sm text-ink-muted">
              {preset >= 0 ? `${PRESETS[preset].note} ` : ""}
              <b className="font-medium text-ink">Made-up assumptions. Past returns don&rsquo;t promise future ones.</b>
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <NumField id="gl-start" label="Start with" prefix="$" value={start} onChange={edit(setStart)} invalid={!(S >= 0)} describedBy="gl-hint" />
            <NumField id="gl-month" label="Add each month" prefix="$" value={monthly} onChange={edit(setMonthly)} invalid={!(m >= 0)} describedBy="gl-hint" />
            <NumField id="gl-years" label="For how many years" value={years} onChange={edit(setYears)} inputMode="numeric" invalid={!(Number.isInteger(Y) && Y >= 1 && Y <= 50)} describedBy="gl-hint" />
            <NumField id="gl-goal" label="Your goal" prefix="$" value={goal} onChange={(val) => { setGoal(val); setPreset(-1); xp(); }} invalid={!goalOk} describedBy="gl-hint" />
            <NumField id="gl-ret" label="Average yearly return" suffix="%" value={ret} onChange={edit(setRet)} invalid={!(r >= -0.2 && r <= 0.3)} describedBy="gl-hint" />
            <NumField id="gl-vol" label="Typical yearly swing" suffix="%" value={vol} onChange={edit(setVol)} invalid={!(v >= 0 && v <= 0.8)} describedBy="gl-hint" />
          </div>
          <p id="gl-hint" className="text-sm text-ink-muted" role={ready && goalOk ? undefined : "alert"}>
            {!ready
              ? errors.join(" ")
              : !goalOk
                ? "Set a goal above $0 to see your chance of reaching it."
                : "The swing is the volatility: how far a typical year lands from the average, up or down. A savings account barely swings; stocks swing a lot."}
          </p>
        </div>

        <div className="space-y-6 lg:col-span-7">
          <div className="rounded-[28px] bg-sand p-3 sm:p-5">
            {ready && res ? (
              <FanChart res={res} goal={goalOk ? G : NaN} />
            ) : (
              <p className="grid min-h-60 place-items-center p-6 text-center text-ink-muted">{ready ? "Playing out 5,000 futures…" : "Fix the numbers in red and the futures land here."}</p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => { run(); xp(); }}
              disabled={!ready}
              className="inline-flex h-12 items-center rounded-full bg-ink px-6 font-medium text-paper hover:bg-ink/85 disabled:opacity-50 disabled:hover:bg-ink"
            >
              {res && !res.finals ? `Playing… ${Math.round((res.done / PATHS) * 100)}%` : `Play ${PATHS.toLocaleString()} new futures`}
            </button>
            <span className="font-mono text-xs text-ink-muted tabular">{runs > 0 ? `${PATHS.toLocaleString()} futures, month by month · run ${runs}` : ""}</span>
          </div>

          {finished && fin && (
            <>
              <Stats className="grid-cols-2">
                <Stat k={goalOk ? `Chance you reach ${dollars(G)}` : "Chance you reach it"} v={goalOk ? chance(hits / PATHS, 0) : "?"} tone="clay" sub={goalOk ? `${hits.toLocaleString()} of ${PATHS.toLocaleString()} futures, by the end of year ${Y}` : "set a goal"} />
                <Stat k="You put in" v={dollars(put)} sub={`${dollars(S)} plus ${dollars(m)} a month`} />
              </Stats>
              <Stats className="grid-cols-1 sm:grid-cols-3">
                <Stat k="Bad case" v={dollars(p10)} sub="1 future in 10 ends below this" />
                <Stat k="The middle" v={dollars(p50)} sub="half end above, half below" />
                <Stat k="Good case" v={dollars(p90)} sub="1 future in 10 ends above this" />
              </Stats>
            </>
          )}
          <p aria-live="polite" className="text-ink-muted">
            {read}
          </p>
        </div>
      </div>

      <HowItWorks
        id="gl"
        steps={[
          {
            title: "Start with a guess about returns.",
            body: (
              <p>
                You give two numbers: the average yearly return, and how much a typical year swings around it, called <b>volatility</b>. Both are assumptions, not facts. A savings
                account pays a steady rate. A stock fund might average 7% over decades, but any single year can be up 25% or down 30%.
              </p>
            ),
          },
          {
            title: "Play out one month.",
            body: (
              <p>
                Each month the balance grows by a random amount: usually a little, sometimes a lot, sometimes it shrinks. Then your monthly saving goes in. The random growth is set
                up so that, on average, a year grows by exactly your average return.
              </p>
            ),
            math: (
              <>
                next = balance × e^(μ + s × z) + monthly · s = volatility ÷ √12 · μ = ln(1 + return) ÷ 12 − s² ÷ 2 · z is a random draw from the bell curve
              </>
            ),
          },
          {
            title: "Repeat for every month, then 5,000 times.",
            body: (
              <p>
                Twenty years is 240 months, so one future is 240 random steps. That is one way things could go. Play it out 5,000 times and the futures spread into a fan: narrow at
                the start, wider every year, because surprises pile up. This is a <b>Monte Carlo simulation</b>.
              </p>
            ),
          },
          {
            title: "Read the fan.",
            body: (
              <p>
                At every year, line up the 5,000 balances from lowest to highest. The one a tenth of the way in is the bad case, the middle one is the middle, and the one nine
                tenths in is the good case. The shaded band holds 8 futures in 10. Your chance of reaching the goal is the share of futures that end at or above it.
              </p>
            ),
            math: <>chance of reaching the goal = futures ending at or above it ÷ 5,000</>,
          },
          {
            title: "The average is not the typical.",
            body: (
              <p>
                Big swings help a few futures a lot and hurt many a little, so the average sits above the middle. In the riskier example the average ends near $201,000, right at the
                goal, yet only about 1 in 3 futures get there, and the middle one ends well short of it, around $140,000. Plan on the middle and the bad case, not the average.
              </p>
            ),
            math: <>average final = start × (1 + return)^years + monthly × (g^months − 1) ÷ (g − 1), with g = (1 + return)^(1/12)</>,
          },
        ]}
        after={
          <>
            <p className="font-display text-xl font-[650] !text-ink">What this leaves out</p>
            <p>
              These are made-up assumptions, and past returns don&rsquo;t promise future ones. Real markets have worse crashes than this model draws, and good and bad years tend
              to bunch together. There are no fees, taxes or inflation here, and every month&rsquo;s saving goes in without fail.
            </p>
            <p>
              Use it to see how the range widens with risk and with time, and how much a bigger monthly saving moves the bad case. For learning, not financial advice.
            </p>
          </>
        }
      />
    </div>
  );
}

/** A round step (1, 2 or 5 times a power of ten) for three or four gridlines. */
function niceStep(max: number) {
  const raw = Math.max(max / 3, 1e-9);
  const p = 10 ** Math.floor(Math.log10(raw));
  const q = raw / p;
  return (q < 1.5 ? 1 : q < 3.5 ? 2 : q < 7.5 ? 5 : 10) * p;
}

/** The fan: the band 8 in 10 futures fall in, the middle line, a few single futures, what you put in, and the goal. */
function FanChart({ res, goal }: { res: Result; goal: number }) {
  const narrow = useMediaQuery("(max-width: 639px)");
  const W = narrow ? 360 : 560;
  const H = narrow ? 250 : 280;
  const L = 46;
  const R = 10;
  const top = 26;
  const base = H - 30;
  const Y = res.years;
  const sampleEnds = res.samples.map((s) => s[s.length - 1]).sort((a, b) => a - b);
  const reach = res.bands ? res.bands.p90[Y] : sampleEnds.length ? pctile(sampleEnds, 0.9) : res.put[Y] * 1.5;
  const want = Math.max(reach, res.put[Y], Number.isFinite(goal) ? goal : 0) * 1.08;
  const step = niceStep(want);
  const max = Math.ceil(want / step) * step;
  const X = (y: number) => L + (y / Y) * (W - L - R);
  const V = (v: number) => base - (Math.max(0, Math.min(v, max)) / max) * (base - top);
  const line = (vs: number[]) => vs.map((v, y) => `${y ? "L" : "M"} ${X(y).toFixed(1)} ${V(v).toFixed(1)}`).join(" ");
  const ticks = Array.from({ length: Math.round(max / step) + 1 }, (_, i) => i * step);
  const xTicks = Y <= 1 ? [0, Y] : [0, Math.round(Y / 2), Y];
  const b = res.bands;
  const band = b
    ? `${b.p90.map((v, y) => `${y ? "L" : "M"} ${X(y).toFixed(1)} ${V(v).toFixed(1)}`).join(" ")} ${b.p10
        .map((v, y) => [y, v] as const)
        .reverse()
        .map(([y, v]) => `L ${X(y).toFixed(1)} ${V(v).toFixed(1)}`)
        .join(" ")} Z`
    : "";
  const gy = Number.isFinite(goal) ? V(goal) : NaN;
  const label = b
    ? `Fan of ${PATHS.toLocaleString()} simulated futures over ${Y} year${Y === 1 ? "" : "s"}. After ${Y} year${Y === 1 ? "" : "s"}, 8 in 10 end between ${dollars(b.p10[Y])} and ${dollars(b.p90[Y])}, the middle at ${dollars(b.p50[Y])}. You put in ${dollars(res.put[Y])}.${Number.isFinite(goal) ? ` Goal ${dollars(goal)}.` : ""}`
    : "Fan of simulated futures, still drawing.";

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={label}>
      <defs>
        <clipPath id="gl-plot">
          <rect x={L} y={top - 2} width={W - L - R} height={base - top + 2} />
        </clipPath>
      </defs>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={L} x2={W - R} y1={V(t)} y2={V(t)} stroke="var(--line)" />
          <text x={L - 6} y={V(t) + 4} textAnchor="end" className="font-mono" fontSize="11" fill="var(--ink-muted)">
            {compact(t)}
          </text>
        </g>
      ))}
      {xTicks.map((y, i) => (
        <text key={i} x={X(y)} y={H - 10} textAnchor={i === 0 ? "start" : i === xTicks.length - 1 ? "end" : "middle"} className="font-mono" fontSize="12" fill="var(--ink-muted)">
          {y === 0 ? "now" : `year ${y}`}
        </text>
      ))}
      <g clipPath="url(#gl-plot)">
        {band && <path d={band} fill="var(--clay)" fillOpacity={0.2} />}
        {res.samples.map((s, i) => (
          <path key={i} d={line(s)} fill="none" stroke="var(--ink-muted)" strokeOpacity={0.35} strokeWidth={1} />
        ))}
        <path d={line(res.put)} fill="none" stroke="var(--ink)" strokeWidth={1.5} strokeDasharray="5 4" />
        {b && <path d={line(b.p50)} fill="none" stroke="var(--clay)" strokeWidth={2.5} strokeLinejoin="round" />}
      </g>
      {Number.isFinite(gy) && (
        <g>
          <line x1={L} x2={W - R} y1={gy} y2={gy} stroke="var(--ink)" strokeWidth={1.5} />
          <rect x={L + 4} y={gy - 19} width={compact(goal).length * 7.4 + 44} height={16} rx={8} fill="var(--ink)" />
          <text x={L + 12} y={gy - 7} className="font-mono" fontSize="11" fill="var(--paper)">
            goal {compact(goal)}
          </text>
        </g>
      )}
      <text x={L} y={13} className="font-mono" fontSize="11.5" fill="var(--ink-muted)">
        {narrow ? "band: 8 in 10 · line: middle · dashed: put in" : "Shaded: 8 in 10 futures · line: the middle · dashed: what you put in"}
      </text>
    </svg>
  );
}
