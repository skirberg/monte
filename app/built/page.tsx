import type { Metadata } from "next";
import { Accessibility, Activity, ArrowUpRight, Award, Braces, Brush, ChevronDown, Coins, Compass, Contrast, FileSpreadsheet, FileText, Flame, FlaskConical, Hand, Headphones, Image as ImageIcon, Keyboard, MessageSquareText, Monitor, Pause, Plug, Search, ShieldCheck, Smartphone, Sparkles, SquareCode, Type, Zap, type LucideIcon } from "lucide-react";
import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";
import { REPORT_TARGET, REPORT_URL, REPO_PUBLIC, REPO_URL, pageMeta } from "@/lib/seo";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Motion } from "@/components/landing/motion-bits";
import { Logo, type LogoId } from "@/components/brand/stack-logos";
import { DECIDE_TOOLS, GAMES, SOLVERS, TOPICS, decideHref, playHref, studyHref } from "@/lib/site-data";
import { TOOLS as DECISIONS, toolHref } from "@/lib/decide/tools";
import { DATA } from "@/lib/study/data";
import { LESSONS } from "@/lib/study/lessons";
import { study } from "@/lib/study/routes";
import { btn, lead } from "@/components/study/ui";
import sitemap from "@/app/sitemap";

export const metadata: Metadata = pageMeta("/built/", "How it's built", "The stack, the checks, the data sources and the math behind every lesson, game and decision on Monte.");

// Pictures before words (DESIGN.md, "Less text"): counts, logos, specimens and icons carry the page; the long lists
// (the math per game, the decisions, the sources) wait in folds.

/** The labs in components/study/labs.tsx (the LabId union in lib/study/data.ts). */
const LAB_COUNT = 13;
const LESSON_COUNT = Object.values(LESSONS).reduce((n, l) => n + l.length, 0);

const HERE: { n: number; label: string; href: string }[] = [
  { n: TOPICS.length, label: "topics", href: studyHref("#learn") },
  { n: LESSON_COUNT, label: "lessons", href: studyHref("#learn") },
  { n: LAB_COUNT, label: "labs", href: studyHref("#learn") },
  { n: DATA.terms.length, label: "terms", href: study.terms },
  { n: SOLVERS.length, label: "solvers", href: studyHref("#solve") },
  { n: DECIDE_TOOLS.length, label: "decisions", href: decideHref() },
  { n: GAMES.length, label: "games", href: playHref() },
  { n: 14, label: "true stories", href: "/story/" },
];

const PROGRESS: { label: string; sub: string; Icon: LucideIcon }[] = [
  { label: "XP", sub: "For learning, not visits", Icon: Zap },
  { label: "Streak", sub: "A freeze every 7 days", Icon: Flame },
  { label: "Chips", sub: "The games' bankroll", Icon: Coins },
  { label: "Badges", sub: "Plus a backup code", Icon: Award },
];

