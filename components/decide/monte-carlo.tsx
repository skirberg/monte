"use client";

import * as React from "react";
import { Plus, X } from "lucide-react";
import { cn } from "cn";
import { bounds, inFrames, pctile, rangeOk, readNumber, scoreDraw, triangular, type Range } from "@/lib/decide/math";
import { useMediaQuery } from "@/lib/hooks";
import { HowItWorks, NumField, Presets, Slider, TextField, Toggle, chance, dollars, useToolXp } from "@/components/decide/fields";

const DRAWS = 10000;
const PER_FRAME = 1000;
const BINS = 36;

type Opt = { name: string; worst: string; likely: string; best: string };
type Preset = { label: string; note: string; measure: string; unit: "dollars" | "plain"; higher: boolean; line: number; opts: Opt[] };

const k = (n: number) => n.toLocaleString("en-US");
const opt = (name: string, worst: number, likely: number, best: number): Opt => ({ name, worst: k(worst), likely: k(likely), best: k(best) });

const PRESETS: Preset[] = [
  {
    label: "Two job offers",
    note: "Job A pays $95,000 plus a bonus of up to $15,000, usually about $8,000. Job B pays $85,000 plus a startup bonus that could be nothing or $60,000. The line is what you need for rent and savings.",
    measure: "Total pay in year one",
    unit: "dollars",
    higher: true,
    line: 95000,
    opts: [opt("Job A", 95000, 103000, 110000), opt("Job B", 85000, 100000, 145000)],
  },
  {
    label: "Launch product A or B",
    note: "Product A is an add-on for people who already buy from you: a small, safe bet. Product B is a bold new line that could flop or take off. The line is zero: below it, you lost money.",
    measure: "Profit in year one",
    unit: "dollars",
    higher: true,
    line: 0,
    opts: [opt("Product A", -20000, 60000, 120000), opt("Product B", -150000, 40000, 400000)],
  },
  {
    label: "Used car or new car",
    note: "Price plus five years of repairs, insurance and fuel, minus what you sell it for. The used car is cheaper unless something big breaks. The new one has a warranty. Lower is better here, and the line is your budget.",
    measure: "Total cost over five years",
    unit: "dollars",
    higher: false,
    line: 32000,
    opts: [opt("Used car", 40000, 27000, 22000), opt("New car", 36000, 33000, 31000)],
  },
];

/** Series looks: color plus a dash pattern, so the options differ by more than color. */
const SERIES = [
  { stroke: "var(--clay)", fill: "var(--clay)", dash: undefined, swatch: "bg-clay" },
  { stroke: "var(--ink)", fill: "var(--ink)", dash: undefined, swatch: "bg-ink" },
  { stroke: "var(--ink-muted)", fill: "var(--ink-muted)", dash: "5 4", swatch: "bg-ink-muted" },
];

type Result = {
  names: string[];
  lo: number;
  hi: number;
  done: number;
  hist: number[][];
  wins: number[];
  sorted: Float64Array[] | null;
  higher: boolean;
  money: boolean;
};

const toRange = (o: Opt): Range => ({ worst: readNumber(o.worst), likely: readNumber(o.likely), best: readNumber(o.best) });

/** One shared scale for every option, from the lowest low to the highest high. */
function spanOf(rs: Range[]) {
  const lo = Math.min(...rs.map((r) => bounds(r).lo));
  const hi = Math.max(...rs.map((r) => bounds(r).hi));
  return hi > lo ? { lo, hi } : { lo: lo - 1, hi: hi + 1 };
}

