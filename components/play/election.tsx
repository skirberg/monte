"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "cn";
import { Phi } from "@/lib/site-data";
import { burstFrom, callout } from "@/lib/fun";
import { useStoredString } from "@/lib/hooks";
import { binom, chunked, pct } from "@/lib/play/sim";

const SIZES = [400, 1000, 2500] as const;
const MAX_POLLS = 8;
const Z = 1.96;
const RUNS = 1000;
const AVERAGES = [5, 10] as const;
const BEST_KEY = "monteElectionStreak";

type Size = (typeof SIZES)[number];
type Side = "A" | "B";
type Poll = { n: number; a: number };

/** 95% margin of error on one share, from the poll's own estimate (what pollsters print). */
const moe = (p: number, n: number) => Z * Math.sqrt((p * (1 - p)) / n);

/** Hidden truth: A's share between 47% and 53%, never closer than a quarter point to a tie, so every race has a winner. */
function makeTruth() {
  const gap = 0.0025 + Math.random() * 0.0275;
  return Math.round((0.5 + (Math.random() < 0.5 ? gap : -gap)) * 1000) / 1000;
}

const poll = (truth: number, n: number): Poll => ({ n, a: binom(n, truth) / n });

/** Every poll together, weighted by size: the same as one big poll of everyone asked. */
function pool(polls: Poll[]): Poll {
  const n = polls.reduce((s, p) => s + p.n, 0);
  return { n, a: n ? polls.reduce((s, p) => s + p.a * p.n, 0) / n : 0.5 };
}

const share = (v: number) => `${(v * 100).toFixed(1)}%`;
const pts = (v: number) => (v * 100).toFixed(1);

function leadText(a: number) {
  const d = (2 * a - 1) * 100;
  if (Math.abs(d) < 0.05) return "Tied";
  return `${d > 0 ? "A" : "B"} by ${Math.abs(d).toFixed(1)}`;
}

/** 1 if the poll names B (the wrong leader when A truly leads), half on an exact tie (a coin flip), else 0. */
const wrong = (votesA: number, n: number) => (2 * votesA < n ? 1 : 2 * votesA === n ? 0.5 : 0);

function Toggle<T extends string | number>({ label, value, options, onChange }: { label: string; value: T; options: [T, string][]; onChange: (v: T) => void }) {
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
            "h-11 flex-1 rounded-full px-3 text-sm transition-colors",
            value === v ? "bg-paper font-medium text-ink shadow-[0_0_0_1px_var(--line)]" : "text-ink-muted hover:text-ink",
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

function PollChart({ polls, truth }: { polls: Poll[]; truth: number | null }) {
  const W = 520;
  const RH = 30;
  const top = 30;
  const L = 58;
  const R = 16;
  const lo = 0.35;
  const hi = 0.65;
  const H = top + (MAX_POLLS + 1) * RH + 26;
  const X = (v: number) => L + ((Math.min(hi, Math.max(lo, v)) - lo) / (hi - lo)) * (W - L - R);
  const all = truth !== null && polls.length ? pool(polls) : null;
  const rows = all ? [...polls, all] : polls;
  const missed = truth === null ? 0 : polls.filter((p) => Math.abs(p.a - truth) > moe(p.a, p.n)).length;
  const label =
    polls.length === 0
      ? "Poll chart. No polls yet."
      : `${polls.length} poll${polls.length > 1 ? "s" : ""} of A's share with 95% margins. ` +
        (all && truth !== null
          ? `True share ${share(truth)}. All polls together ${share(all.a)} plus or minus ${pts(moe(all.a, all.n))}. ${missed} interval${missed === 1 ? "" : "s"} missed the truth.`
          : "");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={label}>
      {[0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65].map((t) => (
        <g key={t}>
          <line x1={X(t)} x2={X(t)} y1={top - 6} y2={H - 26} stroke={t === 0.5 ? "var(--line-strong)" : "var(--line)"} strokeWidth={t === 0.5 ? 1.5 : 1} strokeDasharray={t === 0.5 ? "5 5" : undefined} />
          <text x={X(t)} y={top - 12} textAnchor="middle" className="font-mono" fontSize="13" fill="var(--ink-muted)">
            {t === 0.5 ? "tie" : `${Math.round(t * 100)}%`}
          </text>
        </g>
      ))}
      <text x={L} y={H - 6} className="font-mono" fontSize="13" fill="var(--ink-muted)">
        B wins
      </text>
      <text x={W - R} y={H - 6} textAnchor="end" className="font-mono" fontSize="13" fill="var(--ink-muted)">
        A wins
      </text>
      {rows.map((p, i) => {
        const isAll = all !== null && i === rows.length - 1;
        const y = top + i * RH + RH / 2;
        const m = moe(p.a, p.n);
        const clear = Math.abs(p.a - 0.5) > m;
        const miss = truth !== null && !isAll && Math.abs(p.a - truth) > m;
        return (
          <g key={isAll ? "all" : i}>
            <motion.g
              initial={{ opacity: 0, scaleX: 0.4 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
              style={{ transformBox: "fill-box", transformOrigin: "center" }}
            >
              <line
                x1={X(p.a - m)}
                x2={X(p.a + m)}
                y1={y}
                y2={y}
                stroke={isAll ? "var(--clay)" : clear ? "var(--ink)" : "var(--line-strong)"}
                strokeWidth={isAll ? 6 : 3}
                strokeLinecap="round"
                strokeDasharray={miss ? "2 6" : undefined}
              />
              <circle cx={X(p.a)} cy={y} r={isAll ? 6.5 : 5} fill={isAll ? "var(--ink)" : "var(--clay)"} stroke="var(--sand)" strokeWidth={2.5} />
            </motion.g>
            <text x={L - 10} y={y + 4.5} textAnchor="end" className="font-mono" fontSize="13" fontWeight={isAll ? 600 : 400} fill={isAll ? "var(--ink)" : "var(--ink-muted)"}>
              {isAll ? "All" : p.n.toLocaleString()}
            </text>
          </g>
        );
      })}
      {truth !== null && (
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.15 }}>
          <line x1={X(truth)} x2={X(truth)} y1={top - 4} y2={H - 26} stroke="var(--clay-ink)" strokeWidth={2.5} />
          <rect x={X(truth) - 34} y={H - 24} width={68} height={20} rx={10} fill="var(--clay-ink)" />
          <text x={X(truth)} y={H - 9.5} textAnchor="middle" className="font-mono" fontSize="12.5" fill="var(--paper)">
            {share(truth)}
          </text>
        </motion.g>
      )}
      {polls.length === 0 && (
        <text x={(L + W - R) / 2} y={top + (MAX_POLLS * RH) / 2} textAnchor="middle" fontSize="15" fill="var(--ink-muted)">
          Your polls land here
        </text>
      )}
    </svg>
  );
}