type Tool = { name: string; role: string; href: string } & ({ logo: LogoId } | { Icon: LucideIcon });
const STACK: { name: string; tools: Tool[] }[] = [
  {
    name: "The site",
    tools: [
      { name: "Next.js 16", role: "Static export", href: "https://nextjs.org", logo: "nextjs" },
      { name: "React 19", role: "Interface", href: "https://react.dev", logo: "react" },
      { name: "TypeScript 6", role: "Strict, everywhere", href: "https://www.typescriptlang.org", logo: "typescript" },
      { name: "Tailwind 4", role: "Styling", href: "https://tailwindcss.com", logo: "tailwind" },
      { name: "shadcn/ui", role: "Menus, dialogs", href: "https://ui.shadcn.com", logo: "shadcn" },
      { name: "Motion", role: "Animation", href: "https://motion.dev", Icon: Sparkles },
      { name: "SVG and Canvas", role: "Marks, charts, grains", href: "https://developer.mozilla.org/docs/Web/SVG", Icon: Brush },
      { name: "cmdk", role: "Search", href: "https://cmdk.paco.me", Icon: Search },
      { name: "Lucide", role: "Icons", href: "https://lucide.dev", logo: "lucide" },
    ],
  },
  {
    name: "Build and checks",
    tools: [
      { name: "Node.js 24", role: "Scripts, builds", href: "https://nodejs.org", logo: "node" },
      { name: "Vitest", role: "Tests", href: "https://vitest.dev", logo: "vitest" },
      { name: "ESLint", role: "Lint", href: "https://eslint.org", logo: "eslint" },
      { name: "axe-core", role: "Accessibility", href: "https://github.com/dequelabs/axe-core", Icon: Accessibility },
      { name: "Chromium", role: "QA and smoke", href: "https://chromedevtools.github.io/devtools-protocol/", Icon: Monitor },
      { name: "Satori", role: "Share cards", href: "https://github.com/vercel/satori", Icon: ImageIcon },
      { name: "Kokoro", role: "Listen voice", href: "https://huggingface.co/hexgrad/Kokoro-82M", logo: "huggingface" },
    ],
  },
  {
    name: "Hosting and automation",
    tools: [
      { name: "Vercel", role: "Hosting, analytics", href: "https://vercel.com", logo: "vercel" },
      { name: "GitHub Actions", role: "Checks, data, search", href: "https://github.com/features/actions", logo: "actions" },
      { name: "Dependabot", role: "Weekly updates", href: "https://docs.github.com/code-security/dependabot", logo: "dependabot" },
    ],
  },
  {
    name: "For chat apps",
    tools: [
      { name: "MCP", role: "Streamable HTTP", href: "https://modelcontextprotocol.io", logo: "mcp" },
      { name: "Zod 4", role: "Tool inputs", href: "https://zod.dev", logo: "zod" },
      { name: "esbuild", role: "One-file bundle", href: "https://esbuild.github.io", logo: "esbuild" },
    ],
  },
];

const FONTS: { name: string; role: string; sample: string; cls: string }[] = [
  { name: "Bricolage Grotesque", role: "Headlines", sample: "Aa", cls: "font-display font-semibold" },
  { name: "Geologica", role: "Reading, Greek too", sample: "σ μ", cls: "font-sans" },
  { name: "Azeret Mono", role: "Numbers", sample: "08", cls: "font-mono tabular-nums" },
];

const CHECKS: { name: string; sub: string; Icon: LucideIcon }[] = [
  { name: "Unit tests", sub: "Every formula", Icon: FlaskConical },
  { name: "Types", sub: "Strict, no unused code", Icon: SquareCode },
  { name: "Lint", sub: "ESLint", Icon: Braces },
  { name: "Accessibility", sub: "4 widths, 2 themes", Icon: Accessibility },
  { name: "Contrast", sub: "WCAG AA", Icon: Contrast },
  { name: "Design scale", sub: "Nothing off-scale", Icon: Type },
  { name: "Voice", sub: "No stock phrases", Icon: MessageSquareText },
  { name: "Smoke", sub: "The built site", Icon: Activity },
  { name: "Narration", sub: "Heard back, matched", Icon: Headphones },
];

/** What runs without anyone pressing a button (.github/workflows and .github/dependabot.yml). */
const AUTOMATION: { when: string; what: string }[] = [
  { when: "Every pull request", what: "Every check above runs" },
  { when: "Every morning", what: "The daily chart's series refresh" },
  { when: "Every deploy", what: "Search engines get every page" },
  { when: "Every week", what: "Dependency updates arrive as one PR" },
  { when: "Every Monday", what: "Every source link is opened; a broken one opens an issue" },
  { when: "On a new version", what: "The MCP server updates its registry listing" },
];

