# Don't peek

> Run an A/B test where nothing changed. Watch fake winners appear.

Canonical URL: https://monte.markets/play/ab-test/

License: CC BY 4.0, reuse with credit to monte.markets.

Game 7 of 10 in [Play](https://monte.markets/play/).

## What’s going on

Each test compares two conversion rates with a **two-proportion z-test**: `z = (p̂B − p̂A) / √[p̂(1 − p̂)(1/nA + 1/nB)]`, where p̂ pools both groups. A p-value under 0.05 is called significant.

That 5% promise holds for **one** look at a sample size you fixed in advance. Check every day and stop the first time p dips under 0.05, and you give chance twenty tries to fool you. With no real difference, the simulation shows the false winner rate jumping from about 5% to roughly a quarter of all tests.

Fixes used in practice: decide the sample size before you start and look once, or use a sequential test built for repeated looks. Either way, a significant result you went fishing for is weaker evidence than it looks.

Learn the idea: [Confidence intervals](https://monte.markets/learn/ci.md)

Next game: [The long run](https://monte.markets/play/long-run.md)
