# When σ is unknown

> When σ is unknown, use s and a t critical value with n − 1 degrees of freedom: x̄ ± t × s ÷ √n.

Canonical URL: https://monte.markets/learn/ci/t-intervals/

License: CC BY 4.0, reuse with credit to monte.markets.

Lesson 5 of 5 in [Confidence intervals and sample size](https://monte.markets/learn/ci.md).

**Question:** You have 10 measurements and only their sample SD, s. Which critical value do you use for 95%?

- 2.58: That's for 99% with a known σ.
- **A t value with 9 degrees of freedom** (right answer): Yes. Estimating σ with s adds uncertainty, so t is a bit bigger than 1.96: about 2.26 for 9 df.
- 1.96: 1.96 assumes you know σ. With s from a small sample, use t.

When σ is unknown, use s and a t critical value with n − 1 degrees of freedom: x̄ ± t × s ÷ √n. The t value is bigger for small samples and approaches 1.96 as n grows.

**Question:** As n gets large, the t critical value for 95%...

- **Gets close to 1.96** (right answer): Yes. With lots of data, s is a good stand-in for σ, so t and z agree.
- Grows without limit: It shrinks toward 1.96.
- Stays at 2.26: 2.26 is for 9 df. It changes with the sample size.

Unknown σ, small sample: t. Big samples: t and z nearly match.

Next: [Drill this topic, 8 questions](https://monte.markets/practice/drill/?topic=ci&n=8)
