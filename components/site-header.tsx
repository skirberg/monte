"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Moon, Search, Sparkles, Sun, Target } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "cn";
import { Wordmark } from "@/components/brand/logo";
import { CommandMenu } from "@/components/command-menu";
import { usePathname } from "next/navigation";
import { SITE_NAV, navKeyFor, studyHref, type SiteNavKey } from "@/lib/site-data";
import { useHydrated } from "@/lib/hooks";
import { setMode, useMode } from "@/lib/mode";
import { ProgressButton } from "@/components/progress";

function ThemeButton() {
  const { resolvedTheme, setTheme } = useTheme();
  const dark = useHydrated() && resolvedTheme === "dark";
  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? "light" : "dark")}
      className="grid size-11 place-items-center rounded-full text-ink-muted transition-colors hover:bg-sand hover:text-ink"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {dark ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
    </button>
  );
}

/**
 * Fun or Focus, as one compact icon button. The icon shows the current mode; the label and tooltip say what a press does.
 * On phones it lives in the More sheet instead (components/study/bottom-nav.tsx); ⌘K has it everywhere.
 */
export function ModeToggle({ className }: { className?: string }) {
  const mode = useMode();
  const hydrated = useHydrated();
  const focus = hydrated && mode === "focus";
  const label = focus ? "Focus mode is on: only the work. Switch to Fun mode" : "Fun mode is on: games and celebrations. Switch to Focus mode";
  return (
    <button
      type="button"
      onClick={() => setMode(focus ? "fun" : "focus")}
      className={cn(
        "grid size-11 place-items-center rounded-full text-ink-muted transition-colors hover:bg-sand hover:text-ink",
        className,
      )}
      aria-label={label}
      title={focus ? "Focus mode (press for Fun)" : "Fun mode (press for Focus)"}
    >
      {focus ? <Target className="size-[18px]" /> : <Sparkles className="size-[18px]" />}
    </button>
  );
}

type Item = { key: SiteNavKey; label: string; href: string; active: boolean; funOnly?: boolean };

export function SiteHeader({ mode }: { mode: "landing" | "study" | "play" }) {
  const study = mode === "study";
  const current = navKeyFor(usePathname());
  const [open, setOpen] = React.useState(false);

  const items: Item[] = SITE_NAV.map((n) => ({
    key: n.key,
    label: n.label,
    href: n.href,
    active: current === n.key,
    funOnly: n.key === "play",
  }));

  const navLink = (n: Item, extra?: string) => (
    <Link
      key={n.key}
      href={n.href}
      aria-current={n.active ? "page" : undefined}
      className={cn(
        "relative flex min-h-11 items-center whitespace-nowrap px-3 text-[0.9rem] text-ink-muted transition-colors hover:text-ink",
        "aria-[current=page]:font-medium aria-[current=page]:text-ink",
        "after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-clay after:transition-transform after:duration-200 aria-[current=page]:after:scale-x-100",
        n.funOnly && "fun-only",
        extra,
      )}
    >
      {n.label}
    </Link>
  );

  return (
    <>
      <a
        href="#main"
        onClick={(e) => {
          // Move focus without changing the hash: in the study app every hash is a route.
          const main = document.getElementById("main");
          if (!main) return;
          e.preventDefault();
          main.focus();
          main.scrollIntoView();
        }}
        className="sr-only z-50 rounded-md bg-paper px-3 py-2 text-ink focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:ring-2 focus:ring-clay"
      >
        Skip to content
      </a>
      <header
        className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur-md print:hidden"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="mx-auto flex h-14 max-w-[1200px] items-center gap-2 px-4 md:h-16 md:px-6">
          <Link href="/" className="mr-2 flex min-h-11 items-center rounded-md" aria-label="Monte home">
            <Wordmark />
          </Link>

          <nav aria-label="Main" className="hidden self-stretch md:flex">
            {items.map((n) => navLink(n, "self-stretch"))}
          </nav>

          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex h-11 min-w-11 items-center justify-center gap-2 rounded-full px-3 text-sm text-ink-muted transition-colors hover:bg-sand hover:text-ink xl:border xl:border-line xl:pr-2"
              aria-label="Search everything: topics, drills, solvers, decisions and games"
            >
              <Search className="size-[18px]" />
              <span className="hidden xl:inline">Jump to</span>
              <kbd className="hidden rounded-md border border-line bg-sand px-1.5 py-0.5 font-mono text-[11px] text-ink-muted xl:inline">
                ⌘K
              </kbd>
            </button>
            <ProgressButton />
            <ModeToggle className="hidden lg:grid" />
            <ThemeButton />
            {!study && (
              <a
                href={studyHref("#learn/topics/data")}
                className="ml-1 hidden h-11 items-center gap-1.5 rounded-full bg-ink px-4 text-sm font-medium text-paper transition-colors hover:bg-ink/85 sm:flex md:hidden xl:flex"
              >
                Start studying <ArrowRight className="size-4" />
              </a>
            )}
          </div>
        </div>

      </header>
      <CommandMenu open={open} onOpenChange={setOpen} />
    </>
  );
}
