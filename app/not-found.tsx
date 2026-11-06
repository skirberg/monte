import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { studyHref } from "@/lib/site-data";

export const metadata: Metadata = { title: "Page not found", robots: { index: false, follow: true } };

export default function NotFound() {
  return (
    <>
      <SiteHeader mode="landing" />
      <main id="main" tabIndex={-1} className="mx-auto flex min-h-[60vh] w-full max-w-page flex-col justify-center px-gutter py-section outline-none">
        <p className="text-sm font-medium text-ink-muted">404 · line call</p>
        <h1
          className="mt-4 font-display text-hero font-semibold leading-none"
          style={{ fontVariationSettings: "'wdth' 75" }}
        >
          Out.
        </h1>
        <p className="mt-6 max-w-[44ch] text-xl text-ink-muted">That page landed outside the line. Replay the point from somewhere that exists.</p>
        <div className="mt-9 flex flex-wrap gap-3">
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/" className="btn btn-primary">
            Home
          </a>
          <a href={studyHref("#learn/topics/data")} className="btn btn-secondary">
            Start studying
          </a>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
