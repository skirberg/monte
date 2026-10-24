import { describe, expect, it } from "vitest";
import {
  americanToDecimal, decimalToAmerican, decimalToFractional, formatOdds, fractionalToDecimal, impliedFromDecimal,
  kelly, marketBreakEven, marketEvYes, oneSdMove, overround, pctile, probAbove, readNumber, triCdf, triMean, triangular,
} from "@/lib/decide/math";
import { placeLabel, textWidth } from "@/lib/decide/chart";
import { DISCLAIMER, GROUPS, TOOLS, TOOL_IDS, prevNext, toolHref, toolInfo, toolMetadata } from "@/lib/decide/tools";

const implied = (a: number) => impliedFromDecimal(americanToDecimal(a));

describe("bet odds", () => {
  it("American odds to implied chance", () => {
    expect(implied(-110)).toBeCloseTo(0.52381, 5);
    expect(implied(150)).toBeCloseTo(0.4, 10);
    expect(americanToDecimal(50)).toBeNaN();
  });
  it("two-sided −110 / −110 has a 4.76% margin", () => {
    const o = overround(implied(-110), implied(-110));
    expect(o.margin).toBeCloseTo(0.0476, 4);
    expect(o.fairA).toBeCloseTo(0.5, 10);
  });
  it("converts between formats", () => {
    expect(fractionalToDecimal("10/11")).toBeCloseTo(1.90909, 5);
    expect(fractionalToDecimal("3/2")).toBe(2.5);
    expect(decimalToAmerican(2.5)).toBe(150);
    expect(decimalToAmerican(americanToDecimal(-110))).toBe(-110);
    expect(decimalToFractional(americanToDecimal(-110))).toBe("10/11");
    expect(formatOdds("american", 2.5)).toBe("+150");
    expect(formatOdds("decimal", 2.5)).toBe("2.5");
  });
  it("Kelly: 10% at even money with p = 0.55, nothing on a negative edge", () => {
    expect(kelly(0.55, 2)).toBeCloseTo(0.1, 10);
    expect(kelly(0.45, 2)).toBe(0);
    expect(kelly(0.5, 1)).toBe(0);
  });
  it("readNumber handles commas, dollars, plus and typed minus signs", () => {
    expect(readNumber("$1,200")).toBe(1200);
    expect(readNumber("+150")).toBe(150);
    expect(readNumber("−110")).toBe(-110);
    expect(readNumber("abc")).toBeNaN();
  });
});

describe("prediction market", () => {
  it("expected value and break-even", () => {
    expect(marketEvYes(0.6, 50, 2)).toBeCloseTo(8, 10);
    expect(marketBreakEven(50, 2)).toBeCloseTo(0.52, 10);
  });
});

describe("options", () => {
  it("P(S_T > K) for S = 100, K = 110, σ = 0.30, 30 days", () => {
    expect(probAbove(100, 110, 0.3, 30)).toBeCloseTo(0.12483, 4);
    expect(probAbove(100, 110, 0, 30)).toBeNaN();
  });
  it("one SD move", () => {
    expect(oneSdMove(100, 0.3, 365)).toBeCloseTo(30, 10);
  });
});

describe("triangular ranges", () => {
  it("mean is (a + b + c) / 3", () => {
    expect(triMean(10, 20, 60)).toBeCloseTo(30, 10);
    expect(triMean(0, 0, 3)).toBe(1);
  });
  it("draws invert the CDF", () => {
    for (const u of [0, 0.1, 0.25, 0.5, 0.9, 0.999]) expect(triCdf(10, 20, 60, triangular(10, 20, 60, u))).toBeCloseTo(u, 9);
  });
  it("percentile interpolates", () => {
    expect(pctile([1, 2, 3, 4], 0.5)).toBe(2.5);
    expect(pctile([], 0.5)).toBeNaN();
  });
});

describe("decide pages", () => {
  it("nine tools in four groups, each with a unique id and a question", () => {
    expect(GROUPS.map((g) => g.name)).toEqual(["Choose", "Money and risk", "Evidence", "Plan"]);
    expect(TOOL_IDS).toEqual(["choose", "warranty", "bet", "market", "option", "bayes", "abtest", "goal", "staffing"]);
    expect(new Set(TOOL_IDS).size).toBe(TOOLS.length);
    for (const t of TOOLS) {
      expect(t.question.endsWith("?")).toBe(true);
      expect(t.description.length).toBeGreaterThan(60);
      // House style: no em dashes in copy.
      expect(`${t.question} ${t.line} ${t.lede} ${t.description}`).not.toContain("\u2014");
    }
    expect(DISCLAIMER).toBe("For learning, not financial, medical or betting advice.");
  });
  it("prev and next run through the groups in order, with nothing past the ends", () => {
    expect(prevNext("choose").prev).toBeNull();
    expect(prevNext("choose").next?.id).toBe("warranty");
    expect(prevNext("option").next?.id).toBe("bayes");
    expect(prevNext("staffing").next).toBeNull();
    expect(toolInfo("abtest")).toMatchObject({ group: "Evidence", n: "07" });
  });
  it("each page has its own title and canonical URL", () => {
    const m = toolMetadata("bayes");
    expect(m.title).toBe("Is this test result real?");
    expect(m.alternates?.canonical).toBe("/decide/bayes/");
    expect(toolHref("goal")).toBe("/decide/goal/");
  });
});

describe("chart labels stay off your line", () => {
  const box = { min: 12, max: 548 };
  it("sits right of the bar when there is room", () => {
    expect(placeLabel({ x0: 100, x1: 200, lx: 400, w: 40, ...box })).toEqual({ x: 208, anchor: "start", beside: true });
  });
  it("moves left of the bar when the line is just past its end", () => {
    const s = placeLabel({ x0: 100, x1: 200, lx: 220, w: 40, ...box });
    expect(s).toEqual({ x: 92, anchor: "end", beside: true });
  });
  it("moves left of the bar at the right edge", () => {
    expect(placeLabel({ x0: 400, x1: 530, lx: 100, w: 40, ...box })).toEqual({ x: 392, anchor: "end", beside: true });
  });
  it("goes above and to one side of the line when neither side fits", () => {
    const s = placeLabel({ x0: 30, x1: 530, lx: 60, w: 60, ...box });
    expect(s.beside).toBe(false);
    expect(s.x >= 60 + 6 || s.x + 60 <= 60 - 6).toBe(true);
  });
  it("never covers the line, for any line position", () => {
    const w = textWidth("Product B");
    for (let lx = 12; lx <= 548; lx += 4) {
      for (const [x0, x1] of [[20, 120], [200, 360], [420, 540], [15, 545]]) {
        const s = placeLabel({ x0, x1, lx, w, ...box });
        const a = s.anchor === "start" ? s.x : s.x - w;
        expect(lx < a - 5 || lx > a + w + 5).toBe(true);
        expect(a).toBeGreaterThanOrEqual(box.min);
        expect(a + w).toBeLessThanOrEqual(box.max);
      }
    }
  });
});
