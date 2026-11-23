# Choosing a group

> When order doesn't matter, use combinations: C(n, k) = n! ÷ (k!(n − k)!), the number of ways to choose k things from n. People say "n choose k".

Canonical URL: https://monte.markets/learn/count/choose/

License: CC BY 4.0, reuse with credit to monte.markets.

Lesson 2 of 5 in [Counting and the binomial](https://monte.markets/learn/count.md).

**Question:** You pick 2 of 4 friends to come to a concert. How many different pairs?

- **6** (right answer): Yes. 4 × 3 = 12 ordered picks, but each pair is counted twice, so 12 ÷ 2 = 6.
- 12: That counts Ann-then-Ben and Ben-then-Ann as different. A pair is the same pair.
- 8: List them: AB, AC, AD, BC, BD, CD. Six.

When order doesn't matter, use combinations: C(n, k) = n! ÷ (k!(n − k)!), the number of ways to choose k things from n. People say "n choose k".

**Question:** How many 3-person committees from 5 people?

- **10** (right answer): Yes. C(5, 3) = 5! ÷ (3! · 2!) = 10.
- 60: That's 5 × 4 × 3, which counts orders. A committee has no order.
- 15: That's 5 × 3. Use C(5, 3).

Order matters: multiply down. Order doesn't: divide out the orderings, which is what C(n, k) does.

Next: [When the binomial fits](https://monte.markets/learn/count/binomial-setup.md)
