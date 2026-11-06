import { describe, expect, it } from "vitest";
import { TOPICS } from "@/lib/study/data";
import { LESSONS } from "@/lib/study/lessons";

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
