import { GamePlayed } from "@/components/play/game-played";
import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Motion } from "@/components/landing/motion-bits";
import { GAMES, playHref, studyHref } from "@/lib/site-data";
import { JsonLd } from "@/components/json-ld";
import { Fold } from "@/components/study/ui";
import { SITE_NAME, SITE_URL, abs } from "@/lib/seo";

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
  return (
    <Motion>
      <JsonLd
        data={{
          "@type": "LearningResource",
          name: g.name,
          description: g.line,
          url: abs(playHref(g.slug)),
          learningResourceType: "Interactive simulation",
          teaches: g.topicName,
          inLanguage: "en",
          isAccessibleForFree: true,
          isPartOf: { "@type": "WebSite", name: SITE_NAME, url: `${SITE_URL}/` },
        }}
      />
      <SiteHeader mode="play" />
      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-[1200px] px-4 pb-20 pt-6 outline-none md:px-6 md:pt-10">
        <a
          href={playHref()}
          className="inline-flex min-h-11 items-center gap-1.5 font-mono text-xs uppercase tracking-[0.1em] text-ink-muted hover:text-ink"
        >
          <ArrowLeft className="size-3.5" /> Play <span className="text-clay-ink">·</span> {String(i + 1).padStart(2, "0")} of{" "}
          {String(GAMES.length).padStart(2, "0")}
        </a>
        <header className="mb-8 mt-3 max-w-3xl space-y-3 md:mb-12">
          <h1
            className="rise font-display text-[clamp(2.4rem,1.4rem+4vw,4.4rem)] font-[680] leading-[0.95] tracking-[-0.02em]"
            style={{ fontVariationSettings: "'wdth' 80" }}
          >
            {g.name}
          </h1>
          <p className="rise text-lg text-ink-muted md:text-xl" style={{ animationDelay: "80ms" }}>
            {g.line}
          </p>
        </header>

        <GamePlayed game={slug}>{children}</GamePlayed>

        {/* The game is the page. The idea behind it waits one tap away, then one way on. */}
        <Fold title="What’s going on" teaser="The real idea behind the game, in plain words." className="mt-12" bodyClassName="max-w-[62ch] space-y-4 text-[1.05rem] leading-relaxed [&_b]:font-semibold [&_code]:rounded-md [&_code]:bg-sand [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.92em]">
          {explain}
        </Fold>

        <nav aria-label="Next steps" className="mt-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <a
            href={playHref(next.slug)}
            className="group inline-flex min-h-12 items-center gap-2 rounded-full border border-line-strong px-6 font-medium transition-colors hover:border-ink hover:bg-sand"
          >
            Next game: {next.name} <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </a>
          <a href={studyHref(`#learn/topics/${g.topic}`)} className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-clay-ink underline-offset-4 hover:underline">
            <BookOpen className="size-4" aria-hidden /> Learn the idea: {g.topicName}
          </a>
        </nav>
      </main>
      <SiteFooter />
    </Motion>
  );
}
