import { GamePlayed } from "@/components/play/game-played";
import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Motion } from "@/components/landing/motion-bits";
import { GAMES, playHref, studyHref, topicLabel } from "@/lib/site-data";
import { JsonLd } from "@/components/json-ld";
import { Fold } from "@/components/study/ui";
import { GAME_SEARCH, SITE_NAME, SITE_URL, abs, breadcrumbList, gameHeading } from "@/lib/seo";
import { SafePart } from "@/components/safe-part";
import { GameArt } from "@/components/play/game-art";

/** Every game page: the game first, then what is going on, then where to learn it. */
export function GameShell({
  slug,
  children,
  explain,
}: {
  slug: (typeof GAMES)[number]["slug"];
  children: React.ReactNode;
  explain: React.ReactNode;
}) {
  const i = GAMES.findIndex((g) => g.slug === slug);
  const g = GAMES[i];
  const next = GAMES[(i + 1) % GAMES.length];
  // The words people search for when the game's own name does not say them ("Three doors" is the Monty Hall problem).
  const heading = gameHeading(g.slug, g.name);
  return (
    <Motion>
      <JsonLd
        data={{
          "@graph": [
            {
              "@type": "LearningResource",
              name: heading,
              alternateName: g.name,
              description: GAME_SEARCH[g.slug]?.description ?? g.line,
              url: abs(playHref(g.slug)),
              learningResourceType: "Interactive simulation",
              teaches: topicLabel(g.topic),
              inLanguage: "en",
              isAccessibleForFree: true,
              isPartOf: { "@type": "WebSite", name: SITE_NAME, url: `${SITE_URL}/` },
            },
            breadcrumbList([["Play", playHref()], [heading, playHref(g.slug)]]),
          ],
        }}
      />
      <SiteHeader mode="play" />
      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-page px-gutter pb-section pt-block outline-none">
        <a
          href={playHref()}
          className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink"
        >
          <ArrowLeft className="size-3.5" /> Play <span className="text-ink-muted">·</span> {i + 1} of {GAMES.length}
        </a>
        <header className="group mb-block mt-3 flex max-w-3xl items-center gap-4 sm:gap-5">
          {/* The game's mark plays its move once as the page opens, and again on hover. */}
          <span className="grid size-16 shrink-0 place-items-center rounded-inner bg-sand p-2 sm:size-20 sm:p-2.5">
            <span className="block w-full" style={{ viewTransitionName: `game-${g.slug}` }}>
              <GameArt slug={g.slug} className="ga-play w-full" />
            </span>
          </span>
          <h1
            className="rise font-display text-title font-semibold leading-none"
            style={{ fontVariationSettings: "'wdth' 80" }}
          >
            {heading}
          </h1>
        </header>

        <SafePart name="game">
          <GamePlayed game={slug}>{children}</GamePlayed>
        </SafePart>

        {/* The game is the page. The idea behind it waits one tap away, then one way on. */}
        <Fold title="What’s going on" className="mt-12" bodyClassName="max-w-measure space-y-4 text-base leading-relaxed [&_b]:font-semibold [&_code]:rounded-md [&_code]:bg-sand [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-symbol">
          {explain}
        </Fold>

        <nav aria-label="Next steps" className="mt-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <a
            href={playHref(next.slug)}
            className="btn btn-secondary group max-w-full"
          >
            {/* Truncates rather than pushing the page sideways on a 320px phone. */}
            <span className="truncate">Next game: {next.name}</span>
            <ArrowRight className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </a>
          <a href={studyHref(`#learn/topics/${g.topic}`)} className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-ink underline-offset-4 underline decoration-line-strong hover:decoration-ink">
            <BookOpen className="size-4" aria-hidden /> Learn the idea: {topicLabel(g.topic)}
          </a>
        </nav>
      </main>
      <SiteFooter />
    </Motion>
  );
}
