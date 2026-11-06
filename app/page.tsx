import { ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { HeroBoard } from "@/components/landing/hero-board";
import { TheDraw } from "@/components/landing/the-draw";
import { GameArt } from "@/components/play/game-art";
import { TestResultMini } from "@/components/landing/test-result-mini";
import { Shuffle } from "@/components/landing/shuffle";
import { MarkBuild, Motion, Reveal } from "@/components/landing/motion-bits";
import type { Metadata } from "next";
import { DECIDE_TOOLS, GAMES, TOPICS, decideHref, playHref, studyHref } from "@/lib/site-data";
import { JsonLd } from "@/components/json-ld";
import { SITE_NAME, SITE_URL } from "@/lib/seo";
import { study } from "@/lib/study/routes";
import { Section, grid } from "@/components/layout/section";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const h2 = "font-display text-headline font-semibold leading-none";
const link = "inline-flex min-h-11 items-center gap-2 font-medium text-clay-ink underline-offset-4 hover:underline";
const primary = "inline-flex h-12 items-center gap-2 rounded-full bg-ink px-6 font-medium text-paper transition-colors hover:bg-ink/85";

function SectionHead({ title, id }: { title: React.ReactNode; id?: string }) {
  return (
    <Reveal className="mb-block">
      <h2 id={id} className={h2} style={{ fontVariationSettings: "'wdth' 84" }}>
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
        {/* Wireframe and rules: DESIGN.md, "Layout". Spacing comes only from the layout tokens. */}

        {/* hero, told in order: drop the grains, the board, the shape appears, then start */}
        <Section top="block" inner={`${grid} gap-y-block lg:items-center`}>
          <div className="rise col-span-4 md:col-span-12 lg:col-span-6">
            <h1 className="font-display text-display font-semibold leading-none" style={{ fontVariationSettings: "'wdth' 78" }}>
              Drop enough grains. The shape appears.
            </h1>
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2">
              <a href={studyHref("#learn/topics/data")} className={primary}>
                Start the first idea, 5 min <ArrowRight className="size-4" aria-hidden />
              </a>
              <a href={study.drillTopic(TOPICS[0].id, 5, true)} className={link}>
                or try 5 questions, no timer
              </a>
            </div>
            <p className="mt-6 text-lg text-ink-muted">Statistics, one idea at a time.</p>
          </div>

          <div className="rise col-span-4 md:col-span-12 lg:col-span-6 lg:col-start-7" style={{ animationDelay: "100ms" }}>
            <figure className="rounded-[32px] bg-sand p-3 sm:p-5">
              <HeroBoard className="mx-auto w-full max-w-[560px]" />
            </figure>
          </div>
        </Section>

        {/* the front door: find the grain */}
        <Section aria-labelledby="shuffle-t">
          <SectionHead id="shuffle-t" title="Find the grain." />
          <Shuffle />
        </Section>

        {/* wide screens only: the fourteen topics at a glance */}
        <Section aria-label="All fourteen topics" className="hidden lg:block">
          <SectionHead title={<>Fourteen topics.<br />Master each one.</>} />
          <TheDraw />
        </Section>

        {/* one decision, live, on its own ground */}
        <Section aria-labelledby="test-t" tone="sand" className="mt-section">
          <Reveal className="mb-block grid gap-3">
            <h2 id="test-t" className={h2} style={{ fontVariationSettings: "'wdth' 84" }}>
              Is this test result real?
            </h2>
            <p className="max-w-[52ch] text-lg text-ink-muted">Drag the sliders. How common the thing is decides what a yes means.</p>
          </Reveal>
          <Reveal>
            <TestResultMini />
          </Reveal>
          <p className="mt-6 text-sm text-ink-muted">
            One of {DECIDE_TOOLS.length} everyday decisions.{" "}
            <a href={decideHref()} className={link}>
              See them all
            </a>
          </p>
        </Section>

        {/* why it matters: one line, one link */}
        <Section aria-labelledby="story-t" inner={`${grid} gap-y-6 lg:items-end`}>
          <h2 id="story-t" className={`${h2} col-span-4 md:col-span-12 lg:col-span-8`} style={{ fontVariationSettings: "'wdth' 84" }}>
            The biggest poll ever taken called the wrong winner.
          </h2>
          <div className="col-span-4 md:col-span-12 lg:col-span-4">
            <p className="text-lg text-ink-muted">1936: 2.4 million answers, and the wrong people asked. Size never fixes who you ask.</p>
            <a href="/story/" className={`${link} mt-3`}>
              Read 14 true stories like it <ArrowRight className="size-4" aria-hidden />
            </a>
          </div>
        </Section>

        {/* wide screens only, Fun mode: four games */}
        <Section aria-label="Games" className="fun-only hidden lg:block">
          <SectionHead title={<>{GAMES.length} games.<br />Each hides a real idea.</>} />
          <ol className="grid grid-cols-4 gap-gutter">
            {GAMES.filter((g) => ["monty-hall", "election", "house-edge", "long-run"].includes(g.slug)).map((g, i) => (
              <Reveal as="li" key={g.slug} delay={i * 0.05}>
                <a href={playHref(g.slug)} className="group flex h-full flex-col overflow-hidden rounded-[24px] bg-sand transition-colors hover:bg-sand-2">
                  <span className="block px-8 py-6">
                    <GameArt slug={g.slug} />
                  </span>
                  <span className="flex items-center justify-between gap-2 p-5 font-display text-xl font-semibold">
                    {g.name}
                    <ArrowRight className="size-4 shrink-0 text-ink-muted transition-transform group-hover:translate-x-1 group-hover:text-ink" />
                  </span>
                </a>
              </Reveal>
            ))}
          </ol>
        </Section>

        {/* close: one band, one button */}
        <Section last>
          <Reveal className={`${grid} items-center gap-y-6 border-t border-ink pt-block`}>
            <div className="col-span-4 flex items-center gap-5 md:col-span-7">
              <MarkBuild className="size-14 shrink-0 md:size-20" />
              <div className="space-y-1.5">
                <h2 className="font-display text-headline font-semibold leading-none" style={{ fontVariationSettings: "'wdth' 80" }}>
                  Ten minutes a day.
                </h2>
                <p className="text-ink-muted">Free, with nothing to sign up for.</p>
              </div>
            </div>
            <div className="col-span-4 md:col-span-5 md:flex md:justify-end">
              <a href={studyHref("#learn/topics/data")} className={primary}>
                Start the first idea, 5 min <ArrowRight className="size-4" aria-hidden />
              </a>
            </div>
          </Reveal>
        </Section>
      </main>

      <SiteFooter />
    </Motion>
  );
}
