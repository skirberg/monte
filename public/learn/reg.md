# Simple regression

> Regression fits the line with the smallest squared misses. Slope: how much y moves per unit of x. R²: the share of y's variation explained. t-test: does x help?

Canonical URL: https://monte.markets/learn/reg/

License: CC BY 4.0, reuse with credit to monte.markets.

Topic 13 of 14 in [Learn](https://monte.markets/learn/).

## 5 lessons · 3 min each

1. [The line through the points](https://monte.markets/learn/reg/the-line.md)
2. [Residuals: what the line misses](https://monte.markets/learn/reg/residuals.md)
3. [R²: how much the line explains](https://monte.markets/learn/reg/r-squared.md)
4. [Regression isn't symmetric](https://monte.markets/learn/reg/not-symmetric.md)
5. [Stay inside your data](https://monte.markets/learn/reg/extrapolation.md)

## Check yourself

1. Σx = 24, Σy = 36, Σxy = 176, Σx² = 124, n = 6. Slope?
   - Answer: 1.143
   - Why: (6 · 176 − 24 · 36) / (6 · 124 − 24²) = 192 / 168.
2. Intercept?
   - Answer: 1.429
   - Why: ȳ − b₁x̄ = 6 − 1.143(4).
3. Predict sales at 8 units of advertising?
   - Answer: 10.57
   - Why: 1.429 + 1.143 × 8.
4. R² = 87.1% means?
   - Answer: 87.1% of the variation in sales is explained by advertising
5. H₀ for the slope test?
   - Answer: β₁ = 0, no linear relationship
6. t = 5.19, df = 4, critical value 2.776. Decision?
   - Answer: Reject H₀. Sales and advertising are linearly related.
   - Why: p = 0.007 < 0.05. Related, not proof of cause: nobody assigned the ad budgets at random.
7. Residual SD s = 1.16 means?
   - Answer: Points typically sit about 1.16 from the line.
   - Why: Rough 95% band: ± 2 × 1.16. A real prediction interval is wider, since the line itself is uncertain.
8. Confidence vs prediction interval?
   - Answer: CI: the average y at x. PI: one new y, so it is wider
9. Four assumptions on the errors?
   - Answer: Mean zero, constant variance, normal, independent
10. High leverage point?
    - Answer: An x far from the other x values. It can swing the line.
    - Why: A common flag is leverage above 6/n.

## The idea in one page

**Regression** fits the line with the smallest squared misses. **Slope**: how much y moves per unit of x. **R²**: the share of y's variation explained. **t-test**: does x help?

Regression draws the best straight line through a cloud of points, so x can predict y.

- **Pricing**: How much demand drops for every $1 of price.
- **Marketing**: Sales per $1,000 of ad spend, with care about cause and effect.
- **Real estate**: Price per extra square foot.

Everyday example: Does advertising track sales? Six weeks give Sales = 1.43 + 1.14 Adv: each extra unit of ads goes with about 1.14 more units of sales. R² = 87.1%: the line explains most of the scatter. t = 5.19 (p = 0.007): unlikely to be luck alone.

## The trap

Correlation is symmetric; regression is not. Swap x and y and you get a different line. Never predict outside the x range you have.

## Formulas

- Line: ŷ = b₀ + b₁x
- Slope: b₁ = [nΣxy − ΣxΣy] / [nΣx² − (Σx)²]
- Intercept: b₀ = ȳ − b₁x̄
- Fit: SST = SSR + SSE, R² = SSR / SST = 1 − SSE / SST
- Residual SD: s = √(SSE / (n − 2))
- Slope test: t = b₁ / SE(b₁), df = n − 2
- Correlation: r = ±√R², with the sign of the slope
- Remember it: Slope is rise over run. R² is how much scatter the line explains. The t-test asks: is the slope really nonzero?

## Videos and further reading

- [StatQuest: Linear Regression, Clearly Explained](https://www.youtube.com/watch?v=7ArmBVF2dCs): Least squares, R squared, and the p-value for R squared from the F distribution, step by step. Watch it before you start regression. About 27 minutes.
- [jbstatistics: Inference on the Slope (The Formulas)](https://www.youtube.com/watch?v=THzckPB7E8Q): The t test and confidence interval for the slope, and where the standard error comes from. About 7 minutes.
- [Seeing Theory: Regression Analysis](https://seeing-theory.brown.edu/regression-analysis/index.html): Drag points and watch the least squares line chase them. About 10 minutes.

## Next

- [Drill this topic](https://monte.markets/practice/drill/?topic=reg)
- Previous topic: [Hypothesis tests](https://monte.markets/learn/test.md)
- Next topic: [Multiple regression](https://monte.markets/learn/mreg.md)
