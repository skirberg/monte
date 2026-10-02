import { ArrowRight, ArrowUpRight, Printer } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { GameArt } from "@/components/play/game-art";
import { HeroFilm } from "@/components/landing/hero-film";
import { TheDraw } from "@/components/landing/the-draw";
import { CutoffLab } from "@/components/landing/cutoff-lab";
import { LoopSteps, MarkBuild, Motion, Reveal } from "@/components/landing/motion-bits";
import type { Metadata } from "next";
import { GAMES, SOLVERS, TOOLS, playHref, studyHref } from "@/lib/site-data";
import { JsonLd } from "@/components/json-ld";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

const wrap = "mx-auto w-full max-w-[1200px] px-4 md:px-6";

export const metadata: Metadata = { alternates: { canonical: "/" } };

function SectionHead({ n, kicker, title, children }: { n: string; kicker: string; title: React.ReactNode; children?: React.ReactNode }) {
  return (
    <Reveal className="mb-10 grid gap-4 md:mb-14 md:grid-cols-12">
      <p className="font-mono text-xs uppercase tracking-[0.1em] text-ink-muted md:col-span-3 md:pt-3">
        <span className="text-clay-ink">{n}</span> / {kicker}
      </p>
      <div className="space-y-4 md:col-span-9">
        <h2
          className="font-display text-[clamp(2.2rem,1.4rem+3.2vw,4rem)] font-[650] leading-[0.98] tracking-[-0.035em]"
          style={{ fontVariationSettings: "'wdth' 84" }}
        >
          {title}
        </h2>
        {children && <div className="max-w-[60ch] text-lg text-ink-muted">{children}</div>}
      </div>
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
          description: "Business statistics, one idea at a time: thirteen topics with labs, timed drills, solvers that show the work, and games.",
        }}
      />
      <SiteHeader mode="landing" />
      <main id="main" tabIndex={-1} className="outline-none">
        {/* ---------- hero ---------- */}
        <section className={`${wrap} grid gap-10 pb-14 pt-8 md:pb-20 md:pt-16 lg:grid-cols-12 lg:gap-8 lg:pb-28`}>
          <div className="flex flex-col justify-center lg:col-span-6">
            <div className="rise">
              <h1
                className="font-display text-[clamp(3.1rem,1.6rem+6vw,6.4rem)] font-[680] leading-[0.9] tracking-[-0.045em]"
                style={{ fontVariationSettings: "'wdth' 78" }}
              >
                Drop enough grains.
                <span className="block text-ink-muted">The shape appears.</span>
              </h1>
            </div>
            <div className="rise" style={{ animationDelay: "80ms" }}>
              <p className="mt-6 text-lg text-ink-muted md:text-xl">Statistics, one idea at a time.</p>
            </div>
            <div className="rise mt-9 flex flex-wrap gap-3" style={{ animationDelay: "140ms" }}>
              <a
                href={studyHref("#learn/topics/data")}
                className="inline-flex h-12 items-center gap-2 rounded-full bg-ink px-6 font-medium text-paper transition-colors hover:bg-ink/85"
              >
                Start with topic 1 <ArrowRight className="size-4" />
              </a>
              <a
                href={studyHref("#practice/drill/start")}
                className="inline-flex h-12 items-center rounded-full border border-line-strong px-6 font-medium transition-colors hover:border-ink hover:bg-sand"
              >
                Take a 10-question drill
              </a>
            </div>
          </div>

          <div className="rise lg:col-span-6" style={{ animationDelay: "100ms" }}>
            <figure className="rounded-[32px] bg-sand p-3 sm:p-5">
              <HeroFilm className="mx-auto w-full max-w-[560px]" />
            </figure>
          </div>
        </section>

        {/* ---------- the draw ---------- */}
        <section id="draw" className={`${wrap} scroll-mt-24 py-16 md:py-28`}>
          <SectionHead n="01" kicker="The draw" title={<>Thirteen matches.<br />Win each one.</>} />
          <TheDraw />
        </section>

        {/* ---------- lab ---------- */}
        <section className="border-y border-line bg-sand/60 py-16 md:py-28">
          <div className={wrap}>
            <SectionHead n="02" kicker="Labs" title="Drag the cutoff." />
            <Reveal>
              <CutoffLab />
            </Reveal>
          </div>
        </section>

        {/* ---------- the loop ---------- */}
        <section className={`${wrap} py-16 md:py-28`}>
          <SectionHead n="03" kicker="The loop" title="Learn. Practice. Check." />
          <LoopSteps />
        </section>

        {/* ---------- solve + tools ---------- */}
        <section className="bg-ink py-16 text-paper md:py-28 [--line:color-mix(in_oklch,var(--paper)_18%,transparent)]">
          <div className={wrap}>
            <Reveal className="mb-12 grid gap-4 md:grid-cols-12">
              <p className="font-mono text-xs uppercase tracking-[0.1em] text-paper/60 md:col-span-3 md:pt-3">
                <span className="text-paper">04</span> / When you&rsquo;re stuck
              </p>
              <div className="space-y-4 md:col-span-9">
                <h2
                  className="font-display text-[clamp(2.2rem,1.4rem+3.2vw,4rem)] font-[650] leading-[0.98] tracking-[-0.035em]"
                  style={{ fontVariationSettings: "'wdth' 84" }}
                >
                  Type in the numbers.
                  <br />
                  Get the work.
                </h2>
              </div>
            </Reveal>
            <Reveal className="flex flex-wrap gap-2 md:pl-[25%]">
              {SOLVERS.map((s) => (
                <a
                  key={s.id}
                  href={studyHref(`#solve/${s.id}`)}
                  className="inline-flex h-11 items-center rounded-full border border-paper/25 px-5 text-[0.95rem] transition-colors hover:border-paper hover:bg-paper hover:text-ink"
                >
                  {s.name}
                </a>
              ))}
            </Reveal>

            <div className="mt-20 grid gap-px overflow-hidden rounded-[24px] bg-paper/15 sm:grid-cols-2 lg:grid-cols-5">
              {TOOLS.map((t, i) => (
                <Reveal key={t.id} delay={i * 0.05} className="bg-ink">
                  <a href={studyHref(`#tools/${t.id}`)} className="group flex h-full min-h-28 items-end justify-between gap-3 p-6 font-display text-2xl font-[650] transition-colors hover:bg-paper/5">
                    {t.name}
                    <ArrowUpRight className="size-5 shrink-0 text-paper/40 transition-colors group-hover:text-clay" />
                  </a>
                </Reveal>
              ))}
              <Reveal delay={0.2} className="bg-ink">
                <a href={studyHref("#learn/formulas")} className="group flex h-full min-h-28 items-end justify-between gap-3 p-6 font-display text-2xl font-[650] transition-colors hover:bg-paper/5">
                  Formula sheet
                  <Printer className="size-5 shrink-0 text-paper/40 transition-colors group-hover:text-clay" />
                </a>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ---------- play (fun mode only) ---------- */}
        <section className={`fun-only ${wrap} pt-20 md:pt-28`}>
          <SectionHead n="05" kicker="Play" title={<>{GAMES.length} games.<br />Each hides a real idea.</>} />
          <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {GAMES.filter((g) => ["monty-hall", "fake-coin", "house-edge", "long-run"].includes(g.slug)).map((g, i) => (
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
          <a href={playHref()} className="mt-6 inline-flex min-h-11 items-center gap-2 font-medium text-clay-ink underline-offset-4 hover:underline">
            See all {GAMES.length} games <ArrowRight className="size-4" />
          </a>
        </section>

        {/* ---------- close ---------- */}
        <section className={`${wrap} py-24 md:py-32`}>
          <Reveal className="flex flex-col items-center text-center">
            <MarkBuild className="size-24 md:size-28" />
            <h2
              className="mt-8 font-display text-[clamp(2.4rem,1.4rem+4vw,4.8rem)] font-[680] leading-[0.95] tracking-[-0.04em]"
              style={{ fontVariationSettings: "'wdth' 80" }}
            >
              Ten minutes a day.
            </h2>
            <a
              href={studyHref("#learn/topics/data")}
              className="mt-9 inline-flex h-12 items-center gap-2 rounded-full bg-ink px-7 font-medium text-paper transition-colors hover:bg-ink/85"
            >
              Start studying <ArrowRight className="size-4" />
            </a>
          </Reveal>
        </section>
      </main>

      <SiteFooter />
    </Motion>
  );
}