/** How many of a sorted array fall below x, by binary search. */
function countBelow(sorted: Float64Array, x: number) {
  let lo = 0;
  let hi = sorted.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (sorted[mid] < x) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

/** A step for the threshold slider: about 1/200 of the span, rounded to 1, 2 or 5 times a power of ten. */
function niceStep(span: number) {
  const raw = Math.max(span / 200, 1e-9);
  const p = 10 ** Math.floor(Math.log10(raw));
  const m = raw / p;
  return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p;
}

export function MonteCarlo() {
  const [preset, setPreset] = React.useState(0);
  const [measure, setMeasure] = React.useState(PRESETS[0].measure);
  const [unit, setUnit] = React.useState<Preset["unit"]>(PRESETS[0].unit);
  const [higher, setHigher] = React.useState(PRESETS[0].higher);
  const [opts, setOpts] = React.useState<Opt[]>(PRESETS[0].opts);
  const [line, setLine] = React.useState(PRESETS[0].line);
  const [res, setRes] = React.useState<Result | null>(null);
  const [runs, setRuns] = React.useState(0);
  const xp = useToolXp("monte-carlo");
  const cancel = React.useRef<() => void>(() => {});

  const ranges = opts.map(toRange);
  const bad = ranges.map((r) => !rangeOk(r));
  const ready = bad.every((b) => !b);
  const money = unit === "dollars";
  const fmt = React.useCallback((v: number) => (money ? dollars(v) : Math.abs(v) >= 1000 ? Math.round(v).toLocaleString("en-US") : String(Math.round(v * 10) / 10)), [money]);
  const span = ready ? spanOf(ranges) : null;

  // One run: 10,000 draws per option, a thousand per frame, binned as they land so the piles grow on screen.
  const run = React.useCallback(() => {
    cancel.current();
    const rs = opts.map(toRange);
    if (!rs.every(rangeOk)) return;
    const sp = spanOf(rs);
    const names = opts.map((o, i) => o.name.trim() || `Option ${String.fromCharCode(65 + i)}`);
    const bs = rs.map(bounds);
    const draws = bs.map(() => new Float64Array(DRAWS));
    const hist = bs.map(() => new Array<number>(BINS).fill(0));
    const wins = bs.map(() => 0);
    const width = (sp.hi - sp.lo) / BINS;
    const row = new Array<number>(bs.length);
    const base = { names, lo: sp.lo, hi: sp.hi, higher, money };
    // With reduced motion the piles appear finished instead of filling in; the work still runs in frames.
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!still) setRes({ ...base, done: 0, hist: hist.map((h) => [...h]), wins: [...wins], sorted: null });
    cancel.current = inFrames(
      DRAWS,
      PER_FRAME,
      (from, to) => {
        for (let i = from; i < to; i++) {
          for (let j = 0; j < bs.length; j++) {
            const v = triangular(bs[j].lo, bs[j].mode, bs[j].hi, Math.random());
            draws[j][i] = v;
            row[j] = v;
            hist[j][Math.max(0, Math.min(BINS - 1, Math.floor((v - sp.lo) / width)))]++;
          }
          scoreDraw(row, higher, wins);
        }
      },
      (done) => {
        if (done < DRAWS && !still) setRes({ ...base, done, hist: hist.map((h) => [...h]), wins: [...wins], sorted: null });
      },
      () => {
        draws.forEach((d) => d.sort());
        setRes({ ...base, done: DRAWS, hist, wins, sorted: draws });
        setRuns((n) => n + 1);
      },
    );
  }, [opts, higher, money]);

  // Run on load and again shortly after a number changes, so the answer always matches the boxes.
  // Renaming an option does not re-run: names are read live from the boxes.
  const runRef = React.useRef(run);
  React.useEffect(() => {
    runRef.current = run;
  }, [run]);
  const numbers = opts.map((o) => `${o.worst}|${o.likely}|${o.best}`).join(";");
  React.useEffect(() => {
    const t = setTimeout(() => runRef.current(), 250);
    return () => clearTimeout(t);
  }, [numbers, higher, money]);
  React.useEffect(() => () => cancel.current(), []);

  const choose = (i: number) => {
    const p = PRESETS[i];
    setPreset(i);
    setMeasure(p.measure);
    setUnit(p.unit);
    setHigher(p.higher);
    setOpts(p.opts);
    setLine(p.line);
    xp();
  };
  const edit = (i: number, key: keyof Opt, v: string) => {
    setOpts((os) => os.map((o, j) => (j === i ? { ...o, [key]: v } : o)));
    setPreset(-1);
    xp();
  };
  const addThird = () => {
    setOpts((os) => {
      if (os.length >= 3) return os;
      const r = ranges[1] ?? ranges[0];
      return [...os, Number.isFinite(r.likely) ? { name: "Option C", worst: k(r.worst), likely: k(r.likely), best: k(r.best) } : { name: "Option C", worst: "", likely: "", best: "" }];
    });
    setPreset(-1);
    xp();
  };
  const remove = (i: number) => {
    setOpts((os) => os.filter((_, j) => j !== i));
    setPreset(-1);
    xp();
  };

  const step = span ? niceStep(span.hi - span.lo) : 1;
  const lineMin = span ? Math.floor(span.lo / step) * step : 0;
  const lineMax = span ? Math.ceil(span.hi / step) * step : 1;
  const lineAt = Math.min(lineMax, Math.max(lineMin, line));

  // Results only show while every box is valid, so old numbers never sit beside a broken input.
  const finished = ready && res?.sorted ? res : null;
  const stats = finished
    ? finished.sorted!.map((s, j) => {
        const below = countBelow(s, lineAt) / DRAWS;
        return { name: opts[j]?.name.trim() || `Option ${String.fromCharCode(65 + j)}`, top: finished.wins[j] / DRAWS, p10: pctile(s, 0.1), p50: pctile(s, 0.5), p90: pctile(s, 0.9), miss: finished.higher ? below : 1 - below };
      })
    : null;
  const leader = stats ? stats.reduce((b, s, j) => (s.top > stats[b].top ? j : b), 0) : 0;
  const missWord = higher ? `below ${fmt(lineAt)}` : `above ${fmt(lineAt)}`;

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
        {/* ---------- inputs ---------- */}
        <div className="space-y-6 lg:col-span-5">
          <div className="space-y-2">
            <Presets label="Examples" items={PRESETS.map((p) => p.label)} value={preset} onChange={choose} />
            <p className="text-sm text-ink-muted">{preset >= 0 ? `${PRESETS[preset].note} ` : ""}Made-up numbers. Change any of them, or type your own choice.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <TextField id="mc-measure" label="What are you comparing?" value={measure} onChange={(v) => { setMeasure(v); xp(); }} />
            <div className="space-y-1.5">
              <p className="text-sm text-ink-muted" id="mc-dir-l">Which way is better?</p>
              <Toggle label="Which way is better" value={higher ? "hi" : "lo"} onChange={(v) => { setHigher(v === "hi"); setPreset(-1); xp(); }} options={[["hi", "Higher"], ["lo", "Lower"]]} />
            </div>
          </div>
          <Toggle label="Units" value={unit} onChange={(v) => { setUnit(v); xp(); }} options={[["dollars", "Dollars"], ["plain", "Plain numbers"]]} />

          <ol className="space-y-4">
            {opts.map((o, i) => (
              <li key={i} className="space-y-3 rounded-2xl border border-line p-4">
                <div className="flex items-end gap-2">
                  <span aria-hidden="true" className={cn("mb-5 size-3 shrink-0 rounded-full", SERIES[i].swatch)} />
                  <TextField id={`mc-name-${i}`} label={`Option ${String.fromCharCode(65 + i)} name`} value={o.name} onChange={(v) => edit(i, "name", v)} className="flex-1" />
                  {opts.length > 2 && (
                    <button type="button" onClick={() => remove(i)} aria-label={`Remove ${o.name || `option ${i + 1}`}`} className="mb-0.5 grid size-11 shrink-0 place-items-center rounded-full text-ink-muted hover:bg-sand hover:text-ink">
                      <X className="size-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      ["worst", "Worst"],
                      ["likely", "Likely"],
                      ["best", "Best"],
                    ] as const
                  ).map(([key, l]) => (
                    <NumField key={key} id={`mc-${key}-${i}`} label={money ? `${l}, $` : l} value={o[key]} onChange={(v) => edit(i, key, v)} invalid={bad[i]} describedBy={bad[i] ? `mc-err-${i}` : undefined} size="md" className="[&_span]:px-2.5" />
                  ))}
                </div>
                {bad[i] && (
                  <p id={`mc-err-${i}`} role="alert" className="text-sm text-[var(--danger)]">
                    Use three numbers, with likely between worst and best.
                  </p>
                )}
              </li>
            ))}
          </ol>
          {opts.length < 3 && (
            <button type="button" onClick={addThird} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line-strong px-4 text-sm hover:border-ink">
              <Plus className="size-4" /> Add a third option
            </button>
          )}
        </div>

        {/* ---------- results ---------- */}
        <div className="space-y-6 lg:col-span-7">
          <div className="rounded-[28px] bg-sand p-3 sm:p-5">
            {res && span ? (
              <PileChart res={res} line={lineAt} fmt={fmt} stats={stats} />
            ) : (
              <p className="grid min-h-60 place-items-center p-6 text-center text-ink-muted">{ready ? `Drawing ${DRAWS.toLocaleString()} futures…` : "Fix the numbers in red and the futures land here."}</p>
            )}
          </div>

          {span && (
            <Slider
              id="mc-line"
              label={higher ? "Your line: the least you can live with" : "Your line: the most you can live with"}
              value={lineAt}
              min={lineMin}
              max={lineMax}
              step={step}
              onChange={(v) => { setLine(v); xp(); }}
              shown={fmt(lineAt)}
            />
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => { run(); xp(); }}
              disabled={!ready}
              className="inline-flex h-12 items-center rounded-full bg-ink px-6 font-medium text-paper hover:bg-ink/85 disabled:opacity-50 disabled:hover:bg-ink"
            >
              {res && !res.sorted ? `Drawing… ${Math.round((res.done / DRAWS) * 100)}%` : `Draw ${DRAWS.toLocaleString()} new futures`}
            </button>
            <span className="font-mono text-xs text-ink-muted tabular">{runs > 0 ? `${DRAWS.toLocaleString()} draws per option · run ${runs}` : ""}</span>
          </div>

          {stats && (
            <ul className={cn("grid gap-3", stats.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2")}>
              {stats.map((s, j) => (
                <li key={j} className={cn("min-w-0 space-y-3 rounded-2xl p-4", j === leader ? "bg-clay-tint" : "border border-line")}>
                  <p className="flex items-center gap-2 font-medium">
                    <span aria-hidden="true" className={cn("size-3 shrink-0 rounded-full", SERIES[j].swatch)} />
                    <span className="min-w-0 break-words">{s.name}</span>
                  </p>
                  <dl className="space-y-2 font-mono text-sm tabular">
                    <div>
                      <dt className="text-[11px] uppercase tracking-[0.08em] text-ink-muted">Comes out on top</dt>
                      <dd className={cn("text-3xl font-medium tracking-[-0.03em]", j === leader && "text-clay-ink")}>{chance(s.top, 0)}</dd>
                    </div>
                    <div>
                      <dt className="text-[11px] uppercase tracking-[0.08em] text-ink-muted">8 in 10 land between</dt>
                      <dd>
                        {fmt(s.p10)} and {fmt(s.p90)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[11px] uppercase tracking-[0.08em] text-ink-muted">Chance {missWord}</dt>
                      <dd>{chance(s.miss, 1)}</dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ul>
          )}

          <p aria-live="polite" className="text-ink-muted">
            {stats ? summary(stats, leader, higher, fmt, missWord, measure) : ready ? "Drawing futures…" : "Fix the numbers in red and the futures run again."}
          </p>
        </div>
      </div>

      <HowItWorks
        id="mc"
        steps={[
          {
            title: "Give a range, not one number.",
            body: (
              <p>
                For each option you type three numbers: the worst it could reasonably be, the most likely, and the best. Nobody knows next year&rsquo;s bonus. Most people can say
                &ldquo;somewhere between nothing and $15,000, probably about $8,000.&rdquo; That is all this needs.
              </p>
            ),
          },
          {
            title: "Turn the range into a triangle.",
            body: (
              <p>
                Picture a triangle sitting on the line from worst to best, with its peak over the likely value. Tall parts are common outcomes. The thin ends are rare ones.
                This is called a <b>triangular distribution</b>. It is the simplest shape that respects all three of your numbers.
              </p>
            ),
            math: (
              <>
                For a random u between 0 and 1, with low a, likely c and high b: if u &lt; (c − a)/(b − a), the draw is a + √(u(b − a)(c − a)); otherwise b − √((1 − u)(b − a)(b − c)).
              </>
            ),
          },
          {
            title: "Play out one possible future.",
            body: <p>The computer picks one random value from each triangle. That is one way next year could go. It notes which option came out on top.</p>,
          },
          {
            title: "Do it 10,000 times.",
            body: (
              <p>
                One future tells you nothing. Ten thousand of them pile up into a shape, like grains on the board on our home page. This is a <b>Monte Carlo simulation</b>, named
                after the casino, because it runs on chance. It is where this site gets its name.
              </p>
            ),
          },
          {
            title: "Count.",
            body: (
              <p>
                Chance on top is how many of the 10,000 futures each option won. &ldquo;8 in 10 land between&rdquo; uses the <b>10th and 90th percentiles</b>: line up all 10,000
                draws from worst to best, and read the one a tenth of the way in and the one nine tenths of the way in. Your line is the share of draws on the wrong side of it.
              </p>
            ),
            math: <>chance on top = wins ÷ 10,000 · chance past your line = draws past it ÷ 10,000</>,
          },
        ]}
        after={
          <>
            <p className="font-display text-xl font-[650] !text-ink">Why ranges beat single guesses</p>
            <p>
              A single guess hides how wrong you could be. In the job example both offers have a likely pay near $100,000, so one guess each calls it a tie. The ranges say
              something different: Job B wins more often, and it is also the only one that can leave you short.
            </p>
            <p>
              The likely value is not the average either. Product B&rsquo;s likely profit is $40,000, but its long upside pulls the average to about $97,000, more than twice as
              much. Planning on one number misses both the risk and the upside. Seeing the whole pile lets you pick the option that fits how much risk you can carry.
            </p>
            <p>
              Each draw here treats the options as independent. In real life they can move together (a bad economy hurts both jobs), and the triangle is only as good as your
              three numbers. It is a way to think clearly, not a forecast.
            </p>
          </>
        }
      />
    </div>
  );
}

function summary(stats: { name: string; top: number; p10: number; p90: number; miss: number }[], leader: number, higher: boolean, fmt: (v: number) => string, missWord: string, measure: string) {
  const L = stats[leader];
  const others = stats.filter((_, j) => j !== leader);
  // The bad end of the range: the low end when higher is better, the high end when lower is better.
  const badEnd = (s: (typeof stats)[number]) => (higher ? s.p10 : s.p90);
  const riskier = others.find((o) => (higher ? badEnd(o) > badEnd(L) : badEnd(o) < badEnd(L)));
  const what = measure.trim() ? `${measure.trim()}: ` : "";
  let s = `${what}${L.name} comes out ahead in ${chance(L.top, 0)} of ${DRAWS.toLocaleString()} futures.`;
  if (riskier) {
    s += ` But its bad end is worse: 1 time in 10 it ${higher ? "falls below" : "goes above"} ${fmt(badEnd(L))}, against ${fmt(badEnd(riskier))} for ${riskier.name}.`;
  }
  s += ` Chance ${missWord}: ${stats.map((x) => `${x.name} ${chance(x.miss, 1)}`).join(", ")}.`;
  return s;
}

/** Overlapping piles on one shared scale, with each option's 80% range drawn underneath and your line across all of it. */
function PileChart({ res, line, fmt, stats }: { res: Result; line: number; fmt: (v: number) => string; stats: { name: string; p10: number; p50: number; p90: number }[] | null }) {
  // A narrower drawing on phones keeps the labels readable instead of scaling them down.
  const narrow = useMediaQuery("(max-width: 639px)");
  const W = narrow ? 360 : 560;
  const L = 12;
  const R = 12;
  const top = 28;
  const plotH = 170;
  const rowH = 34;
  const rowsTop = top + plotH + 30;
  const H = rowsTop + res.names.length * rowH + 30;
  const X = (v: number) => L + ((v - res.lo) / (res.hi - res.lo)) * (W - L - R);
  const bw = (W - L - R) / BINS;
  // Scale to where the tallest pile will end, so the piles grow up into a fixed frame while the draws land.
  const scale = res.done ? DRAWS / res.done : 1;
  const peak = Math.max(1, ...res.hist.flat()) * scale;
  const Y = (c: number) => top + plotH - (c / peak) * plotH;
  const ticks = (narrow ? [0, 0.5, 1] : [0, 0.25, 0.5, 0.75, 1]).map((t) => res.lo + t * (res.hi - res.lo));
  const lx = X(line);
  const label = stats
    ? `Chart of ${DRAWS.toLocaleString()} simulated outcomes per option. ` + stats.map((s) => `${s.name}: 8 in 10 between ${fmt(s.p10)} and ${fmt(s.p90)}, middle ${fmt(s.p50)}.`).join(" ") + ` Your line at ${fmt(line)}.`
    : "Chart of simulated outcomes, still drawing.";

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={label}>
      <line x1={L} x2={W - R} y1={top + plotH} y2={top + plotH} stroke="var(--line-strong)" />
      {ticks.map((t, i) => (
        <text key={i} x={X(t)} y={top + plotH + 18} textAnchor={i === 0 ? "start" : i === ticks.length - 1 ? "end" : "middle"} className="font-mono" fontSize="12" fill="var(--ink-muted)">
          {fmt(t)}
        </text>
      ))}
      {res.hist.map((h, j) => {
        const s = SERIES[j];
        let d = `M ${L} ${top + plotH}`;
        h.forEach((c, b) => {
          d += ` L ${L + b * bw} ${Y(c)} L ${L + (b + 1) * bw} ${Y(c)}`;
        });
        d += ` L ${W - R} ${top + plotH} Z`;
        return <path key={j} d={d} fill={s.fill} fillOpacity={j === 0 ? 0.32 : 0.14} stroke={s.stroke} strokeWidth={2} strokeDasharray={s.dash} strokeLinejoin="round" />;
      })}

      {/* the 80% range for each option, on the same scale */}
      {res.names.map((n, j) => {
        const y = rowsTop + j * rowH + rowH - 8;
        const st = stats?.[j];
        return (
          <g key={j}>
            <text x={st ? Math.min(W - R - 110, Math.max(L, X(st.p10))) : L} y={y - 10} className="font-mono" fontSize="12" fill="var(--ink-muted)" stroke="var(--sand)" strokeWidth={4} paintOrder="stroke">
              {st?.name ?? n}
            </text>
            {st && (
              <>
                <line x1={X(st.p10)} x2={X(st.p90)} y1={y} y2={y} stroke={SERIES[j].stroke} strokeWidth={5} strokeLinecap="round" strokeDasharray={SERIES[j].dash ? "2 6" : undefined} />
                <circle cx={X(st.p50)} cy={y} r={5} fill="var(--paper)" stroke={SERIES[j].stroke} strokeWidth={2.5} />
              </>
            )}
          </g>
        );
      })}
      <text x={L} y={H - 8} className="font-mono" fontSize="12" fill="var(--ink-muted)">
        Bars: 8 in 10 futures · dot: the middle
      </text>

      <line x1={lx} x2={lx} y1={top - 6} y2={rowsTop + res.names.length * rowH} stroke="var(--ink)" strokeWidth={1.5} strokeDasharray="4 4" />
      <rect x={Math.min(W - R - 92, Math.max(L, lx - 46))} y={0} width={92} height={18} rx={9} fill="var(--ink)" />
      <text x={Math.min(W - R - 46, Math.max(L + 46, lx))} y={13} textAnchor="middle" className="font-mono" fontSize="11.5" fill="var(--paper)">
        your line
      </text>
    </svg>
  );
}

