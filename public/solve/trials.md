# Binomial probability calculator

> Same chance each try: none, at least one, exactly k.

Canonical URL: https://monte.markets/solve/trials/

License: CC BY 4.0, reuse with credit to monte.markets.

Solver 4 of 11.

## Inputs, with the starting numbers

- P(success) each time: 0.7
- Number of trials n: 5
- Exactly k: 4

## Examples

- **Free throws: 70%, 5 shots**: P(success) each time: 0.7; Number of trials n: 5; Exactly k: 4
- **Coin: 3 flips**: P(success) each time: 0.5; Number of trials n: 3; Exactly k: 2
- **Die: a six in 4 rolls**: P(success) each time: 1/6; Number of trials n: 4; Exactly k: 1

## Answers for the starting numbers

| Successes | Probability |
| --- | --- |
| 0 | 0.0024 |
| 1 | 0.0284 |
| 2 | 0.1323 |
| 3 | 0.3087 |
| 4 | 0.3601 |
| 5 | 0.1681 |

1. P(none) = **0.0024**
   - Work: 0.3^5. And means multiply.
2. P(at least one) = **0.9976**
   - Work: 1 − 0.3^5. Always use the complement.
3. P(all 5) = **0.1681**
   - Work: 0.7^5
4. P(exactly 4) = **0.3601**
   - Work: 5 × 0.7^4 × 0.3^1. The first number counts the orders.
5. P(at most 4) = **0.8319**
   - Work: Add exactly 0 through 4
6. P(at least 4) = **0.5282**
   - Work: 1 − P(at most 3)
7. P(exactly 4 | at least one) = **0.361**
   - Work: 0.3601 ÷ 0.9976. Given at least one, so that is the new total.
8. Expected number np = **3.5**
   - Work: 5 × 0.7
9. SD √(npq) = **1.0247**
   - Work: √(5 × 0.7 × 0.3)

## All solvers

- [Tree and Bayes](https://monte.markets/solve/tree.md)
- [Draws from a box](https://monte.markets/solve/draws.md)
- [Two events](https://monte.markets/solve/events.md)
- Repeated trials (this one)
- [Poisson counts](https://monte.markets/solve/poisson.md)
- [Normal curve](https://monte.markets/solve/normal.md)
- [Sampling distribution, sample by sample](https://monte.markets/solve/samp.md)
- [Confidence intervals and sample size](https://monte.markets/solve/ci.md)
- [Hypothesis tests](https://monte.markets/solve/test.md)
- [Birthday problem](https://monte.markets/solve/bday.md)
- [Describe data](https://monte.markets/solve/data.md)
