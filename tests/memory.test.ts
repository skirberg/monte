import { describe, expect, it } from "vitest";
import { review } from "@/lib/study/memory-review";
import { dueKeys, dueToday, mergeMem, type Mem } from "@/lib/study/memory";
import { DECK, dealOrder } from "@/lib/study/cards";
import { mergeStudy } from "@/lib/progress";

const DAY = 864e5;
const T0 = Date.parse("2026-11-19T10:00:00Z");

describe("flashcard memory (FSRS)", () => {
  it("spaces a card further out each time you get it, and brings it back soon after a miss", () => {
    const first = review(undefined, true, T0);
    expect(first.reps).toBe(1);
    const gap1 = (first.due - T0) / DAY;
    expect(gap1).toBeGreaterThanOrEqual(1);
    const second = review(first, true, first.due);
    const gap2 = (second.due - first.due) / DAY;
    expect(gap2).toBeGreaterThan(gap1);
    const missed = review(second, false, second.due);
    expect(missed.lapses).toBe(1);
    expect((missed.due - second.due) / DAY).toBeLessThan(gap2);
    expect(missed.s).toBeLessThan(second.s);
  });

  it("gives the same dates for the same answers (no random fuzz)", () => {
    expect(review(undefined, true, T0)).toEqual(review(undefined, true, T0));
  });

  it("counts what is due, most overdue first", () => {
    const mem: Record<string, Mem> = {
      a: { ...review(undefined, true, T0), due: T0 - 2 * DAY },
      b: { ...review(undefined, true, T0), due: T0 - DAY },
      c: { ...review(undefined, true, T0), due: T0 + 5 * DAY },
    };
    expect(dueKeys(mem, T0)).toEqual(["a", "b"]);
    expect(dueToday(mem, T0)).toBe(2);
    expect(dueToday(undefined, T0)).toBe(0);
  });

  it("deals due cards first, then new ones in order, then the rest", () => {
    const pool = DECK.filter((c) => c.kind === "terms").slice(0, 6);
    const [k0, k1, , , k4, k5] = pool.map((c) => c.key);
    const mem: Record<string, Mem> = {
      [k4]: { ...review(undefined, true, T0), due: T0 - DAY },
      [k5]: { ...review(undefined, true, T0), due: T0 + 9 * DAY },
      [k1]: { ...review(undefined, true, T0), due: T0 + 2 * DAY },
    };
    const order = dealOrder(pool, undefined, null, () => 0.5, mem, T0).map((c) => c.key);
    expect(order[0]).toBe(k4);
    expect(order.slice(-2)).toEqual([k1, k5]);
    expect(order[1]).toBe(k0);
    expect(order).toHaveLength(pool.length);
  });

  it("keeps the later review when two copies of progress meet", () => {
    const old = review(undefined, true, T0);
    const newer = review(old, false, T0 + 3 * DAY);
    expect(mergeMem({ x: old }, { x: newer }).x).toEqual(newer);
    expect(mergeMem({ x: newer }, { x: old }).x).toEqual(newer);
    const merged = mergeStudy({ mem: { x: old } }, { mem: { x: newer, y: old } }) as { mem: Record<string, Mem> };
    expect(merged.mem.x).toEqual(newer);
    expect(merged.mem.y).toEqual(old);
  });
});
