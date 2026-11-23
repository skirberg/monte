import type { Metadata } from "next";
import { pageAlternates, pageShare } from "@/lib/seo";

/** Every decision on /decide/, in page order. Pages, the index, the sitemap and prev/next all read from here, so they never drift apart. */
export type ToolInfo = {
  id: string;
  /** The question a person brings: the headline on its share card (scripts/make-og.tsx) and in the brand kit. */
  question: string;
  /**
   * The page heading and the link text on /decide/: the words people type into a search box first, then the
   * question (DESIGN.md, "Search words lead").
   */
  heading: string;
  /** The browser tab and the search result's title link: the searched name, then what it answers. */
  title: string;
  /** One line under the heading on the index, and on the share card. */
  line: string;
  /** The idea behind it, shown small above the heading. */
  kicker: string;
  /** The paragraph under the heading on the tool's own page. */
  lede: string;
  /** For search results and share cards. Opens with the words people search. */
  description: string;
  /** For structured data: the ideas this page teaches. */
  teaches: string;
};

export type ToolGroup = { name: string; tools: ToolInfo[] };

export const DISCLAIMER = "For learning, not financial, medical or betting advice.";

export const GROUPS: ToolGroup[] = [
  {
    name: "Choose",
    tools: [
      {
        id: "choose",
        question: "Which option should I choose?",
        heading: "Monte Carlo calculator: which option should I choose?",
        title: "Monte Carlo simulation calculator: which option wins?",
        line: "Give each option a worst, likely and best case; see which wins.",
        kicker: "Monte Carlo",
        lede: "Give each option a worst, likely and best case. We play out 10,000 futures and count which one wins.",
        description: "A free Monte Carlo simulation calculator for a choice. Give each option a worst, likely and best case, and 10,000 simulated futures count how often each comes out ahead.",
        teaches: "Monte Carlo simulation, the triangular distribution and percentiles",
      },
    ],
  },
  {
    name: "Money and risk",
    tools: [
      {
        id: "warranty",
        question: "Should I buy the warranty?",
        heading: "Is the extended warranty worth it?",
        title: "Is the extended warranty worth it? Expected value calculator",
        line: "What each choice costs on average, and when to buy anyway.",
        kicker: "Expected value",
        lede: "What each choice costs on average, and the chance where the plan starts to pay.",
        description: "Is the extended warranty or insurance worth it? An expected value calculator: what each choice costs on average, the break-even chance, and when buying still makes sense.",
        teaches: "Expected value, break-even probability and why insurance exists",
      },
      {
        id: "bet",
        question: "What are these odds really saying?",
        heading: "Implied probability calculator: what do these odds say?",
        title: "Implied probability calculator: no-vig odds and Kelly stake",
        line: "Turn a betting line into a chance and find the bookmaker's cut.",
        kicker: "A bet",
        lede: "Turn a betting line into a chance, find the bookmaker's cut and a sensible stake.",
        description: "Implied probability calculator: turn American, decimal or fractional odds into a chance, take out the bookmaker's vig for the fair odds, and size a Kelly stake.",
        teaches: "Implied probability, the overround, expected value and the Kelly criterion",
      },
      {
        id: "market",
        question: "What does a 30¢ price mean?",
        heading: "Prediction market calculator: what does 30¢ mean?",
        title: "Prediction market calculator: price to probability, after fees",
        line: "A market price is the crowd's chance. Compare yours, after fees.",
        kicker: "A market price",
        lede: "A prediction market price is the crowd's chance. Compare it with yours, after fees.",
        description: "Read a prediction market price, Kalshi or Polymarket style, as a chance. Compare it with yours and see what Yes and No are worth on average after fees.",
        teaches: "Implied probability, expected value and break-even after fees",
      },
      {
        id: "option",
        question: "How likely is the stock to get there?",
        heading: "Option probability calculator: will the stock get there?",
        title: "Option probability calculator: chance of ending past the strike",
        line: "The chance a stock ends past the strike by expiry.",
        kicker: "An option, for learning only",
        lede: "The typical move, the chance of ending past the strike, and where you break even.",
        description: "Option probability calculator: from a stock price, strike, days to expiry and implied volatility, the typical move and the chance of ending past the strike. For learning only.",
        teaches: "The lognormal model, volatility and the chance of finishing past a price",
      },
    ],
  },
  {
    name: "Evidence",
    tools: [
      {
        id: "bayes",
        question: "Is this test result real?",
        heading: "Bayes' theorem calculator: is this test result real?",
        title: "Bayes' theorem calculator: what a positive test really means",
        line: "How common the thing is changes what a yes means.",
        kicker: "Base rates",
        lede: "How common the thing is changes what a yes means, often more than the test does.",
        description: "Bayes' theorem calculator for a positive test, a fraud alert or a spam flag. See how the base rate changes the chance a yes is real, with 1,000 dots.",
        teaches: "Base rates, false positives and Bayes' rule",
      },
      {
        id: "abtest",
        question: "Did my change really work?",
        heading: "A/B test calculator: did my change really work?",
        title: "A/B test calculator: is my result statistically significant?",
        line: "Two versions, two counts: is the gap real or luck?",
        kicker: "A/B test",
        lede: "Two versions, two counts. Is the gap real or luck?",
        description: "A/B test calculator: type the visitors and conversions for A and B. See in plain words whether the gap is significant or luck, how big it could be, and the sample size you need.",
        teaches: "The two-proportion z test, p-values, confidence intervals, sample size and power",
      },
    ],
  },
  {
    name: "Plan",
    tools: [
      {
        id: "goal",
        question: "Will I hit my goal?",
        heading: "Monte Carlo savings calculator: will I hit my goal?",
        title: "Monte Carlo savings calculator: will I hit my goal?",
        line: "Start amount, monthly saving and returns, played out 5,000 ways.",
        kicker: "Monte Carlo",
        lede: "A start, a monthly saving and a guess at returns. We play out 5,000 futures and count how often you get there.",
        description: "Monte Carlo savings calculator: 5,000 simulated futures, month by month, show your chance of reaching a savings goal, the middle outcome and the bad case.",
        teaches: "Monte Carlo simulation, volatility and why the average is not the typical outcome",
      },
      {
        id: "staffing",
        question: "How many people do I need?",
        heading: "Staffing calculator: how many people do I need?",
        title: "Staffing calculator: how many people for a busy hour?",
        line: "The fewest people that keep a busy hour from overflowing.",
        kicker: "Poisson",
        lede: "Customers arrive at random. Find the fewest people that keep a swamped hour rare.",
        description: "Staffing calculator for a busy hour: see how often random arrivals outrun the team, and the fewest people that keep it rare. Built on the Poisson distribution.",
        teaches: "The Poisson distribution, capacity and utilization",
      },
    ],
  },
];

