import { describe, expect, it } from "vitest";
import { TOPICS } from "@/lib/study/data";
import { LESSONS, lessonScore } from "@/lib/study/lessons";

describe("lessons", () => {
  it("every topic has five lessons with unique slugs", () => {
    for (const t of TOPICS) {
      const ls = LESSONS[t.id];
      expect(ls?.length, t.id).toBe(5);
      expect(new Set(ls.map((l) => l.slug)).size, t.id).toBe(5);
    }
  });
  it("every lesson opens with a question and every question has exactly one right answer", () => {
    for (const t of TOPICS)
      for (const l of LESSONS[t.id]) {
        expect("ask" in l.steps[0], `${t.id}/${l.slug} opens with a question`).toBe(true);
        for (const s of l.steps)
          if ("ask" in s) {
            expect(s.options.filter((o) => o.right).length, `${t.id}/${l.slug}: ${s.ask}`).toBe(1);
            for (const o of s.options) expect(o.why.length, o.text).toBeGreaterThan(10);
          }
      }
  });
  it("no em or en dashes in lesson text", () => {
    const text = JSON.stringify(LESSONS);
    expect(text).not.toMatch(/[–—]/);
  });
});

describe("lessonScore", () => {
  const l = LESSONS.data[0];
  const qs = l.steps.flatMap((s, i) => ("ask" in s ? [{ i, right: s.options.findIndex((o) => o.right) }] : []));
  it("counts a run with every answer right as clean", () => {
    const picks = Object.fromEntries(qs.map((q) => [q.i, q.right]));
    expect(lessonScore(l, picks)).toEqual({ asked: qs.length, right: qs.length, clean: true });
  });
  it("a run with one wrong answer is not clean", () => {
    const picks = Object.fromEntries(qs.map((q, k) => [q.i, k === 0 ? (q.right + 1) % 3 : q.right]));
    expect(lessonScore(l, picks)).toEqual({ asked: qs.length, right: qs.length - 1, clean: false });
  });
});
