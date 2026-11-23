# Monte Carlo savings calculator: will I hit my goal?

> A start, a monthly saving and a guess at returns. We play out 5,000 futures and count how often you get there.

Canonical URL: https://monte.markets/decide/goal/

License: CC BY 4.0, reuse with credit to monte.markets.

[Decide](https://monte.markets/decide/): Monte Carlo. Monte Carlo savings calculator: 5,000 simulated futures, month by month, show your chance of reaching a savings goal, the middle outcome and the bad case.

What it teaches: Monte Carlo simulation, volatility and why the average is not the typical outcome.

## How this works, step by step

### 1. Start with a guess about returns.

You give two numbers: the average yearly return, and how much a typical year swings around it, called **volatility**. Both are assumptions, not facts. A savings account pays a steady rate. A stock fund might average 7% over decades, but any single year can be up 25% or down 30%.

### 2. Play out one month.

Each month the balance grows by a random amount: usually a little, sometimes a lot, sometimes it shrinks. Then your monthly saving goes in. The random growth is set up so that, on average, a year grows by exactly your average return.

Formula: next = balance × e^(μ + s × z) + monthly · s = volatility ÷ √12 · μ = ln(1 + return) ÷ 12 − s² ÷ 2 · z is a random draw from the bell curve

### 3. Repeat for every month, then 5,000 times.

Twenty years is 240 months, so one future is 240 random steps. That is one way things could go. Play it out 5,000 times and the futures spread into a fan: narrow at the start, wider every year, because surprises pile up. This is a **Monte Carlo simulation**.

### 4. Read the fan.

At every year, line up the 5,000 balances from lowest to highest. A tenth of the way in is the bad case, the middle is the middle, and nine tenths in is the good case. The shaded band holds 8 futures in 10. Your chance of reaching the goal is the share of futures that end at or above it.

Formula: chance of reaching the goal = futures ending at or above it ÷ 5,000

### 5. The average is not the typical.

Big swings help a few futures a lot and hurt many a little, so the average sits above the middle. In the riskier example the average ends near $201,000, right at the goal. Yet only about 1 in 3 futures get there, and the middle one ends near $140,000. Plan on the middle and the bad case, not the average.

Formula: average final = start × (1 + return)^years + monthly × (g^months − 1) ÷ (g − 1), with g = (1 + return)^(1/12)

## What this leaves out

These are made-up assumptions, and past returns don’t promise future ones. Real markets have worse crashes than this model draws, and good and bad years tend to bunch together. There are no fees, taxes or inflation here, and every month’s saving goes in without fail.

Use it to see how the range widens with risk and with time, and how much a bigger monthly saving moves the bad case. For learning, not financial advice.

For learning, not financial, medical or betting advice.

Next decision: [Staffing calculator: how many people do I need?](https://monte.markets/decide/staffing.md)

[All 9 decisions](https://monte.markets/decide/)
