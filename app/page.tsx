import { ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { HeroBoard } from "@/components/landing/hero-board";
import { TheDraw } from "@/components/landing/the-draw";
import { GameArt } from "@/components/play/game-art";
import { TestResultMini } from "@/components/landing/test-result-mini";
import { MarkBuild, Motion, Reveal } from "@/components/landing/motion-bits";
import type { Metadata } from "next";
import { DECIDE_TOOLS, GAMES, TOPICS, decideHref, playHref, studyHref } from "@/lib/site-data";
import { JsonLd } from "@/components/json-ld";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

const wrap = "mx-auto w-full max-w-[1200px] px-4 md:px-6";

export const metadata: Metadata = { alternates: { canonical: "/" } };

/** Three ways in, one line each. Play is a Fun-mode door, so it hides in Focus like everywhere else. */
const WAYS = [
  { key: "learn", kicker: "Learn", title: `${TOPICS.length} topics, one idea each`, href: studyHref("#learn"), className: "" },
  { key: "decide", kicker: "Decide", title: "Run the odds on a real choice", href: decideHref(), className: "" },
  { key: "play", kicker: "Play", title: `${GAMES.length} games, each hiding an idea`, href: playHref(), className: "fun-only" },
];

const h2 = "font-display text-[clamp(1.9rem,1.3rem+2.6vw,3.4rem)] font-[650] leading-[0.98] tracking-[-0.018em]";

function SectionHead({ kicker, title }: { kicker: string; title: React.ReactNode }) {
  return (
    <Reveal className="mb-10 grid gap-4 md:mb-14 md:grid-cols-12">
      <p className="text-sm font-medium text-clay-ink md:col-span-3 md:pt-3">{kicker}</p>
      <h2
        className="font-display text-[clamp(2.2rem,1.4rem+3.2vw,4rem)] font-[650] leading-[0.98] tracking-[-0.018em] md:col-span-9"
        style={{ fontVariationSettings: "'wdth' 84" }}
      >
        {title}
      </h2>
    </Reveal>
  );
}

export default function Home() {
  return (
    <Motion>
      <JsonLd
        data={{
          "@type": "WebSite",
          name: SITE_NAME,
          url: `${SITE_URL}/`,
          inLanguage: "en",
          description: "Statistics, one idea at a time, for everyone: fourteen topics with labs, timed drills, solvers that show the work, tools for real decisions, and games.",
        }}
      />
      <SiteHeader mode="landing" />
      <main id="main" tabIndex={-1} className="outline-none">
        {/* ---------- hero: one idea, one button, one quiet link ---------- */}
        <section className={`${wrap} grid gap-8 pb-12 pt-8 md:pb-16 md:pt-16 lg:grid-cols-12 lg:gap-8`}>
          <div className="flex flex-col justify-center lg:col-span-6">
            <div className="rise">
              <h1
                className="font-display text-[clamp(3.1rem,1.6rem+5vw,5.4rem)] font-[680] leading-[0.9] tracking-[-0.02em]"
                style={{ fontVariationSettings: "'wdth' 78" }}
              >
                Drop enough grains.
                <span className="block">The shape appears.</span>
              </h1>
            </div>
            <div className="rise" style={{ animationDelay: "80ms" }}>
              <p className="mt-5 text-lg text-ink-muted md:text-xl">Statistics, one idea at a time.</p>
            </div>
            <div className="rise mt-7 flex flex-wrap items-center gap-x-5 gap-y-2" style={{ animationDelay: "140ms" }}>
              <a
                href={studyHref("#learn/topics/data")}
                className="inline-flex h-12 items-center gap-2 rounded-full bg-ink px-6 font-medium text-paper transition-colors hover:bg-ink/85"
              >
                Start the first idea, 5 min <ArrowRight className="size-4" aria-hidden />
              </a>
              <a href={studyHref("#practice/drill/start")} className="inline-flex min-h-11 items-center font-medium text-clay-ink underline-offset-4 hover:underline">
                or take a 10-question drill
              </a>
            </div>
          </div>

          <div className="rise lg:col-span-6" style={{ animationDelay: "100ms" }}>
            <figure className="rounded-[32px] bg-sand p-3 sm:p-5">
              <HeroBoard className="mx-auto w-full max-w-[560px]" />
            </figure>
          </div>
        </section>

        {/* ---------- pick your way in ---------- */}
        <section aria-labelledby="ways-t" className={`${wrap} pb-14 md:pb-24`}>
          <h2 id="ways-t" className="mb-4 text-sm font-medium text-clay-ink">
            Pick your way in
          </h2>
          <ul className="grid border-t border-ink md:grid-cols-3 md:gap-4 md:border-t-0 md:[html[data-mode=focus]_&]:grid-cols-2">
            {WAYS.map((w) => (
              <li key={w.key} className={`border-b border-line md:border-b-0 ${w.className}`}>
                <a
                  href={w.href}
                  className="group flex min-h-16 items-center justify-between gap-4 py-3 transition-colors md:h-full md:flex-col md:items-start md:rounded-[24px] md:border md:border-line md:p-6 md:hover:border-ink"
                >
                  <span className="grid gap-0.5 md:gap-2">
                    <span className="font-mono text-xs uppercase tracking-[0.08em] text-ink-muted">{w.kicker}</span>
                    <span className="font-display text-[1.3rem] font-[650] leading-tight md:text-2xl" style={{ fontVariationSettings: "'wdth' 88" }}>
                      {w.title}
                    </span>
                  </span>
                  <ArrowRight className="size-5 shrink-0 text-ink-muted transition-transform group-hover:translate-x-1 group-hover:text-ink" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* ---------- wide screens only: the fourteen topics at a glance ---------- */}
        <section aria-label="All fourteen topics" className={`${wrap} hidden pb-24 lg:block`}>
          <SectionHead kicker="Learn" title={<>Fourteen topics.<br />Master each one.</>} />
          <TheDraw />
        </section>

        {/* ---------- one decision, live ---------- */}
        <section aria-labelledby="test-t" className="border-y border-line bg-sand/60 py-14 md:py-24">
          <div className={wrap}>
            <Reveal className="mb-6 grid gap-3 md:mb-10 md:grid-cols-12">
              <p className="text-sm font-medium text-clay-ink md:col-span-3 md:pt-3">Decide</p>
              <div className="grid gap-3 md:col-span-9">
                <h2 id="test-t" className={h2} style={{ fontVariationSettings: "'wdth' 84" }}>
                  Is this test result real?
                </h2>
                <p className="max-w-[52ch] text-lg text-ink-muted">Drag the sliders. How common the thing is decides what a yes means.</p>
              </div>
            </Reveal>
            <Reveal>
              <TestResultMini />
            </Reveal>
            <p className="mt-5 text-sm text-ink-muted">
              One of {DECIDE_TOOLS.length} everyday decisions.{" "}
              <a href={decideHref()} className="inline-flex min-h-11 items-center font-medium text-clay-ink underline-offset-4 hover:underline">
                See them all
              </a>
            </p>
          </div>
        </section>

        {/* ---------- why it matters: one line, one link ---------- */}
        <section aria-labelledby="story-t" className={`${wrap} py-14 md:py-24`}>
          <div className="grid gap-3 md:grid-cols-12">
            <p className="text-sm font-medium text-clay-ink md:col-span-3 md:pt-2">Why statistics</p>
            <div className="grid gap-2 md:col-span-9">
              <h2 id="story-t" className="font-display text-[clamp(1.5rem,1.2rem+1.4vw,2.2rem)] font-[650] leading-tight" style={{ fontVariationSettings: "'wdth' 86" }}>
                The biggest poll ever taken called the wrong winner.
              </h2>
              <a href="/story/" className="inline-flex min-h-11 items-center gap-2 self-start font-medium text-clay-ink underline-offset-4 hover:underline">
                Read 14 true stories like it <ArrowRight className="size-4" aria-hidden />
              </a>
            </div>
          </div>
        </section>

        {/* ---------- wide screens only, Fun mode: four games ---------- */}
        <section aria-label="Games" className={`fun-only ${wrap} hidden pb-24 lg:block`}>
          <SectionHead kicker="Play" title={<>{GAMES.length} games.<br />Each hides a real idea.</>} />
          <ol className="grid grid-cols-4 gap-3">
            {GAMES.filter((g) => ["monty-hall", "election", "house-edge", "long-run"].includes(g.slug)).map((g, i) => (
              <Reveal as="li" key={g.slug} delay={i * 0.05}>
                <a href={playHref(g.slug)} className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-line transition-colors hover:border-ink">
                  <span className="block bg-sand px-8 py-6 transition-colors group-hover:bg-sand-2">
                    <GameArt slug={g.slug} />
                  </span>
                  <span className="flex items-center justify-between gap-2 p-5 font-display text-xl font-[650]">
                    {g.name}
                    <ArrowRight className="size-4 shrink-0 text-ink-muted transition-transform group-hover:translate-x-1 group-hover:text-ink" />
                  </span>
                </a>
              </Reveal>
            ))}
          </ol>
        </section>

        {/* ---------- close: one tight band, one button ---------- */}
        <section className={`${wrap} pb-14 md:pb-24`}>
          <Reveal className="grid items-center gap-6 border-t border-ink pt-8 md:grid-cols-12 md:pt-14">
            <div className="flex items-center gap-5 md:col-span-7">
              <MarkBuild className="size-14 shrink-0 md:size-20" />
              <div className="space-y-1.5">
                <h2
                  className="font-display text-[clamp(2rem,1.4rem+3vw,3.6rem)] font-[680] leading-[0.95] tracking-[-0.02em]"
                  style={{ fontVariationSettings: "'wdth' 80" }}
                >
                  Ten minutes a day.
                </h2>
                <p className="text-ink-muted">Free, with nothing to sign up for.</p>
              </div>
            </div>
            <div className="md:col-span-5 md:flex md:justify-end">
              <a
                href={studyHref("#learn/topics/data")}
                className="inline-flex h-12 items-center gap-2 rounded-full bg-ink px-6 font-medium text-paper transition-colors hover:bg-ink/85"
              >
                Start the first idea, 5 min <ArrowRight className="size-4" aria-hidden />
              </a>
            </div>
          </Reveal>
        </section>
      </main>

      <SiteFooter />
    </Motion>
  );
}
