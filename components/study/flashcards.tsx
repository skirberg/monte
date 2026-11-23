"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/cn";
import { TOPICS } from "@/lib/study/data";
import { DECK, dealOrder, type Card } from "@/lib/study/cards";
import { dueToday } from "@/lib/study/memory";
import { review } from "@/lib/study/memory-review";
import { localDay } from "@/lib/study/math";
import { getStudyProgress, rateCard, recall, updateStudyProgress, useStudyProgress } from "@/lib/study/progress";
import { awardBadge, awardXp } from "@/lib/study/events";
import { Select } from "@/components/study/chart";
import { PageHead, btn, lead } from "@/components/study/ui";
import { useHydrated } from "@/lib/hooks";
import { sym } from "@/lib/study/symbols";

const boxOf = (c: Card) => getStudyProgress().cards?.[c.key] ?? 0;

/** End of today, so "due now" includes everything due before bed. */
const endOfToday = () => {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.getTime();
};

/** Cards come back on the memory model's schedule (lib/study/memory.ts): due ones first, then new ones, then the
 *  rest. A Leitner box per card still marks mastery: three right in a row. With nothing rated yet, the deal
 *  starts at the topic read last, or topic 1. "due" deals only the cards due today. */
function deal(kind: string, topic: string) {
  const { cards, mem } = getStudyProgress();
  const now = endOfToday();
  const pool = DECK.filter(
    (c) => (kind === "all" || kind === "due" || c.kind === kind) && (topic === "all" || c.topic === topic || c.topic === "all") && (kind !== "due" || (mem?.[c.key]?.due ?? Infinity) <= now),
  );
  return { pool, queue: dealOrder(pool, cards, recall("sigmaTopic"), Math.random, mem, now) };
}

