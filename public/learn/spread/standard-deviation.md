# The typical distance from the mean

> The standard deviation is the typical distance of a value from the mean.

Canonical URL: https://monte.markets/learn/spread/standard-deviation/

License: CC BY 4.0, reuse with credit to monte.markets.

Lesson 3 of 5 in [How spread out is it](https://monte.markets/learn/spread.md).

**Question:** Values 6, 8, 10, 12, 14 have a mean of 10. On average, roughly how far is a value from 10?

- 10: 10 is the mean itself, not the distance from it.
- **About 3** (right answer): Yes. The gaps are 4, 2, 0, 2 and 4. The SD of these values is about 3.2.
- 0: The gaps above and below cancel when you add them with signs. That's why the SD squares them first.

The standard deviation is the typical distance of a value from the mean. To get it: find each gap from the mean, square the gaps, add them, divide by n − 1 for a sample, then take the square root.

**Question:** Why square the gaps instead of just adding them?

- Because the formula says so: There's a reason: without squaring, the gaps cancel out.
- **Gaps above and below would cancel to zero** (right answer): Yes. Plus and minus gaps always add to zero around the mean. Squaring makes every gap count.
- To make the number bigger: The square root at the end brings it back to the data's scale.

Variance is the average squared gap. The SD is its square root, back in the data's own units.

Next: [Why a sample divides by n − 1](https://monte.markets/learn/spread/n-minus-one.md)
