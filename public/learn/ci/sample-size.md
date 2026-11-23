# How many do you need?

> Sample size for a mean: n = (z × σ ÷ E)², where E is the margin you want. For a proportion: n = z² × p(1 − p) ÷ E², using p = 0.5 if you have no guess.

Canonical URL: https://monte.markets/learn/ci/sample-size/

License: CC BY 4.0, reuse with credit to monte.markets.

Lesson 4 of 5 in [Confidence intervals and sample size](https://monte.markets/learn/ci.md).

**Question:** You want a 95% interval for a mean with margin 2, and σ = 10. What n?

- 96: Always round sample sizes up, or the margin comes out a bit too big.
- 10: Solve the margin formula for n: n = (z·σ ÷ E)².
- **97** (right answer): Yes. n = (1.96 × 10 ÷ 2)² = 9.8² ≈ 96.04, so round up to 97.

Sample size for a mean: n = (z × σ ÷ E)², where E is the margin you want. For a proportion: n = z² × p(1 − p) ÷ E², using p = 0.5 if you have no guess. Always round up.

**Question:** A poll wants a 95% interval with total width 0.06. What is E?

- 0.12: Halve the width, don't double it.
- **0.03** (right answer): Yes. The width is 2E, so the margin is half of it.
- 0.06: That's the full width, both sides. E is one side.

Width is 2E. Round n up. Use p = 0.5 when you don't know p.

Next: [When σ is unknown](https://monte.markets/learn/ci/t-intervals.md)
