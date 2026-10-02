import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { studyHref } from "@/lib/site-data";

export default function NotFound() {
  return (
    <>
      <SiteHeader mode="landing" />
      <main id="main" tabIndex={-1} className="mx-auto flex min-h-[60vh] w-full max-w-[1200px] flex-col justify-center px-4 py-20 outline-none md:px-6">
        <p className="font-mono text-xs uppercase tracking-[0.1em] text-ink-muted">404 · line call</p>
        <h1
          className="mt-4 font-display text-[clamp(4rem,2rem+10vw,10rem)] font-[680] leading-[0.85] tracking-[-0.05em]"
          style={{ fontVariationSettings: "'wdth' 75" }}
        >
          Out.
        </h1>
        <p className="mt-6 max-w-[44ch] text-xl text-ink-muted">That page landed outside the line. Replay the point from somewhere that exists.</p>
        <div className="mt-9 flex flex-wrap gap-3">
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/" className="inline-flex h-12 items-center rounded-full bg-ink px-6 font-medium text-paper hover:bg-ink/85">
            Home
          </a>
          <a href={studyHref("#learn/topics/data")} className="inline-flex h-12 items-center rounded-full border border-line-strong px-6 font-medium hover:border-ink hover:bg-sand">
            Start studying
          </a>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
