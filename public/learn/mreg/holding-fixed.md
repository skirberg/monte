# Holding the others fixed

> A coefficient in multiple regression is the change in ŷ for one unit of that x, with the other x's held fixed.

Canonical URL: https://monte.markets/learn/mreg/holding-fixed/

License: CC BY 4.0, reuse with credit to monte.markets.

Lesson 2 of 5 in [Multiple regression](https://monte.markets/learn/mreg.md).

**Question:** In price = 40 + 1.5 × size + 20 × garage, what does 20 mean?

- **A garage adds about $20k, comparing houses of the same size** (right answer): Yes. Each coefficient compares houses that match on the other variables.
- Garages cost $20k to build: The model describes prices in the data, not building costs.
- 20% of houses have garages: Coefficients are effects on the prediction, not shares.

A coefficient in multiple regression is the change in ŷ for one unit of that x, with the other x's held fixed. That's why it can differ from the slope you'd get using that x alone.

**Question:** Alone, bedrooms have a big positive slope on price. With size added, the bedroom slope shrinks. Why?

- The model broke: This is normal when predictors overlap.
- Bedrooms stopped mattering to buyers: Buyers didn't change. The model is separating overlapping effects.
- **Bedrooms were standing in for size** (right answer): Yes. Bigger houses have more bedrooms. Once size is in, bedrooms add less on their own.

Adding a variable can change other slopes. That's the model untangling what overlaps.

Next: [Fixed in the math, not the world](https://monte.markets/learn/mreg/not-a-promise.md)
