import { describe, expect, it } from "vitest";
import DATA from "@/lib/play/data/drawit.json";
import { ROUNDS, anchorFor, buildRound, drawTo, roundOfDay, rmse, ruleForecast, score, verdict } from "@/lib/play/drawit";

describe("drawit data", () => {
  it("has every round's series, long enough for its window and a full year shown", () => {
    for (const r of ROUNDS) {
      const pts = DATA.series[r.ticker]?.points;
      expect(pts, r.ticker).toBeTruthy();
      expect(pts.length, r.ticker).toBeGreaterThanOrEqual(r.window);
      const round = buildRound(r);
      expect(round.actual).toHaveLength(r.hide);
      // The season rules look one year back, so at least a year must be shown.
      expect(round.known.length, r.id).toBeGreaterThanOrEqual(r.period);
      expect(round.values.every(Number.isFinite)).toBe(true);
    }
  });

  it("reads only the tickers the rounds use (the script is an allowlist)", async () => {
    const { readFileSync } = await import("node:fs");
    const script = readFileSync(new URL("../scripts/fetch-drawit.ts", import.meta.url), "utf8");
    const listed = [...script.matchAll(/^\s{2}([A-Z]+): "/gm)].map((m) => m[1]).sort();
    expect(listed).toEqual(ROUNDS.map((r) => r.ticker).sort());
    expect(Object.keys(DATA.series).sort()).toEqual(listed);
  });

  it("copy is short, with no dashes and no AI talk", () => {
    for (const r of ROUNDS) expect(r.idea.split(" ").length, r.id).toBeLessThanOrEqual(12);
    for (const r of ROUNDS) for (const s of [r.name, r.unit, r.idea, r.ruleName]) expect(s).not.toMatch(/[–—]|\bAI\b/);
  });
});

describe("rules", () => {
  it("season repeats last year, using its own forecast past a year", () => {
    const known = [1, 2, 3, 4];
    expect(ruleForecast(known, 6, "season", 4)).toEqual([1, 2, 3, 4, 1, 2]);
  });
  it("season-drift adds the year-on-year rise", () => {
    const known = [1, 2, 3, 4, 2, 3, 4, 5];
    expect(ruleForecast(known, 4, "season-drift", 4)).toEqual([3, 4, 5, 6]);
  });
  it("median ignores one wild month", () => {
    expect(ruleForecast([100, 110, 120, 400, 105], 2, "median", 12)).toEqual([110, 110]);
  });
  it("the fireworks rule beats a flat line by a lot", () => {
    const r = buildRound(ROUNDS.find((x) => x.id === "fireworks")!);
    const range = Math.max(...r.values) - Math.min(...r.values);
    const ruleScore = score(ruleForecast(r.known, r.hide, r.rule, r.period), r.actual, range);
    const flat = score(Array(r.hide).fill(r.known[r.known.length - 1]), r.actual, range);
    expect(ruleScore).toBeGreaterThan(flat + 20);
  });
});

describe("score", () => {
  it("is 100 for the real line and 0 for a miss of half the range", () => {
    expect(score([1, 2, 3], [1, 2, 3], 10)).toBe(100);
    expect(score([6, 7, 8], [1, 2, 3], 10)).toBe(0);
    expect(rmse([0, 0], [3, 4])).toBeCloseTo(Math.sqrt(12.5));
  });
  it("verdict reads the gap and names the rule", () => {
    expect(verdict(80, 70, "Last year")).toBe("You beat last year.");
    expect(verdict(68, 70, "Last year")).toBe("Dead even.");
    expect(verdict(40, 70, "Last year")).toBe("Last year wins.");
  });
});

describe("drawing", () => {
  it("fills every point between two touches, from the last shown point", () => {
    const g = drawTo([null, null, null, null], { i: -1, v: 0 }, { i: 3, v: 8 });
    expect(g).toEqual([2, 4, 6, 8]);
  });
  it("draws backwards too", () => {
    const g = drawTo([1, 1, 1, 1], { i: 3, v: 0 }, { i: 1, v: 4 });
    expect(g).toEqual([1, 4, 2, 0]);
  });
  it("starts a new stroke from the nearest filled point before it", () => {
    expect(anchorFor([5, 6, null, null], 3, 9)).toEqual({ i: 1, v: 6 });
    expect(anchorFor([null, null], 1, 9)).toEqual({ i: -1, v: 9 });
  });
  it("round of the day is stable and in range", () => {
    expect(roundOfDay("2026-11-18")).toBe(roundOfDay("2026-11-18"));
    for (const d of ["2026-01-01", "2026-06-30", "2027-03-14"]) expect(roundOfDay(d)).toBeLessThan(ROUNDS.length);
  });
});
