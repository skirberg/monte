# The chance of exactly k

> P(exactly k) = e^(−λ) · λ^k ÷ k!. For k = 0 that's just e^(−λ), the chance of none. The chance of none, e^(−λ), is the one to remember.

Canonical URL: https://monte.markets/learn/poisson/poisson-probability/

License: CC BY 4.0, reuse with credit to monte.markets.

Lesson 3 of 5 in [Poisson: counts per unit](https://monte.markets/learn/poisson.md).

**Question:** Calls average 2 an hour. Is 2 calls in an hour certain?

- Yes, that's the average: An average describes many hours, not every hour.
- Only in a busy hour: Any hour can come in above or below 2.
- **No, it's just the most typical** (right answer): Yes. Some hours get 0, some 5. λ is the average, not a promise.

P(exactly k) = e^(−λ) · λ^k ÷ k!. For k = 0 that's just e^(−λ), the chance of none.

**Question:** λ = 2. What's P(0 events)?

- 0: Quiet hours happen even with an average of 2.
- 0.5: Use e^(−λ): e^(−2) ≈ 0.135.
- **About 0.135** (right answer): Yes. e^(−2) ≈ 0.135. About 1 hour in 7 is quiet.

The chance of none, e^(−λ), is the one to remember. At least one is 1 − e^(−λ).

Next: [Mean and variance match](https://monte.markets/learn/poisson/mean-equals-variance.md)
