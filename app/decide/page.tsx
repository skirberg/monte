import type { ComponentType } from "react";
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
import { Warranty } from "@/components/decide/warranty";
import { Bayes } from "@/components/decide/bayes";
import { AbTest } from "@/components/decide/ab-test";
import { Goal } from "@/components/decide/goal";
import { Staffing } from "@/components/decide/staffing";
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

type Tool = { id: string; name: string; line: string; kicker: string; title: string; lede: string; Body: ComponentType };

/** The page in order, grouped. Numbers come from the order, so the nav and the sections never drift apart. */
const GROUPS: { name: string; tools: Tool[] }[] = [
  {
    name: "Choose",
    tools: [
      {
        id: "choose",
        name: "Choose between options",
        line: "Two jobs, two products, two cars",
        kicker: "Monte Carlo",
        title: "Choose between options.",
        lede: "Give each option a worst, a likely and a best case. We play out 10,000 possible futures and count how often each one comes out on top.",
        Body: MonteCarlo,
      },
    ],
  },
  {
    name: "Money and risk",
    tools: [
      {
        id: "warranty",
        name: "Buy the warranty?",
        line: "Insurance, by expected value",
        kicker: "Expected value",
        title: "Should I buy the warranty?",
        lede: "Price, chance and cost: what each choice costs on average, the chance where the plan starts to pay, and when to buy it anyway.",
        Body: Warranty,
      },
      {
        id: "bet",
        name: "Read a bet",
        line: "Odds into a chance, and how much",
        kicker: "A bet",
        title: "What are these odds really saying?",
        lede: "Turn any betting line into a chance, find the bookmaker's cut, and see what a careful bettor would stake.",
        Body: Bet,
      },
      {
        id: "market",
        name: "Read a market price",
        line: "Cents into a chance",
        kicker: "A market price",
        title: "What does 30¢ mean?",
        lede: "A prediction market price is the crowd's chance. Compare it with yours, after fees.",
        Body: Market,
      },
      {
        id: "option",
        name: "Read an option",
        line: "The odds of ending past a price",
        kicker: "An option, for learning only",
        title: "How likely is the stock to get there?",
        lede: "From a stock price, a strike, the days left and the volatility: the typical move, the chance of ending past the strike, and where you break even.",
        Body: OptionTrade,
      },
    ],
  },
  {
    name: "Evidence",
    tools: [
      {
        id: "bayes",
        name: "Is the test right?",
        line: "Base rates and false alarms",
        kicker: "Base rates",
        title: "Is this test result real?",
        lede: "A yes from a good test feels like an answer. How common the thing is changes what it means, often more than the test does.",
        Body: Bayes,
      },
      {
        id: "abtest",
        name: "Did the change work?",
        line: "An A/B test, in plain words",
        kicker: "A/B test",
        title: "Did my change really work?",
        lede: "Two versions, two counts. Is the gap real or luck, how big could it be, and how many people would settle it.",
        Body: AbTest,
      },
    ],
  },
  {
    name: "Plan",
    tools: [
      {
        id: "goal",
        name: "Will I hit my goal?",
        line: "5,000 futures for your savings",
        kicker: "Monte Carlo",
        title: "Will I hit my goal?",
        lede: "A start amount, a monthly saving and a guess at returns. We play out 5,000 possible futures, month by month, and count how often you get there.",
        Body: Goal,
      },
      {
        id: "staffing",
        name: "How many do I need?",
        line: "Staff for a busy hour",
        kicker: "Poisson",
        title: "How many people do I need?",
        lede: "Customers arrive at random. See how often a busy hour brings more than the team can serve, and the fewest people that keep it rare.",
        Body: Staffing,
      },
    ],
  },
];

const NUMBERED = GROUPS.map((g, gi) => {
  const before = GROUPS.slice(0, gi).reduce((sum, x) => sum + x.tools.length, 0);
  return { ...g, slug: `nav-${g.name.split(" ")[0].toLowerCase()}`, tools: g.tools.map((t, i) => ({ ...t, n: String(before + i + 1).padStart(2, "0") })) };
});
const ALL = NUMBERED.flatMap((g) => g.tools);

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
          teaches:
            "Monte Carlo simulation, expected value, base rates and Bayes' rule, the two-proportion z test, confidence intervals, sample size and power, the Poisson distribution, implied probability, the Kelly criterion and the lognormal model",
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
                Statistics sounds scary. Most of it is a way to choose when you can&rsquo;t know what happens next. Which job offer, whether the warranty is worth it, what a
                positive test means, whether a change really worked, if your savings will get there, how many people to put on shift.
              </p>
              <p>Type in your own numbers, see the odds, and read how each one works in plain words.</p>
            </div>
            <p className="rise mt-5 text-sm text-ink-muted" style={{ animationDelay: "120ms" }}>
              For learning, not financial, medical or betting advice.
            </p>

            <nav aria-label="Tools on this page" className="rise mt-10" style={{ animationDelay: "160ms" }}>
              <div className="grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
                {NUMBERED.map((g) => (
                  <div key={g.name}>
                    <p id={g.slug} className="border-b border-ink pb-2 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted">
                      {g.name}
                    </p>
                    <ol aria-labelledby={g.slug}>
                      {g.tools.map((t) => (
                        <li key={t.id} className="border-b border-line">
                          <a href={`#${t.id}`} className="group flex min-h-11 flex-col gap-0.5 py-4 pr-4">
                            <span className="font-mono text-xs text-ink-muted tabular">{t.n}</span>
                            <span className="font-display text-xl font-[650] group-hover:underline group-hover:underline-offset-4">{t.name}</span>
                            <span className="text-sm text-ink-muted">{t.line}</span>
                          </a>
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            </nav>
          </div>
        </header>

        <div className="space-y-20 md:space-y-24">
          {ALL.map(({ id, n, kicker, title, lede, Body }) => (
            <ToolSection key={id} id={id} n={n} kicker={kicker} title={title} line={lede}>
              <Body />
            </ToolSection>
          ))}
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
