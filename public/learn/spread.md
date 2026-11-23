# How spread out is it

> Range is biggest minus smallest. Standard deviation is the typical distance from the average; in finance, risk. Empirical rule: on hill-shaped data, 68% fall within 1 SD, 95% within 2.

Canonical URL: https://monte.markets/learn/spread/

License: CC BY 4.0, reuse with credit to monte.markets.

Topic 3 of 14 in [Learn](https://monte.markets/learn/).

## 5 lessons · 3 min each

1. [Same average, different ride](https://monte.markets/learn/spread/why-spread.md)
2. [The range sees only the ends](https://monte.markets/learn/spread/range.md)
3. [The typical distance from the mean](https://monte.markets/learn/spread/standard-deviation.md)
4. [Why a sample divides by n − 1](https://monte.markets/learn/spread/n-minus-one.md)
5. [How many SDs away](https://monte.markets/learn/spread/z-scores.md)

## Check yourself

1. Range of 42, 57, 61, 38, 75, 12?
   - Answer: 63
   - Why: 75 minus 12. One extreme value sets the whole range.
2. Range of −40, −25, 8, 15?
   - Answer: 55
   - Why: 15 minus −40. Never negative.
3. Problem with range?
   - Answer: One outlier sets it, it ignores the middle, and it grows with n.
4. Why square the gaps from the mean?
   - Answer: Negatives cancel positives: −3 + 0 + 3 = 0.
   - Why: Those are the gaps for 4, 7, 10.
5. Why divide by n − 1?
   - Answer: A sample hugs its own average and looks too tight; n − 1 nudges the variance back up.
   - Why: 4, 7, 10: sample 18 ÷ 2 = 9, population 18 ÷ 3 = 6.
6. Can SD be negative?
   - Answer: No. Zero only if every value is identical.
7. Mean 400, SD 50: where do 95% of days land?
   - Answer: 300 to 500
   - Why: Two SD each way.
8. What share of days sell more than 450?
   - Answer: 16%
   - Why: 32% sit outside 1 SD, half of them on top.
9. When does the empirical rule fail?
   - Answer: Skewed, bimodal or outlier-heavy data. Market returns have fat tails.
10. Six sigma in one line?
    - Answer: A quality target of about 3.4 defects per million.
    - Why: That figure assumes the average drifts 1.5 SD. A perfectly centered normal process would have about 2 per billion past 6 SD.

## The idea in one page

**Range** is biggest minus smallest. **Standard deviation** is the typical distance from the average; in finance, **risk**. **Empirical rule**: on hill-shaped data, 68% fall within 1 SD, 95% within 2.

Two routes average 30 minutes. One always takes 30; the other, 15 to 60. SD is why you're late.

- **Finance**: Volatility is the SD of returns.
- **Quality**: A machine right on average but swinging a lot still makes bad parts.
- **Comparing**: A z score shows how unusual a value is, whatever its units.

Tennis example: Your first serve averages 115 mph with an SD of 5. About two thirds land between 110 and 120, 95% between 105 and 125. A 132 mph serve is over 3 SD out: a radar glitch, or something changed.

## The trap

Same range, different spread. 10, 50, 50, 50, 90 and 10, 10, 50, 90, 90 both span 80, but SDs of about 28 and 40. Range sees only the ends.

## Formulas

- Range: max − min
- Population variance: σ² = Σ(y − μ)² / N
- Sample variance: s² = Σ(y − ȳ)² / (n − 1)
- Shortcut: s² = [Σy² − (Σy)² / n] / (n − 1)
- Standard deviation: s = √s²
- Coefficient of variation: CV = s / x̄
- Empirical rule: x̄ ± 1s holds 68%, x̄ ± 2s holds 95%, x̄ ± 3s holds 99.7%
- Remember it: My Desk Shows Some Daily Risk: mean, distance, square, sum, divide, root. SD is how bumpy the ride is.

## Videos and further reading

- [Crash Course Statistics #4: Measures of Spread](https://www.youtube.com/watch?v=R4yfNi_8Kqw): Range, IQR, variance and standard deviation, and when each one is the right summary. About 12 minutes.
- [Crash Course Statistics #18: Z-Scores and Percentiles](https://www.youtube.com/watch?v=uAxyI_XfqXk): How a z-score puts values from different scales on one ruler, and how it links to percentiles. About 11 minutes.
- [Art of Stat: Explore Quantitative Data](https://istats.shinyapps.io/EDA_quantitative/): Choose Your Own data, type 4, 7, 10 and read the SD, then add 40 and watch the SD jump. About 5 minutes.

## Next

- [Drill this topic](https://monte.markets/practice/drill/?topic=spread)
- Previous topic: [Where is the middle](https://monte.markets/learn/center.md)
- Next topic: [Probability rules](https://monte.markets/learn/prob.md)
