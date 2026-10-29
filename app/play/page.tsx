import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { ArrowRight, Target } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { GameArt } from "@/components/play/game-art";
import { Motion, Reveal } from "@/components/landing/motion-bits";
import { GAMES, GAME_GROUPS, playHref, studyHref } from "@/lib/site-data";

export const metadata: Metadata = pageMeta("/play/", "Play", "Ten games, each hiding a real statistics idea: correlation, Monty Hall, randomness, tennis, casinos, betting odds, A/B tests, market history, options and election polls.");

export default function PlayHub() {
  return (
    <Motion>
      <SiteHeader mode="play" />
      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-[1200px] px-4 pb-20 pt-8 outline-none md:px-6 md:pt-14">
        <header className="mb-10 grid gap-4 md:mb-14 md:grid-cols-12">
          <p className="rise text-sm font-medium text-clay-ink md:col-span-3 md:pt-4">{GAMES.length} games</p>
          <div className="space-y-4 md:col-span-9">
            <h1
              className="rise font-display text-[clamp(2.8rem,1.6rem+5vw,5.6rem)] font-[680] leading-[0.92] tracking-[-0.02em]"
              style={{ fontVariationSettings: "'wdth' 78" }}
            >
              Every game hides
              <span className="block">a real idea.</span>
            </h1>
          </div>
        </header>

        <p className="focus-only mb-8 flex items-center gap-2 rounded-2xl bg-sand px-5 py-4 text-sm text-ink-muted">
          <Target className="size-4 shrink-0" /> You&rsquo;re in Focus mode, so Play is hidden from the menus. The games still work here.
        </p>

        <div className="space-y-10 md:space-y-16">
          {GAME_GROUPS.map((grp) => (
            <section key={grp.id} aria-labelledby={`g-${grp.id}`}>
              <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2 border-b border-line pb-3">
                <h2 id={`g-${grp.id}`} className="font-display text-3xl font-[650]" style={{ fontVariationSettings: "'wdth' 85" }}>
                  {grp.name}
                </h2>
                {grp.id === "money" && <p className="text-sm text-ink-muted">For learning, not advice.</p>}
              </div>
              <ol className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-6">
                {GAMES.filter((g) => g.group === grp.id).map((g, i) => (
                  <Reveal as="li" key={g.slug} delay={i * 0.05}>
                    <a
                      href={playHref(g.slug)}
                      className="group grid h-full grid-cols-[5.5rem_1fr] overflow-hidden rounded-[24px] border border-line transition-colors hover:border-ink sm:grid-cols-1 sm:grid-rows-[auto_1fr] sm:rounded-[28px]"
                    >
                      <div className="grid place-items-center bg-sand p-3 transition-colors group-hover:bg-sand-2 sm:px-10 sm:py-7">
                        <GameArt slug={g.slug} />
                      </div>
                      <div className="flex flex-col justify-center gap-1 p-4 sm:justify-start sm:gap-3 sm:p-6">
                        <p className="text-sm text-ink-muted">{g.topicName}</p>
                        <h3 className="flex items-center justify-between gap-3 font-display text-xl font-[650] sm:text-2xl" style={{ fontVariationSettings: "'wdth' 88" }}>
                          {g.name}
                          <ArrowRight className="size-5 shrink-0 text-ink-muted transition-transform group-hover:translate-x-1 group-hover:text-ink" />
                        </h3>
                        <p className="hidden text-ink-muted sm:block">{g.line}</p>
                      </div>
                    </a>
                  </Reveal>
                ))}
              </ol>
            </section>
          ))}
        </div>

        <p className="mt-12 text-ink-muted">
          Ready for the real thing?{" "}
          <a href={studyHref("#practice/drill/start")} className="font-medium text-clay-ink underline-offset-4 hover:underline">
            Take a 10-question drill
          </a>
          .
        </p>
      </main>
      <SiteFooter />
    </Motion>
  );
}