function verdict(right: boolean, clear: boolean, polls: number) {
  if (right && clear) return polls === 1 ? "One poll and a clear read. Bold, and it held." : "Your polls together were clear of a tie, and they were right.";
  if (right) return "Right, and a little lucky. Your polls together could not rule out a tie.";
  if (clear) return "The polls pointed the wrong way even though they cleared the tie line. A 95% interval still misses about 1 time in 20.";
  return "A fair miss. Your polls together could not rule out a tie, so this call was close to a coin flip.";
}

export function Election() {
  // The truth is drawn on the client and stays hidden until the call, so server and client never show different numbers.
  const [truth, setTruth] = React.useState(() => makeTruth());
  const [polls, setPolls] = React.useState<Poll[]>([]);
  const [call, setCall] = React.useState<Side | null>(null);
  const [played, setPlayed] = React.useState(0);
  const [right, setRight] = React.useState(0);
  const [streak, setStreak] = React.useState(0);
  const stored = useStoredString(BEST_KEY);
  const [bestNow, setBest] = React.useState<number | null>(null);
  const best = bestNow ?? (stored ? +stored : 0);
  const resultRef = React.useRef<HTMLParagraphElement>(null);
  const firstPoll = React.useRef<HTMLButtonElement>(null);

  const winner: Side = truth > 0.5 ? "A" : "B";
  const called = call !== null;
  const last = polls[polls.length - 1];
  const all = pool(polls);
  const allMoe = polls.length ? moe(all.a, all.n) : 0;
  const allClear = polls.length > 0 && Math.abs(all.a - 0.5) > allMoe;

  const commission = (n: number) => {
    if (called || polls.length >= MAX_POLLS) return;
    setPolls((p) => [...p, poll(truth, n)]);
  };

  const makeCall = (side: Side) => {
    if (called || !polls.length) return;
    setCall(side);
    setPlayed((v) => v + 1);
    if (side === winner) {
      const s = streak + 1;
      setRight((v) => v + 1);
      setStreak(s);
      if (s > best) {
        setBest(s);
        try {
          localStorage.setItem(BEST_KEY, String(s));
        } catch {}
      }
      requestAnimationFrame(() => burstFrom(resultRef.current));
      if (s >= 3) callout(`${s} races in a row.`);
      else if (polls.length === 1) callout("Called it on one poll.");
    } else setStreak(0);
  };

  const nextElection = () => {
    setTruth(makeTruth());
    setPolls([]);
    setCall(null);
    requestAnimationFrame(() => firstPoll.current?.focus());
  };

  return (
    <div className="space-y-10">
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
        <div className="space-y-5 lg:col-span-7">
          <div className="rounded-[28px] bg-sand p-3 sm:p-6">
            <PollChart polls={polls} truth={called ? truth : null} />
          </div>
          <ol className="sr-only">
            {polls.map((p, i) => (
              <li key={i}>
                Poll {i + 1}, {p.n.toLocaleString()} people: A {share(p.a)}, B {share(1 - p.a)}, margin plus or minus {pts(moe(p.a, p.n))} points.
              </li>
            ))}
          </ol>
          <div>
            <p className="mb-2 text-sm text-ink-muted" id="poll-hint">
              {called ? "The race is called." : polls.length >= MAX_POLLS ? "That was your last poll. Time to call it." : `Commission a poll. ${MAX_POLLS - polls.length} of ${MAX_POLLS} left tonight.`}
            </p>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {SIZES.map((n, i) => (
                <button
                  key={n}
                  ref={i === 0 ? firstPoll : undefined}
                  type="button"
                  onClick={() => commission(n)}
                  disabled={called || polls.length >= MAX_POLLS}
                  aria-describedby="poll-hint"
                  className="flex min-h-14 flex-col items-center justify-center rounded-2xl border border-line-strong px-2 py-2 hover:border-ink hover:bg-sand disabled:opacity-50 disabled:hover:border-line-strong disabled:hover:bg-transparent"
                >
                  <span className="font-medium">Poll {n.toLocaleString()}</span>
                  <span className="font-mono text-xs text-ink-muted tabular">±{pts(moe(0.5, n))} pts</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:col-span-5">
          <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl bg-line font-mono tabular">
            {[
              ["Right calls", played ? `${right}/${played}` : "0"],
              ["Streak", String(streak)],
              ["Best streak", String(best)],
            ].map(([k, v]) => (
              <div key={k} className="bg-paper p-4">
                <dt className="text-[11px] uppercase tracking-[0.08em] text-ink-muted">{k}</dt>
                <dd className="mt-1 text-xl">{v}</dd>
              </div>
            ))}
          </dl>

          <div aria-live="polite" className="space-y-2">
            <p className="font-mono text-xs uppercase tracking-[0.08em] text-ink-muted">{last ? `Poll ${polls.length} · ${last.n.toLocaleString()} people` : "Latest poll"}</p>
            {last ? (
              <>
                <p className="font-display text-[clamp(1.9rem,1.2rem+2.4vw,2.8rem)] font-[650] leading-none tracking-[-0.02em] tabular-nums">
                  A {pts(last.a)} <span className="text-ink-muted">·</span> B {pts(1 - last.a)}
                </p>
                <p className="text-ink-muted">
                  {leadText(last.a)}. Margin of error ±{pts(moe(last.a, last.n))} on each share, so ±{pts(2 * moe(last.a, last.n))} on the lead.
                </p>
              </>
            ) : (
              <p className="text-ink-muted">A hidden share of voters backs A. Poll as many times as you like, up to {MAX_POLLS}, then call the winner. Fewer polls is a bolder call.</p>
            )}
          </div>

          <div aria-live="polite">
            {!called ? (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-3">
                  {(["A", "B"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => makeCall(s)}
                      disabled={!polls.length}
                      className="inline-flex h-12 items-center justify-center rounded-full bg-ink px-5 font-medium text-paper hover:bg-ink/85 disabled:opacity-50 disabled:hover:bg-ink"
                    >
                      Call it for {s}
                    </button>
                  ))}
                </div>
                {!polls.length && <p className="text-sm text-ink-muted">Run at least one poll before you call it.</p>}
              </div>
            ) : (
              <div className="space-y-4 rounded-2xl border border-line p-5">
                <p ref={resultRef} className={cn("font-display text-4xl font-[680]", call === winner ? "text-clay-ink" : "text-ink")}>
                  {call === winner ? "Right call." : "Wrong call."}
                </p>
                <p className="font-mono text-sm tabular">
                  {winner} won with {share(winner === "A" ? truth : 1 - truth)} · you polled {all.n.toLocaleString()} people
                </p>
                <p className="text-ink-muted">
                  All {polls.length} poll{polls.length > 1 ? "s" : ""} together: A {share(all.a)}, ±{pts(allMoe)}.{" "}
                  {polls.length > 1 && "That margin is smaller than any single poll's. "}
                  {verdict(call === winner, allClear, polls.length)}
                </p>
                <button type="button" onClick={nextElection} autoFocus className="inline-flex h-11 items-center rounded-full bg-ink px-6 font-medium text-paper hover:bg-ink/85">
                  Next election
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <ThousandElections />
    </div>
  );
}

function ThousandElections() {
  const [lead, setLead] = React.useState(2);
  const [n, setN] = React.useState<Size>(1000);
  const [rates, setRates] = React.useState<number[] | null>(null);
  const [busy, setBusy] = React.useState(0);

  const p = 0.5 + lead / 200;
  // Normal approximation of the same question, for comparison: P(the average of k polls shows B ahead).
  const formula = (k: number) => Phi(-(p - 0.5) / Math.sqrt((p * (1 - p)) / (k * n)));
  const ks = [1, ...AVERAGES];

  const run = async () => {
    const miss = ks.map(() => 0);
    setBusy(0.001);
    await chunked(
      RUNS,
      100,
      (from, to) => {
        for (let e = from; e < to; e++) {
          // Ten polls of the same race; the first alone, the first five pooled, then all ten.
          let votes = 0;
          let asked = 0;
          for (let j = 1; j <= AVERAGES[AVERAGES.length - 1]; j++) {
            votes += binom(n, p);
            asked += n;
            const slot = ks.indexOf(j);
            if (slot >= 0) miss[slot] += wrong(votes, asked);
          }
        }
      },
      (done) => setBusy(done / RUNS),
    );
    setRates(miss.map((m) => m / RUNS));
    setBusy(0);
  };

  const changed = (fn: () => void) => {
    fn();
    setRates(null);
  };

  return (
    <section aria-labelledby="sim-t" className="grid gap-6 rounded-[28px] border border-line p-5 sm:p-7 lg:grid-cols-12">
      <div className="space-y-4 lg:col-span-5">
        <h2 id="sim-t" className="font-display text-2xl font-[650]">
          A thousand elections
        </h2>
        <p className="text-ink-muted">Give A a real lead, poll each race ten times, and count how often the polls name the wrong leader.</p>
        <div>
          <div className="flex items-baseline justify-between gap-3">
            <label htmlFor="el-lead" className="text-ink-muted">
              A&rsquo;s true lead
            </label>
            <span className="font-mono text-lg tabular">
              {lead} point{lead === 1 ? "" : "s"}
            </span>
          </div>
          <input id="el-lead" type="range" min={1} max={8} step={1} value={lead} onChange={(e) => changed(() => setLead(+e.target.value))} className="h-11 w-full accent-[var(--clay)]" />
          <p className="font-mono text-xs text-ink-muted tabular">
            A {pts(p)}% · B {pts(1 - p)}%
          </p>
        </div>
        <Toggle label="People per poll" value={n} onChange={(v) => changed(() => setN(v))} options={SIZES.map((s) => [s, s.toLocaleString()] as [Size, string])} />
        <button type="button" onClick={run} disabled={!!busy} className="inline-flex h-11 items-center rounded-full bg-ink px-5 text-sm font-medium text-paper hover:bg-ink/85 disabled:opacity-60">
          {busy ? `Running… ${Math.round(busy * 100)}%` : rates ? "Run them again" : `Run ${RUNS.toLocaleString()} elections`}
        </button>
      </div>

      <div className="space-y-4 lg:col-span-7" aria-live="polite">
        <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl bg-line sm:grid-cols-3">
          {ks.map((k, i) => (
            <div key={k} className="bg-paper p-5">
              <dt className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">{k === 1 ? "One poll" : `Average of ${k}`}</dt>
              <dd className={cn("mt-1 font-mono text-4xl font-medium tracking-[-0.04em] tabular", k === 1 && "text-clay-ink")}>{rates ? pct(rates[i], 1) : "?"}</dd>
              <dd className="mt-1 text-xs text-ink-muted">named the wrong leader · formula {pct(formula(k), 1)}</dd>
            </div>
          ))}
        </dl>
        <p className="text-sm text-ink-muted">
          {rates
            ? `With a ${lead}-point lead and ${n.toLocaleString()} people per poll, one poll got the leader wrong in ${Math.round(rates[0] * RUNS)} of ${RUNS.toLocaleString()} races. The average of ten got it wrong in ${Math.round(rates[2] * RUNS)}.`
            : `A poll of ${n.toLocaleString()} has a margin of ±${pts(2 * moe(0.5, n))} points on the lead. Try a 2-point lead with 1,000 people, then switch to 2,500.`}
        </p>
      </div>
    </section>
  );
}
