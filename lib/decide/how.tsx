import type { ReactNode } from "react";

/**
 * "How this works, step by step" for each decision on /decide/: plain words first, the formula for each step under it,
 * then a closing note. The tools render them with <HowItWorks> (components/decide/fields.tsx); the words live here so
 * each decision's Markdown twin (scripts/lib/markdown.ts) reads the same ones. One export per tool, so a page's bundle
 * carries only its own.
 */
export type HowStep = { title: string; body: ReactNode; math?: ReactNode };
export type How = { steps: HowStep[]; after?: ReactNode };

/** choose: components/decide/monte-carlo.tsx */
export const HOW_CHOOSE: How = {
  steps: [
    {
      title: "Give a range, not one number.",
      body: (
        <p>
          For each option you type three numbers: the worst it could reasonably be, the most likely, and the best. Nobody knows next year&rsquo;s bonus. Most people can say
          &ldquo;somewhere between nothing and $15,000, probably about $8,000.&rdquo; That is all this needs.
        </p>
      ),
    },
    {
      title: "Turn the range into a triangle.",
      body: (
        <p>
          Picture a triangle sitting on the line from worst to best, with its peak over the likely value. Tall parts are common outcomes. The thin ends are rare ones.
          This is called a <b>triangular distribution</b>. It is the simplest shape that respects all three of your numbers.
        </p>
      ),
      math: (
        <>
          For a random u between 0 and 1, with low a, likely c and high b: if u &lt; (c − a)/(b − a), the draw is a + √(u(b − a)(c − a)); otherwise b − √((1 − u)(b − a)(b − c)).
        </>
      ),
    },
    {
      title: "Play out one possible future.",
      body: <p>The computer picks one random value from each triangle. That is one way next year could go. It notes which option came out on top.</p>,
    },
    {
      title: "Do it 10,000 times.",
      body: (
        <p>
          One future tells you nothing. Ten thousand of them pile up into a shape, like grains on the board on our home page. This is a <b>Monte Carlo simulation</b>, named
          after the casino, because it runs on chance. It is where this site gets its name.
        </p>
      ),
    },
    {
      title: "Count.",
      body: (
        <p>
          Chance on top is how many of the 10,000 futures each option won. &ldquo;8 in 10 land between&rdquo; uses the <b>10th and 90th percentiles</b>. Line up all 10,000
          draws from worst to best, then read the one a tenth of the way in and the one nine tenths in. Your line is the share of draws on the wrong side of it.
        </p>
      ),
      math: <>chance on top = wins ÷ 10,000 · chance past your line = draws past it ÷ 10,000</>,
    },
  ],
  after: (
    <>
      <p className="font-display text-xl font-semibold !text-ink">Why ranges beat single guesses</p>
      <p>
        A single guess hides how wrong you could be. In the job example both offers have a likely pay near $100,000, so one guess each calls it a tie. The ranges say
        something different: Job B wins more often, and it is also the only one that can leave you short.
      </p>
      <p>
        The likely value is not the average either. Product B&rsquo;s likely profit is $40,000, but its long upside pulls the average to about $97,000, more than twice as
        much. Planning on one number misses both the risk and the upside. Seeing the whole pile lets you pick the option that fits how much risk you can carry.
      </p>
      <p>
        Each draw here treats the options as independent. In real life they can move together (a bad economy hurts both jobs), and the triangle is only as good as your
        three numbers. It is a way to think clearly, not a forecast.
      </p>
    </>
  ),
};

