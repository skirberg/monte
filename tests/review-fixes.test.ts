// Regressions from the Nov 12, 2026 review: each test failed before its fix.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { snippet } from "@/lib/seo";
import { solverById } from "@/lib/study/solvers";
import { getProgress, importProgress } from "@/lib/progress";

describe("snippet keeps sentences with decimals whole", () => {
  it.each([
    ["About 68% fall within 1 SD, 95% within 2 and 99.7% within 3 SDs. Split the leftover evenly.", /^About 68%/],
    ["Pick α = 0.05. If p ≤ α, reject H₀.", /^Pick α = 0\.05\./],
    ["Find z for 97.5%, then value = mean + z × SD.", /^Find z for 97\.5%/],
  ])("%s", (text, start) => {
    expect(snippet(text)).toMatch(start);
  });
});

describe("sampling solver table at 10,000 and up", () => {
  it("lists sample means smallest first with a cumulative share that ends at 1", () => {
    const s = solverById("samp");
    const r = s.run({ ...Object.fromEntries(s.fields.map((f) => [f.k, f.v])), pop: "30000, 10000", n: "2", wr: "with" });
    if ("err" in r) throw new Error(r.err);
    const rows = r.table!.rows;
    const firsts = rows.map((row) => Number(row[0].replace(/,/g, "")));
    expect(firsts).toEqual([...firsts].sort((a, b) => a - b));
    expect(rows.at(-1)![3]).toBe("1");
    expect(rows[0][3]).toBe("0.25");
  });
});

describe("a malformed restore never breaks progress", () => {
  let store: Map<string, string>;
  beforeEach(() => {
    store = new Map();
    vi.stubGlobal("window", new EventTarget());
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, String(v)),
      removeItem: (k: string) => void store.delete(k),
    });
  });
  afterEach(() => vi.unstubAllGlobals());

  it("wrong-typed fields fall back to defaults instead of throwing in the header", () => {
    expect(importProgress(JSON.stringify({ app: "monte", v: 2, data: { "monte-progress": JSON.stringify({ xp: "lots", days: null, badges: null, counts: [1] }) } }))).toBe(true);
    const p = getProgress();
    expect(p.xp).toBe(0);
    expect(p.days).toEqual({});
    expect(p.badges).toEqual([]);
    expect(p.counts).toEqual({});
  });

  it("an unreadable incoming value keeps the progress already here", () => {
    store.set("monte-progress", JSON.stringify({ xp: 250, days: {}, badges: ["first-drill"] }));
    importProgress(JSON.stringify({ app: "monte", v: 2, data: { "monte-progress": "{not json" } }));
    expect(getProgress().xp).toBe(250);
  });
});

// Regressions from the Nov 13, 2026 review.
describe("restoring a backup keeps both sides", () => {
  it("lessons finished on either device survive the merge", async () => {
    const { mergeStudy } = await import("@/lib/progress");
    const merged = mergeStudy({ lessons: { "normal/the-bell": 1 } }, { lessons: { "data/bias": 1 } });
    expect(merged.lessons).toEqual({ "normal/the-bell": 1, "data/bias": 1 });
  });
  it("the placement result is part of the backup", async () => {
    const { isMonteKey } = await import("@/lib/progress");
    expect(isMonteKey("monte-start")).toBe(true);
    expect(isMonteKey("monteStartRun")).toBe(true);
  });
});

describe("solver numbers", () => {
  it.each([["1/0"], ["1e999"], ["Infinity"], ["-Infinity"]])("%s is not a usable number", async (raw) => {
    const { sNum } = await import("@/lib/study/solvers");
    expect(Number.isNaN(sNum(raw))).toBe(true);
  });
  it("a typed minus sign counts", async () => {
    const { sNum } = await import("@/lib/study/solvers");
    expect(sNum("−2")).toBe(-2);
    expect(sNum("–0.5")).toBe(-0.5);
  });
});

describe("grading does not reward the classic mistake", () => {
  it("typing the mean for a median is wrong even inside the 2% tolerance", async () => {
    const { isCorrect } = await import("@/lib/study/drill");
    const q = { q: "Find the median of 9, 4, 27, 14, 26, 17, 3", a: 14, traps: [[14.29, "That's the mean."]], mod: "center" } as never;
    expect(isCorrect(q, "14")).toBe(true);
    expect(isCorrect(q, "14.29")).toBe(false);
  });
  it("without replacement is not graded as with replacement", async () => {
    const { isCorrect } = await import("@/lib/study/drill");
    const q = { q: "P(both red cards)", a: 0.2451, traps: [[0.25, "That's with replacement."]], mod: "prob" } as never;
    expect(isCorrect(q, "0.245")).toBe(true);
    expect(isCorrect(q, "0.25")).toBe(false);
  });
});

describe("solver inputs read the way they are written", () => {
  it("a decimal comma is refused, a thousands comma is not", async () => {
    const { sNum } = await import("@/lib/study/solvers");
    const { readNumber } = await import("@/lib/decide/math");
    expect(Number.isNaN(sNum("1,5"))).toBe(true);
    expect(sNum("1,200")).toBe(1200);
    expect(Number.isNaN(readNumber("0,5"))).toBe(true);
    expect(readNumber("1,200")).toBe(1200);
  });
  it("'5%' in the Normal cutoff means the top 5%, not 0.05%", async () => {
    const { solverById } = await import("@/lib/study/solvers");
    const s = solverById("normal");
    const base = Object.fromEntries(s.fields.map((f) => [f.k, f.v]));
    const a = s.run({ ...base, pct: "5%" }), b = s.run({ ...base, pct: "5" });
    if ("err" in a || "err" in b) throw new Error("solver error");
    const top = (r: typeof a) => (r as { rows: { q: string; a: string }[] }).rows.find((x) => x.q.startsWith("Top"))!;
    expect(top(a).a).toBe(top(b).a);
    expect(top(a).q).toContain("Top 5%");
  });
});
