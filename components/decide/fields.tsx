"use client";

import * as React from "react";
import { track } from "@vercel/analytics";
import { cn } from "cn";
import { localDay } from "@/lib/progress";

/* ---------------- XP: 5 the first time each tool is used each day ---------------- */

/** Returns a function to call on a real use (a run, a preset, an edit). Never fires on page view. */
export function useToolXp(tool: string) {
  const fired = React.useRef(false);
  return React.useCallback(() => {
    if (fired.current) return;
    fired.current = true;
    const key = `monte-decide:${tool}`;
    const day = localDay();
    try {
      if (localStorage.getItem(key) === day) return;
      localStorage.setItem(key, day);
    } catch {}
    window.dispatchEvent(new CustomEvent("monte:xp", { detail: { xp: 5, reason: "decide" } }));
    track("Decide used", { tool });
  }, [tool]);
}

/* ---------------- inputs ---------------- */

export const fieldBox =
  "flex items-center gap-1.5 rounded-xl border border-line-strong bg-paper px-3 focus-within:border-clay focus-within:shadow-[0_0_0_3px_color-mix(in_oklch,var(--clay)_25%,transparent)] aria-[invalid=true]:border-[var(--danger)]";

/** A text box for numbers. Text state, so people can clear it or type a sign before the digits. */
export function NumField({
  id,
  label,
  value,
  onChange,
  prefix,
  suffix,
  invalid,
  describedBy,
  inputMode = "decimal",
  className,
  size = "lg",
}: {
  id: string;
  label: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
  invalid?: boolean;
  describedBy?: string;
  inputMode?: "decimal" | "numeric" | "text";
  className?: string;
  size?: "lg" | "md";
}) {
  return (
    <div className={cn("min-w-0 space-y-1.5", className)}>
      <label htmlFor={id} className="block text-sm text-ink-muted">
        {label}
      </label>
      <span className={fieldBox} aria-invalid={invalid || undefined}>
        {prefix && (
          <span className="font-mono text-ink-muted" aria-hidden="true">
            {prefix}
          </span>
        )}
        <input
          id={id}
          type="text"
          inputMode={inputMode}
          autoComplete="off"
          spellCheck={false}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className={cn("h-12 w-full min-w-0 bg-transparent font-mono tabular text-ink outline-none", size === "lg" ? "text-lg" : "text-base")}
        />
        {suffix && (
          <span className="shrink-0 font-mono text-sm text-ink-muted" aria-hidden="true">
            {suffix}
          </span>
        )}
      </span>
    </div>
  );
}

export function TextField({ id, label, value, onChange, className }: { id: string; label: string; value: string; onChange: (v: string) => void; className?: string }) {
  return (
    <div className={cn("min-w-0 space-y-1.5", className)}>
      <label htmlFor={id} className="block text-sm text-ink-muted">
        {label}
      </label>
      <span className={fieldBox}>
        <input id={id} type="text" autoComplete="off" value={value} maxLength={28} onChange={(e) => onChange(e.target.value)} className="h-12 w-full min-w-0 bg-transparent text-base text-ink outline-none" />
      </span>
    </div>
  );
}

/** A labelled slider with its value shown beside the label. */
export function Slider({
  id,
  label,
  value,
  min,
  max,
  step,
  onChange,
  shown,
  valueText,
  describedBy,
}: {
  id: string;
  label: React.ReactNode;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  shown: string;
  valueText?: string;
  describedBy?: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-ink-muted">
          {label}
        </label>
        <span className="font-mono text-lg tabular" aria-hidden="true">
          {shown}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
        aria-valuetext={valueText ?? shown}
        aria-describedby={describedBy}
        className="h-11 w-full accent-[var(--clay)]"
      />
    </div>
  );
}

/** A row of example chips; one can be picked. */
export function Presets({ label, items, value, onChange }: { label: string; items: string[]; value: number; onChange: (i: number) => void }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {items.map((p, i) => (
        <button
          key={p}
          type="button"
          role="radio"
          aria-checked={value === i}
          onClick={() => onChange(i)}
          className={cn(
            "inline-flex min-h-11 items-center rounded-full border px-4 text-left text-sm leading-tight transition-colors",
            value === i ? "border-ink bg-ink text-paper" : "border-line-strong hover:border-ink",
          )}
        >
          {p}
        </button>
      ))}
    </div>
  );
}

