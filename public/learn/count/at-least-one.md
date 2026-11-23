# At least one: use the complement

> At least one is the opposite of none: P(at least one) = 1 − P(none). It's almost always faster than adding up 1, 2, 3 and so on.

Canonical URL: https://monte.markets/learn/count/at-least-one/

License: CC BY 4.0, reuse with credit to monte.markets.

Lesson 5 of 5 in [Counting and the binomial](https://monte.markets/learn/count.md).

**Question:** Each of 5 light bulbs fails this year with chance 0.1. What's the chance at least one fails?

- 0.5: Adding 0.1 five times counts overlaps more than once. With 11 bulbs it would pass 1.
- 0.1: That's for one bulb.
- **About 0.41** (right answer): Yes. P(none fail) = 0.9⁵ ≈ 0.59, so at least one is 1 − 0.59.

At least one is the opposite of none: P(at least one) = 1 − P(none). It's almost always faster than adding up 1, 2, 3 and so on.

**Question:** You play a game you win 20% of the time, 3 times. P(win at least once)?

- 0.008: That's winning all three: 0.2³.
- **0.488** (right answer): Yes. 1 − 0.8³ = 1 − 0.512.
- 0.6: That's 3 × 0.2, which double counts.

When you see "at least one", reach for 1 minus none.

Next: [Drill this topic, 8 questions](https://monte.markets/practice/drill/?topic=count&n=8)
