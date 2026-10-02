import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Motion } from "@/components/landing/motion-bits";
import { GAMES, playHref, studyHref } from "@/lib/site-data";
import { JsonLd } from "@/components/json-ld";
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

        {children}

        <section aria-labelledby="explain-t" className="mt-16 grid gap-6 border-t border-line pt-10 md:grid-cols-12 md:pt-14">
          <h2 id="explain-t" className="font-mono text-xs uppercase tracking-[0.1em] text-ink-muted md:col-span-3 md:pt-1.5">
            What&rsquo;s going on
          </h2>
          <div className="max-w-[62ch] space-y-4 text-[1.05rem] leading-relaxed md:col-span-9 [&_b]:font-semibold [&_code]:rounded-md [&_code]:bg-sand [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.92em]">
            {explain}
          </div>
        </section>

        <nav aria-label="Next steps" className="mt-12 grid gap-3 sm:grid-cols-2">
          <a
            href={studyHref(`#learn/topics/${g.topic}`)}
            className="group flex min-h-20 items-center justify-between gap-4 rounded-2xl bg-sand px-6 py-5 transition-colors hover:bg-sand-2"
          >
            <span>
              <span className="block font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted">Learn the idea</span>
              <span className="font-display text-xl font-[650]">{g.topicName}</span>
            </span>
            <BookOpen className="size-5 text-ink-muted transition-colors group-hover:text-ink" />
          </a>
          <a
            href={playHref(next.slug)}
            className="group flex min-h-20 items-center justify-between gap-4 rounded-2xl border border-line px-6 py-5 transition-colors hover:border-ink"
          >
            <span>
              <span className="block font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted">Next game</span>
              <span className="font-display text-xl font-[650]">{next.name}</span>
            </span>
            <ArrowRight className="size-5 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-ink" />
          </a>
        </nav>
      </main>
      <SiteFooter />
    </Motion>
  );
}
