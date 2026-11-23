# Counting and the binomial

> Repeat a yes-or-no try n independent times with the same chance p: the count of yeses is binomial, mean np, variance np(1 − p). Combinations count the ways it can happen.

Canonical URL: https://monte.markets/learn/count/

License: CC BY 4.0, reuse with credit to monte.markets.

Topic 7 of 14 in [Learn](https://monte.markets/learn/).

## 5 lessons · 3 min each

1. [How many ways](https://monte.markets/learn/count/counting-orders.md)
2. [Choosing a group](https://monte.markets/learn/count/choose.md)
3. [When the binomial fits](https://monte.markets/learn/count/binomial-setup.md)
4. [Exactly k successes](https://monte.markets/learn/count/binomial-probability.md)
5. [At least one: use the complement](https://monte.markets/learn/count/at-least-one.md)

## Check yourself

1. 6 people, 6 seats: arrangements?
   - Answer: 720
   - Why: 6!
2. Gold and silver from 5 runners: how many orders?
   - Answer: 20
   - Why: 5 × 4, order matters.
3. Pick 2 of 5 runners for a pair, order doesn't matter?
   - Answer: 10
   - Why: C(5,2).
4. Four binomial conditions?
   - Answer: Fixed n, two outcomes, independent trials, the same p every time
5. 20% of shoppers use a coupon, n = 8: P(exactly 2)?
   - Answer: 0.294
   - Why: C(8,2)(0.2)²(0.8)⁶.
6. P(at most 2)?
   - Answer: 0.797
   - Why: P(0) + P(1) + P(2) = 0.1678 + 0.3355 + 0.2936.
7. Expected number?
   - Answer: 1.6
   - Why: np = 8 × 0.2.
8. A free throw goes in 70% of the time. 4 shots: P(exactly 3)?
   - Answer: 0.412
   - Why: 4 × 0.7³ × 0.3.
9. A box of 10 phones has 3 defective. Pick 4 without replacement. P(exactly 1 defective)?
   - Answer: 0.5
   - Why: C(3, 1) × C(7, 3) / C(10, 4) = 3 × 35 / 210. This is the hypergeometric.
10. Same box: P(no defective in the 4)?
    - Answer: 0.1667
    - Why: C(7, 4) / C(10, 4) = 35 / 210.
11. Why not the binomial there?
    - Answer: Without replacement, the chance changes after every draw
    - Why: Binomial needs the same p each draw; fine only if you sample under about 5% of the group.

## The idea in one page

Repeat a yes-or-no try n independent times with the same chance p: the count of yeses is **binomial**, mean np, variance np(1 − p). Combinations count the ways it can happen.

Same chance each time, n tries: how many hits?

- **Sales**: A 20% closer lands 4+ deals in 10 calls about 12% of the time.
- **Quality**: How many defects in a batch of 50 should worry you?
- **Sports**: A 75% free-throw shooter makes exactly 6 of 10 about 15% of the time.

Tennis example: You win 60% of tiebreaks. With 3 tiebreaks in a match, P(win exactly 2) = C(3,2)(0.6)²(0.4) = 43.2%. P(win at least 1) = 1 − 0.4³ = 93.6%.

## The trap

At least one is 1 − P(none). Adding P(1) + P(2) + … by hand is slow and invites mistakes.

## Formulas

- Factorial: n! = n(n − 1)(n − 2)…1, and 0! = 1
- Combinations: nCx = n! / [x!(n − x)!]
- Binomial: P(Y = y) = nCy · pʸ · (1 − p)ⁿ⁻ʸ
- Mean and variance: E(Y) = np, V(Y) = np(1 − p)
- Hypergeometric: n draws without replacement from N items, K of them successes: P(k) = C(K, k) C(N − K, n − k) / C(N, n). Mean nK/N. Excel: HYPGEOM.DIST(k, n, K, N, FALSE)
- Excel: BINOM.DIST(y, n, p, FALSE) for exactly y; TRUE for at most y
- Remember it: Binomial is counting wins in a fixed number of matches, when every match is the same weighted coin.

## Videos and further reading

- [Khan Academy: Combinations](https://www.khanacademy.org/math/statistics-probability/counting-permutations-and-combinations/combinations-lib): Videos and practice on choosing when order does not matter. About 15 minutes.
- [jbstatistics: An Introduction to the Binomial Distribution](https://www.youtube.com/watch?v=qIzC1-9PwQo): Where the binomial formula comes from, its conditions, and a worked example. About 14 minutes.
- [jbstatistics: An Introduction to the Hypergeometric Distribution](https://www.youtube.com/watch?v=L2KMttDm3aY): Sampling without replacement, the hypergeometric formula, and how it differs from the binomial. About 16 minutes.

## Next

- [Drill this topic](https://monte.markets/practice/drill/?topic=count)
- Previous topic: [Two variables and portfolios](https://monte.markets/learn/two.md)
- Next topic: [Poisson](https://monte.markets/learn/poisson.md)
