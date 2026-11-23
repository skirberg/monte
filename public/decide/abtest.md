# A/B test calculator: did my change really work?

> Two versions, two counts. Is the gap real or luck?

Canonical URL: https://monte.markets/decide/abtest/

License: CC BY 4.0, reuse with credit to monte.markets.

[Decide](https://monte.markets/decide/): A/B test. A/B test calculator: type the visitors and conversions for A and B. See in plain words whether the gap is significant or luck, how big it could be, and the sample size you need.

What it teaches: The two-proportion z test, p-values, confidence intervals, sample size and power.

## How this works, step by step

### 1. Split people at random.

Show the old version to some people and the new one to others, decided by a coin flip for each person. Random splitting is what makes the two groups alike in everything except the change. If A ran on Monday and B on Saturday, you would be testing the day, not the button.

### 2. Compare the rates.

Each version’s rate is how many acted out of how many saw it. The **lift** is how much bigger B’s rate is, as a share of A’s. Going from 4% to 5% is a 1 point gap, and a 25% lift.

Formula: rate = conversions ÷ visitors · lift = (B − A) ÷ A

### 3. Ask: could luck alone do this?

Even two identical versions never get identical rates: people are random. The **z test** measures the gap in units of the wobble you would expect by chance. A z near 0 is ordinary wobble. Past about 2, it is rare for luck alone.

Formula: pooled rate p = (conversions A + B) ÷ (visitors A + B) · z = (B − A) ÷ √(p(1 − p)(1/visitors A + 1/visitors B))

### 4. Read the p-value.

The **p-value** answers one question: if the change did nothing, how often would a gap at least this big show up? Under 5% is called **statistically significant**. It is not the chance that B is better, and it says nothing about whether the lift is big enough to matter.

Formula: p = 2 × Φ(−|z|), where Φ is the bell curve’s area to the left · z = 2.38 gives p = 1.7%

### 5. Give a range, not one number.

The gap you saw is one draw. The 95% range is where the real gap probably sits. If the range crosses zero, B could be no better, or even worse.

Formula: B − A ± 1.96 × √(A(1 − A) ÷ visitors A + B(1 − B) ÷ visitors B)

### 6. Count how many you need.

Small lifts need many people. To catch a given lift 8 times in 10 (80% **power**) at the 5% level, use the count below. Going from 10% to 12% takes about 3,841 people per version. Half the lift takes about four times as many.

Formula: n per version = (1.96 × √(2p̄(1 − p̄)) + 0.84 × √(A(1 − A) + B(1 − B)))² ÷ (B − A)², with p̄ = (A + B) ÷ 2

## Don’t peek and stop

Decide how many people you need before you start, and stop there. Checking every day and stopping the moment B looks ahead turns luck into a “win” far more often than 5% of the time.

And a real lift can still be too small to be worth the cost of the change. The range tells you how big it could be; whether that is worth it is your call.

For learning, not financial, medical or betting advice.

Next decision: [Monte Carlo savings calculator: will I hit my goal?](https://monte.markets/decide/goal.md)

[All 9 decisions](https://monte.markets/decide/)
