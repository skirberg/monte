# Probability tree diagram calculator

> Branches, then an outcome. Leave branch 3 blank for two; a blank P(branch) fills in.

Canonical URL: https://monte.markets/solve/tree/

License: CC BY 4.0, reuse with credit to monte.markets.

Solver 1 of 11.

## Inputs, with the starting numbers

- Branch 1 name: Online
- P(branch 1): 0.6
- P(outcome | branch 1): 0.3
- Branch 2 name: In store
- P(branch 2): blank
- P(outcome | branch 2): 0.1
- Branch 3 name (optional): blank
- P(branch 3): blank
- P(outcome | branch 3): blank
- Outcome name: Return

## Examples

- **Online vs store returns**: Branch 1 name: Online; P(branch 1): 0.6; P(outcome | branch 1): 0.3; Branch 2 name: In store; P(outcome | branch 2): 0.1; Outcome name: Return
- **Interns and offers**: Branch 1 name: Intern; P(branch 1): 0.4; P(outcome | branch 1): 0.7; Branch 2 name: Non-intern; P(outcome | branch 2): 0.25; Outcome name: Offer
- **Three suppliers**: Branch 1 name: Supplier A; P(branch 1): 0.5; P(outcome | branch 1): 0.02; Branch 2 name: Supplier B; P(branch 2): 0.3; P(outcome | branch 2): 0.03; Branch 3 name (optional): Supplier C; P(outcome | branch 3): 0.05; Outcome name: Defect
- **Medical test**: Branch 1 name: Sick; P(branch 1): 0.01; P(outcome | branch 1): 0.95; Branch 2 name: Healthy; P(outcome | branch 2): 0.05; Outcome name: Positive

## Answers for the starting numbers

|   | Return | not Return | Total |
| --- | --- | --- | --- |
| Online | 0.18 | 0.42 | 0.6 |
| In store | 0.04 | 0.36 | 0.4 |
| Total | 0.22 | 0.78 | 1 |

1. P(Return) = **0.22**
   - Work: 0.6 × 0.3 + 0.4 × 0.1 = 0.18 + 0.04. Add every Return branch (In store = 1 minus the others).
2. P(not Return) = **0.78**
   - Work: 1 − 0.22
3. P(Return | Online) = **0.3**
   - Work: Given.
4. P(Return | In store) = **0.1**
   - Work: Given.
5. P(Online and Return) = **0.18**
   - Work: And means multiply along the branch: 0.6 × 0.3
6. P(Online | Return) = **0.8182**
   - Work: Bayes: 0.18 ÷ 0.22. The given (Return) is the new total.
7. P(In store | Return) = **0.1818**
   - Work: Bayes: 0.04 ÷ 0.22
8. P(Online | not Return) = **0.5385**
   - Work: 0.42 ÷ 0.78
9. P(In store | not Return) = **0.4615**
   - Work: 0.36 ÷ 0.78
10. P(Online or Return) = **0.64**
    - Work: 0.6 + 0.22 − 0.18. Or means add, minus the overlap.
11. Are Online and Return independent? = **No**
    - Work: P(Online and Return) = 0.18 is not P(Online) × P(Return) = 0.132.
12. Trap: is P(Online | Return) the same as P(Return | Online)? = **No: 0.8182 vs 0.3**
    - Work: Flipping the given changes the denominator.
13. Most likely single outcome = **Online and not Return**
    - Work: 0.42, the biggest branch.
14. Two independent times: Return both = **0.0484**
    - Work: 0.22²
15. Two independent times: at least one Return = **0.3916**
    - Work: 1 − 0.78²

## All solvers

- Tree and Bayes (this one)
- [Draws from a box](https://monte.markets/solve/draws.md)
- [Two events](https://monte.markets/solve/events.md)
- [Repeated trials](https://monte.markets/solve/trials.md)
- [Poisson counts](https://monte.markets/solve/poisson.md)
- [Normal curve](https://monte.markets/solve/normal.md)
- [Sampling distribution, sample by sample](https://monte.markets/solve/samp.md)
- [Confidence intervals and sample size](https://monte.markets/solve/ci.md)
- [Hypothesis tests](https://monte.markets/solve/test.md)
- [Birthday problem](https://monte.markets/solve/bday.md)
- [Describe data](https://monte.markets/solve/data.md)
