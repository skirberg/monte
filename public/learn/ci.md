# Confidence intervals and sample size

> A confidence interval is your estimate plus or minus a margin: estimate ± critical value × standard error. Use z when σ is known, t when you only have s.

Canonical URL: https://monte.markets/learn/ci/

License: CC BY 4.0, reuse with credit to monte.markets.

Topic 11 of 14 in [Learn](https://monte.markets/learn/).

## 5 lessons · 3 min each

1. [An estimate and its margin](https://monte.markets/learn/ci/estimate-plus-margin.md)
2. [What 95% means](https://monte.markets/learn/ci/what-95-means.md)
3. [What makes an interval narrow](https://monte.markets/learn/ci/width.md)
4. [How many do you need?](https://monte.markets/learn/ci/sample-size.md)
5. [When σ is unknown](https://monte.markets/learn/ci/t-intervals.md)

## Check yourself

1. General formula?
   - Answer: Point estimate ± (critical value)(standard error)
2. 25 bottles, x̄ = 502.4 ml, σ = 5 known: 95% CI?
   - Answer: 500.44 to 504.36
   - Why: 502.4 ± 1.96 × 5/√25.
3. 16 trainees, x̄ = 72.5, s = 12: 95% CI?
   - Answer: 66.11 to 78.89
   - Why: t(0.025, 15) = 2.131, so ± 6.39.
4. Same bottles: the 95% margin of error around x̄ = 502.4?
   - Answer: 1.96 ml
   - Why: E = 1.96 × 5/√25. Intervals built this way catch μ 95% of the time; it is not a guaranteed maximum miss.
5. When t instead of z?
   - Answer: When σ is unknown and you use s. Fatter tails, bigger multiplier.
   - Why: t nears z as n grows.
6. 120 of 200 prefer the new app: 90% CI for p?
   - Answer: 0.543 to 0.657
   - Why: p̂ = 0.6 ± 1.645 √(0.6 · 0.4 / 200).
7. Check before using that formula?
   - Answer: np̂ ≥ 10 and n(1 − p̂) ≥ 10
   - Why: 120 and 80, both fine.
8. σ = 2,500, want ± 400 at 95%: n?
   - Answer: 151
   - Why: (1.96 × 2,500 / 400)² = 150.06, round up.
9. Proportion, interval width 0.06 at 95%, no prior guess: n?
   - Answer: 1,068
   - Why: (1.96 / 0.03)² × 0.25 = 1,067.1, round up.
10. Same, but p is known to sit between 0.10 and 0.20?
    - Answer: 683
    - Why: Use 0.20; it gives the larger n.
11. What does 95% confidence mean?
    - Answer: 95% of intervals built this way catch μ. Any one interval either does or doesn't.

## The idea in one page

A **confidence interval** is your estimate plus or minus a margin: **estimate ± critical value × standard error**. Use z when σ is known, t when you only have s.

A confidence interval is your estimate with honest error bars.

- **Polls**: 48% plus or minus 3 means the race is open.
- **Product**: A 4.1% conversion rate over 5,000 visits is really 3.6% to 4.7%.
- **Surveys**: Sample size math says how many people to ask before you trust the answer.

Tennis example: You charted 20 matches: average first serve 115 mph, s = 6. 95% CI: 115 ± 2.093 × 6/√20 = 115 ± 2.8, so 112.2 to 117.8. For ±1 mph at 95%, n = (1.96 × 6 / 1)² ≈ 139 matches.

## The trap

A 95% CI is not a 95% chance that μ is inside. μ is fixed; the interval moves. For sample size, width is 2E: width 0.06 means E = 0.03.

## Formulas

- σ known: x̄ ± z(α/2) · σ / √n
- σ unknown: x̄ ± t(α/2, n − 1) · s / √n
- Proportion: p̂ ± z(α/2) · √[p̂(1 − p̂) / n]
- Sample size for μ: n = (zσ / E)²
- Sample size for p: n = z² p(1 − p) / E², using p = 0.5 with no prior estimate
- z values: 1.645 (90%), 1.96 (95%), 2.576 (99%). Always round n up.
- Remember it: A confidence interval is a margin of error around your guess. More confidence widens it; more data tightens it.

## Videos and further reading

- [jbstatistics: Introduction to Confidence Intervals](https://www.youtube.com/watch?v=27iSnzss2wM): What a confidence interval is and the right way to say what 95% means. About 7 minutes.
- [R Psychologist: Interpreting Confidence Intervals](https://rpsychologist.com/d3/CI/): Watch intervals from repeated samples and count how many miss the true mean. About 5 minutes.
- [jbstatistics: Determining the Required Sample Size](https://www.youtube.com/watch?v=7zcbVaVz_P8): Solve the margin of error formula for n, with a worked example. About 5 minutes.

## Next

- [Drill this topic](https://monte.markets/practice/drill/?topic=ci)
- Previous topic: [Sampling and the CLT](https://monte.markets/learn/clt.md)
- Next topic: [Hypothesis tests](https://monte.markets/learn/test.md)
