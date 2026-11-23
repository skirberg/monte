import { describe, expect, it } from "vitest";
import { generate, isCorrect, trapFor, type Question } from "@/lib/study/drill";

const q = (over: Partial<Question>): Question => ({ q: "Sample variance of 1, 2, 3, 6", a: 4.6667, why: "", mod: "spread", ...over });

describe("drill traps: a wrong answer is explained, not just corrected", () => {
  it("names dividing by n instead of n − 1", () => {
    const v = q({ traps: [[3.5, "You divided by n"]] });
    expect(trapFor(v, "3.5")).toBe("You divided by n");
  });
  it("says nothing for a right answer or an unknown wrong one", () => {
    const v = q({ traps: [[3.5, "You divided by n"]] });
    expect(trapFor(v, "4.67")).toBeNull();
    expect(trapFor(v, "9")).toBeNull();
  });
  it("never offers a trap that equals the answer", () => {
    for (let i = 0; i < 300; i++)
      for (const m of ["center", "spread", "prob", "rv", "two"] as const) {
        const g = { ...generate(m), mod: m } as Question;
        for (const [v] of g.traps ?? []) if (trapFor(g, String(v))) expect(isCorrect(g, String(v))).toBe(false);
      }
  });
});
