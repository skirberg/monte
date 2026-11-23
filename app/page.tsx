import { ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { HeroBoard } from "@/components/landing/hero-board";
import { TheDraw } from "@/components/landing/the-draw";
import { GameArt } from "@/components/play/game-art";
import { DrawIt } from "@/components/landing/draw-it";
import { ShuffleGame } from "@/components/play/shuffle-game";
import { TodayRow } from "@/components/landing/today-row";
import { Motion, Reveal } from "@/components/landing/motion-bits";
import type { Metadata } from "next";
import { GAMES, TOPICS, playHref, studyHref } from "@/lib/site-data";
import { JsonLd } from "@/components/json-ld";
import { SITE_NAME, SITE_URL, pageAlternates } from "@/lib/seo";
import { study } from "@/lib/study/routes";
import { Section, grid } from "@/components/layout/section";

export const metadata: Metadata = { alternates: pageAlternates("/") };

const h2 = "font-display text-headline font-semibold leading-none";
const link = "inline-flex min-h-11 items-center gap-2 font-medium text-ink underline-offset-4 underline decoration-line-strong hover:decoration-ink";
const primary = "btn btn-primary";

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
      {/* What it is to a search engine or an assistant: a free learning app that runs in the browser. */}
      <JsonLd
        data={{
          "@type": "WebApplication",
          name: SITE_NAME,
          url: `${SITE_URL}/`,
          applicationCategory: "EducationalApplication",
          operatingSystem: "Any",
          isAccessibleForFree: true,
          offers: { "@type": "Offer", price: 0, priceCurrency: "USD" },
          about: "Statistics",
          creator: { "@type": "Person", name: "Sami Kirberg", url: "https://github.com/skirberg" },
        }}
      />
      <SiteHeader mode="landing" />
      <main id="main" tabIndex={-1} className="pb-section outline-none">
        {/* Wireframe and rules: DESIGN.md, "Layout". Spacing comes only from the layout tokens. */}

        {/* hero, told in order: drop the grains, the board, the shape appears; then today's two dailies, then start.
            Phones read it in that order (DESIGN.md, "Home wireframe"); wide screens put the board on the right and
            the words, the start button and today's dailies on the left. */}
        <Section top="block" inner={`${grid} gap-y-6 lg:grid-rows-[1fr_auto_auto_auto_1fr] lg:gap-y-0`}>
          <div className="rise col-span-4 md:col-span-12 lg:col-span-6 lg:row-start-2">
            <h1 className="font-display text-display font-semibold leading-none" style={{ fontVariationSettings: "'wdth' 78" }}>
              Drop enough grains. The shape appears.
            </h1>
          </div>

          <div className="rise col-span-4 md:col-span-12 lg:col-span-6 lg:col-start-7 lg:row-span-5 lg:row-start-1 lg:self-center" style={{ animationDelay: "100ms" }}>
            <figure className="rounded-stage bg-sand p-3 sm:p-5">
              <HeroBoard className="mx-auto w-full max-w-[560px] md:max-w-[480px] lg:max-w-[560px]" />
            </figure>
          </div>

          <TodayRow className="col-span-4 md:col-span-12 lg:col-span-6 lg:col-start-1 lg:row-start-4 lg:mt-12" />

          <div className="col-span-4 flex flex-wrap items-center gap-x-5 gap-y-2 md:col-span-12 lg:col-span-6 lg:col-start-1 lg:row-start-3 lg:mt-8">
            <a href={studyHref("#learn/topics/data")} className={primary}>
              Start the first idea, 4 min <ArrowRight className="size-4" aria-hidden />
            </a>
            <a href={study.drillTopic(TOPICS[0].id, 5, true)} className={link}>
              or try 5 questions, no timer
            </a>
          </div>
        </Section>

        {/* today's Shuffle: find the grain, one question a day */}
        <Section id="shuffle" aria-labelledby="shuffle-t" className="scroll-mt-16">
          <SectionHead id="shuffle-t" title="Find the grain" />
          <ShuffleGame />
        </Section>

        {/* wide screens only: the fourteen topics at a glance */}
        <Section aria-label="All fourteen topics" className="hidden lg:block">
          <SectionHead title="Fourteen topics" />
          <TheDraw />
        </Section>

        {/* a real number with its ending hidden: draw it, then see it */}
        <Section id="chart" aria-labelledby="next-t" tone="sand" className="mt-section scroll-mt-16">
          <Reveal className="mb-block">
            <h2 id="next-t" className={h2} style={{ fontVariationSettings: "'wdth' 84" }}>
              What happens next?
            </h2>
          </Reveal>
          <DrawIt />
        </Section>

        {/* why it matters: one line, one link */}
        <Section aria-labelledby="story-t" inner={`${grid} gap-y-6 lg:items-end`}>
          <h2 id="story-t" className={`${h2} col-span-4 md:col-span-12 lg:col-span-8`} style={{ fontVariationSettings: "'wdth' 84" }}>
            The biggest poll ever taken called the wrong winner.
          </h2>
          <div className="col-span-4 md:col-span-12 lg:col-span-4">
            <a href="/story/" className={link}>
              Read 14 true stories like it <ArrowRight className="size-4" aria-hidden />
            </a>
          </div>
        </Section>

        {/* wide screens only, Fun mode: four games */}
        <Section aria-label="Games" className="fun-only hidden lg:block">
          <SectionHead title="Games" />
          <ol className="grid grid-cols-4 gap-gutter">
            {GAMES.filter((g) => ["monty-hall", "election", "house-edge", "long-run"].includes(g.slug)).map((g, i) => (
              <Reveal as="li" key={g.slug} delay={i * 0.05}>
                <a href={playHref(g.slug)} className="group flex h-full flex-col overflow-hidden rounded-card bg-sand transition-colors hover:bg-sand-2">
                  <span className="block px-8 py-6">
                    <span className="block" data-vt-name={`game-${g.slug}`}>
                      <GameArt slug={g.slug} />
                    </span>
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

      </main>

      <SiteFooter />
    </Motion>
  );
}
