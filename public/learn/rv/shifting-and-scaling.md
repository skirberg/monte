# Adding and multiplying

> Adding a constant c shifts the mean by c and leaves the SD alone.

Canonical URL: https://monte.markets/learn/rv/shifting-and-scaling/

License: CC BY 4.0, reuse with credit to monte.markets.

Lesson 5 of 5 in [Random variables and expected value](https://monte.markets/learn/rv.md).

**Question:** Every employee gets a $1,000 raise. What happens to the SD of salaries?

- It goes up by $1,000: The mean goes up $1,000. The spread doesn't change.
- It doubles: Adding a constant never stretches the spread.
- **Nothing** (right answer): Yes. Everyone moves up the same amount, so the gaps between them stay the same.

Adding a constant c shifts the mean by c and leaves the SD alone. Multiplying by b scales the mean by b and the SD by |b|: E(a + bX) = a + b·E(X), SD(a + bX) = |b|·SD(X).

**Question:** Each service visit costs $50. Visits per customer average 2 with SD 1. What's the SD of cost per customer?

- **$50** (right answer): Yes. Multiplying by 50 scales the SD by 50: 1 × 50.
- $1: Costs are in dollars now, 50 per visit, so the spread scales too.
- $100: That's the expected cost, 2 × 50.

Shifts move the center only. Scaling stretches both the center and the spread.

Next: [Drill this topic, 8 questions](https://monte.markets/practice/drill/?topic=rv&n=8)
