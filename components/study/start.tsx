"use client";

import * as React from "react";
import Link from "next/link";
import { track } from "@vercel/analytics";
import { Check, X } from "lucide-react";
import { cn } from "cn";
import { ASK, KINDS, gradeInterval, gradeNumber, hintFor, makeCases, pickNote, worked, type Case, type Graded, type Kind } from "@/lib/study/start";
import { study } from "@/lib/study/routes";
import { useStoredString } from "@/lib/hooks";
import { Chart, Slider } from "@/components/study/chart";
import { PageHead, blockTitle, btn, input, lead } from "@/components/study/ui";

const pct = (p: number) => (p < 0.0005 ? "under 0.1%" : `${(p * 100).toFixed(1)}%`);
const sans = { fontFamily: "var(--font-sans)" };
/** The exact answer, the way it is shown after a right one. */
const shown = (c: Case) =>
  Array.isArray(c.answer) ? `${c.answer[0].toFixed(c.dp)} to ${c.answer[1].toFixed(c.dp)} ${c.unit}` : `${(c.answer as number).toFixed(4)}, about ${pct(c.answer as number)}`;

// ---------- The worked example: one juice line, 508 ml, asked three ways

function Worked() {
  const w = worked(25);
  const rows: [q: string, work: string, answer: string][] = [
    ["Is one bottle over 508 ml?", "z = (508 − 500) / 20 = 0.4, so 1 − Φ(0.4)", pct(w.pOne)],
    ["Is the average of 25 bottles over 508 ml?", "SE = 20 / √25 = 4, z = (508 − 500) / 4 = 2, so 1 − Φ(2)", pct(w.pAvg)],
    ["After a repair the mean is unknown. 25 bottles average 508 ml. Where is the true mean?", "508 ± 1.96 × 4", `${w.lo.toFixed(1)} to ${w.hi.toFixed(1)} ml`],
  ];
  return (
    <section aria-labelledby="st1" className="grid gap-4">
      <h2 id="st1" className={blockTitle}>One juice line, three questions</h2>
      <p>A juice line fills bottles. The fills are roughly normal, with a mean of 500 ml and an SD of 20 ml. Here is the same 508 ml in three different questions.</p>
      <ol className="divide-y divide-line border-y border-line">
        {rows.map(([q, work, answer]) => (
          <li key={q} className="grid gap-1 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-baseline sm:gap-x-6">
            <span className="grid gap-1">
              <b className="font-[600]">{q}</b>
              <span className="text-sm text-ink-muted">{work}</span>
            </span>
            <span className="font-display text-2xl font-[650] tabular-nums tracking-[-0.01em] sm:text-right">{answer}</span>
          </li>
        ))}
      </ol>
      <p>
        A third of single bottles clear 508 ml, but only about 2 in 100 averages of 25 do, because averages wander far less than single values. The third answer is a different kind of thing: a range for the line&rsquo;s mean, not a chance and not a range for bottles.
      </p>
      <Lab />
    </section>
  );
}

