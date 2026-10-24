import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Motion } from "@/components/landing/motion-bits";
import { DECIDE_TOOLS, GAMES, SOLVERS, TOPICS, decideHref, playHref, studyHref } from "@/lib/site-data";
import { TOOLS as DECISIONS, toolHref } from "@/lib/decide/tools";
import { DATA } from "@/lib/study/data";
import { study } from "@/lib/study/routes";

export const metadata: Metadata = {
  title: "How it's built",
  description: "The stack, the checks, the data sources and the math behind every lesson, game and decision on Monte.",
  alternates: { canonical: "/built/" },
};

/** The labs in components/study/labs.tsx (the LabId union in lib/study/data.ts). */
const LAB_COUNT = 13;

type Row = { name: string; href?: string; what: string };

const SITE: Row[] = [
  { name: "Learn", href: studyHref("#learn"), what: `${TOPICS.length} topics, ${LAB_COUNT} labs you can drag, ${DATA.terms.length} terms, a formula sheet, and guides for Excel, R, Python, Power Query and SQL.` },
  { name: "Practice", href: study.drill, what: "Drills with fresh numbers every time, a mock test, Due today for misses, flashcards and quick math." },
  { name: "Monte Daily", href: study.drillStart("daily"), what: "The same five questions for everyone each day, with a score grid to share." },
  { name: "Solve", href: studyHref("#solve"), what: `${SOLVERS.length} solvers that show every step.` },
  { name: "Decide", href: decideHref(), what: `${DECIDE_TOOLS.length} everyday decisions, one page each, in four groups: Choose, Money and risk, Evidence, Plan.` },
  { name: "Play", href: playHref(), what: `${GAMES.length} games, each hiding one statistics idea.` },
  { name: "Why statistics", href: "/story/", what: "Fourteen true stories, each ending with the idea it teaches." },
];

const PROGRESS = [
  "XP for learning (a right answer, a finished drill, a card you knew), never for page views.",
  "One streak for the whole site, with a freeze earned every 7 days.",
  "Chips, a play bankroll the games pay out from. Studying earns more.",
  "Badges, and a backup code to move your progress to another device.",
];

const STACK: [string, string, string][] = [
  ["Next.js 16", "https://nextjs.org", "Static export: the whole site is plain files, no server."],
  ["React 19 and TypeScript", "https://react.dev", "Every page is typed, including the study app, ported from its original JavaScript engine."],
  ["Tailwind CSS 4", "https://tailwindcss.com", "Styling from the color and type tokens in DESIGN.md."],
  ["shadcn/ui on Base UI", "https://ui.shadcn.com", "Accessible menus and dialogs, restyled for this brand."],
  ["Motion", "https://motion.dev", "The curve over the hero pile, the mark that draws itself, reveals as you scroll."],
  ["Canvas", "https://developer.mozilla.org/docs/Web/API/Canvas_API", "The hero Galton board: tap to drop a grain, hold to pour. Drawn only while a grain moves."],
  ["Vitest", "https://vitest.dev", "Unit tests for the math."],
  ["Lucide", "https://lucide.dev", "Icons."],
  ["Vercel", "https://vercel.com", "Hosting and cookie-free analytics."],
];

const FONTS: [string, string][] = [
  ["Bricolage Grotesque", "Headlines. Optical size and width axes."],
  ["Geologica", "Body text. Includes Greek, so σ and μ match the sentence around them."],
  ["Azeret Mono", "Numbers, timers and scores. Its zero is plain, so 0 never reads as 8."],
];

const CHECKS: [string, string][] = [
  ["Unit tests", "Vitest checks the study formulas, drill grading, solvers, decision math, streaks, chips, backup codes and game scoring."],
  ["Accessibility", "axe on every page at 4 widths (375 to 1440 px), light and dark. Also fails on sideways scrolling."],
  ["Contrast", "Every color pair in the design, measured for WCAG AA in both themes."],
  ["Smoke", "Headless Chrome on the built site: page errors, phone overflow, colliding headlines, share links."],
];

