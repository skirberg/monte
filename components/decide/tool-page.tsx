import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Motion } from "@/components/landing/motion-bits";
import { JsonLd } from "@/components/json-ld";
import { DISCLAIMER, TOOLS, prevNext, toolHref, toolInfo } from "@/lib/decide/tools";
import { SITE_NAME, SITE_URL, abs } from "@/lib/seo";
import { SafePart } from "@/components/safe-part";

/** One decision on its own page: the question, the tool, then where to go next. Each page imports only its own tool, so only that one runs. */
export function ToolPage({ id, children }: { id: string; children: ReactNode }) {
  const t = toolInfo(id);
  const { next } = prevNext(id);
  return (
    <Motion>
      <JsonLd
        data={{
          "@type": "LearningResource",
          name: t.question,
          description: t.description,
          url: abs(toolHref(id)),
          learningResourceType: "Interactive simulation",
          teaches: t.teaches,
          inLanguage: "en",
          isAccessibleForFree: true,
          isPartOf: { "@type": "WebSite", name: SITE_NAME, url: `${SITE_URL}/` },
        }}
      />
      <SiteHeader mode="landing" />
      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-[1200px] px-4 pb-20 outline-none md:px-6">
        <header className="grid gap-2 pb-6 pt-4 md:grid-cols-12 md:gap-4 md:pb-12 md:pt-12">
          <nav aria-label="Breadcrumb" className="text-sm md:col-span-3 md:pt-3">
            <ol className="flex flex-wrap items-center gap-x-1.5 text-ink-muted md:flex-col md:items-start md:gap-y-1">
              <li>
                <Link href="/decide/" className="inline-flex min-h-11 items-center underline-offset-4 hover:text-ink hover:underline md:min-h-0">
                  Decide
                </Link>
                <span aria-hidden="true" className="ml-1.5 md:hidden">
                  /
                </span>
              </li>
              <li className="font-medium text-clay-ink">
                {t.kicker}
              </li>
            </ol>
          </nav>
          <div className="space-y-3 md:col-span-9">
            <h1
              className="rise font-display text-[clamp(2.1rem,1.4rem+3.6vw,4.2rem)] font-[680] leading-[0.96] tracking-[-0.02em]"
              style={{ fontVariationSettings: "'wdth' 80" }}
            >
              {t.question}
            </h1>
            <p className="rise max-w-[58ch] text-lg text-ink-muted md:text-xl" style={{ animationDelay: "60ms" }}>
              {t.lede}
            </p>
          </div>
        </header>

        <section aria-labelledby="tool-h" className="border-t border-line pt-6 md:pt-12">
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
              <span className="inline-flex items-center gap-2 font-display text-lg font-[650] leading-tight">
                {next.question} <ArrowRight className="size-4 shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-ink" aria-hidden />
              </span>
            </Link>
          ) : (
            <span />
          )}
          <Link href="/decide/" className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-clay-ink underline-offset-4 hover:underline">
            <ArrowLeft className="size-4" aria-hidden /> All {TOOLS.length} decisions
          </Link>
        </nav>
        <p className="mt-6 text-xs text-ink-muted">{DISCLAIMER}</p>
      </main>
      <SiteFooter />
    </Motion>
  );
}
