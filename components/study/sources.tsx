"use client";

import * as React from "react";
import { DATA } from "@/lib/study/data";
import { chip } from "@/components/study/ui";

/** Every source, filterable by kind. `limit` shows the first few with a link to the rest. */
export function SourceList({ limit, moreHref }: { limit?: number; moreHref?: string }) {
  const [cat, setCat] = React.useState("All");
  const rows = DATA.sources.list.filter((s) => cat === "All" || s[0] === cat);
  const shown = limit ? rows.slice(0, limit) : rows;
  return (
    <div className="grid gap-4">
      <div role="group" aria-label="Filter sources" className="flex flex-wrap gap-2">
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
              <span className="text-sm">{why}</span>
              <span className="flex flex-wrap gap-x-4 font-mono text-xs text-ink-muted">
                <span>{kind}</span>
                <span>Checked {checked}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
      {limit && moreHref && rows.length > limit && (
        <p>
          <a href={moreHref} className="inline-flex min-h-8 items-center text-sm text-clay-ink underline-offset-4 hover:underline">
            See all {rows.length} {cat === "All" ? "sources" : `${cat} sources`}
          </a>
        </p>
      )}
    </div>
  );
}