/** warranty: components/decide/warranty.tsx */
export const HOW_WARRANTY: How = {
  steps: [
    {
      title: "Two choices, two kinds of cost.",
      body: (
        <p>
          Skip the plan, and most of the time you pay nothing, but now and then you pay the whole bill. Buy it, and you pay a sure price every time, plus a deductible if
          something goes wrong. One is a small certain cost, the other a big uncertain one.
        </p>
      ),
    },
    {
      title: "Average each one over many tries.",
      body: (
        <p>
          Picture 100 people with the same phone. If they all skip the plan, about 20 pay $800: $16,000 in all, or $160 each on average. If they all buy it, each pays $180,
          and 20 of them pay $99 more: $199.80 each. That average is the <b>expected cost</b>.
        </p>
      ),
      math: <>skip = chance × cost · buy = price + chance × deductible · 0.20 × $800 = $160 · $180 + 0.20 × $99 = $199.80</>,
    },
    {
      title: "Find the break-even chance.",
      body: (
        <p>
          There is one chance where both choices cost the same. Above it the plan is the better deal on average; below it, skipping is. Compare it with your honest guess of
          the real chance.
        </p>
      ),
      math: <>break-even = price ÷ (cost − deductible) · $180 ÷ ($800 − $99) = 25.7%</>,
    },
    {
      title: "The seller knows the chance better than you.",
      body: (
        <p>
          A company selling cover has records of how often things break. It sets the price above the average payout, because that gap pays its staff and its profit. So most
          plans cost more than they pay out on average, often far more. The markup shows by how much.
        </p>
      ),
      math: <>markup = price ÷ (chance × (cost − deductible)) · fridge: $150 ÷ (0.08 × $350) = 5.36×</>,
    },
    {
      title: "Buy it anyway when the loss would hurt.",
      body: (
        <p>
          An average only helps if you can live through the bad case and many choices like this even out. A loss you can&rsquo;t absorb breaks that: a car crash with no
          savings, a house fire, a big medical bill. Turning a loss that would ruin you into a small sure cost is worth paying extra for. Small losses you could cover, like a
          phone or a fridge repair, are the ones to cover yourself: keep the money in savings instead.
        </p>
      ),
    },
  ],
  after: (
    <>
      <p className="font-display text-xl font-semibold !text-ink">Check what already covers you</p>
      <p>
        Before buying cover at the counter, check what you already have. Many credit cards include rental car damage cover. New products come with a maker&rsquo;s warranty,
        usually for the first year, and some cards extend it. Home and renters policies can cover theft. Paying twice for the same cover is the worst deal of all.
      </p>
      <p>For learning, not financial advice.</p>
    </>
  ),
};

/** bet: components/decide/bet.tsx */
export const HOW_BET: How = {
  steps: [
    {
      title: "Odds are a price, written three ways.",
      body: (
        <p>
          <b>American</b> odds center on $100. A minus number is what you risk to win $100: −110 means risk $110 to win $100. A plus number is what $100 wins: +150 means a
          $100 bet wins $150. <b>Decimal</b> odds are what $1 brings back, stake included: 2.50 turns $1 into $2.50. <b>Fractional</b> odds are profit over stake: 3/2 wins
          $3 for every $2.
        </p>
      ),
      math: <>decimal = 1 + 100 ÷ |minus odds| · decimal = 1 + plus odds ÷ 100 · decimal = 1 + a/b</>,
    },
    {
      title: "Turn the price into a chance.",
      body: (
        <p>
          Ask: how often would this bet have to win to break even? That is the <b>implied probability</b>. A coin flip at even money (+100) needs 50%. At −110 you risk more
          than you win, so you need to be right 52.38% of the time.
        </p>
      ),
      math: <>implied chance = 1 ÷ decimal odds · −110 → 1 ÷ 1.909 = 52.38%</>,
    },
    {
      title: "Add both sides to find the house edge.",
      body: (
        <p>
          Real chances for the two sides add to exactly 100%. A bookmaker&rsquo;s odds add to more. At −110 on both sides they add to 104.76%. The extra 4.76% is the{" "}
          <b>margin</b>, the price of playing. If money comes in evenly on both sides, the book keeps about 4.5 cents of every dollar bet no matter who wins.
        </p>
      ),
      math: <>margin = implied A + implied B − 100% · fair chance = implied ÷ (implied A + implied B)</>,
    },
    {
      title: "Compare with your own chance.",
      body: (
        <p>
          Expected value, or <b>EV</b>, is what a bet is worth on average if you could make it many times. You win the profit with your chance, and lose your stake the rest
          of the time. A bet is only worth making when your chance is above the implied one. At −110 with a true 50%, every $100 bet loses $4.55 on average.
        </p>
      ),
      math: <>EV per $100 = your chance × profit − (1 − your chance) × $100</>,
    },
    {
      title: "How much to stake.",
      body: (
        <p>
          The <b>Kelly fraction</b> is the share of your money a careful bettor would stake. It grows fastest over many bets, and a bad run never wipes you out. Bigger
          edge, bigger stake. No edge, no bet. Your own chance is only a guess, and a wrong guess makes full Kelly far too big. Most pros stake half of it: <b>half Kelly</b>.
        </p>
      ),
      math: <>Kelly = (b × p − (1 − p)) ÷ b, where b = decimal odds − 1 · p = 0.55 at +100 gives (0.55 − 0.45) ÷ 1 = 10%</>,
    },
  ],
  after: (
    <p>
      Long shots are where the margin hides best. Across many sports, very long odds tend to pay less than their real chance deserves, which researchers call the{" "}
      <b>favorite-longshot bias</b>. A +2000 line implies 4.76%. If the real chance is 3%, every $100 bet is worth −$37 on average.
    </p>
  ),
};

