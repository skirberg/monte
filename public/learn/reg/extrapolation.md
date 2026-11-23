# Stay inside your data

> Extrapolation means predicting outside the range of x you have data for. The pattern may change out there, so the prediction can be wildly wrong.

Canonical URL: https://monte.markets/learn/reg/extrapolation/

License: CC BY 4.0, reuse with credit to monte.markets.

Lesson 5 of 5 in [Simple regression](https://monte.markets/learn/reg.md).

**Question:** A line fit on children aged 2 to 10 predicts height from age. What does it predict for age 40?

- **Something absurd, like 3 meters** (right answer): Yes. People stop growing. The line only describes the ages it saw.
- A sensible adult height: The line keeps climbing at a child's growth rate.
- Exactly the adult average: The model never saw adults.

Extrapolation means predicting outside the range of x you have data for. The pattern may change out there, so the prediction can be wildly wrong.

**Question:** A sales model was fit on ad budgets from $10k to $50k. Which prediction is safest?

- For $0: Also outside the range. The intercept is often not meaningful.
- **For a $30k budget** (right answer): Yes. It's inside the range the model learned from.
- For $200k: Far outside the data. Returns from ads may level off.

Predict inside the range you measured. Outside it, the line is a guess.

Next: [Drill this topic, 8 questions](https://monte.markets/practice/drill/?topic=reg&n=8)