export const TOOLS: ToolInfo[] = GROUPS.flatMap((g) => g.tools);
export const TOOL_IDS = TOOLS.map((t) => t.id);

export const toolHref = (id: string) => `/decide/${id}/`;

export function toolInfo(id: string): ToolInfo & { group: string } {
  const i = TOOLS.findIndex((t) => t.id === id);
  if (i < 0) throw new Error(`Unknown decide tool: ${id}`);
  const group = GROUPS.find((g) => g.tools.some((t) => t.id === id))!.name;
  return { ...TOOLS[i], group };
}

/** The tools before and after this one, in page order. Groups run on into each other; the ends have nothing past them. */
export function prevNext(id: string) {
  const i = TOOL_IDS.indexOf(id);
  return { prev: i > 0 ? toolInfo(TOOL_IDS[i - 1]) : null, next: i >= 0 && i < TOOLS.length - 1 ? toolInfo(TOOL_IDS[i + 1]) : null };
}

export function toolMetadata(id: string): Metadata {
  const t = toolInfo(id);
  const url = toolHref(id);
  return {
    title: t.title,
    description: t.description,
    alternates: pageAlternates(url),
    // Its own card (public/og/decide-<id>.png, drawn by scripts/make-og.tsx): the question beside its mark.
    ...pageShare(url, t.title, t.description, { url: `/og/decide-${id}.png`, width: 1200, height: 630, alt: `${t.question} ${t.line}` }),
  };
}
