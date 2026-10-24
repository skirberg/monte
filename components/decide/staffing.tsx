"use client";

import * as React from "react";
import { cn } from "cn";
import { capacity, fewestStaff, overload, poissonPmf, poissonQuantile, readNumber } from "@/lib/decide/math";
import { useMediaQuery } from "@/lib/hooks";
import { HowItWorks, NumField, Presets, ResultBar, Slider, chance, useToolXp } from "@/components/decide/fields";
import { ChartList, useScrub } from "@/components/decide/scrub";

type Words = { who: string; staff: string };
type Preset = { label: string; note: string; lam: string; per: string; target: number; words: Words };

/** Made-up but believable rates for a busy hour. */
const PRESETS: Preset[] = [
  {
    label: "Coffee shop rush",
    note: "60 customers an hour at the morning peak. One barista makes about 25 drinks an hour.",
    lam: "60",
    per: "25",
    target: 10,
    words: { who: "customers", staff: "baristas" },
  },
  {
    label: "Help desk",
    note: "18 tickets an hour on a Monday morning. One agent closes about 5 an hour.",
    lam: "18",
    per: "5",
    target: 10,
    words: { who: "tickets", staff: "agents" },
  },
  {
    label: "ER triage nurse",
    note: "9 patients an hour walk in on a busy evening. A triage nurse takes about 10 minutes each, so 6 an hour. The bar is stricter here: 5%.",
    lam: "9",
    per: "6",
    target: 5,
    words: { who: "patients", staff: "nurses" },
  },
];

const ROWS = [1, 2, 3, 4, 5, 6];
const k = (n: number) => n.toLocaleString("en-US");

