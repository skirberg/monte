# Monte Carlo option pricing

> Simulate stock paths and watch the price close in on Black-Scholes.

Canonical URL: https://monte.markets/play/options/

License: CC BY 4.0, reuse with credit to monte.markets.

Game 9 of 10 in [Play](https://monte.markets/play/).

## What’s going on

A **call** pays `max(S_T − K, 0)` at expiry; a **put** pays `max(K − S_T, 0)`. To price one, simulate the stock under **risk-neutral** rules: it grows at the interest rate, `S_T = S₀ · exp((r − σ²/2)T + σ√T · Z)` with Z a standard normal draw. Average the payoffs, discount by `e^(−rT)`, and you have a Monte Carlo price.

**Black-Scholes** does the same average in closed form: `C = S₀N(d₁) − Ke^(−rT)N(d₂)`, with `d₁ = [ln(S₀/K) + (r + σ²/2)T] / (σ√T)` and `d₂ = d₁ − σ√T`. N is the normal CDF from the normal curve topic. At S₀ = K = 100, one year, 5% and σ = 20%, the call is worth $10.45.

The Monte Carlo error shrinks like `1/√n`: four times the paths, half the error. That is why the shaded band narrows slowly, and why banks use Monte Carlo for options too complex for a formula.

A textbook model (constant volatility, no dividends). For learning, not investment advice.

Learn the idea: [The normal curve](https://monte.markets/learn/normal.md)

Next game: [Election night](https://monte.markets/play/election.md)
