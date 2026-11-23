# Hypothesis tests

> A hypothesis test asks: would this data be surprising if nothing were going on? Assume nothing is (H₀). A small p-value means the data would be rare, so reject H₀.

Canonical URL: https://monte.markets/learn/test/

License: CC BY 4.0, reuse with credit to monte.markets.

Topic 12 of 14 in [Learn](https://monte.markets/learn/).

## 5 lessons · 3 min each

1. [Is it real or luck?](https://monte.markets/learn/test/the-question.md)
2. [The p-value](https://monte.markets/learn/test/the-p-value.md)
3. [Deciding with α](https://monte.markets/learn/test/alpha-and-decisions.md)
4. [Two ways to be wrong](https://monte.markets/learn/test/two-errors.md)
5. [The test statistic](https://monte.markets/learn/test/the-test-statistic.md)

## Check yourself

1. H₀ and H₁ for “the machine pours 250 ml on average”?
   - Answer: H₀: μ = 250, H₁: μ ≠ 250
   - Why: H₀ holds the equals sign. The claim you want evidence for goes in H₁.
2. Test statistic for a mean, σ known?
   - Answer: z = (x̄ − μ₀) / (σ / √n)
   - Why: How many standard errors the sample landed from H₀.
3. z = −2.5, two-sided. p-value?
   - Answer: 0.0124
   - Why: 2 × P(Z < −2.5) = 2 × 0.0062.
4. p = 0.012 at α = 0.05. Decision?
   - Answer: Reject H₀
   - Why: The p-value is below α.
5. p = 0.20 at α = 0.05?
   - Answer: Fail to reject H₀
   - Why: That doesn't prove H₀. The data just aren't surprising enough.
6. 16 bags: x̄ = 492 g, s = 12. Test H₀: μ = 500 against H₁: μ < 500 at 5%.
   - Answer: t = −2.67, reject H₀
   - Why: t = (492 − 500) / (12 / √16). One-sided critical t(0.05, 15) = −1.753.
7. 230 of 400 prefer design A. Test H₀: p = 0.5 at 5%.
   - Answer: z = 3.0, reject H₀
   - Why: The SE uses p₀: √(0.5 × 0.5 / 400) = 0.025, so z = 0.075 / 0.025.
8. Type I error?
   - Answer: Rejecting H₀ when it is true
   - Why: A false alarm. Its chance is α.
9. Type II error?
   - Answer: Keeping H₀ when it is false
   - Why: A missed signal, with chance β. Power = 1 − β; a bigger n raises it.
10. How does a test match a confidence interval?
    - Answer: A two-sided test at α rejects exactly when μ₀ is outside the (1 − α) interval

## The idea in one page

A hypothesis test asks: **would this data be surprising if nothing were going on?** Assume nothing is (H₀). A small p-value means the data would be rare, so reject H₀.

A test asks: if nothing were going on, how weird would this data be?

- **A/B tests**: Did the new checkout really lift sales, or was it a lucky week?
- **Operations**: Is the machine off target, or is that its normal wobble?
- **Medicine**: Drug trials rest on tests like this one.

Everyday example: A coffee machine should pour 250 ml. 36 cups average 247.5 ml, σ = 6. z = (247.5 − 250) / (6 / √36) = −2.5. The two-sided p-value is 0.012, under 0.05: reject H₀. It pours short.

## The trap

A p-value is not the chance H₀ is true. It is the chance of data at least this extreme under H₀. For a proportion, the SE uses p₀, not p̂.

## Formulas

- Five steps: State H₀ and H₁, pick α, compute the test statistic, find the p-value, then decide and say it in words
- Mean, σ known: z = (x̄ − μ₀) / (σ / √n)
- Mean, σ unknown: t = (x̄ − μ₀) / (s / √n), with n − 1 df
- Proportion: z = (p̂ − p₀) / √[p₀(1 − p₀) / n]
- Decision: Reject H₀ when p-value < α, or when the statistic is past the critical value
- Errors: Type I: reject a true H₀ (chance α). Type II: keep a false H₀ (chance β). Power = 1 − β
- Excel: Two-sided p for z: 2*(1 − NORM.S.DIST(ABS(z), TRUE)). For t: T.DIST.2T(ABS(t), df)
- Remember it: Innocent until proven guilty. H₀ is the defendant; the p-value is how unlikely the evidence would be if innocent.

## Videos and further reading

- [jbstatistics: An Introduction to Hypothesis Testing](https://www.youtube.com/watch?v=tTeMYuS87oU): A first look at the logic of a hypothesis test, built around one worked example. About 10 minutes.
- [StatQuest: p-values, What they are and how to interpret them](https://www.youtube.com/watch?v=vemZtEM63GY): What a p-value is, how to read one, and what it does not tell you. About 11 minutes.
- [jbstatistics: Type I Errors, Type II Errors, and the Power of the Test](https://www.youtube.com/watch?v=7mE-K_w1v90): The two ways a test can be wrong, how α sets one of them, and what power means. About 8 minutes.

## Next

- [Drill this topic](https://monte.markets/practice/drill/?topic=test)
- Previous topic: [Confidence intervals](https://monte.markets/learn/ci.md)
- Next topic: [Simple regression](https://monte.markets/learn/reg.md)
