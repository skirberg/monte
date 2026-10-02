import type { Metadata } from "next";
import { ArrowRight, Target } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { GameArt } from "@/components/play/game-art";
import { Motion, Reveal } from "@/components/landing/motion-bits";
import { GAMES, GAME_GROUPS, playHref, studyHref } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Play",
  alternates: { canonical: "/play/" },
  description: "Nine games, each hiding a real statistics idea: correlation, Monty Hall, randomness, tennis, casinos, betting odds, A/B tests, market history and options.",
};

export default function PlayHub() {
  return (
    <Motion>
      <SiteHeader mode="play" />
      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-[1200px] px-4 pb-20 pt-8 outline-none md:px-6 md:pt-14">
        <header className="mb-10 grid gap-4 md:mb-14 md:grid-cols-12">
          <p className="rise font-mono text-xs uppercase tracking-[0.1em] text-ink-muted md:col-span-3 md:pt-4">
            <span className="text-clay-ink">Play</span> / {GAMES.length} games
          </p>
          <div className="space-y-4 md:col-span-9">
            <h1
              className="rise font-display text-[clamp(2.8rem,1.6rem+5vw,5.6rem)] font-[680] leading-[0.92] tracking-[-0.02em]"
              style={{ fontVariationSettings: "'wdth' 78" }}
            >
              Every game hides
              <span className="block text-ink-muted">a real idea.</span>
            </h1>
          </div>
        </header>

        <p className="focus-only mb-8 flex items-center gap-2 rounded-2xl bg-sand px-5 py-4 text-sm text-ink-muted">
          <Target className="size-4 shrink-0" /> You&rsquo;re in Focus mode, so Play is hidden from the menus. The games still work here.
        </p>

        <div className="space-y-16">
          {GAME_GROUPS.map((grp) => (
            <section key={grp.id} aria-labelledby={`g-${grp.id}`}>
              <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2 border-b border-line pb-3">
                <h2 id={`g-${grp.id}`} className="font-display text-3xl font-[650]" style={{ fontVariationSettings: "'wdth' 85" }}>
                  {grp.name}
                </h2>
                {grp.id === "money" && <p className="text-sm text-ink-muted">For learning, not advice.</p>}
              </div>
              <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
                {GAMES.filter((g) => g.group === grp.id).map((g, i) => (
                  <Reveal as="li" key={g.slug} delay={i * 0.05}>
                    <a
                      href={playHref(g.slug)}
                      className="group grid h-full grid-rows-[auto_1fr] overflow-hidden rounded-[28px] border border-line transition-colors hover:border-ink"
                    >
                      <div className="bg-sand px-10 py-7 transition-colors group-hover:bg-sand-2">
                        <GameArt slug={g.slug} />
                      </div>
                      <div className="flex flex-col gap-3 p-6">
                        <p className="font-mono text-xs text-ink-muted tabular">
                          {String(GAMES.indexOf(g) + 1).padStart(2, "0")} · {g.topicName}
                        </p>
                        <h3 className="flex items-center justify-between gap-3 font-display text-2xl font-[650]" style={{ fontVariationSettings: "'wdth' 88" }}>
                          {g.name}
                          <ArrowRight className="size-5 shrink-0 text-ink-muted transition-transform group-hover:translate-x-1 group-hover:text-ink" />
                        </h3>
                        <p className="text-ink-muted">{g.line}</p>
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
