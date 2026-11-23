"use client";

import { cn } from "@/lib/cn";
import { useStoredString } from "@/lib/hooks";
import { useToday } from "@/lib/use-today";
import { dailyNumber, parseDaily, type DailyResult } from "@/lib/play/daily";
import type { ShuffleResult } from "@/lib/play/shuffle";
import { CupsGlyph } from "@/components/play/shuffle-game";

/**
 * Today's two dailies under the board, on the first screen of a phone: the Shuffle and the chart, each its
 * picture, its name and today's number, then how you did once played. Learned from the NYT Games app, whose
 * home is a column of today's puzzles with your progress on each. Both jump to the game further down the page.
 */
export function TodayRow({ className }: { className?: string }) {
  const today = useToday();
  const shuffle = useStoredString("monte-shuffle");
  const chart = useStoredString("monte-daily");
  const n = today ? dailyNumber(today) : null;
  const s = today ? parseDaily<ShuffleResult>(shuffle).days[today] : undefined;
  const c = today ? parseDaily<DailyResult>(chart).days[today] : undefined;
  const lifts = s ? (s.lifts === 1 ? "first lift" : `lift ${s.lifts}`) : null;

  return (
    <nav aria-label="Today" className={cn("grid grid-cols-2 gap-gutter", className)}>
      <Item href="#shuffle" art={<CupsGlyph className="h-6 w-auto text-ink" />} name="The Shuffle" n={n} done={lifts} won={s?.lifts === 1} />
      <Item href="#chart" art={<ChartGlyph />} name="Daily chart" n={n} done={c && `${c.you} vs ${c.rule}`} won={!!c && c.you > c.rule} />
    </nav>
  );
}

function Item({ href, art, name, n, done, won }: { href: string; art: React.ReactNode; name: string; n: number | null; done?: string | null | false; won: boolean }) {
  return (
    <a href={href} className="group flex min-h-14 items-center gap-3 border-t border-line pt-3">
      <span className="grid h-10 w-12 shrink-0 place-items-center rounded-inner bg-sand transition-colors group-hover:bg-sand-2">{art}</span>
      <span className="min-w-0">
        <span className="block truncate font-medium leading-tight underline-offset-4 group-hover:underline">{name}</span>
        <span className="block truncate text-sm text-ink-muted tabular">
          {n === null ? " " : `No. ${n}`}
          {done && (
            <>
              {" · "}
              <span className={cn(won && "font-medium text-clay-ink")}>{done}</span>
            </>
          )}
        </span>
      </span>
    </a>
  );
}

/** The daily chart's glyph: a clay line that stops where the hidden stretch begins. */
function ChartGlyph() {
  return (
    <svg viewBox="0 0 40 24" className="h-6 w-auto" aria-hidden="true">
      <rect x="26" y="1" width="13" height="22" rx="3" fill="var(--sand-2)" stroke="var(--line-strong)" strokeDasharray="2 2" />
      <path d="M2 16 L7 9 L12 13 L17 5 L22 11 L26 8" fill="none" stroke="var(--clay)" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="26" cy="8" r="2.4" fill="var(--clay)" />
    </svg>
  );
}
