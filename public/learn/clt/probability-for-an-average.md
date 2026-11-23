# Chances for an average

> For a question about an average, use the standard error in the z-score: z = (x̄ − μ) ÷ (σ ÷ √n). Then look up Φ as usual. One value: divide by σ.

Canonical URL: https://monte.markets/learn/clt/probability-for-an-average/

License: CC BY 4.0, reuse with credit to monte.markets.

Lesson 4 of 5 in [Sampling distributions and the CLT](https://monte.markets/learn/clt.md).

**Question:** Bottles: mean 500, SD 20. For the average of 25 bottles, what z is 508?

- 0.4: That uses SD 20, which is for one bottle. An average uses the SE.
- 8: 8 is the gap in ml. Divide by the SE.
- **2** (right answer): Yes. SE = 20 ÷ 5 = 4, so z = (508 − 500) ÷ 4 = 2.

For a question about an average, use the standard error in the z-score: z = (x̄ − μ) ÷ (σ ÷ √n). Then look up Φ as usual.

**Question:** So what is the chance the average of 25 bottles is over 508?

- About 97.7%: That's the chance it's below 508.
- **About 2.3%** (right answer): Yes. z = 2, so 1 − Φ(2) ≈ 0.023.
- About 34%: That's for a single bottle (z = 0.4).

One value: divide by σ. An average: divide by σ ÷ √n. That one choice changes the answer completely.

Next: [Proportions are averages too](https://monte.markets/learn/clt/proportions.md)
