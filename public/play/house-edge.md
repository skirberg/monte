# Roulette simulator: the house edge

> Spin roulette a thousand times and see why the house never loses.

Canonical URL: https://monte.markets/play/house-edge/

License: CC BY 4.0, reuse with credit to monte.markets.

Game 5 of 10 in [Play](https://monte.markets/play/).

## What’s going on

A European wheel has 37 pockets: 18 red, 18 black and one green 0. A $1 bet on red wins $1 with probability 18/37 and loses $1 with probability 19/37. Its **expected value** is `18/37 − 19/37 = −1/37 ≈ −2.70%` of every dollar bet. The American wheel adds a 00, which makes it `−2/38 ≈ −5.26%`.

A single number pays 35 to 1 and wins 1 time in 37: `35 × 1/37 − 36/37 = −1/37`. Same edge, far more variance. So more of the crowd is still ahead after betting on 17 than on red, though the average loss is the same.

The **law of large numbers** is the casino’s business model. One player’s results swing wildly. The average over millions of spins lands on the edge, and only the casino makes millions of spins.

For learning, not gambling advice.

Learn the idea: [Random variables](https://monte.markets/learn/rv.md)

Next game: [Read the odds](https://monte.markets/play/odds.md)
