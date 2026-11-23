# Bayes' theorem calculator: is this test result real?

> How common the thing is changes what a yes means, often more than the test does.

Canonical URL: https://monte.markets/decide/bayes/

License: CC BY 4.0, reuse with credit to monte.markets.

[Decide](https://monte.markets/decide/): Base rates. Bayes' theorem calculator for a positive test, a fraud alert or a spam flag. See how the base rate changes the chance a yes is real, with 1,000 dots.

What it teaches: Base rates, false positives and Bayes' rule.

## How this works, step by step

### 1. Start with how common it is.

Before any test, the best guess is how often the thing happens among everything being checked. If 1 in 100 people have a condition, a random person has a 1% chance. This is the **base rate**, and it is the number people forget once a test says yes.

### 2. Split everyone four ways.

Every case is real or not, and the test says yes or no. That makes four groups: real and caught, real but missed, not real but flagged (a **false alarm**), and not real and cleared. Count people instead of percents. Of 1,000 people, 10 have it and 9 of them are caught. And 89 of the 990 others are flagged too.

Formula: caught = base rate × catch rate · false alarms = (1 − base rate) × false-alarm rate

### 3. Look only at the ones flagged.

You got a yes, so you are somewhere in the flagged group. The question is what share of that group is real. In the screening example, 9 real out of 98 flagged: about 9%. A test that is right 9 times in 10 still leaves a yes that is wrong 9 times in 10.

Formula: chance it is real, given a yes = caught ÷ (caught + false alarms) · 0.009 ÷ (0.009 + 0.0891) = 9.2%

### 4. Rare things let false alarms win.

When the thing is rare, the group without it is huge. Even a small false-alarm rate on a huge group makes more false alarms than there are real cases. That is why the fraud alert is wrong most of the time while the spam filter is almost always right: spam is common. This way of updating a chance with new evidence is called **Bayes’ rule**.

Formula: P(real | yes) = P(yes | real) × P(real) ÷ P(yes)

### 5. A second test moves it a lot.

After one yes, the chance is about 9%. That becomes the new base rate. A second, separate test that also says yes lifts it to about 50%. That is why a positive screening is followed by a different test before anyone decides anything. This assumes the second test’s mistakes have nothing to do with the first one’s.

Formula: 0.092 × 0.9 ÷ (0.092 × 0.9 + 0.908 × 0.09) = 50.3%

## The words doctors use

How often a test catches a real case is its **sensitivity**. How often it clears a case that is not real is its **specificity**, which is 100% minus the false-alarm rate. The chance a yes is real is the **positive predictive value**.

The base rate depends on who gets tested. People who already have symptoms start from a much higher base rate than everyone screened, so the same yes means more. For learning only, not medical advice: a doctor reads a result with everything else they know about you.

For learning, not financial, medical or betting advice.

Next decision: [A/B test calculator: did my change really work?](https://monte.markets/decide/abtest.md)

[All 9 decisions](https://monte.markets/decide/)
