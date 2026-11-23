# When the binomial fits

> A binomial count needs four things: a fixed number of trials n, two outcomes each time (success or not), the same chance p every time, and trials that don't…

Canonical URL: https://monte.markets/learn/count/binomial-setup/

License: CC BY 4.0, reuse with credit to monte.markets.

Lesson 3 of 5 in [Counting and the binomial](https://monte.markets/learn/count.md).

**Question:** Which of these is a binomial count?

- Calls arriving in an hour: There's no fixed number of tries. That's a Poisson count.
- Height of 10 people: Height is measured, not a count of successes.
- **Heads in 10 coin flips** (right answer): Yes. A fixed number of tries, each heads or not, the same chance every time, independent.

A binomial count needs four things: a fixed number of trials n, two outcomes each time (success or not), the same chance p every time, and trials that don't affect each other.

**Question:** A basketball player shoots 20 free throws at 80% each, independently. Expected number made?

- 20: That would mean she never misses.
- **16** (right answer): Yes. The mean of a binomial is n × p = 20 × 0.8.
- 0.8: That's the chance per shot. Times 20 shots.

Binomial mean is np. Its SD is √(np(1 − p)).

Next: [Exactly k successes](https://monte.markets/learn/count/binomial-probability.md)
