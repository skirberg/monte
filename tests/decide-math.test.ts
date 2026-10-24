import { describe, expect, it } from "vitest";
import {
  americanToDecimal, decimalToAmerican, decimalToFractional, formatOdds, fractionalToDecimal, impliedFromDecimal,
  kelly, marketBreakEven, marketEvYes, oneSdMove, overround, pctile, probAbove, readNumber, triCdf, triMean, triangular,
} from "@/lib/decide/math";

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
