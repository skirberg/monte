# Poisson distribution calculator

> A rate per unit. Scale it to the window first.

Canonical URL: https://monte.markets/solve/poisson/

License: CC BY 4.0, reuse with credit to monte.markets.

Solver 5 of 11.

## Inputs, with the starting numbers

- Rate per unit: 4
- Unit name: hour
- Window, in units: 1
- Count k: 3

## Examples

- **Calls: 4 an hour, exactly 3**: Rate per unit: 4; Unit name: hour; Window, in units: 1; Count k: 3
- **Calls: 1 or fewer in 30 minutes**: Rate per unit: 4; Unit name: hour; Window, in units: 0.5; Count k: 1
- **Typos: 1.5 a page, 2 pages**: Rate per unit: 1.5; Unit name: page; Window, in units: 2; Count k: 2

## Answers for the starting numbers

| Count | P(exactly) | P(this many or fewer) |
| --- | --- | --- |
| 0 | 0.0183 | 0.0183 |
| 1 | 0.0733 | 0.0916 |
| 2 | 0.1465 | 0.2381 |
| 3 | 0.1954 | 0.4335 |
| 4 | 0.1954 | 0.6288 |
| 5 | 0.1563 | 0.7851 |
| 6 | 0.1042 | 0.8893 |
| 7 | 0.0595 | 0.9489 |
| 8 | 0.0298 | 0.9786 |
| 9 | 0.0132 | 0.9919 |
| 10 | 0.0053 | 0.9972 |

1. λ for this window = **4**
   - Work: 4 per hour × 1 hour. Scale the rate first; this is the step people miss.
2. P(exactly 3) = **0.1954**
   - Work: e^−4 × 4^3 / 3!
3. P(3 or fewer) = **0.4335**
   - Work: Add P(0) through P(3)
4. P(fewer than 3) = **0.2381**
   - Work: Add P(0) through P(2)
5. P(at least 3) = **0.7619**
   - Work: 1 − P(2 or fewer)
6. P(more than 3) = **0.5665**
   - Work: 1 − P(3 or fewer)
7. P(none) = **0.0183**
   - Work: e^−4
8. P(at least one) = **0.9817**
   - Work: 1 − e^−4
9. P(exactly 3 | at least one) = **0.199**
   - Work: P(3) / P(at least one) = 0.1954 / 0.9817. Given at least one, divide by that.
10. Mean and variance = **4**
    - Work: Both equal λ for a Poisson. SD = √λ = 2

## All solvers

- [Tree and Bayes](https://monte.markets/solve/tree.md)
- [Draws from a box](https://monte.markets/solve/draws.md)
- [Two events](https://monte.markets/solve/events.md)
- [Repeated trials](https://monte.markets/solve/trials.md)
- Poisson counts (this one)
- [Normal curve](https://monte.markets/solve/normal.md)
- [Sampling distribution, sample by sample](https://monte.markets/solve/samp.md)
- [Confidence intervals and sample size](https://monte.markets/solve/ci.md)
- [Hypothesis tests](https://monte.markets/solve/test.md)
- [Birthday problem](https://monte.markets/solve/bday.md)
- [Describe data](https://monte.markets/solve/data.md)
