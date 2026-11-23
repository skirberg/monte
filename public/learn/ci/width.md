# What makes an interval narrow

> Margin = critical value × σ ÷ √n. It gets narrower with a bigger n or a lower confidence level, and wider with noisier data. Quadrupling n halves it.

Canonical URL: https://monte.markets/learn/ci/width/

License: CC BY 4.0, reuse with credit to monte.markets.

Lesson 3 of 5 in [Confidence intervals and sample size](https://monte.markets/learn/ci.md).

**Question:** You want a narrower interval. Which helps?

- A higher confidence level, like 99%: Higher confidence needs a wider interval to catch the truth more often.
- Rounding the estimate: Rounding doesn't change the uncertainty.
- **A bigger sample** (right answer): Yes. A bigger n shrinks the SE, so the margin shrinks.

Margin = critical value × σ ÷ √n. It gets narrower with a bigger n or a lower confidence level, and wider with noisier data. Quadrupling n halves it.

**Question:** Going from 95% to 99% confidence, with the same data, makes the interval...

- **Wider** (right answer): Yes. To be right more often, you have to cast a wider net. The critical value goes from 1.96 to 2.58.
- Narrower: More confidence costs width.
- Unchanged: The critical value changes with the confidence level.

Confidence and precision trade off. More data is the only way to get both.

Next: [How many do you need?](https://monte.markets/learn/ci/sample-size.md)
