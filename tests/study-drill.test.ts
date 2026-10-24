import { describe, expect, it } from "vitest";
import { TOPIC_IDS } from "@/lib/study/data";
import { dailyQuestions, generate, isCorrect, shownAnswer, type Question } from "@/lib/study/drill";
import { SOLVERS, defaults, sNum, solverById, type Answers, type Result } from "@/lib/study/solvers";

const num = (a: number, extra: Partial<Question> = {}): Question => ({ q: "", a, why: "", mod: "prob", ...extra });
const typeI: Question = { q: "", a: ["i", "typei", "one", "typeone", "1", "type1"], why: "", text: true, mod: "test" };

describe("drill answer grader", () => {
  it("accepts a percent for a probability", () => {
    expect(isCorrect(num(0.37), "37%")).toBe(true);
    expect(isCorrect(num(0.37), "0.37")).toBe(true);
    expect(isCorrect(num(0.37), ".37")).toBe(true);
  });
  it("allows 2% or 0.01, whichever is wider, and no more", () => {
    expect(isCorrect(num(0.37), "0.379")).toBe(true);
    expect(isCorrect(num(0.37), "0.39")).toBe(false);
    expect(isCorrect(num(250), "254")).toBe(true);
    expect(isCorrect(num(250), "256")).toBe(false);
  });
  it("does not divide a percent for answers that are not probabilities", () => {
    expect(isCorrect(num(37), "37%")).toBe(true);
  });
  it("whole-number answers must match after rounding", () => {
    expect(isCorrect(num(385, { exact: true }), "385")).toBe(true);
    expect(isCorrect(num(385, { exact: true }), "384.6")).toBe(true);
    expect(isCorrect(num(385, { exact: true }), "386")).toBe(false);
  });
  it("accepts fractions and typed minus signs", () => {
    expect(isCorrect(num(0.375), "3/8")).toBe(true);
    expect(isCorrect(num(-2), "−2")).toBe(true);
  });
  it("accepts every way of writing Type I and rejects Type II", () => {
    for (const s of ["1", "type 1", "Type I", "I", "one", "type one"]) expect(isCorrect(typeI, s)).toBe(true);
    for (const s of ["2", "Type II", "II"]) expect(isCorrect(typeI, s)).toBe(false);
  });
  it("rejects blanks and junk", () => {
    expect(isCorrect(num(0.37), "")).toBe(false);
    expect(isCorrect(num(0.37), "   ")).toBe(false);
    expect(isCorrect(num(0.37), "abc")).toBe(false);
    expect(isCorrect(typeI, "")).toBe(false);
    expect(isCorrect(typeI, "  ")).toBe(false);
  });
});

describe("drill generators", () => {
  it("every topic makes a question whose shown answer the grader accepts", () => {
    for (const id of TOPIC_IDS) {
      for (let i = 0; i < 200; i++) {
        const q = generate(id);
        expect(q.mod).toBe(id);
        expect(typeof q.q).toBe("string");
        if (!q.text) expect(Number.isFinite(q.a as number), `${id}: ${q.q}`).toBe(true);
        // Tiny answers show as "< 0.0001", which is not a number to type; 0 is within tolerance for them.
        const shown = shownAnswer(q);
        const typed = /^[<>]/.test(shown) ? "0" : shown;
        expect(isCorrect(q, typed), `${id}: ${q.q} → ${shown}`).toBe(true);
      }
    }
  });
  it("Monte Daily is the same five questions for everyone on a date", () => {
    const a = dailyQuestions("2026-10-24");
    const b = dailyQuestions("2026-10-24");
    expect(a).toHaveLength(5);
    expect(b).toEqual(a);
    expect(new Set(a.map((q) => q.mod)).size).toBe(5);
    expect(dailyQuestions("2026-10-25")).not.toEqual(a);
  });
});

const rows = (r: Result) => {
  expect("err" in r, "err" in r ? r.err : "").toBe(false);
  return (r as Answers).rows;
};
const answer = (r: Result, q: string) => rows(r).find((x) => x.q === q)?.a;

describe("solvers", () => {
  it("sNum reads numbers, percents and fractions, NaN for blanks", () => {
    expect(sNum("0.7")).toBe(0.7);
    expect(sNum("70%")).toBeCloseTo(0.7, 12);
    expect(sNum("7/10")).toBe(0.7);
    expect(sNum("1,200")).toBe(1200);
    expect(sNum("")).toBeNaN();
    expect(sNum("  ")).toBeNaN();
  });
  it("every solver runs on its defaults and presets", () => {
    for (const s of SOLVERS) {
      rows(s.run(defaults(s)));
      for (const [, v] of s.presets) rows(s.run({ ...defaults(s), ...v }));
    }
  });
  it("Poisson: P(exactly 1 | at least one) with λ = 2", () => {
    const r = solverById("poisson").run({ r: "2", u: "hour", t: "1", k: "1" });
    expect(answer(r, "P(exactly 1 | at least one)")).toBe("0.313");
    expect(answer(r, "P(exactly 1)")).toBe("0.2707");
  });
  it("Poisson rejects a zero rate", () => {
    expect("err" in solverById("poisson").run({ r: "0", u: "hour", t: "1", k: "1" })).toBe(true);
  });
});