export function Staffing() {
  const [preset, setPreset] = React.useState(0);
  const [words, setWords] = React.useState<Words>(PRESETS[0].words);
  const [lamText, setLamText] = React.useState(PRESETS[0].lam);
  const [perText, setPerText] = React.useState(PRESETS[0].per);
  const [target, setTarget] = React.useState(PRESETS[0].target);
  const xp = useToolXp("staffing");

  const choose = (i: number) => {
    const p = PRESETS[i];
    setPreset(i);
    setWords(p.words);
    setLamText(p.lam);
    setPerText(p.per);
    setTarget(p.target);
    xp();
  };
  const edit = (set: (v: string) => void) => (v: string) => {
    set(v);
    setPreset(-1);
    xp();
  };

  const lam = readNumber(lamText);
  const per = readNumber(perText);
  const lamOk = lam > 0 && lam <= 500;
  const perOk = per > 0 && per <= 500;
  const ok = lamOk && perOk;
  const t = target / 100;
  const best = ok ? fewestStaff(lam, per, t) : NaN;
  const rows = ok ? ROWS.map((s) => ({ s, cap: capacity(s, per), busy: lam / (s * per), over: overload(lam, per, s) })) : [];
  const shown = Number.isFinite(best) ? best : NaN;
  const cap = Number.isFinite(shown) ? capacity(shown, per) : NaN;
  const q10 = ok ? poissonQuantile(0.1, lam) : NaN;
  const q90 = ok ? poissonQuantile(0.9, lam) : NaN;

  let read = "Fix the numbers to see how many you need.";
  if (ok) {
    if (Number.isFinite(best)) {
      const busy = lam / (best * per);
      read = `With ${best} ${best === 1 ? "person" : words.staff}, the team can serve ${k(cap)} ${words.who} an hour, and ${chance(overload(lam, per, best), 1)} of hours bring more than that, under your ${target}%. Each one is busy about ${Math.round(busy * 100)}% of the time. 8 hours in 10 bring between ${k(q10)} and ${k(q90)} ${words.who}.`;
      if (best > 6) read += " That is more than the table shows.";
      if (busy > 0.85) read += " That is very busy: even in hours that are not over, arrivals bunch up and a line forms.";
    } else {
      read = "Even 200 people can't keep it that rare. Check the numbers.";
    }
  }
  const bar: [string, string] = !ok
    ? ["", "Fix the numbers to see how many you need."]
    : Number.isFinite(best)
      ? [String(best), `${best === 1 ? "person" : words.staff}: too many in ${chance(overload(lam, per, best), 1)} of hours, under your ${target}%.`]
      : ["", "Even 200 people can't keep it that rare."];

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="space-y-6 lg:col-span-5">
          <ResultBar lead={bar[0]} rest={bar[1]} />
          <div className="space-y-2">
            <Presets label="Example places" items={PRESETS.map((x) => x.label)} value={preset} onChange={choose} />
            <p className="text-sm text-ink-muted">{preset >= 0 ? `${PRESETS[preset].note} ` : ""}Made-up numbers. Use your busiest hour, not the day&rsquo;s average.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <NumField id="st-lam" label="Arrivals per hour, on average" value={lamText} onChange={edit(setLamText)} invalid={!lamOk} describedBy="st-hint" />
            <NumField id="st-per" label="One person serves per hour" value={perText} onChange={edit(setPerText)} invalid={!perOk} describedBy="st-hint" />
          </div>
          <p id="st-hint" className="text-sm text-ink-muted">
            {ok ? "Arrivals can be customers, calls, tickets or patients. Partly served people round down: 2.5 an hour serves 2." : "Both numbers run from just above 0 to 500 an hour."}
          </p>
          <Slider
            id="st-target"
            label="Keep the chance of too many under"
            value={target}
            min={1}
            max={50}
            step={1}
            onChange={(v) => { setTarget(v); setPreset(-1); xp(); }}
            shown={`${target}%`}
            valueText={`${target} percent of hours`}
          />
        </div>

        <div className="space-y-6 lg:col-span-7">
          {ok && (
            <>
              <div className="rounded-[28px] bg-sand p-3 sm:p-5">
                <ArrivalChart lam={lam} cap={cap} staff={shown} who={words.who} />
              </div>
              <div className="overflow-hidden rounded-2xl border border-line">
                <table className="w-full font-mono text-sm tabular">
                  <caption className="sr-only">Chance an hour brings more than the team can serve, for 1 to 6 people</caption>
                  <thead>
                    <tr className="border-b border-line text-left text-[11px] uppercase tracking-[0.08em] text-ink-muted">
                      <th scope="col" className="px-3 py-2.5 font-normal sm:px-4">Staff</th>
                      <th scope="col" className="px-3 py-2.5 font-normal sm:px-4">Can serve</th>
                      <th scope="col" className="px-3 py-2.5 font-normal sm:px-4">Busy</th>
                      <th scope="col" className="px-3 py-2.5 font-normal sm:px-4">Too many</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => {
                      const pick = row.s === best;
                      const under = row.over <= t;
                      return (
                        <tr key={row.s} className={cn("border-b border-line last:border-b-0", pick && "bg-clay-tint")}>
                          <th scope="row" className="px-3 py-2.5 text-left font-medium sm:px-4">
                            {row.s}
                            {pick && <span className="ml-2 font-sans text-xs font-normal text-clay-ink">fewest</span>}
                          </th>
                          <td className="px-2.5 py-2.5 sm:px-4">{k(row.cap)}</td>
                          <td className={cn("px-2.5 py-2.5 sm:px-4", row.busy > 1 && "text-[var(--danger)]")}>{row.busy > 1 ? "over 100%" : `${Math.round(row.busy * 100)}%`}</td>
                          <td className="px-2.5 py-2.5 sm:px-4">
                            <span className={cn(pick && "font-medium text-clay-ink")}>{chance(row.over, 1)}</span>
                            <span aria-hidden="true" className="mt-1 block h-1.5 w-full rounded-full bg-sand-2">
                              <span className={cn("block h-full rounded-full", under ? "bg-clay" : "bg-line-strong")} style={{ width: `${Math.max(row.over > 0 ? 2 : 0, row.over * 100)}%` }} />
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
          <p className="text-ink-muted">
            {read}
          </p>
        </div>
      </div>

      <HowItWorks
        id="st"
        steps={[
          {
            title: "Arrivals are random, even when the average is steady.",
            body: (
              <p>
                60 customers an hour on average does not mean one a minute. Some hours bring 50, some 70, because each person decides on their own when to come. When many people
                each have a small chance of turning up, the count in an hour follows the <b>Poisson distribution</b>. It needs only one number: the average.
              </p>
            ),
            math: <>P(exactly k arrive) = e^(−λ) × λ^k ÷ k!, where λ is the average per hour</>,
          },
          {
            title: "Count what the team can serve.",
            body: <p>Capacity is the number of people working times how many each one serves in an hour, rounded down to whole arrivals.</p>,
            math: <>capacity = staff × served per person · 3 baristas × 25 = 75 an hour</>,
          },
          {
            title: "Add up the hours that bring too many.",
            body: (
              <p>
                The chance of too many is the share of hours where more arrive than the team can serve. Add up the Poisson chances for every count up to capacity, and take that from
                100%.
              </p>
            ),
            math: <>P(too many) = 1 − P(k ≤ capacity) · coffee rush: P(more than 75 when λ = 60) = 2.6%</>,
          },
          {
            title: "Pick the fewest that keep it rare.",
            body: (
              <p>
                Try 1 person, then 2, then 3, and stop at the first team whose chance of too many is under your bar. How rare is rare enough is a judgment: a coffee line once a
                week is fine, a waiting room in an emergency is not.
              </p>
            ),
          },
          {
            title: "Busy is not the same as fine.",
            body: (
              <p>
                <b>Utilization</b> is how much of the time each person is working: arrivals over capacity. Over 100%, the line grows without end. Even under 100%, arrivals bunch
                up, so people wait. Past about 85%, waits get long fast. That is the main lesson of queueing theory.
              </p>
            ),
            math: <>busy = arrivals ÷ capacity · 60 ÷ 75 = 80%</>,
          },
        ]}
        after={
          <>
            <p className="font-display text-xl font-[650] !text-ink">What this counts, and what it doesn&rsquo;t</p>
            <p>
              This counts hours, not waits. Someone who isn&rsquo;t served in a busy hour spills into the next one, and even an hour that isn&rsquo;t over can have a line if
              everyone arrives in the same ten minutes. A full waiting-line model, called <b>Erlang C</b>, uses how long each person takes to find how long people wait.
            </p>
            <p>
              Real rushes are lumpier than Poisson. A bus pulls in, a class lets out, a storm knocks out the network, and arrivals come in bursts. Plan on your busiest hour, and
              leave room.
            </p>
          </>
        }
      />
    </div>
  );
}

/** How many arrive in an hour: one bar per count, with the hours that bring too many shaded in the danger color past the team's capacity. Hover or tap a bar to read it. */
function ArrivalChart({ lam, cap, staff, who }: { lam: number; cap: number; staff: number; who: string }) {
  const narrow = useMediaQuery("(max-width: 639px)");
  const W = narrow ? 360 : 560;
  const H = 186;
  const L = 8;
  const R = 8;
  const top = 30;
  const base = H - 30;
  const sd = Math.sqrt(lam);
  const lo = Math.max(0, Math.floor(lam - 4 * sd - 1));
  const hi = Math.ceil(lam + 4 * sd + 1);
  const ks = Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
  const ps = ks.map((x) => poissonPmf(x, lam));
  const peak = Math.max(...ps) || 1;
  const bw = (W - L - R) / ks.length;
  const X = (x: number) => L + (x - lo) * bw;
  const capIn = Number.isFinite(cap) && cap >= lo && cap <= hi;
  const cx = capIn ? X(cap + 1) : NaN;
  const ticks = [lo, Math.round(lam), hi];
  const capLabel = `${staff} staff serve ${k(cap)}`;
  const right = cx + capLabel.length * 7 + 8 < W;
  const scrub = useScrub(ks.length, W, (x) => Math.floor((x - L) / bw));
  const at = scrub.at;
  const over = (x: number) => Number.isFinite(cap) && x > cap;
  return (
    <figure>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full select-none"
        role="img"
        aria-label={`Chance of each count of ${who} in an hour, centered on ${k(Math.round(lam))}.${Number.isFinite(cap) ? ` ${staff} staff can serve ${k(cap)}; counts above that are too many.` : ""}`}
        {...scrub.bind}
      >
        {ks.map((x, i) => {
          const h = (ps[i] / peak) * (base - top);
          const o = over(x);
          const on = at === i;
          return (
            <rect
              key={x}
              x={X(x) + Math.min(1, bw * 0.15)}
              y={base - h}
              width={Math.max(1, bw - Math.min(2, bw * 0.3))}
              height={h}
              fill={o ? "var(--danger)" : "var(--clay)"}
              fillOpacity={on ? 0.95 : o ? 0.4 : 0.5}
              stroke={on ? "var(--ink)" : undefined}
              strokeWidth={on ? 1 : undefined}
            />
          );
        })}
        <line x1={L} x2={W - R} y1={base} y2={base} stroke="var(--line-strong)" />
        {ticks.map((x, i) => (
          <text key={i} x={X(x) + bw / 2} y={H - 10} textAnchor={i === 0 ? "start" : i === 2 ? "end" : "middle"} className="font-mono" fontSize="12" fill="var(--ink-muted)">
            {k(x)}
          </text>
        ))}
        {capIn && (
          <g pointerEvents="none">
            <line x1={cx} x2={cx} y1={top - 16} y2={base} stroke="var(--ink)" strokeWidth={1.5} strokeDasharray="4 4" />
            <text x={cx + (right ? 6 : -6)} y={top - 8} textAnchor={right ? "start" : "end"} fontSize="12" fill="var(--ink)">
              <tspan className="font-mono">{staff}</tspan> staff serve <tspan className="font-mono">{k(cap)}</tspan>
            </text>
          </g>
        )}
        <rect x={L} y={top} width={W - L - R} height={base - top} fill="transparent" />
      </svg>
      <figcaption className="mt-2 min-h-10 text-sm text-ink-muted">
        {at !== null ? (
          <span className="text-ink">
            <span className="font-mono tabular">{k(ks[at])}</span> {ks[at] === 1 ? who.replace(/s$/, "") : who}: <span className="font-mono tabular">{chance(ps[at], 1)}</span> of hours
            {over(ks[at]) ? <span className="text-[var(--danger)]">, more than {staff} staff can serve</span> : ""}.
          </span>
        ) : (
          <>
            How many {who} arrive in one hour. {Number.isFinite(cap) ? "Past the dashed line, in red: too many for the team. " : ""}Hover or tap a bar.
          </>
        )}
      </figcaption>
      <ChartList
        summary="Every count, as a list"
        caption={`Share of hours that bring each count of ${who}`}
        head={[`${who[0].toUpperCase()}${who.slice(1)} in an hour`, "Share of hours", "Too many?"]}
        rows={ks.map((x, i) => ({ key: x, mark: i === at, cells: [k(x), chance(ps[i], 1), over(x) ? "yes" : "no"] }))}
      />
    </figure>
  );
}
