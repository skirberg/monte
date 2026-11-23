# Probability rules

> Or: add, then subtract the overlap. And: multiply. Given: count only inside what you were told. Mutually exclusive: can't both happen. Independent: one says nothing about the other.

Canonical URL: https://monte.markets/learn/prob/

License: CC BY 4.0, reuse with credit to monte.markets.

Topic 4 of 14 in [Learn](https://monte.markets/learn/).

## 5 lessons · 3 min each

1. [A long-run share](https://monte.markets/learn/prob/what-probability-is.md)
2. [Either one: don't count the overlap twice](https://monte.markets/learn/prob/or.md)
3. [Both happen: multiply](https://monte.markets/learn/prob/and.md)
4. [Given: shrink the world](https://monte.markets/learn/prob/given.md)
5. [Independent or exclusive](https://monte.markets/learn/prob/independent.md)

## Check yourself

1. Two coins and a die: how many outcomes?
   - Answer: 24
   - Why: 2 × 2 × 6.
2. One die roll: P(not a 1 or 2)?
   - Answer: 4/6
   - Why: 1 − 2/6.
3. A = {1, 2, 3}, B = {3, 4} on one die roll. P(A or B)?
   - Answer: 4/6
   - Why: 3/6 + 2/6 − 1/6.
4. From a pack of 52 cards: P(heart or face card)?
   - Answer: 22/52
   - Why: 13 + 12 − 3. Don't count the heart face cards twice.
5. Die roll: P(5 or 6 given the roll is above 2)?
   - Answer: 1/2
   - Why: The list shrinks to 3, 4, 5, 6, and two of those count.
6. 60% of hotel guests use the gym, 30% the spa, 12% both. P(spa given gym)?
   - Answer: 12/60 = 20%
   - Why: The denominator is the given.
7. Are gym and spa independent?
   - Answer: No
   - Why: 30% overall vs 20% among gym users.
8. Two aces in a row, no replacement?
   - Answer: 4/52 × 3/51 = 0.45%
   - Why: One ace and one card are gone.
9. Flight on time 0.85, bag arrives given on time 0.95: both?
   - Answer: 0.8075
   - Why: Multiply along the branch.
10. Bag arrives given late: 0.70. Your bag arrived. Chance the flight was on time?
    - Answer: 0.8075 / 0.9125 = 0.885
    - Why: Add both bag-arrives branches (0.9125), then shrink.

## The idea in one page

**Or**: add, then subtract the overlap. **And**: multiply. **Given**: count only inside what you were told. **Mutually exclusive**: can't both happen. **Independent**: one says nothing about the other.

Probability is honest bookkeeping: list what can happen, then ask what share of it is the thing you care about.

- **Medicine**: A 99% accurate test for something rare is often wrong when it says yes.
- **Fraud**: If fraud is rare, most flagged transactions are honest.
- **Everyday**: Five separate 20% risks: the chance at least one happens is 67%, not 100%.

Tennis example: Break-point conversion is a conditional probability: P(win the point | break point). Count only the break points. Convert 20 of 50 and that is 40%.

## The trap

Mutually exclusive events are not independent. If A happens B cannot, so knowing A changes B completely.

## Formulas

- Basics: 0 ≤ P(A) ≤ 1, all outcomes add to 1, P(not A) = 1 − P(A)
- Or: P(A or B) = P(A) + P(B) − P(A and B)
- Given: P(A | B) = P(A and B) / P(B)
- And: P(A and B) = P(A) × P(B | A); if independent, P(A) × P(B)
- Tree: Multiply along a branch, add branches with the same ending
- Remember it: Or: two guest lists, count overlaps once. And: a combo lock, every dial must hit. Given: a filter, then count.

## Videos and further reading

- [StatQuest: Conditional Probabilities, Clearly Explained](https://www.youtube.com/watch?v=_IgyaD7vOOA): Conditional probability built from a simple table of counts. About 11 minutes.
- [3Blue1Brown: Bayes theorem, the geometry of changing beliefs](https://www.youtube.com/watch?v=HZGCoVF3YvM): Bayes' rule drawn as areas, with the classic base rate example. Pause at the example and answer it first. About 15 minutes.
- [Seeing Theory: Compound Probability](https://seeing-theory.brown.edu/compound-probability/index.html): Set theory, counting and conditional probability, all interactive. About 15 minutes.

## Next

- [Drill this topic](https://monte.markets/practice/drill/?topic=prob)
- Previous topic: [How spread out is it](https://monte.markets/learn/spread.md)
- Next topic: [Random variables](https://monte.markets/learn/rv.md)
