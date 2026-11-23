import { describe, expect, it } from "vitest";
import DATA from "@/lib/play/data/drawit.json";
import { DAILY_START, dailyNumber, dailyRound, dayBefore, emptyDaily, parseDaily, recordDaily, shareText, sparks, streakOn, untilMidnight } from "@/lib/play/daily";

const series = () => Object.fromEntries(Object.entries(DATA.series).map(([k, v]) => [k, (v.points as [string, number][]).slice()]));
const addDays = (day: string, n: number) => {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

describe("daily chart", () => {
  it("numbers days from the start", () => {
    expect(dailyNumber(DAILY_START)).toBe(1);
    expect(dailyNumber(addDays(DAILY_START, 1))).toBe(2);
    expect(dayBefore("2027-03-01")).toBe("2027-02-28");
  });

  it("gives a playable chart every day for a year: a year or more shown, the full stretch hidden", () => {
    for (let i = 0; i < 365; i++) {
      const r = dailyRound(addDays(DAILY_START, i));
      expect(r.actual, r.day).toHaveLength(r.hide);
      expect(r.known.length, r.day).toBeGreaterThanOrEqual(r.period);
      expect(r.values.every(Number.isFinite), r.day).toBe(true);
      expect(r.labels).toHaveLength(r.values.length);
    }
  });

  it("is the same chart for everyone on the same day, and new data never changes an earlier day", () => {
    const more = series();
    for (const pts of Object.values(more)) {
      const [y, m] = pts[pts.length - 1][0].split("-").map(Number);
      const next = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`;
      pts.push([next, pts[pts.length - 1][1]]);
    }
    for (let i = 0; i < 60; i++) {
      const day = addDays(DAILY_START, i);
      expect(dailyRound(day).labels).toEqual(dailyRound(day).labels);
      expect(dailyRound(day, more).labels, day).toEqual(dailyRound(day).labels);
    }
  });

  it("rotates the series and does not repeat a stretch for weeks", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 40; i++) {
      const r = dailyRound(addDays(DAILY_START, i));
      expect(r.id).toBe(dailyRound(addDays(DAILY_START, i % 4)).id);
      const key = `${r.id} ${r.labels[r.labels.length - 1]}`;
      expect(seen.has(key), key).toBe(false);
      seen.add(key);
    }
  });
});

describe("streak and share", () => {
  const res = { n: 1, you: 80, rule: 70, guess: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] };

  it("counts days in a row, ignores a second play, and restarts after a missed day", () => {
    let s = recordDaily(emptyDaily(), "2026-11-19", res);
    expect(s.streak).toBe(1);
    expect(recordDaily(s, "2026-11-19", { ...res, you: 99 })).toBe(s);
    s = recordDaily(s, "2026-11-20", res);
    expect(s.streak).toBe(2);
    expect(streakOn(s, "2026-11-21")).toBe(2);
    expect(streakOn(s, "2026-11-22")).toBe(0);
    s = recordDaily(s, "2026-11-23", res);
    expect(s.streak).toBe(1);
    expect(s.best).toBe(2);
  });

  it("keeps two weeks of days and survives junk", () => {
    let s = emptyDaily();
    for (let i = 0; i < 20; i++) s = recordDaily(s, addDays(DAILY_START, i), res);
    expect(Object.keys(s.days)).toHaveLength(14);
    expect(parseDaily("not json")).toEqual(emptyDaily());
    expect(parseDaily(JSON.stringify({ streak: "x" })).streak).toBe(0);
  });

  it("share text: bars at most 12 wide, both scores, no dashes", () => {
    const [a, b] = sparks(Array.from({ length: 24 }, (_, i) => i), Array.from({ length: 24 }, (_, i) => 24 - i));
    expect([...a]).toHaveLength(12);
    expect([...b]).toHaveLength(12);
    const r = dailyRound(DAILY_START);
    const text = shareText(r, { ...res, guess: r.actual }, 3, "https://monte.markets");
    expect(text).toContain("Monte daily chart 1");
    expect(text).toContain("3 days in a row");
    expect(text).toContain("https://monte.markets");
    expect(text).not.toMatch(/[–—]/);
  });

  it("counts down to local midnight", () => {
    expect(untilMidnight(new Date(2026, 10, 19, 18, 48))).toBe("5h 12m");
    expect(untilMidnight(new Date(2026, 10, 19, 23, 59, 30))).toBe("1m");
  });
});
