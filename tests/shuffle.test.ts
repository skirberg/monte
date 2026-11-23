import { describe, expect, it } from "vitest";
import { Phi } from "@/lib/study/math";
import { DAILY_START, dailyNumber, parseDaily, recordDaily, streakOn } from "@/lib/play/daily";
import { mergeDaily } from "@/lib/progress";
import { FAMILY_IDS, afterThrow, familyOf, liftsText, pctLabels, practiceRound, roundOfFamily, shareShuffle, shuffleRound, swapCount, throwFor, rng, type ShuffleResult } from "@/lib/play/shuffle";

const addDays = (day: string, n: number) => {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
const YEAR = Array.from({ length: 730 }, (_, i) => addDays(DAILY_START, i));

describe("the Shuffle: one round a day", () => {
  it("shares its number with the daily chart", () => {
    expect(shuffleRound(DAILY_START).n).toBe(1);
    expect(shuffleRound("2026-11-20").n).toBe(dailyNumber("2026-11-20"));
  });

  it("is the same round for everyone on the same day", () => {
    for (const day of YEAR.slice(0, 60)) expect(JSON.stringify(shuffleRound(day))).toBe(JSON.stringify(shuffleRound(day)));
  });

  it("deals three cups with exactly one grain, and answers that never read the same, every day for two years", () => {
    for (const day of YEAR) {
      const r = shuffleRound(day);
      expect(r.cups, day).toHaveLength(3);
      expect(r.cups.filter((c) => c.right), day).toHaveLength(1);
      expect(new Set(r.cups.map((c) => c.label)).size, `${day} ${r.cups.map((c) => c.label)}`).toBe(3);
      for (const c of r.cups) {
        expect(c.label, day).not.toMatch(/NaN|undefined|Infinity/);
        expect(c.tag.split(" ").length, `${day} ${c.tag}`).toBeLessThanOrEqual(3);
        if (!c.right) expect(c.note.length, day).toBeGreaterThan(20);
      }
      expect(r.work.length, day).toBeGreaterThanOrEqual(2);
    }
  });

  it("deals every family once before any repeats, and never the same one within three days", () => {
    const k = FAMILY_IDS.length;
    for (let cycle = 0; cycle < 30; cycle++) {
      const seen = new Set(Array.from({ length: k }, (_, i) => familyOf(cycle * k + i + 1)));
      expect(seen.size).toBe(k);
    }
    for (let n = 1; n < 300; n++) {
      const near = [familyOf(n), familyOf(n + 1), familyOf(n + 2), familyOf(n + 3)];
      expect(new Set(near).size, `day ${n}`).toBe(4);
    }
  });

  it("throws harder through the week, Monday gentlest and Saturday hardest", () => {
    expect(swapCount("2026-11-23")).toBe(5); // a Monday
    expect(swapCount("2026-11-28")).toBe(9); // a Saturday
    expect(shuffleRound("2026-11-28").swaps).toHaveLength(9);
  });

  it("never swaps the same pair twice running, and the cups end in a real order", () => {
    const r = rng(42);
    for (let i = 0; i < 200; i++) {
      const s = throwFor(9, r);
      for (let j = 1; j < s.length; j++) expect(s[j]).not.toEqual(s[j - 1]);
      expect(afterThrow(s).slice().sort()).toEqual([0, 1, 2]);
    }
    // Follow one cup by hand: left and middle swap, then middle and right.
    expect(afterThrow([[0, 1], [1, 2]])).toEqual([2, 0, 1]);
  });

  it("starts the grain in every slot over time", () => {
    const at = new Set(YEAR.slice(0, 60).map((d) => shuffleRound(d).cups.findIndex((c) => c.right)));
    expect(at).toEqual(new Set([0, 1, 2]));
  });
});

describe("the Shuffle's answers are computed, and the wrong cups are the classic traps", () => {
  const right = (r: ReturnType<typeof roundOfFamily>) => r.cups.find((c) => c.right)!;
  const traps = (r: ReturnType<typeof roundOfFamily>) => r.cups.filter((c) => !c.right).map((c) => c.tag);

  it("an average: the grain uses σ/√n, the traps use σ and the other tail", () => {
    const val = (label: string) => parseFloat(label) / 100;
    for (let s = 1; s < 40; s++) {
      const r = roundOfFamily("average", s);
      const g = right(r);
      // The work ends on the case's own four-place answer, and the cup shows it rounded.
      const worked = Number(r.work[r.work.length - 1].match(/= ([\d.]+), about/)![1]);
      expect(Math.abs(val(g.label) - worked), r.q).toBeLessThan(0.006);
      const tail = r.cups.find((c) => c.tag === "other tail")!;
      expect(Math.abs(val(tail.label) - (1 - worked))).toBeLessThan(0.006);
      // σ for one value instead of σ/√n: a smaller z, so a chance nearer a half.
      const one = r.cups.find((c) => c.tag.startsWith("one "))!;
      expect(Math.abs(val(one.label) - 0.5)).toBeLessThan(Math.abs(worked - 0.5));
    }
  });

  it("a positive result: the grain is Bayes, the traps are the question turned around and the other group", () => {
    for (let s = 1; s < 60; s++) {
      const r = roundOfFamily("bayes", s);
      const nums = r.setup.match(/[\d.]+%/g)!.map((x) => parseFloat(x) / 100);
      const [sens, fp, base] = nums;
      const want = (base * sens) / (base * sens + (1 - base) * fp);
      const shown = r.cups.map((c) => c.label);
      expect(shown).toContain(pctLabels([want, sens, 1 - fp])[0]);
      expect(traps(r)).toEqual(expect.arrayContaining(["turned around", "the other group"]));
      expect(right(r).label).toBe(pctLabels([want, sens, 1 - fp])[0]);
    }
  });

  it("at least one: 1 minus none, against chances added and none itself", () => {
    for (let s = 1; s < 40; s++) {
      const r = roundOfFamily("either", s);
      const [n] = r.setup.match(/\d+(?= )/)!.map(Number);
      const p = parseFloat(r.setup.match(/(\d+)%/)![1]) / 100;
      expect(right(r).label).toBe(pctLabels([1 - (1 - p) ** n, n * p, (1 - p) ** n])[0]);
      expect(n * p).toBeLessThanOrEqual(0.8);
    }
  });

  it("the birthday problem matches the product of the fractions", () => {
    for (let s = 1; s < 20; s++) {
      const r = roundOfFamily("birthday", s);
      const n = Number(r.setup.match(/^\d+/)![0]);
      let diff = 1;
      for (let i = 0; i < n; i++) diff *= (365 - i) / 365;
      const pairs = (n * (n - 1)) / 2;
      expect(right(r).label).toBe(pctLabels([1 - diff, 1 - (364 / 365) ** (n - 1), pairs / 365])[0]);
    }
  });

  it("a range for the mean: the grain uses the standard error, a trap uses σ", () => {
    for (let s = 1; s < 30; s++) {
      const r = roundOfFamily("range", s);
      const width = (c: (typeof r.cups)[number]) => Number(c.lines![1]) - Number(c.lines![0]);
      const g = right(r), wide = r.cups.find((c) => c.tag.startsWith("one "))!;
      expect(width(wide)).toBeGreaterThan(2.5 * width(g));
    }
  });

  it("the doors, the house edge, a given and not enough to tell", () => {
    const doors = roundOfFamily("doors", 1);
    expect(["67%", "38%", "40%"]).toContain(right(doors).label);
    for (let s = 1; s < 10; s++) {
      const e = roundOfFamily("edge", s);
      expect(right(e).label.startsWith("−$")).toBe(true);
      expect(e.cups.map((c) => c.label)).toContain("$0.00");
      const g = roundOfFamily("given", s);
      const [N, A, B, AB] = g.setup.match(/\d[\d,]*/g)!.map((x) => Number(x.replace(/,/g, "")));
      expect(right(g).label).toBe(pctLabels([AB / A, AB / N, AB / B])[0]);
      expect(Number(g.work[1].match(/= ([\d.]+)/)![1])).toBeCloseTo(AB / A, 3);
      const sh = roundOfFamily("shape", s);
      expect(right(sh).label).toBe("Can't tell");
    }
  });

  it("one bottle from a crate: the crate's n stays out of the math", () => {
    const r = roundOfFamily("crate", 3);
    const m = r.setup.match(/SD (\d+) ml\), a crate holds (\d+)/)!;
    const [sd, g] = [Number(m[1]), Number(m[2])];
    const cut = Number(r.q.match(/less than (\d+)/)![1]);
    expect(right(r).label).toBe(pctLabels([Phi((cut - 500) / sd), Phi((cut - 500) / (sd / Math.sqrt(g))), 1 - Phi((cut - 500) / sd)])[0]);
  });

  it("practice rounds cover every family and are never numbered", () => {
    const seen = new Set(Array.from({ length: 30 }, (_, i) => practiceRound(i).family));
    expect(seen.size).toBe(FAMILY_IDS.length);
    expect(practiceRound(3).day).toBeNull();
  });
});

