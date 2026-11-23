# Data and sampling

> Statistics is using data to make a decision. You can't check everyone, so you check a slice (the sample) and let it speak for the whole group (the population).

Canonical URL: https://monte.markets/learn/data/

License: CC BY 4.0, reuse with credit to monte.markets.

Topic 1 of 14 in [Learn](https://monte.markets/learn/).

## 5 lessons · 3 min each

1. [The pot and the spoonful](https://monte.markets/learn/data/population-and-sample.md)
2. [Describe or infer](https://monte.markets/learn/data/describe-or-infer.md)
3. [Fair picks](https://monte.markets/learn/data/random-sampling.md)
4. [Bigger isn't fairer](https://monte.markets/learn/data/bias.md)
5. [Labels and numbers](https://monte.markets/learn/data/kinds-of-data.md)

## Check yourself

1. Describe vs infer?
   - Answer: Describe: summarize what you have. Infer: use a sample to speak for the bigger group.
   - Why: A team's average age describes. A poll predicting an election infers.
2. A gym surveys 150 of its 2,400 members. Population and sample?
   - Answer: Population: all 2,400 members. Sample: the 150 surveyed.
   - Why: N = 2,400 and n = 150.
3. Random, stratified, or risk-based?
   - Answer: Random is fair to all, stratified makes every group show up, risk-based oversamples the riskiest.
   - Why: An auditor looks hardest at the largest expense claims.
4. 300 expense reports out of 50,000: how do you pick?
   - Answer: Stratify by amount, oversample the big claims, pick at random within each group, then reweight to real shares.
   - Why: 300 small claims tell you nothing about the big ones, where the money is.
5. Zip code: quantitative?
   - Answer: No, qualitative. An average zip code means nothing.
6. Age: discrete or continuous?
   - Answer: Continuous, recorded in whole years.
   - Why: Time flows; we round it.
7. Price, square feet and bedrooms per home?
   - Answer: Multivariate. Three columns per home.

## The idea in one page

Statistics is **using data to make a decision**. You can't check everyone, so you check a slice (the sample) and let it speak for the whole group (the population).

You can't taste the whole pot, so you stir and taste a spoonful. Statistics is learning to stir well.

- **Product**: Survey only your happiest users and the product will always look great.
- **Marketing**: Is segment a label or a number? It decides the chart and the math.
- **Data work**: Before any model, check what each column is and how it was collected.

Tennis example: You want the first-serve percentage of every player on tour (the population). You can't chart every match, so you chart 200 (the sample). The sample's number is p hat; the true one is p.

## The trap

A bigger sample fixes randomness, not bias. 10,000 app users who answered a survey say nothing about the ones who ignore surveys. That is a convenience sample.

## Formulas

- Quantitative or qualitative: Quantitative: numbers you can average. Qualitative: labels.
- Discrete or continuous: Discrete: counted. Continuous: measured.
- Univariate or multivariate: Univariate: one column. Multivariate: several.
- Population and sample: Population: N, μ, σ, p. Sample: n, x̄, s, p̂.
- Remember it: A name is a label, a price is a number. All players on tour are the population; your 200 matches, the sample.

## Videos and further reading

- [Crash Course Statistics #10: Sampling Methods and Bias with Surveys](https://www.youtube.com/watch?v=Rf-fIpB4D50): Simple random, stratified, cluster and convenience samples, and the biases that creep into surveys. Watch it once. About 12 minutes.
- [OpenIntro: Data Basics, observations, variables and data matrices](https://www.youtube.com/watch?v=Mjif8PTgzUs): Numerical versus categorical, discrete versus continuous, and ordinal variables, shown on one real data table. About 4 minutes.
- [Khan Academy: Sampling methods](https://www.khanacademy.org/math/statistics-probability/designing-studies/sampling-methods-stats): Do the Sampling methods practice set and name the method in each question. About 15 minutes.

## Next

- [Drill this topic](https://monte.markets/practice/drill/?topic=data)
- Next topic: [Where is the middle](https://monte.markets/learn/center.md)