const MATH: Record<string, string> = {
  correlation: "Pearson r of the exact 60 points drawn. Scored by absolute miss.",
  "monty-hall": "Played honestly: the host knows the car and opens a goat. Rates come from simulation, not a hard-coded 2/3.",
  "fake-coin": "Your 50 flips against 20,000 simulated fair sequences on runs, longest streak and heads. A truly random sequence is flagged about 3% of the time.",
  serve: "Hold probability in closed form, sets by exact recursion with a tiebreak at 6–6, checked against a 300,000-set simulation. Players use real 2025 ATP hold rates.",
  "house-edge": "Exact pocket counts: −1/37 on a European wheel, −2/38 on an American one.",
  odds: "Implied probability from American odds and contract prices, the bookmaker's cut, fair odds and expected value per $100.",
  "ab-test": "Pooled two-proportion z-test after every simulated day. With no real difference, daily peeking flags about 24% of tests versus 5% for one look.",
  "long-run": "Arithmetic vs geometric mean on 98 years of real returns, then 2,000 bootstrapped thirty-year futures.",
  options: "Black-Scholes in closed form next to a Monte Carlo price with a 95% band. At 100/100, one year, 5%, σ 20%: $10.45 both ways.",
  election: "Margin of 1.96 √[p̂(1 − p̂)/n]. At a 2-point lead, one poll of 1,000 names the wrong leader 26.4% of the time; averages of 5 and 10 polls, 7.9% and 2.3%.",
};

const SOURCES: [string, string][] = [
  ["Aswath Damodaran, Historical Returns on Stocks, Bonds and Bills, NYU Stern (updated January 5, 2026)", "https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/histretSP.html"],
  ["ATP Tour, 2025 service and return games won leaders (November 2025)", "https://www.atptour.com/en/news/sinner-serve-return-november-2025"],
  ["Polymarket, public market prices", "https://polymarket.com"],
  ["Kalshi, public market prices", "https://kalshi.com"],
  ["Wikipedia, 2026 House generic ballot averages", "https://en.wikipedia.org/wiki/2026_United_States_House_of_Representatives_elections"],
  ["VoteHub, public poll data", "https://votehub.com"],
  ["Monty Hall problem: history and the 1990 Parade column", "https://en.wikipedia.org/wiki/Monty_Hall_problem"],
];

const OPEN: Row[] = [
  { name: "JSON API", href: "/api/v1/index.json", what: "Topics, terms, formulas and sources as static JSON. No key." },
  { name: "llms.txt", href: "/llms.txt", what: "A plain-text map of the site and every topic." },
  { name: "Cheat sheets", href: "/cheatsheets/all-1.png", what: "Phone-sized images: one per topic, plus the full set." },
  { name: "Excel workbook", href: "/downloads/monte-statistics-workbook.xlsx", what: "Free calculators for the main formulas: describe data, normal, intervals, tests, regression and more." },
];

const ACCESS = [
  "WCAG 2.1 AA contrast in light and dark.",
  "Every control works by keyboard and is at least 44 px to tap.",
  "Motion stops when your device asks for reduced motion.",
  "No accounts, no cookies. Your progress stays in this browser.",
  "Vercel Web Analytics counts visits and a few anonymous actions (a drill finished, a game played). It stores nothing on your device.",
];

const link = "inline-flex min-h-11 items-center self-start font-medium underline-offset-4 hover:underline";
const rowGrid = "grid items-center gap-1 py-2 sm:grid-cols-[14rem_1fr] sm:gap-4";

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-4 border-t border-line pt-8 md:grid-cols-12 md:pt-10">
      <h2 className="text-sm font-semibold text-ink md:col-span-3 md:pt-1.5">{title}</h2>
      <div className="space-y-4 md:col-span-9">{children}</div>
    </section>
  );
}

