import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CHIPS_FOR, DAILY_GOAL, START_CHIPS, addXp, exportProgress, getProgress, importProgress, levelOf, type Progress } from "@/lib/progress";

// progress.ts runs in the browser: give it a window that can dispatch events and a Map-backed localStorage.
let store: Map<string, string>;
beforeEach(() => {
  store = new Map();
  vi.stubGlobal("window", new EventTarget());
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, String(v)),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
  });
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

/** Local time, so the tests pass in any time zone. */
const at = (y: number, m: number, d: number, h = 12, min = 0) => vi.setSystemTime(new Date(y, m - 1, d, h, min));
const seed = (p: Partial<Progress>) => store.set("monte-progress", JSON.stringify(p));

describe("levelOf", () => {
  it.each([
    [0, 1],
    [99, 1],
    [100, 2],
    [299, 2],
    [300, 3],
    [599, 3],
    [600, 4],
    [1000, 5],
  ])("%i XP is level %i", (xp, level) => {
    expect(levelOf(xp).level).toBe(level);
  });
  it("reports progress into the level", () => {
    expect(levelOf(150)).toEqual({ level: 2, into: 50, span: 200 });
  });
});

describe("streak", () => {
  it("starts at 1 on the first learning action", () => {
    at(2026, 1, 10);
    addXp(5);
    expect(getProgress()).toMatchObject({ streak: 1, lastDay: "2026-01-10", xp: 5 });
  });
  it("adds one on the next day", () => {
    seed({ streak: 3, lastDay: "2026-01-10" });
    at(2026, 1, 11);
    addXp(5);
    expect(getProgress()).toMatchObject({ streak: 4, lastDay: "2026-01-11" });
  });
  it("crosses a month and a year end", () => {
    seed({ streak: 3, lastDay: "2026-12-31" });
    at(2027, 1, 1);
    addXp(5);
    expect(getProgress().streak).toBe(4);
  });
  it("one missed day (two days later) without a freeze resets to 1", () => {
    seed({ streak: 5, lastDay: "2026-01-10", freezes: 0 });
    at(2026, 1, 12);
    addXp(5);
    expect(getProgress()).toMatchObject({ streak: 1, lastDay: "2026-01-12", freezes: 0 });
  });
  it("one missed day with a freeze uses the freeze and keeps the streak", () => {
    seed({ streak: 5, lastDay: "2026-01-10", freezes: 1 });
    at(2026, 1, 12);
    addXp(5);
    expect(getProgress()).toMatchObject({ streak: 6, lastDay: "2026-01-12", freezes: 0 });
  });
  it("two missed days need two freezes", () => {
    seed({ streak: 5, lastDay: "2026-01-10", freezes: 1 });
    at(2026, 1, 13);
    addXp(5);
    expect(getProgress()).toMatchObject({ streak: 1, freezes: 1 });
    seed({ streak: 5, lastDay: "2026-01-10", freezes: 2 });
    addXp(5);
    expect(getProgress()).toMatchObject({ streak: 6, freezes: 0 });
  });
  it("the clock moving back keeps the streak and the last day", () => {
    seed({ streak: 4, lastDay: "2026-01-10" });
    at(2026, 1, 8);
    addXp(5);
    expect(getProgress()).toMatchObject({ streak: 4, lastDay: "2026-01-10" });
  });
  it("00:30 and 23:30 local are the same day", () => {
    at(2026, 1, 10, 0, 30);
    addXp(5);
    at(2026, 1, 10, 23, 30);
    addXp(5);
    expect(getProgress()).toMatchObject({ streak: 1, lastDay: "2026-01-10", days: { "2026-01-10": 10 } });
    at(2026, 1, 11, 0, 15);
    addXp(5);
    expect(getProgress()).toMatchObject({ streak: 2, lastDay: "2026-01-11" });
  });
  it("earns a freeze every 7 days, at most 2, and the 7-day badge", () => {
    seed({ streak: 6, lastDay: "2026-01-10", freezes: 0 });
    at(2026, 1, 11);
    addXp(5);
    expect(getProgress()).toMatchObject({ streak: 7, freezes: 1 });
    expect(getProgress().badges).toContain("streak-7");
    seed({ streak: 13, lastDay: "2026-01-10", freezes: 2, badges: ["streak-7"] });
    addXp(5);
    expect(getProgress()).toMatchObject({ streak: 14, freezes: 2 });
  });
});

