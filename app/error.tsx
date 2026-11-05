"use client";

import * as React from "react";
import { track } from "@vercel/analytics";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

/** A page that crashed outright. Same court as the 404: say what happened, offer a retry and a way home. */
export default function PageError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  React.useEffect(() => {
    track("Page crashed", { path: location.pathname, error: String(error?.message ?? error).slice(0, 120) });
  }, [error]);
  return (
    <>
      <SiteHeader mode="landing" />
      <main id="main" tabIndex={-1} className="mx-auto flex min-h-[60vh] w-full max-w-[1200px] flex-col justify-center px-4 py-20 outline-none md:px-6">
        <p className="font-mono text-xs uppercase tracking-[0.1em] text-ink-muted">Error · let</p>
        <h1
          className="mt-4 font-display text-[clamp(4rem,2rem+10vw,10rem)] font-[680] leading-[0.85] tracking-[-0.025em]"
          style={{ fontVariationSettings: "'wdth' 75" }}
        >
          Replay.
        </h1>
        <p className="mt-6 max-w-[44ch] text-xl text-ink-muted">This page tripped on the net. Your saved progress is safe. Try the point again.</p>
        <div className="mt-9 flex flex-wrap gap-3">
          <button type="button" onClick={reset} className="inline-flex h-12 items-center rounded-full bg-ink px-6 font-medium text-paper hover:bg-ink/85">
            Try again
          </button>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/" className="inline-flex h-12 items-center rounded-full border border-line-strong px-6 font-medium hover:border-ink hover:bg-sand">
            Home
          </a>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
