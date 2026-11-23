import { ViewTransition, type ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Motion } from "@/components/landing/motion-bits";
import { JsonLd } from "@/components/json-ld";
import { DISCLAIMER, TOOLS, prevNext, toolHref, toolInfo } from "@/lib/decide/tools";
import { SITE_NAME, SITE_URL, abs, breadcrumbList } from "@/lib/seo";
import { SafePart } from "@/components/safe-part";
import { ToolMark } from "@/components/decide/tool-mark";

/** One decision on its own page: the question, the tool, then where to go next. Each page imports only its own tool, so only that one runs. */
export function ToolPage({ id, children }: { id: string; children: ReactNode }) {
  const t = toolInfo(id);
  const { next } = prevNext(id);
  return (
    <Motion>
      <JsonLd
        data={{
          "@graph": [
            {
              // A calculator that runs in the browser, free and with no sign-up, that teaches the idea behind it.
              "@type": ["WebApplication", "LearningResource"],
              name: t.heading,
              alternateName: t.question,
              description: t.description,
              url: abs(toolHref(id)),
              applicationCategory: "EducationalApplication",
              operatingSystem: "Any, in a web browser",
              offers: { "@type": "Offer", price: 0, priceCurrency: "USD" },
              learningResourceType: "Interactive simulation",
              teaches: t.teaches,
              inLanguage: "en",
              isAccessibleForFree: true,
              isPartOf: { "@type": "WebSite", name: SITE_NAME, url: `${SITE_URL}/` },
            },
            breadcrumbList([["Decide", "/decide/"], [t.heading, toolHref(id)]]),
          ],
        }}
      />
      <SiteHeader mode="landing" />
      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-page px-gutter pb-section outline-none">
        <header className="grid gap-2 pb-block pt-block md:grid-cols-12 md:gap-x-gutter">
          <nav aria-label="Breadcrumb" className="text-sm md:col-span-3 md:pt-3">
            <ol className="flex flex-wrap items-center gap-x-1.5 text-ink-muted md:flex-col md:items-start md:gap-y-1">
              <li>
                <Link href="/decide/" className="inline-flex min-h-11 items-center underline-offset-4 hover:text-ink hover:underline md:-my-3">
                  Decide
                </Link>
                <span aria-hidden="true" className="ml-1.5 md:hidden">
                  /
                </span>
              </li>
              <li className="font-medium text-ink">
                {t.kicker}
              </li>
            </ol>
          </nav>
          <div className="space-y-3 md:col-span-9">
            <div className="group flex items-center gap-4 sm:gap-5">
              {/* The decision's mark plays its move once as the page opens, and again on hover. */}
              <span className="grid size-16 shrink-0 place-items-center rounded-inner bg-sand p-2 sm:size-20 sm:p-2.5">
                <ViewTransition name={`tool-${t.id}`} share="auto" default="none">
                  <ToolMark id={t.id} className="ga-play w-full" />
                </ViewTransition>
              </span>
              <h1
                className="rise font-display text-title font-semibold leading-none"
                style={{ fontVariationSettings: "'wdth' 80" }}
              >
                {t.heading}
              </h1>
            </div>
            <p className="rise max-w-measure text-base text-ink-muted sm:text-lg md:text-xl" style={{ animationDelay: "60ms" }}>
              {t.lede}
            </p>
          </div>
        </header>

        <section aria-labelledby="tool-h" className="border-t border-line pt-block">
          <h2 id="tool-h" className="sr-only">
            Try it with your own numbers
          </h2>
          <SafePart name="tool">{children}</SafePart>
        </section>

        {/* ---------- where next: one way on, one way back ---------- */}
        <nav aria-label="Next decision" className="mt-12 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-line pt-6">
          {next ? (
            <Link href={toolHref(next.id)} className="group grid min-h-11 gap-0.5 py-1">
              <span className="text-xs text-ink-muted">Next decision</span>
              <span className="inline-flex items-center gap-2 font-display text-lg font-semibold leading-tight">
                {next.heading} <ArrowRight className="size-4 shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-ink" aria-hidden />
              </span>
            </Link>
          ) : (
            <span />
          )}
          <Link href="/decide/" className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-ink underline-offset-4 underline decoration-line-strong hover:decoration-ink">
            <ArrowLeft className="size-4" aria-hidden /> All {TOOLS.length} decisions
          </Link>
        </nav>
        <p className="mt-6 text-xs text-ink-muted">{DISCLAIMER}</p>
      </main>
      <SiteFooter />
    </Motion>
  );
}
