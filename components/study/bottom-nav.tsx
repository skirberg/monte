"use client";

import * as React from "react";
import { BookOpen, Calculator, FileText, Gamepad2, House, Info, LibraryBig, MoreHorizontal, Timer, Wrench, X } from "lucide-react";
import { cn } from "cn";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useHashPage } from "@/lib/use-hash-page";
import { playHref, studyHref } from "@/lib/site-data";

const TABS = [
  { page: "home", label: "Today", hash: "#home", Icon: House },
  { page: "learn", label: "Learn", hash: "#learn", Icon: BookOpen },
  { page: "practice", label: "Practice", hash: "#practice", Icon: Timer },
  { page: "solve", label: "Solve", hash: "#solve", Icon: Calculator },
] as const;

/**
 * Phone-only tab bar: the four study places people go most, plus More for the rest. On /study the
 * tabs are hash links inside the engine; with `site` (home, Play, How it's built) they link into /study
 * and nothing is marked current, so every page on a phone has a way into the study app.
 */
export function StudyBottomNav({ site = false }: { site?: boolean }) {
  const hashPage = useHashPage(true);
  const active = site ? null : hashPage;
  const to = (hash: string) => (site ? studyHref(hash) : hash);
  const [open, setOpen] = React.useState(false);
  const moreActive = active === "tools" || active === "sources";
  const item = "flex min-h-14 flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors";

  const more: { label: string; href: string; Icon: typeof Wrench; funOnly?: boolean }[] = [
    { label: "Tools: Excel, R, Python, Power Query", href: to("#tools"), Icon: Wrench },
    { label: "Formula sheet", href: to("#learn/formulas"), Icon: FileText },
    { label: "Free sources", href: to("#sources"), Icon: LibraryBig },
    { label: "Play the games", href: playHref(), Icon: Gamepad2, funOnly: true },
    { label: "How it's built", href: "/built/", Icon: Info },
  ];

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
          <ul className="divide-y divide-line border-y border-line">
            {more.map(({ label, href, Icon, funOnly }) => (
              <li key={label} className={funOnly ? "fun-only" : undefined}>
                <a href={href} onClick={() => setOpen(false)} className="flex min-h-14 items-center gap-3 px-1 text-[0.98rem] hover:text-clay-ink">
                  <Icon className="size-5 text-ink-muted" /> {label}
                </a>
              </li>
            ))}
          </ul>
        </SheetContent>
      </Sheet>
    </>
  );
}
