# Can you fake a coin?

> Type 50 flips that look random. The streaks will give you away.

Canonical URL: https://monte.markets/play/fake-coin/

License: CC BY 4.0, reuse with credit to monte.markets.

Game 3 of 10 in [Play](https://monte.markets/play/).

## What’s going on

A fair coin switches sides only half the time. Fifty real flips average 25.5 **runs** (unbroken stretches of H or T), and their longest streak averages about 6. Fakes usually switch too often and dodge long streaks, so they come out too tidy.

The verdict is a **hypothesis test**. The null hypothesis is a fair coin with independent flips. The page flips 20,000 real sequences of 50. For switches, longest streak and heads, it counts how often a real coin lands at least as far from average as you did, either way. That share is a two-sided p-value.

Each test uses a 2% cutoff, so a truly random sequence gets flagged only about 3% of the time. Passing does not prove you are random; it means the test could not tell.

Learn the idea: [Counting and the binomial](https://monte.markets/learn/count.md)

Next game: [Serve math](https://monte.markets/play/serve.md)