describe("chips for learning", () => {
  it("the daily goal pays 100, once a day", () => {
    // The first goal also pays a badge and a level pays too; start past both to isolate the goal (level 3 is at 300).
    seed({ xp: 120, badges: ["goal-hit"] });
    at(2026, 1, 10);
    addXp(DAILY_GOAL - 10);
    expect(getProgress().chips).toBe(START_CHIPS);
    addXp(10);
    expect(getProgress().chips).toBe(START_CHIPS + CHIPS_FOR.goal);
    addXp(10);
    expect(getProgress().chips).toBe(START_CHIPS + CHIPS_FOR.goal);
    at(2026, 1, 11);
    addXp(DAILY_GOAL);
    expect(getProgress().chips).toBe(START_CHIPS + 2 * CHIPS_FOR.goal);
    expect(CHIPS_FOR.goal).toBe(100);
  });
  it("the first daily goal also pays the goal-hit badge", () => {
    at(2026, 1, 10);
    addXp(DAILY_GOAL);
    expect(getProgress().chips).toBe(START_CHIPS + CHIPS_FOR.goal + CHIPS_FOR.badge);
    expect(getProgress().badges).toEqual(["goal-hit"]);
  });
  it("a level pays 250 per level gained", () => {
    seed({ xp: 90, badges: ["goal-hit"], days: { "2026-01-10": DAILY_GOAL } });
    at(2026, 1, 10);
    addXp(10); // 100 XP: level 2
    expect(getProgress().chips).toBe(START_CHIPS + CHIPS_FOR.level);
    expect(CHIPS_FOR.level).toBe(250);
    addXp(500); // 600 XP: level 4, two more levels
    expect(getProgress().chips).toBe(START_CHIPS + 3 * CHIPS_FOR.level);
  });
  it("tells listeners about a level-up", () => {
    const seen: unknown[] = [];
    window.addEventListener("monte:progress", (e) => seen.push((e as CustomEvent).detail));
    seed({ xp: 95, badges: ["goal-hit"] });
    at(2026, 1, 10);
    addXp(5, "drill");
    expect(seen).toEqual([expect.objectContaining({ gained: 5, reason: "drill", levelUp: 2 })]);
  });
});

describe("backup and restore", () => {
  it("round-trips everything Monte saved", () => {
    at(2026, 1, 10);
    addXp(120);
    store.set("sigma", JSON.stringify({ cards: { a: 1 }, name: "Zoë ✓" }));
    store.set("monteElectionCalls", JSON.stringify([{ p: 0.7, o: 1 }]));
    store.set("unrelated", "keep out");
    const before = new Map(store);
    const code = exportProgress();
    expect(code).toMatch(/^[A-Za-z0-9+/=]+$/);

    store.clear();
    expect(importProgress(code)).toBe(true);
    for (const k of ["monte-progress", "sigma", "monteElectionCalls"]) expect(JSON.parse(store.get(k)!)).toEqual(JSON.parse(before.get(k)!));
    expect(store.has("unrelated")).toBe(false);
    expect(getProgress().xp).toBe(120);
  });
  it("also takes the backup file's JSON text", () => {
    const json = JSON.stringify({ app: "monte", v: 1, data: { "monte-progress": { xp: 42 } } });
    expect(importProgress(`  ${json}\n`)).toBe(true);
    expect(getProgress().xp).toBe(42);
  });
  it.each([
    ["an empty string", ""],
    ["plain text", "hello world"],
    ["base64 of not-JSON", btoa("hello")],
    ["another app's backup", JSON.stringify({ app: "other", data: { "monte-progress": { xp: 1 } } })],
    ["a backup with no data", JSON.stringify({ app: "monte" })],
    ["JSON null", "null"],
    ["broken JSON", '{"app":"monte",'],
  ])("rejects %s and changes nothing", (_, text) => {
    store.set("monte-progress", JSON.stringify({ xp: 7 }));
    expect(importProgress(text)).toBe(false);
    expect(getProgress().xp).toBe(7);
  });
});
