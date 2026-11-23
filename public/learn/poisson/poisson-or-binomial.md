# Poisson or binomial?

> Binomial: fixed number of trials, count the successes. Poisson: no fixed number, count events in a window.

Canonical URL: https://monte.markets/learn/poisson/poisson-or-binomial/

License: CC BY 4.0, reuse with credit to monte.markets.

Lesson 5 of 5 in [Poisson: counts per unit](https://monte.markets/learn/poisson.md).

**Question:** You count defective items in a batch of exactly 50, each defective with chance 0.02. Which model?

- Normal: This is a count of successes in a fixed number of trials.
- **Binomial** (right answer): Yes. A fixed number of tries, 50, each with the same chance.
- Poisson: Poisson has no fixed number of tries. Here there are exactly 50.

Binomial: fixed number of trials, count the successes. Poisson: no fixed number, count events in a window. With many trials and a small p, a binomial looks a lot like a Poisson with λ = np.

**Question:** Typos per page in a long book. Which model?

- **Poisson** (right answer): Yes. There's no fixed number of tries, just events at an average rate per page.
- Binomial: There's no natural fixed n of chances for a typo.
- Neither: It's a classic Poisson count.

Ask: is there a fixed number of tries? Yes: binomial. No, just a rate: Poisson.

Next: [Drill this topic, 8 questions](https://monte.markets/practice/drill/?topic=poisson&n=8)
