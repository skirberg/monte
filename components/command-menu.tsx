"use client";

import * as React from "react";
import { ArrowRight, BookOpen, BookText, Calculator, Compass, Gamepad2, House, Info, Layers, LibraryBig, Moon, Sparkles, Sun, Target, Timer, Wrench } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { DECIDE_TOOLS, GAMES, SITE_NAV, SOLVERS, TOOLS, TOPICS, decideHref, playHref, studyHref } from "@/lib/site-data";
import { setMode, useMode } from "@/lib/mode";


/** Every word typed must appear somewhere in the item. Fuzzy letter matching found "bayes" in every topic. */
function match(value: string, search: string) {
  const v = value.toLowerCase();
  return search.toLowerCase().split(/\s+/).filter(Boolean).every((w) => v.includes(w)) ? 1 : 0;
}

export function CommandMenu({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { resolvedTheme, setTheme } = useTheme();
  const mode = useMode();
  const router = useRouter();
  const go = (path: string) => router.push(path);
  const goStudy = (hash: string) => go(studyHref(hash));

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const run = (fn: () => void) => {
    onOpenChange(false);
    fn();
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Jump to anything"
      description="Search Learn, Practice, Solve, Decide and Play"
      className="sm:max-w-xl"
    >
      <Command filter={match}>
        <CommandInput placeholder="Try normal, Bayes, warranty, Excel…" />
        <CommandList className="max-h-[min(60vh,440px)]">
          <CommandEmpty>Nothing matches. Try a simpler word like mean, SD or Poisson.</CommandEmpty>
          <CommandGroup heading="Learn">
            {TOPICS.map((t) => (
              <CommandItem
                key={t.id}
                value={`learn topic ${t.n} ${t.name}`}
                keywords={[t.keywords, t.line]}
                onSelect={() => run(() => goStudy(`#learn/topics/${t.id}`))}
              >
                <span className="w-6 font-mono text-xs text-muted-foreground tabular">{String(t.n).padStart(2, "0")}</span>
                <span>{t.name}</span>
              </CommandItem>
            ))}
            <CommandItem value="learn formula sheet print" onSelect={() => run(() => goStudy("#learn/formulas"))}>
              <BookOpen /> Formula sheet
            </CommandItem>
            <CommandItem value="learn frameworks chooser which formula" onSelect={() => run(() => goStudy("#learn/frameworks"))}>
              <Compass /> Which formula do I need?
            </CommandItem>
            <CommandItem value="learn terms glossary definitions vocabulary words" onSelect={() => run(() => goStudy("#learn/terms"))}>
              <BookOpen /> Terms: every key word in plain English
            </CommandItem>
            <CommandItem value="learn why statistics story stories history matters" onSelect={() => run(() => go("/story/"))}>
              <BookText /> Why statistics, in 14 true stories
            </CommandItem>
            {TOOLS.map((t) => (
              <CommandItem key={t.id} value={`learn tool guide ${t.name} cheat sheet`} onSelect={() => run(() => goStudy(`#tools/${t.id}`))}>
                <Wrench /> {t.name} guide
              </CommandItem>
            ))}
            <CommandItem value="learn free sources books courses videos" onSelect={() => run(() => goStudy("#sources"))}>
              <LibraryBig /> Free sources
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Practice">
            <CommandItem value="practice drill start 10 questions" onSelect={() => run(() => goStudy("#practice/drill/start"))}>
              <Timer /> Start 10 questions
            </CommandItem>
            <CommandItem value="practice mock test exam timed 20 questions" onSelect={() => run(() => goStudy("#practice/drill/mock"))}>
              <Timer /> Mock test, 20 questions, 30 minutes
            </CommandItem>
            <CommandItem value="practice quick math sprint" onSelect={() => run(() => goStudy("#practice/math"))}>
              <Timer /> Quick math sprint
            </CommandItem>
            <CommandItem value="practice flashcards cards memorize terms formulas review" onSelect={() => run(() => goStudy("#practice/cards"))}>
              <Layers /> Flashcards
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Solve">
            {SOLVERS.map((s) => (
              <CommandItem key={s.id} value={`solve solver ${s.name}`} onSelect={() => run(() => goStudy(`#solve/${s.id}`))}>
                <Calculator /> {s.name}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Decide">
            <CommandItem value="decide odds of anything all decisions" onSelect={() => run(() => go(decideHref()))}>
              <Compass /> All decisions: the odds of anything
            </CommandItem>
            {DECIDE_TOOLS.map((d) => (
              <CommandItem key={d.id} value={`decide ${d.name} ${d.keywords}`} onSelect={() => run(() => go(decideHref(d.id)))}>
                <Compass /> {d.name}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          {/* Play is hidden in Focus mode. Not rendered rather than hidden, so arrow keys never land on an invisible item. */}
          {mode !== "focus" && (
            <>
              <CommandGroup heading="Play">
                {GAMES.map((g) => (
                  <CommandItem key={g.slug} value={`play game ${g.name} ${g.line}`} onSelect={() => run(() => go(playHref(g.slug)))}>
                    <Gamepad2 /> {g.name}
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
            </>
          )}
          <CommandGroup heading="Go to">
            <CommandItem value="page today study plan home due" onSelect={() => run(() => goStudy("#home"))}>
              <House /> Today: your study plan
            </CommandItem>
            {SITE_NAV.filter((n) => mode !== "focus" || n.key !== "play").map((n) => (
              <CommandItem key={n.key} value={`page ${n.label}`} onSelect={() => run(() => go(n.href))}>
                <ArrowRight /> {n.label}
              </CommandItem>
            ))}
            <CommandItem value="page how it's built colophon stack data math sources" onSelect={() => run(() => go("/built/"))}>
              <Info /> How it&rsquo;s built
            </CommandItem>
            <CommandItem
              value="mode fun focus serious"
              onSelect={() => run(() => setMode(mode === "focus" ? "fun" : "focus"))}
            >
              {mode === "focus" ? <Sparkles /> : <Target />} Switch to {mode === "focus" ? "fun" : "focus"} mode
            </CommandItem>
            <CommandItem
              value="theme dark light mode"
              onSelect={() => run(() => setTheme(resolvedTheme === "dark" ? "light" : "dark"))}
            >
              {resolvedTheme === "dark" ? <Sun /> : <Moon />} Switch to {resolvedTheme === "dark" ? "light" : "dark"} mode
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
