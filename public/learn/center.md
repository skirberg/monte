# Where is the middle

> Mean is the average. Median is the middle once sorted. Mode is the most common. The big idea: one extreme number drags the mean; the median barely moves.

Canonical URL: https://monte.markets/learn/center/

License: CC BY 4.0, reuse with credit to monte.markets.

Topic 2 of 14 in [Learn](https://monte.markets/learn/).

## 5 lessons · 3 min each

1. [The mean is a balance point](https://monte.markets/learn/center/the-mean.md)
2. [The median is the middle person](https://monte.markets/learn/center/the-median.md)
3. [One extreme value](https://monte.markets/learn/center/outliers.md)
4. [The mean chases the tail](https://monte.markets/learn/center/skew.md)
5. [The most common value](https://monte.markets/learn/center/mode.md)

## Check yourself

1. Mean of 15, 7, 22, 7, 29, 11, 5, 0?
   - Answer: 12
   - Why: Add them (96), divide by 8.
2. Median of the same?
   - Answer: 9
   - Why: Sorted: 0 5 7 7 11 15 22 29. Average the middle two, 7 and 11.
3. Mode of 40, 55, 45, 70, 55, 60, 40, 35?
   - Answer: Bimodal: 40 and 55
   - Why: Both appear twice.
4. Home prices, mean or median?
   - Answer: Median
   - Why: A few mansions blow up the mean.
5. Right skew: order?
   - Answer: Mode, then median, then mean
   - Why: The tail pulls the mean toward it.
6. Why trim a mean?
   - Answer: To stop outliers pulling it: drop the top and bottom 5%, average the rest.
   - Why: Useful for heavy tails, like incomes or claim sizes.
7. Fund A averages 6% a year, fund B 14%. Which is better?
   - Answer: Can't say yet. You need the risk.
   - Why: The average hides how bumpy the ride is. That is the next topic.

## The idea in one page

**Mean** is the average. **Median** is the middle once sorted. **Mode** is the most common. The big idea: **one extreme number drags the mean; the median barely moves.**

The mean is where a seesaw balances. The median is the person standing in the middle of the line.

- **Prices**: Home prices are quoted as medians because a few mansions drag the mean up.
- **Operations**: Plan totals with the mean delivery time; describe the typical order with the median.
- **Revenue**: A few big spenders pull up average revenue per user. Check the median.

Tennis example: Ranking points in the top 100: a few players hold huge totals, so the mean sits far above the median. For a typical top-100 player, use the median.

## The trap

Duplicates count. In 15, 7, 22, 7, 29, 11, 5, 0 the 7 appears twice, and both stay in the sorted list.

## Formulas

- Mean: x̄ = Σx / n for a sample, μ = Σx / N for a population
- Median: Sort, take the middle; average the two middles if n is even
- Mode: Most frequent value; none if all differ, bimodal if two tie
- Skew: Right skew: mode < median < mean. Left skew: mean < median < mode.
- Remember it: Mean is average salary with the boss in the room. Median is what the typical person makes. The mean chases the tail.

## Videos and further reading

- [Crash Course Statistics #3: Mean, Median, and Mode](https://www.youtube.com/watch?v=kn83BA7cRNM): Mean, median and mode, and why a skewed tail drags the mean but not the median. About 11 minutes.
- [Art of Stat: Mean vs. Median](https://istats.shinyapps.io/MeanvsMedian/): Pick a right skewed sample, then click in the gray area to add one far out point and watch which number moves. About 5 minutes.
- [Khan Academy: Measuring center](https://www.khanacademy.org/math/statistics-probability/summarizing-quantitative-data/mean-median-basics): Short videos, then the practice set on mean and median. About 15 minutes.

## Next

- [Drill this topic](https://monte.markets/practice/drill/?topic=center)
- Previous topic: [Data and sampling](https://monte.markets/learn/data.md)
- Next topic: [How spread out is it](https://monte.markets/learn/spread.md)
