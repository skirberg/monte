# Adjusted R²

> R² rises with every variable you add, useful or not. Adjusted R² charges a penalty for each one, so it only rises if the new variable earns its place.

Canonical URL: https://monte.markets/learn/mreg/adjusted-r-squared/

License: CC BY 4.0, reuse with credit to monte.markets.

Lesson 4 of 5 in [Multiple regression](https://monte.markets/learn/mreg.md).

**Question:** You add a column of random numbers to a regression. What happens to R²?

- It goes down: Plain R² can only stay the same or rise.
- It stays exactly the same: It almost always creeps up by chance.
- **It goes up a little** (right answer): Yes. Plain R² never goes down when you add a variable, even a useless one.

R² rises with every variable you add, useful or not. Adjusted R² charges a penalty for each one, so it only rises if the new variable earns its place.

**Question:** Adding a variable raises R² from 0.70 to 0.71 but lowers adjusted R² from 0.69 to 0.68. Keep it?

- Only if it's significant: Here adjusted R² fell, which is a sign it isn't helping.
- **No** (right answer): Yes, right: adjusted R² says the variable isn't pulling its weight.
- Yes, R² went up: Plain R² always goes up. Adjusted R² is the fair judge.

Compare models with adjusted R², not plain R².

Next: [When predictors overlap](https://monte.markets/learn/mreg/multicollinearity.md)
