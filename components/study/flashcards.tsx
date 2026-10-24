"use client";

import * as React from "react";
import { cn } from "cn";
import { DATA, TOPICS } from "@/lib/study/data";
import { getStudyProgress, touchStreak, updateStudyProgress, useStudyProgress } from "@/lib/study/progress";
import { awardBadge, awardXp } from "@/lib/study/events";
import { Select } from "@/components/study/chart";
import { PageHead, btn, lead } from "@/components/study/ui";
import { useHydrated } from "@/lib/hooks";
import { sym } from "@/lib/study/symbols";

type Card = { key: string; kind: "terms" | "formulas" | "hooks"; topic: string; kick: string; front: string; main: string; sub: string };

const short = Object.fromEntries(TOPICS.map((t) => [t.id, t.short || t.name]));
// Keys match the original engine's, so boxes already earned stay earned.
const DECK: Card[] = [
  ...DATA.terms.map(([term, topic, meaning, ex]) => ({ key: `t:${term}`, kind: "terms" as const, topic, kick: `Term · ${short[topic]}`, front: term, main: meaning, sub: `Example: ${ex}` })),
  ...TOPICS.flatMap((t) =>
    (DATA.sheet[t.id] ?? []).map(([name, f, ex, alias]) => ({
      key: `f:${t.id}:${name}`, kind: "formulas" as const, topic: t.id as string, kick: `Formula · ${short[t.id]}`, front: name + (alias ? `, ${alias}` : ""), main: f, sub: `Example: ${ex}`,
    })),
  ),
  ...DATA.hooks.map(([name, label, hook, expands]) => ({ key: `h:${name}`, kind: "hooks" as const, topic: "all", kick: "Memory hook", front: `${name}: ${label}`, main: hook, sub: expands })),
];

const boxOf = (c: Card) => getStudyProgress().cards?.[c.key] ?? 0;

/** A Leitner box per card: missed cards come back sooner, three in a row counts as mastered. */
function deal(kind: string, topic: string) {
  const pool = DECK.filter((c) => (kind === "all" || c.kind === kind) && (topic === "all" || c.topic === topic || c.topic === "all"));
  return { pool, queue: pool.map((c) => ({ c, r: Math.random() + boxOf(c) })).sort((a, b) => a.r - b.r).map((x) => x.c) };
}

export function Flashcards() {
  const p = useStudyProgress();
  const [kind, setKind] = React.useState("terms");
  const [topic, setTopic] = React.useState("all");
  const [state, setState] = React.useState(() => {
    const d = deal("terms", "all");
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
    updateStudyProgress((s) => {
      s.cards = { ...s.cards, [c.key]: got ? Math.min(4, b + 1) : 0 };
    });
    touchStreak();
    awardXp(got ? 3 : 1, "flashcard");
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
  // The deal is random, so the first card shows after hydration (the server never picks one).
  const ready = useHydrated();
  const cur = ready ? state.cur : null, flipped = ready && state.flipped;
  const left = cur ? state.queue.length + 1 : 0;

  return (
    <div className="mx-auto grid w-full max-w-[44rem] gap-6 pb-8">
      <PageHead title="Flashcards">
        <p className={cn(lead, "text-ink-muted")}>Say the answer out loud, flip, then be honest. Cards you miss come back sooner; cards you know three times running count as mastered.</p>
      </PageHead>
      <div className="grid grid-cols-2 gap-3">
        <Select id="cardKind" label="Cards" value={kind} onChange={(v) => { setKind(v); reshuffle(v, topic); }} options={[["terms", "Terms"], ["formulas", "Formulas"], ["hooks", "Memory hooks"], ["all", "Everything"]]} />
        <Select id="cardTopic" label="Topic" value={topic} onChange={(v) => { setTopic(v); reshuffle(kind, v); }} options={[["all", "All topics"], ...TOPICS.map((t) => [t.id, `${t.n}. ${t.short || t.name}`] as [string, string])]} />
      </div>
      <div className="grid gap-2">
        <p className="text-sm" aria-live="polite">
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
          "grid min-h-[clamp(15rem,40vh,20rem)] w-full content-center justify-items-center gap-3.5 rounded-[18px] border border-line px-6 py-8 text-center shadow-[0_1px_0_var(--line),0_18px_40px_-28px_color-mix(in_oklch,var(--ink)_40%,transparent)] transition-[transform,background-color] duration-200 hover:border-line-strong active:scale-[0.99]",
          flipped ? "bg-sand" : "bg-paper",
        )}
      >
        <span className="font-mono text-xs uppercase tracking-[0.04em] text-clay-ink">{cur ? cur.kick : ready ? "Round done" : "Shuffling"}</span>
        <span className="text-balance font-display text-[clamp(1.5rem,1.2rem+1.4vw,2.25rem)] font-[650] leading-[1.1] tracking-[-0.02em]">
          {cur ? sym(cur.front) : !ready ? "" : state.pool.length ? "Nice. Shuffle for another round." : "No cards match."}
        </span>
        {cur && flipped && (
          <span className="grid max-w-[34rem] gap-2">
            <span className="text-[clamp(1.05rem,1rem+0.4vw,1.25rem)] leading-normal">{sym(cur.main)}</span>
            <span className="text-sm text-ink-muted">{sym(cur.sub)}</span>
          </span>
        )}
        {cur && <span className="text-[13px] text-ink-muted">{flipped ? "Did you have it?" : "Tap to flip"}</span>}
      </button>
      <div className="flex flex-wrap gap-2 [&>*]:flex-[1_1_8rem]">
        <button type="button" className={btn.ghost} disabled={!flipped} onClick={() => rate(false)}>
          Again
        </button>
        <button type="button" className={btn.primary} disabled={!flipped} onClick={() => rate(true)}>
          Got it
        </button>
        <button type="button" className={btn.ghost} onClick={() => reshuffle()}>
          Shuffle
        </button>
      </div>
      <p id="fcardHint" className="text-sm text-ink-muted">
        Keys: Space flips, 1 is Again, 2 is Got it.
      </p>
    </div>
  );
}
