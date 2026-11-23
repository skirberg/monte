# Serve math

> Real 2025 ATP hold rates. See how a small edge on serve points wins sets.

Canonical URL: https://monte.markets/play/serve/

License: CC BY 4.0, reuse with credit to monte.markets.

Game 4 of 10 in [Play](https://monte.markets/play/).

## What’s going on

Treat every point as an independent trial the server wins with probability **p** (and loses with q = 1 − p). To hold, you need 4 points before your opponent gets 3, or you win from deuce.

`P(hold) = p⁴(1 + 4q + 10q²) + 20p³q³ · p² / (1 − 2pq)`

The 1, 4 and 10 count the orders that win 4–0, 4–1 or 4–2, with your fourth point last. The 20 counts the orders that reach deuce at 3–3. That is the binomial coefficient at work. From deuce you need two points in a row before they do, which works out to p² / (1 − 2pq).

The set adds alternating serve and a tiebreak at 6–6, so the page computes it exactly with a recursion over every score. At p = 0.5 you hold exactly half your games; at 0.6 you hold 73.6%.

The player buttons run the model backwards. Jannik Sinner held 92.0% of his service games in 2025 (713 of 775, per the ATP). The model says that takes winning about 71.7% of serve points. Opponents held only 67.4% against his return, which the model reads as about 57.2% of their serve points. Put the two together and the model gives Sinner about an 89% chance of winning any given set.

Real points are not perfectly independent (pressure, momentum, fatigue), so treat this as a model, not a forecast. The lesson holds anyway: games and sets magnify small edges.

Learn the idea: [Counting and the binomial](https://monte.markets/learn/count.md)

Next game: [The house edge](https://monte.markets/play/house-edge.md)