/** market: components/decide/market.tsx */
export const HOW_MARKET: How = {
  steps: [
    {
      title: "A contract pays $1 if it happens.",
      body: (
        <p>
          A prediction market asks a yes or no question. A Yes contract pays $1 if the answer is yes and nothing if not. People buy and sell these all day, and the price
          moves.
        </p>
      ),
    },
    {
      title: "The price is the crowd's chance.",
      body: (
        <p>
          If a Yes trades at 30¢, the people trading it, together, put the chance near 30%. If they thought it was likelier, someone would pay more. It is the
          crowd&rsquo;s estimate, not a fact. Busy markets on well-known questions are often well calibrated. Small markets, long shots and questions people feel strongly
          about can be off.
        </p>
      ),
      math: <>implied chance = price ÷ 100¢ · 30¢ → 30%</>,
    },
    {
      title: "Compare with your own chance.",
      body: (
        <p>
          If you think the chance is 40% and Yes costs 30¢, then on average each contract pays 40¢ and costs 30¢. That is a 10¢ edge. If you are wrong about your 40%, the
          edge is not there.
        </p>
      ),
      math: <>EV per Yes = your chance × 100¢ − price − fee · EV per No = (1 − your chance) × 100¢ − (100¢ − price) − fee</>,
    },
    {
      title: "Count the costs.",
      body: (
        <p>
          Fees come off every contract, so you need a bigger edge than it looks. The price to buy is usually a little above the price to sell, called the <b>spread</b>.
          Your money is also tied up until the question is settled, which can take months. A 2¢ edge on a question that settles in a year is a small return.
        </p>
      ),
      math: <>break-even chance = (price + fee) ÷ 100¢</>,
    },
  ],
};

/** option: components/decide/option-trade.tsx */
export const HOW_OPTION: How = {
  steps: [
    {
      title: "An option is a bet with a deadline.",
      body: (
        <p>
          A <b>call</b> pays if the stock ends above a set price, the <b>strike</b>, on a set day. A <b>put</b> pays if it ends below. You pay a fee up front, the{" "}
          <b>premium</b>. If the stock never gets past the strike, the option expires worth nothing and the premium is gone. That is the most you can lose when you buy one.
        </p>
      ),
    },
    {
      title: "Volatility is how much the stock usually swings.",
      body: (
        <p>
          <b>Implied volatility</b> is the swing traders are pricing in, written as a yearly percent. 30% means a typical move over a year of about 30% of the price, up or
          down. Over a shorter time the swing is smaller, but not in a straight line: it grows with the square root of time. A month is about a twelfth of a year, so its
          swing is about √(1/12), or 29%, of the yearly one.
        </p>
      ),
      math: <>typical move = price × volatility × √(days ÷ 365) · $100 × 0.30 × √(30 ÷ 365) = ±$8.60</>,
    },
    {
      title: "Draw the range of prices at expiry.",
      body: (
        <p>
          The model assumes the stock&rsquo;s daily moves are random, so the price at expiry follows a skewed bell curve called a <b>lognormal</b>. It can never fall below
          $0 but it can rise a lot. The model also assumes no drift: on average the stock goes nowhere. That is the standard &ldquo;risk-neutral&rdquo; shortcut with
          interest rates set to zero, and it is an approximation, not a forecast.
        </p>
      ),
    },
    {
      title: "Read the chance of ending past a price.",
      body: (
        <p>
          The chance of ending above the strike is the area of the curve to the right of it. For the steady stock example, a $110 strike 10% above a $100 price, 30 days out
          at 30% volatility, that area is about 12.5%.
        </p>
      ),
      math: <>P(price at expiry &gt; strike) = Φ(d₂), with d₂ = (ln(price ÷ strike) − σ²T ÷ 2) ÷ (σ√T) and T = days ÷ 365</>,
    },
    {
      title: "Add the premium to find breakeven.",
      body: (
        <p>
          Ending past the strike is not enough. The stock has to go far enough to pay back what you spent. A call breaks even at strike plus premium, a put at strike minus
          premium. The chance of a profit at expiry is the area past that point, which is always smaller than the chance of passing the strike.
        </p>
      ),
      math: <>call breakeven = strike + premium · put breakeven = strike − premium</>,
    },
  ],
  after: (
    <p>
      For learning only. Real options can be sold before expiry, most are on 100 shares, and real stocks drift, jump on news and change their volatility. Real trading also
      has fees and spreads. The game <a href="/play/options/" className="font-medium text-ink underline underline-offset-4">Price an option</a> shows where the premium itself comes from.
    </p>
  ),
};

