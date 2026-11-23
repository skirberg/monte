import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { BookOpen, ChevronDown, CreativeCommons, FileCode2, HardDrive, Sigma } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Section, grid } from "@/components/layout/section";
import { Logo } from "@/components/brand/stack-logos";
import { JsonLd } from "@/components/json-ld";
import { btn } from "@/components/study/ui";
import { cn } from "@/lib/cn";
import { BOILERPLATE } from "@/lib/brand";
import { NameRow } from "@/components/brand/name-row";
import { REPORT_TARGET, REPORT_URL, REPO_PUBLIC, REPO_URL, SITE_NAME, abs, pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta(
  "/about/",
  "About",
  "Monte is a free site for learning statistics by doing. Where it began, what it promises, where the name comes from and who makes it.",
);

const MAKER = "Sami Kirberg";
const PROFILE = "https://github.com/skirberg";

/** The one line under the title: the idea of the site, which the pile beside it draws. */
const LINE = "You do something first. Then the idea shows up.";

const h2 = "font-display text-headline font-semibold leading-none";
const small = "text-sm text-ink-muted";
const link = "underline decoration-line-strong underline-offset-4 hover:decoration-ink";

/** What Monte promises a visitor, each in a line with its icon. Each is true of the code today (README, "How it is
    built"), and each links to the page that shows it, so the detail is one tap away. The last speaks of the code only
    while the code can be read (REPO_PUBLIC in lib/seo.ts). */
const PROMISES: { k: string; href?: string; Icon: typeof BookOpen }[] = [
  { k: "Free, no sign-up", href: "/learn/", Icon: BookOpen },
  { k: "Progress stays in your browser", href: "/privacy/", Icon: HardDrive },
  { k: "Every number real, or worked by code", href: "/built/", Icon: Sigma },
  REPO_PUBLIC ? { k: "Open: MIT code, CC BY lessons", href: REPO_URL, Icon: FileCode2 } : { k: "Open lessons and data, CC BY", href: "/terms/", Icon: CreativeCommons },
];

/** How it got here. Dates come from CHANGELOG.md; the first entry has none because the change log starts later. */
const TIMELINE: { when: string; title: string; body: string }[] = [
  {
    when: "First",
    title: "Sigma Sandbox",
    body: "A study app for learning statistics by doing it. Its storage keys still start with sigma, so renaming it never wiped anyone's progress.",
  },
  { when: "Nov 5, 2026", title: "Fit to share", body: "Search, the drills, the share titles and the first visit, fixed and checked." },
  { when: "Nov 11, 2026", title: "Found by search", body: "Every page goes to search engines on each deploy, and assistants can read the whole course in one file." },
  { when: "Nov 12, 2026", title: "Listen, and an MCP server", body: "Each topic can be heard as well as read, and chat apps can use Monte's solvers and glossary." },
  { when: "Nov 13, 2026", title: "The bell curve", body: "The logo becomes a clay bell beside the name. A full review leaves much less text on every page." },
  {
    when: "Nov 19, 2026",
    title: "One chart a day",
    body: "The daily chart, Find your level and Keep it fresh. Flashcards come back just before you would forget them, and every lesson comes as Markdown.",
  },
];

const at = (i: number) => ({ "--i": i }) as CSSProperties;

/** Galton's board, settled: grains stacked by bin and the bell drawn over them. The grains drop in once, column by column. */
const PILE = [1, 2, 3, 5, 7, 8, 7, 5, 3, 2, 1];
function Pile() {
  const r = 7;
  const step = 17;
  const x0 = 120 - ((PILE.length - 1) * step) / 2;
  const pts: string[] = [];
  for (let i = 0; i <= 60; i++) {
    const z = -3 + (6 * i) / 60;
    pts.push(`${(x0 + ((PILE.length - 1) * step * i) / 60).toFixed(1)},${(150 - 132 * Math.exp((-z * z) / 2.4)).toFixed(1)}`);
  }
  return (
    <svg viewBox="0 0 240 158" className="ga ga-play w-full" aria-hidden>
      {PILE.flatMap((h, col) =>
        Array.from({ length: h }, (_, k) => (
          <circle key={`${col}-${k}`} className="ga-pop" style={at(col * 0.6 + k * 0.4)} cx={x0 + col * step} cy={150 - r - 1 - k * (2 * r + 1.4)} r={r} fill="var(--clay)" />
        )),
      )}
      <polyline className="ga-draw" style={at(9)} pathLength={1} points={pts.join(" ")} fill="none" stroke="var(--ink)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="4" x2="236" y1="150.5" y2="150.5" stroke="var(--ink)" strokeWidth="1.4" />
    </svg>
  );
}

export default function AboutPage() {
  return (
    <>
      <SiteHeader mode="landing" />
      <JsonLd
        data={{
          "@type": "AboutPage",
          name: `About ${SITE_NAME}`,
          url: abs("/about/"),
          description: BOILERPLATE.short,
          about: { "@type": "WebSite", name: SITE_NAME, url: abs("/") },
          author: { "@type": "Person", name: MAKER, url: PROFILE },
        }}
      />
      <main id="main" tabIndex={-1} className="pb-section outline-none">
        {/* The idea */}
        <Section top="block" inner={`${grid} gap-y-block items-end`} aria-labelledby="about-t">
          <div className="col-span-4 grid gap-6 md:col-span-12 lg:col-span-7">
            <h1 id="about-t" className="rise font-display text-display font-semibold leading-none" style={{ fontVariationSettings: "'wdth' 78" }}>
              About Monte
            </h1>
            <p className="max-w-measure-short text-lead">{LINE}</p>
          </div>
          <div className="col-span-4 md:col-span-8 md:col-start-3 lg:col-span-5 lg:col-start-8">
            <Pile />
          </div>
        </Section>

        {/* What it promises: four lines, each a link to where it shows */}
        <Section aria-labelledby="promise-t" inner={`${grid} gap-y-6`}>
          <h2 id="promise-t" className={cn(h2, "col-span-4 md:col-span-12")} style={{ fontVariationSettings: "'wdth' 84" }}>
            What it promises
          </h2>
          <ul className="col-span-4 grid gap-x-gutter gap-y-2 sm:grid-cols-2 md:col-span-12 lg:grid-cols-4">
            {PROMISES.map(({ k, href, Icon }) => (
              <li key={k}>
                <a href={href} {...(href?.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})} className="group grid min-h-11 content-start gap-3 py-2">
                  <Icon className="size-6 text-clay" aria-hidden />
                  <span className="font-display text-xl font-semibold leading-tight underline decoration-transparent underline-offset-4 transition-colors group-hover:decoration-ink">{k}</span>
                </a>
              </li>
            ))}
          </ul>
        </Section>

        {/* How it got here */}
        <Section aria-labelledby="story-t" inner={`${grid} gap-y-8`}>
          <div className="col-span-4 grid content-start gap-3 md:col-span-12 lg:col-span-4">
            <h2 id="story-t" className={h2} style={{ fontVariationSettings: "'wdth' 84" }}>
              How it got here
            </h2>
            {/* The change log lives in the repository, so it is linked only while the repository is public. */}
            {REPO_PUBLIC && (
              <p className={small}>
                Every change since, by date, is in the{" "}
                <a href={`${REPO_URL}/blob/main/CHANGELOG.md`} target="_blank" rel="noreferrer" className={link}>
                  change log
                </a>
                .
              </p>
            )}
          </div>
          <ol className="ga ga-play relative col-span-4 grid gap-4 md:col-span-12 lg:col-span-8">
            {/* the court line, with one grain per step */}
            <span aria-hidden className="ga-fade absolute bottom-2 left-[5px] top-2 w-px bg-line-strong md:left-[calc(9rem+5px)]" />
            {TIMELINE.map((t, i) => (
              <li key={t.title} className="relative grid grid-cols-[11px_minmax(0,1fr)] gap-x-5 md:grid-cols-[8rem_11px_minmax(0,1fr)] md:gap-x-4">
                <time className="col-start-2 font-mono text-sm text-ink-muted tabular-nums md:col-start-1 md:row-start-1 md:pt-1 md:text-right">{t.when}</time>
                <span
                  aria-hidden
                  className={cn("ga-pop col-start-1 row-span-2 row-start-1 mt-2 size-[11px] rounded-full ring-4 ring-paper md:col-start-2 md:row-span-1", i === TIMELINE.length - 1 ? "bg-clay" : "bg-ink")}
                  style={at(i + 1)}
                />
                {/* The title on the line; what changed, one tap away. */}
                <details className="group col-start-2 md:col-start-3 md:row-start-1">
                  <summary className="flex min-h-11 cursor-pointer list-none items-start gap-2 [&::-webkit-details-marker]:hidden">
                    <h3 className="font-display text-heading font-semibold leading-tight">{t.title}</h3>
                    <ChevronDown aria-hidden className="mt-2 size-4 flex-none text-ink-muted transition-transform duration-200 group-open:rotate-180" />
                  </summary>
                  <p className="max-w-measure pb-1 text-ink-muted">{t.body}</p>
                </details>
              </li>
            ))}
          </ol>
        </Section>

        {/* The name, four ways, drawn */}
        <Section aria-labelledby="name-t" inner={`${grid} gap-y-6`}>
          <h2 id="name-t" className={cn(h2, "col-span-4 md:col-span-12")} style={{ fontVariationSettings: "'wdth' 84" }}>
            Why Monte
          </h2>
          <NameRow className="col-span-4 md:col-span-12" />
        </Section>

        {/* Who makes it */}
        <Section aria-labelledby="maker-t" inner={`${grid} gap-y-6`}>
          <div className="col-span-4 grid gap-6 rounded-stage bg-ink p-6 text-paper sm:p-8 md:col-span-12 md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:p-10">
            <div className="grid gap-4">
              <span aria-hidden className="grid size-14 place-items-center rounded-full bg-paper font-display text-xl font-semibold text-ink">
                SK
              </span>
              <h2 id="maker-t" className={h2} style={{ fontVariationSettings: "'wdth' 84" }}>
                Made by {MAKER}
              </h2>
              <p className="max-w-measure-short text-lead text-paper/80">
                {REPO_PUBLIC ? "Built in the open on GitHub and hosted on Vercel. The code is there to read, to reuse and to fix." : "Built on GitHub and hosted on Vercel."}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a href={PROFILE} target="_blank" rel="noreferrer" className={btn.ghost}>
                <Logo id="github" className="size-5" /> @skirberg
              </a>
              <a href={REPORT_URL} target={REPORT_TARGET} rel="noreferrer" className="btn border border-paper/40 text-paper hover:border-paper hover:bg-paper/10">
                Report a mistake
              </a>
            </div>
          </div>
          <ul className="col-span-4 divide-y divide-line border-y border-line md:col-span-12">
            {[
              { href: "/story/", k: "Why statistics", v: "Fourteen true stories, from 1662 to now" },
              { href: "/built/", k: "How it's built", v: "The stack, the checks and the credits" },
              { href: "/brand/", k: "Brand", v: "The logo, the colours and the voice" },
              { href: "/sources/", k: "Sources", v: "Free videos, books and apps, each checked" },
            ].map((l) => (
              <li key={l.href}>
                <a href={l.href} className="group grid min-h-14 items-center gap-1 py-3 sm:grid-cols-[18rem_minmax(0,1fr)] sm:gap-gutter">
                  <span className="font-medium underline decoration-line-strong underline-offset-4 group-hover:decoration-ink">{l.k}</span>
                  <span className={small}>{l.v}</span>
                </a>
              </li>
            ))}
          </ul>
          {REPO_PUBLIC && (
            <a href={REPO_URL} target="_blank" rel="noreferrer" className={cn(btn.ghost, "col-span-4 justify-self-start md:col-span-12")}>
              <Logo id="github" className="size-5" /> Read the code
            </a>
          )}
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
