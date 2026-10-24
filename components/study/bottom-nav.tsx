"use client";

import * as React from "react";
import { BookOpen, BookText, Calculator, Compass, FileText, FlaskConical, Gamepad2, House, Info, LibraryBig, MoreHorizontal, Sparkles, Target, Timer, Wrench, X } from "lucide-react";
import { cn } from "cn";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { usePathname } from "next/navigation";
import { useStudySection } from "@/lib/use-hash-page";
import { DECIDE_TOOLS, decideHref, navKeyFor, playHref, studyHref } from "@/lib/site-data";
import { setMode, useMode } from "@/lib/mode";
import { useHydrated } from "@/lib/hooks";

const TABS = [
  { page: "home", label: "Today", hash: "#home", Icon: House },
  { page: "learn", label: "Learn", hash: "#learn", Icon: BookOpen },
  { page: "practice", label: "Practice", hash: "#practice", Icon: Timer },
  { page: "solve", label: "Solve", hash: "#solve", Icon: Calculator },
] as const;

type MoreLink = { label: string; href: string; Icon: typeof Wrench };

/** The More sheet, in the site's one vocabulary: Learn extras first, then Decide and Play, then the colophon. */
const MORE: { title: string; funOnly?: boolean; links: MoreLink[] }[] = [
  {
    title: "Learn",
    links: [
      { label: "Why statistics, in 14 true stories", href: "/story/", Icon: BookText },
      { label: "Formula sheet", href: studyHref("#learn/formulas"), Icon: FileText },
      { label: "Excel, R, Python and SQL guides", href: studyHref("#tools"), Icon: Wrench },
      { label: "Free sources", href: studyHref("#sources"), Icon: LibraryBig },
    ],
  },
  {
    title: "Decide",
    links: [
      { label: `The odds of anything: all ${DECIDE_TOOLS.length} decisions`, href: decideHref(), Icon: Compass },
      { label: "Is this test result real?", href: decideHref("bayes"), Icon: FlaskConical },
    ],
  },
  {
    title: "Play",
    funOnly: true,
    links: [{ label: "Play the games", href: playHref(), Icon: Gamepad2 }],
  },
];

/** Fun or Focus as two choices with a line each, so the switch explains itself on a phone. */
function ModeChoice() {
  const mode = useMode();
  const focus = useHydrated() && mode === "focus";
  const opts = [
    { m: "fun" as const, label: "Fun", line: "Games and celebrations", Icon: Sparkles },
    { m: "focus" as const, label: "Focus", line: "Only the work", Icon: Target },
  ];
  return (
    <div role="radiogroup" aria-label="Site mode" className="grid grid-cols-2 gap-1 rounded-2xl bg-sand p-1">
      {opts.map(({ m, label, line, Icon }) => {
        const on = (m === "focus") === focus;
        return (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => setMode(m)}
            className={cn(
              "flex min-h-14 items-center gap-2.5 rounded-xl px-3 text-left transition-colors",
              on ? "bg-paper text-ink shadow-[0_0_0_1px_var(--line)]" : "text-ink-muted hover:text-ink",
            )}
          >
            <Icon className="size-[18px] shrink-0" aria-hidden />
            <span className="grid leading-tight">
              <span className={cn("text-[0.95rem]", on && "font-medium")}>{label}</span>
              <span className="text-xs text-ink-muted">{line}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Phone-only tab bar: Today (the study landing) and the three study places people go most, plus More for the rest.
 * Learn lights up on Tools and Sources too, since they live under Learn. More lights up on Decide, Play and the story.
 * With `site` (home, Play, Decide, How it's built) no study tab is marked, so every page on a phone has a way into the study app.
 */
export function StudyBottomNav({ site = false }: { site?: boolean }) {
  const pathname = usePathname();
  const section: string | null = useStudySection();
  const navKey = navKeyFor(pathname);
  const active = site ? null : section === "tools" || section === "sources" ? "learn" : section;
  const to = (hash: string) => studyHref(hash);
  const [open, setOpen] = React.useState(false);
  const moreActive = navKey === "decide" || navKey === "play" || !!pathname?.startsWith("/story");
  const item = "flex min-h-14 flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors";

  return (
    <>
      <nav
        aria-label={site ? "Study shortcuts" : "Study"}
        className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-paper/92 px-1 backdrop-blur-md print:hidden lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {TABS.map(({ page, label, hash, Icon }) => (
          <a
            key={page}
            href={to(hash)}
            aria-current={active === page ? "page" : undefined}
            className={cn(item, active === page ? "text-ink" : "text-ink-muted hover:text-ink")}
          >
            <span className={cn("grid h-7 w-12 place-items-center rounded-full transition-colors", active === page && "bg-sand-2")}>
              <Icon className="size-[19px]" strokeWidth={active === page ? 2.4 : 1.8} />
            </span>
            {label}
          </a>
        ))}
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-current={moreActive ? "page" : undefined}
          className={cn(item, moreActive ? "text-ink" : "text-ink-muted hover:text-ink")}
        >
          <span className={cn("grid h-7 w-12 place-items-center rounded-full", moreActive && "bg-sand-2")}>
            <MoreHorizontal className="size-[19px]" />
          </span>
          More
        </button>
      </nav>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" showCloseButton={false} className="rounded-t-[24px] bg-paper px-4 pb-[calc(16px+env(safe-area-inset-bottom))] pt-3">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-display text-xl font-[650]">More</SheetTitle>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="grid size-11 place-items-center rounded-full text-ink-muted hover:bg-sand hover:text-ink"
            >
              <X className="size-5" />
            </button>
          </div>
          <div className="max-h-[70dvh] space-y-5 overflow-y-auto overscroll-contain pb-1">
            {MORE.map((group) => (
              <section key={group.title} aria-label={group.title} className={group.funOnly ? "fun-only" : undefined}>
                <h3 className="mb-1 px-1 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">{group.title}</h3>
                <ul className="divide-y divide-line border-y border-line">
                  {group.links.map(({ label, href, Icon }) => (
                    <li key={label}>
                      <a href={href} onClick={() => setOpen(false)} className="flex min-h-14 items-center gap-3 px-1 text-[0.98rem] hover:text-clay-ink">
                        <Icon className="size-5 text-ink-muted" aria-hidden /> {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
            <section aria-label="Site mode">
              <h3 className="mb-1.5 px-1 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted">Mode</h3>
              <ModeChoice />
            </section>
            <a href="/built/" onClick={() => setOpen(false)} className="flex min-h-11 items-center gap-2 px-1 text-sm text-ink-muted hover:text-ink">
              <Info className="size-4" aria-hidden /> How it&rsquo;s built
            </a>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
