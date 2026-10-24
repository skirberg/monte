"use client";

import * as React from "react";
import { DATA } from "@/lib/study/data";
import { chip } from "@/components/study/ui";

/** Every source, filterable by kind. The first `limit` show, the rest wait behind one button (or a link to the full page). */
export function SourceList({ limit, moreHref }: { limit?: number; moreHref?: string }) {
  const [cat, setCat] = React.useState("All");
  const [all, setAll] = React.useState(false);
  const rows = DATA.sources.list.filter((s) => cat === "All" || s[0] === cat);
  const shown = limit && !all ? rows.slice(0, limit) : rows;
  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-4">
      <div role="group" aria-label="Filter sources" className="-mx-4 flex gap-2 overflow-x-auto overscroll-x-contain px-4 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0 [&::-webkit-scrollbar]:hidden">
        {["All", ...DATA.sources.cats].map((c) => (
          <button key={c} type="button" aria-pressed={c === cat} className={chip} onClick={() => setCat(c)}>
            {c}
          </button>
        ))}
      </div>
      <ul className="divide-y divide-line border-y border-line">
        {shown.map(([kind, title, why, url, checked]) => (
          <li key={url}>
            <a href={url} target="_blank" rel="noopener noreferrer" className="group grid gap-1 py-3.5">
              <b className="font-semibold group-hover:text-clay-ink">{title}</b>
              <span className="line-clamp-2 text-sm">{why}</span>
              <span className="flex flex-wrap gap-x-4 font-mono text-xs text-ink-muted">
                <span>{kind}</span>
                <span>Checked {checked}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
      {limit && !all && rows.length > limit && (
        <p>
          {moreHref ? (
            <a href={moreHref} className="inline-flex min-h-11 items-center text-sm font-medium text-clay-ink underline-offset-4 hover:underline">
              See all {rows.length} {cat === "All" ? "sources" : `${cat} sources`}
            </a>
          ) : (
            <button type="button" onClick={() => setAll(true)} className="inline-flex min-h-11 items-center text-sm font-medium text-clay-ink underline-offset-4 hover:underline">
              Show all {rows.length} {cat === "All" ? "sources" : `${cat} sources`}
            </button>
          )}
        </p>
      )}
    </div>
  );
}
