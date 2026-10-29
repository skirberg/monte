import { describe, expect, it } from "vitest";
import { TOPIC_IDS } from "@/lib/study/data";
import { generate, isCorrect, pickTopics, shownAnswer, type Question } from "@/lib/study/drill";
import { histogram, parseAnswer } from "@/lib/study/math";
import { settleDue } from "@/lib/study/progress";
import { defaults, solverById, type Answers, type Result } from "@/lib/study/solvers";
import { abTooSmall } from "@/lib/decide/math";

const num = (a: number, extra: Partial<Question> = {}): Question => ({ q: "", a, why: "", mod: "prob", ...extra });

describe("grader: tolerance scales with the answer", () => {
  const twoAces = (4 / 52) * (3 / 51); // 0.0045249
  it("rejects zero and negatives for a small probability", () => {
    expect(isCorrect(num(twoAces), "0")).toBe(false);
    expect(isCorrect(num(twoAces), "-0.001")).toBe(false);
    expect(isCorrect(num(twoAces), "0.001")).toBe(false);
  });
  it("accepts the answer as shown, or rounded to two significant figures", () => {
    expect(isCorrect(num(twoAces), "0.0045")).toBe(true);
    expect(isCorrect(num(twoAces), "0.00452")).toBe(true);
    expect(isCorrect(num(twoAces), "0.45%")).toBe(true);
    expect(isCorrect(num(0.105), "0.11")).toBe(true);
    expect(isCorrect(num(0.3745), "0.37")).toBe(true);
  });
  it("whole counts must be whole", () => {
    expect(isCorrect(num(64, { exact: true }), "64")).toBe(true);
    expect(isCorrect(num(64, { exact: true }), "64.49")).toBe(false);
  });
  it("reads fractions with any minus sign, and rejects trailing junk", () => {
    expect(isCorrect(num(-0.7), "−7/10")).toBe(true);
    expect(isCorrect(num(-0.7), "-7/10")).toBe(true);
    expect(parseAnswer("1,200/2")).toBe(600);
    expect(parseAnswer("2wrong")).toBeNaN();
    expect(parseAnswer("3/")).toBeNaN();
  });
  it("tiny answers show as a number you can type", () => {
    const q = num(0.0000123);
    expect(shownAnswer(q)).not.toMatch(/[<>]/);
    expect(isCorrect(q, shownAnswer(q))).toBe(true);
    expect(isCorrect(q, "0")).toBe(false);
  });
  it("every generated question accepts its own shown answer and rejects 0 when the answer isn't 0", () => {
    for (const id of TOPIC_IDS) {
      for (let i = 0; i < 300; i++) {
        const q = generate(id);
        if (q.text) continue;
        const a = q.a as number;
        expect(isCorrect(q, shownAnswer(q)), `${id}: ${q.q} → ${shownAnswer(q)}`).toBe(true);
        if (Math.abs(a) > 1e-9) expect(isCorrect(q, "0"), `${id}: ${q.q} → ${a}`).toBe(false);
      }
    }
  });
});

describe("default drill covers every topic", () => {
  it("ten-question sets reach all fourteen topics over repeated sets", () => {
    const seen = new Map<string, number>();
    for (let i = 0; i < 100; i++) for (const t of pickTopics(TOPIC_IDS, 10)) seen.set(t, (seen.get(t) ?? 0) + 1);
    for (const id of TOPIC_IDS) expect(seen.get(id) ?? 0, id).toBeGreaterThan(30);
  });
  it("a set never repeats a topic until every chosen topic has had a turn", () => {
    const set = pickTopics(TOPIC_IDS, 20);
    expect(new Set(set.slice(0, 14)).size).toBe(14);
    expect(set).toHaveLength(20);
  });
  it("a single-topic set stays on that topic", () => {
    expect(new Set(pickTopics(["normal"], 8))).toEqual(new Set(["normal"]));
  });
});

describe("CLT histogram keeps every observation", () => {
  it("a mean of exactly 6 lands in the last bin", () => {
    const h = histogram([6, 6, 0], 0, 6, 30);
    expect(h.counts[29]).toBe(2);
    expect(h.counts[0]).toBe(1);
    expect(h.over).toBe(0);
  });
  it("values past the right edge are counted, not dropped", () => {
    const h = histogram([7, 12, 3], 0, 6, 30);
    expect(h.over).toBe(2);
    expect(h.counts.reduce((s, c) => s + c, 0) + h.over).toBe(3);
  });
});

describe("Due today keeps unanswered questions", () => {
  it("only answered questions leave the list; misses come back", () => {
    const due = ["normal", "clt", "ci", "test"] as const;
    expect(settleDue([...due], [], [])).toEqual([...due]);
    expect(settleDue([...due], ["normal", "clt"], ["clt"])).toEqual(["ci", "test", "clt"]);
  });
});

const rows = (r: Result) => {
  expect("err" in r, "err" in r ? r.err : "").toBe(false);
  return (r as Answers).rows;
};
const answer = (r: Result, q: string) => rows(r).find((x) => x.q === q)?.a;

describe("small samples get no false certainty", () => {
  it("A/B: 0 of 3 against 3 of 3 is too small to call", () => {
    expect(abTooSmall(3, 0, 3, 3)).toBe(true);
    expect(abTooSmall(1000, 50, 1000, 70)).toBe(false);
  });
  it("interval for p with 0 of 10 is not 0 to 0", () => {
    const r = solverById("ci").run({ kind: "p", cl: "0.95", n: "10", xbar: "", s: "", x: "0", e: "", em: "m" });
    const main = rows(r).find((x) => /interval for p/.test(x.q) && x.strong);
    expect(main?.a).not.toBe("0 to 0");
    expect(main?.a).toMatch(/^0 to 0\.27/);
  });
  it("proportion test with a tiny sample makes no decision", () => {
    const r = solverById("test").run({ ...defaults(solverById("test")), kind: "p", side: "two", h0: "0.5", n: "8", x: "8", a: "0.05" });
    expect(answer(r, "Decision")).not.toMatch(/^Reject/);
  });
});

describe("tree and Bayes stays consistent", () => {
  const tree = (pa: string, pb: string, ha: string, hb: string) => solverById("tree").run({ a: "A", b: "B", c: "", pa, pb, pc: "", ha, hb, hc: "", h: "H" });
  it("branches that add to more than 1 are rejected", () => {
    expect("err" in tree("0.5004", "0.5004", "1", "1")).toBe(true);
  });
  it("equal reversed conditionals are not called different", () => {
    const trap = rows(tree("0.5", "0.5", "0.5", "0.5")).find((x) => x.q.startsWith("Trap"));
    expect(trap?.a).not.toMatch(/^No/);
  });
  it("independence uses P(A and H) = P(A)P(H), so a zero branch is independent", () => {
    expect(answer(tree("0", "1", "0.3", "0.6"), "Are A and H independent?")).toBe("Yes");
  });
});

describe("explanations don't overclaim", () => {
  it("mean equal to median is not called symmetric", () => {
    const r = solverById("data").run({ x: "0,0,1,1,1,3" });
    expect(answer(r, "Mean vs median")).not.toMatch(/symmetric/i);
  });
});

