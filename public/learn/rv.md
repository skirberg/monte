# Random variables and expected value

> A random variable is a number that depends on chance. Its expected value is the long-run average, weighted by probability. Its SD is the risk around that.

Canonical URL: https://monte.markets/learn/rv/

License: CC BY 4.0, reuse with credit to monte.markets.

Topic 5 of 14 in [Learn](https://monte.markets/learn/).

## 5 lessons · 3 min each

1. [A number from chance](https://monte.markets/learn/rv/random-variable.md)
2. [The long-run average](https://monte.markets/learn/rv/expected-value.md)
3. [Is the bet fair?](https://monte.markets/learn/rv/fair-bets.md)
4. [How much it swings](https://monte.markets/learn/rv/spread-of-a-random-variable.md)
5. [Adding and multiplying](https://monte.markets/learn/rv/shifting-and-scaling.md)

## Check yourself

1. Expected value of one roll of a four-sided die (1 to 4)?
   - Answer: 2.5
   - Why: You never roll a 2.5; it is the long-run average.
2. Toss 3 coins, Y = number of heads. E(Y)?
   - Answer: 1.5
   - Why: 3 × 0.5, or 0(.125) + 1(.375) + 2(.375) + 3(.125).
3. Y: −50 (0.1), 20 (0.5), 80 (0.3), 150 (0.1). Mean?
   - Answer: 44
   - Why: −5 + 10 + 24 + 15.
4. Same Y, variance?
   - Answer: 2,684
   - Why: Σ(y − 44)² p: 883.6 + 288 + 388.8 + 1,123.6.
5. E(Y + 10)? SD(Y + 10)?
   - Answer: 54; the SD is unchanged
   - Why: Shifting every outcome moves the mean, not the spread.
6. Var(2Y)?
   - Answer: 4 × Var(Y) = 10,736
   - Why: Constants come out squared.
7. A or B on expected value? On risk? On both?
   - Answer: B, A, A
   - Why: 10.8 > 8; 6 < 8.4; CV 75% < 78%.

## The idea in one page

A **random variable** is a number that depends on chance. Its **expected value** is the long-run average, weighted by probability. Its **SD** is the risk around that.

Expected value is what a bet is worth if you could make it a thousand times.

- **Insurance**: Premiums start from expected claims, plus a cushion for the swings.
- **Startups**: A 10% shot at $10 million is worth $1 million, on average.
- **Inventory**: Expected demand sets the order; the SD sets the safety stock.

Finance example: A returns 2% or 14%, 50/50: E = 8%, σ = 6%. B: −6, 6, 12 or 24% with odds 0.1, 0.3, 0.4, 0.2: E = 10.8%, σ = 8.4%. B pays more; A has less risk per unit of return (CV 75% vs 78%).

## The trap

The expected value is not the most likely outcome, and may be impossible (2.5 on a four-sided die). It is the long-run average.

## Formulas

- Expected value: E(Y) = μ = Σ y · P(y)
- Variance: σ² = Σ (y − μ)² · P(y) = Σ y²P(y) − μ²
- SD and CV: σ = √σ², CV = σ / μ
- Constants: E(a + bY) = a + b · E(Y), Var(a + bY) = b² · Var(Y)
- Discrete uniform: k equally likely values, each with probability 1/k. The mean is the plain average of the values
- Remember it: Expected value: a bet's long-run worth. SD: how far one try can land. CV: risk per unit of reward, lower is better.

## Videos and further reading

- [StatQuest: Expected Values, Main Ideas](https://www.youtube.com/watch?v=KLs_7b7SKi4): What an expected value means as a long run average, with a worked example. About 14 minutes.
- [jbstatistics: The Expected Value and Variance of Discrete Random Variables](https://www.youtube.com/watch?v=Vyk8HQOckIE): The formulas for E(X) and Var(X) worked by hand from a probability table. About 11 minutes.
- [Seeing Theory: Basic Probability, Expectation and Variance](https://seeing-theory.brown.edu/basic-probability/index.html): Scroll to Expectation, roll the die 100 times and watch the running mean settle near 3.5, then bias the die. About 8 minutes.

## Next

- [Drill this topic](https://monte.markets/practice/drill/?topic=rv)
- Previous topic: [Probability rules](https://monte.markets/learn/prob.md)
- Next topic: [Two variables and portfolios](https://monte.markets/learn/two.md)
