# Match λ to the window

> Poisson rates scale with the window: twice as long, twice the λ. The most common mistake is using the rate for the wrong window.

Canonical URL: https://monte.markets/learn/poisson/rescaling/

License: CC BY 4.0, reuse with credit to monte.markets.

Lesson 2 of 5 in [Poisson: counts per unit](https://monte.markets/learn/poisson.md).

**Question:** A help desk gets 3 calls an hour on average. What's λ for 2 hours?

- 3: 3 is per hour. Rescale to the window you're asking about.
- 1.5: That divides when it should multiply.
- **6** (right answer): Yes. Twice the time, twice the expected count.

Poisson rates scale with the window: twice as long, twice the λ. The most common mistake is using the rate for the wrong window.

**Question:** A website has 120 errors a day on average. λ for one hour?

- 120: That's per day.
- 2,880: That multiplies by 24 instead of dividing.
- **5** (right answer): Yes. 120 ÷ 24 = 5 per hour.

First line of every Poisson problem: λ for this window.

Next: [The chance of exactly k](https://monte.markets/learn/poisson/poisson-probability.md)
