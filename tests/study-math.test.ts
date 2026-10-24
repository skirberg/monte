import { describe, expect, it } from "vitest";
import { Phi, PhiInv, binom, choose, fact, fmt, localDay, parseAnswer, pois, tcdf, tcrit, tinv } from "@/lib/study/math";

describe("normal distribution", () => {
  it("Phi matches the table", () => {
    // The exact value is 0.9750021; the A&S approximation is within 1.5e-7 of it, and 0.97500 to five places.
    expect(Math.abs(Phi(1.96) - 0.9750021)).toBeLessThan(1e-6);
    expect(Phi(1.96).toFixed(5)).toBe("0.97500");
    expect(Phi(0)).toBeCloseTo(0.5, 7);
    expect(Phi(-1.96)).toBeCloseTo(0.0249979, 6);
    expect(Phi(1) + Phi(-1)).toBeCloseTo(1, 9);
  });
  it("PhiInv inverts Phi", () => {
    expect(PhiInv(0.975)).toBeCloseTo(1.95996, 4);
    expect(PhiInv(0.5)).toBeCloseTo(0, 6);
    expect(PhiInv(0.05)).toBeCloseTo(-1.64485, 4);
  });
});

describe("t distribution", () => {
  it("tinv gives the t quantile", () => {
    expect(tinv(0.975, 9)).toBeCloseTo(2.2622, 3);
    expect(tinv(0.95, 20)).toBeCloseTo(1.7247, 3);
    expect(tinv(0.5, 5)).toBeCloseTo(0, 6);
  });
  it("tcdf is symmetric and inverts tinv", () => {
    expect(tcdf(0, 7)).toBeCloseTo(0.5, 9);
    expect(tcdf(2.2622, 9)).toBeCloseTo(0.975, 4);
    expect(tcdf(-1.5, 12) + tcdf(1.5, 12)).toBeCloseTo(1, 9);
  });
  it("tcrit reads the printed table, nearest row at or below df, z past 120", () => {
    expect(tcrit(9, 95)).toBe(2.262);
    expect(tcrit(25, 95)).toBe(2.064); // row 24
    expect(tcrit(200, 95)).toBe(1.96);
  });
});

describe("counting and discrete distributions", () => {
  it("fact and choose", () => {
    expect(fact(0)).toBe(1);
    expect(fact(5)).toBe(120);
    expect(choose(12, 3)).toBe(220);
    expect(choose(9, 2)).toBe(36);
    expect(choose(5, 0)).toBe(1);
    expect(choose(3, 4)).toBe(0);
    expect(choose(3, -1)).toBe(0);
  });
  it("hypergeometric from choose: 1 of 3 and 2 of 9 in 3 draws from 12", () => {
    // No hypergeometric helper is exported; drills and solvers build it from choose.
    expect((choose(3, 1) * choose(9, 2)) / choose(12, 3)).toBeCloseTo(0.490909, 6);
  });
  it("binomial", () => {
    expect(binom(2, 4, 0.5)).toBeCloseTo(0.375, 9);
    expect(binom(0, 10, 0.1)).toBeCloseTo(0.9 ** 10, 12);
    const total = Array.from({ length: 11 }, (_, k) => binom(k, 10, 0.3)).reduce((a, b) => a + b, 0);
    expect(total).toBeCloseTo(1, 12);
  });
  it("Poisson, and Poisson given at least one", () => {
    expect(pois(0, 2)).toBeCloseTo(Math.exp(-2), 12);
    expect(pois(1, 2)).toBeCloseTo(0.270671, 6);
    expect(pois(1, 2) / (1 - pois(0, 2))).toBeCloseTo(0.313035, 6);
  });
});

describe("formatting and parsing", () => {
  it("localDay is the local calendar day as YYYY-MM-DD", () => {
    expect(localDay(new Date(2026, 0, 5, 23, 30).getTime())).toBe("2026-01-05");
    expect(localDay(new Date(2026, 9, 24, 0, 0).getTime())).toBe("2026-10-24");
    expect(localDay(new Date(2026, 11, 31, 23, 59, 59).getTime())).toBe("2026-12-31");
  });
  it("fmt rounds to four places, flags tiny values and adds commas to big ones", () => {
    expect(fmt(0.123456)).toBe("0.1235");
    expect(fmt(0)).toBe("0");
    expect(fmt(0.00001)).toBe("< 0.0001");
    expect(fmt(-0.00001)).toBe("> −0.0001");
    expect(fmt(12345.6)).toBe("12,345.6");
  });
  it("parseAnswer reads what students type", () => {
    expect(parseAnswer("0.42")).toBe(0.42);
    expect(parseAnswer("42%")).toBe(42);
    expect(parseAnswer("3/8")).toBe(0.375);
    expect(parseAnswer("1,200")).toBe(1200);
    expect(parseAnswer("$40")).toBe(40);
    expect(parseAnswer("−2")).toBe(-2);
    expect(parseAnswer("")).toBeNaN();
    expect(parseAnswer("abc")).toBeNaN();
  });
});
