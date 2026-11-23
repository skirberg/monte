# Conditional probability calculator

> Give P(A), P(B) and P(A and B).

Canonical URL: https://monte.markets/solve/events/

License: CC BY 4.0, reuse with credit to monte.markets.

Solver 3 of 11.

## Inputs, with the starting numbers

- P(A): 0.6
- P(B): 0.5
- P(A and B): 0.3

## Examples

- **Die: 6 given over 3**: P(A): 1/6; P(B): 1/2; P(A and B): 1/6
- **Independent**: P(A): 0.6; P(B): 0.5; P(A and B): 0.3
- **Mutually exclusive**: P(A): 0.25; P(B): 0.45; P(A and B): 0

## Answers for the starting numbers

|   | B | not B | Total |
| --- | --- | --- | --- |
| A | 0.3 | 0.3 | 0.6 |
| not A | 0.2 | 0.2 | 0.4 |
| Total | 0.5 | 0.5 | 1 |

1. P(A or B) = **0.8**
   - Work: 0.6 + 0.5 − 0.3. Subtract the overlap once.
2. P(A | B) = **0.6**
   - Work: 0.3 ÷ 0.5. B is the new total.
3. P(B | A) = **0.5**
   - Work: 0.3 ÷ 0.6
4. P(not A) = **0.4**
   - Work: 1 − 0.6
5. P(neither) = **0.2**
   - Work: 1 − P(A or B)
6. P(A only) = **0.3**
   - Work: 0.6 − 0.3
7. P(exactly one) = **0.5**
   - Work: P(A or B) − P(A and B)
8. Independent? = **Yes**
   - Work: P(A) × P(B) = 0.3 equals P(A and B) = 0.3.
9. Mutually exclusive? = **No**
   - Work: They overlap, P(A and B) = 0.3.

## All solvers

- [Tree and Bayes](https://monte.markets/solve/tree.md)
- [Draws from a box](https://monte.markets/solve/draws.md)
- Two events (this one)
- [Repeated trials](https://monte.markets/solve/trials.md)
- [Poisson counts](https://monte.markets/solve/poisson.md)
- [Normal curve](https://monte.markets/solve/normal.md)
- [Sampling distribution, sample by sample](https://monte.markets/solve/samp.md)
- [Confidence intervals and sample size](https://monte.markets/solve/ci.md)
- [Hypothesis tests](https://monte.markets/solve/test.md)
- [Birthday problem](https://monte.markets/solve/bday.md)
- [Describe data](https://monte.markets/solve/data.md)
