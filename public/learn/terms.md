# Statistics terms

> A statistics glossary: every key word in plain English, with a quick example.

Canonical URL: https://monte.markets/learn/terms/

License: CC BY 4.0, reuse with credit to monte.markets.

[Study them as flashcards](https://monte.markets/practice/cards/)

## 1. Data and sampling

- **Population**: Every unit you care about.
  - Example: Every customer of a bank, surveyed or not.
- **Sample**: The slice of the population you actually measure.
  - Example: 500 customers picked at random.
- **Parameter**: A number that describes the population. Usually unknown.
  - Example: The true average balance μ of all customers.
- **Statistic**: A number computed from a sample. It changes from sample to sample.
  - Example: x̄, the average balance of your 500.
- **Simple random sample**: Every possible sample of size n has the same chance of being picked.
  - Example: 50 names drawn from a hat holding every name.
- **Stratified sample**: Split the population into groups, then sample at random inside each.
  - Example: 20 customers from each region, so every region shows up.
- **Qualitative variable**: Labels or categories, even if they come in an order.
  - Example: Shirt size S, M, L.
- **Quantitative variable**: Numbers you can do arithmetic on.
  - Example: Monthly sales in dollars.
- **Discrete vs continuous**: Discrete values are counted; continuous ones are measured and can fall anywhere.
  - Example: Number of children vs height.
- **Levels of measurement**: Nominal (names), ordinal (order), interval (equal steps, no true zero), ratio (true zero).
  - Example: Temperature in °C is interval; income is ratio.

Read the topic: [Data and sampling](https://monte.markets/learn/data.md)

## 2. Where is the middle

- **Mean**: The balance point: add everything up and divide by how many.
  - Example: 2, 4, 9: mean 5.
- **Median**: The middle value once sorted. Outliers barely move it.
  - Example: 2, 4, 90: median 4, mean 32.
- **Mode**: The most common value.
  - Example: Shoe sizes 8, 9, 9, 10: mode 9.
- **Skew**: A long tail on one side. The mean gets pulled toward the tail.
  - Example: Incomes skew right, so mean > median.
- **Outlier**: A value far from the rest.
  - Example: One $5M house on a street of $400k homes.

Read the topic: [Where is the middle](https://monte.markets/learn/center.md)

## 3. How spread out is it

- **Range**: Largest minus smallest.
  - Example: 3 to 11: range 8.
- **Variance**: The average squared distance from the mean (divide by n − 1 for a sample).
  - Example: Units are squared, so we take the root.
- **Standard deviation**: The typical distance from the mean, in the data's own units.
  - Example: Returns average 8% with SD 6%.
- **Coefficient of variation**: SD divided by the mean: risk per unit of reward.
  - Example: SD 6 on mean 8 is CV 75%.
- **z score**: How many SDs a value sits from the mean.
  - Example: z = 2 means two SDs above average.
- **Empirical rule**: For bell-shaped data, about 68%, 95% and 99.7% fall within 1, 2 and 3 SDs.
  - Example: Mean 100, SD 15: 95% between 70 and 130.
- **Interquartile range**: Q3 minus Q1, the spread of the middle half.
  - Example: Ignores the extremes on both ends.

Read the topic: [How spread out is it](https://monte.markets/learn/spread.md)

## 4. Probability rules

- **Sample space**: Every possible outcome.
  - Example: A die: 1, 2, 3, 4, 5, 6.
- **Event**: A set of outcomes you care about.
  - Example: Rolling an even number.
- **Complement**: Everything that is not the event. P(not A) = 1 − P(A).
  - Example: P(at least one) = 1 − P(none).
- **Mutually exclusive**: Two events that cannot happen together.
  - Example: Rolling a 2 and a 5 on one roll.
- **Independent**: Knowing one happened does not change the chance of the other.
  - Example: Two separate coin flips.
- **Conditional probability**: The chance of A once you know B happened: P(A and B) / P(B).
  - Example: P(bag arrives | flight on time).
- **Bayes' rule**: Flip a conditional around: from P(B | A) to P(A | B).
  - Example: From test accuracy to the chance you really have it.

Read the topic: [Probability rules](https://monte.markets/learn/prob.md)

## 5. Random variables and expected value

- **Random variable**: A number whose value depends on chance.
  - Example: Profit next month.
- **Expected value**: The probability-weighted average: the long-run average over many repeats.
  - Example: A die averages 3.5, though you never roll 3.5.
- **Probability distribution**: A list or curve of every value and its probability.
  - Example: Visits 0, 1, 2 with chances 0.5, 0.3, 0.2.

Read the topic: [Random variables and expected value](https://monte.markets/learn/rv.md)

## 6. Two variables: covariance, correlation, portfolios

- **Covariance**: Whether two variables move together, in their combined units.
  - Example: Positive when both rise together.
- **Correlation**: Covariance rescaled to sit between −1 and 1.
  - Example: r = 0.8: a strong upward pattern.
- **Diversification**: Mixing assets that don't move together lowers total risk.
  - Example: Low correlation means a lower portfolio SD.

Read the topic: [Two variables: covariance, correlation, portfolios](https://monte.markets/learn/two.md)

## 7. Counting and the binomial

- **Factorial**: n! = n × (n − 1) × … × 1: ways to order n things.
  - Example: 4! = 24.
- **Combination**: Ways to choose k from n when order does not matter.
  - Example: C(5, 2) = 10 pairs.
- **Permutation**: Ways to choose k from n when order matters.
  - Example: P(5, 2) = 20 ordered pairs.
- **Binomial distribution**: Count of successes in n independent tries with the same chance p.
  - Example: Heads in 10 flips.
- **Hypergeometric distribution**: Successes when you draw without replacement from a small group.
  - Example: Defective parts in 4 picked from a box of 10.

Read the topic: [Counting and the binomial](https://monte.markets/learn/count.md)

## 8. Poisson: counts per unit

- **Poisson distribution**: Events in a fixed window when they arrive at a steady rate λ.
  - Example: Calls per hour at a help desk.
- **Rate λ**: The average count per window. Mean and variance both equal λ.
  - Example: 3 per hour is λ = 6 over 2 hours.

Read the topic: [Poisson: counts per unit](https://monte.markets/learn/poisson.md)

## 9. The normal curve and z

- **Normal distribution**: The bell curve, set by its mean and SD.
  - Example: Heights, measurement errors, many averages.
- **Standard normal**: The normal with mean 0 and SD 1. Every z table uses it.
  - Example: Z ~ N(0, 1).
- **Percentile**: The value with a given share of the data below it.
  - Example: The 90th percentile has 90% below it.
- **Uniform distribution**: Every value in a range is equally likely.
  - Example: A wait between 0 and 20 minutes.

Read the topic: [The normal curve and z](https://monte.markets/learn/normal.md)

## 10. Sampling distributions and the CLT

- **Sampling distribution**: The distribution of a statistic over every possible sample.
  - Example: All the x̄'s you could get with n = 36.
- **Standard error**: The SD of a statistic: how much it wobbles from sample to sample.
  - Example: σ / √n for a sample mean.
- **Central Limit Theorem**: Averages of large samples are close to normal, whatever the population looks like.
  - Example: Skewed incomes, but averages of 50 form a bell.
- **Unbiased estimator**: A statistic whose average over all samples equals the parameter.
  - Example: x̄ for μ, and s² with n − 1 for σ².
- **Efficient estimator**: The unbiased estimator with the smallest spread.
  - Example: For normal data, x̄ beats the median for estimating μ.

Read the topic: [Sampling distributions and the CLT](https://monte.markets/learn/clt.md)

## 11. Confidence intervals and sample size

- **Point estimate**: A single best guess for a parameter.
  - Example: x̄ = 42.5.
- **Confidence interval**: Estimate plus or minus a margin. Built this way, 95% catch the truth.
  - Example: 42.5 ± 2.6.
- **Margin of error**: The plus-or-minus part of an interval.
  - Example: ± 3 points in a poll.
- **Confidence level**: How often the method catches the truth in the long run.
  - Example: 95%: about 95 of 100 intervals.
- **t distribution**: Like the normal, with fatter tails. Used when σ is unknown and you use s.
  - Example: t with 15 df for n = 16.
- **Degrees of freedom**: How many values are free to vary. For one sample, n − 1.
  - Example: n = 20 gives 19 df.

Read the topic: [Confidence intervals and sample size](https://monte.markets/learn/ci.md)

## 12. Hypothesis tests

- **Null hypothesis H₀**: The boring claim of no effect or no change. It holds the equals sign.
  - Example: μ = 250 ml.
- **Alternative hypothesis H₁**: What you want evidence for.
  - Example: μ ≠ 250, or μ < 250.
- **Test statistic**: How many standard errors the sample landed from H₀.
  - Example: z = −2.5.
- **p-value**: The chance of data at least this extreme if H₀ were true.
  - Example: p = 0.012: rare under H₀.
- **Significance level α**: The cutoff for rejecting H₀, and the chance of a false alarm.
  - Example: α = 0.05.
- **Type I error**: Rejecting a true H₀: a false alarm.
  - Example: Calling a fair machine broken.
- **Type II error**: Keeping a false H₀: a missed signal.
  - Example: Missing that the machine pours short.
- **Power**: The chance of catching a real effect: 1 − β.
  - Example: Bigger samples have more power.
- **One-sided vs two-sided**: One-sided looks in one direction; two-sided looks for any difference.
  - Example: H₁: μ < 500 vs H₁: μ ≠ 500.

Read the topic: [Hypothesis tests](https://monte.markets/learn/test.md)

## 13. Simple regression

- **Regression line**: The straight line that best predicts y from x by least squares.
  - Example: ŷ = 2 + 0.5x.
- **Slope**: How much predicted y changes when x rises by 1.
  - Example: 0.5 more sales per ad dollar.
- **Intercept**: Predicted y when x is 0. Sometimes meaningless.
  - Example: Sales with zero advertising.
- **Residual**: Actual minus predicted: what the line missed.
  - Example: Actual 10, predicted 8: residual 2.
- **Least squares**: Pick the line with the smallest sum of squared residuals.
  - Example: SSE is minimized.
- **R²**: The share of the variation in y that the model explains.
  - Example: R² = 0.81: 81% explained.
- **Extrapolation**: Predicting outside the range of x you observed. Risky.
  - Example: Ad spend of 50 when the data stop at 12.

Read the topic: [Simple regression](https://monte.markets/learn/reg.md)

## 14. Multiple regression

- **Multiple regression**: Predicting y from several x's at once.
  - Example: Price from size, age and location.
- **Adjusted R²**: R² with a penalty for adding predictors that do not help.
  - Example: Falls when you add a useless variable.
- **Dummy variable**: A 0/1 column for a category. Use k − 1 of them for k categories.
  - Example: North = 1, else 0.
- **Multicollinearity**: Predictors that move together, which makes slopes unstable.
  - Example: VIF above 5 or 10 is a warning.
- **F test**: Tests whether the model as a whole explains anything.
  - Example: F = MSR / MSE.

Read the topic: [Multiple regression](https://monte.markets/learn/mreg.md)
