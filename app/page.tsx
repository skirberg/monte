import { ArrowRight, ArrowUpRight, BookA, Download, Layers, Printer, Timer } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { GameArt } from "@/components/play/game-art";
import { HeroBoard } from "@/components/landing/hero-board";
import { TheDraw } from "@/components/landing/the-draw";
import { TestResultMini } from "@/components/landing/test-result-mini";
import { CutoffLab } from "@/components/landing/cutoff-lab";
import { LoopSteps, MarkBuild, Motion, Reveal } from "@/components/landing/motion-bits";
import type { Metadata } from "next";
import { DECIDE_TOOLS, GAMES, SOLVERS, TOOLS, decideHref, playHref, studyHref } from "@/lib/site-data";
import { JsonLd } from "@/components/json-ld";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

const wrap = "mx-auto w-full max-w-[1200px] px-4 md:px-6";

export const metadata: Metadata = { alternates: { canonical: "/" } };

/** Three of the fourteen stories on /story/, linked by their anchors there. */
const STORIES = [
  { id: "literary-digest", year: "1936", title: "2.4 million answers, the wrong winner", line: "The biggest poll ever taken called the election for the loser. Size could not fix who it asked." },
  { id: "wald", year: "1943", title: "The planes that didn\u2019t come back", line: "Where do you add armor? Not where the returning bombers were hit." },
  { id: "41-shades", year: "2009", title: "Forty-one shades of blue", line: "A search company tested 41 link colors on real users and let the numbers pick." },
];

