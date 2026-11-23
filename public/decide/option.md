# Option probability calculator: will the stock get there?

> The typical move, the chance of ending past the strike, and where you break even.

Canonical URL: https://monte.markets/decide/option/

License: CC BY 4.0, reuse with credit to monte.markets.

[Decide](https://monte.markets/decide/): An option, for learning only. Option probability calculator: from a stock price, strike, days to expiry and implied volatility, the typical move and the chance of ending past the strike. For learning only.

What it teaches: The lognormal model, volatility and the chance of finishing past a price.

## How this works, step by step

### 1. An option is a bet with a deadline.

A **call** pays if the stock ends above a set price, the **strike**, on a set day. A **put** pays if it ends below. You pay a fee up front, the **premium**. If the stock never gets past the strike, the option expires worth nothing and the premium is gone. That is the most you can lose when you buy one.

### 2. Volatility is how much the stock usually swings.

**Implied volatility** is the swing traders are pricing in, written as a yearly percent. 30% means a typical move over a year of about 30% of the price, up or down. Over a shorter time the swing is smaller, but not in a straight line: it grows with the square root of time. A month is about a twelfth of a year, so its swing is about √(1/12), or 29%, of the yearly one.

Formula: typical move = price × volatility × √(days ÷ 365) · $100 × 0.30 × √(30 ÷ 365) = ±$8.60

### 3. Draw the range of prices at expiry.

The model assumes the stock’s daily moves are random, so the price at expiry follows a skewed bell curve called a **lognormal**. It can never fall below $0 but it can rise a lot. The model also assumes no drift: on average the stock goes nowhere. That is the standard “risk-neutral” shortcut with interest rates set to zero, and it is an approximation, not a forecast.

### 4. Read the chance of ending past a price.

The chance of ending above the strike is the area of the curve to the right of it. For the steady stock example, a $110 strike 10% above a $100 price, 30 days out at 30% volatility, that area is about 12.5%.

Formula: P(price at expiry > strike) = Φ(d₂), with d₂ = (ln(price ÷ strike) − σ²T ÷ 2) ÷ (σ√T) and T = days ÷ 365

### 5. Add the premium to find breakeven.

Ending past the strike is not enough. The stock has to go far enough to pay back what you spent. A call breaks even at strike plus premium, a put at strike minus premium. The chance of a profit at expiry is the area past that point, which is always smaller than the chance of passing the strike.

Formula: call breakeven = strike + premium · put breakeven = strike − premium

For learning only. Real options can be sold before expiry, most are on 100 shares, and real stocks drift, jump on news and change their volatility. Real trading also has fees and spreads. The game [Price an option](https://monte.markets/play/options.md) shows where the premium itself comes from.

For learning, not financial, medical or betting advice.

Next decision: [Bayes' theorem calculator: is this test result real?](https://monte.markets/decide/bayes.md)

[All 9 decisions](https://monte.markets/decide/)
