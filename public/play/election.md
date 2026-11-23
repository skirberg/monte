# Election night

> Call the race from polls, then see why a 2-point lead is close to a coin flip.

Canonical URL: https://monte.markets/play/election/

License: CC BY 4.0, reuse with credit to monte.markets.

Game 10 of 10 in [Play](https://monte.markets/play/).

## What’s going on

A poll of *n* people estimates a share *p* with a **95% margin of error** of about `1.96 × √[p(1 − p)/n]`. Near a 50/50 race that is close to `1/√n`: about ±4.9 points for 400 people, ±3.1 for 1,000 and ±2.0 for 2,500. To halve the margin you need four times the people.

That headline margin is on each candidate’s share. The **lead**, A minus B, has about twice the margin, because a voter who switches adds to one side and takes from the other. A poll of 1,000 is good to about ±6 points on the lead, so a 2-point lead sits well inside the noise. With a true 2-point lead, one poll of 1,000 shows the wrong leader about 26% of the time.

**Averaging** polls works like one bigger poll. Five polls of 1,000 act like a single poll of 5,000, so the margin shrinks by √5 and the wrong leader rate falls to about 8%. Ten polls bring it near 2%.

Saying **how sure** you are is scored with the **Brier score**, `(outcome − p)²`, where outcome is 1 if A wins and 0 if not. It is a proper scoring rule: your best average comes from saying exactly what you believe. Shading a 70% hunch up to 95% costs you over many races. Chips are the same score moved so that 50% pays nothing: `100 × (1 − Brier) − 75`.

The formula only counts **sampling error**, the luck of who gets picked. Real polls also miss because of who answers, who actually turns out to vote and how questions are worded. Those errors tend to push every poll the same way, so averaging cannot cancel them. That is why real elections miss the polls by more than the margin of error says.

Learn the idea: [Confidence intervals](https://monte.markets/learn/ci.md)

Next game: [Guess the correlation](https://monte.markets/play/correlation.md)
