# Sampling distributions and the CLT

> Sample means have their own distribution. The Central Limit Theorem says it is near normal for big n, centered on μ, with spread σ / √n (the standard error).

Canonical URL: https://monte.markets/learn/clt/

License: CC BY 4.0, reuse with credit to monte.markets.

Topic 10 of 14 in [Learn](https://monte.markets/learn/).

## 5 lessons · 3 min each

1. [One value versus an average](https://monte.markets/learn/clt/one-versus-average.md)
2. [The standard error](https://monte.markets/learn/clt/standard-error.md)
3. [The Central Limit Theorem](https://monte.markets/learn/clt/the-clt.md)
4. [Chances for an average](https://monte.markets/learn/clt/probability-for-an-average.md)
5. [Proportions are averages too](https://monte.markets/learn/clt/proportions.md)

## Check yourself

1. μ = 50, σ = 12, n = 36. P(49 < x̄ < 51)?
   - Answer: 0.3829
   - Why: SE = 2, z = ±0.5.
2. Why can we use the normal there?
   - Answer: Averages of many independent values come out close to normal, even when the population isn't
   - Why: n over 30 is the usual rule of thumb. Very skewed data can need more.
3. Repair bills: mean 640, SD 480, n = 64. SE?
   - Answer: 60
   - Why: 480 / √64.
4. P(average of 64 bills > 700)?
   - Answer: 0.159
   - Why: z = 1.
5. P(total of 64 bills < 44,000)?
   - Answer: 0.786
   - Why: The total has mean 40,960 and SD 480√64 = 3,840; z = 0.792.
6. p = 0.3, n = 400: P(0.30 ≤ p̂ ≤ 0.33)?
   - Answer: 0.405
   - Why: SE = √(0.3 · 0.7 / 400) = 0.0229, z = 1.31.
7. How large is large enough?
   - Answer: Depends on skew. 30 is the usual rule of thumb; a normal population works at any n.
8. Is a statistic a random variable?
   - Answer: Yes. It changes from sample to sample.
9. A population is 1, 2, 3 and 6. How many samples of n = 2, with replacement?
   - Answer: 16
   - Why: 4 choices each draw. All 16 means average exactly μ = 3.
10. What makes an estimator unbiased?
    - Answer: Its average over every possible sample equals the parameter
    - Why: x̄ for μ, p̂ for p, and s² for σ² are all unbiased.
11. Why does s² divide by n − 1?
    - Answer: Dividing by n runs low by the factor (n − 1)/n
    - Why: With n = 2 it lands on half of σ², on average. n − 1 fixes that.
12. x̄ or the sample median to estimate μ?
    - Answer: For normal data, x̄: unbiased with a smaller spread, so more efficient
    - Why: It depends on the population. On skewed data the median estimates a different center.

## The idea in one page

Sample means have their own distribution. The **Central Limit Theorem** says it is near normal for big n, centered on μ, with spread **σ / √n** (the standard error).

One die roll is flat. The average of 30 rolls is a bell. Averaging cancels noise.

- **Analytics**: Weekly averages are steadier than daily numbers; √n says by how much.
- **Polling**: A poll of 1,000 has about 1.6 points of noise on each candidate's share.
- **Finance**: Many small bets average out far more predictably than one big bet.

Tennis example: One match's first-serve percentage bounces around. Average 36 matches and the noise shrinks 6-fold (√36). At 62% with a match SD of 6 points, the standard error is 1 point: the average almost always lands within 2 of 62.

## The trap

Dividing σ by n instead of √n. The standard error shrinks with the square root: four times the sample only halves the noise.

## Formulas

- Sample mean: Centered on μ with standard error σ / √n
- z for a sample mean: z = (x̄ − μ) / (σ / √n)
- Sum of n values: Mean nμ, SD σ√n
- Sample proportion: Mean p, SE = √[p(1 − p) / n], normal if np ≥ 10 and n(1 − p) ≥ 10
- Central Limit Theorem: Close to normal for large n (rule of thumb 30), whatever the population looks like
- Good estimators: Unbiased: E(estimator) = parameter. Efficient: the smallest variance among the unbiased ones. x̄, p̂ and s² (÷ n − 1) are unbiased.
- Remember it: Averaging is noise cancelling. The √n is the price: four times the data buys half the noise.

## Videos and further reading

- [StatQuest: The Central Limit Theorem, Clearly Explained](https://www.youtube.com/watch?v=YAlJCEDH2uY): Why sample means pile up into a normal shape even when the data are not normal. About 8 minutes.
- [Art of Stat: Sampling Distribution of the Sample Mean](https://istats.shinyapps.io/sampdist_cont/): Set the population to Skewed, draw 1,000 samples at n = 2 and then at n = 30, and compare the shape and spread. About 10 minutes.
- [StatQuest: Why Dividing By N Underestimates the Variance](https://www.youtube.com/watch?v=sHRBg6BhKjI): Why the sample variance divides by n minus 1, the clearest picture of what an unbiased estimator means. About 17 minutes.

## Next

- [Drill this topic](https://monte.markets/practice/drill/?topic=clt)
- Previous topic: [The normal curve](https://monte.markets/learn/normal.md)
- Next topic: [Confidence intervals](https://monte.markets/learn/ci.md)
