# Draws with and without replacement

> Two draws, with or without putting the first back.

Canonical URL: https://monte.markets/solve/draws/

License: CC BY 4.0, reuse with credit to monte.markets.

Solver 2 of 11.

## Inputs, with the starting numbers

- Count of kind 1: 4
- Count of kind 2: 8
- Kind 1 name: Green
- Kind 2 name: White
- Replacement: Without (default)
  - Choices: Without (default); With

## Examples

- **4 green, 8 white**: Count of kind 1: 4; Count of kind 2: 8; Kind 1 name: Green; Kind 2 name: White; Replacement: Without (default)
- **Parts: 3 bad of 20**: Count of kind 1: 3; Count of kind 2: 17; Kind 1 name: Defective; Kind 2 name: Good; Replacement: Without (default)
- **Aces in a deck**: Count of kind 1: 4; Count of kind 2: 48; Kind 1 name: Ace; Kind 2 name: Other; Replacement: Without (default)

## Answers for the starting numbers

| First, then second | Work | Probability |
| --- | --- | --- |
| Green, Green | 4/12 × 3/11 | 0.0909 |
| Green, White | 4/12 × 8/11 | 0.2424 |
| White, Green | 8/12 × 4/11 | 0.2424 |
| White, White | 8/12 × 7/11 | 0.4242 |
| Total |   | 1 |

1. P(Green first) = **1/3 = 0.3333**
   - Work: 4 of 12
2. P(Green then Green) = **1/11 = 0.0909**
   - Work: 4/12 × 3/11. One Green is gone, so both counts drop by 1.
3. P(Green then White) = **8/33 = 0.2424**
   - Work: 4/12 × 8/11
4. P(White then Green) = **8/33 = 0.2424**
   - Work: 8/12 × 4/11
5. P(White then White) = **14/33 = 0.4242**
   - Work: 8/12 × 7/11
6. One of each, either order = **16/33 = 0.4848**
   - Work: Both orders: 8/33 + 8/33.
7. At least one Green = **19/33 = 0.5758**
   - Work: 1 − P(White, White)
8. At least one White = **10/11 = 0.9091**
   - Work: 1 − P(Green, Green)
9. P(White second | Green first) = **8/11 = 0.7273**
   - Work: Given, so shrink the box: 8 White left of 11.
10. P(Green second | Green first) = **3/11 = 0.2727**
    - Work: 3 left of 11
11. P(Green on second), first unknown = **1/3 = 0.3333**
    - Work: Same as the first draw. Trap question.
12. P(Green first | Green second) = **0.2727**
    - Work: Bayes: P(Green,Green) ÷ P(Green second) = 0.0909 ÷ 0.3333
13. Are the draws independent? = **No**
    - Work: P(Green second | Green first) = 0.2727, not 0.3333. Without replacement, the first draw changes the box.

## All solvers

- [Tree and Bayes](https://monte.markets/solve/tree.md)
- Draws from a box (this one)
- [Two events](https://monte.markets/solve/events.md)
- [Repeated trials](https://monte.markets/solve/trials.md)
- [Poisson counts](https://monte.markets/solve/poisson.md)
- [Normal curve](https://monte.markets/solve/normal.md)
- [Sampling distribution, sample by sample](https://monte.markets/solve/samp.md)
- [Confidence intervals and sample size](https://monte.markets/solve/ci.md)
- [Hypothesis tests](https://monte.markets/solve/test.md)
- [Birthday problem](https://monte.markets/solve/bday.md)
- [Describe data](https://monte.markets/solve/data.md)