/** The one live thing: move n and watch the average's curve narrow while the single bottle's stays put. */
function Lab() {
  const [n, setN] = React.useState(25);
  const w = worked(n);
  const dens = (x: number, s: number) => Math.exp(-0.5 * ((x - w.mu) / s) ** 2) / (s * Math.sqrt(2 * Math.PI));
  return (
    <div className="grid gap-4 rounded-[18px] bg-sand p-5 md:p-6">
      <div className="grid gap-3 sm:grid-cols-3" aria-live="polite">
        <Readout label="One bottle over 508 ml" value={pct(w.pOne)} />
        <Readout label={`The average of ${n} over 508 ml`} value={pct(w.pAvg)} strong />
        <Readout label={`If ${n} average 508 ml, the true mean is likely`} value={`${w.lo.toFixed(1)} to ${w.hi.toFixed(1)}`} />
      </div>
      <Chart ratio={0.42} minH={200} maxH={260} label={`Two bell curves centered on 500 ml. Single bottles spread with SD 20; averages of ${n} spread with SD ${w.se.toFixed(1)}. ${pct(w.pOne)} of single bottles and ${pct(w.pAvg)} of averages are above 508 ml.`}>
        {({ W, H }) => {
          const lo = 440, hi = 560, x0 = 8, x1 = W - 8, base = H - 46, top = 22;
          // Rounded, so the server and the browser write the same numbers (their Math.exp can differ in the last digit).
          const X = (v: number) => Math.round((x0 + ((v - lo) / (hi - lo)) * (x1 - x0)) * 10) / 10;
          const peak = dens(w.mu, w.se);
          const Y = (d: number) => Math.round((base - (d / peak) * (base - top)) * 10) / 10;
          const xs = Array.from({ length: (hi - lo) * 2 + 1 }, (_, i) => lo + i / 2);
          const path = (s: number, from = lo) => xs.filter((v) => v >= from).map((v, i) => `${i ? "L" : "M"}${X(v).toFixed(1)},${Y(dens(v, s)).toFixed(1)}`).join("");
          const area = (s: number) => `${path(s, w.cut)}L${X(hi).toFixed(1)},${base}L${X(w.cut).toFixed(1)},${base}Z`;
          const ciY = H - 14;
          return (
            <>
              <path d={area(w.sd)} fill="var(--clay-tint)" />
              <path d={area(w.se)} fill="var(--clay)" opacity={0.85} />
              <path d={path(w.sd)} fill="none" stroke="var(--ink-muted)" strokeWidth={1.75} />
              <path d={path(w.se)} fill="none" stroke="var(--ink)" strokeWidth={2} />
              <line x1={X(w.cut)} y1={top - 6} x2={X(w.cut)} y2={base} stroke="var(--ink)" strokeWidth={1.25} strokeDasharray="4 4" />
              <text x={X(w.cut) + 6} y={top} style={sans}>508</text>
              {n > 1 && (
                <text x={X(w.mu - 1.2 * w.se) - 8} y={Y(dens(w.mu - 1.2 * w.se, w.se)) + 4} textAnchor="end" style={sans}>
                  Averages of {n}
                </text>
              )}
              <text x={X(w.mu - 1.5 * w.sd) - 6} y={Y(dens(w.mu - 1.5 * w.sd, w.sd)) - 6} textAnchor="end" style={sans}>
                {n > 1 ? "Single bottles" : "One bottle, an average of one"}
              </text>
              <line x1={x0} y1={base} x2={x1} y2={base} stroke="var(--line)" />
              {[460, 480, 500, 520, 540].map((v) => (
                <text key={v} x={X(v)} y={base + 16} textAnchor="middle" style={sans}>{v}</text>
              ))}
              <line x1={X(w.lo)} y1={ciY} x2={X(w.hi)} y2={ciY} stroke="var(--clay-ink)" strokeWidth={6} strokeLinecap="round" />
              <circle cx={X(w.cut)} cy={ciY} r={4.5} fill="var(--paper)" stroke="var(--clay-ink)" strokeWidth={2} />
              {X(w.hi) + 130 < W ? (
                <text x={X(w.hi) + 10} y={ciY + 4} style={sans}>range for the mean</text>
              ) : X(w.lo) - 130 > 0 ? (
                <text x={X(w.lo) - 10} y={ciY + 4} textAnchor="end" style={sans}>range for the mean</text>
              ) : null}
            </>
          );
        }}
      </Chart>
      <Slider id="st-n" label="Bottles in the average:" value={n} min={1} max={100} step={1} onChange={setN} />
      <p className="text-sm text-ink-muted">Drag to 1: an average of one bottle is just one bottle, and the two curves become one. Drag up: the average&rsquo;s curve and the range for the mean both tighten by √n.</p>
    </div>
  );
}

function Readout({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="grid content-start gap-1">
      <span className="text-sm text-ink-muted">{label}</span>
      <span className={cn("font-display text-[1.6rem] font-[650] leading-none tabular-nums tracking-[-0.01em]", strong && "text-clay-ink")}>{value}</span>
    </div>
  );
}

