"use client";

import * as React from "react";

/**
 * Hover or tap a chart to read one point: a year, a count, a bar. Maps the pointer to the drawing's own units (its viewBox width W),
 * then to an index through toIndex. A mouse leaving clears it; a tap stays until the next tap, so it can be read on a phone.
 */
export function useScrub(count: number, W: number, toIndex: (x: number) => number) {
  const [at, setAt] = React.useState<number | null>(null);
  const pick = (e: React.PointerEvent<SVGElement>) => {
    const svg = e.currentTarget instanceof SVGSVGElement ? e.currentTarget : e.currentTarget.ownerSVGElement;
    if (!svg) return;
    const r = svg.getBoundingClientRect();
    if (r.width <= 0) return;
    const i = toIndex(((e.clientX - r.left) / r.width) * W);
    setAt(Math.max(0, Math.min(count - 1, i)));
  };
  return {
    at: at !== null && at < count ? at : null,
    bind: {
      onPointerMove: pick,
      onPointerDown: pick,
      onPointerLeave: (e: React.PointerEvent<SVGElement>) => {
        if (e.pointerType === "mouse") setAt(null);
      },
      style: { touchAction: "pan-y" } as React.CSSProperties,
    },
  };
}

/** The chart as a list, for keyboards and screen readers, and for anyone who wants every number. Closed by default. */
export function ChartList({ summary, caption, head, rows }: { summary: string; caption: string; head: string[]; rows: { key: React.Key; cells: React.ReactNode[]; mark?: boolean }[] }) {
  return (
    <details className="group mt-3 rounded-xl text-sm">
      <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-full px-1 text-ink-muted hover:text-ink [&::-webkit-details-marker]:hidden">
        <span aria-hidden="true" className="font-mono transition-transform group-open:rotate-45">
          +
        </span>
        {summary}
      </summary>
      <div className="mt-2 max-h-80 overflow-auto rounded-xl border border-line bg-paper">
        <table className="w-full text-left tabular">
          <caption className="sr-only">{caption}</caption>
          <thead className="sticky top-0 bg-paper">
            <tr className="border-b border-line text-xs text-ink-muted">
              {head.map((h, i) => (
                <th key={i} scope="col" className="px-3 py-2 font-normal">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="font-mono">
            {rows.map((r) => (
              <tr key={r.key} className={r.mark ? "bg-clay-tint" : "border-b border-line last:border-b-0"}>
                {r.cells.map((c, i) =>
                  i === 0 ? (
                    <th key={i} scope="row" className="px-3 py-1.5 font-normal">
                      {c}
                    </th>
                  ) : (
                    <td key={i} className="px-3 py-1.5">
                      {c}
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