describe("the Shuffle's share line and run of days", () => {
  const res = (lifts: number): ShuffleResult => ({ n: 7, lifts, picks: [] });

  it("says the number, the lifts as circles with the grain last, and the link, with no spoilers", () => {
    expect(shareShuffle(res(1), 1, "https://monte.markets/shuffle/")).toBe("Monte Shuffle 7\n🟠 Found the grain on the first lift\nhttps://monte.markets/shuffle/");
    expect(shareShuffle(res(3), 4, "https://monte.markets/shuffle/")).toBe("Monte Shuffle 7\n⚪⚪🟠 Found the grain on the third lift\n4 days in a row\nhttps://monte.markets/shuffle/");
    expect(liftsText(2)).toBe("Found the grain on the second lift");
    for (const day of YEAR.slice(0, 40)) {
      const r = shuffleRound(day);
      const text = shareShuffle({ n: r.n, lifts: 2, picks: [] }, 3, "https://monte.markets/shuffle/");
      for (const c of r.cups) expect(text, day).not.toContain(c.label);
      expect(text).not.toContain(r.q);
    }
  });

  it("is scored once a day, and a missed day starts the run again", () => {
    let s = parseDaily<ShuffleResult>(null);
    s = recordDaily(s, "2026-11-20", res(1));
    s = recordDaily(s, "2026-11-21", res(2));
    expect(streakOn(s, "2026-11-21")).toBe(2);
    expect(recordDaily(s, "2026-11-21", res(3))).toBe(s);
    expect(streakOn(s, "2026-11-23")).toBe(0);
    s = recordDaily(s, "2026-11-23", res(1));
    expect(s.streak).toBe(1);
    expect(s.best).toBe(2);
  });

  it("restores from a backup code like the daily chart, keeping the newer run", () => {
    const here = { streak: 2, best: 2, last: "2026-11-21", days: { "2026-11-20": res(1), "2026-11-21": res(2) } };
    const backup = { streak: 1, best: 1, last: "2026-11-20", days: { "2026-11-20": res(3) } };
    const out = mergeDaily(here, backup);
    expect(out.streak).toBe(2);
    expect((out.days as Record<string, ShuffleResult>)["2026-11-20"].lifts).toBe(1);
  });
});
