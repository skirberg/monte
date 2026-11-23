import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { Target } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { GameArt } from "@/components/play/game-art";
import { Motion, Reveal } from "@/components/landing/motion-bits";
import { DAILIES, GAMES, GAME_GROUPS, playHref } from "@/lib/site-data";

export const metadata: Metadata = pageMeta("/play/", "Statistics and probability games", "Free statistics and probability games: the Monty Hall problem, guess the correlation, a roulette simulator, a fake coin test, betting odds, A/B test peeking, the S&P 500, option pricing and election polls.");

/** A game's card: its moving mark on sand, its name, and its one line from a tablet up. Opening the game carries the mark
 *  from the card into the game's header (a view transition, named as it starts: lib/view-transition-script.ts). */
function GameCard({ href, slug, name, line }: { href: string; slug: string; name: string; line: string }) {
  return (
    <a
      href={href}
      className="group grid h-full grid-cols-[5.5rem_1fr] overflow-hidden rounded-card border border-line transition-colors hover:border-ink sm:grid-cols-1 sm:grid-rows-[auto_1fr] sm:rounded-stage"
    >
      <div className="grid place-items-center bg-sand p-3 transition-colors group-hover:bg-sand-2 sm:px-10 sm:py-7">
        <span className="block w-full" data-vt-name={`game-${slug}`}>
          <GameArt slug={slug} />
        </span>
      </div>
      <div className="flex flex-col justify-center gap-1 p-4 sm:justify-start sm:gap-3 sm:p-6">
        <h3 className="font-display text-xl font-semibold underline-offset-4 group-hover:underline sm:text-2xl" style={{ fontVariationSettings: "'wdth' 88" }}>
          {name}
        </h3>
        <p className="hidden text-ink-muted sm:block">{line}</p>
      </div>
    </a>
  );
}

export default function PlayHub() {
  return (
    <Motion>
      <SiteHeader mode="play" />
      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-page px-gutter pb-section pt-block outline-none">
        <header className="mb-block">
          <div className="space-y-4">
            <h1
              className="rise font-display text-display font-semibold leading-none"
              style={{ fontVariationSettings: "'wdth' 78" }}
            >
              Every game hides
              <span className="block">a real idea.</span>
            </h1>
          </div>
        </header>

        <p className="focus-only mb-8 flex items-center gap-2 rounded-card bg-sand px-5 py-4 text-sm text-ink-muted">
          <Target className="size-4 shrink-0" /> You&rsquo;re in Focus mode, so Play is hidden from the menus. The games still work here.
        </p>

        <div className="space-y-10 md:space-y-16">
          <section aria-labelledby="g-daily">
            <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2 border-b border-line pb-3">
              <h2 id="g-daily" className="font-display text-3xl font-semibold" style={{ fontVariationSettings: "'wdth' 85" }}>
                Every day
              </h2>
            </div>
            <ol className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-6">
              {DAILIES.map((g, i) => (
                <Reveal as="li" key={g.slug} delay={i * 0.05}>
                  <GameCard href={g.href} slug={g.slug} name={g.name} line={g.line} />
                </Reveal>
              ))}
            </ol>
          </section>
          {GAME_GROUPS.map((grp) => (
            <section key={grp.id} aria-labelledby={`g-${grp.id}`}>
              <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2 border-b border-line pb-3">
                <h2 id={`g-${grp.id}`} className="font-display text-3xl font-semibold" style={{ fontVariationSettings: "'wdth' 85" }}>
                  {grp.name}
                </h2>
                {grp.id === "money" && <p className="text-sm text-ink-muted">For learning, not advice.</p>}
              </div>
              <ol className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-6">
                {GAMES.filter((g) => g.group === grp.id).map((g, i) => (
                  <Reveal as="li" key={g.slug} delay={i * 0.05}>
                    <GameCard href={playHref(g.slug)} slug={g.slug} name={g.name} line={g.line} />
                  </Reveal>
                ))}
              </ol>
            </section>
          ))}
        </div>
      </main>
      <SiteFooter />
    </Motion>
  );
}
