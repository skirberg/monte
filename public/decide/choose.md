# Monte Carlo calculator: which option should I choose?

> Give each option a worst, likely and best case. We play out 10,000 futures and count which one wins.

Canonical URL: https://monte.markets/decide/choose/

License: CC BY 4.0, reuse with credit to monte.markets.

[Decide](https://monte.markets/decide/): Monte Carlo. A free Monte Carlo simulation calculator for a choice. Give each option a worst, likely and best case, and 10,000 simulated futures count how often each comes out ahead.

What it teaches: Monte Carlo simulation, the triangular distribution and percentiles.

## How this works, step by step

### 1. Give a range, not one number.

For each option you type three numbers: the worst it could reasonably be, the most likely, and the best. Nobody knows next year’s bonus. Most people can say “somewhere between nothing and $15,000, probably about $8,000.” That is all this needs.

### 2. Turn the range into a triangle.

Picture a triangle sitting on the line from worst to best, with its peak over the likely value. Tall parts are common outcomes. The thin ends are rare ones. This is called a **triangular distribution**. It is the simplest shape that respects all three of your numbers.

Formula: For a random u between 0 and 1, with low a, likely c and high b: if u < (c − a)/(b − a), the draw is a + √(u(b − a)(c − a)); otherwise b − √((1 − u)(b − a)(b − c)).

### 3. Play out one possible future.

The computer picks one random value from each triangle. That is one way next year could go. It notes which option came out on top.

### 4. Do it 10,000 times.

One future tells you nothing. Ten thousand of them pile up into a shape, like grains on the board on our home page. This is a **Monte Carlo simulation**, named after the casino, because it runs on chance. It is where this site gets its name.

### 5. Count.

Chance on top is how many of the 10,000 futures each option won. “8 in 10 land between” uses the **10th and 90th percentiles**. Line up all 10,000 draws from worst to best, then read the one a tenth of the way in and the one nine tenths in. Your line is the share of draws on the wrong side of it.

Formula: chance on top = wins ÷ 10,000 · chance past your line = draws past it ÷ 10,000

## Why ranges beat single guesses

A single guess hides how wrong you could be. In the job example both offers have a likely pay near $100,000, so one guess each calls it a tie. The ranges say something different: Job B wins more often, and it is also the only one that can leave you short.

The likely value is not the average either. Product B’s likely profit is $40,000, but its long upside pulls the average to about $97,000, more than twice as much. Planning on one number misses both the risk and the upside. Seeing the whole pile lets you pick the option that fits how much risk you can carry.

Each draw here treats the options as independent. In real life they can move together (a bad economy hurts both jobs), and the triangle is only as good as your three numbers. It is a way to think clearly, not a forecast.

For learning, not financial, medical or betting advice.

Next decision: [Is the extended warranty worth it?](https://monte.markets/decide/warranty.md)

[All 9 decisions](https://monte.markets/decide/)