/** bayes: components/decide/bayes.tsx */
export const HOW_BAYES: How = {
  steps: [
    {
      title: "Start with how common it is.",
      body: (
        <p>
          Before any test, the best guess is how often the thing happens among everything being checked. If 1 in 100 people have a condition, a random person has a 1%
          chance. This is the <b>base rate</b>, and it is the number people forget once a test says yes.
        </p>
      ),
    },
    {
      title: "Split everyone four ways.",
      body: (
        <p>
          Every case is real or not, and the test says yes or no. That makes four groups: real and caught, real but missed, not real but flagged (a <b>false alarm</b>), and
          not real and cleared. Count people instead of percents. Of 1,000 people, 10 have it and 9 of them are caught. And 89 of the 990 others are flagged
          too.
        </p>
      ),
      math: <>caught = base rate × catch rate · false alarms = (1 − base rate) × false-alarm rate</>,
    },
    {
      title: "Look only at the ones flagged.",
      body: (
        <p>
          You got a yes, so you are somewhere in the flagged group. The question is what share of that group is real. In the screening example, 9 real out of 98 flagged:
          about 9%. A test that is right 9 times in 10 still leaves a yes that is wrong 9 times in 10.
        </p>
      ),
      math: <>chance it is real, given a yes = caught ÷ (caught + false alarms) · 0.009 ÷ (0.009 + 0.0891) = 9.2%</>,
    },
    {
      title: "Rare things let false alarms win.",
      body: (
        <p>
          When the thing is rare, the group without it is huge. Even a small false-alarm rate on a huge group makes more false alarms than there are real cases. That is why
          the fraud alert is wrong most of the time while the spam filter is almost always right: spam is common. This way of updating a chance with new evidence is called{" "}
          <b>Bayes&rsquo; rule</b>.
        </p>
      ),
      math: <>P(real | yes) = P(yes | real) × P(real) ÷ P(yes)</>,
    },
    {
      title: "A second test moves it a lot.",
      body: (
        <p>
          After one yes, the chance is about 9%. That becomes the new base rate. A second, separate test that also says yes lifts it to about 50%. That is why a positive
          screening is followed by a different test before anyone decides anything. This assumes the second test&rsquo;s mistakes have nothing to do with the first one&rsquo;s.
        </p>
      ),
      math: <>0.092 × 0.9 ÷ (0.092 × 0.9 + 0.908 × 0.09) = 50.3%</>,
    },
  ],
  after: (
    <>
      <p className="font-display text-xl font-semibold !text-ink">The words doctors use</p>
      <p>
        How often a test catches a real case is its <b>sensitivity</b>. How often it clears a case that is not real is its <b>specificity</b>, which is 100% minus the
        false-alarm rate. The chance a yes is real is the <b>positive predictive value</b>.
      </p>
      <p>
        The base rate depends on who gets tested. People who already have symptoms start from a much higher base rate than everyone screened, so the same yes
        means more. For learning only, not medical advice: a doctor reads a result with everything else they know about you.
      </p>
    </>
  ),
};

