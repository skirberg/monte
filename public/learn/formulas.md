# Statistics formula sheet

> A statistics formula sheet: every core formula, when to use it and a worked example. Built to print, free.

Canonical URL: https://monte.markets/learn/formulas/

License: CC BY 4.0, reuse with credit to monte.markets.

## Memory hooks

- **Steps, Variance and SD**: My Desk Shows Some Daily Risk
  - Mean, Distance, Square, Sum, Divide, Root
- **μ vs x̄, True vs estimate**: The real answer vs your best guess
  - Greek is real, bar or hat is a guess
- **n − 1, Sample correction**: A sample gets one taken off
  - Only the sample gets it
- **Mean vs median, Outliers**: Average salary with the boss in the room
  - Median is the typical person
- **Skew, Tail**: The mean chases the tail
  - Income = right skew
- **SD, Spread**: How bumpy the ride is
  - Same average, smoother wins
- **CV, SD ÷ mean**: Risk per unit of reward
  - Lower is better
- **68 / 95 / 99.7, Empirical rule**: Daily noise, monthly jolt, yearly headline
  - 1 in 3, 1 a month, 1 in 1.5 years
- **Or, Addition**: Two guest lists, count overlaps once
  - Don't count the heart face cards twice
- **And, Multiplication**: Combo lock: every dial must hit
  - More dials, less likely
- **Given, Conditional**: Filter the list, then count
  - Break-point conversion
- **Mutually exclusive, Can't both**: Heads and tails on one flip
  - Never independent
- **Expected value, Weighted average**: What a bet is worth on average
  - You never roll 3.5
- **Correlation, Move together**: Diversification dial
  - Below 1 cuts risk
- **Binomial, Count wins in n tries**: Tiebreaks won out of 3
  - np, np(1−p)
- **Poisson, Count per window**: Calls to a help desk
  - Rescale λ first
- **z, SDs from the mean**: 1.28, 1.645, 1.96, 2.576
  - Memorize four numbers
- **√n, Noise cancelling**: 4× the data buys half the noise
  - SE = σ/√n
- **CI, Estimate ± margin**: Margin of error around your guess
  - 95% of intervals catch μ
- **Regression, Best-fit line**: Rise over run
  - Never extrapolate
- **VIF, Redundancy**: Two ingredients that are the same thing
  - Above 10 is trouble
- **p-value, Surprise score**: If the p is low, H₀ must go
  - Small p: reject. Big p: keep H₀, but it is not proven
- **Type I vs II, False alarm vs miss**: I cry wolf, II misses the wolf
  - α is the false-alarm rate; power catches the wolf

## 1. Data and sampling

- **What statistics is**: Using data to make decisions
  - Example: Survey, chart, average, decide
- **Describe vs infer**: Describe what you have; infer the bigger group
  - Example: Team average age vs election poll
- **Sampling**: Random = fair, stratified = every group, risk-based = riskiest group
  - Example: Oversample the largest claims, then reweight
- **Data types**: Quantitative vs qualitative; discrete vs continuous; univariate vs multivariate
  - Example: Zip code is a label

## 2. Where is the middle

- **Mean**: Add up, divide by how many
  - Example: 15, 7, 22, 7, 29, 11, 5, 0 = 12
- **Median**: Middle once sorted; average the two middles if even
  - Example: Same data = 9
- **Mode**: Most frequent; none or bimodal possible
  - Example: 40, 55, 45, 70, 55, 60, 40, 35 = 40 and 55
- **Skew**: Right skew: mode < median < mean
  - Example: Income

## 3. How spread out is it

- **Range**: Max − min; one outlier sets it
  - Example: 75 − 12 = 63
- **Population variance**: Σ(y − μ)² / N
  - Example: 4, 7, 10: 18/3 = 6, σ = 2.45
- **Sample variance**: Σ(y − ȳ)² / (n − 1)
  - Example: 18/2 = 9, s = 3
- **Shortcut**: [Σy² − (Σy)²/n] / (n − 1)
  - Example: 165 − 147 = 18, then ÷ 2
- **Empirical rule**: 68 / 95 / 99.7% within 1 / 2 / 3 SD
  - Example: 400 ± 50: 350 to 450
- **Coefficient of variation**: s / x̄, risk per unit of return
  - Example: B: 8.4 / 10.8 = 78%

## 4. Probability rules

- **Complement**: P(not A) = 1 − P(A)
  - Example: P(not a 1 or 2) = 4/6
