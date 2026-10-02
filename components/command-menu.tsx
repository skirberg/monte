"use client";

import * as React from "react";
import { BookOpen, Calculator, Compass, Gamepad2, Moon, Sparkles, Sun, Target, Timer, Wrench } from "lucide-react";
import { useTheme } from "next-themes";
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
import { GAMES, SOLVERS, STUDY_NAV, STUDY_PATH, TOOLS, TOPICS, playHref } from "@/lib/site-data";
import { setMode, useMode } from "@/lib/mode";

/** Full page load on purpose: /study binds window listeners that must not leak into other pages. */
function go(path: string) {
  window.location.assign(path);
}

/** Go to a study route. On /study we only change the hash so the engine keeps its state. */
export function goStudy(hash: string) {
  if (typeof window === "undefined") return;
  if (window.location.pathname.replace(/\/?$/, "/") === STUDY_PATH) window.location.hash = hash;
  else window.location.href = STUDY_PATH + hash;
}

/** Every word typed must appear somewhere in the item. Fuzzy letter matching found "bayes" in every topic. */
function match(value: string, search: string) {
  const v = value.toLowerCase();
  return search.toLowerCase().split(/\s+/).filter(Boolean).every((w) => v.includes(w)) ? 1 : 0;
}

export function CommandMenu({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { resolvedTheme, setTheme } = useTheme();
  const mode = useMode();

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
      description="Search topics, drills, solvers and tools"
      className="sm:max-w-xl"
    >
      <Command filter={match}>
        <CommandInput placeholder="Try normal, Bayes, regression, Excel…" />
        <CommandList className="max-h-[min(60vh,440px)]">
          <CommandEmpty>Nothing matches. Try a simpler word like mean, SD or Poisson.</CommandEmpty>
          <CommandGroup heading="Topics">
            {TOPICS.map((t) => (
              <CommandItem
                key={t.id}
                value={`topic ${t.n} ${t.name} ${t.line}`}
                onSelect={() => run(() => goStudy(`#learn/topics/${t.id}`))}
              >
                <span className="w-6 font-mono text-xs text-muted-foreground tabular">{String(t.n).padStart(2, "0")}</span>
                <span>{t.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Practice">
            <CommandItem value="drill start 10 questions" onSelect={() => run(() => goStudy("#practice/drill/start"))}>
              <Timer /> Start 10 questions
            </CommandItem>
            <CommandItem value="mock exam timed closed book" onSelect={() => run(() => goStudy("#practice/drill/mock"))}>
              <Timer /> Mock exam, 20 questions, 30 minutes
            </CommandItem>
            <CommandItem value="quick math sprint" onSelect={() => run(() => goStudy("#practice/math"))}>
              <Timer /> Quick math sprint
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Play">
            {GAMES.map((g) => (
              <CommandItem key={g.slug} value={`game play ${g.name} ${g.line}`} onSelect={() => run(() => go(playHref(g.slug)))}>
                <Gamepad2 /> {g.name}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Solve">
            {SOLVERS.map((s) => (
              <CommandItem key={s.id} value={`solver ${s.name}`} onSelect={() => run(() => goStudy(`#solve/${s.id}`))}>
                <Calculator /> {s.name}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Reference">
            <CommandItem value="formula sheet print" onSelect={() => run(() => goStudy("#learn/formulas"))}>
              <BookOpen /> Formula sheet
            </CommandItem>
            <CommandItem value="frameworks chooser which formula" onSelect={() => run(() => goStudy("#learn/frameworks"))}>
              <Compass /> Frameworks: which formula do I need
            </CommandItem>
            <CommandItem value="how it's built colophon stack data math sources" onSelect={() => run(() => go("/built/"))}>
              <BookOpen /> How it&rsquo;s built
            </CommandItem>
            {TOOLS.map((t) => (
              <CommandItem key={t.id} value={`tool ${t.name}`} onSelect={() => run(() => goStudy(`#tools/${t.id}`))}>
                <Wrench /> {t.name} cheat sheet
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Go to">
            {STUDY_NAV.map((n) => (
              <CommandItem key={n.page} value={`page ${n.label}`} onSelect={() => run(() => goStudy(n.hash))}>
                {n.label}
              </CommandItem>
            ))}
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