/** abtest: components/decide/ab-test.tsx */
export const HOW_ABTEST: How = {
  steps: [
    {
      title: "Split people at random.",
      body: (
        <p>
          Show the old version to some people and the new one to others, decided by a coin flip for each person. Random splitting is what makes the two groups alike in
          everything except the change. If A ran on Monday and B on Saturday, you would be testing the day, not the button.
        </p>
      ),
    },
    {
      title: "Compare the rates.",
      body: (
        <p>
          Each version&rsquo;s rate is how many acted out of how many saw it. The <b>lift</b> is how much bigger B&rsquo;s rate is, as a share of A&rsquo;s. Going from 4% to
          5% is a 1 point gap, and a 25% lift.
        </p>
      ),
      math: <>rate = conversions ÷ visitors · lift = (B − A) ÷ A</>,
    },
    {
      title: "Ask: could luck alone do this?",
      body: (
        <p>
          Even two identical versions never get identical rates: people are random. The <b>z test</b> measures the gap in units of the wobble you would expect by chance. A
          z near 0 is ordinary wobble. Past about 2, it is rare for luck alone.
        </p>
      ),
      math: <>pooled rate p = (conversions A + B) ÷ (visitors A + B) · z = (B − A) ÷ √(p(1 − p)(1/visitors A + 1/visitors B))</>,
    },
    {
      title: "Read the p-value.",
      body: (
        <p>
          The <b>p-value</b> answers one question: if the change did nothing, how often would a gap at least this big show up? Under 5% is called{" "}
          <b>statistically significant</b>. It is not the chance that B is better, and it says nothing about whether the lift is big enough to matter.
        </p>
      ),
      math: <>p = 2 × Φ(−|z|), where Φ is the bell curve&rsquo;s area to the left · z = 2.38 gives p = 1.7%</>,
    },
    {
      title: "Give a range, not one number.",
      body: <p>The gap you saw is one draw. The 95% range is where the real gap probably sits. If the range crosses zero, B could be no better, or even worse.</p>,
      math: <>B − A ± 1.96 × √(A(1 − A) ÷ visitors A + B(1 − B) ÷ visitors B)</>,
    },
    {
      title: "Count how many you need.",
      body: (
        <p>
          Small lifts need many people. To catch a given lift 8 times in 10 (80% <b>power</b>) at the 5% level, use the count below. Going from 10% to 12% takes about 3,841
          people per version. Half the lift takes about four times as many.
        </p>
      ),
      math: <>n per version = (1.96 × √(2p̄(1 − p̄)) + 0.84 × √(A(1 − A) + B(1 − B)))² ÷ (B − A)², with p̄ = (A + B) ÷ 2</>,
    },
  ],
  after: (
    <>
      <p className="font-display text-xl font-semibold !text-ink">Don&rsquo;t peek and stop</p>
      <p>
        Decide how many people you need before you start, and stop there. Checking every day and stopping the moment B looks ahead turns luck into a &ldquo;win&rdquo; far
        more often than 5% of the time.
      </p>
      <p>
        And a real lift can still be too small to be worth the cost of the change. The range tells you how big it could be; whether that is worth it is your call.
      </p>
    </>
  ),
};