const OPEN: { name: string; sub: string; href: string; Icon: LucideIcon }[] = [
  { name: "JSON API", sub: "No key", href: "/api/v1/index.json", Icon: Braces },
  { name: "Markdown", sub: "Every page as .md", href: "/index.md", Icon: FileText },
  { name: "llms.txt", sub: "Site map for models", href: "/llms.txt", Icon: FileText },
  { name: "MCP server", sub: "mcp.monte.markets", href: "https://mcp.monte.markets/mcp", Icon: Plug },
  { name: "Sitemap", sub: "Every page, dated", href: "/sitemap.xml", Icon: Compass },
  { name: "Cheat sheets", sub: "Phone-sized", href: "/cheatsheets/all-1.png", Icon: ImageIcon },
  { name: "Workbook", sub: "Excel", href: "/downloads/monte-statistics-workbook.xlsx", Icon: FileSpreadsheet },
];

const ACCESS: { label: string; Icon: LucideIcon }[] = [
  { label: "AA contrast, light and dark", Icon: Contrast },
  { label: "Works by keyboard", Icon: Keyboard },
  { label: "44 px tap targets", Icon: Hand },
  { label: "No zoom when you type", Icon: Smartphone },
  { label: "Stops for reduced motion", Icon: Pause },
  { label: "No accounts, no cookies", Icon: ShieldCheck },
  { label: "Listen instead of read", Icon: Headphones },
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
  ["Tickerz, public index histories (NYC and Chicago 311, NOAA, NSIDC, USGS, US Labor Department) for What happens next?", "https://tickerz.com/x"],
  ["Wikipedia, 2026 House generic ballot averages", "https://en.wikipedia.org/wiki/2026_United_States_House_of_Representatives_elections"],
  ["VoteHub, public poll data", "https://votehub.com"],
  ["Monty Hall problem: history and the 1990 Parade column", "https://en.wikipedia.org/wiki/Monty_Hall_problem"],
];

const MAKER = "Sami Kirberg";
const PROFILE = "https://github.com/skirberg";

/** Every page in the sitemap: the count the Build stage shows. */
const PAGE_COUNT = sitemap().length;

/** How a change reaches a visitor, drawn as grains on one line (DESIGN.md, "Graphic devices"). */
const STAGES: { name: string; line: string; count: string }[] = [
  { name: "Write", line: "Typed files, beside the code that grades them.", count: `${LESSON_COUNT} lessons, ${DATA.terms.length} terms` },
  { name: "Check", line: "Every change, before it ships.", count: `${CHECKS.length} checks` },
  { name: "Build", line: "Plain pages. No server, no account.", count: `${PAGE_COUNT} pages` },
  { name: "Ship", line: "Vercel serves it. Chat apps read it over MCP.", count: "monte.markets" },
];

const at = (i: number) => ({ "--i": i }) as CSSProperties;

