import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/seo";

/** Every decision on /decide/, in page order. Pages, the index, the sitemap and prev/next all read from here, so they never drift apart. */
export type ToolInfo = {
  id: string;
  /** The question a person brings. It is the card title, the page heading and the page title. */
  question: string;
  /** One line under the question on the index card. */
  line: string;
  /** The idea behind it, shown small above the heading. */
  kicker: string;
  /** The paragraph under the heading on the tool's own page. */
  lede: string;
  /** For search results and share cards. */
  description: string;
  /** For structured data: the ideas this page teaches. */
  teaches: string;
};

export type ToolGroup = { name: string; line: string; tools: ToolInfo[] };

export const DISCLAIMER = "For learning, not financial, medical or betting advice.";

export const GROUPS: ToolGroup[] = [
  {
    name: "Choose",
    line: "Two good options and no way to know how each one turns out.",
    tools: [
      {
        id: "choose",
        question: "Which option should I choose?",
        line: "Give each option a worst, likely and best case; see which wins.",
        kicker: "Monte Carlo",
        lede: "Give each option a worst, a likely and a best case. We play out 10,000 possible futures and count how often each one comes out on top.",
        description: "Compare two or three options with uncertain outcomes. Type a worst, likely and best case for each, and 10,000 simulated futures show how often each comes out ahead.",
        teaches: "Monte Carlo simulation, the triangular distribution and percentiles",
      },
    ],
  },
  {
    name: "Money and risk",
    line: "What a price, a plan or a bet is really worth, on average.",
    tools: [
      {
        id: "warranty",
        question: "Should I buy the warranty?",
        line: "What each choice costs on average, and when to buy anyway.",
        kicker: "Expected value",
        lede: "Price, chance and cost: what each choice costs on average, the chance where the plan starts to pay, and when to buy it anyway.",
        description: "Should you buy the extended warranty or insurance? Compare what each choice costs on average, find the break-even chance, and see when buying it still makes sense.",
        teaches: "Expected value, break-even probability and why insurance exists",
      },
      {
        id: "bet",
        question: "What are these odds really saying?",
        line: "Turn a betting line into a chance and find the bookmaker's cut.",
        kicker: "A bet",
        lede: "Turn any betting line into a chance, find the bookmaker's cut, and see what a careful bettor would stake.",
        description: "Turn American, decimal or fractional odds into a plain chance, find the bookmaker's margin, and see the expected value and Kelly stake for your own estimate.",
        teaches: "Implied probability, the overround, expected value and the Kelly criterion",
      },
      {
        id: "market",
        question: "What does a 30¢ price mean?",
        line: "A market price is the crowd's chance. Compare yours, after fees.",
        kicker: "A market price",
        lede: "A prediction market price is the crowd's chance. Compare it with yours, after fees.",
        description: "Read a prediction market price as a chance, compare it with your own, and see what Yes and No are worth on average after fees.",
        teaches: "Implied probability, expected value and break-even after fees",
      },
      {
        id: "option",
        question: "How likely is the stock to get there?",
        line: "The chance a stock ends past the strike by expiry.",
        kicker: "An option, for learning only",
        lede: "From a stock price, a strike, the days left and the volatility: the typical move, the chance of ending past the strike, and where you break even.",
        description: "From a stock price, strike, days to expiry and implied volatility: the typical move, the chance of ending past the strike, and the chance of a profit. For learning only.",
        teaches: "The lognormal model, volatility and the chance of finishing past a price",
      },
    ],
  },
  {
    name: "Evidence",
    line: "When a result says yes, how much should you believe it?",
    tools: [
      {
        id: "bayes",
        question: "Is this test result real?",
        line: "How common the thing is changes what a yes means.",
        kicker: "Base rates",
        lede: "A yes from a good test feels like an answer. How common the thing is changes what it means, often more than the test does.",
        description: "What a positive test, a fraud alert or a spam flag really means. See how the base rate changes the chance a yes is real, with 1,000 dots.",
        teaches: "Base rates, false positives and Bayes' rule",
      },
      {
        id: "abtest",
        question: "Did my change really work?",
        line: "Two versions, two counts: is the gap real or luck?",
        kicker: "A/B test",
        lede: "Two versions, two counts. Is the gap real or luck, how big could it be, and how many people would settle it.",
        description: "Type the counts from an A/B test and see in plain words whether the gap is real or luck, how big it could be, and how many people you need.",
        teaches: "The two-proportion z test, p-values, confidence intervals, sample size and power",
      },
    ],
  },
  {
    name: "Plan",
    line: "Setting a target when the future is a range, not a number.",
    tools: [
      {
        id: "goal",
        question: "Will I hit my goal?",
        line: "Start amount, monthly saving and returns, played out 5,000 ways.",
        kicker: "Monte Carlo",
        lede: "A start amount, a monthly saving and a guess at returns. We play out 5,000 possible futures, month by month, and count how often you get there.",
        description: "Will your savings reach the goal? 5,000 simulated futures, month by month, show your chance, the middle outcome and the bad case.",
        teaches: "Monte Carlo simulation, volatility and why the average is not the typical outcome",
      },
      {
        id: "staffing",
        question: "How many people do I need?",
        line: "The fewest people that keep a busy hour from overflowing.",
        kicker: "Poisson",
        lede: "Customers arrive at random. See how often a busy hour brings more than the team can serve, and the fewest people that keep it rare.",
        description: "How many staff for a busy hour? See how often random arrivals outrun the team, and the fewest people that keep it rare.",
        teaches: "The Poisson distribution, capacity and utilization",
      },
    ],
  },
];

export const TOOLS: ToolInfo[] = GROUPS.flatMap((g) => g.tools);
export const TOOL_IDS = TOOLS.map((t) => t.id);

export const toolHref = (id: string) => `/decide/${id}/`;

export function toolInfo(id: string): ToolInfo & { group: string; n: string } {
  const i = TOOLS.findIndex((t) => t.id === id);
  if (i < 0) throw new Error(`Unknown decide tool: ${id}`);
  const group = GROUPS.find((g) => g.tools.some((t) => t.id === id))!.name;
  return { ...TOOLS[i], group, n: String(i + 1).padStart(2, "0") };
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
    title: t.question,
    description: t.description,
    alternates: { canonical: url },
    openGraph: {
      title: `${t.question} · ${SITE_NAME}`,
      description: t.description,
      type: "website",
      siteName: SITE_NAME,
      url,
      images: [{ url: "/og.png", width: 1200, height: 630, alt: `${SITE_NAME}: drop enough grains and the shape appears.` }],
    },
    twitter: { card: "summary_large_image", title: `${t.question} · ${SITE_NAME}`, description: t.description, images: ["/og.png"] },
  };
}
