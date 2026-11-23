# Staffing calculator: how many people do I need?

> Customers arrive at random. Find the fewest people that keep a swamped hour rare.

Canonical URL: https://monte.markets/decide/staffing/

License: CC BY 4.0, reuse with credit to monte.markets.

[Decide](https://monte.markets/decide/): Poisson. Staffing calculator for a busy hour: see how often random arrivals outrun the team, and the fewest people that keep it rare. Built on the Poisson distribution.

What it teaches: The Poisson distribution, capacity and utilization.

## How this works, step by step

### 1. Arrivals are random, even when the average is steady.

60 customers an hour on average does not mean one a minute. Some hours bring 50, some 70, because each person decides on their own when to come. When many people each have a small chance of turning up, the count in an hour follows the **Poisson distribution**. It needs only one number: the average.

Formula: P(exactly k arrive) = e^(−λ) × λ^k ÷ k!, where λ is the average per hour

### 2. Count what the team can serve.

Capacity is the number of people working times how many each one serves in an hour, rounded down to whole arrivals.

Formula: capacity = staff × served per person · 3 baristas × 25 = 75 an hour

### 3. Add up the hours that bring too many.

The chance of too many is the share of hours where more arrive than the team can serve. Add up the Poisson chances for every count up to capacity, and take that from 100%.

Formula: P(too many) = 1 − P(k ≤ capacity) · coffee rush: P(more than 75 when λ = 60) = 2.6%

### 4. Pick the fewest that keep it rare.

Try 1 person, then 2, then 3, and stop at the first team whose chance of too many is under your bar. How rare is rare enough is a judgment: a coffee line once a week is fine, a waiting room in an emergency is not.

### 5. Busy is not the same as fine.

**Utilization** is how much of the time each person is working: arrivals over capacity. Over 100%, the line grows without end. Even under 100%, arrivals bunch up, so people wait. Past about 85%, waits get long fast. That is the main lesson of queueing theory.

Formula: busy = arrivals ÷ capacity · 60 ÷ 75 = 80%

## What this counts, and what it doesn’t

This counts hours, not waits. Someone not served in a busy hour spills into the next one. And an hour with room to spare still has a line if everyone arrives in the same ten minutes. A full waiting-line model, called **Erlang C**, uses how long each person takes to find how long people wait.

Real rushes are lumpier than Poisson. A bus pulls in, a class lets out, a storm knocks out the network, and arrivals come in bursts. Plan on your busiest hour, and leave room.

For learning, not financial, medical or betting advice.

[All 9 decisions](https://monte.markets/decide/)
