import { describe, expect, it } from "vitest";
import { Phi, tinv } from "@/lib/study/math";
import { KINDS, gradeInterval, gradeNumber, hintFor, makeCases, worked, type Case } from "@/lib/study/start";

// The module "Same number, three questions": one value, an average of many, a range for an unknown mean,
// or not enough information. Every answer here is recomputed from the case's own numbers, not copied.

const truth = (c: Case) => {
  const p = c.params;
  if (c.kind === "one" || c.kind === "mean") {
    const se = c.kind === "mean" ? p.sd / Math.sqrt(p.n) : p.sd;
    const z = (p.cut - p.mu) / se;
    return p.dir === "above" ? 1 - Phi(z) : Phi(z);
  }
  if (c.kind === "ci") {
    const crit = p.t ? tinv(0.975, p.n - 1) : 1.96;
    const m = (crit * p.sd) / Math.sqrt(p.n);
    return [p.xbar - m, p.xbar + m];
  }
  return null;
};

describe("the worked example", () => {
  it("gives the three answers for 508 ml on a line with mean 500 and SD 20", () => {
    const w = worked(25);
    expect(w.pOne).toBeCloseTo(0.3446, 4);
    expect(w.pAvg).toBeCloseTo(0.0228, 4);
    expect(w.lo).toBeCloseTo(500.16, 2);
    expect(w.hi).toBeCloseTo(515.84, 2);
  });
  it("an average of one bottle is one bottle", () => {
    const w = worked(1);
    expect(w.pAvg).toBeCloseTo(w.pOne, 10);
  });
});

describe("the cases", () => {
  const cases = makeCases(1);
  it("has 12 to 16 cases, every kind at least three times", () => {
    expect(cases.length).toBeGreaterThanOrEqual(12);
    expect(cases.length).toBeLessThanOrEqual(16);
    for (const k of KINDS) expect(cases.filter((c) => c.kind === k.id).length).toBeGreaterThanOrEqual(3);
  });
  it("puts the same story under different questions, and different stories under the same question", () => {
    const stories = new Map<string, Set<string>>();
    for (const c of cases) stories.set(c.story, (stories.get(c.story) ?? new Set()).add(c.kind));
    expect([...stories.values()].filter((k) => k.size >= 2).length).toBeGreaterThanOrEqual(3);
    for (const k of ["one", "mean", "ci"]) expect(new Set(cases.filter((c) => c.kind === k).map((c) => c.story)).size).toBeGreaterThanOrEqual(3);
  });
  it("never runs the same kind three times in a row after the opening three", () => {
    for (let i = 5; i < cases.length; i++) expect(cases[i].kind === cases[i - 1].kind && cases[i].kind === cases[i - 2].kind).toBe(false);
  });
  it("is the same for the same seed and new numbers for a new one", () => {
    expect(makeCases(1)).toEqual(makeCases(1));
    expect(makeCases(2).map((c) => c.q)).not.toEqual(cases.map((c) => c.q));
  });
  it("every answer matches the math, for many seeds", () => {
    for (let seed = 1; seed <= 200; seed++) {
      for (const c of makeCases(seed)) {
        const t = truth(c);
        if (c.kind === "none") {
          expect(c.answer).toBeNull();
          expect(c.why.length).toBeGreaterThan(20);
          continue;
        }
        if (Array.isArray(t)) {
          const [lo, hi] = c.answer as [number, number];
          expect(lo).toBeCloseTo(t[0], 6);
          expect(hi).toBeCloseTo(t[1], 6);
          expect(lo).toBeLessThan(hi);
        } else {
          expect(c.answer as number).toBeCloseTo(t as number, 6);
          expect(c.answer as number).toBeGreaterThan(0.001);
          expect(c.answer as number).toBeLessThan(0.999);
        }
        expect(c.steps.length).toBeGreaterThanOrEqual(2);
      }
    }
  });
  it("writes every number in the steps the way the answer is shown", () => {
    for (const c of cases) for (const s of c.steps) expect(s).not.toMatch(/NaN|undefined|Infinity/);
  });
});

