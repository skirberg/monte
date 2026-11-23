# Sampling distribution calculator

> Every sample of size n from a small population.

Canonical URL: https://monte.markets/solve/samp/

License: CC BY 4.0, reuse with credit to monte.markets.

Solver 7 of 11.

## Inputs, with the starting numbers

- Population values, separated by commas: 1, 2, 3, 6
- Sample size n: 2
- Drawing: With replacement
  - Choices: With replacement; Without replacement
- Cutoff c, for P(x̄ ≤ c): 2

## Examples

- **Four values, n = 2**: Population values, separated by commas: 1, 2, 3, 6; Sample size n: 2; Drawing: With replacement; Cutoff c, for P(x̄ ≤ c): 2
- **Five prices, 3 different ones**: Population values, separated by commas: 4, 5, 7, 9, 10; Sample size n: 3; Drawing: Without replacement; Cutoff c, for P(x̄ ≤ c): 6
- **Two dice, average roll**: Population values, separated by commas: 1, 2, 3, 4, 5, 6; Sample size n: 2; Drawing: With replacement; Cutoff c, for P(x̄ ≤ c): 2.5

## Answers for the starting numbers

| x̄ | Samples | P(x̄) | P(x̄ or less) |
| --- | --- | --- | --- |
| 1 | 1 | 0.0625 | 0.0625 |
| 1.5 | 2 | 0.125 | 0.1875 |
| 2 | 3 | 0.1875 | 0.375 |
| 2.5 | 2 | 0.125 | 0.5 |
| 3 | 1 | 0.0625 | 0.5625 |
| 3.5 | 2 | 0.125 | 0.6875 |
| 4 | 2 | 0.125 | 0.8125 |
| 4.5 | 2 | 0.125 | 0.9375 |
| 6 | 1 | 0.0625 | 1 |

1. Population mean μ = **3**
   - Work: Σx / N = 12 / 4
2. Population SD σ = **1.8708**
   - Work: Divide by N = 4 because this is the whole population. σ² = 3.5.
3. Possible samples = **16**
   - Work: N^n = 4^2. Order counts and repeats are allowed, so every one is equally likely.
4. Average of all the sample means = **3**
   - Work: It equals μ: x̄ is an unbiased estimator.
5. Standard error of x̄ = **1.3229**
   - Work: σ / √n = 1.8708 / √2. Same as the SD of the list of means.
6. P(x̄ ≤ 2), exact = **0.375**
   - Work: 6 of the 16 samples have a mean of 2 or less.
7. Normal approximation = **0.2248**
   - Work: z = (2 − 3) / 1.3229 = -0.7559. Rough at a small n; the exact count above is the answer.

## All solvers

- [Tree and Bayes](https://monte.markets/solve/tree.md)
- [Draws from a box](https://monte.markets/solve/draws.md)
- [Two events](https://monte.markets/solve/events.md)
- [Repeated trials](https://monte.markets/solve/trials.md)
- [Poisson counts](https://monte.markets/solve/poisson.md)
- [Normal curve](https://monte.markets/solve/normal.md)
- Sampling distribution, sample by sample (this one)
- [Confidence intervals and sample size](https://monte.markets/solve/ci.md)
- [Hypothesis tests](https://monte.markets/solve/test.md)
- [Birthday problem](https://monte.markets/solve/bday.md)
- [Describe data](https://monte.markets/solve/data.md)
