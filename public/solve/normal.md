# Normal distribution calculator

> Mean and SD, then any value or cutoff.

Canonical URL: https://monte.markets/solve/normal/

License: CC BY 4.0, reuse with credit to monte.markets.

Solver 6 of 11.

## Inputs, with the starting numbers

- Mean μ: 500
- SD σ: 40
- Value x: 540
- Second value (for between): blank
- Top or bottom %: 5
- How many in a row (all below x): 3
- Sample size n (for the average): 16

## Examples

- **Battery: over 540 hours**: Mean μ: 500; SD σ: 40; Value x: 540; Top or bottom %: 5; How many in a row (all below x): 1; Sample size n (for the average): 1
- **Between 450 and 560**: Mean μ: 500; SD σ: 40; Value x: 450; Second value (for between): 560; Top or bottom %: 5; How many in a row (all below x): 1; Sample size n (for the average): 1
- **Three all under 480**: Mean μ: 500; SD σ: 40; Value x: 480; Top or bottom %: 5; How many in a row (all below x): 3; Sample size n (for the average): 1
- **Average of 16 under 510**: Mean μ: 500; SD σ: 40; Value x: 510; Top or bottom %: 5; How many in a row (all below x): 1; Sample size n (for the average): 16

## Answers for the starting numbers

1. z for x = 540 = **1**
   - Work: (x − μ) / σ = (540 − 500) / 40. How many SDs from the mean.
2. P(X < 540) = **0.8413**
   - Work: Φ(1)
3. P(X > 540) = **0.1587**
   - Work: 1 − Φ(1)
4. Top 5% starts at = **565.7941**
   - Work: μ + zσ with z = 1.645: 500 + 1.645 × 40. Area first, then z, then x.
5. Bottom 5% ends at = **434.2059**
   - Work: 500 − 1.645 × 40
6. All 3 below 540 = **0.5956**
   - Work: 0.8413^3. Independent, so multiply.
7. All 3 above 540 = **0.004**
   - Work: 0.1587^3
8. At least one of 3 above 540 = **0.4044**
   - Work: 1 − 0.8413^3
9. Standard error of the average = **10**
   - Work: σ / √n = 40 / √16. Averages wobble less than single values.
10. z for an average of 540 = **4**
    - Work: (540 − 500) / 10
11. P(average of 16 < 540) = **> 0.9999**
    - Work: Φ(4)
12. P(average of 16 > 540) = **< 0.0001**
    - Work: 1 − Φ(4)
13. Empirical rule check = **68% within 460 to 540; 95% within 420 to 580; 99.7% within 380 to 620**
    - Work: μ ± 1, 2 and 3 SD.

## All solvers

- [Tree and Bayes](https://monte.markets/solve/tree.md)
- [Draws from a box](https://monte.markets/solve/draws.md)
- [Two events](https://monte.markets/solve/events.md)
- [Repeated trials](https://monte.markets/solve/trials.md)
- [Poisson counts](https://monte.markets/solve/poisson.md)
- Normal curve (this one)
- [Sampling distribution, sample by sample](https://monte.markets/solve/samp.md)
- [Confidence intervals and sample size](https://monte.markets/solve/ci.md)
- [Hypothesis tests](https://monte.markets/solve/test.md)
- [Birthday problem](https://monte.markets/solve/bday.md)
- [Describe data](https://monte.markets/solve/data.md)