// ---------- The questions to ask, then the cases

function Ask({ className }: { className?: string }) {
  return (
    <ol className={cn("grid list-decimal gap-1.5 pl-5 marker:text-ink-muted", className)}>
      {ASK.map((a) => (
        <li key={a}>{a}</li>
      ))}
    </ol>
  );
}

type Result = { pick: Kind; pickOk: boolean; num?: Graded };
type Saved = { at: number; picks: number; nums: number; numOf: number; of: number };
const KEY = "monteStartRun";
const parse = (raw: string | null): Saved | null => {
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

function Practice() {
  const [seed, setSeed] = React.useState(1);
  const cases = React.useMemo(() => makeCases(seed), [seed]);
  const [i, setI] = React.useState(0);
  const [results, setResults] = React.useState<Result[]>([]);
  // The last finished run, read when this run starts, so finishing doesn't rewrite the line above the case.
  const stored = parse(useStoredString(KEY));
  const [last, setLast] = React.useState<Saved | null>(null);
  const [seenFor, setSeenFor] = React.useState(-1);
  if (seenFor !== seed && stored?.at !== last?.at) {
    setSeenFor(seed);
    setLast(stored);
  }
  const done = i >= cases.length;
  const head = React.useRef<HTMLHeadingElement>(null);
  const moved = React.useRef(false);
  React.useEffect(() => {
    if (moved.current) head.current?.focus();
  }, [i, seed]);

  const record = (r: Result) => setResults((rs) => [...rs.slice(0, i), r]);
  const next = () => {
    moved.current = true;
    const k = i + 1;
    if (k === cases.length) {
      const all = [...results];
      const nums = all.filter((r) => r.num).length;
      const s: Saved = { at: Date.now(), picks: all.filter((r) => r.pickOk).length, nums: all.filter((r) => r.num?.ok).length, numOf: nums, of: cases.length };
      try {
        localStorage.setItem(KEY, JSON.stringify(s));
      } catch {}
      track("Start cases finished", { picks: `${s.picks} of ${s.of}` });
    }
    setI(k);
  };
  const again = () => {
    moved.current = true;
    setResults([]);
    setI(0);
    setSeed((s) => s + 1);
  };

  return (
    <section aria-labelledby="st3" className="grid gap-4">
      <div className="grid gap-1">
        <h2 id="st3" ref={head} tabIndex={-1} className={cn(blockTitle, "focus:outline-none")}>
          {done ? "How it went" : `Your turn: case ${i + 1} of ${cases.length}`}
        </h2>
        {!done && i === 0 && (
          <p className="text-ink-muted">
            Pick which question it is, then work it out. The three questions stay on screen for the first five cases, sit one tap away for the next five, and then you&rsquo;re on your own.
            {last && ` Last time: the right question in ${last.picks} of ${last.of}, on ${new Date(last.at).toLocaleDateString(undefined, { month: "long", day: "numeric" })}.`}
          </p>
        )}
      </div>
      {!done && <Progress i={i} results={results} total={cases.length} />}
      {done ? <Summary cases={cases} results={results} again={again} /> : <CaseCard key={`${seed}-${i}`} c={cases[i]} hint={hintFor(i, cases.length)} onResult={record} onNext={next} last={i === cases.length - 1} />}
    </section>
  );
}

function Progress({ i, results, total }: { i: number; results: Result[]; total: number }) {
  return (
    <div className="flex gap-1" aria-hidden>
      {Array.from({ length: total }, (_, k) => (
        <span key={k} className={cn("h-1.5 flex-1 rounded-full", k < i ? (results[k]?.pickOk ? "bg-ink" : "bg-clay") : k === i ? "bg-ink-muted" : "bg-line")} />
      ))}
    </div>
  );
}

function CaseCard({ c, hint, onResult, onNext, last }: { c: Case; hint: "open" | "tap" | "none"; onResult: (r: Result) => void; onNext: () => void; last: boolean }) {
  const [pick, setPick] = React.useState<Kind | null>(null);
  const [showAsk, setShowAsk] = React.useState(false);
  const [a, setA] = React.useState("");
  const [b, setB] = React.useState("");
  const [graded, setGraded] = React.useState<Graded | null>(null);
  const [typeNote, setTypeNote] = React.useState("");
  const isCi = c.kind === "ci";
  const needsNum = c.kind !== "none";
  const finished = pick !== null && (!needsNum || graded !== null);
  const nextRef = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (finished) nextRef.current?.focus({ preventScroll: true });
  }, [finished]);

  const choose = (k: Kind) => {
    if (pick) return;
    setPick(k);
    onResult({ pick: k, pickOk: k === c.kind });
  };
  const check = (e: React.FormEvent) => {
    e.preventDefault();
    if (graded) return;
    const g = isCi ? gradeInterval(c, a, b) : gradeNumber(c, a);
    // A blank or unreadable entry is a typing problem, not a wrong answer: say so and let them fix it.
    if (!g.ok && g.slip?.startsWith("Type")) {
      setTypeNote(g.slip);
      return;
    }
    setGraded(g);
    onResult({ pick: pick!, pickOk: pick === c.kind, num: g });
  };

  return (
    <div className="grid gap-5 rounded-[18px] border border-line bg-paper p-5 md:p-6">
      <div className="grid gap-2">
        <p>{c.setup}</p>
        <p className="font-display text-xl font-[650] leading-snug tracking-[-0.015em]">{c.q}</p>
      </div>

      {hint === "open" && !pick && <Ask className="text-sm text-ink-muted" />}
      {hint === "tap" && !pick && (
        <div className="grid gap-2">
          <div>
            <button type="button" className={cn(btn.ghost, "min-h-10 px-4 text-sm")} aria-expanded={showAsk} onClick={() => setShowAsk((s) => !s)}>
              {showAsk ? "Hide the three questions" : "Show the three questions"}
            </button>
          </div>
          {showAsk && <Ask className="text-sm text-ink-muted" />}
        </div>
      )}

      <fieldset className="grid gap-2">
        <legend className="mb-2 font-[600]">Which question is it?</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {KINDS.map((k) => {
            const state = !pick ? "" : k.id === c.kind ? "right" : k.id === pick ? "wrong" : "off";
            return (
              <button
                key={k.id}
                type="button"
                onClick={() => choose(k.id)}
                aria-pressed={pick === k.id}
                disabled={!!pick && state === "off"}
                className={cn(
                  "flex min-h-12 items-center justify-between gap-3 rounded-xl border px-4 py-2.5 text-left transition-colors duration-150",
                  !pick && "border-line-strong hover:border-ink hover:bg-sand",
                  state === "right" && "border-ink bg-ink text-paper",
                  state === "wrong" && "border-clay bg-clay-tint",
                  state === "off" && "border-line text-ink-muted disabled:opacity-60",
                )}
              >
                <span>{k.label}</span>
                {state === "right" && <Check className="size-4 flex-none" aria-label="right answer" />}
                {state === "wrong" && <X className="size-4 flex-none text-clay-ink" aria-label="your pick" />}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div aria-live="polite" className="grid gap-5">
        {pick && (
          <p className={cn("rounded-xl p-4", pick === c.kind ? "bg-sand" : "bg-clay-tint")}>
            <b className="font-[600]">{pick === c.kind ? "Right. " : "Not this one. "}</b>
            {pickNote(c, pick)}
          </p>
        )}

        {pick && needsNum && (
          <form onSubmit={check} className="grid gap-3">
            <p className="font-[600]">{isCi ? "Now give the range." : "Now work out the chance."}</p>
            <div className={cn("grid gap-3", isCi ? "grid-cols-2 sm:max-w-md" : "sm:max-w-xs")}>
              <label className="grid gap-1 text-sm">
                {isCi ? "From" : "Probability"}
                <input className={input} inputMode="decimal" autoComplete="off" value={a} onChange={(e) => (setA(e.target.value), setTypeNote(""))} placeholder={isCi ? c.unit : "0.25 or 25%"} disabled={!!graded} autoFocus />
              </label>
              {isCi && (
                <label className="grid gap-1 text-sm">
                  To
                  <input className={input} inputMode="decimal" autoComplete="off" value={b} onChange={(e) => (setB(e.target.value), setTypeNote(""))} placeholder={c.unit} disabled={!!graded} />
                </label>
              )}
            </div>
            {typeNote && <p className="text-sm text-clay-ink">{typeNote}</p>}
            {!graded && (
              <div>
                <button type="submit" className={btn.primary}>Check</button>
              </div>
            )}
          </form>
        )}

        {graded && (
          <div className="grid gap-3">
            <p className={cn("rounded-xl p-4", graded.ok ? "bg-sand" : "bg-clay-tint")}>
              <b className="font-[600]">{graded.ok ? "Right." : "Not quite."}</b> {graded.ok ? `It's ${shown(c)}.` : graded.slip ?? "Here is the work."}
            </p>
            <ol className="grid gap-1 border-l-2 border-line pl-4 tabular-nums">
              {c.steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
            {c.meaning && <p className="text-ink-muted">{c.meaning}</p>}
          </div>
        )}

        {finished && (
          <div>
            <button ref={nextRef} type="button" className={btn.primary} onClick={onNext}>
              {last ? "See how it went" : "Next case"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Summary({ cases, results, again }: { cases: Case[]; results: Result[]; again: () => void }) {
  const picks = results.filter((r) => r.pickOk).length;
  const numbered = results.filter((r) => r.num);
  const nums = numbered.filter((r) => r.num?.ok).length;
  const missed = cases.map((c, k) => ({ c, r: results[k] })).filter(({ r }) => r && (!r.pickOk || (r.num && !r.num.ok)));
  const label = (k: Kind) => KINDS.find((x) => x.id === k)!.label.toLowerCase();
  return (
    <div className="grid gap-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <Readout label="Picked the right question" value={`${picks} of ${cases.length}`} strong />
        <Readout label="Worked the number out" value={`${nums} of ${numbered.length}`} />
      </div>
      {missed.length > 0 ? (
        <div className="grid gap-2">
          <p className="font-[600]">Worth a second look</p>
          <ul className="divide-y divide-line border-y border-line">
            {missed.map(({ c, r }) => (
              <li key={c.q} className="grid gap-0.5 py-3">
                <span>{c.q}</span>
                <span className="text-sm text-ink-muted">
                  {r.pickOk ? `The question was right; the number was off.` : `It was ${label(c.kind)}, not ${label(r.pick)}.`}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>Every question picked right and every number worked out.</p>
      )}
      <p className="text-ink-muted">Another run with new numbers in a few days, rather than right away, tends to help it stick longer.</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={btn.primary} onClick={again}>
          Again with new numbers
        </button>
        <Link href={study.drillTopic("clt")} className={btn.ghost}>
          Drill sampling distributions
        </Link>
        <Link href={study.drillTopic("ci")} className={btn.ghost}>
          Drill intervals
        </Link>
      </div>
    </div>
  );
}

export function StartModule() {
  return (
    <div className="grid max-w-[760px] gap-12 pb-12">
      <PageHead title="Same number, three questions">
        <p className={cn(lead, "text-ink-muted")}>
          The hard part of a statistics problem is the first step: deciding what it&rsquo;s asking. Is it about one value, the average of many, or a mean nobody knows yet? Learn to tell them apart here, then practice on fifteen cases.
        </p>
      </PageHead>
      <Worked />
      <section aria-labelledby="st2" className="grid gap-3">
        <h2 id="st2" className={blockTitle}>Three questions to ask first</h2>
        <Ask />
        <p className="text-ink-muted">If what you&rsquo;re told can&rsquo;t answer the third one, &ldquo;not enough information&rdquo; is the right answer, not a dodge.</p>
      </section>
      <Practice />
    </div>
  );
}