/** Two or three choices in a pill. */
export function Toggle<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: [T, string][]; onChange: (v: T) => void }) {
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
            "h-11 min-w-0 flex-1 rounded-full px-3 text-sm transition-colors",
            value === v ? "bg-paper font-medium text-ink shadow-[0_0_0_1px_var(--line)]" : "text-ink-muted hover:text-ink",
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

/* ---------------- results ---------------- */

export function Stats({ children, className }: { children: React.ReactNode; className?: string }) {
  return <dl className={cn("grid gap-px overflow-hidden rounded-2xl bg-line font-mono tabular", className)}>{children}</dl>;
}

export function Stat({ k, v, sub, tone }: { k: string; v: React.ReactNode; sub?: React.ReactNode; tone?: "clay" | "danger" }) {
  return (
    <div className="min-w-0 bg-paper p-4 sm:p-5">
      <dt className="text-[11px] uppercase tracking-[0.08em] text-ink-muted">{k}</dt>
      <dd className={cn("mt-1 break-words text-[1.7rem] font-medium leading-tight tracking-[-0.03em]", tone === "clay" && "text-clay-ink", tone === "danger" && "text-[var(--danger)]")}>{v}</dd>
      {sub && <dd className="mt-1 font-sans text-xs text-ink-muted">{sub}</dd>}
    </div>
  );
}

/** A 0 to 100% track with two markers: what the price says and what you say. */
export function ChanceMeter({ market, mine, marketLabel, mineLabel }: { market: number; mine: number; marketLabel: string; mineLabel: string }) {
  const at = (v: number) => `${Math.min(100, Math.max(0, v * 100))}%`;
  const lo = Math.min(market, mine);
  const hi = Math.max(market, mine);
  const edge = mine > market;
  return (
    <div aria-hidden="true" className="pt-7 pb-7">
      <div className="relative h-2 rounded-full bg-sand-2">
        <span className={cn("absolute inset-y-0 rounded-full", edge ? "bg-clay" : "bg-line-strong")} style={{ left: at(lo), width: `calc(${at(hi)} - ${at(lo)})` }} />
        <span className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-paper bg-ink" style={{ left: at(market) }} />
        <span className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-paper bg-clay" style={{ left: at(mine) }} />
        <span className="absolute -top-7 -translate-x-1/2 whitespace-nowrap font-mono text-xs text-ink-muted" style={{ left: `clamp(2.5rem, ${at(market)}, calc(100% - 2.5rem))` }}>
          {marketLabel}
        </span>
        <span className="absolute top-4 -translate-x-1/2 whitespace-nowrap font-mono text-xs text-clay-ink" style={{ left: `clamp(2.5rem, ${at(mine)}, calc(100% - 2.5rem))` }}>
          {mineLabel}
        </span>
      </div>
    </div>
  );
}

/* ---------------- how this works ---------------- */

export type Step = { title: string; body: React.ReactNode; math?: React.ReactNode };

/** Plain words first, numbered; the formula for each step sits under it. */
export function HowItWorks({ id, steps, after }: { id: string; steps: Step[]; after?: React.ReactNode }) {
  return (
    <details className="group mt-8 rounded-2xl border border-line open:bg-paper">
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 rounded-2xl px-5 font-medium hover:bg-sand [&::-webkit-details-marker]:hidden">
        <span id={`${id}-how`}>How this works, step by step</span>
        <span aria-hidden="true" className="font-mono text-lg text-ink-muted transition-transform group-open:rotate-45">
          +
        </span>
      </summary>
      <div className="grid gap-6 px-5 pb-6 pt-2 lg:grid-cols-12 lg:gap-10 [&_b]:font-semibold [&_code]:rounded-md [&_code]:bg-sand [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.92em]">
        <ol className="space-y-5 lg:col-span-7">
          {steps.map((s, i) => (
            <li key={s.title} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-2">
              <span className="pt-0.5 font-mono text-sm text-clay-ink tabular" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="max-w-[62ch] space-y-1.5">
                <p className="font-display text-lg font-[650]">{s.title}</p>
                <div className="leading-relaxed text-ink-muted">{s.body}</div>
                {s.math && <p className="break-words font-mono text-sm leading-relaxed text-ink">{s.math}</p>}
              </div>
            </li>
          ))}
        </ol>
        {after && <div className="max-w-[62ch] space-y-3 self-start border-t border-line pt-5 leading-relaxed lg:col-span-5 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-1 [&_p]:text-ink-muted">{after}</div>}
      </div>
    </details>
  );
}

/* ---------------- one tool's frame ---------------- */

export function ToolSection({ id, kicker, title, line, children }: { id: string; n?: string; kicker: string; title: string; line: React.ReactNode; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-t`} className="scroll-mt-20 border-t border-line pt-12 md:scroll-mt-24 md:pt-16">
      <div className="mb-8 grid gap-3 md:grid-cols-12 md:gap-4">
        <p className="text-sm font-medium text-clay-ink md:col-span-3 md:pt-3">
          {kicker}
        </p>
        <div className="space-y-3 md:col-span-9">
          <h2
            id={`${id}-t`}
            className="font-display text-[clamp(2rem,1.3rem+2.8vw,3.4rem)] font-[650] leading-[0.98] tracking-[-0.018em]"
            style={{ fontVariationSettings: "'wdth' 84" }}
          >
            {title}
          </h2>
          <p className="max-w-[58ch] text-lg text-ink-muted">{line}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

/** Whole dollars with the site's minus sign, rounded to a sensible step for big numbers. */
export function dollars(v: number) {
  if (!Number.isFinite(v)) return "?";
  const a = Math.abs(v);
  const r = a >= 10000 ? Math.round(a / 100) * 100 : Math.round(a);
  return `${v < 0 && r > 0 ? "−" : ""}$${r.toLocaleString("en-US")}`;
}

/** Cents or dollars with two decimals and a sign, for expected values. */
export function signedMoney(v: number, digits = 2) {
  if (!Number.isFinite(v)) return "?";
  const r = Number(Math.abs(v).toFixed(digits));
  const s = r === 0 ? "" : v < 0 ? "−" : "+";
  return `${s}$${r.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
}

/** A chance as a percent; one decimal, two when tiny, and never a bare 0% or 100% for something possible. */
export function chance(v: number, digits = 1) {
  if (!Number.isFinite(v)) return "?";
  const x = v * 100;
  if (x > 0 && x < 0.1) return "under 0.1%";
  if (x < 100 && x > 99.9) return "over 99.9%";
  return `${x.toFixed(digits).replace(/\.0+$/, "")}%`;
}

/** "a 12.5% chance" or "an 8.7% chance": the article that fits how the number is read aloud. */
export function aChance(v: number, digits = 1) {
  const t = chance(v, digits);
  // Read aloud, 8, 80-something, 11, 18, "under" and "over" all start with a vowel sound.
  return `${/^(8|1[18](\D|$)|under|over)/.test(t) ? "an" : "a"} ${t}`;
}
