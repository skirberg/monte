# Two ways to be wrong

> Type I error: reject H₀ when it's true (a false alarm), with chance α. Type II error: fail to reject H₀ when it's false (a miss), with chance β.

Canonical URL: https://monte.markets/learn/test/two-errors/

License: CC BY 4.0, reuse with credit to monte.markets.

Lesson 4 of 5 in [Hypothesis tests](https://monte.markets/learn/test.md).

**Question:** A drug does nothing, but your test says it works. Which error is that?

- No error: Saying a useless drug works is an error.
- **Type I, a false alarm** (right answer): Yes. Rejecting a true H₀. Its chance is α.
- Type II, a miss: A miss is when there is an effect and you fail to see it.

Type I error: reject H₀ when it's true (a false alarm), with chance α. Type II error: fail to reject H₀ when it's false (a miss), with chance β. Power is 1 − β, the chance of catching a real effect.

**Question:** You lower α from 0.05 to 0.01 and keep the same sample. What happens to Type II errors?

- They become less likely: A stricter cutoff makes it harder to detect anything, real or not.
- No change: The two errors trade off for a fixed sample.
- **They become more likely** (right answer): Yes. Demanding stronger evidence means you miss more real effects.

Fewer false alarms means more misses, unless you get more data. A bigger sample raises power.

Next: [The test statistic](https://monte.markets/learn/test/the-test-statistic.md)
