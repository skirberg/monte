import { DATA, TOPICS } from "./data";

/** One flashcard. `topic` is a topic id, or "all" for memory hooks that belong to no one topic. */
export type Card = { key: string; kind: "terms" | "formulas" | "hooks"; topic: string; kick: string; front: string; main: string; sub: string };

const short = Object.fromEntries(TOPICS.map((t) => [t.id, t.short || t.name]));
// Keys match the original engine's, so boxes already earned stay earned.
export const DECK: Card[] = [
  ...DATA.terms.map(([term, topic, meaning, ex]) => ({ key: `t:${term}`, kind: "terms" as const, topic, kick: `Term · ${short[topic]}`, front: term, main: meaning, sub: `Example: ${ex}` })),
  ...TOPICS.flatMap((t) =>
    (DATA.sheet[t.id] ?? []).map(([name, f, ex, alias]) => ({
      key: `f:${t.id}:${name}`, kind: "formulas" as const, topic: t.id as string, kick: `Formula · ${short[t.id]}`, front: name + (alias ? `, ${alias}` : ""), main: f, sub: `Example: ${ex}`,
    })),
  ),
  ...DATA.hooks.map(([name, label, hook, expands]) => ({ key: `h:${name}`, kind: "hooks" as const, topic: "all", kick: "Memory hook", front: `${name}: ${label}`, main: hook, sub: expands })),
];

const RANK = new Map<string, number>(TOPICS.map((t, i) => [t.id, i]));

/**
 * The order to deal a pool of cards in.
 * - Once any card in the pool has a Leitner box, lower boxes come first, shuffled within a box,
 *   so missed cards come back sooner.
 * - A first visit starts at the beginning instead: the topic read last (or topic 1) first, then the
 *   topics after it in order, deck order within each topic. No random "Adjusted R²" as card one.
 */
export function dealOrder(pool: Card[], boxes: Record<string, number> | undefined, startTopic: string | null, rand = Math.random): Card[] {
  if (pool.some((c) => boxes?.[c.key] !== undefined)) {
    return pool.map((c) => ({ c, r: rand() + (boxes?.[c.key] ?? 0) })).sort((a, b) => a.r - b.r).map((x) => x.c);
  }
  const n = TOPICS.length, start = (startTopic && RANK.get(startTopic)) || 0;
  const rank = (c: Card) => {
    const r = RANK.get(c.topic);
    return r === undefined ? n : (r - start + n) % n;
  };
  return pool.map((c, i) => ({ c, i, k: rank(c) })).sort((a, b) => a.k - b.k || a.i - b.i).map((x) => x.c);
}
