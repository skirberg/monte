"use client";

import * as React from "react";
import { cn } from "cn";

/**
 * The shared chart primitive for every lab: an SVG whose viewBox is its real width in pixels, so
 * text stays 11px and strokes stay crisp at any size. It redraws when its container changes width.
 * Before the first measure (and on the server) it draws at 600px wide and scales.
 */
export function Chart({
  ratio,
  minH,
  maxH,
  label,
  children,
}: {
  ratio: number;
  minH: number;
  maxH: number;
  label: string;
  children: (size: { W: number; H: number }) => React.ReactNode;
}) {
  const ref = React.useRef<SVGSVGElement>(null);
  const [W, setW] = React.useState(600);
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const w = Math.round(el.getBoundingClientRect().width);
      if (w) setW(w);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const H = Math.round(Math.max(minH, Math.min(maxH, W * ratio)));
  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={label}
      className="block h-auto w-full overflow-visible [&_text]:fill-ink-muted [&_text]:font-mono [&_text]:text-[11px]"
    >
      {children({ W, H })}
    </svg>
  );
}

/** One labelled bar against a track, with an optional target tick (the true probability). */
export function BarRow({ label, p, target }: { label: string; p: number; target?: number }) {
  return (
    <div className="grid grid-cols-[4.5rem_minmax(0,1fr)_3.5rem] items-center gap-3 font-mono text-[13px] tabular-nums">
      <span>{label}</span>
      <span className="relative h-3 rounded-[4px] bg-sand-2">
        <span className="absolute inset-y-0 left-0 rounded-[4px] bg-clay" style={{ width: `${Math.min(100, p * 100).toFixed(1)}%` }} />
        {target != null && <span className="absolute -inset-y-1 w-0.5 bg-ink" style={{ left: `${target}%` }} />}
      </span>
      <span className="text-right">{(p * 100).toFixed(1)}%</span>
    </div>
  );
}

/** A labelled slider. The current value sits in the label, so screen readers hear it with the name. */
export function Slider({
  id,
  label,
  value,
  show,
  unit,
  min,
  max,
  step,
  onChange,
}: {
  id: string;
  label: React.ReactNode;
  value: number;
  show?: React.ReactNode;
  unit?: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="grid gap-1.5 md:grid-cols-[12rem_minmax(0,1fr)] md:items-center md:gap-x-4">
      <label htmlFor={id} className="text-sm">
        {label}
        {" "}
        <b className="font-mono tabular-nums">{show ?? value}</b>
        {unit}
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
        className="h-11 w-full accent-clay"
      />
    </div>
  );
}

export function Select({
  id,
  label,
  value,
  onChange,
  options,
  className,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: [value: string, label: string][];
  className?: string;
}) {
  return (
    <div className={cn("grid min-w-0 gap-1.5", className)}>
      <label htmlFor={id} className="text-sm">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-11 w-full min-w-0 rounded-xl border border-line-strong bg-paper px-3 text-base text-ink focus:border-clay focus:shadow-[0_0_0_3px_color-mix(in_oklch,var(--clay)_25%,transparent)] focus:outline-none"
      >
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </div>
  );
}

/** Path data for a curve sampled from a to b. */
export function curve(a: number, b: number, X: (v: number) => number, Y: (v: number) => number, step = 0.05) {
  let d = "";
  for (let v = a; v <= b + 1e-9; v += step) d += `${d ? " L" : "M"}${X(v).toFixed(1)} ${Y(v).toFixed(1)}`;
  return d;
}
/** A filled area under a curve from a to b, down to the baseline. */
export function area(a: number, b: number, X: (v: number) => number, Y: (v: number) => number, base: number) {
  return `M${X(a).toFixed(1)} ${base} L${curve(a, b, X, Y).slice(1)} L${X(b).toFixed(1)} ${base} Z`;
}
