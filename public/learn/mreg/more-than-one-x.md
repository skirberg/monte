# More than one predictor

> Multiple regression fits ŷ = b₀ + b₁x₁ + b₂x₂ + .... Each slope is the change in ŷ for one unit of that x, holding the other x's fixed.

Canonical URL: https://monte.markets/learn/mreg/more-than-one-x/

License: CC BY 4.0, reuse with credit to monte.markets.

Lesson 1 of 5 in [Multiple regression](https://monte.markets/learn/mreg.md).

**Question:** House price depends on size and location. Why use both in one model?

- To make R² look bigger: R² does go up, but that's not the point.
- Because one variable is never enough: Sometimes one is enough. Use more when they overlap or both matter.
- **To see each one's effect while accounting for the other** (right answer): Yes. Big houses may also sit in pricey areas. One model separates the two.

Multiple regression fits ŷ = b₀ + b₁x₁ + b₂x₂ + .... Each slope is the change in ŷ for one unit of that x, holding the other x's fixed.

**Question:** price = 40 + 1.5 × size + 20 × garage (garage is 1 or 0, price in $1000s). A 100 m² house with a garage?

- $190k: That's without the garage.
- $61.5k: Multiply size by its slope: 1.5 × 100.
- **$210k** (right answer): Yes. 40 + 1.5 × 100 + 20 × 1 = 210.

Plug every x into its slot. A 0/1 variable just switches its slope on or off.

Next: [Holding the others fixed](https://monte.markets/learn/mreg/holding-fixed.md)
