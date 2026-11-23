import { describe, expect, it } from "vitest";
import { TOPICS } from "@/lib/study/data";
import { PLACE_MAX, placeAnswer, placeNext, placeResult, placeStart, secondQuestion } from "@/lib/study/placement";
import { EXPERT, RUSTY_DAYS, daysBetween, isRusty, mastersTopic, passesExpert, reviewTopics, rustyTopics } from "@/lib/study/progress";
import { mergeStudy } from "@/lib/progress";

describe("find your level", () => {
  it("lands on the first topic you don't know, in at most four topics, for every possible start", () => {
    // Someone who knows topics 0..k-1 and not k onward (k = 14 knows them all).
    for (let k = 0; k <= TOPICS.length; k++) {
      let s = placeStart();
      for (let id = placeNext(s); id !== null; id = placeNext(s)) s = placeAnswer(s, TOPICS.findIndex((t) => t.id === id) < k);
      expect(s.asked, `k=${k}`).toBeLessThanOrEqual(PLACE_MAX);
      expect(placeResult(s), `k=${k}`).toBe(TOPICS[Math.min(k, TOPICS.length - 1)].id);
    }
  });

  it("every topic has a second question with exactly one right answer", () => {
    for (const t of TOPICS) {
      const q = secondQuestion(t.id);
      expect(q.q.length, t.id).toBeGreaterThan(10);
      expect(q.options.filter((o) => o.right), t.id).toHaveLength(1);
    }
  });
});

describe("expert", () => {
  it("needs the whole set answered and nine of ten right", () => {
    expect(EXPERT).toEqual({ n: 10, seconds: 36, pass: 0.9 });
    expect(passesExpert(10, 9)).toBe(true);
    expect(passesExpert(10, 8)).toBe(false);
    // Nine right but the clock ran out on the tenth: not a pass.
    expect(passesExpert(9, 9)).toBe(false);
  });

  it("an Expert set can master a topic like a topic drill", () => {
    expect(mastersTopic("expert", 10, 0.8)).toBe(true);
    expect(mastersTopic("ten", 10, 1)).toBe(false);
  });

  it("a restored backup keeps Expert topics from both sides", () => {
    const merged = mergeStudy({ drill: {}, expert: { clt: 1 } }, { drill: {}, expert: { ci: 1 } });
    expect(merged.expert).toEqual({ clt: 1, ci: 1 });
  });
});

describe("keep it fresh", () => {
  const won = { asked: 8, correct: 8, best: 1, top: 1 };
  const base = { drill: {}, due: [], streak: { last: null, count: 0 }, mock: 0, hw: {}, math: {} };

  it("a mastered topic reads rusty after two weeks without a right answer, and only a mastered one", () => {
    const p = { ...base, drill: { clt: won, ci: won, data: { asked: 4, correct: 1, best: 0.25 } }, seen: { clt: "2026-11-01", ci: "2026-11-10", data: "2026-10-01" } };
    expect(RUSTY_DAYS).toBe(14);
    expect(daysBetween("2026-11-01", "2026-11-19")).toBe(18);
    expect(isRusty(p, "clt", "2026-11-14")).toBe(false);
    expect(isRusty(p, "clt", "2026-11-15")).toBe(true);
    expect(isRusty(p, "data", "2026-11-19")).toBe(false);
    expect(rustyTopics(p, "2026-11-30")).toEqual(["clt", "ci"]);
  });

  it("a review takes turns over mastered topics, longest left alone first", () => {
    const p = { ...base, drill: { clt: won, ci: won }, seen: { clt: "2026-11-01", ci: "2026-10-01" } };
    expect(reviewTopics(p, "2026-11-19")).toEqual(["ci", "clt", "ci", "clt", "ci"]);
    expect(reviewTopics(base, "2026-11-19")).toEqual([]);
  });

  it("a restored backup keeps the later practice day for each topic", () => {
    const merged = mergeStudy({ drill: {}, seen: { clt: "2026-11-01", ci: "2026-11-10" } }, { drill: {}, seen: { clt: "2026-11-05", ci: "2026-11-02" } });
    expect(merged.seen).toEqual({ clt: "2026-11-05", ci: "2026-11-10" });
  });
});
