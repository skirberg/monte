# Monty Hall problem simulator

> The Monty Hall problem fooled mathematicians. Play it, then run it 1,000 times.

Canonical URL: https://monte.markets/play/monty-hall/

License: CC BY 4.0, reuse with credit to monte.markets.

Game 2 of 10 in [Play](https://monte.markets/play/).

## What’s going on

Your first pick has a 1 in 3 chance, and nothing the host does changes that. The other two doors share the remaining 2 in 3. The host knows where the car is and always opens a goat. So that whole 2 in 3 ends up behind the one door he leaves closed. Switching wins about two games in three.

In Bayes terms: `P(car behind your door | host shows a goat) = 1/3`, so `P(car behind the other closed door) = 2/3`. The host’s choice carries information because he is not opening doors at random.

Still not convinced? Picture 100 doors. You pick one, the host opens 98 goats. Would you stay?

You are in good company. Marilyn vos Savant gave this answer in Parade magazine in 1990. About 10,000 readers wrote in, nearly 1,000 of them with PhDs, most saying she was wrong. The mathematician Paul Erdős reportedly stayed unconvinced until he saw a computer simulation, which is what the button above runs.

Learn the idea: [Probability rules](https://monte.markets/learn/prob.md)

Next game: [Can you fake a coin?](https://monte.markets/play/fake-coin.md)
