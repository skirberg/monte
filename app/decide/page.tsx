import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { cn } from "cn";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Motion } from "@/components/landing/motion-bits";
import { JsonLd } from "@/components/json-ld";
import { HashRedirect } from "@/components/decide/hash-redirect";
import { DISCLAIMER, GROUPS, TOOLS, toolHref } from "@/lib/decide/tools";
import { playHref, studyHref } from "@/lib/site-data";
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
        {/* ---------- opening ---------- */}
        <header className="grid gap-4 pb-12 pt-8 md:grid-cols-12 md:pb-16 md:pt-14">
          <p className="rise text-sm font-medium text-clay-ink md:col-span-3 md:pt-4">Decide</p>
          <div className="md:col-span-9">
            <h1
              className="rise font-display text-[clamp(2.8rem,1.6rem+5vw,5.6rem)] font-[680] leading-[0.92] tracking-[-0.02em]"
              style={{ fontVariationSettings: "'wdth' 78" }}
            >
              The odds
              <span className="block">of anything.</span>
            </h1>
            <div className="rise mt-7 max-w-[56ch] space-y-4 text-lg text-ink-muted md:text-xl" style={{ animationDelay: "80ms" }}>
              <p>
                Statistics sounds scary. Most of it is a way to choose when you can&rsquo;t know what happens next. Which job offer, whether the warranty is worth it, what a
                positive test means, whether a change really worked, if your savings will get there, how many people to put on shift.
              </p>
              <p>Pick a question, type in your own numbers, see the odds, and read how each one works in plain words.</p>
            </div>
            <p className="rise mt-5 text-sm text-ink-muted" style={{ animationDelay: "120ms" }}>
              {DISCLAIMER}
            </p>
          </div>
        </header>

        {/* ---------- the decisions, one row per group ---------- */}
        <div className="space-y-12 md:space-y-16">
          {GROUPS.map((g) => {
            const slug = `nav-${g.name.split(" ")[0].toLowerCase()}`;
            const odd = g.tools.length % 2 === 1;
            return (
              <section key={g.name} aria-labelledby={slug} className="grid gap-4 border-t border-ink pt-5 md:grid-cols-12 md:gap-4">
                <div className="md:col-span-3">
                  <h2 id={slug} className="font-display text-2xl font-[650] leading-tight">
                    {g.name}
                  </h2>
                  <p className="mt-1.5 max-w-[30ch] text-sm text-ink-muted">{g.line}</p>
                </div>
                <ul className="grid gap-3 sm:grid-cols-2 md:col-span-9">
                  {g.tools.map((t, i) => {
                    const wide = odd && i === g.tools.length - 1;
                    return (
                      <li key={t.id} className={cn("min-w-0", wide && "sm:col-span-2")}>
                        <Link
                          href={toolHref(t.id)}
                          className={cn(
                            "group flex h-full min-h-40 flex-col justify-between gap-6 rounded-2xl border border-line p-5 transition-colors hover:border-ink sm:p-6",
                            wide && "sm:min-h-44",
                          )}
                        >
                          <span className="block space-y-2">
                            <span className="flex items-baseline gap-3 text-xs text-ink-muted">
                              <span className="font-mono tabular">{NUMBER.get(t.id)}</span>
                              <span>{t.kicker}</span>
                            </span>
                            <span
                              className={cn("block font-display font-[650] leading-[1.02] tracking-[-0.012em]", wide ? "text-[clamp(1.7rem,1.2rem+1.6vw,2.4rem)]" : "text-[1.6rem]")}
                              style={{ fontVariationSettings: "'wdth' 84" }}
                            >
                              {t.question}
                            </span>
                            <span className="block max-w-[52ch] text-ink-muted">{t.line}</span>
                          </span>
                          <span className="inline-flex items-center gap-2 text-sm font-medium">
                            Work it out
                            <ArrowRight className="size-4 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-ink" />
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>

        {/* ---------- where next ---------- */}
        <nav aria-label="Learn more" className="mt-20 grid gap-3 border-t border-line pt-10 sm:grid-cols-2 lg:grid-cols-3">
          <a href={studyHref("#learn/topics/rv")} className="group flex min-h-20 items-center justify-between gap-4 rounded-2xl bg-sand px-6 py-5 transition-colors hover:bg-sand-2">
            <span>
              <span className="block font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted">Learn the idea</span>
              <span className="font-display text-xl font-[650]">Expected value</span>
            </span>
            <BookOpen className="size-5 shrink-0 text-ink-muted transition-colors group-hover:text-ink" />
          </a>
          <a href={studyHref("#learn/topics/normal")} className="group flex min-h-20 items-center justify-between gap-4 rounded-2xl bg-sand px-6 py-5 transition-colors hover:bg-sand-2">
            <span>
              <span className="block font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted">Learn the idea</span>
              <span className="font-display text-xl font-[650]">The normal curve</span>
            </span>
            <BookOpen className="size-5 shrink-0 text-ink-muted transition-colors group-hover:text-ink" />
          </a>
          <a href={playHref("house-edge")} className="group flex min-h-20 items-center justify-between gap-4 rounded-2xl border border-line px-6 py-5 transition-colors hover:border-ink sm:col-span-2 lg:col-span-1">
            <span>
              <span className="block font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted">Play</span>
              <span className="font-display text-xl font-[650]">The house edge</span>
            </span>
            <ArrowRight className="size-5 shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-ink" />
          </a>
        </nav>
      </main>
      <SiteFooter />
    </Motion>
  );
}