describe("grading a probability", () => {
  const c = makeCases(1).find((x) => x.kind === "mean")!;
  const p = c.params;
  const se = p.sd / Math.sqrt(p.n);
  const right = c.answer as number;
  it("accepts the answer, rounded or as a percent", () => {
    expect(gradeNumber(c, right.toFixed(4)).ok).toBe(true);
    expect(gradeNumber(c, `${(right * 100).toFixed(2)}%`).ok).toBe(true);
  });
  it("names the slip when σ was used instead of the standard error", () => {
    const zSigma = (p.cut - p.mu) / p.sd;
    const wrong = p.dir === "above" ? 1 - Phi(zSigma) : Phi(zSigma);
    const g = gradeNumber(c, wrong.toFixed(4));
    expect(g.ok).toBe(false);
    expect(g.slip).toMatch(/σ\/√n|standard error/);
  });
  it("names the slip when the wrong side of the cutoff was taken", () => {
    const z = (p.cut - p.mu) / se;
    const other = p.dir === "above" ? Phi(z) : 1 - Phi(z);
    const g = gradeNumber(c, other.toFixed(4));
    expect(g.ok).toBe(false);
    expect(g.slip).toMatch(/other side/);
  });
  it("rejects blanks and numbers outside 0 to 1", () => {
    expect(gradeNumber(c, "").ok).toBe(false);
    expect(gradeNumber(c, "1.2").ok).toBe(false);
  });
});

describe("slips on single values and t intervals", () => {
  it("names dividing by √n when nothing is averaged (the crate)", () => {
    const c = makeCases(1).find((x) => x.params.group)!;
    const p = c.params;
    const z = (p.cut - p.mu) / (p.sd / Math.sqrt(p.group!));
    const wrong = p.dir === "above" ? 1 - Phi(z) : Phi(z);
    for (const typed of [wrong.toFixed(4), `${(wrong * 100).toFixed(2)}%`]) {
      const g = gradeNumber(c, typed);
      expect(g.ok).toBe(false);
      expect(g.slip).toMatch(/nothing is averaged/);
    }
  });
  it("points a 90% z margin on a t case to t, not to 1.96", () => {
    const c = makeCases(1).find((x) => x.kind === "ci" && x.params.t)!;
    const m = (1.645 * c.params.sd) / Math.sqrt(c.params.n);
    const g = gradeInterval(c, (c.params.xbar - m).toFixed(2), (c.params.xbar + m).toFixed(2));
    expect(g.ok).toBe(false);
    expect(g.slip).toMatch(/\bt with/);
    expect(g.slip).not.toMatch(/z = 1\.96/);
  });
});

describe("grading an interval", () => {
  const all = makeCases(1).filter((x) => x.kind === "ci");
  it("accepts the interval rounded to one decimal, in either order", () => {
    for (const c of all) {
      const [lo, hi] = c.answer as [number, number];
      const d = c.params.sd / Math.sqrt(c.params.n) < 0.2 ? 3 : 1;
      expect(gradeInterval(c, lo.toFixed(d), hi.toFixed(d)).ok).toBe(true);
      expect(gradeInterval(c, hi.toFixed(d), lo.toFixed(d)).ok).toBe(true);
    }
  });
  it("names σ instead of σ/√n", () => {
    const c = all[0];
    const g = gradeInterval(c, String(c.params.xbar - 1.96 * c.params.sd), String(c.params.xbar + 1.96 * c.params.sd));
    expect(g.ok).toBe(false);
    expect(g.slip).toMatch(/√n/);
  });
  it("names z instead of t when only s is known", () => {
    const c = all.find((x) => x.params.t)!;
    expect(c).toBeTruthy();
    const m = (1.96 * c.params.sd) / Math.sqrt(c.params.n);
    const g = gradeInterval(c, (c.params.xbar - m).toFixed(2), (c.params.xbar + m).toFixed(2));
    expect(g.ok).toBe(false);
    expect(g.slip).toMatch(/\bt\b/);
  });
});

describe("the help fades", () => {
  it("is open for the first five, one tap away for the next five, then gone", () => {
    const n = makeCases(1).length;
    expect([0, 4].map((i) => hintFor(i, n))).toEqual(["open", "open"]);
    expect([5, 9].map((i) => hintFor(i, n))).toEqual(["tap", "tap"]);
    expect(hintFor(10, n)).toBe("none");
    expect(hintFor(n - 1, n)).toBe("none");
  });
});
