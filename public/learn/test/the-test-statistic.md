# The test statistic

> A test statistic measures how far the data are from H₀ in standard errors: z = (x̄ − μ₀) ÷ (σ ÷ √n).

Canonical URL: https://monte.markets/learn/test/the-test-statistic/

License: CC BY 4.0, reuse with credit to monte.markets.

Lesson 5 of 5 in [Hypothesis tests](https://monte.markets/learn/test.md).

**Question:** A machine should fill 500 ml. 36 bottles average 503, σ = 12. What's z?

- 3: 3 is the gap in ml. Divide by the SE, 2.
- **1.5** (right answer): Yes. SE = 12 ÷ 6 = 2, so z = (503 − 500) ÷ 2 = 1.5.
- 0.25: That divides by σ. A test about a mean uses the SE.

A test statistic measures how far the data are from H₀ in standard errors: z = (x̄ − μ₀) ÷ (σ ÷ √n). For a proportion, the SE uses p₀, the value under H₀: √(p₀(1 − p₀) ÷ n).

**Question:** z = 1.5 in a two-sided test. Is it significant at α = 0.05?

- Yes: 1.5 is under 1.96, so it falls short.
- Only if one-sided: Even one-sided at 0.05 needs z > 1.645. 1.5 still falls short.
- **No** (right answer): Yes, right: two-sided at 0.05 needs |z| > 1.96. The p-value here is about 0.13.

Test statistic in SEs, then compare to the critical value or get the p-value.

Next: [Drill this topic, 8 questions](https://monte.markets/practice/drill/?topic=test&n=8)
