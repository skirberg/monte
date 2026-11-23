# Birthday problem calculator

> Chance two people in a room share a birthday.

Canonical URL: https://monte.markets/solve/bday/

License: CC BY 4.0, reuse with credit to monte.markets.

Solver 10 of 11.

## Inputs, with the starting numbers

- People in the room: 40
- Days in a year: 365

## Examples

- **A room of 40**: People in the room: 40; Days in a year: 365
- **22 people**: People in the room: 22; Days in a year: 365
- **23 people**: People in the room: 23; Days in a year: 365

## Answers for the starting numbers

| People | P(shared birthday) |
| --- | --- |
| 2 | 0.0027 |
| 10 | 0.1169 |
| 20 | 0.4114 |
| 22 | 0.4757 |
| 23 | 0.5073 |
| 30 | 0.7063 |
| 40 (yours) | 0.8912 |
| 50 | 0.9704 |
| 57 | 0.9901 |

1. P(at least two share a birthday), n = 40 = **0.8912**
   - Work: 1 − P(all different). Complement, the same move as at least one.
2. P(all different birthdays) = **0.1088**
   - Work: 365/365 × 364/365 × 363/365 × ... × 326/365 (40 fractions)
3. P(someone shares YOUR birthday) = **0.1015**
   - Work: 1 − (364/365)^39. Different question: only pairs that include you count.
4. Number of pairs = **780**
   - Work: 40 × 39 / 2. Why it climbs so fast: every pair is a chance to match.
5. Expected matching pairs = **2.137**
   - Work: 780 / 365
6. People needed for a 50% chance = **23**
   - Work: The famous answer: 23 people
7. People needed for a 99% chance = **57**

## All solvers

- [Tree and Bayes](https://monte.markets/solve/tree.md)
- [Draws from a box](https://monte.markets/solve/draws.md)
- [Two events](https://monte.markets/solve/events.md)
- [Repeated trials](https://monte.markets/solve/trials.md)
- [Poisson counts](https://monte.markets/solve/poisson.md)
- [Normal curve](https://monte.markets/solve/normal.md)
- [Sampling distribution, sample by sample](https://monte.markets/solve/samp.md)
- [Confidence intervals and sample size](https://monte.markets/solve/ci.md)
- [Hypothesis tests](https://monte.markets/solve/test.md)
- Birthday problem (this one)
- [Describe data](https://monte.markets/solve/data.md)
