"use client";

import * as React from "react";
import { ArrowUpRight, Moon, Search, Sparkles, Sun, Target } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "cn";
import { Wordmark } from "@/components/brand/logo";
import { CommandMenu } from "@/components/command-menu";
import { STUDY_NAV, playHref, studyHref } from "@/lib/site-data";
import { useHydrated } from "@/lib/hooks";
import { useHashPage } from "@/lib/use-hash-page";
import { setMode, useMode } from "@/lib/mode";

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

/** Fun or Focus. Full labels on wide screens, one icon button below that. */
function ModeToggle() {
  const mode = useMode();
  const hydrated = useHydrated();
  const focus = hydrated && mode === "focus";
  const seg = "flex h-11 items-center gap-1.5 rounded-full px-3.5 text-[0.85rem] transition-colors";
  return (
    <>
      <div role="radiogroup" aria-label="Site mode" className="hidden h-12 items-center rounded-full bg-sand p-0.5 xl:flex">
        {(["fun", "focus"] as const).map((m) => {
          const on = (m === "focus") === focus;
          return (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => setMode(m)}
              className={cn(seg, on ? "bg-paper font-medium text-ink shadow-[0_0_0_1px_var(--line)]" : "text-ink-muted hover:text-ink")}
            >
              {m === "fun" ? <Sparkles className="size-3.5" /> : <Target className="size-3.5" />}
              {m === "fun" ? "Fun" : "Focus"}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => setMode(focus ? "fun" : "focus")}
        className="grid size-11 place-items-center rounded-full text-ink-muted transition-colors hover:bg-sand hover:text-ink xl:hidden"
        aria-label={focus ? "Focus mode is on. Switch to fun mode" : "Fun mode is on. Switch to focus mode"}
        title={focus ? "Focus mode" : "Fun mode"}
      >
        {focus ? <Target className="size-[18px]" /> : <Sparkles className="size-[18px]" />}
      </button>
    </>
  );
}

type Item = { key: string; label: string; href: string; active: boolean; funOnly?: boolean };

export function SiteHeader({ mode }: { mode: "landing" | "study" | "play" }) {
  const study = mode === "study";
  const active = useHashPage(study);
  const [open, setOpen] = React.useState(false);

  const items: Item[] = [
    ...STUDY_NAV.filter((n) => study || !["home", "sources"].includes(n.page)).map((n) => ({
      key: n.page,
      label: n.label,
      href: study ? n.hash : studyHref(n.hash),
      active: study && active === n.page,
    })),
    { key: "play", label: "Play", href: playHref(), active: mode === "play", funOnly: true },
  ];

  const navLink = (n: Item, extra?: string) => (
    <a
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
    </a>
  );

  return (
    <>
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-paper px-3 py-2 text-ink focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:ring-2 focus:ring-clay"
      >
        Skip to content
      </a>
      <header
        className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur-md print:hidden"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="mx-auto flex h-14 max-w-[1200px] items-center gap-2 px-4 md:h-16 md:px-6">
          {/* A full page load on purpose: the study engine binds window listeners that must not outlive /study. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/" className="mr-2 flex min-h-11 items-center rounded-md" aria-label="Monte home">
            <Wordmark />
          </a>

          <nav aria-label="Main" className={cn("hidden self-stretch", study ? "lg:flex" : "md:flex")}>
            {items.map((n) => navLink(n, "self-stretch"))}
          </nav>

          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex h-11 min-w-11 items-center justify-center gap-2 rounded-full px-3 text-sm text-ink-muted transition-colors hover:bg-sand hover:text-ink xl:border xl:border-line xl:pr-2"
              aria-label="Search topics, drills and solvers"
            >
              <Search className="size-[18px]" />
              <span className="hidden xl:inline">Jump to</span>
              <kbd className="hidden rounded-md border border-line bg-sand px-1.5 py-0.5 font-mono text-[11px] text-ink-muted xl:inline">
                ⌘K
              </kbd>
            </button>
            <ModeToggle />
            <ThemeButton />
            {!study && (
              <a
                href={studyHref("#learn/topics/data")}
                className="ml-1 hidden h-11 items-center gap-1.5 rounded-full bg-ink px-4 text-sm font-medium text-paper transition-colors hover:bg-ink/85 sm:flex md:hidden xl:flex"
              >
                Start studying <ArrowUpRight className="size-4" />
              </a>
            )}
          </div>
        </div>

      </header>
      <CommandMenu open={open} onOpenChange={setOpen} />
    </>
  );
}
