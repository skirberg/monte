# Prediction market calculator: what does 30¢ mean?

> A prediction market price is the crowd's chance. Compare it with yours, after fees.

Canonical URL: https://monte.markets/decide/market/

License: CC BY 4.0, reuse with credit to monte.markets.

[Decide](https://monte.markets/decide/): A market price. Read a prediction market price, Kalshi or Polymarket style, as a chance. Compare it with yours and see what Yes and No are worth on average after fees.

What it teaches: Implied probability, expected value and break-even after fees.

## How this works, step by step

### 1. A contract pays $1 if it happens.

A prediction market asks a yes or no question. A Yes contract pays $1 if the answer is yes and nothing if not. People buy and sell these all day, and the price moves.

### 2. The price is the crowd's chance.

If a Yes trades at 30¢, the people trading it, together, put the chance near 30%. If they thought it was likelier, someone would pay more. It is the crowd’s estimate, not a fact. Busy markets on well-known questions are often well calibrated. Small markets, long shots and questions people feel strongly about can be off.

Formula: implied chance = price ÷ 100¢ · 30¢ → 30%

### 3. Compare with your own chance.

If you think the chance is 40% and Yes costs 30¢, then on average each contract pays 40¢ and costs 30¢. That is a 10¢ edge. If you are wrong about your 40%, the edge is not there.

Formula: EV per Yes = your chance × 100¢ − price − fee · EV per No = (1 − your chance) × 100¢ − (100¢ − price) − fee

### 4. Count the costs.

Fees come off every contract, so you need a bigger edge than it looks. The price to buy is usually a little above the price to sell, called the **spread**. Your money is also tied up until the question is settled, which can take months. A 2¢ edge on a question that settles in a year is a small return.

Formula: break-even chance = (price + fee) ÷ 100¢

For learning, not financial, medical or betting advice.

Next decision: [Option probability calculator: will the stock get there?](https://monte.markets/decide/option.md)

[All 9 decisions](https://monte.markets/decide/)
