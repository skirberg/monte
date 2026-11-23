"use client";

import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";
import { ArrowRight, BookOpen, BookText, Calculator, Compass, Gamepad2, House, Info, Layers, LibraryBig, Monitor, Moon, Search, Sparkles, Sun, Target, Timer, Wrench } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { DECIDE_TOOLS, GAMES, SITE_NAV, SOLVERS, TOOLS, TOPICS, decideHref, playHref, studyHref, type SiteNavKey } from "@/lib/site-data";
import { setMode, useMode } from "@/lib/mode";
import { match } from "@/lib/command-match";

/** Rows are thumb-sized on a phone and compact on a desktop. */
const ROW = "min-h-12 gap-3 px-3 text-base sm:min-h-10 sm:text-sm";
const HINT = "ml-auto pl-3 text-xs text-muted-foreground";

const SECTION_ICON: Record<SiteNavKey, typeof Compass> = { learn: BookOpen, practice: Timer, solve: Calculator, decide: Compass, play: Gamepad2 };
const SECTION_HINT: Record<SiteNavKey, string> = {
  learn: `${TOPICS.length} topics`,
  practice: "Drills, mock test, cards",
  solve: `${SOLVERS.length} solvers`,
  decide: `${DECIDE_TOOLS.length} decisions`,
  play: `${GAMES.length} games`,
};

// The visible viewport ("height:top"), so on a phone the panel ends at the top of the keyboard instead of behind it.
// iOS Safari keeps the layout viewport full height when the keyboard opens; only visualViewport shrinks.
const subscribeViewport = (cb: () => void) => {
  const vv = window.visualViewport;
  vv?.addEventListener("resize", cb);
  vv?.addEventListener("scroll", cb);
  return () => {
    vv?.removeEventListener("resize", cb);
    vv?.removeEventListener("scroll", cb);
  };
};
const viewportSnapshot = () => {
  const vv = window.visualViewport;
  return vv ? `${Math.round(vv.height)}:${Math.round(vv.offsetTop)}` : "";
};

/** Words people search for that a game's name doesn't say (the famous name, the sport, the thing on screen). */
const GAME_WORDS: Record<string, string> = {
  "monty-hall": "monty hall doors goat car switch",
  serve: "tennis serve atp",
  "fake-coin": "coin flips random streaks",
  correlation: "scatter plot r",
  "house-edge": "roulette casino",
  odds: "betting bookmaker odds",
  "ab-test": "peeking significance",
  "long-run": "stocks s&p invest returns",
  options: "black scholes stock",
  election: "polls polling forecast",
};

