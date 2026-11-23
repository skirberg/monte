# Poisson: counts per unit

> Poisson counts events in a fixed window when they arrive independently at a steady average rate λ. Mean and variance both equal λ. Scale λ to the window first.

Canonical URL: https://monte.markets/learn/poisson/

License: CC BY 4.0, reuse with credit to monte.markets.

Topic 8 of 14 in [Learn](https://monte.markets/learn/).

## 5 lessons · 3 min each

1. [Counting events in a window](https://monte.markets/learn/poisson/counts-per-unit.md)
2. [Match λ to the window](https://monte.markets/learn/poisson/rescaling.md)
3. [The chance of exactly k](https://monte.markets/learn/poisson/poisson-probability.md)
4. [Mean and variance match](https://monte.markets/learn/poisson/mean-equals-variance.md)
5. [Poisson or binomial?](https://monte.markets/learn/poisson/poisson-or-binomial.md)

## Check yourself

1. A coffee shop gets 30 orders per hour. λ for 10 minutes?
   - Answer: 5
   - Why: Scale the rate to the window.
2. P(no orders in 10 minutes)?
   - Answer: e⁻⁵ = 0.0067
3. P(2 or more orders in 10 minutes)?
   - Answer: 1 − P(0) − P(1) = 1 − 6e⁻⁵ = 0.960
   - Why: With one barista, a second order means someone waits.
4. Given at least one order in those 10 minutes, P(exactly one)?
   - Answer: 0.0339
   - Why: P(1) / (1 − P(0)) = 5e⁻⁵ / (1 − e⁻⁵). At least one rules out zero.
5. A help desk gets 3 calls per hour. P(exactly 3 in one hour)?
   - Answer: 0.224
   - Why: e⁻³ 3³ / 3!.
6. P(4 or fewer calls in 2 hours)?
   - Answer: 0.285
   - Why: λ = 6, add P(0) through P(4).
7. Poisson mean and variance?
   - Answer: Both equal λ

## The idea in one page

**Poisson** counts events in a fixed window when they arrive independently at a steady average rate λ. Mean and variance both equal λ. **Scale λ to the window first.**

Poisson counts things that arrive at random but at a steady rate: calls, emails, goals, typos.

- **Staffing**: A desk averaging 4 calls an hour gets 8+ in about 5% of hours.
- **Tech**: Servers sized for the average fall over on normal busy minutes.
- **Sports**: Goals per soccer match are close to Poisson.

Tennis example: You make 3 unforced errors a set on average. P(none in a set) = e⁻³ = 5%. Over 3 sets λ = 9, so P(6 or fewer) is about 21%.

## The trap

Forgetting to rescale λ. 3 calls an hour over 2 hours is λ = 6, not 3.

## Formulas

- Poisson: P(Y = y) = e⁻λ λʸ / y!
- Mean and variance: E(Y) = V(Y) = λ
- Given at least one: P(Y = k | Y ≥ 1) = P(Y = k) / (1 − P(0)), for k ≥ 1
- Rescale: λ for a window = rate × window length
- Excel: POISSON.DIST(y, λ, FALSE) for exactly y; TRUE for at most y
- Remember it: Poisson counts arrivals: help-desk calls, emails an hour, errors per set. Pick the window first, then count.

## Videos and further reading

- [jbstatistics: An Introduction to the Poisson Distribution](https://www.youtube.com/watch?v=jmqZG6roVqU): When counts per unit of time or space follow a Poisson, with a worked example. About 9 minutes.
- [Art of Stat: Poisson Distribution](https://istats.shinyapps.io/PoissonDist/): Set λ and read P(X = x) from the table, then use Find Probabilities to check your answers. About 5 minutes.
- [Seeing Theory: Probability Distributions](https://seeing-theory.brown.edu/probability-distributions/index.html): Under Discrete pick Poisson and drag λ to see the shape change. About 5 minutes.

## Next

- [Drill this topic](https://monte.markets/practice/drill/?topic=poisson)
- Previous topic: [Counting and the binomial](https://monte.markets/learn/count.md)
- Next topic: [The normal curve](https://monte.markets/learn/normal.md)
