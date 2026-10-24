import { describe, expect, it } from "vitest";
import { chipsFor } from "@/lib/play/scoring";

describe("election chips", () => {
  it("pays nothing either way for a 50/50 call", () => {
    expect(chipsFor(0.5, 1)).toBe(0);
    expect(chipsFor(0.5, 0)).toBe(0);
  });
  it("+24 for a right call at 90%, −56 for a wrong one", () => {
    expect(chipsFor(0.9, 1)).toBe(24);
    expect(chipsFor(0.9, 0)).toBe(-56);
  });
  it("is symmetric between the two sides", () => {
    expect(chipsFor(0.1, 0)).toBe(24);
    expect(chipsFor(0.1, 1)).toBe(-56);
  });
  it("pays most on average for saying what you believe", () => {
    const ev = (said: number, truth: number) => truth * chipsFor(said, 1) + (1 - truth) * chipsFor(said, 0);
    expect(ev(0.7, 0.7)).toBeGreaterThan(ev(0.9, 0.7));
    expect(ev(0.7, 0.7)).toBeGreaterThan(ev(0.5, 0.7));
  });
});
