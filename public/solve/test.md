# Hypothesis test calculator

> z, t or proportion. The p-value and the decision.

Canonical URL: https://monte.markets/solve/test/

License: CC BY 4.0, reuse with credit to monte.markets.

Solver 9 of 11.

## Inputs, with the starting numbers

- Test: Mean, σ known (z)
  - Choices: Mean, σ known (z); Mean, s from the sample (t); Proportion (z)
- H₁: Not equal (two-sided)
  - Choices: Not equal (two-sided); Less than (left tail); Greater than (right tail)
- H₀ value, μ₀ or p₀: 250
- Sample size n: 36
- Sample mean x̄: 247.5
  - Shown when Test is Mean, σ known (z) or Mean, s from the sample (t)
- σ or s: 6
  - Shown when Test is Mean, σ known (z) or Mean, s from the sample (t)
- Count with the trait: blank
  - Shown when Test is Proportion (z)
- α: 0.05
  - Choices: 0.10; 0.05; 0.01

## Examples

- **Machine: 247.5 against 250**: Test: Mean, σ known (z); H₁: Not equal (two-sided); H₀ value, μ₀ or p₀: 250; Sample size n: 36; Sample mean x̄: 247.5; σ or s: 6; α: 0.05
- **Bags under 500 g? (t)**: Test: Mean, s from the sample (t); H₁: Less than (left tail); H₀ value, μ₀ or p₀: 500; Sample size n: 16; Sample mean x̄: 492; σ or s: 12; α: 0.05
- **230 of 400 prefer A**: Test: Proportion (z); H₁: Not equal (two-sided); H₀ value, μ₀ or p₀: 0.5; Sample size n: 400; Count with the trait: 230; α: 0.05

## Answers for the starting numbers

1. Hypotheses = **H₀: μ = 250 H₁: μ ≠ 250**
   - Work: H₀ holds the equals sign. H₁ is the claim you want evidence for.
2. Standard error = **1**
   - Work: σ / √n = 6 / √36
3. Test statistic z = **-2.5**
   - Work: (x̄ − 250) / 1
4. Critical value = **z = ±1.960**
   - Work: Two-sided: α/2 = 0.025 in each tail. Reject if the statistic is past it.
5. p-value = **0.0124**
   - Work: 2 × P(z > |-2.5|)
6. Decision = **Reject H₀**
   - Work: p-value 0.0124 < α = 0.05
7. In words = **The data are strong evidence that μ ≠ 250.**
   - Work: Say it about the population, at α = 0.05.
8. 95% interval for μ = **245.54 to 249.46**
   - Work: Leaves out 250, which matches the decision. A two-sided test and its interval always agree.

## All solvers

- [Tree and Bayes](https://monte.markets/solve/tree.md)
- [Draws from a box](https://monte.markets/solve/draws.md)
- [Two events](https://monte.markets/solve/events.md)
- [Repeated trials](https://monte.markets/solve/trials.md)
- [Poisson counts](https://monte.markets/solve/poisson.md)
- [Normal curve](https://monte.markets/solve/normal.md)
- [Sampling distribution, sample by sample](https://monte.markets/solve/samp.md)
- [Confidence intervals and sample size](https://monte.markets/solve/ci.md)
- Hypothesis tests (this one)
- [Birthday problem](https://monte.markets/solve/bday.md)
- [Describe data](https://monte.markets/solve/data.md)
