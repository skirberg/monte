import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Motion } from "@/components/landing/motion-bits";
import { GAMES, playHref } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "How it's built",
  description: "The stack, the fonts, the data sources and the math behind every lab and game on Monte.",
  alternates: { canonical: "/built/" },
};

const STACK: [string, string, string][] = [
  ["Next.js", "https://nextjs.org", "React framework. The whole site is a static export: plain files, no server."],
  ["Tailwind CSS", "https://tailwindcss.com", "Styling, driven by the color and type tokens in DESIGN.md."],
  ["shadcn/ui on Base UI", "https://ui.shadcn.com", "Accessible building blocks, restyled for this brand: the jump-to menu, dialogs, menus."],
  ["Motion", "https://motion.dev", "Scroll and layout animation: the grains that drop, the mark that draws itself."],
  ["Remotion", "https://www.remotion.dev", "Video written as React. The hero film is a Remotion composition played live in the page."],
  ["Lucide", "https://lucide.dev", "Icons."],
  ["Vercel", "https://vercel.com", "Hosting and cookie-free page analytics."],
];

const FONTS: [string, string][] = [
  ["Bricolage Grotesque", "Headlines. Optical size and width axes."],
  ["Geologica", "Body text. Includes Greek, so σ and μ match the sentence around them."],
  ["Azeret Mono", "Numbers, timers and scores. Its zero is plain, so 0 never reads as 8."],
];

const MATH: Record<string, string> = {
  correlation: "Pearson r of the exact 60 points drawn. Scored by absolute miss.",
  "monty-hall": "Every game is played honestly: the host knows the car and opens a goat. Rates come from simulation, not a hard-coded 2/3.",
  "fake-coin": "Your 50 flips against 20,000 simulated fair sequences on runs, longest streak and heads; two-sided p-values at 2% each. A truly random sequence is flagged about 3% of the time.",
  serve: "Hold probability in closed form, sets by exact recursion with a tiebreak at 6-6, checked against a 300,000-set Monte Carlo. Player buttons invert the model from real 2025 ATP hold rates.",
  "house-edge": "Exact pocket counts: −1/37 on a European wheel, −2/38 on an American one. Simulated over two million spins before shipping.",
  odds: "Implied probability from American odds and contract prices, overround and fair odds, expected value per $100.",
  "ab-test": "Pooled two-proportion z-test after every simulated day. With no real difference, daily peeking flagged about 24% of tests versus about 5% for a single look.",
  "long-run": "Arithmetic vs geometric mean on 98 years of real returns, then a bootstrap Monte Carlo of 2,000 futures. Parsed from the source and checked against its own growth column.",
  options: "Black-Scholes in closed form next to risk-neutral Monte Carlo with a 95% band. At 100/100, one year, 5%, σ 20%: $10.45 both ways.",
};

const SOURCES: [string, string][] = [
  ["Aswath Damodaran, Historical Returns on Stocks, Bonds and Bills, NYU Stern (updated January 5, 2026)", "https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/histretSP.html"],
  ["ATP Tour, 2025 service and return games won leaders (November 2025)", "https://www.atptour.com/en/news/sinner-serve-return-november-2025"],
  ["Monty Hall problem: history and the 1990 Parade column", "https://en.wikipedia.org/wiki/Monty_Hall_problem"],
];

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-4 border-t border-line pt-8 md:grid-cols-12 md:pt-10">
      <h2 className="font-mono text-xs uppercase tracking-[0.1em] text-ink-muted md:col-span-3 md:pt-1.5">{title}</h2>
      <div className="space-y-4 md:col-span-9">{children}</div>
    </section>
  );
}

export default function Built() {
  return (
    <Motion>
      <SiteHeader mode="landing" />
      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-[1200px] space-y-12 px-4 pb-20 pt-8 outline-none md:px-6 md:pt-14">
        <header className="grid gap-4 md:grid-cols-12">
          <p className="font-mono text-xs uppercase tracking-[0.1em] text-ink-muted md:col-span-3 md:pt-4">Colophon</p>
          <div className="space-y-4 md:col-span-9">
            <h1 className="rise font-display text-[clamp(2.8rem,1.6rem+5vw,5.2rem)] font-[680] leading-[0.92] tracking-[-0.02em]" style={{ fontVariationSettings: "'wdth' 78" }}>
              How it&rsquo;s built
            </h1>
            <p className="rise max-w-[56ch] text-lg text-ink-muted" style={{ animationDelay: "80ms" }}>
              One idea runs through everything: drop enough grains and the shape appears. Here is the machinery, the data and the math, so you
              can check any number on the site.
            </p>
          </div>
        </header>

        <Block title="Stack">
          <ul className="divide-y divide-line border-y border-line">
            {STACK.map(([name, url, what]) => (
              <li key={name} className="grid items-center gap-1 py-2 sm:grid-cols-[14rem_1fr] sm:gap-4">
                <a href={url} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center self-start font-medium underline-offset-4 hover:underline">
                  {name}
                </a>
                <span className="text-ink-muted">{what}</span>
              </li>
            ))}
          </ul>
        </Block>

        <Block title="Type">
          <ul className="divide-y divide-line border-y border-line">
            {FONTS.map(([name, what]) => (
              <li key={name} className="grid items-center gap-1 py-2 sm:grid-cols-[14rem_1fr] sm:gap-4">
                <span className="font-medium">{name}</span>
                <span className="text-ink-muted">{what}</span>
              </li>
            ))}
          </ul>
          <p className="text-sm text-ink-muted">All three are free under the SIL Open Font License and served from this site, not a font CDN.</p>
        </Block>

        <Block title="The study engine">
          <p className="max-w-[62ch]">
            Learn, Practice and Solve run on the study engine Monte grew out of (it began as a class study app called Sigma Sandbox), in plain JavaScript: question generators that make fresh numbers
            every time, eleven interactive labs, nine solvers that show the work, a timed mock exam and spaced review of missed questions.
          </p>
        </Block>

        <Block title="The math, game by game">
          <ol className="divide-y divide-line border-y border-line">
            {GAMES.map((g) => (
              <li key={g.slug} className="grid items-center gap-1 py-2 sm:grid-cols-[14rem_1fr] sm:gap-4">
                <a href={playHref(g.slug)} className="inline-flex min-h-11 items-center self-start font-medium underline-offset-4 hover:underline">
                  {g.name}
                </a>
                <span className="text-ink-muted">{MATH[g.slug]}</span>
              </li>
            ))}
          </ol>
          <p className="text-sm text-ink-muted">Every probability model here was checked against a simulation before it shipped. One check caught a real bug in the tiebreak formula, which is why the checks stay.</p>
        </Block>

        <Block title="Data">
          <ul className="space-y-2">
            {SOURCES.map(([name, url]) => (
              <li key={url}>
                <a href={url} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center underline-offset-4 hover:underline">
                  {name}
                </a>
              </li>
            ))}
          </ul>
        </Block>

        <Block title="Access and privacy">
          <p className="max-w-[62ch]">
            Text meets WCAG 2.1 AA contrast in light and dark, every control is reachable by keyboard and at least 44 pixels to tap, and all
            motion stops when your device asks for reduced motion. There are no accounts and no cookies. Page visits are counted anonymously
            with Vercel Web Analytics, which stores nothing on your device. Your progress stays in this browser.
          </p>
        </Block>

        <Block title="Code">
          <p>
            <a href="https://github.com/skirberg" target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center self-start font-medium underline-offset-4 hover:underline">
              github.com/skirberg
            </a>
          </p>
        </Block>
      </main>
      <SiteFooter />
    </Motion>
  );
}
