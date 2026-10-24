import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Motion } from "@/components/landing/motion-bits";
import { JsonLd } from "@/components/json-ld";
import { DISCLAIMER, GROUPS, prevNext, toolHref, toolInfo } from "@/lib/decide/tools";
import { SITE_NAME, SITE_URL, abs } from "@/lib/seo";

/** One decision on its own page: the question, the tool, then where to go next. Each page imports only its own tool, so only that one runs. */
export function ToolPage({ id, children }: { id: string; children: ReactNode }) {
  const t = toolInfo(id);
  const { prev, next } = prevNext(id);
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
        <header className="grid gap-3 pb-8 pt-6 md:grid-cols-12 md:gap-4 md:pb-12 md:pt-12">
          <nav aria-label="Breadcrumb" className="text-sm md:col-span-3 md:pt-3">
            <ol className="flex flex-wrap items-center gap-x-1.5 text-ink-muted md:flex-col md:items-start md:gap-y-1">
              <li>
                <Link href="/decide/" className="inline-flex min-h-11 items-center underline-offset-4 hover:text-ink hover:underline md:min-h-0">
                  The odds of anything
                </Link>
                <span aria-hidden="true" className="ml-1.5 md:hidden">
                  /
                </span>
              </li>
              <li className="font-medium text-clay-ink">
                {t.group} · {t.kicker}
              </li>
            </ol>
          </nav>
          <div className="space-y-4 md:col-span-9">
            <h1
              className="rise font-display text-[clamp(2.3rem,1.4rem+3.6vw,4.2rem)] font-[680] leading-[0.96] tracking-[-0.02em]"
              style={{ fontVariationSettings: "'wdth' 80" }}
            >
              {t.question}
            </h1>
            <p className="rise max-w-[58ch] text-lg text-ink-muted md:text-xl" style={{ animationDelay: "60ms" }}>
              {t.lede}
            </p>
            <p className="rise text-sm text-ink-muted" style={{ animationDelay: "100ms" }}>
              {DISCLAIMER}
            </p>
          </div>
        </header>

        <section aria-labelledby="tool-h" className="border-t border-line pt-8 md:pt-12">
          <h2 id="tool-h" className="sr-only">
            Try it with your own numbers
          </h2>
          {children}
        </section>

        {/* ---------- where next ---------- */}
        <nav aria-label="Previous and next decision" className="mt-16 grid gap-3 border-t border-line pt-8 sm:grid-cols-2">
          {prev ? (
            <Link href={toolHref(prev.id)} className="group flex min-h-20 items-center gap-4 rounded-2xl border border-line px-5 py-4 transition-colors hover:border-ink">
              <ArrowLeft className="size-5 shrink-0 text-ink-muted transition-transform group-hover:-translate-x-0.5 group-hover:text-ink" />
              <span className="min-w-0">
                <span className="block text-xs text-ink-muted">Previous · {prev.group}</span>
                <span className="font-display text-lg font-[650] leading-tight">{prev.question}</span>
              </span>
            </Link>
          ) : (
            <span aria-hidden="true" className="hidden sm:block" />
          )}
          {next ? (
            <Link href={toolHref(next.id)} className="group flex min-h-20 items-center justify-between gap-4 rounded-2xl bg-sand px-5 py-4 text-right transition-colors hover:bg-sand-2">
              <span className="min-w-0 flex-1">
                <span className="block text-xs text-ink-muted">Next · {next.group}</span>
                <span className="font-display text-lg font-[650] leading-tight">{next.question}</span>
              </span>
              <ArrowRight className="size-5 shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-ink" />
            </Link>
          ) : (
            <Link href="/decide/" className="group flex min-h-20 items-center justify-between gap-4 rounded-2xl bg-sand px-5 py-4 text-right transition-colors hover:bg-sand-2">
              <span className="min-w-0 flex-1">
                <span className="block text-xs text-ink-muted">That is all of them</span>
                <span className="font-display text-lg font-[650] leading-tight">Back to every decision</span>
              </span>
              <ArrowRight className="size-5 shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-ink" />
            </Link>
          )}
        </nav>

        <nav aria-labelledby="more-h" className="mt-12">
          <h2 id="more-h" className="font-display text-xl font-[650]">
            More decisions
          </h2>
          <div className="mt-4 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
            {GROUPS.map((g) => (
              <div key={g.name}>
                <p className="border-b border-line pb-2 text-xs text-ink-muted">{g.name}</p>
                <ul>
                  {g.tools.map((x) =>
                    x.id === id ? (
                      <li key={x.id} aria-current="page" className="flex min-h-11 items-center py-1.5 text-sm font-medium text-clay-ink">
                        {x.question}
                      </li>
                    ) : (
                      <li key={x.id}>
                        <Link href={toolHref(x.id)} className="flex min-h-11 items-center py-1.5 text-sm underline-offset-4 hover:underline">
                          {x.question}
                        </Link>
                      </li>
                    ),
                  )}
                </ul>
              </div>
            ))}
          </div>
        </nav>
      </main>
      <SiteFooter />
    </Motion>
  );
}
