# Regression isn't symmetric

> The correlation between x and y is the same both ways. Regression lines aren't. Decide what you're predicting, and put it on the y side.

Canonical URL: https://monte.markets/learn/reg/not-symmetric/

License: CC BY 4.0, reuse with credit to monte.markets.

Lesson 4 of 5 in [Simple regression](https://monte.markets/learn/reg.md).

**Question:** You fit weight from height. Then you fit height from weight. Same line?

- Yes, if r is positive: The sign doesn't matter. Unless r = ±1, the lines differ.
- **No** (right answer): Yes. One line minimizes vertical misses, the other horizontal ones. They only match on a perfect fit.
- Yes, just flipped: Correlation is symmetric. Regression isn't.

The correlation between x and y is the same both ways. Regression lines aren't. Decide what you're predicting, and put it on the y side.

**Question:** You want to predict a runner's race time from their weekly miles. Which goes on the y side?

- Either, it doesn't matter: It matters: the two fits give different lines.
- **Race time** (right answer): Yes. y is what you predict; x is what you know.
- Weekly miles: That's what you know, so it's x.

y is the thing you want to predict. Fit it that way round.

Next: [Stay inside your data](https://monte.markets/learn/reg/extrapolation.md)