export function Flashcards() {
  const p = useStudyProgress();
  // Today's "N cards due" link opens /practice/cards/?go=due.
  const params = useSearchParams();
  const [kind, setKind] = React.useState(() => (params.get("go") === "due" ? "due" : "terms"));
  const [topic, setTopic] = React.useState("all");
  const [state, setState] = React.useState(() => {
    const d = deal(kind, "all");
    return { pool: d.pool, cur: d.queue[0] ?? null, queue: d.queue.slice(1), flipped: false };
  });
  const cardRef = React.useRef<HTMLButtonElement>(null);
  const reshuffle = (k = kind, t = topic) => {
    const d = deal(k, t);
    setState({ pool: d.pool, cur: d.queue[0] ?? null, queue: d.queue.slice(1), flipped: false });
  };
  const flip = () => (state.cur ? setState({ ...state, flipped: !state.flipped }) : reshuffle());
  const rate = (got: boolean) => {
    const c = state.cur;
    if (!c || !state.flipped) return;
    const b = boxOf(c);
    // XP only when the card moves up a box, once a day per card: rating the same card again earns nothing.
    let xp = 0;
    updateStudyProgress((s) => {
      xp = rateCard(s, c.key, got, localDay(Date.now()));
      s.mem = { ...s.mem, [c.key]: review(s.mem?.[c.key], got, Date.now()) };
    });
    if (xp) awardXp(xp, "flashcard");
    if (got && b === 2 && Object.values(getStudyProgress().cards ?? {}).filter((x) => x >= 3).length >= 50) awardBadge("cards-50");
    const queue = state.queue.slice();
    if (!got) queue.splice(Math.min(3, queue.length), 0, c);
    setState({ ...state, cur: queue[0] ?? null, queue: queue.slice(1), flipped: false });
    cardRef.current?.focus();
  };

  // Space flips, 1 is Again, 2 is Got it (not while typing in a field).
  const keys = React.useRef({ flip, rate });
  React.useEffect(() => {
    keys.current = { flip, rate };
  });
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tg = (e.target as HTMLElement).tagName;
      if (tg === "INPUT" || tg === "SELECT" || tg === "TEXTAREA") return;
      // Not while a dialog (the progress panel, search) is open over the cards.
      if (e.target instanceof Element && e.target.closest("[role=dialog]")) return;
      if (e.key === " " && (e.target as HTMLElement).id !== "fcard" && tg !== "BUTTON") {
        e.preventDefault();
        keys.current.flip();
      } else if (e.key === "1") keys.current.rate(false);
      else if (e.key === "2") keys.current.rate(true);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const mastered = state.pool.filter((c) => (p.cards?.[c.key] ?? 0) >= 3).length;
  const dueNow = dueToday(p.mem, endOfToday());
  // The deal depends on this browser's progress, so the first card shows after hydration (the server never picks one).
  const ready = useHydrated();
  const cur = ready ? state.cur : null, flipped = ready && state.flipped;
  const left = cur ? state.queue.length + 1 : 0;
  // Due today with nothing due: no round to count, so the page offers the terms instead.
  const noneDue = ready && kind === "due" && state.pool.length === 0;

  return (
    <div className="mx-auto grid w-full max-w-[44rem] gap-6 pb-8">
      {/* The practice layout holds the page's h1. */}
      <PageHead title="Flashcards" as="h2">
        <p className={cn(lead, "text-ink-muted")}>Answer out loud, flip, be honest.</p>
      </PageHead>
      <div className="grid grid-cols-2 gap-3">
        <Select id="cardKind" label="Cards" value={kind} onChange={(v) => { setKind(v); reshuffle(v, topic); }} options={[["due", "Due today"], ["terms", "Terms"], ["formulas", "Formulas"], ["hooks", "Memory hooks"], ["all", "Everything"]]} />
        <Select id="cardTopic" label="Topic" value={topic} onChange={(v) => { setTopic(v); reshuffle(kind, v); }} options={[["all", "All topics"], ...TOPICS.map((t) => [t.id, `${t.n}. ${t.short || t.name}`] as [string, string])]} />
      </div>
      <div className={cn("grid gap-2", noneDue && "invisible")}>
        <p className="text-sm" aria-live="polite">
          {ready && dueNow > 0 && (
            <>
              <b className="font-mono tabular-nums">{dueNow}</b> due today ·{" "}
            </>
          )}
          <b className="font-mono tabular-nums">{mastered}</b> of {state.pool.length} mastered · {left} left in this round
        </p>
        <span aria-hidden className="h-2 overflow-hidden rounded-[4px] bg-sand-2">
          <span className="block h-full bg-clay" style={{ width: `${state.pool.length ? ((mastered / state.pool.length) * 100).toFixed(1) : 0}%` }} />
        </span>
      </div>
      <button
        ref={cardRef}
        id="fcard"
        type="button"
        onClick={flip}
        aria-describedby="fcardHint"
        className={cn(
          "grid min-h-[clamp(15rem,40vh,20rem)] w-full content-center justify-items-center gap-3.5 rounded-card border border-line px-6 py-8 text-center shadow-[0_1px_0_var(--line),0_18px_40px_-28px_color-mix(in_oklch,var(--ink)_40%,transparent)] transition-[transform,background-color] duration-200 hover:border-line-strong active:scale-[0.99]",
          flipped ? "bg-sand" : "bg-paper",
        )}
      >
        <span className="text-sm font-medium text-ink-muted">{cur ? cur.kick : noneDue ? "Due today" : ready ? "Round done" : "Shuffling"}</span>
        <span className="text-balance font-display text-heading font-semibold leading-tight">
          {cur ? sym(cur.front) : !ready ? "" : state.pool.length ? "Nice. Shuffle for another round." : kind === "due" ? "Nothing due. Come back tomorrow." : "No cards match."}
        </span>
        {cur && flipped && (
          <span className="grid max-w-[34rem] gap-2">
            <span className="text-lead leading-normal">{sym(cur.main)}</span>
            <span className="text-sm text-ink-muted">{sym(cur.sub)}</span>
          </span>
        )}
        {cur && <span className="text-sm text-ink-muted">{flipped ? "Did you have it?" : "Tap to flip"}</span>}
      </button>
      <div className="flex flex-wrap gap-2 [&>*]:flex-[1_1_8rem]">
        <button type="button" className={btn.ghost} disabled={!flipped} onClick={() => rate(false)}>
          Again
        </button>
        <button type="button" className={btn.primary} disabled={!flipped} onClick={() => rate(true)}>
          Got it
        </button>
        {noneDue ? (
          <button type="button" className={btn.ghost} onClick={() => { setKind("terms"); reshuffle("terms", topic); }}>
            Practice terms
          </button>
        ) : (
          <button type="button" className={btn.ghost} onClick={() => reshuffle()}>
            Shuffle
          </button>
        )}
      </div>
      {/* Keys only help with a keyboard. */}
      <p id="fcardHint" className="hidden text-sm text-ink-muted [@media(hover:hover)]:block">
        Keys: Space flips, 1 is Again, 2 is Got it.
      </p>
    </div>
  );
}
