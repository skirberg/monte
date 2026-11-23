# S&P 500 simulator: the long run

> 98 years of real S&P 500 returns, played out 2,000 ways.

Canonical URL: https://monte.markets/play/long-run/

License: CC BY 4.0, reuse with credit to monte.markets.

Game 8 of 10 in [Play](https://monte.markets/play/).

## What’s going on

The **arithmetic mean** averages the yearly returns. The **geometric mean** is the rate your money actually compounded at: `(Π(1 + rₜ))^(1/n) − 1`. The geometric mean is always lower when returns move around, by roughly `σ² / 2`. For the S&P 500 since 1928 that gap is about 1.8 percentage points a year.

The simulation is a **bootstrap Monte Carlo**. Each future draws real historical years at random, with replacement. Repeat 2,000 times and read off the percentiles. It keeps every real crash and boom, but it assumes years are independent, so it ignores streaks and changing regimes. Treat it as a model, not a forecast.

Data: annual total returns from Aswath Damodaran’s *Historical Returns on Stocks, Bonds and Bills* at NYU Stern, updated January 5, 2026.

For learning, not investment advice.

Learn the idea: [How spread out is it](https://monte.markets/learn/spread.md)

Next game: [Price an option](https://monte.markets/play/options.md)
