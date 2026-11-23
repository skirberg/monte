# The line through the points

> Simple regression fits a straight line ŷ = b₀ + b₁x through the data. b₀ is the intercept (the prediction at x = 0) and b₁ is the slope.

Canonical URL: https://monte.markets/learn/reg/the-line/

License: CC BY 4.0, reuse with credit to monte.markets.

Lesson 1 of 5 in [Simple regression](https://monte.markets/learn/reg.md).

**Question:** A line predicts a house's price: price = 50 + 2 × size (price in $1000s, size in square meters). What does a 100 m² house cost by the line?

- $200k: Don't forget the intercept, 50.
- $52k: Multiply the size by the slope: 2 × 100.
- **$250k** (right answer): Yes. 50 + 2 × 100 = 250.

Simple regression fits a straight line ŷ = b₀ + b₁x through the data. b₀ is the intercept (the prediction at x = 0) and b₁ is the slope. The line is chosen to make the squared vertical misses as small as possible.

**Question:** In the same model, what does the slope, 2, mean?

- Houses cost $2k: The slope is a rate, per square meter.
- Price doubles with size: That would be a multiplicative model. Here each m² adds a fixed amount.
- **Each extra m² adds about $2k to the predicted price** (right answer): Yes. The slope is the change in prediction per one unit of x.

Slope: change in ŷ per unit of x. Intercept: where the line starts.

Next: [Residuals: what the line misses](https://monte.markets/learn/reg/residuals.md)
