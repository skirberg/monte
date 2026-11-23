# Multiple regression

> Several x's. Each coefficient is one x's effect holding the others fixed. The F-test checks the whole model, each t-test one x. Multicollinearity: two x's saying the same thing.

Canonical URL: https://monte.markets/learn/mreg/

License: CC BY 4.0, reuse with credit to monte.markets.

Topic 14 of 14 in [Learn](https://monte.markets/learn/).

## 5 lessons · 3 min each

1. [More than one predictor](https://monte.markets/learn/mreg/more-than-one-x.md)
2. [Holding the others fixed](https://monte.markets/learn/mreg/holding-fixed.md)
3. [Fixed in the math, not the world](https://monte.markets/learn/mreg/not-a-promise.md)
4. [Adjusted R²](https://monte.markets/learn/mreg/adjusted-r-squared.md)
5. [When predictors overlap](https://monte.markets/learn/mreg/multicollinearity.md)

## Check yourself

1. Price = 42 + 0.118 SqFt + 6.5 Garage, price in $1,000s. Interpret 0.118.
   - Answer: Each extra square foot adds about $118, holding garage spaces fixed
   - Why: Only inside the range of homes in the data.
2. F = 18.2 vs F(0.05, 2, 12) = 3.89. Decision?
   - Answer: Reject H₀. At least one x has predictive value.
3. SqFt t = 3.40, p = 0.005. Meaning?
   - Answer: Square footage adds predictive value to a model that already has garage spaces
4. Adjusted R² vs R²?
   - Answer: Adjusted R² penalizes extra predictors; it is never above R²
5. VIF > 10 means?
   - Answer: That x is highly correlated with the other x's. Multicollinearity.
6. Signs of multicollinearity?
   - Answer: Wrong signs, big swings when a variable is added, a significant x going insignificant, s rising
7. Dummy variable for a 2-category factor?
   - Answer: One dummy: 1 for a corner lot, 0 otherwise
   - Why: k categories need k − 1 dummies.
8. Sequential SS: SqFt first gives 52.0, Garage adds 8.0. Garage first gives 38.5. What does SqFt add?
   - Answer: 21.5. The total 60.0 is unchanged.
   - Why: Order changes the split, not the total.

## The idea in one page

Several x's. Each coefficient is one x's effect **holding the others fixed**. The **F-test** checks the whole model, each **t-test** one x. **Multicollinearity**: two x's saying the same thing.

Multiple regression asks the fair question: what is x worth with everything else held fixed?

- **Pay**: The pay gap left after accounting for role, level and tenure.
- **Real estate**: Price from size, age and location at once.
- **Forecasting**: Sales from price, season and promotions together.

Everyday example: Home prices on square feet and rooms: each predicts price alone, but together the rooms coefficient can turn negative and insignificant, because bigger homes have more rooms. A correlation of 0.95 means VIF ≈ 10.3: the model can't tell which is working.

## The trap

Holding other variables fixed is about the math, not the world. If size and rooms move together in reality, you can't hold one fixed.

## Formulas

- Model: ŷ = b₀ + b₁x₁ + … + bₖxₖ
- F test: F = MSR / MSE, df (k, n − k − 1)
- t test: t = bⱼ / SE(bⱼ), df = n − k − 1
- Adjusted R²: 1 − [SSE / (n − k − 1)] / [SST / (n − 1)]
- VIF: VIFⱼ = 1 / (1 − Rⱼ²); trouble above 10
- Dummies: k categories need k − 1 indicator columns
- Remember it: A recipe with several ingredients. F asks if the recipe works; each t, if one ingredient earns its place. VIF flags duplicates.

## Videos and further reading

- [StatQuest: Multiple Regression, Clearly Explained](https://www.youtube.com/watch?v=zITIFTsivN8): How the ideas of simple regression carry over to several predictors, ending with an F test of whether the multiple regression beats the simple one. About 5 minutes.
- [Penn State STAT 501, Lesson 8: Categorical Predictors](https://online.stat.psu.edu/stat501/Lesson08.html): Read 8.2 to 8.5 on coding a category as 0/1 dummy variables and reading their coefficients. About 20 minutes.
- [Penn State STAT 501, Lesson 12: Multicollinearity](https://online.stat.psu.edu/stat501/Lesson12.html): Read 12.1 to 12.4: what happens when predictors move together and how variance inflation factors flag it. About 20 minutes.

## Next

- [Drill this topic](https://monte.markets/practice/drill/?topic=mreg)
- Previous topic: [Simple regression](https://monte.markets/learn/reg.md)
