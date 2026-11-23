# What 95% means

> Take many samples, build an interval from each, and about 95 in 100 will contain the true value. That's what 95% confidence means.

Canonical URL: https://monte.markets/learn/ci/what-95-means/

License: CC BY 4.0, reuse with credit to monte.markets.

Lesson 2 of 5 in [Confidence intervals and sample size](https://monte.markets/learn/ci.md).

**Question:** A 95% interval for a mean is 48 to 52. Is there a 95% chance the true mean is in it?

- **No: 95% of intervals made this way catch it** (right answer): Yes. The true mean is fixed. It's the interval that changes from sample to sample.
- Yes: Once computed, this interval either contains the true mean or doesn't. The 95% is about the method.
- No, it's 5%: The 95% describes the method, not this one interval, in either direction.

Take many samples, build an interval from each, and about 95 in 100 will contain the true value. That's what 95% confidence means. It's a statement about the procedure.

**Question:** You build 20 separate 95% intervals from 20 samples. About how many miss the true mean?

- About 5: 5% of 20 is 1, not 5.
- **About 1** (right answer): Yes. 5% of 20 is 1.
- None: Each one has a 5% chance of missing, so over 20, expect about one miss.

Confidence is a long-run hit rate for the method.

Next: [What makes an interval narrow](https://monte.markets/learn/ci/width.md)