export function CommandMenu({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { resolvedTheme, setTheme } = useTheme();
  const mode = useMode();
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const viewport = React.useSyncExternalStore(subscribeViewport, viewportSnapshot, () => "");
  const [vvh, vvt] = viewport.split(":");
  const go = (path: string) => router.push(path);
  const goStudy = (hash: string) => go(studyHref(hash));
  const searching = query.trim() !== "";

  const setOpen = (o: boolean) => {
    if (!o) setQuery("");
    onOpenChange(o);
  };

  // ⌘K / Ctrl+K lives in the site header, which loads this menu on first use. Closing it from there clears the search
  // (set while rendering, React's pattern for state that follows a prop).
  const [wasOpen, setWasOpen] = React.useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (!open) setQuery("");
  }

  const run = (fn: () => void) => {
    setOpen(false);
    fn();
  };

  const sections = SITE_NAV.filter((n) => mode !== "focus" || n.key !== "play");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        showCloseButton={false}
        style={vvh ? ({ "--vvh": `${vvh}px`, "--vvt": `${vvt}px` } as React.CSSProperties) : undefined}
        className={cn(
          "flex flex-col gap-0 overflow-hidden p-0",
          // Phone: a full-screen panel above the keyboard, search field at the top, no zoom.
          "max-sm:top-(--vvt,0px) max-sm:left-0 max-sm:h-(--vvh,100dvh) max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-none max-sm:bg-paper max-sm:ring-0 max-sm:data-open:zoom-in-100 max-sm:data-closed:zoom-out-100",
          // Larger screens: a box near the top of the page.
          "sm:top-[12vh] sm:max-w-xl sm:translate-y-0 sm:rounded-xl",
        )}
      >
        <DialogTitle className="sr-only">Jump to anything</DialogTitle>
        <DialogDescription className="sr-only">Search Learn, Practice, Solve, Decide and Play</DialogDescription>
        <Command filter={match} shouldFilter={searching} className="min-h-0 flex-1 rounded-none! bg-transparent p-0">
          <div className="flex items-center gap-1 border-b border-line px-3 pb-2 pt-[calc(0.5rem+env(safe-area-inset-top))] sm:px-2 sm:pt-2">
            <label className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-full bg-sand px-3.5 sm:rounded-lg sm:bg-transparent sm:px-2">
              <Search className="size-[18px] shrink-0 text-ink-muted" aria-hidden />
              {/* 16px text: iOS Safari zooms the whole page when a smaller input takes focus. */}
              <CommandPrimitive.Input
                value={query}
                onValueChange={setQuery}
                placeholder="Try normal, Bayes, Excel…"
                inputMode="search"
                enterKeyHint="go"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                className="h-full w-full min-w-0 bg-transparent text-base text-ink outline-none placeholder:text-ink-muted"
              />
            </label>
            <DialogClose className="flex min-h-11 items-center px-2 text-base font-medium text-ink sm:hidden">Cancel</DialogClose>
            <DialogClose
              aria-label="Close"
              className="mr-1 hidden rounded-md border border-line bg-sand px-1.5 py-0.5 font-mono text-xs text-ink-muted hover:text-ink sm:block"
            >
              esc
            </DialogClose>
          </div>

          <CommandList className="max-h-none flex-1 overscroll-contain p-1 pb-[calc(0.5rem+env(safe-area-inset-bottom))] sm:max-h-[min(60vh,440px)] sm:flex-none">
            {searching ? (
              <>
                <CommandEmpty>Nothing matches. Try a simpler word like mean, SD or Poisson.</CommandEmpty>
                <CommandGroup heading="Learn">
                  {TOPICS.map((t) => (
                    <CommandItem
                      key={t.id}
                      className={ROW}
                      value={`learn topic ${t.n} ${t.name}`}
                      keywords={[t.keywords, t.line]}
                      onSelect={() => run(() => goStudy(`#learn/topics/${t.id}`))}
                    >
                      <span className="w-5 text-center font-mono text-xs text-muted-foreground tabular">{t.n}</span>
                      <span>{t.short}</span>
                    </CommandItem>
                  ))}
                  <CommandItem className={ROW} value="learn formula sheet print" onSelect={() => run(() => goStudy("#learn/formulas"))}>
                    <BookOpen /> Formula sheet
                  </CommandItem>
                  <CommandItem className={ROW} value="learn frameworks chooser which formula" onSelect={() => run(() => goStudy("#learn/frameworks"))}>
                    <Compass /> Which formula do I need?
                  </CommandItem>
                  <CommandItem className={ROW} value="learn start first step one value average range unknown mean three questions" onSelect={() => run(() => goStudy("#learn/start"))}>
                    <Compass /> One value, an average, or a range?
                  </CommandItem>
                  <CommandItem className={ROW} value="learn terms glossary definitions vocabulary words" onSelect={() => run(() => goStudy("#learn/terms"))}>
                    <BookOpen /> Terms: every key word in plain English
                  </CommandItem>
                  <CommandItem className={ROW} value="learn why statistics story stories history matters" onSelect={() => run(() => go("/story/"))}>
                    <BookText /> Why statistics, in 14 true stories
                  </CommandItem>
                  {TOOLS.map((t) => (
                    <CommandItem key={t.id} className={ROW} value={`learn tool guide ${t.name} cheat sheet`} onSelect={() => run(() => goStudy(`#tools/${t.id}`))}>
                      <Wrench /> {t.name} guide
                    </CommandItem>
                  ))}
                  <CommandItem className={ROW} value="learn free sources books courses videos" onSelect={() => run(() => goStudy("#sources"))}>
                    <LibraryBig /> Free sources
                  </CommandItem>
                </CommandGroup>
                <CommandGroup heading="Practice">
                  <CommandItem className={ROW} value="practice drill start 10 questions" onSelect={() => run(() => goStudy("#practice/drill/start"))}>
                    <Timer /> Start 10 questions
                  </CommandItem>
                  <CommandItem className={ROW} value="practice mock test exam timed 20 questions" onSelect={() => run(() => goStudy("#practice/drill/mock"))}>
                    <Timer /> Mock test, 20 questions, 30 minutes
                  </CommandItem>
                  <CommandItem className={ROW} value="practice quick math sprint" onSelect={() => run(() => goStudy("#practice/math"))}>
                    <Timer /> Quick math sprint
                  </CommandItem>
                  <CommandItem className={ROW} value="practice flashcards cards memorize terms formulas review" onSelect={() => run(() => goStudy("#practice/cards"))}>
                    <Layers /> Flashcards
                  </CommandItem>
                </CommandGroup>
                <CommandGroup heading="Solve">
                  {SOLVERS.map((s) => (
                    <CommandItem key={s.id} className={ROW} value={`solve solver ${s.name}`} onSelect={() => run(() => goStudy(`#solve/${s.id}`))}>
                      <Calculator /> {s.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandGroup heading="Decide">
                  <CommandItem className={ROW} value="decide odds of anything all decisions" onSelect={() => run(() => go(decideHref()))}>
                    <Compass /> All decisions: the odds of anything
                  </CommandItem>
                  {DECIDE_TOOLS.map((d) => (
                    <CommandItem key={d.id} className={ROW} value={`decide ${d.name} ${d.keywords}`} onSelect={() => run(() => go(decideHref(d.id)))}>
                      <Compass /> {d.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
                {/* Play is hidden in Focus mode. Not rendered rather than hidden, so arrow keys never land on an invisible item. */}
                {mode !== "focus" && (
                  <CommandGroup heading="Play">
                    {GAMES.map((g) => (
                      <CommandItem key={g.slug} className={ROW} value={`play games game ${g.name} ${g.line} ${GAME_WORDS[g.slug] ?? ""}`} onSelect={() => run(() => go(playHref(g.slug)))}>
                        <Gamepad2 /> {g.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                <CommandGroup heading="Go to">
                  <CommandItem className={ROW} value="page home landing front page board" onSelect={() => run(() => go("/"))}>
                    <House /> Home
                  </CommandItem>
                  <CommandItem className={ROW} value="page today study plan due" onSelect={() => run(() => goStudy("#home"))}>
                    <House /> Today: your study plan
                  </CommandItem>
                  {sections.map((n) => (
                    <CommandItem key={n.key} className={ROW} value={`page ${n.label}`} onSelect={() => run(() => go(n.href))}>
                      <ArrowRight /> {n.label}
                    </CommandItem>
                  ))}
                  <CommandItem className={ROW} value="page how it's built colophon stack data math sources" onSelect={() => run(() => go("/built/"))}>
                    <Info /> How it&rsquo;s built
                  </CommandItem>
                  <CommandItem className={ROW} value="mode fun focus serious" onSelect={() => run(() => setMode(mode === "focus" ? "fun" : "focus"))}>
                    {mode === "focus" ? <Sparkles /> : <Target />} Switch to {mode === "focus" ? "fun" : "focus"} mode
                  </CommandItem>
                  <CommandItem className={ROW} value="theme dark light mode" onSelect={() => run(() => setTheme(resolvedTheme === "dark" ? "light" : "dark"))}>
                    {resolvedTheme === "dark" ? <Sun /> : <Moon />} Switch to {resolvedTheme === "dark" ? "light" : "dark"} mode
                  </CommandItem>
                  <CommandItem className={ROW} value="theme system auto device match" onSelect={() => run(() => setTheme("system"))}>
                    <Monitor /> Match my device&rsquo;s theme
                  </CommandItem>
                </CommandGroup>
              </>
            ) : (
              // Before anything is typed: a short start list and the five places, not all 69 entries at once.
              <>
                <CommandGroup heading="Start here">
                  <CommandItem className={ROW} value="today" onSelect={() => run(() => goStudy("#home"))}>
                    <House /> Today: your study plan
                  </CommandItem>
                  <CommandItem className={ROW} value="drill" onSelect={() => run(() => goStudy("#practice/drill/start"))}>
                    <Timer /> Start 10 questions
                  </CommandItem>
                  <CommandItem className={ROW} value="frameworks" onSelect={() => run(() => goStudy("#learn/frameworks"))}>
                    <Compass /> Which formula do I need?
                  </CommandItem>
                  <CommandItem className={ROW} value="formulas" onSelect={() => run(() => goStudy("#learn/formulas"))}>
                    <BookOpen /> Formula sheet
                  </CommandItem>
                </CommandGroup>
                <CommandSeparator className="mx-2" />
                <CommandGroup heading="Browse">
                  {sections.map((n) => {
                    const Icon = SECTION_ICON[n.key];
                    return (
                      <CommandItem key={n.key} className={ROW} value={`browse ${n.key}`} onSelect={() => run(() => go(n.href))}>
                        <Icon /> {n.label}
                        <span data-slot="command-shortcut" className={HINT}>{SECTION_HINT[n.key]}</span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
