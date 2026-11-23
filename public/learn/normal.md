# The normal curve and z

> The normal is the bell. Measure in SDs from the mean, z = (y − μ) / σ, and any normal becomes the standard one. Area under it is probability.

Canonical URL: https://monte.markets/learn/normal/

License: CC BY 4.0, reuse with credit to monte.markets.

Topic 9 of 14 in [Learn](https://monte.markets/learn/).

## 5 lessons · 3 min each

1. [The bell shape](https://monte.markets/learn/normal/the-bell.md)
2. [68, 95, 99.7](https://monte.markets/learn/normal/68-95-997.md)
3. [From z to a probability](https://monte.markets/learn/normal/z-and-the-table.md)
4. [Above, below and between](https://monte.markets/learn/normal/above-and-between.md)
5. [Going backwards: from a share to a value](https://monte.markets/learn/normal/backwards.md)

## Check yourself

1. Y ~ N(400, 50). P(Y ≤ 525)?
   - Answer: 0.9938
   - Why: z = 2.5.
2. P(Y ≥ 475)?
   - Answer: 0.0668
   - Why: z = 1.5, take the upper tail.
3. P(400 ≤ Y ≤ 475)?
   - Answer: 0.4332
   - Why: 0.9332 − 0.5.
4. How many cups so P(running out) ≤ 0.10?
   - Answer: 464 cups
   - Why: z = 1.28, 400 + 1.28(50).
5. What does a z of −2 mean?
   - Answer: Two SDs below the mean
6. Total area under the curve?
   - Answer: 1, half on each side of the mean
7. Delivery times ~ N(32, 6) minutes: P(more than 35)?
   - Answer: 0.309
   - Why: z = 0.5.
8. 10% of deliveries take longer than?
   - Answer: 39.7 minutes
   - Why: z = 1.28, 32 + 1.28(6).
9. A wait is uniform from 0 to 20 minutes, not a bell. P(over 15)?
   - Answer: 0.25
   - Why: Flat, so the area is a rectangle: (20 − 15) / 20.
10. Mean and SD of that wait?
    - Answer: 10 and 5.77 minutes
    - Why: (a + b) / 2 and (b − a) / √12 = 20 / √12.

## The idea in one page

The **normal** is the bell. Measure in SDs from the mean, **z = (y − μ) / σ**, and any normal becomes the standard one. Area under it is probability.

Add up many small effects and you get the bell.

- **Inventory**: Stock enough for 95% of days: the mean plus 1.645 SDs.
- **Quality**: Parts more than 3 SDs from target get flagged.
- **Percentiles**: Your percentile is the share of the bell's area below you.

Everyday example: A cafe sells 400 coffees a day on average, SD 50. More than 475 is z = 1.5, an area of 6.7%. Stock 464 cups and you run out on about 10% of days (z = 1.28).

## The trap

Some z tables give the area from 0 to z, not from the far left. For less than a positive z, add 0.5; Excel's NORM.S.DIST already starts from the left.

## Formulas

- z score: z = (y − μ) / σ, and back again y = μ + zσ
- Areas: P(Y < y) = Φ(z), P(Y > y) = 1 − Φ(z), P(a < Y < b) = Φ(z of b) − Φ(z of a)
- Excel: NORM.DIST(y, μ, σ, TRUE), NORM.S.DIST(z, TRUE), NORM.INV(p, μ, σ)
- Key z values: 1.28 (90%), 1.645 (95% one-sided), 1.96 (95% two-sided), 2.576 (99%)
- Continuous uniform: Flat from a to b: P(c < Y < d) = (d − c) / (b − a). Mean (a + b) / 2, SD (b − a) / √12
- Remember it: z is how many SDs from average. Memorize 1.28, 1.645, 1.96, 2.576 and every bell question is arithmetic.

## Videos and further reading

- [StatQuest: The Normal Distribution, Clearly Explained](https://www.youtube.com/watch?v=rzFX5NWojp0): What the bell curve shows and how to read it, with the mean setting the center and the standard deviation the width. About 5 minutes.
- [jbstatistics: Introduction to the Continuous Uniform Distribution](https://www.youtube.com/watch?v=izE1dXrH5JA): The flat distribution: its density, mean and variance, plus a worked probability and percentile. About 7 minutes.
- [Art of Stat: Normal Distribution](https://istats.shinyapps.io/NormalDist/): Open Find Probability, type μ, σ and a cutoff, and it shades the area. Check your table answers here. About 5 minutes.

## Next

- [Drill this topic](https://monte.markets/practice/drill/?topic=normal)
- Previous topic: [Poisson](https://monte.markets/learn/poisson.md)
- Next topic: [Sampling and the CLT](https://monte.markets/learn/clt.md)
