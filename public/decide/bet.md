# Implied probability calculator: what do these odds say?

> Turn a betting line into a chance, find the bookmaker's cut and a sensible stake.

Canonical URL: https://monte.markets/decide/bet/

License: CC BY 4.0, reuse with credit to monte.markets.

[Decide](https://monte.markets/decide/): A bet. Implied probability calculator: turn American, decimal or fractional odds into a chance, take out the bookmaker's vig for the fair odds, and size a Kelly stake.

What it teaches: Implied probability, the overround, expected value and the Kelly criterion.

## How this works, step by step

### 1. Odds are a price, written three ways.

**American** odds center on $100. A minus number is what you risk to win $100: −110 means risk $110 to win $100. A plus number is what $100 wins: +150 means a $100 bet wins $150. **Decimal** odds are what $1 brings back, stake included: 2.50 turns $1 into $2.50. **Fractional** odds are profit over stake: 3/2 wins $3 for every $2.

Formula: decimal = 1 + 100 ÷ |minus odds| · decimal = 1 + plus odds ÷ 100 · decimal = 1 + a/b

### 2. Turn the price into a chance.

Ask: how often would this bet have to win to break even? That is the **implied probability**. A coin flip at even money (+100) needs 50%. At −110 you risk more than you win, so you need to be right 52.38% of the time.

Formula: implied chance = 1 ÷ decimal odds · −110 → 1 ÷ 1.909 = 52.38%

### 3. Add both sides to find the house edge.

Real chances for the two sides add to exactly 100%. A bookmaker’s odds add to more. At −110 on both sides they add to 104.76%. The extra 4.76% is the **margin**, the price of playing. If money comes in evenly on both sides, the book keeps about 4.5 cents of every dollar bet no matter who wins.

Formula: margin = implied A + implied B − 100% · fair chance = implied ÷ (implied A + implied B)

### 4. Compare with your own chance.

Expected value, or **EV**, is what a bet is worth on average if you could make it many times. You win the profit with your chance, and lose your stake the rest of the time. A bet is only worth making when your chance is above the implied one. At −110 with a true 50%, every $100 bet loses $4.55 on average.

Formula: EV per $100 = your chance × profit − (1 − your chance) × $100

### 5. How much to stake.

The **Kelly fraction** is the share of your money a careful bettor would stake. It grows fastest over many bets, and a bad run never wipes you out. Bigger edge, bigger stake. No edge, no bet. Your own chance is only a guess, and a wrong guess makes full Kelly far too big. Most pros stake half of it: **half Kelly**.

Formula: Kelly = (b × p − (1 − p)) ÷ b, where b = decimal odds − 1 · p = 0.55 at +100 gives (0.55 − 0.45) ÷ 1 = 10%

Long shots are where the margin hides best. Across many sports, very long odds tend to pay less than their real chance deserves, which researchers call the **favorite-longshot bias**. A +2000 line implies 4.76%. If the real chance is 3%, every $100 bet is worth −$37 on average.

For learning, not financial, medical or betting advice.

Next decision: [Prediction market calculator: what does 30¢ mean?](https://monte.markets/decide/market.md)

[All 9 decisions](https://monte.markets/decide/)
