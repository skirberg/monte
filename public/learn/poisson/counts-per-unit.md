# Counting events in a window

> A Poisson count is the number of events in a fixed window of time or space when they happen independently at a steady average rate, λ (lambda).

Canonical URL: https://monte.markets/learn/poisson/counts-per-unit/

License: CC BY 4.0, reuse with credit to monte.markets.

Lesson 1 of 5 in [Poisson: counts per unit](https://monte.markets/learn/poisson.md).

**Question:** Which is a Poisson count?

- The weight of a parcel: Weight is measured, not counted.
- **Emails arriving per hour** (right answer): Yes. Events at a steady average rate in a window of time, with no fixed number of tries.
- Heads in 10 flips: That has a fixed number of tries, 10. That's binomial.

A Poisson count is the number of events in a fixed window of time or space when they happen independently at a steady average rate, λ (lambda). Calls per hour, typos per page, potholes per mile.

**Question:** A shop averages 4 customers every 10 minutes. What is λ for a 10-minute window?

- 40: That would be per 100 minutes.
- **4** (right answer): Yes. λ is the average count for the window you're asking about.
- 0.4: That's per minute. The window here is 10 minutes.

λ is the expected count in your window. Get it right before anything else.

Next: [Match λ to the window](https://monte.markets/learn/poisson/rescaling.md)