- **Or**: P(A) + P(B) − P(both)
  - Example: Heart or face card = 22/52
- **Given**: P(A and B) / P(B)
  - Example: P(spa | gym) = 0.12 / 0.60
- **And**: P(A) × P(B | A)
  - Example: Two aces = 4/52 × 3/51
- **Independent**: P(A and B) = P(A)P(B)
  - Example: Two heads = 0.25
- **Tree**: Multiply along, add across
  - Example: 0.85 × 0.95 = 0.8075

## 5. Random variables and expected value

- **Expected value**: Σ y P(y)
  - Example: Four-sided die = 2.5
- **Variance**: Σ (y − μ)² P(y) = Σy²P(y) − μ²
  - Example: Y: 2,684
- **CV**: σ / μ
  - Example: Lower is better
- **Constants**: E(a + bY) = a + bE(Y); Var = b² Var(Y)
  - Example: Y + 10: mean shifts, SD stays

## 6. Two variables: covariance, correlation, portfolios

- **Covariance**: ΣΣ xy P(x, y) − μx μy
  - Example: 99 − 86.4 = 12.6
- **Correlation**: Cov / (σx σy)
  - Example: 12.6 / (6 × 8.4) = 0.25
- **Portfolio mean**: bE(X) + cE(Y)
  - Example: 0.5(8) + 0.5(10.8) = 9.4
- **Portfolio variance**: b²V(X) + c²V(Y) + 2bc Cov
  - Example: 32.94, σ = 5.74
- **Cov = 0**: Not the same as independent
  - Example: Y = X²

## 7. Counting and the binomial

- **Factorial**: n! = n(n − 1)…1; 0! = 1
  - Example: 6! = 720
- **Combinations**: nCx = n! / [x!(n − x)!]
  - Example: C(5,2) = 10
- **Binomial**: nCy pʸ (1 − p)ⁿ⁻ʸ
  - Example: P(2 of 8 at 0.2) = 0.294
- **Mean, variance**: np, np(1 − p)
  - Example: 8 × 0.2 = 1.6
- **Hypergeometric**: C(K, k) C(N − K, n − k) / C(N, n)
  - Example: 10 phones, 3 bad, pick 4: P(1 bad) = 0.5

## 8. Poisson: counts per unit

- **Poisson**: e⁻λ λʸ / y!
  - Example: λ = 3: P(3) = 0.224
- **Rescale λ**: rate × window
  - Example: 30 an hour → 5 per 10 minutes
- **Mean = variance**: Both λ
  - Example: λ = 6: mean 6, variance 6

## 9. The normal curve and z

- **z score**: (y − μ) / σ
  - Example: (525 − 400) / 50 = 2.5
- **Less than**: Φ(z)
  - Example: P(Y < 525) = 0.9938
- **Greater than**: 1 − Φ(z)
  - Example: P(Y > 475) = 0.0668
- **Between**: Φ(z of b) − Φ(z of a)
  - Example: 400 to 475: 0.4332
- **Reverse**: y = μ + zσ
  - Example: 10% run out: 400 + 1.28(50) = 464
- **Key z**: 1.28, 1.645, 1.96, 2.576
  - Example: 90%, 95% one-sided, 95%, 99%
- **Uniform**: (d − c) / (b − a)
  - Example: 0 to 20, P(over 15) = 0.25

## 10. Sampling distributions and the CLT

- **Standard error**: σ / √n
  - Example: 12 / √36 = 2
- **z for x̄**: (x̄ − μ) / (σ / √n)
  - Example: (51 − 50) / 2 = 0.5
- **Sum of n**: Mean nμ, SD σ√n
  - Example: 64 bills: 40,960 and 3,840
- **Proportion**: SE = √[p(1 − p) / n]
  - Example: 0.3, n = 400: 0.0229
- **How big is n**: Rule of thumb 30; depends on skew
  - Example: A normal population works at any n
- **Unbiased**: E(estimator) = parameter
  - Example: x̄, p̂, s² with n − 1

## 11. Confidence intervals and sample size

- **σ known**: x̄ ± z σ / √n
  - Example: 502.4 ± 1.96(5 / √25)
- **σ unknown**: x̄ ± t s / √n, df = n − 1
  - Example: 72.5 ± 2.131(12 / √16)
- **Proportion**: p̂ ± z √[p̂(1 − p̂) / n]
  - Example: 0.6 ± 1.645(0.0346)
- **n for μ**: (zσ / E)²
  - Example: (1.96 × 2,500 / 400)² → 151
