import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Motion } from "@/components/landing/motion-bits";
import { JsonLd } from "@/components/json-ld";
import { HashRedirect } from "@/components/decide/hash-redirect";
import { DISCLAIMER, GROUPS, TOOLS, toolHref } from "@/lib/decide/tools";
import { SITE_NAME, SITE_URL, abs } from "@/lib/seo";

const TITLE = "The odds of anything";
const DESCRIPTION =
  "Run the numbers on a real decision in plain English: a warranty, a test result, an A/B test, a savings goal, a shift schedule, two job offers or a bet.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/decide/" },
  openGraph: {
    title: `${TITLE} · ${SITE_NAME}`,
    description: DESCRIPTION,
    type: "website",
    siteName: SITE_NAME,
    url: "/decide/",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: `${SITE_NAME}: drop enough grains and the shape appears.` }],
  },
  twitter: { card: "summary_large_image", title: `${TITLE} · ${SITE_NAME}`, description: DESCRIPTION, images: ["/og.png"] },
};

/** Numbers come from the page order, so the cards and the tool pages agree. */
const NUMBER = new Map(TOOLS.map((t, i) => [t.id, String(i + 1).padStart(2, "0")]));

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
          hasPart: TOOLS.map((t) => ({ "@type": "LearningResource", name: t.question, url: abs(toolHref(t.id)), learningResourceType: "Interactive simulation", teaches: t.teaches })),
        }}
      />
      <SiteHeader mode="landing" />
      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-[1200px] px-4 pb-20 outline-none md:px-6">
        {/* ---------- opening: one sentence ---------- */}
        <header className="grid gap-3 pb-8 pt-8 md:grid-cols-12 md:gap-4 md:pb-14 md:pt-14">
          <p className="rise text-sm font-medium text-clay-ink md:col-span-3 md:pt-4">Decide</p>
          <div className="md:col-span-9">
            <h1
              className="rise font-display text-[clamp(2.8rem,1.6rem+5vw,5.6rem)] font-[680] leading-[0.92] tracking-[-0.02em]"
              style={{ fontVariationSettings: "'wdth' 78" }}
            >
              The odds
              <span className="block">of anything.</span>
            </h1>
            <p className="rise mt-5 max-w-[46ch] text-lg text-ink-muted md:text-xl" style={{ animationDelay: "80ms" }}>
              Pick a question, type in your own numbers, see the odds.
            </p>
          </div>
        </header>

        {/* ---------- the decisions: rows on a phone, cards on wide screens ---------- */}
        <div className="space-y-8 md:space-y-14">
          {GROUPS.map((g) => {
            const slug = `nav-${g.name.split(" ")[0].toLowerCase()}`;
            return (
              <section key={g.name} aria-labelledby={slug} className="grid gap-2 md:grid-cols-12 md:gap-4 md:border-t md:border-ink md:pt-5">
                <div className="md:col-span-3">
                  <h2 id={slug} className="font-mono text-xs uppercase tracking-[0.08em] text-ink-muted md:font-display md:text-2xl md:font-[650] md:normal-case md:tracking-normal md:text-ink">
                    {g.name}
                  </h2>
                  <p className="mt-1.5 hidden max-w-[30ch] text-sm text-ink-muted md:block">{g.line}</p>
                </div>
                <ul className="grid border-t border-ink md:col-span-9 md:grid-cols-2 md:gap-3 md:border-t-0">
                  {g.tools.map((t, i) => (
                    <li key={t.id} className={`min-w-0 border-b border-line md:border-b-0 ${g.tools.length % 2 === 1 && i === g.tools.length - 1 ? "md:col-span-2" : ""}`}>
                      <Link
                        href={toolHref(t.id)}
                        className="group flex h-full min-h-16 items-center justify-between gap-4 py-3 transition-colors md:flex-col md:items-start md:rounded-2xl md:border md:border-line md:p-6 md:hover:border-ink"
                      >
                        <span className="block space-y-1 md:space-y-2">
                          <span className="hidden items-baseline gap-3 text-xs text-ink-muted md:flex">
                            <span className="font-mono tabular">{NUMBER.get(t.id)}</span>
                            <span>{t.kicker}</span>
                          </span>
                          <span
                            className="block font-display text-[1.3rem] font-[650] leading-[1.08] tracking-[-0.012em] md:text-[1.6rem]"
                            style={{ fontVariationSettings: "'wdth' 84" }}
                          >
                            {t.question}
                          </span>
                          <span className="hidden max-w-[52ch] text-ink-muted md:block">{t.line}</span>
                        </span>
                        <ArrowRight className="size-5 shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-ink md:mt-auto" aria-hidden />
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
