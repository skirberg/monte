import type { Metadata } from "next";
import { ArrowRight, BookOpen } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Motion } from "@/components/landing/motion-bits";
import { JsonLd } from "@/components/json-ld";
import { ToolSection } from "@/components/decide/fields";
import { MonteCarlo } from "@/components/decide/monte-carlo";
import { Bet } from "@/components/decide/bet";
import { Market } from "@/components/decide/market";
import { OptionTrade } from "@/components/decide/option-trade";
import { playHref, studyHref } from "@/lib/site-data";
import { SITE_NAME, SITE_URL, abs } from "@/lib/seo";

const TITLE = "The odds of anything";
const DESCRIPTION =
  "Pick between two jobs, read a betting line, a prediction market price or an option in plain English. A Monte Carlo simulator and three calculators that show the math.";

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

const TOOLS = [
  { id: "choose", n: "01", name: "Choose between options", line: "Two jobs, two products, two cars" },
  { id: "bet", n: "02", name: "Read a bet", line: "Odds into a chance, and how much" },
  { id: "market", n: "03", name: "Read a market price", line: "Cents into a chance" },
  { id: "option", n: "04", name: "Read an option", line: "The odds of ending past a price" },
];

export default function Decide() {
  return (
    <Motion>
      <JsonLd
        data={{
          "@type": "LearningResource",
          name: TITLE,
          description: DESCRIPTION,
          url: abs("/decide/"),
          learningResourceType: "Interactive simulation",
          teaches: "Monte Carlo simulation, implied probability, expected value, the Kelly criterion and the lognormal model",
          inLanguage: "en",
          isAccessibleForFree: true,
          isPartOf: { "@type": "WebSite", name: SITE_NAME, url: `${SITE_URL}/` },
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
                Statistics sounds scary. Most of it is a way to choose when you can&rsquo;t know what happens next. Type in your own numbers, see the odds, and read how each one
                works in plain words.
              </p>
            </div>
            <p className="rise mt-5 text-sm text-ink-muted" style={{ animationDelay: "120ms" }}>
              For learning, not financial or betting advice.
            </p>

            <nav aria-label="Tools on this page" className="rise mt-10" style={{ animationDelay: "160ms" }}>
              <ol className="grid border-t border-line sm:grid-cols-2 lg:grid-cols-4">
                {TOOLS.map((t) => (
                  <li key={t.id} className="border-b border-line">
                    <a href={`#${t.id}`} className="group flex min-h-11 flex-col gap-0.5 py-4 pr-4">
                      <span className="font-mono text-xs text-ink-muted tabular">{t.n}</span>
                      <span className="font-display text-xl font-[650] group-hover:underline group-hover:underline-offset-4">{t.name}</span>
                      <span className="text-sm text-ink-muted">{t.line}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </div>
        </header>

        <div className="space-y-20 md:space-y-24">
          <ToolSection
            id="choose"
            n="01"
            kicker="Monte Carlo"
            title="Choose between options."
            line="Give each option a worst, a likely and a best case. We play out 10,000 possible futures and count how often each one comes out on top."
          >
            <MonteCarlo />
          </ToolSection>

          <ToolSection id="bet" n="02" kicker="A bet" title="What are these odds really saying?" line="Turn any betting line into a chance, find the bookmaker's cut, and see what a careful bettor would stake.">
            <Bet />
          </ToolSection>

          <ToolSection id="market" n="03" kicker="A market price" title="What does 30¢ mean?" line="A prediction market price is the crowd's chance. Compare it with yours, after fees.">
            <Market />
          </ToolSection>

          <ToolSection
            id="option"
            n="04"
            kicker="An option, for learning only"
            title="How likely is the stock to get there?"
            line="From a stock price, a strike, the days left and the volatility: the typical move, the chance of ending past the strike, and where you break even."
          >
            <OptionTrade />
          </ToolSection>
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