- **n for p**: z² p(1 − p) / E², p = 0.5 worst case
  - Example: (1.96 / 0.03)² × 0.25 → 1,068
- **Confidence level**: 1 − α; z: 1.645, 1.96, 2.576
  - Example: Round n up

## 12. Hypothesis tests

- **Test statistic**: (estimate − H₀ value) / SE
  - Example: (247.5 − 250) / 1 = −2.5
- **p-value, two-sided**: 2 × P(Z > |z|)
  - Example: z = 2.5: 0.0124
- **Decide**: Reject H₀ if p < α
  - Example: 0.012 < 0.05: reject
- **Proportion SE**: √[p₀(1 − p₀) / n], with p₀
  - Example: p₀ = 0.5, n = 400: 0.025
- **Errors**: Type I = α, Type II = β
  - Example: Power = 1 − β

## 13. Simple regression

- **Slope**: [nΣxy − ΣxΣy] / [nΣx² − (Σx)²]
  - Example: 192 / 168 = 1.143
- **Intercept**: ȳ − b₁x̄
  - Example: 6 − 1.143(4) = 1.429
- **Sums of squares**: SST = SSR + SSE; R² = SSR / SST
  - Example: 36.57 / 42 = 87.1%
- **Residual SD**: s = √(SSE / (n − 2))
  - Example: √(5.43 / 4) = 1.16
- **Slope test**: t = b₁ / SE, df = n − 2
  - Example: 5.19 vs 2.776, reject
- **Intervals**: CI for the mean y is narrower than the PI for one y
  - Example: Widest far from x̄

## 14. Multiple regression

- **ANOVA**: F = MSR / MSE, df (k, n − k − 1)
  - Example: 18.2 vs 3.89, reject
- **Each t**: bⱼ / SE(bⱼ)
  - Example: SqFt t = 3.40, p = 0.005
- **Adjusted R²**: Penalizes extra x's
  - Example: Never above R²
- **VIF**: 1 / (1 − Rⱼ²); trouble above 10
  - Example: r = 0.95 gives 10.3
- **Dummies**: k categories → k − 1
  - Example: Corner lot = 1, else 0
- **Sequential SS**: Order changes the split, not the total
  - Example: 52.0 + 8.0 = 38.5 + 21.5 = 60.0

## Traps

- **1. Data and sampling**: A bigger sample fixes randomness, not bias.
  - 10,000 app users who answered a survey say nothing about the ones who ignore surveys. That is a convenience sample.
- **2. Where is the middle**: Duplicates count.
  - In 15, 7, 22, 7, 29, 11, 5, 0 the 7 appears twice, and both stay in the sorted list.
- **3. How spread out is it**: Same range, different spread.
  - 10, 50, 50, 50, 90 and 10, 10, 50, 90, 90 both span 80, but SDs of about 28 and 40. Range sees only the ends.
- **4. Probability rules**: Mutually exclusive events are not independent.
  - If A happens B cannot, so knowing A changes B completely.
- **5. Random variables**: The expected value is not the most likely outcome, and may be impossible (2.5 on a four-sided die).
  - It is the long-run average.
- **6. Two variables and portfolios**: Independent means Cov = 0, but Cov = 0 does not mean independent.
  - Y = X² is the classic catch.
- **7. Counting and the binomial**: At least one is 1 − P(none).
  - Adding P(1) + P(2) + … by hand is slow and invites mistakes.
- **8. Poisson**: Forgetting to rescale λ.
  - 3 calls an hour over 2 hours is λ = 6, not 3.
- **9. The normal curve**: Some z tables give the area from 0 to z, not from the far left.
  - For less than a positive z, add 0.5; Excel's NORM.S.DIST already starts from the left.
- **10. Sampling and the CLT**: Dividing σ by n instead of √n.
  - The standard error shrinks with the square root: four times the sample only halves the noise.
- **11. Confidence intervals**: A 95% CI is not a 95% chance that μ is inside.
  - μ is fixed; the interval moves. For sample size, width is 2E: width 0.06 means E = 0.03.
- **12. Hypothesis tests**: A p-value is not the chance H₀ is true.
  - It is the chance of data at least this extreme under H₀. For a proportion, the SE uses p₀, not p̂.
- **13. Simple regression**: Correlation is symmetric; regression is not.
  - Swap x and y and you get a different line. Never predict outside the x range you have.
- **14. Multiple regression**: Holding other variables fixed is about the math, not the world.
  - If size and rooms move together in reality, you can't hold one fixed.
