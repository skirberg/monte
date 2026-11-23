import type { ReactNode } from "react";
import type { GAMES } from "@/lib/site-data";

/**
 * What's going on in each game: the idea behind it, shown under the game in its "What's going on" fold
 * (components/play/game-shell.tsx). The words live here, not in the pages, so each game's Markdown twin
 * (scripts/lib/markdown.ts) reads the same ones.
 */
export const GAME_EXPLAIN: Record<(typeof GAMES)[number]["slug"], ReactNode> = {
  correlation: (
    <>
      <p>
        <b>r</b> measures how tightly points hug a straight line, from −1 to +1. The sign gives the direction. The size gives the
        tightness, not the steepness. A shallow line through a tight cloud can have a bigger r than a steep line through a loose one.
      </p>
      <p>
        <code>r = Σ(x − x̄)(y − ȳ) / √[Σ(x − x̄)² · Σ(y − ȳ)²]</code>
      </p>
      <p>
        Square it and you get <b>r²</b>, the share of the spread in y that the line explains. An r of 0.5 explains only 25%, which is
        why a moderate correlation looks so messy.
      </p>
      <p>
        Each plot has 60 points. You are scored against the r of those exact 60 points, not the setting used to draw them. After each
        call, the least-squares line appears so you can see what you were judging.
      </p>
    </>
  ),
  "monty-hall": (
    <>
      <p>
        Your first pick has a 1 in 3 chance, and nothing the host does changes that. The other two doors share the remaining 2 in 3.
        The host knows where the car is and always opens a goat. So that whole 2 in 3 ends up behind the one door he leaves closed.
        Switching wins about two games in three.
      </p>
      <p>
        In Bayes terms: <code>P(car behind your door | host shows a goat) = 1/3</code>, so{" "}
        <code>P(car behind the other closed door) = 2/3</code>. The host&rsquo;s choice carries information because he is not opening
        doors at random.
      </p>
      <p>Still not convinced? Picture 100 doors. You pick one, the host opens 98 goats. Would you stay?</p>
      <p>
        You are in good company. Marilyn vos Savant gave this answer in Parade magazine in 1990. About 10,000 readers wrote in,
        nearly 1,000 of them with PhDs, most saying she was wrong. The mathematician Paul Erdős reportedly stayed unconvinced until
        he saw a computer simulation, which is what the button above runs.
      </p>
    </>
  ),
  "fake-coin": (
    <>
      <p>
        A fair coin switches sides only half the time. Fifty real flips average 25.5 <b>runs</b> (unbroken stretches of H or T), and
        their longest streak averages about 6. Fakes usually switch too often and dodge long streaks, so they come out too tidy.
      </p>
      <p>
        The verdict is a <b>hypothesis test</b>. The null hypothesis is a fair coin with independent flips. The page flips 20,000
        real sequences of 50. For switches, longest streak and heads, it counts how often a real coin lands at least as far from
        average as you did, either way. That share is a two-sided p-value.
      </p>
      <p>
        Each test uses a 2% cutoff, so a truly random sequence gets flagged only about 3% of the time. Passing does not prove you are
        random; it means the test could not tell.
      </p>
    </>
  ),
  serve: (
    <>
      <p>
        Treat every point as an independent trial the server wins with probability <b>p</b> (and loses with q = 1 − p). To hold, you
        need 4 points before your opponent gets 3, or you win from deuce.
      </p>
      <p>
        <code>P(hold) = p⁴(1 + 4q + 10q²) + 20p³q³ · p² / (1 − 2pq)</code>
      </p>
      <p>
        The 1, 4 and 10 count the orders that win 4–0, 4–1 or 4–2, with your fourth point last. The 20 counts the orders that
        reach deuce at 3–3. That is the binomial coefficient at work. From deuce you need two points in a row
        before they do, which works out to p² / (1 − 2pq).
      </p>
      <p>
        The set adds alternating serve and a tiebreak at 6–6, so the page computes it exactly with a recursion over every score. At
        p = 0.5 you hold exactly half your games; at 0.6 you hold 73.6%.
      </p>
      <p>
        The player buttons run the model backwards. Jannik Sinner held 92.0% of his service games in 2025 (713 of 775, per the ATP).
        The model says that takes winning about 71.7% of serve points. Opponents held only 67.4% against his return, which the model
        reads as about 57.2% of their serve points. Put the two together and the model gives Sinner about an 89% chance of winning
        any given set.
      </p>
      <p>
        Real points are not perfectly independent (pressure, momentum, fatigue), so treat this as a model, not a forecast. The lesson
        holds anyway: games and sets magnify small edges.
      </p>
    </>
  ),
  "house-edge": (
    <>
      <p>
        A European wheel has 37 pockets: 18 red, 18 black and one green 0. A $1 bet on red wins $1 with probability 18/37 and loses $1
        with probability 19/37. Its <b>expected value</b> is <code>18/37 − 19/37 = −1/37 ≈ −2.70%</code> of every dollar bet. The
        American wheel adds a 00, which makes it <code>−2/38 ≈ −5.26%</code>.
      </p>
      <p>
        A single number pays 35 to 1 and wins 1 time in 37: <code>35 × 1/37 − 36/37 = −1/37</code>. Same edge, far more variance. So
        more of the crowd is still ahead after betting on 17 than on red, though the average loss is the same.
      </p>
      <p>
        The <b>law of large numbers</b> is the casino&rsquo;s business model. One player&rsquo;s results swing wildly. The average
        over millions of spins lands on the edge, and only the casino makes millions of spins.
      </p>
      <p className="text-sm text-ink-muted">For learning, not gambling advice.</p>
    </>
  ),
  odds: (
    <>
      <p>
        <b>American odds.</b> A minus number is how much you risk to win $100; a plus number is how much you win on $100. The implied
        probability is <code>|a| / (|a| + 100)</code> for a favorite and <code>100 / (a + 100)</code> for an underdog. So −150 means 60.0%
        and +150 means 40.0%.
      </p>
      <p>
        <b>Prediction markets</b> are simpler: a contract that pays $1 if the event happens and trades at 63¢ implies a 63% chance.
      </p>
      <p>
        Add both sides of a line and you get more than 100%. On a −110 / −110 line each side implies 52.38%, together 104.76%. That
        extra is the <b>overround</b>; the bookmaker&rsquo;s margin is <code>1 − 1/1.0476 ≈ 4.55%</code>. Divide each side by the total
        to get the fair, no-cut probabilities.
      </p>
      <p>
        A bet has positive <b>expected value</b> only when your probability beats the implied one:{" "}
        <code>EV = p × profit − (1 − p) × stake</code>. At −110 you need to be right 52.38% of the time just to break even.
      </p>
      <p className="text-sm text-ink-muted">Example lines, not live prices. For learning, not betting advice.</p>
    </>
  ),
  "ab-test": (
    <>
      <p>
        Each test compares two conversion rates with a <b>two-proportion z-test</b>:{" "}
        <code>z = (p̂B − p̂A) / √[p̂(1 − p̂)(1/nA + 1/nB)]</code>, where p̂ pools both groups. A p-value under 0.05 is called significant.
      </p>
      <p>
        That 5% promise holds for <b>one</b> look at a sample size you fixed in advance. Check every day and stop the first time p dips
        under 0.05, and you give chance twenty tries to fool you. With no real difference, the simulation shows the false winner rate
        jumping from about 5% to roughly a quarter of all tests.
      </p>
      <p>
        Fixes used in practice: decide the sample size before you start and look once, or use a sequential test built for repeated
        looks. Either way, a significant result you went fishing for is weaker evidence than it looks.
      </p>
    </>
  ),
  "long-run": (
    <>
      <p>
        The <b>arithmetic mean</b> averages the yearly returns. The <b>geometric mean</b> is the rate your money actually compounded at:{" "}
        <code>(Π(1 + rₜ))^(1/n) − 1</code>. The geometric mean is always lower when returns move around, by roughly{" "}
        <code>σ² / 2</code>. For the S&amp;P 500 since 1928 that gap is about 1.8 percentage points a year.
      </p>
      <p>
        The simulation is a <b>bootstrap Monte Carlo</b>. Each future draws real historical years at random, with replacement. Repeat
        2,000 times and read off the percentiles. It keeps every real crash and boom, but it assumes years are independent,
        so it ignores streaks and changing regimes. Treat it as a model, not a forecast.
      </p>
      <p>
        Data: annual total returns from Aswath Damodaran&rsquo;s <i>Historical Returns on Stocks, Bonds and Bills</i> at NYU Stern, updated
        January 5, 2026.
      </p>
      <p className="text-sm text-ink-muted">For learning, not investment advice.</p>
    </>
  ),
  options: (
    <>
      <p>
        A <b>call</b> pays <code>max(S_T − K, 0)</code> at expiry; a <b>put</b> pays <code>max(K − S_T, 0)</code>. To price one, simulate
        the stock under <b>risk-neutral</b> rules: it grows at the interest rate, <code>S_T = S₀ · exp((r − σ²/2)T + σ√T · Z)</code>{" "}
        with Z a standard normal draw. Average the payoffs, discount by <code>e^(−rT)</code>, and you have a Monte Carlo price.
      </p>
      <p>
        <b>Black-Scholes</b> does the same average in closed form:{" "}
        <code>C = S₀N(d₁) − Ke^(−rT)N(d₂)</code>, with <code>d₁ = [ln(S₀/K) + (r + σ²/2)T] / (σ√T)</code> and <code>d₂ = d₁ − σ√T</code>.
        N is the normal CDF from the normal curve topic. At S₀ = K = 100, one year, 5% and σ = 20%, the call is worth $10.45.
      </p>
      <p>
        The Monte Carlo error shrinks like <code>1/√n</code>: four times the paths, half the error. That is why the shaded band narrows
        slowly, and why banks use Monte Carlo for options too complex for a formula.
      </p>
      <p className="text-sm text-ink-muted">A textbook model (constant volatility, no dividends). For learning, not investment advice.</p>
    </>
  ),
  election: (
    <>
      <p>
        A poll of <i>n</i> people estimates a share <i>p</i> with a <b>95% margin of error</b> of about <code>1.96 × √[p(1 − p)/n]</code>. Near a
        50/50 race that is close to <code>1/√n</code>: about ±4.9 points for 400 people, ±3.1 for 1,000 and ±2.0 for 2,500. To halve the
        margin you need four times the people.
      </p>
      <p>
        That headline margin is on each candidate&rsquo;s share. The <b>lead</b>, A minus B, has about twice the margin, because a voter
        who switches adds to one side and takes from the other. A poll of 1,000 is good to about ±6 points on the lead, so a 2-point lead sits
        well inside the noise. With a true 2-point lead, one poll of 1,000 shows the wrong leader about 26% of the time.
      </p>
      <p>
        <b>Averaging</b> polls works like one bigger poll. Five polls of 1,000 act like a single poll of 5,000, so the margin shrinks by √5 and
        the wrong leader rate falls to about 8%. Ten polls bring it near 2%.
      </p>
      <p>
        Saying <b>how sure</b> you are is scored with the <b>Brier score</b>, <code>(outcome − p)²</code>, where outcome is 1 if A wins and 0 if not.
        It is a proper scoring rule: your best average comes from saying exactly what you believe. Shading a 70% hunch up to 95% costs you over
        many races. Chips are the same score moved so that 50% pays nothing: <code>100 × (1 − Brier) − 75</code>.
      </p>
      <p>
        The formula only counts <b>sampling error</b>, the luck of who gets picked. Real polls also miss because of who answers, who actually
        turns out to vote and how questions are worded. Those errors tend to push every poll the same way, so averaging cannot cancel them.
        That is why real elections miss the polls by more than the margin of error says.
      </p>
    </>
  ),
};
