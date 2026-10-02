"use client";

import * as React from "react";
import { cn } from "cn";
import { money, pct } from "@/lib/play/sim";

type Format = "american" | "market";

/** Implied probability from American odds: favorites (−) risk |a| to win 100; underdogs (+) risk 100 to win a. */
const fromAmerican = (a: number) => (a < 0 ? -a / (-a + 100) : 100 / (a + 100));
/** Profit on a $100 stake. */
const profitAmerican = (a: number) => (a < 0 ? (100 * 100) / -a : a);
/** A prediction market contract costs c cents and pays $1 if it happens. */
const fromMarket = (c: number) => c / 100;
const profitMarket = (c: number) => (100 / c) * (100 - c); // $100 buys 100/c contracts, each profits (100 − c) cents

const PRESETS: { label: string; format: Format; a: number; b: number; names: [string, string] }[] = [
  { label: "Point spread, −110 / −110", format: "american", a: -110, b: -110, names: ["Team A", "Team B"] },
  { label: "Favorite vs underdog, −200 / +170", format: "american", a: -200, b: 170, names: ["Favorite", "Underdog"] },
  { label: "Prediction market, Yes 63¢ / No 39¢", format: "market", a: 63, b: 39, names: ["Yes", "No"] },
];

function NumberField({ id, label, value, onChange, min, max, step, suffix }: { id: string; label: string; value: number; onChange: (v: number) => void; min: number; max: number; step: number; suffix?: string }) {
  return (
    <label htmlFor={id} className="block space-y-1.5">
      <span className="text-sm text-ink-muted">{label}</span>
      <span className="flex items-center gap-2 rounded-xl border border-line-strong bg-paper px-3 focus-within:border-clay focus-within:shadow-[0_0_0_3px_color-mix(in_oklch,var(--clay)_25%,transparent)]">
        <input
          id={id}
          type="number"
          inputMode="numeric"
          value={Number.isFinite(value) ? value : ""}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(+e.target.value)}
          className="h-12 w-full bg-transparent font-mono text-xl outline-none tabular"
        />
        {suffix && <span className="font-mono text-ink-muted">{suffix}</span>}
      </span>
    </label>
  );
}

export function Odds() {
  const [preset, setPreset] = React.useState(0);
  const [format, setFormat] = React.useState<Format>(PRESETS[0].format);
  const [a, setA] = React.useState(PRESETS[0].a);
  const [b, setB] = React.useState(PRESETS[0].b);
  const [names, setNames] = React.useState<[string, string]>(PRESETS[0].names);
  const [mine, setMine] = React.useState(0.5);

  const choose = (i: number) => {
    const p = PRESETS[i];
    setPreset(i);
    setFormat(p.format);
    setA(p.a);
    setB(p.b);
    setNames(p.names);
    setMine(0.5);
  };

  const valid =
    format === "american"
      ? Math.abs(a) >= 100 && Math.abs(b) >= 100
      : a > 0 && a < 100 && b > 0 && b < 100;
  const ia = valid ? (format === "american" ? fromAmerican(a) : fromMarket(a)) : NaN;
  const ib = valid ? (format === "american" ? fromAmerican(b) : fromMarket(b)) : NaN;
  const book = ia + ib;
  const margin = 1 - 1 / book;
  const fa = ia / book;
  const fb = ib / book;
  // Expected profit per $100 if your probability for side A is `mine`.
  const pa = format === "american" ? profitAmerican(a) : profitMarket(a);
  const pb = format === "american" ? profitAmerican(b) : profitMarket(b);
  const evA = mine * pa - (1 - mine) * 100;
  const evB = (1 - mine) * pb - mine * 100;

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
      <div className="space-y-6 lg:col-span-6">
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Example lines">
          {PRESETS.map((p, i) => (
            <button
              key={p.label}
              type="button"
              role="radio"
              aria-checked={preset === i}
              onClick={() => choose(i)}
              className={cn(
                "inline-flex min-h-11 items-center rounded-full border px-4 text-sm transition-colors",
                preset === i ? "border-ink bg-ink text-paper" : "border-line-strong hover:border-ink",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
        <p className="text-sm text-ink-muted">
          Example lines, not live prices. Type any {format === "american" ? "American odds (like −150 or +130)" : "prices in cents"} to try your own.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <NumberField id="odds-a" label={names[0]} value={a} onChange={setA} min={format === "american" ? -10000 : 1} max={format === "american" ? 10000 : 99} step={format === "american" ? 5 : 1} suffix={format === "market" ? "¢" : undefined} />
          <NumberField id="odds-b" label={names[1]} value={b} onChange={setB} min={format === "american" ? -10000 : 1} max={format === "american" ? 10000 : 99} step={format === "american" ? 5 : 1} suffix={format === "market" ? "¢" : undefined} />
        </div>
        {!valid && (
          <p className="text-sm text-[var(--danger)]" role="alert">
            {format === "american" ? "American odds are −100 or lower, or +100 or higher." : "Prices are between 1¢ and 99¢."}
          </p>
        )}

        <div className="space-y-2">
          <div className="flex items-baseline justify-between gap-3">
            <label htmlFor="odds-mine" className="text-ink-muted">
              Your own chance for {names[0]}
            </label>
            <span className="font-mono text-xl tabular">{pct(mine, 0)}</span>
          </div>
          <input id="odds-mine" type="range" min={1} max={99} step={1} value={Math.round(mine * 100)} onChange={(e) => setMine(+e.target.value / 100)} className="h-11 w-full accent-[var(--clay)]" />
        </div>
      </div>

      <div className="space-y-6 lg:col-span-6" aria-live="polite">
        {valid && (
          <>
            <table className="w-full font-mono text-sm tabular">
              <caption className="sr-only">Implied and fair probabilities</caption>
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-[0.08em] text-ink-muted">
                  <th scope="col" className="pb-2 font-normal">Side</th>
                  <th scope="col" className="pb-2 text-right font-normal">Implied</th>
                  <th scope="col" className="pb-2 text-right font-normal">Fair</th>
                  <th scope="col" className="pb-2 text-right font-normal">Your EV / $100</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line border-t border-line">
                {[
                  [names[0], ia, fa, evA],
                  [names[1], ib, fb, evB],
                ].map(([n, i, f, ev]) => (
                  <tr key={n as string}>
                    <th scope="row" className="py-3 text-left font-normal">{n}</th>
                    <td className="py-3 text-right">{pct(i as number, 2)}</td>
                    <td className="py-3 text-right">{pct(f as number, 2)}</td>
                    <td className={cn("py-3 text-right", (ev as number) > 0 ? "font-semibold text-clay-ink" : "")}>{money(ev as number, 2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-line">
              <div className="bg-paper p-5">
                <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">The two add to</p>
                <p className="mt-1 font-mono text-4xl font-medium tracking-[-0.04em] tabular">{pct(book, 2)}</p>
              </div>
              <div className="bg-paper p-5">
                <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">{format === "american" ? "Bookmaker's cut" : "Spread you pay"}</p>
                <p className="mt-1 font-mono text-4xl font-medium tracking-[-0.04em] text-clay-ink tabular">{pct(margin, 2)}</p>
              </div>
            </div>
            <p className="text-ink-muted">
              {book > 1.0001
                ? `Real probabilities add to 100%. These add to ${pct(book, 2)}; the extra is the price of playing. A bet only has positive expected value when your chance is higher than the implied one.`
                : "These add to 100% or less, so there is no built-in cut in this line."}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
