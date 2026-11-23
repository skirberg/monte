# When predictors overlap

> Multicollinearity is when predictors are strongly correlated with each other.

Canonical URL: https://monte.markets/learn/mreg/multicollinearity/

License: CC BY 4.0, reuse with credit to monte.markets.

Lesson 5 of 5 in [Multiple regression](https://monte.markets/learn/mreg.md).

**Question:** A model uses both square meters and square feet. What goes wrong?

- R² drops: R² stays about the same. It's the coefficients that go wild.
- **They carry the same information, so their slopes become unstable** (right answer): Yes. The model can't tell them apart, so it splits the effect between them almost at random.
- Nothing, more data is better: Two columns that say the same thing don't add information.

Multicollinearity is when predictors are strongly correlated with each other. Predictions can still be fine, but the individual slopes become unreliable: big standard errors, signs that flip.

**Question:** Two predictors have correlation 0.98 with each other. What's a sensible fix?

- Ignore it, the slopes are fine: With 0.98, the slopes are not trustworthy.
- **Drop one, or combine them** (right answer): Yes. Keep the information once.
- Add a third similar predictor: That makes it worse.

If two predictors say the same thing, keep one.

Next: [Drill this topic, 8 questions](https://monte.markets/practice/drill/?topic=mreg&n=8)
