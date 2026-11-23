# Confidence interval and sample size calculator

> A mean or a proportion, then the sample size.

Canonical URL: https://monte.markets/solve/ci/

License: CC BY 4.0, reuse with credit to monte.markets.

Solver 8 of 11.

## Inputs, with the starting numbers

- Type: Mean, s from the sample (t)
  - Choices: Mean, s from the sample (t); Mean, σ known (z); Proportion
- Confidence: 95%
  - Choices: 90%; 95%; 99%
- Sample size n: 25
- Mean x̄: 42.5
  - Shown when Type is Mean, s from the sample (t) or Mean, σ known (z)
- SD s or σ: 6.2
  - Shown when Type is Mean, s from the sample (t) or Mean, σ known (z)
- Count with the trait: blank
  - Shown when Type is Proportion
- Target E (for sample size): 2
- E is: The margin (±)
  - Choices: The margin (±); The full length

## Examples

- **Delivery times: 95%, n 25**: Type: Mean, s from the sample (t); Confidence: 95%; Sample size n: 25; Mean x̄: 42.5; SD s or σ: 6.2; Target E (for sample size): 2; E is: The margin (±)
- **Survey: 240 of 400 say yes**: Type: Proportion; Confidence: 95%; Sample size n: 400; Count with the trait: 240; Target E (for sample size): 0.06; E is: The full length

## Answers for the starting numbers

1. Critical value = **t = 2.064**
   - Work: t with n − 1 = 24 df, 95% two-sided. σ unknown, so t.
2. Standard error = **1.24**
   - Work: s / √n = 6.2 / √25
3. 95% interval for μ = **39.9406 to 45.0594**
   - Work: x̄ ± 2.064 × 1.24 = 42.5 ± 2.5594
4. Margin of error = **2.5594**
   - Work: 2.064 × 1.24
5. Sample size for ± 2 (z) = **37**
   - Work: (zσ/E)² = (1.96 × 6.2 / 2)² = 36.9178. Round up. The usual textbook answer.
6. Same, if you keep t = 2.064 = **41**
   - Work: (2.064 × 6.2 / 2)² = 40.9395. Check which one your book or teacher uses.

## All solvers

- [Tree and Bayes](https://monte.markets/solve/tree.md)
- [Draws from a box](https://monte.markets/solve/draws.md)
- [Two events](https://monte.markets/solve/events.md)
- [Repeated trials](https://monte.markets/solve/trials.md)
- [Poisson counts](https://monte.markets/solve/poisson.md)
- [Normal curve](https://monte.markets/solve/normal.md)
- [Sampling distribution, sample by sample](https://monte.markets/solve/samp.md)
- Confidence intervals and sample size (this one)
- [Hypothesis tests](https://monte.markets/solve/test.md)
- [Birthday problem](https://monte.markets/solve/bday.md)
- [Describe data](https://monte.markets/solve/data.md)
