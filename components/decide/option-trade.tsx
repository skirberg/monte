"use client";

import * as React from "react";
import { breakeven, oneSdMove, priceDensity, probAbove, readNumber } from "@/lib/decide/math";
import { useMediaQuery } from "@/lib/hooks";
import { HowItWorks, NumField, Presets, ResultBar, Stat, Stats, Toggle, aChance, chance, useToolXp } from "@/components/decide/fields";

type Kind = "call" | "put";
type Preset = { label: string; note: string; kind: Kind; S: string; K: string; days: string; iv: string; premium: string };

/**
 * Round, made-up numbers. Each premium is close to the no-drift model price for its inputs,
 * so the examples are internally honest (checked in the verification script).
 */
const PRESETS: Preset[] = [
  { label: "Steady stock, a call", note: "A calm stock at $100. A call pays if it ends above $110 in 30 days.", kind: "call", S: "100", K: "110", days: "30", iv: "30", premium: "0.60" },
  { label: "Insurance, a put", note: "You own a $50 stock and buy a put at $45 for two months, in case it falls.", kind: "put", S: "50", K: "45", days: "60", iv: "40", premium: "1.20" },
  { label: "Jumpy stock, big news", note: "A $200 stock with news due this week. Traders expect a big move, so volatility is 80%.", kind: "call", S: "200", K: "230", days: "7", iv: "80", premium: "1.15" },
];

