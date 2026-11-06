import type { TopicId } from "./data";

/**
 * Guess first: one question at the top of every topic, asked before the lesson explains anything.
 * Learned from Brilliant: "we pretest on the material, letting the learner try to find a solution
 * before learning the procedure." Every choice answers back, so a wrong guess teaches too.
 * Each question is built on the topic's trap, the mistake people make most.
 */
export type Guess = { q: string; options: { text: string; right?: boolean; why: string }[] };

export const GUESS: Record<TopicId, Guess> = {
  data: {
    q: "An app asks its users how happy they are, and 10,000 answer. Is that enough to know how happy all its users are?",
    options: [
      { text: "Yes, 10,000 is plenty", why: "Size isn't the problem. Only people who answer surveys answered, and they can differ from the ones who ignore them. More of them won't fix that." },
      { text: "No, it depends on who answered", right: true, why: "Right. A bigger sample cuts random noise, not bias. A small random sample beats a big self-selected one." },
      { text: "Only if it's over 50% of users", why: "The share doesn't decide it either. What matters is whether the people asked were picked at random." },
    ],
  },
  center: {
    q: "Five people earn $40k, $45k, $50k, $55k and $2 million. Which number best describes a typical one?",
    options: [
      { text: "The mean, about $438k", why: "One huge value drags the mean far from everyone else. Nobody here earns anything like $438k." },
      { text: "The median, $50k", right: true, why: "Right. The median is the middle value once sorted, so one extreme value can't move it much." },
      { text: "They'd be about the same", why: "They would be for evenly spread data. Here one outlier pulls the mean away from the middle." },
    ],
  },
  spread: {
    q: "Two lists both run from 10 to 90. Do they have the same spread?",
    options: [
      { text: "Yes, same range, same spread", why: "The range only looks at the two ends. 10, 50, 50, 50, 90 sits mostly in the middle; 10, 10, 50, 90, 90 sits mostly at the edges." },
      { text: "Not necessarily", right: true, why: "Right. Those two lists have SDs of about 28 and 40. The SD uses every value, not just the ends." },
      { text: "Only if they have the same mean", why: "Both of those lists have a mean of 50 and still spread differently. It's where the values sit between the ends that counts." },
    ],
  },
  prob: {
    q: "A coin flip can't land heads and tails at once. Are heads and tails independent?",
    options: [
      { text: "Yes, they can't both happen", why: "That makes them mutually exclusive, which is the opposite. If you know it landed heads, you know for certain it isn't tails." },
      { text: "No, knowing one tells you the other", right: true, why: "Right. Independent means knowing one tells you nothing about the other. Mutually exclusive events tell you everything." },
      { text: "Only for a fair coin", why: "Fairness changes the chances, not the link. On any coin, heads rules out tails." },
    ],
  },
  rv: {
    q: "A four-sided die shows 1, 2, 3 or 4. What is its expected value?",
    options: [
      { text: "2.5", right: true, why: "Right, even though you can never roll it. The expected value is the long-run average of many rolls, not a result you'll see." },
      { text: "There isn't one, every side is equally likely", why: "Equally likely sides still have an average: (1 + 2 + 3 + 4) ÷ 4 = 2.5." },
      { text: "2 or 3, whichever comes up most", why: "That's the most likely result, which is a different idea. The expected value is the average over many rolls." },
    ],
  },
  two: {
    q: "Y = X² for X running from −3 to 3. Y depends completely on X. What is their correlation?",
    options: [
      { text: "Close to 1", why: "Correlation only measures straight-line links. Y goes down then up as X rises, and those halves cancel out." },
      { text: "0", right: true, why: "Right. Zero correlation means no straight-line link, not no link. A perfect curve can still score 0." },
      { text: "Close to −1", why: "Y falls as X rises on the left half but climbs on the right, so there's no overall straight-line trend." },
    ],
  },
  count: {
    q: "Each of 5 parts fails 10% of the time. What's the chance at least one fails?",
    options: [
      { text: "50%", why: "Adding 10% five times counts overlaps more than once. With 11 parts it would pass 100%, which can't be." },
      { text: "About 41%", right: true, why: "Right. The chance none fail is 0.9⁵ ≈ 0.59, so at least one is 1 − 0.59 ≈ 0.41." },
      { text: "10%", why: "That's the chance for one part. More parts give more chances to fail." },
    ],
  },
  poisson: {
    q: "A help desk averages 3 calls an hour. On average, how many calls come in over 2 hours?",
    options: [
      { text: "3", why: "The rate is per hour. Over a longer window you expect more calls: rescale it." },
      { text: "6", right: true, why: "Right. Twice the time, twice the expected count: λ = 3 × 2 = 6. The window has to match the rate." },
      { text: "1.5", why: "That divides when it should multiply. More time means more calls, not fewer." },
    ],
  },
  normal: {
    q: "Heights average 170 cm with an SD of 10 cm. About what share of people are taller than 190 cm?",
    options: [
      { text: "About 2.5%", right: true, why: "Right. 190 is 2 SDs above the mean. About 95% fall within 2 SDs, so 5% are outside, half of them on top." },
      { text: "About 5%", why: "That's both tails, very short and very tall together. Taller than means one side only." },
      { text: "About 20%", why: "20 cm is 2 SDs, and the bell thins out fast. Only a small sliver lies that far up." },
    ],
  },
  clt: {
    q: "You take 4 times as many measurements. How much does the noise in their average shrink?",
    options: [
      { text: "To a quarter", why: "The noise shrinks with the square root of the sample size, not the size itself. That's dividing by n instead of √n." },
      { text: "By half", right: true, why: "Right. The standard error is σ ÷ √n, and √4 = 2. Four times the data halves the noise." },
      { text: "It doesn't change", why: "Single values stay just as noisy. Their average gets steadier, because highs and lows cancel." },
    ],
  },
  ci: {
    q: "A 95% confidence interval for a mean is 48 to 52. Is there a 95% chance the true mean is in it?",
    options: [
      { text: "Yes, that's what 95% means", why: "The true mean is a fixed number, so it's either in this interval or not. The 95% describes the method." },
      { text: "No, 95% of intervals built this way catch it", right: true, why: "Right. Repeat the sampling and about 95 of every 100 intervals contain the true mean. This one either does or doesn't." },
      { text: "No, it's a 5% chance", why: "The 95% isn't a chance about this one interval in either direction. It's how often the method gets it right." },
    ],
  },
  test: {
    q: "A test gives p = 0.03. Is there a 3% chance the null hypothesis is true?",
    options: [
      { text: "Yes", why: "The p-value assumes the null is true and asks how surprising your data would be. It can't also be the chance the null is true." },
      { text: "No, it's how rare data this extreme would be if the null were true", right: true, why: "Right. 3% is the chance of data at least this extreme when nothing is going on, not the chance nothing is going on." },
      { text: "No, it's a 97% chance the effect is real", why: "That's the same mistake turned around. The p-value says nothing directly about the chance an effect is real." },
    ],
  },
  reg: {
    q: "You fit a line predicting weight from height. If you swap them and predict height from weight, do you get the same line?",
    options: [
      { text: "Yes, just flipped", why: "Each line minimizes errors in a different direction: vertical misses for one, horizontal for the other. They only match when the fit is perfect." },
      { text: "No, a different line", right: true, why: "Right. Correlation is symmetric, regression isn't. Which variable you predict changes the line." },
      { text: "Yes, if the correlation is positive", why: "The sign doesn't matter. Unless the points sit exactly on a line, the two fits differ." },
    ],
  },
  mreg: {
    q: "A model says each extra bedroom adds $10k to a house's price, holding size fixed. Will adding a bedroom to your house add $10k?",
    options: [
      { text: "Yes, that's what the number says", why: "Holding size fixed is something the math does. In real houses bedrooms and size move together, and a bedroom carved out of the same space isn't the same thing." },
      { text: "Not necessarily", right: true, why: "Right. The coefficient compares houses of the same size in the data. It isn't a promise about what happens when you change one house." },
      { text: "No, it adds less, because of taxes", why: "Taxes aren't the reason. The coefficient describes patterns across houses, not cause and effect inside one." },
    ],
  },
};