function Rows({ rows, external = false, ordered = false }: { rows: Row[]; external?: boolean; ordered?: boolean }) {
  const items = rows.map(({ name, href, what }) => (
    <li key={name} className={rowGrid}>
      {href ? (
        <a href={href} {...(external ? { target: "_blank", rel: "noreferrer" } : {})} className={link}>
          {name}
        </a>
      ) : (
        <span className="font-medium">{name}</span>
      )}
      <span className="text-ink-muted">{what}</span>
    </li>
  ));
  const cls = "divide-y divide-line border-y border-line";
  return ordered ? <ol className={cls}>{items}</ol> : <ul className={cls}>{items}</ul>;
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="max-w-[62ch] list-disc space-y-1.5 pl-5 marker:text-ink-muted">
      {items.map((t) => (
        <li key={t}>{t}</li>
      ))}
    </ul>
  );
}

const note = "text-sm text-ink-muted";

export default function Built() {
  return (
    <Motion>
      <SiteHeader mode="landing" />
      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-[1200px] space-y-12 px-4 pb-20 pt-8 outline-none md:px-6 md:pt-14">
        <header className="grid gap-4 md:grid-cols-12">
          <p className="text-sm font-medium text-clay-ink md:col-span-3 md:pt-4">How it&rsquo;s built</p>
          <div className="space-y-4 md:col-span-9">
            <h1 className="rise font-display text-[clamp(2.8rem,1.6rem+5vw,5.2rem)] font-[680] leading-[0.92] tracking-[-0.02em]" style={{ fontVariationSettings: "'wdth' 78" }}>
              How it&rsquo;s built
            </h1>
            <p className="rise max-w-[56ch] text-lg text-ink-muted" style={{ animationDelay: "80ms" }}>
              Drop enough grains and the shape appears. Here is the machinery, the data and the math, so you can check any number on the site.
            </p>
          </div>
        </header>

        <Block title="What's here">
          <Rows rows={SITE} />
        </Block>

        <Block title="Your progress">
          <Bullets items={PROGRESS} />
          <p className={note}>All of it is stored in this browser only.</p>
        </Block>

        <Block title="Stack">
          <Rows rows={STACK.map(([name, href, what]) => ({ name, href, what }))} external />
        </Block>

        <Block title="Type">
          <Rows rows={FONTS.map(([name, what]) => ({ name, what }))} />
          <p className={note}>All three are free under the SIL Open Font License and served from this site, not a font CDN.</p>
        </Block>

        <Block title="Checks">
          <Rows rows={CHECKS.map(([name, what]) => ({ name, what }))} />
          <p className={note}>
            All four run in <code>npm run check</code> before a release.
          </p>
        </Block>

        <Block title="The math, game by game">
          <Rows rows={GAMES.map((g) => ({ name: g.name, href: playHref(g.slug), what: MATH[g.slug] }))} ordered />
          <p className={note}>Every probability model was checked against a simulation before it shipped. One check caught a real bug in the tiebreak formula, which is why the checks stay.</p>
        </Block>

        <Block title="The decisions">
          <Rows rows={DECISIONS.map((t) => ({ name: t.question, href: toolHref(t.id), what: `${t.teaches}.` }))} ordered />
          <p className={note}>The formulas behind each one are covered by the unit tests.</p>
        </Block>

        <Block title="Data">
          <ul className="space-y-1">
            {SOURCES.map(([name, url]) => (
              <li key={url}>
                <a href={url} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center underline-offset-4 hover:underline">
                  {name}
                </a>
              </li>
            ))}
          </ul>
          <p className={note}>
            Election night prices and polls refresh every day through a GitHub Action, and again at every build. Public sources only, no keys.
          </p>
        </Block>

        <Block title="Open data">
          <Rows rows={OPEN} />
          <p className={note}>Free to use with a link to monte.markets.</p>
        </Block>

        <Block title="Access and privacy">
          <Bullets items={ACCESS} />
        </Block>

        <Block title="Code">
          <p>
            <a href="https://github.com/skirberg" target="_blank" rel="noreferrer" className={link}>
              github.com/skirberg
            </a>
          </p>
        </Block>
      </main>
      <SiteFooter />
    </Motion>
  );
}