const usd = (v: number) => (Number.isFinite(v) ? `$${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "?");

export function OptionTrade() {
  const [preset, setPreset] = React.useState(0);
  const [kind, setKind] = React.useState<Kind>(PRESETS[0].kind);
  const [S, setS] = React.useState(PRESETS[0].S);
  const [K, setK] = React.useState(PRESETS[0].K);
  const [days, setDays] = React.useState(PRESETS[0].days);
  const [iv, setIv] = React.useState(PRESETS[0].iv);
  const [premium, setPremium] = React.useState(PRESETS[0].premium);
  const xp = useToolXp("option");

  const choose = (i: number) => {
    const p = PRESETS[i];
    setPreset(i);
    setKind(p.kind);
    setS(p.S);
    setK(p.K);
    setDays(p.days);
    setIv(p.iv);
    setPremium(p.premium);
    xp();
  };
  const edit = (set: (v: string) => void) => (v: string) => {
    set(v);
    setPreset(-1);
    xp();
  };

  const s = readNumber(S);
  const k = readNumber(K);
  const d = readNumber(days);
  const sigma = readNumber(iv) / 100;
  const prem = premium.trim() === "" ? 0 : readNumber(premium);
  const errors = [
    !(s > 0) && "Stock price must be above $0.",
    !(k > 0) && "Strike must be above $0.",
    !(d >= 1 && d <= 1095) && "Days runs from 1 to 1,095 (three years).",
    !(sigma > 0 && sigma <= 3) && "Volatility runs from 1% to 300%.",
    !(prem >= 0) && "Premium is $0 or more.",
  ].filter(Boolean) as string[];
  const ok = errors.length === 0;

  const move = ok ? oneSdMove(s, sigma, d) : NaN;
  const above = ok ? probAbove(s, k, sigma, d) : NaN;
  const pStrike = kind === "call" ? above : 1 - above;
  const be = ok ? breakeven(kind, k, prem) : NaN;
  const pBe = ok && be > 0 ? (kind === "call" ? probAbove(s, be, sigma, d) : 1 - probAbove(s, be, sigma, d)) : kind === "put" ? 0 : NaN;
  const side = kind === "call" ? "above" : "below";
  const bar: [string, string] = ok ? [chance(pBe, 1), `chance of a profit: the stock ends ${side} the ${usd(be)} breakeven.`] : ["", "Fix the numbers to see the odds."];

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="space-y-6 lg:col-span-5">
          <ResultBar lead={bar[0]} rest={bar[1]} />
          <div className="space-y-2">
            <Presets label="Example trades" items={PRESETS.map((x) => x.label)} value={preset} onChange={choose} />
            <p className="text-sm text-ink-muted">{preset >= 0 ? `${PRESETS[preset].note} ` : ""}Made-up stock and prices.</p>
          </div>
          <Toggle label="Kind of option" value={kind} onChange={(v) => { setKind(v); setPreset(-1); xp(); }} options={[["call", "Call: pays if it rises"], ["put", "Put: pays if it falls"]]} />
          <div className="grid grid-cols-2 gap-3">
            <NumField id="op-s" label="Stock price now" prefix="$" value={S} onChange={edit(setS)} invalid={!(s > 0)} />
            <NumField id="op-k" label="Strike price" prefix="$" value={K} onChange={edit(setK)} invalid={!(k > 0)} />
            <NumField id="op-d" label="Days to expiry" value={days} onChange={edit(setDays)} inputMode="numeric" invalid={!(d >= 1 && d <= 1095)} describedBy="op-d-hint" />
            <NumField id="op-iv" label="Implied volatility" suffix="%" value={iv} onChange={edit(setIv)} invalid={!(sigma > 0 && sigma <= 3)} />
            <NumField id="op-p" label="Premium per share" prefix="$" value={premium} onChange={edit(setPremium)} invalid={!(prem >= 0)} className="col-span-2" />
          </div>
          <p id="op-d-hint" className="text-sm text-ink-muted">
            {ok ? "Calendar days, weekends included. One contract usually covers 100 shares." : errors.join(" ")}
          </p>
        </div>

        <div className="space-y-6 lg:col-span-7">
          {ok && (
            <>
              <div className="rounded-[28px] bg-sand p-3 sm:p-5">
                <ExpiryCurve S={s} K={k} be={be} sigma={sigma} days={d} kind={kind} />
              </div>
              <Stats className="grid-cols-2">
                <Stat k="Typical move by expiry" v={`±${usd(move)}`} sub={`about 2 in 3 finish between ${usd(Math.max(0, s - move))} and ${usd(s + move)}`} />
                <Stat k={`Ends ${side} the strike`} v={chance(pStrike, 1)} sub={`chance it finishes ${side} ${usd(k)}`} />
                <Stat k="Breakeven at expiry" v={usd(be)} sub={`strike ${kind === "call" ? "plus" : "minus"} the ${usd(prem)} premium`} />
                <Stat k="Chance of a profit" v={chance(pBe, 1)} tone="clay" sub={`ends ${side} ${usd(be)} · cost ${usd(prem * 100)} per contract, the most you can lose`} />
              </Stats>
            </>
          )}
          <p className="text-ink-muted">
            {ok
              ? `A typical move is about ${usd(move)} either way. The stock has ${aChance(pStrike, 1)} chance of ending ${side} the ${usd(k)} strike, and ${chance(pBe, 1)} of passing the ${usd(be)} breakeven, where the ${kind} makes money.`
              : "Fix the numbers to see the odds."}
          </p>
        </div>
      </div>

      <HowItWorks
        id="op"
        steps={[
          {
            title: "An option is a bet with a deadline.",
            body: (
              <p>
                A <b>call</b> pays if the stock ends above a set price, the <b>strike</b>, on a set day. A <b>put</b> pays if it ends below. You pay a fee up front, the{" "}
                <b>premium</b>. If the stock never gets past the strike, the option expires worth nothing and the premium is gone. That is the most you can lose when you buy one.
              </p>
            ),
          },
          {
            title: "Volatility is how much the stock usually swings.",
            body: (
              <p>
                <b>Implied volatility</b> is the swing traders are pricing in, written as a yearly percent. 30% means a typical move over a year of about 30% of the price, up or
                down. Over a shorter time the swing is smaller, but not in a straight line: it grows with the square root of time. A month is about a twelfth of a year, so its
                swing is about √(1/12), or 29%, of the yearly one.
              </p>
            ),
            math: <>typical move = price × volatility × √(days ÷ 365) · $100 × 0.30 × √(30 ÷ 365) = ±$8.60</>,
          },
          {
            title: "Draw the range of prices at expiry.",
            body: (
              <p>
                The model assumes the stock&rsquo;s daily moves are random, so the price at expiry follows a skewed bell curve called a <b>lognormal</b>. It can never fall below
                $0 but it can rise a lot. The model also assumes no drift: on average the stock goes nowhere. That is the standard &ldquo;risk-neutral&rdquo; shortcut with
                interest rates set to zero, and it is an approximation, not a forecast.
              </p>
            ),
          },
          {
            title: "Read the chance of ending past a price.",
            body: (
              <p>
                The chance of ending above the strike is the area of the curve to the right of it. For the steady stock example, a $110 strike 10% above a $100 price, 30 days out
                at 30% volatility, that area is about 12.5%.
              </p>
            ),
            math: <>P(price at expiry &gt; strike) = Φ(d₂), with d₂ = (ln(price ÷ strike) − σ²T ÷ 2) ÷ (σ√T) and T = days ÷ 365</>,
          },
          {
            title: "Add the premium to find breakeven.",
            body: (
              <p>
                Ending past the strike is not enough. The stock has to go far enough to pay back what you spent. A call breaks even at strike plus premium, a put at strike minus
                premium. The chance of a profit at expiry is the area past that point, which is always smaller than the chance of passing the strike.
              </p>
            ),
            math: <>call breakeven = strike + premium · put breakeven = strike − premium</>,
          },
        ]}
        after={
          <p>
            For learning only. Real options can be sold before expiry, most are on 100 shares, and real stocks drift, jump on news and change their volatility. Real trading also
            has fees and spreads. The game <a href="/play/options/" className="font-medium text-ink underline underline-offset-4">Price an option</a> shows where the premium itself comes from.
          </p>
        }
      />
    </div>
  );
}

/** The lognormal curve of the price at expiry, with the strike, breakeven and the winning side shaded. */
function ExpiryCurve({ S, K, be, sigma, days, kind }: { S: number; K: number; be: number; sigma: number; days: number; kind: Kind }) {
  const narrow = useMediaQuery("(max-width: 639px)");
  const W = narrow ? 360 : 560;
  const H = 230;
  const L = 12;
  const R = 12;
  const top = 34;
  const base = H - 34;
  const sd = sigma * Math.sqrt(days / 365);
  const m = Math.log(S) - (sigma * sigma * days) / 365 / 2;
  // Show about ±3 standard deviations in log space, widened to include the strike and breakeven.
  const lo = Math.max(0.0001, Math.min(Math.exp(m - 3 * sd), K * 0.95, be > 0 ? be * 0.95 : Infinity));
  const hi = Math.max(Math.exp(m + 3 * sd), K * 1.05, be * 1.05);
  const N = 160;
  const xs = Array.from({ length: N + 1 }, (_, i) => lo + ((hi - lo) * i) / N);
  const ys = xs.map((x) => priceDensity(x, S, sigma, days));
  const peak = Math.max(...ys) || 1;
  const X = (v: number) => L + ((v - lo) / (hi - lo)) * (W - L - R);
  const Y = (y: number) => base - (y / peak) * (base - top);
  const curve = xs.map((x, i) => `${i ? "L" : "M"} ${X(x).toFixed(1)} ${Y(ys[i]).toFixed(1)}`).join(" ");
  const area = (from: number, to: number) => {
    const pts = xs.map((x, i) => [x, ys[i]] as const).filter(([x]) => x >= from && x <= to);
    if (!pts.length) return "";
    const a = Math.max(lo, from);
    const b = Math.min(hi, to);
    return `M ${X(a)} ${base} ` + pts.map(([x, y]) => `L ${X(x).toFixed(1)} ${Y(y).toFixed(1)}`).join(" ") + ` L ${X(b)} ${base} Z`;
  };
  const strikeSide = kind === "call" ? area(K, hi) : area(lo, K);
  const profitSide = be > 0 ? (kind === "call" ? area(be, hi) : area(lo, be)) : "";
  /** Whole dollars when the value is whole, else cents, so a $110.60 breakeven never reads as $111. */
  const fmt = (v: number) => (Math.abs(v - Math.round(v)) < 0.005 ? `$${Math.round(v)}` : `$${v.toFixed(2)}`);
  const tick = (v: number) => `$${v >= 10 ? Math.round(v) : v.toFixed(1)}`;
  // "now" leans away from the strike, and the strike and breakeven lean the other way, so the labels never collide.
  const away = K >= S ? 1 : -1;
  const marks = [
    { v: S, label: "now", y: 14, color: "var(--ink-muted)", lean: -away },
    { v: K, label: "strike", y: 14, color: "var(--ink)", lean: away },
    { v: be, label: "breakeven", y: 28, color: "var(--clay-ink)", lean: away },
  ].filter((mk) => mk.v >= lo && mk.v <= hi);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      role="img"
      aria-label={`Curve of possible stock prices at expiry. Most likely near ${fmt(Math.exp(m))}. Strike ${fmt(K)}, breakeven ${fmt(be)}. The shaded part is where the ${kind} ends past the strike; the darker part is where it makes money.`}
    >
      <path d={strikeSide} fill="var(--clay)" fillOpacity={0.18} />
      {profitSide && <path d={profitSide} fill="var(--clay)" fillOpacity={0.5} />}
      <path d={curve} fill="none" stroke="var(--ink)" strokeWidth={2.5} strokeLinejoin="round" />
      <line x1={L} x2={W - R} y1={base} y2={base} stroke="var(--line-strong)" />
      {marks.map((mk) => {
        const x = X(mk.v);
        // Lean right with "start", left with "end"; flip near an edge so the text stays inside the drawing.
        const room = (mk.label.length + 8) * 7.3;
        const right = mk.lean > 0 ? x + room < W : x - room < 0;
        const anchor = right ? "start" : "end";
        return (
          <g key={mk.label}>
            <line x1={x} x2={x} y1={top - 2} y2={base} stroke={mk.color} strokeWidth={1.5} strokeDasharray={mk.label === "now" ? "3 4" : undefined} />
            <text x={x + (right ? 5 : -5)} y={mk.y} textAnchor={anchor} fontSize="12" fill={mk.color}>
              {mk.label} <tspan className="font-mono">{fmt(mk.v)}</tspan>
            </text>
          </g>
        );
      })}
      {[0, 0.5, 1].map((t, i) => (
        <text key={t} x={X(lo + t * (hi - lo))} y={H - 12} textAnchor={i === 0 ? "start" : i === 2 ? "end" : "middle"} className="font-mono" fontSize="12" fill="var(--ink-muted)">
          {tick(lo + t * (hi - lo))}
        </text>
      ))}
    </svg>
  );
}
