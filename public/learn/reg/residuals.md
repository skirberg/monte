# Residuals: what the line misses

> A residual is actual minus predicted: e = y − ŷ. Positive means the line guessed too low.

Canonical URL: https://monte.markets/learn/reg/residuals/

License: CC BY 4.0, reuse with credit to monte.markets.

Lesson 2 of 5 in [Simple regression](https://monte.markets/learn/reg.md).

**Question:** The line predicts $250k for a house that sold for $270k. What's the residual?

- **+$20k** (right answer): Yes. Residual = actual − predicted = 270 − 250.
- −$20k: Residuals are actual minus predicted, so this one is positive.
- $270k: That's the actual price. The residual is the miss.

A residual is actual minus predicted: e = y − ŷ. Positive means the line guessed too low. The least squares line makes the sum of squared residuals as small as possible.

**Question:** A residual plot shows a clear curve. What does that tell you?

- **A straight line is the wrong shape** (right answer): Yes. Residuals should look like random scatter. A pattern means the line is missing something.
- The model is great: A good fit leaves no pattern behind.
- Nothing: Patterns in residuals are a warning.

Look at the residuals. Random scatter is good; a pattern means rethink the model.

Next: [R²: how much the line explains](https://monte.markets/learn/reg/r-squared.md)
