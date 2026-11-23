import { describe, expect, it } from "vitest";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { DAILY_START } from "@/lib/play/daily";
import { practiceRound, shuffleRound, type ShuffleRound } from "@/lib/play/shuffle";
import { chain, crowd, doorGrains, gamma, lognormal, moments, normal, sample } from "@/lib/play/shuffle-fig";
import { ShuffleWork } from "@/components/play/shuffle-work";

// The Shuffle's reveal draws the work (DESIGN.md, "The Shuffle", design pass of Nov 20 2026). The picture is made
// from the same numbers as the steps, so these hold every picture to its round: two years of daily rounds and
// every practice family.
const addDays = (day: string, n: number) => {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
const rounds: ShuffleRound[] = [...Array.from({ length: 730 }, (_, i) => shuffleRound(addDays(DAILY_START, i))), ...Array.from({ length: 60 }, (_, i) => practiceRound(i))];
const grainOf = (r: ShuffleRound) => r.cups.find((c) => c.right)!;
const html = (t: string) => t.replace(/&/g, "&amp;").replace(/'/g, "&#x27;").replace(/</g, "&lt;");
const KIND: Record<ShuffleRound["family"], string> = { average: "curves", crate: "curves", range: "ranges", shape: "skew", bayes: "people", either: "chain", given: "groups", birthday: "pairs", doors: "doors", edge: "wheel" };

describe("the Shuffle's drawn work", () => {
  it("draws every round with its family's picture, and no broken number", () => {
    for (const r of rounds) {
      expect(r.fig.kind, `${r.family} ${r.n}`).toBe(KIND[r.family]);
      const svg = renderToStaticMarkup(React.createElement(ShuffleWork, { fig: r.fig, answer: grainOf(r).label }));
      expect(svg, `${r.family} ${r.n}`).not.toMatch(/NaN|undefined|Infinity/);
      // The grain's own answer is on the picture, and the picture says itself to a screen reader.
      expect(svg, `${r.family} ${r.n}`).toContain(html(grainOf(r).label.replace(/–.*/, "")));
      expect(svg).toMatch(/role="img" aria-label="[^"]{40,}"/);
    }
  });

  it("puts the numbers the work writes on the picture", () => {
    for (const r of rounds) {
      const f = r.fig;
      const answer = grainOf(r);
      if (f.kind === "people") {
        // natural frequencies: of the flagged, the share that have it is the grain, to the label's rounding
        expect(f.hit / (f.hit + f.fa), r.q).toBeCloseTo(f.answer, 1);
        const dots = crowd(f.per, f.sick, f.hit, f.fa);
        expect(dots.filter((d) => d === "hit").length + dots.filter((d) => d === "false").length).toBe(f.hit + f.fa);
        expect(r.work[0]).toContain(`${f.hit} of them get flagged`);
      }
      if (f.kind === "chain") {
        const steps = chain(f.p, f.n);
        expect(steps.reduce((a, s) => a + s.lost, 0)).toBeCloseTo(f.least, 3);
        expect(1 - steps.reduce((a, s) => a + s.lost, 0)).toBeCloseTo(f.none, 3);
      }
      if (f.kind === "groups") {
        expect(f.AB).toBeLessThanOrEqual(Math.min(f.A, f.B));
        expect(f.A).toBeLessThan(f.N);
        expect(r.work.join(" ")).toContain(`${f.AB} ÷ ${f.A}`);
      }
      if (f.kind === "doors") {
        const g = doorGrains(f.v, f.opened);
        expect(g.reduce((a, b) => a + b, 0)).toBe(2 * f.v);
        // a closed door's grains out of all of them is the chance the work ends on
        const closed = g[1] / (2 * f.v);
        const worked = r.work.at(-1)!.match(/= (0\.\d+)/);
        expect(closed, r.q).toBeCloseTo(worked ? Number(worked[1]) : 2 / 3, 4);
      }
      if (f.kind === "wheel") {
        expect(f.win - f.lose).toBeCloseTo(f.ev, 9);
        expect(r.work[2]).toContain(`$${Math.abs(f.ev).toFixed(2)}`);
      }
      if (f.kind === "ranges") {
        expect(f.grain[0]).toBeGreaterThan(f.wide[0]);
        expect(f.grain[1]).toBeLessThan(f.wide[1]);
        expect(answer.lines).toEqual([f.grain[0].toFixed(f.dp), f.grain[1].toFixed(f.dp)]);
      }
      if (f.kind === "pairs") expect(f.k).toBe((f.n * (f.n - 1)) / 2);
      if (f.kind === "curves") {
        expect(f.se).toBeLessThan(f.sd);
        expect(f.answer).toBeGreaterThan(0);
      }
    }
  });

  it("draws shapes honestly: area one, and a skewed shape keeps the mean and SD the facts give", () => {
    expect(moments(sample(normal(500, 20), 380, 620, 400)).area).toBeCloseTo(1, 3);
    for (const [m, s] of [[5, 2.5], [68, 40 / Math.sqrt(5)], [4, 3]] as const)
      for (const f of [gamma(m, s), lognormal(m, s)]) {
        const got = moments(sample(f, 0, m + 14 * s, 4000));
        expect(Math.abs(got.mean - m) / m).toBeLessThan(0.02);
        expect(Math.abs(got.sd - s) / s).toBeLessThan(0.05);
      }
  });
});
