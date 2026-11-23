# Exactly k successes

> P(exactly k) = C(n, k) · p^k · (1 − p)^(n − k). The C(n, k) counts the orders; the rest is the chance of any one order.

Canonical URL: https://monte.markets/learn/count/binomial-probability/

License: CC BY 4.0, reuse with credit to monte.markets.

Lesson 4 of 5 in [Counting and the binomial](https://monte.markets/learn/count.md).

**Question:** Flip a fair coin 3 times. What's the chance of exactly 2 heads?

- 2/3: Count the outcomes: 8 equally likely, 3 of them have 2 heads.
- **3/8** (right answer): Yes. HHT, HTH, THH: three ways, each with chance 1/8.
- 1/8: That's one particular order. There are three orders with 2 heads.

P(exactly k) = C(n, k) · p^k · (1 − p)^(n − k). The C(n, k) counts the orders; the rest is the chance of any one order.

**Question:** A part fails 10% of the time. In 4 parts, what's P(exactly 1 fails)?

- 0.4: That's 4 × 0.1. The other three also have to not fail: × 0.9³.
- **About 0.29** (right answer): Yes. C(4, 1) × 0.1 × 0.9³ = 4 × 0.1 × 0.729 ≈ 0.29.
- 0.1: That's for one particular part, ignoring the other three.

Count the orders, then multiply by the chance of one order.

Next: [At least one: use the complement](https://monte.markets/learn/count/at-least-one.md)