function Pipeline() {
  return (
    <ol className="ga ga-play relative grid gap-8 md:grid-cols-4 md:gap-gutter">
      {/* The line the grains sit on: down the side on a phone, across the top from md. */}
      <span aria-hidden className="ga-fade absolute bottom-2 left-[5px] top-2 w-px bg-line-strong md:hidden" />
      <span aria-hidden className="ga-grow-l absolute inset-x-0 top-[5px] hidden h-px bg-line-strong md:block" />
      {STAGES.map((st, i) => (
        <li key={st.name} className="relative grid grid-cols-[11px_minmax(0,1fr)] content-start gap-x-5 md:grid-cols-1 md:gap-y-5">
          <span aria-hidden className="ga-pop mt-2 size-[11px] rounded-full bg-clay ring-4 ring-paper md:mt-0" style={at(i * 2 + 3)} />
          <div className="grid content-start gap-1.5">
            <h3 className="font-display text-heading font-semibold leading-tight">{st.name}</h3>
            <p className="text-ink-muted">{st.line}</p>
            <p className="mt-1 font-mono text-sm font-medium text-clay-ink tabular-nums">{st.count}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

const linkCls = "underline decoration-line-strong underline-offset-4 hover:decoration-ink";
/** The Code row and the GitHub issues link show only while the repository is public (REPO_PUBLIC in lib/seo.ts). */
const CREDITS: { k: string; v: React.ReactNode }[] = [
  {
    k: "Made by",
    v: (
      <>
        {MAKER},{" "}
        <a href={PROFILE} target="_blank" rel="noreferrer" className={linkCls}>
          @skirberg on GitHub
        </a>
      </>
    ),
  },
  ...(REPO_PUBLIC
    ? [
        {
          k: "Code",
          v: (
            <>
              <a href={REPO_URL} target="_blank" rel="noreferrer" className={linkCls}>
                {REPO_URL.replace("https://", "")}
              </a>
              , under the MIT licence
            </>
          ),
        },
      ]
    : []),
  { k: "Lessons and data", v: "CC BY 4.0: reuse them with credit to monte.markets" },
  { k: "Built with", v: "Next.js, React, Tailwind CSS and every other open-source project in the stack above" },
  { k: "Type", v: "Bricolage Grotesque, Geologica and Azeret Mono, under the SIL Open Font License" },
  { k: "Hosted by", v: "Vercel. The code, the checks and the automation live on GitHub." },
  {
    k: "The stories",
    v: (
      <>
        Each one checked against the sources listed on{" "}
        <a href="/story/#story-sources" className={linkCls}>
          Why statistics
        </a>
      </>
    ),
  },
  {
    k: "Found a mistake?",
    v: (
      <a href={REPORT_URL} target={REPORT_TARGET} rel="noreferrer" className={linkCls}>
        {REPO_PUBLIC ? "Open an issue on GitHub" : "Tell Sami"}
      </a>
    ),
  },
];

const tile = "rounded-card border border-line bg-paper";
const tileLink = cn(tile, "group transition-colors hover:border-ink hover:bg-sand");
const muted = "text-xs text-ink-muted";
/** An address breaks after its dots (mcp.monte. / markets) on a narrow phone, so it wraps instead of pushing the page sideways. */
const address = (s: string) => (/\s/.test(s) ? s : s.split(/(?<=\.)/).flatMap((part, i) => (i ? [<wbr key={i} />, part] : [part])));

function Part({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line pb-block pt-6">
      <h2 className="mb-5 font-display text-2xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}

/** A long list, closed until tapped. */
function Fold({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="group border-b border-line">
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-2 [&::-webkit-details-marker]:hidden">
        <h2 className="font-display text-xl font-semibold">{title}</h2>
        <ChevronDown className="size-5 shrink-0 text-ink-muted transition-transform group-open:rotate-180" aria-hidden />
      </summary>
      <div className="pb-6">{children}</div>
    </details>
  );
}

const rows = "divide-y divide-line border-y border-line";
const row = "grid gap-1 py-3 sm:grid-cols-[16rem_1fr] sm:gap-4";

export default function Built() {
  return (
    <Motion>
      <SiteHeader mode="landing" />
      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-page px-gutter pb-section pt-block outline-none">
        <header className="grid gap-6 pb-block lg:grid-cols-12 lg:items-end lg:gap-gutter">
          <div className="grid gap-5 lg:col-span-8">
            <h1 className="rise font-display text-display font-semibold leading-none" style={{ fontVariationSettings: "'wdth' 78" }}>
              How it&rsquo;s built
            </h1>
            <p className={cn(lead, "max-w-measure-short text-ink-muted")}>
              {REPO_PUBLIC ? "Free and open source. Every number on the site is real, or worked out by code you can read." : "Free, with no sign-up. Every number on the site is real, or worked out by code."}
            </p>
            <p className="flex items-center gap-2.5 text-base">
              <span aria-hidden className="grid size-9 place-items-center rounded-full bg-ink font-display text-sm font-semibold text-paper">
                SK
              </span>
              <span>
                Made by{" "}
                <a href={PROFILE} target="_blank" rel="noreferrer" className="font-medium underline decoration-line-strong underline-offset-4 hover:decoration-ink">
                  {MAKER}
                </a>
              </span>
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:col-span-4 lg:justify-end">
            {REPO_PUBLIC && (
              <a href={REPO_URL} target="_blank" rel="noreferrer" className={btn.primary}>
                <Logo id="github" className="size-5" /> Read the code
              </a>
            )}
            <a href="/about/" className={btn.ghost}>
              About Monte
            </a>
          </div>
        </header>

        <Part title="From an idea to your screen">
          <Pipeline />
        </Part>

        <Part title="What's here">
          <ul className="grid grid-cols-2 border-l border-t border-line sm:grid-cols-4 xl:grid-cols-8">
            {HERE.map(({ n, label, href }) => (
              <li key={label} className="border-b border-r border-line">
                <a href={href} className="group flex h-full flex-col gap-2 p-4 transition-colors hover:bg-sand sm:p-5">
                  <span className="font-mono text-figure font-medium leading-none tracking-tight tabular-nums text-clay-ink">{n}</span>
                  <span className="text-sm text-ink-muted transition-colors group-hover:text-ink">{label}</span>
                </a>
              </li>
            ))}
          </ul>
        </Part>

        <Part title="Stack">
          <div className="grid gap-8">
            {STACK.map((grp) => (
              <div key={grp.name} className="grid gap-3 lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-gutter">
                <h3 className="text-sm font-medium text-ink-muted lg:pt-5">{grp.name}</h3>
                <ul className="grid grid-cols-2 border-l border-t border-line sm:grid-cols-3 xl:grid-cols-4">
                  {grp.tools.map((t) => (
                    <li key={t.name} className="border-b border-r border-line">
                      <a href={t.href} target="_blank" rel="noreferrer" className="group flex h-full min-h-16 items-center gap-3 p-3 transition-colors hover:bg-sand sm:p-4">
                        {"logo" in t ? <Logo id={t.logo} className="size-6 shrink-0" /> : <t.Icon className="size-6 shrink-0" aria-hidden />}
                        <span className="grid min-w-0">
                          <span className="flex items-center gap-1 text-sm font-medium">
                            {t.name}
                            <ArrowUpRight className="size-3.5 shrink-0 text-ink-muted opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                          </span>
                          <span className={muted}>{t.role}</span>
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Part>

        <Part title="Type">
          <ul className="grid gap-2 sm:grid-cols-3 sm:gap-3">
            {FONTS.map((f) => (
              <li key={f.name} className={cn(tile, "flex items-center gap-5 p-5 sm:flex-col sm:items-start sm:gap-8 sm:p-6")}>
                <span aria-hidden="true" className={cn("w-20 shrink-0 text-title leading-none sm:w-auto", f.cls)}>
                  {f.sample}
                </span>
                <span className="grid">
                  <b className="font-semibold">{f.name}</b>
                  <span className={muted}>{f.role}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-ink-muted">Free under the SIL Open Font License, served from this site.</p>
        </Part>

        <Part title="What keeps it honest">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-gutter">
            <div className="lg:col-span-7">
              <h3 className="mb-2 text-sm font-medium text-ink-muted">On every change</h3>
              <ul className="grid sm:grid-cols-2 sm:gap-x-6">
                {CHECKS.map(({ name, sub, Icon }) => (
                  <li key={name} className="flex min-h-14 items-center gap-3 border-b border-line py-2">
                    <Icon className="size-5 shrink-0 text-ink" aria-hidden />
                    <span className="grid">
                      <b className="text-sm font-semibold">{name}</b>
                      <span className={muted}>{sub}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-sm text-ink-muted">
                All run in <code className="font-mono text-symbol">npm run check</code>, and on every pull request.
              </p>
            </div>
            <div className="lg:col-span-5">
              <h3 className="mb-4 text-sm font-medium text-ink-muted">On its own</h3>
              <ol className="ga ga-play relative grid gap-5 pl-8">
                <span aria-hidden className="ga-fade absolute bottom-3 left-[5px] top-2 w-px bg-line-strong" />
                {AUTOMATION.map(({ when, what }, i) => (
                  <li key={when} className="relative">
                    <span aria-hidden className="ga-pop absolute -left-8 top-1.5 size-[11px] rounded-full bg-clay ring-4 ring-paper" style={at(i + 1)} />
                    <b className="block text-sm font-semibold">{when}</b>
                    <span className="text-sm text-ink-muted">{what}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </Part>

        <Part title="Open data">
          <ul className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
            {OPEN.map(({ name, sub, href, Icon }) => (
              <li key={name}>
                <a href={href} className={cn(tileLink, "flex h-full items-center gap-3 p-4")}>
                  <Icon className="size-5 shrink-0 text-ink-muted transition-colors group-hover:text-ink" aria-hidden />
                  <span className="grid min-w-0">
                    <b className="text-sm font-semibold">{name}</b>
                    <span className={cn(muted, "[overflow-wrap:anywhere]")}>{address(sub)}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-ink-muted">{REPO_PUBLIC ? "Lessons and data are CC BY 4.0, the code is MIT." : "Lessons and data are CC BY 4.0."}</p>
        </Part>

        <Part title="Your progress and privacy">
          <ul className="grid gap-x-6 gap-y-1 sm:grid-cols-2 lg:grid-cols-4">
            {PROGRESS.map(({ label, sub, Icon }) => (
              <li key={label} className="flex min-h-14 items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-sand">
                  <Icon className="size-5" aria-hidden />
                </span>
                <span className="grid min-w-0">
                  <b className="text-sm font-semibold">{label}</b>
                  <span className={muted}>{sub}</span>
                </span>
              </li>
            ))}
          </ul>
          <ul className="mt-4 grid gap-x-6 gap-y-1 border-t border-line pt-4 sm:grid-cols-2 lg:grid-cols-4">
            {ACCESS.map(({ label, Icon }) => (
              <li key={label} className="flex min-h-11 items-center gap-3">
                <Icon className="size-5 shrink-0 text-ink-muted" aria-hidden />
                <span>{label}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-ink-muted">Progress is stored in this browser only. Vercel Web Analytics counts visits and a few anonymous actions, and stores nothing on your device.</p>
        </Part>

        <div className="border-t border-line">
          <Fold title="The math, game by game">
            <ol className={rows}>
              {GAMES.map((g) => (
                <li key={g.slug} className={row}>
                  <a href={playHref(g.slug)} className="font-medium underline-offset-4 hover:underline">
                    {g.name}
                  </a>
                  <span className="max-w-measure text-ink-muted">{MATH[g.slug]}</span>
                </li>
              ))}
            </ol>
            <p className="mt-3 text-sm text-ink-muted">Every model was checked against a simulation before it shipped.</p>
          </Fold>
          <Fold title="The decisions">
            <ol className={rows}>
              {DECISIONS.map((t) => (
                <li key={t.id} className={row}>
                  <a href={toolHref(t.id)} className="font-medium underline-offset-4 hover:underline">
                    {t.question}
                  </a>
                  <span className="text-ink-muted">{t.teaches}.</span>
                </li>
              ))}
            </ol>
          </Fold>
          <Fold title="Data sources">
            <ul className={rows}>
              {SOURCES.map(([name, url]) => (
                <li key={url} className="py-2">
                  <a href={url} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center underline-offset-4 hover:underline">
                    {name}
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-ink-muted">The daily chart&rsquo;s series refresh every morning through a GitHub Action. The election numbers are a saved snapshot. Public sources only.</p>
          </Fold>
        </div>

        <section aria-labelledby="credits" className="mt-block border-t-2 border-ink pt-6">
          <h2 id="credits" className="mb-5 font-display text-2xl font-semibold">
            Credits
          </h2>
          <dl className={rows}>
            {CREDITS.map(({ k, v }) => (
              <div key={k} className={row}>
                <dt className="text-ink-muted">{k}</dt>
                <dd className="min-w-0">{v}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>
      <SiteFooter />
    </Motion>
  );
}
