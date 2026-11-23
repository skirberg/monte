import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Motion } from "@/components/landing/motion-bits";
import { JsonLd } from "@/components/json-ld";
import { HashRedirect } from "@/components/decide/hash-redirect";
import { ToolMark } from "@/components/decide/tool-mark";
import { ViewTransition } from "react";
import { DISCLAIMER, GROUPS, TOOLS, toolHref } from "@/lib/decide/tools";
import { SITE_NAME, SITE_URL, abs, pageMeta } from "@/lib/seo";

const TITLE = "Decision calculators: the odds of anything";
const DESCRIPTION =
  "Free decision calculators in plain English: an extended warranty, a positive test, an A/B test, a savings goal, a staffing plan, two job offers, betting odds or a prediction market price.";

export const metadata: Metadata = pageMeta("/decide/", TITLE, DESCRIPTION);

export default function Decide() {
  return (
    <Motion>
      <HashRedirect />
      <JsonLd
        data={{
          "@type": "CollectionPage",
          name: TITLE,
          description: DESCRIPTION,
          url: abs("/decide/"),
          inLanguage: "en",
          isPartOf: { "@type": "WebSite", name: SITE_NAME, url: `${SITE_URL}/` },
          hasPart: TOOLS.map((t) => ({ "@type": "LearningResource", name: t.heading, url: abs(toolHref(t.id)), learningResourceType: "Interactive simulation", teaches: t.teaches })),
        }}
      />
      <SiteHeader mode="landing" />
      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-page px-gutter pb-section outline-none">
        {/* ---------- opening: one sentence ---------- */}
        <header className="pb-block pt-block">
          <div>
            <h1
              className="rise font-display text-display font-semibold leading-none"
              style={{ fontVariationSettings: "'wdth' 78" }}
            >
              The odds
              <span className="block">of anything.</span>
            </h1>
            <p className="rise mt-5 max-w-measure-short text-lg text-ink-muted md:text-xl" style={{ animationDelay: "80ms" }}>
              Pick a question, type in your own numbers, see the odds.
            </p>
          </div>
        </header>

        {/* ---------- the decisions: one list per group, the heading (searched name, then the question) is the link ---------- */}
        <div className="space-y-block">
          {GROUPS.map((g) => {
            const slug = `nav-${g.name.split(" ")[0].toLowerCase()}`;
            return (
              <section key={g.name} aria-labelledby={slug} className="grid gap-3 border-t border-ink pt-5 md:grid-cols-12 md:gap-x-gutter">
                <h2 id={slug} className="font-display text-2xl font-semibold md:col-span-3">
                  {g.name}
                </h2>
                <ul className="divide-y divide-line md:col-span-9">
                  {g.tools.map((t) => (
                    <li key={t.id}>
                      <Link href={toolHref(t.id)} className="group flex min-h-16 items-center gap-4 py-3 md:gap-5">
                        <span className="grid size-14 shrink-0 place-items-center rounded-inner bg-sand p-1 transition-colors group-hover:bg-sand-2 md:size-16">
                          {/* Named for the view transition: opening the decision carries its mark into the page's header. */}
                          <ViewTransition name={`tool-${t.id}`} share="auto" default="none">
                            <ToolMark id={t.id} />
                          </ViewTransition>
                        </span>
                        <span className="grid min-w-0 flex-1 gap-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-baseline md:gap-x-gutter">
                          <span
                            className="font-display text-xl font-semibold leading-tight underline-offset-4 group-hover:underline md:text-2xl"
                            style={{ fontVariationSettings: "'wdth' 84" }}
                          >
                            {t.heading}
                          </span>
                          <span className="hidden text-ink-muted sm:block">{t.line}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>

        <p className="mt-12 text-xs text-ink-muted">{DISCLAIMER}</p>
      </main>
      <SiteFooter />
    </Motion>
  );
}
