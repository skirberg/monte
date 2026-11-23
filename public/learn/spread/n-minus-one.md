# Why a sample divides by n − 1

> The sample mean sits as close as possible to its own data, closer than the true mean does. So gaps measured from it come out a little small.

Canonical URL: https://monte.markets/learn/spread/n-minus-one/

License: CC BY 4.0, reuse with credit to monte.markets.

Lesson 4 of 5 in [How spread out is it](https://monte.markets/learn/spread.md).

**Question:** You measure 4 bottles. To get the sample variance, you add the squared gaps from the sample mean and divide by...

- 4: Dividing by n works for a whole population. For a sample it comes out too small on average.
- 5: That's n + 1. The correction goes the other way.
- **3** (right answer): Yes. A sample divides by n − 1.

The sample mean sits as close as possible to its own data, closer than the true mean does. So gaps measured from it come out a little small. Dividing by n − 1 instead of n makes up for that.

**Question:** When do you divide by N instead of n − 1?

- **When you have every member of the population** (right answer): Yes. With the whole population you know the true mean, so no correction is needed.
- When the sample is large: For big samples the two barely differ, but the rule is about sample versus population.
- Never: With a full population you divide by N.

Greek letters (σ) mean the population; Latin letters (s) mean a sample. Only the sample gets the n − 1.

Next: [How many SDs away](https://monte.markets/learn/spread/z-scores.md)