function SectionHead({ kicker, title, children }: { n?: string; kicker: string; title: React.ReactNode; children?: React.ReactNode }) {
  return (
    <Reveal className="mb-10 grid gap-4 md:mb-14 md:grid-cols-12">
      <p className="text-sm font-medium text-clay-ink md:col-span-3 md:pt-3">{kicker}</p>
      <div className="space-y-4 md:col-span-9">
        <h2
          className="font-display text-[clamp(2.2rem,1.4rem+3.2vw,4rem)] font-[650] leading-[0.98] tracking-[-0.018em]"
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
          description: "Statistics, one idea at a time, for everyone: fourteen topics with labs, timed drills, solvers that show the work, tools for real decisions, and games.",
        }}
      />
      <SiteHeader mode="landing" />
      <main id="main" tabIndex={-1} className="outline-none">
        {/* ---------- hero ---------- */}
        <section className={`${wrap} grid gap-10 pb-14 pt-8 md:pb-20 md:pt-16 lg:grid-cols-12 lg:gap-8 lg:pb-16`}>
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
              <p className="mt-6 text-lg text-ink-muted md:text-xl">Statistics, one idea at a time.</p>
            </div>
            <div className="rise mt-9 flex flex-wrap gap-3" style={{ animationDelay: "140ms" }}>
              <a
                href={studyHref("#learn/topics/data")}
                className="inline-flex h-12 items-center gap-2 rounded-full bg-ink px-6 font-medium text-paper transition-colors hover:bg-ink/85"
              >
                Start the first idea, 5 min <ArrowRight className="size-4" />
              </a>
              <a
                href={studyHref("#practice/drill/start")}
                className="inline-flex h-12 items-center rounded-full border border-line-strong px-6 font-medium transition-colors hover:border-ink hover:bg-sand"
              >
                Take a 10-question drill
              </a>
            </div>
            {/* Plain inline links: on a phone the arrow wraps with the last word instead of sitting alone at the far right. */}
            <a
              href="/story/"
              className="rise mt-6 block self-start py-2.5 font-medium text-clay-ink underline-offset-4 hover:underline"
              style={{ animationDelay: "180ms" }}
            >
              Never clicked for you? Start with why it{" "}
              <span className="whitespace-nowrap">
                matters <ArrowRight className="inline size-4 align-[-2px]" aria-hidden />
              </span>
            </a>
            <a
              href={decideHref()}
              className="rise block self-start py-2.5 font-medium text-clay-ink underline-offset-4 hover:underline"
              style={{ animationDelay: "220ms" }}
            >
              Facing a real decision? Run the{" "}
              <span className="whitespace-nowrap">
                odds <ArrowRight className="inline size-4 align-[-2px]" aria-hidden />
              </span>
            </a>
          </div>

          <div className="rise lg:col-span-6" style={{ animationDelay: "100ms" }}>
            <figure className="rounded-[32px] bg-sand p-3 sm:p-5">
              <HeroBoard className="mx-auto w-full max-w-[560px]" />
            </figure>
          </div>
        </section>

        {/* ---------- the draw ---------- */}
        <section id="draw" className={`${wrap} scroll-mt-24 py-16 md:py-28`}>
          <SectionHead n="01" kicker="Learn" title={<>Fourteen topics.<br />Master each one.</>} />
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
              <p className="text-sm font-medium text-paper/75 md:col-span-3 md:pt-3">Solve</p>
              <div className="space-y-4 md:col-span-9">
                <h2
                  className="font-display text-[clamp(2.2rem,1.4rem+3.2vw,4rem)] font-[650] leading-[0.98] tracking-[-0.018em]"
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
              <Reveal delay={0.25} className="bg-ink">
                <a href={studyHref("#practice/cards")} className="group flex h-full min-h-28 items-end justify-between gap-3 p-6 font-display text-2xl font-[650] transition-colors hover:bg-paper/5">
                  Flashcards
                  <Layers className="size-5 shrink-0 text-paper/40 transition-colors group-hover:text-clay" />
                </a>
              </Reveal>
              <Reveal delay={0.3} className="bg-ink">
                <a href={studyHref("#learn/terms")} className="group flex h-full min-h-28 items-end justify-between gap-3 p-6 font-display text-2xl font-[650] transition-colors hover:bg-paper/5">
                  Terms
                  <BookA className="size-5 shrink-0 text-paper/40 transition-colors group-hover:text-clay" />
                </a>
              </Reveal>
              <Reveal delay={0.35} className="bg-ink">
                <a href={studyHref("#practice/drill/mock")} className="group flex h-full min-h-28 items-end justify-between gap-3 p-6 font-display text-2xl font-[650] transition-colors hover:bg-paper/5">
                  Mock test
                  <Timer className="size-5 shrink-0 text-paper/40 transition-colors group-hover:text-clay" />
                </a>
              </Reveal>
              <Reveal delay={0.4} className="bg-ink">
                <a href="/downloads/monte-statistics-workbook.xlsx" download className="group flex h-full min-h-28 items-end justify-between gap-3 p-6 font-display text-2xl font-[650] transition-colors hover:bg-paper/5">
                  Free workbook
                  <Download className="size-5 shrink-0 text-paper/40 transition-colors group-hover:text-clay" />
                </a>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ---------- decide ---------- */}
        <section className={`${wrap} py-16 md:py-28`}>
          <SectionHead n="05" kicker="Decide" title={<>Is this test result real?</>}>
            A good test says yes. How common the thing is decides what that yes means. One of {DECIDE_TOOLS.length} everyday decisions, worked out in plain numbers.
          </SectionHead>
          <Reveal>
            <TestResultMini />
          </Reveal>
          <ul className="mt-6 flex flex-wrap gap-2">
            {DECIDE_TOOLS.filter((d) => ["warranty", "abtest", "goal", "staffing"].includes(d.id)).map((d) => (
              <li key={d.id}>
                <a
                  href={decideHref(d.id)}
                  className="inline-flex h-11 items-center rounded-full border border-line-strong px-5 text-[0.95rem] transition-colors hover:border-ink hover:bg-sand"
                >
                  {d.name}
                </a>
              </li>
            ))}
            <li>
              <a href={decideHref()} className="inline-flex h-11 items-center gap-2 px-3 font-medium text-clay-ink underline-offset-4 hover:underline">
                All {DECIDE_TOOLS.length} decisions <ArrowRight className="size-4" aria-hidden />
              </a>
            </li>
          </ul>
        </section>

        {/* ---------- story ---------- */}
        <section className="border-y border-line bg-sand/60 py-16 md:py-28">
          <div className={wrap}>
            <SectionHead n="06" kicker="Why statistics" title={<>Why statistics matters,<br />in 14 true stories.</>}>
              From a haberdasher counting the dead in 1662 to forty-one shades of blue in 2009. Each story ends on the idea it gave us, and the topic that teaches it.
            </SectionHead>
            <ol className="grid gap-3 md:grid-cols-3">
              {STORIES.map((st, i) => (
                <Reveal as="li" key={st.id} delay={i * 0.05}>
                  <a
                    href={`/story/#s-${st.id}`}
                    className="group flex h-full flex-col gap-4 rounded-[24px] border border-line bg-paper p-6 transition-colors hover:border-ink"
                  >
                    <span className="font-mono text-sm text-clay-ink tabular">{st.year}</span>
                    <span className="font-display text-2xl font-[650] leading-tight" style={{ fontVariationSettings: "'wdth' 88" }}>
                      {st.title}
                    </span>
                    <span className="mt-auto text-ink-muted">{st.line}</span>
                  </a>
                </Reveal>
              ))}
            </ol>
            <a
              href="/story/"
              className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-ink px-6 font-medium text-paper transition-colors hover:bg-ink/85"
            >
              Read the 14 stories <ArrowRight className="size-4" aria-hidden />
            </a>
          </div>
        </section>

        {/* ---------- play (fun mode only) ---------- */}
        <section className={`fun-only ${wrap} pt-20 md:pt-28`}>
          <SectionHead n="07" kicker="Play" title={<>{GAMES.length} games.<br />Each hides a real idea.</>} />
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

        {/* ---------- close: one tight band, not a near-empty screen ---------- */}
        <section className={`${wrap} py-16 md:py-24`}>
          <Reveal className="grid items-center gap-8 border-t border-ink pt-10 md:grid-cols-12 md:pt-14">
            <div className="flex items-center gap-5 md:col-span-7">
              <MarkBuild className="size-16 shrink-0 md:size-20" />
              <div className="space-y-2">
                <h2
                  className="font-display text-[clamp(2.2rem,1.4rem+3vw,3.6rem)] font-[680] leading-[0.95] tracking-[-0.02em]"
                  style={{ fontVariationSettings: "'wdth' 80" }}
                >
                  Ten minutes a day.
                </h2>
                <p className="text-ink-muted">One idea, one drill, fresh numbers. Free, with nothing to sign up for.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 md:col-span-5 md:justify-end">
              <a
                href={studyHref("#learn/topics/data")}
                className="inline-flex h-12 items-center gap-2 rounded-full bg-ink px-6 font-medium text-paper transition-colors hover:bg-ink/85"
              >
                Start the first idea, 5 min <ArrowRight className="size-4" aria-hidden />
              </a>
              <a
                href={studyHref("#practice/drill/start")}
                className="inline-flex h-12 items-center rounded-full border border-line-strong px-6 font-medium transition-colors hover:border-ink hover:bg-sand"
              >
                Take a 10-question drill
              </a>
            </div>
          </Reveal>
        </section>
      </main>

      <SiteFooter />
    </Motion>
  );
}
