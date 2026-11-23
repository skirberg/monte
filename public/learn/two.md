# Two variables: covariance, correlation, portfolios

> Covariance asks whether two things move together. Correlation rescales it from −1 to +1. Mix two assets and any correlation below +1 lowers the mix's risk. That is diversification.

Canonical URL: https://monte.markets/learn/two/

License: CC BY 4.0, reuse with credit to monte.markets.

Topic 6 of 14 in [Learn](https://monte.markets/learn/).

## 5 lessons · 3 min each

1. [Do they move together?](https://monte.markets/learn/two/covariance.md)
2. [Correlation: direction and strength](https://monte.markets/learn/two/correlation.md)
3. [Together isn't because](https://monte.markets/learn/two/not-causation.md)
4. [Mixing two investments](https://monte.markets/learn/two/portfolio-return.md)
5. [Why mixing lowers risk](https://monte.markets/learn/two/diversification.md)

## Check yourself

1. Cov(X, Y) > 0 means?
   - Answer: They tend to move in the same direction
2. Cov = 0: are they independent?
   - Answer: Not necessarily. Y = X² can have zero covariance and total dependence.
   - Why: Zero covariance rules out only a straight-line link.
3. ρ = −1 means?
   - Answer: A perfect negative straight-line relationship
4. 50/50 mix of A and B: expected return?
   - Answer: 9.4%
   - Why: 0.5(8) + 0.5(10.8).
5. Variance of the 50/50 mix?
   - Answer: 32.94, so σ = 5.74%
   - Why: 0.25(36) + 0.25(70.56) + 2(0.5)(0.5)(12.6).
6. Why is the mix less risky than both assets?
   - Answer: ρ is only 0.25: the cross term is small, and the squared weights shrink the rest.
7. V(X − Y)?
   - Answer: V(X) + V(Y) − 2Cov(X, Y)
   - Why: b = 1, c = −1.

## The idea in one page

**Covariance** asks whether two things move together. **Correlation** rescales it from −1 to +1. Mix two assets and any correlation below +1 **lowers the mix's risk**. That is diversification.

Correlation asks one thing: when this goes up, does that tend to go up too?

- **Investing**: Mixing assets that don't move together cuts risk without cutting the average return.
- **Marketing**: Ad spend and sales rising together doesn't prove the ads worked.
- **Data work**: Two columns correlated near 1 tell you the same thing twice.

Finance example: Asset A: E = 8%, σ = 6%. Asset B: E = 10.8%, σ = 8.4%. Covariance 12.6, so ρ = 12.6 / (6 × 8.4) = 0.25. A 50/50 mix returns 9.4% with σ = 5.74%, below either asset alone.

## The trap

Independent means Cov = 0, but Cov = 0 does not mean independent. Y = X² is the classic catch.

## Formulas

- Covariance: Cov(X, Y) = ΣΣ (x − μx)(y − μy) P(x, y) = ΣΣ xy P(x, y) − μx μy
- Correlation: ρ = Cov(X, Y) / (σx σy), between −1 and 1
- Portfolio mean: E(bX + cY) = b · E(X) + c · E(Y)
- Portfolio variance: V(bX + cY) = b²V(X) + c²V(Y) + 2bc · Cov(X, Y)
- If independent: V(bX + cY) = b²V(X) + c²V(Y)
- Remember it: Correlation is why you don't put all your eggs in one basket. The covariance term is where the two talk.

## Videos and further reading

- [StatQuest: Covariance, Clearly Explained](https://www.youtube.com/watch?v=qtaqvPAeEJY): What covariance measures, how it is computed, and why its size is hard to read on its own. About 22 minutes.
- [StatQuest: Pearson's Correlation, Clearly Explained](https://www.youtube.com/watch?v=xZ_z8KWkhXE): How correlation rescales covariance to a number between minus 1 and 1, and what it does not tell you. About 19 minutes.
- [R Psychologist: Interpreting Correlations](https://rpsychologist.com/correlation/): Drag the correlation slider and watch the scatter tighten and loosen. About 5 minutes.

## Next

- [Drill this topic](https://monte.markets/practice/drill/?topic=two)
- Previous topic: [Random variables](https://monte.markets/learn/rv.md)
- Next topic: [Counting and the binomial](https://monte.markets/learn/count.md)
