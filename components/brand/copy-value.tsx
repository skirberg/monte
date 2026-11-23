"use client";

import * as React from "react";
import { Check } from "lucide-react";

/** A colour value that copies itself when pressed (the /brand/ page). Says "Copied" for a moment, in a live region. */
export function CopyValue({ value, label }: { value: string; label: string }) {
  const [done, setDone] = React.useState(false);
  return (
    <button
      type="button"
      aria-label={`Copy ${label} ${value}`}
      className="-mx-2 inline-flex min-h-11 items-center gap-1.5 rounded-full px-2 text-left font-mono text-sm tabular-nums transition-colors hover:bg-sand-2"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setDone(true);
          setTimeout(() => setDone(false), 1400);
        } catch {}
      }}
    >
      <span aria-live="polite">{done ? "Copied" : value}</span>
      {done && <Check className="size-3.5 text-clay-ink" aria-hidden />}
    </button>
  );
}