/** goal: components/decide/goal.tsx */
export const HOW_GOAL: How = {
  steps: [
    {
      title: "Start with a guess about returns.",
      body: (
        <p>
          You give two numbers: the average yearly return, and how much a typical year swings around it, called <b>volatility</b>. Both are assumptions, not facts. A savings
          account pays a steady rate. A stock fund might average 7% over decades, but any single year can be up 25% or down 30%.
        </p>
      ),
    },
    {
      title: "Play out one month.",
      body: (
        <p>
          Each month the balance grows by a random amount: usually a little, sometimes a lot, sometimes it shrinks. Then your monthly saving goes in. The random growth is set
          up so that, on average, a year grows by exactly your average return.
        </p>
      ),
      math: (
        <>
          next = balance × e^(μ + s × z) + monthly · s = volatility ÷ √12 · μ = ln(1 + return) ÷ 12 − s² ÷ 2 · z is a random draw from the bell curve
        </>
      ),
    },
    {
      title: "Repeat for every month, then 5,000 times.",
      body: (
        <p>
          Twenty years is 240 months, so one future is 240 random steps. That is one way things could go. Play it out 5,000 times and the futures spread into a fan: narrow at
          the start, wider every year, because surprises pile up. This is a <b>Monte Carlo simulation</b>.
        </p>
      ),
    },
    {
      title: "Read the fan.",
      body: (
        <p>
          At every year, line up the 5,000 balances from lowest to highest. A tenth of the way in is the bad case, the middle is the middle, and nine tenths in is the good
          case. The shaded band holds 8 futures in 10. Your chance of reaching the goal is the share of futures that end at or above it.
        </p>
      ),
      math: <>chance of reaching the goal = futures ending at or above it ÷ 5,000</>,
    },
    {
      title: "The average is not the typical.",
      body: (
        <p>
          Big swings help a few futures a lot and hurt many a little, so the average sits above the middle. In the riskier example the average ends near $201,000, right at the
          goal. Yet only about 1 in 3 futures get there, and the middle one ends near $140,000. Plan on the middle and the bad case, not the average.
        </p>
      ),
      math: <>average final = start × (1 + return)^years + monthly × (g^months − 1) ÷ (g − 1), with g = (1 + return)^(1/12)</>,
    },
  ],
  after: (
    <>
      <p className="font-display text-xl font-semibold !text-ink">What this leaves out</p>
      <p>
        These are made-up assumptions, and past returns don&rsquo;t promise future ones. Real markets have worse crashes than this model draws, and good and bad years tend
        to bunch together. There are no fees, taxes or inflation here, and every month&rsquo;s saving goes in without fail.
      </p>
      <p>
        Use it to see how the range widens with risk and with time, and how much a bigger monthly saving moves the bad case. For learning, not financial advice.
      </p>
    </>
  ),
};

/** staffing: components/decide/staffing.tsx */
export const HOW_STAFFING: How = {
  steps: [
    {
      title: "Arrivals are random, even when the average is steady.",
      body: (
        <p>
          60 customers an hour on average does not mean one a minute. Some hours bring 50, some 70, because each person decides on their own when to come. When many people
          each have a small chance of turning up, the count in an hour follows the <b>Poisson distribution</b>. It needs only one number: the average.
        </p>
      ),
      math: <>P(exactly k arrive) = e^(−λ) × λ^k ÷ k!, where λ is the average per hour</>,
    },
    {
      title: "Count what the team can serve.",
      body: <p>Capacity is the number of people working times how many each one serves in an hour, rounded down to whole arrivals.</p>,
      math: <>capacity = staff × served per person · 3 baristas × 25 = 75 an hour</>,
    },
    {
      title: "Add up the hours that bring too many.",
      body: (
        <p>
          The chance of too many is the share of hours where more arrive than the team can serve. Add up the Poisson chances for every count up to capacity, and take that from
          100%.
        </p>
      ),
      math: <>P(too many) = 1 − P(k ≤ capacity) · coffee rush: P(more than 75 when λ = 60) = 2.6%</>,
    },
    {
      title: "Pick the fewest that keep it rare.",
      body: (
        <p>
          Try 1 person, then 2, then 3, and stop at the first team whose chance of too many is under your bar. How rare is rare enough is a judgment: a coffee line once a
          week is fine, a waiting room in an emergency is not.
        </p>
      ),
    },
    {
      title: "Busy is not the same as fine.",
      body: (
        <p>
          <b>Utilization</b> is how much of the time each person is working: arrivals over capacity. Over 100%, the line grows without end. Even under 100%, arrivals bunch
          up, so people wait. Past about 85%, waits get long fast. That is the main lesson of queueing theory.
        </p>
      ),
      math: <>busy = arrivals ÷ capacity · 60 ÷ 75 = 80%</>,
    },
  ],
  after: (
    <>
      <p className="font-display text-xl font-semibold !text-ink">What this counts, and what it doesn&rsquo;t</p>
      <p>
        This counts hours, not waits. Someone not served in a busy hour spills into the next one. And an hour with room to spare still has a line if everyone
        arrives in the same ten minutes. A full waiting-line model, called <b>Erlang C</b>, uses how long each person takes to find how long people wait.
      </p>
      <p>
        Real rushes are lumpier than Poisson. A bus pulls in, a class lets out, a storm knocks out the network, and arrivals come in bursts. Plan on your busiest hour, and
        leave room.
      </p>
    </>
  ),
};
