# Guess the correlation

> Ten scatter plots. Call r by eye. Within 0.10 keeps your streak alive.

Canonical URL: https://monte.markets/play/correlation/

License: CC BY 4.0, reuse with credit to monte.markets.

Game 1 of 10 in [Play](https://monte.markets/play/).

## What’s going on

**r** measures how tightly points hug a straight line, from −1 to +1. The sign gives the direction. The size gives the tightness, not the steepness. A shallow line through a tight cloud can have a bigger r than a steep line through a loose one.

`r = Σ(x − x̄)(y − ȳ) / √[Σ(x − x̄)² · Σ(y − ȳ)²]`

Square it and you get **r²**, the share of the spread in y that the line explains. An r of 0.5 explains only 25%, which is why a moderate correlation looks so messy.

Each plot has 60 points. You are scored against the r of those exact 60 points, not the setting used to draw them. After each call, the least-squares line appears so you can see what you were judging.

Learn the idea: [Two variables and portfolios](https://monte.markets/learn/two.md)

Next game: [Three doors](https://monte.markets/play/monty-hall.md)
