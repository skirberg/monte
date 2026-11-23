# Read the odds

> Turn betting lines and prediction market prices into probabilities, and find the bookmaker's cut.

Canonical URL: https://monte.markets/play/odds/

License: CC BY 4.0, reuse with credit to monte.markets.

Game 6 of 10 in [Play](https://monte.markets/play/).

## What’s going on

**American odds.** A minus number is how much you risk to win $100; a plus number is how much you win on $100. The implied probability is `|a| / (|a| + 100)` for a favorite and `100 / (a + 100)` for an underdog. So −150 means 60.0% and +150 means 40.0%.

**Prediction markets** are simpler: a contract that pays $1 if the event happens and trades at 63¢ implies a 63% chance.

Add both sides of a line and you get more than 100%. On a −110 / −110 line each side implies 52.38%, together 104.76%. That extra is the **overround**; the bookmaker’s margin is `1 − 1/1.0476 ≈ 4.55%`. Divide each side by the total to get the fair, no-cut probabilities.

A bet has positive **expected value** only when your probability beats the implied one: `EV = p × profit − (1 − p) × stake`. At −110 you need to be right 52.38% of the time just to break even.

Example lines, not live prices. For learning, not betting advice.

Learn the idea: [Probability rules](https://monte.markets/learn/prob.md)

Next game: [Don't peek](https://monte.markets/play/ab-test.md)
