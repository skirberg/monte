/**
 * What Monte remembers about each flashcard you have reviewed, so each card comes back just before you would forget it.
 * The model is FSRS, the open scheduler built into Anki. `review` in lib/study/memory-review.ts updates a card; this
 * file only reads, so the Today page can count what is due without loading the scheduler.
 */

/** One card's memory: when it is due, how long it lasts (stability, days), how hard it is (1 to 10), and its history. */
export type Mem = { due: number; s: number; d: number; reps: number; lapses: number; state: number; last: number };

/** Cards whose review time has come, most overdue first. */
export function dueKeys(mem: Record<string, Mem> | undefined, now: number, among?: Iterable<string>): string[] {
  if (!mem) return [];
  const keys = among ? [...among].filter((k) => mem[k]) : Object.keys(mem);
  return keys.filter((k) => mem[k].due <= now).sort((a, b) => mem[a].due - mem[b].due);
}

/** Cards due by the end of today, for the "N cards due" count. */
export function dueToday(mem: Record<string, Mem> | undefined, now: number, among?: Iterable<string>): number {
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  return dueKeys(mem, end.getTime(), among).length;
}

/** For two copies of the same progress (a restore): per card, the memory with the later review. */
export function mergeMem(a: unknown, b: unknown): Record<string, Mem> {
  const as = (x: unknown) => (x && typeof x === "object" && !Array.isArray(x) ? (x as Record<string, Mem>) : {});
  const out = { ...as(a) };
  for (const [k, v] of Object.entries(as(b))) if (!out[k] || Number(v?.last) > Number(out[k].last)) out[k] = v;
  return out;
}
