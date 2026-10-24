import type { Metadata } from "next";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Motion, Reveal } from "@/components/landing/motion-bits";
import { JsonLd } from "@/components/json-ld";
import { TOPICS, studyHref } from "@/lib/site-data";
import { SITE_NAME, abs } from "@/lib/seo";

const DESCRIPTION =
  "Fourteen true stories, from a London haberdasher counting the dead in 1662 to Google testing 41 shades of blue, each ending with the one statistics idea it teaches.";

export const metadata: Metadata = {
  title: "Why statistics",
  description: DESCRIPTION,
  alternates: { canonical: "/story/" },
};

type TopicId = (typeof TOPICS)[number]["id"];
type Figure = { value: string; caption: string } | { art: "bell" | "pile"; caption: string };
type Story = { id: string; year: string; title: string; body: string; idea: string; topic: TopicId; figure?: Figure };
type Chapter = { id: string; years: string; title: string; dek: string; stories: Story[] };

// Every date and number below is checked against SOURCES at the bottom of this file.
// Where accounts disagree, the copy leaves the detail out rather than pick a side.
const CHAPTERS: Chapter[] = [
  {
    id: "counting",
    years: "1662 to 1763",
    title: "Learning to count",
    dek: "Before anyone had a formula, people noticed that chance, piled up, stops looking random.",
    stories: [
      {
        id: "graunt",
        year: "1662",
        title: "A haberdasher counts the dead",
        body: "Every week London printed its Bills of Mortality: who was christened, who was buried, and what each death was blamed on. Most readers checked them for plague. John Graunt, a haberdasher, kept years of them and added them up. Patterns that no single week could show came into view. About 14 boys were christened for every 13 girls, year after year. Roughly a third of children died before age six. London held about 384,000 people, far fewer than the two million some claimed.",
        idea: "One record is an anecdote. Thousands of records, added up, are evidence.",
        topic: "data",
        figure: { value: "14:13", caption: "Boys to girls christened in London, steady year after year." },
      },
      {
        id: "bernoulli",
        year: "1713",
        title: "How many draws until you’re sure?",
        body: "Picture an urn holding 3,000 white tokens and 2,000 black ones, and you can’t see inside. Draw one, note the color, put it back, repeat. Jacob Bernoulli proved that the share of white you see closes in on the true 60%, and he worked out how long that takes: after 25,550 draws, landing between 58% and 62% is more than a thousand times likelier than landing outside. He wrote that he had kept the result to himself for twenty years. The Art of Conjecturing came out in 1713, eight years after his death.",
        idea: "The average of many repeats settles on the truth, and you can work out how many repeats is enough.",
        topic: "rv",
        figure: { value: "25,550", caption: "Draws to be a thousand to one sure the share is within two points of 60%." },
      },
      {
        id: "de-moivre",
        year: "1733",
        title: "A bell hiding in a coin toss",
        body: "Abraham de Moivre fled France as a Protestant and made his living in London tutoring mathematics, often in coffee houses. His specialty was games of chance. Questions about many tosses, like the chance of between 4,900 and 5,100 heads in 10,000, meant adding thousands of exact terms by hand. In a Latin pamphlet dated November 1733 he found a shortcut: for many tosses, the counts trace a smooth, bell-shaped curve, and the area under it gives the answer. It is usually counted as the birth of what we now call the normal curve.",
        idea: "Add up many small chances and the total falls into a bell, so the area under that bell is a probability.",
        topic: "normal",
        figure: { art: "bell", caption: "De Moivre’s shortcut: the curve that coin-toss counts settle into." },
      },
      {
        id: "bayes",
        year: "1763",
        title: "A minister’s note on changing your mind",
        body: "Thomas Bayes, a Presbyterian minister in Tunbridge Wells, died in 1761 with an essay among his papers. His friend Richard Price found it, edited it and sent it to the Royal Society, where it was read in December 1763. It asked a question backwards. Everyone knew how to go from a known chance to likely results. Bayes went from results to the chance: after some successes and failures, how sure can you be about the odds behind them? Start with a belief, weigh the evidence, update. Spam filters still work this way.",
        idea: "New evidence should move your belief, by an amount that depends on what you believed before.",
        topic: "prob",
      },
    ],
  },
  {
    id: "shape",
    years: "1801 to 1874",
    title: "Finding the shape",
    dek: "Errors, deaths and bouncing beads turned out to follow patterns you could draw.",
    stories: [
      {
        id: "gauss",
        year: "1801",
        title: "Finding a lost planet with a pencil",
        body: "On 1 January 1801 Giuseppe Piazzi spotted Ceres, then counted as a new planet, and tracked it for about 40 days before it slipped into the Sun’s glare. Astronomers had a sliver of its path and no idea where it would come back. Carl Friedrich Gauss, 24, worked out an orbit from those few, slightly wrong sightings. That December, Ceres turned up almost exactly where he said. His tool, he later wrote, was least squares: choose the path that makes the squared misses as small as possible. Adrien-Marie Legendre published the method first, in 1805. Gauss published his in 1809.",
        idea: "When every measurement is a little off, the best line is the one that keeps the squared misses smallest.",
        topic: "reg",
        figure: { value: "40 days", caption: "Of sightings before Ceres vanished. Gauss found it again on paper." },
      },
      {
        id: "nightingale",
        year: "1858",
        title: "A chart that argued with an army",
        body: "Florence Nightingale came back from the Crimean War sure that soldiers were dying of the wrong things. With help from the statistician William Farr, she drew twelve wedges, one per month, each sized by that month’s deaths and colored by cause. Blue, for diseases that could have been prevented, swamped red, for wounds. The chart went into a confidential report in 1858. Army doctors pushed back, so she passed copies to writers and reformers, and a year later it was in a book anyone could buy. The point was plain at a glance: most of those deaths came from disease that cleaner, better-fed camps could prevent.",
        idea: "A clear picture of the data makes the size of a problem impossible to ignore.",
        topic: "data",
      },
      {
        id: "galton",
        year: "1874",
        title: "Beads, pins and a bell",
        body: "For a talk at the Royal Institution in 1874, Francis Galton built a board studded with rows of pins. Beads poured in at the top, and at every pin each one bounced left or right by chance. Nobody could say where a single bead would land. Together they piled into the same bell every time, tall in the middle and thin at the edges. Galton called it a wonderful form of cosmic order. He also used his statistics to argue for eugenics, a legacy the field still reckons with. The board on this site’s front page is the same machine.",
        idea: "Add up many small random nudges and the totals form a bell, which is why averages are so predictable.",
        topic: "clt",
        figure: { art: "pile", caption: "Each grain is one bead. No single one is predictable; the pile always is." },
      },
    ],
  },
  {
    id: "samples",
    years: "1908 to 1943",
    title: "Small samples, big stakes",
    dek: "Beer, tea, an election and a war. Each one turned on what a slice of data can and can’t tell you.",
    stories: [
      {
        id: "gosset",
        year: "1908",
        title: "The brewer who signed his work ‘Student’",
        body: "William Sealy Gosset joined Guinness in Dublin in 1899 as a chemist. His brewery experiments ran on a handful of batches, while the formulas of the day assumed big samples. With only a few measurements, those formulas made results look surer than they were. Gosset worked out the fix, a curve with fatter tails built for small samples. Guinness didn’t let staff publish under their own names, so his 1908 paper, The Probable Error of a Mean, was signed ‘Student’. Every statistics class still teaches Student’s t.",
        idea: "With a small sample, admit more doubt: use t instead of z, and your interval gets wider.",
        topic: "ci",
      },
      {
        id: "fisher",
        year: "1935",
        title: "Milk first, or tea first?",
        body: "At afternoon tea at Rothamsted, an agricultural research station, the scientist Muriel Bristol said she could taste whether the milk had gone into the cup before the tea. A colleague said: let’s test her. Ronald Fisher later used the moment to show how to test any claim. Pour eight cups, four each way, serve them in random order, and ask her to pick out the four with milk first. Guessing would get all four right just 1 time in 70. He wrote it up in The Design of Experiments in 1935. By most accounts, she got every cup right.",
        idea: "Assume nothing is going on, then ask how surprising the result would be. That is a hypothesis test.",
        topic: "test",
        figure: { value: "1 in 70", caption: "The chance of picking all four milk-first cups by pure guessing." },
      },
      {
        id: "literary-digest",
        year: "1936",
        title: "2.4 million answers, the wrong winner",
        body: "In 1936 the Literary Digest mailed about 10 million mock ballots, with names drawn largely from phone books and car registrations, and got about 2.4 million back. Its forecast: Alf Landon would beat Franklin Roosevelt with 57% of the vote. Roosevelt carried 46 of 48 states. The list leaned toward households with phones and cars, but later studies found a bigger problem in who answered: Landon voters mailed their ballots back, and Roosevelt voters were likelier to stay silent. George Gallup asked about 50,000 people chosen to mirror the voters, and called it for Roosevelt. The Digest never recovered.",
        idea: "A huge sample that leans one way loses to a small one picked fairly.",
        topic: "data",
        figure: { value: "2.4M", caption: "Ballots the Digest got back. Gallup asked about 50,000 and got it right." },
      },
      {
        id: "wald",
        year: "1943",
        title: "The planes that didn’t come back",
        body: "Abraham Wald, working with Columbia University’s Statistical Research Group during the Second World War, took on a hard question: how vulnerable are bombers to hits in different places? The only data came from planes that returned, peppered with holes. The tempting reading is to armor where the holes are. Wald saw that the sample itself was the clue. Those planes were hit and still made it home. Planes hit in the deadliest places mostly didn’t, so they never got counted. His memos showed how to estimate the missing losses from the survivors’ damage.",
        idea: "Every number in your data is conditional on making it into the data, so ask who never made it back.",
        topic: "prob",
      },
    ],
  },
  {
    id: "everyday",
    years: "1950 to now",
    title: "From the factory to your phone",
    dek: "The same ideas left the lab and started running companies, ball clubs and websites.",
    stories: [
      {
        id: "deming",
        year: "1950",
        title: "Teaching a country to read variation",
        body: "In the summer of 1950 the Union of Japanese Scientists and Engineers invited the American statistician W. Edwards Deming to teach. Between June and August he trained hundreds of engineers and managers, and spoke to company heads at Hakone. His lesson, built on Walter Shewhart’s control charts: every process varies, so learn to tell its everyday wobble from a real signal, then shrink the wobble. Better quality, he argued, would cut costs and win markets. He gave back the royalties from his lectures, and JUSE used them to found the Deming Prize, still awarded today.",
        idea: "Manage the spread, not just the average: a process that is right on average but all over the place is still broken.",
        topic: "spread",
      },
      {
        id: "moneyball",
        year: "2002",
        title: "Buying the wins nobody else priced",
        body: "The 2002 Oakland A’s spent about $42 million on players. The New York Yankees spent about $133 million. Both won 103 games. General manager Billy Beane and his assistant Paul DePodesta trusted the numbers over the scouts’ eye. Their model said getting on base drove runs far more than the market paid for. In Michael Lewis’s telling, a point of on-base percentage was worth about three points of slugging. So they bought walks cheaply. The A’s won 20 games in a row, an American League record at the time, and still lost in the first round of the playoffs.",
        idea: "Weigh each factor while holding the others fixed, and you find what really drives the result and what is overpriced.",
        topic: "mreg",
        figure: { value: "$42M", caption: "Oakland’s payroll. The Yankees spent about $133M. Both won 103 games." },
      },
      {
        id: "41-shades",
        year: "2009",
        title: "Forty-one shades of blue",
        body: "In March 2009 Douglas Bowman, Google’s first visual designer, quit and explained why on his blog. A team couldn’t decide between two blues, he wrote, so they tested 41 shades between them to see which one performed best. He had been asked to prove whether a border should be 3, 4 or 5 pixels wide. Bowman felt data had crowded out judgment. The method he complained about now runs most of the web: show two versions to random halves of the visitors, and let the difference decide.",
        idea: "Split people at random, change one thing, and check whether the gap is bigger than chance alone would make.",
        topic: "test",
        figure: { value: "41", caption: "Shades of blue tested between the two a team couldn’t choose from." },
      },
    ],
  },
];

const EVERYDAY: { name: string; line: string; topic: TopicId }[] = [
  { name: "Pricing", line: "How many sales do you lose per dollar of price? That is a regression slope.", topic: "reg" },
  { name: "A/B tests", line: "Apps try two versions on random users and keep the one that clears the margin of error.", topic: "ci" },
  { name: "Risk", line: "Insurers and lenders price a policy or a loan from its expected loss and its spread.", topic: "rv" },
  { name: "Quality", line: "A plant checks a few parts an hour and stops the line when the variation jumps.", topic: "spread" },
  { name: "Forecasting", line: "A call center staffs the next hour from the average number of calls per hour.", topic: "poisson" },
  { name: "Sports", line: "Win 60% of your serve points and you hold about 74% of your service games.", topic: "count" },
  { name: "Medicine", line: "A drug is approved when the gap between treated and untreated is too big for chance.", topic: "test" },
  { name: "Polls", line: "A thousand people speak for millions only if they were picked at random.", topic: "data" },
];

const SOURCES: { story: string; title: string; url: string }[] = [
  { story: "1662", title: "John Graunt, Encyclopedia.com", url: "https://www.encyclopedia.com/people/medicine/medicine-biographies/john-graunt" },
  { story: "1713", title: "Jacob Bernoulli, The Art of Conjecturing, Part IV, translated by Edith Dudley Sylla", url: "https://sites.pitt.edu/~jdnorton/teaching/probability/pdf/Bernoulli_Art_Conjecturing_Pt4.pdf" },
  { story: "1733", title: "Abraham de Moivre, MacTutor History of Mathematics, University of St Andrews", url: "https://mathshistory.st-andrews.ac.uk/Biographies/De_Moivre/" },
  { story: "1763", title: "Thomas Bayes, MacTutor History of Mathematics", url: "https://mathshistory.st-andrews.ac.uk/Biographies/Bayes/" },
  { story: "1763", title: "An Essay towards solving a Problem in the Doctrine of Chances", url: "https://en.wikipedia.org/wiki/An_Essay_Towards_Solving_a_Problem_in_the_Doctrine_of_Chances" },
  { story: "1801", title: "Carl Friedrich Gauss, MacTutor History of Mathematics", url: "https://mathshistory.st-andrews.ac.uk/Biographies/Gauss/" },
  { story: "1801", title: "Least squares: history", url: "https://en.wikipedia.org/wiki/Least_squares" },
  { story: "1858", title: "Nightingale and Martineau, Science Museum Group Journal", url: "https://journal.sciencemuseum.ac.uk/article/nightingale-and-martineau/" },
  { story: "1874", title: "Galton board", url: "https://en.wikipedia.org/wiki/Galton_board" },
  { story: "1874", title: "Francis Galton, Natural Inheritance (1889), galton.org", url: "https://galton.org/books/natural-inheritance/" },
  { story: "1908", title: "William Sealy Gosset", url: "https://en.wikipedia.org/wiki/William_Sealy_Gosset" },
  { story: "1908", title: "William Sealy Gosset, MacTutor History of Mathematics", url: "https://mathshistory.st-andrews.ac.uk/Biographies/Gosset/" },
  { story: "1935", title: "Muriel Bristol", url: "https://en.wikipedia.org/wiki/Muriel_Bristol" },
  { story: "1935", title: "Lady tasting tea", url: "https://en.wikipedia.org/wiki/Lady_tasting_tea" },
  { story: "1936", title: "Dominic Lusinchi, ‘President’ Landon and the 1936 Literary Digest Poll, Social Science History (2012)", url: "https://pdixon.stat.iastate.edu/stat587/resources/president-landon-and-the-1936-literary-digest-poll-were-automobile-and-telephone-owners-to-blame.pdf" },
  { story: "1936", title: "The Literary Digest", url: "https://en.wikipedia.org/wiki/The_Literary_Digest" },
  { story: "1943", title: "Mangel and Samaniego, Abraham Wald’s Work on Aircraft Survivability, JASA (1984)", url: "https://www.jstor.org/stable/2288257" },
  { story: "1943", title: "The Legend of Abraham Wald, American Mathematical Society", url: "https://www.ams.org/samplings/feature-column/fc-2016-06" },
  { story: "1950", title: "W. Edwards Deming", url: "https://en.wikipedia.org/wiki/W._Edwards_Deming" },
  { story: "1950", title: "Deming Prize", url: "https://en.wikipedia.org/wiki/Deming_Prize" },
  { story: "2002", title: "2002 Oakland Athletics season", url: "https://en.wikipedia.org/wiki/2002_Oakland_Athletics_season" },
  { story: "2002", title: "Baseball’s 2002 payrolls, ESPN", url: "https://www.espn.com/mlb/playoffs2002/s/2002/1011/1444560.html" },
  { story: "2002", title: "Moneyball, The Analytics Edge, MIT OpenCourseWare", url: "https://ocw.mit.edu/courses/15-071-the-analytics-edge-spring-2017/9573ac589ee65559695bb7ef1962866b_MIT15_071S17_Unit2_Moneyball.pdf" },
  { story: "2009", title: "Douglas Bowman, Goodbye, Google", url: "https://stopdesign.com/archive/2009/03/20/goodbye-google.html" },
];

const topicOf = (id: TopicId) => TOPICS.find((t) => t.id === id)!;
const topicHref = (id: TopicId) => studyHref(`#learn/topics/${id}`);

// Story grid: year | rail | text on wide screens, rail | year over text on phones.
const storyGrid = "grid grid-cols-[20px_minmax(0,1fr)] gap-x-4 md:grid-cols-[minmax(0,3fr)_20px_minmax(0,9fr)] md:gap-x-6";

/** De Moivre's curve, drawn once from the formula. */
function BellArt() {
  const pts: string[] = [];
  for (let i = 0; i <= 64; i++) {
    const z = -3.2 + (6.4 * i) / 64;
    pts.push(`${(8 + (184 * i) / 64).toFixed(1)},${(80 - 64 * Math.exp((-z * z) / 2)).toFixed(1)}`);
  }
  return (
    <svg viewBox="0 0 200 88" className="w-full max-w-[260px]" aria-hidden>
      <polyline points={pts.join(" ")} fill="none" stroke="var(--clay)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="4" x2="196" y1="81.5" y2="81.5" stroke="var(--ink)" strokeWidth="1.2" />
    </svg>
  );
}

/** Galton's board, settled: grains stacked by bin, the bell drawn over them. */
const PILE = [1, 1, 2, 4, 6, 7, 6, 4, 2, 1, 1];
function PileArt() {
  const r = 6.2;
  const step = 16;
  const x0 = 100 - ((PILE.length - 1) * step) / 2;
  const pts: string[] = [];
  for (let i = 0; i <= 60; i++) {
    const z = -3 + (6 * i) / 60;
    pts.push(`${(x0 + ((PILE.length - 1) * step * i) / 60).toFixed(1)},${(118 - 104 * Math.exp((-z * z) / 2.2)).toFixed(1)}`);
  }
  return (
    <svg viewBox="0 0 200 124" className="w-full max-w-[260px]" aria-hidden>
      {PILE.flatMap((h, col) =>
        Array.from({ length: h }, (_, k) => <circle key={`${col}-${k}`} cx={x0 + col * step} cy={118 - r - 1 - k * (2 * r + 1.2)} r={r} fill="var(--clay)" />),
      )}
      <polyline points={pts.join(" ")} fill="none" stroke="var(--ink)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="4" x2="196" y1="118.5" y2="118.5" stroke="var(--ink)" strokeWidth="1.2" />
    </svg>
  );
}

function StoryFigure({ figure }: { figure: Figure }) {
  return (
    <figure className="border-t-2 border-ink pt-4">
      {"value" in figure ? (
        <p className="font-display text-[2.6rem] font-[650] leading-none tracking-[-0.02em] text-clay-ink tabular-nums">{figure.value}</p>
      ) : figure.art === "bell" ? (
        <BellArt />
      ) : (
        <PileArt />
      )}
      <figcaption className="mt-3 max-w-[30ch] text-sm text-ink-muted">{figure.caption}</figcaption>
    </figure>
  );
}

function StoryItem({ s }: { s: Story }) {
  const t = topicOf(s.topic);
  return (
    <li>
      <article aria-labelledby={`s-${s.id}`} className={storyGrid}>
        {/* the court line, with one grain per story */}
        <div aria-hidden className="relative col-start-1 row-span-2 row-start-1 md:col-start-2 md:row-span-1">
          <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-line-strong/60" />
          <span className="absolute left-1/2 top-[0.6rem] size-3 -translate-x-1/2 rounded-full bg-clay ring-[5px] ring-paper md:top-[0.85rem]" />
        </div>

        <p className="col-start-2 row-start-1 md:sticky md:top-24 md:col-start-1 md:self-start md:text-right">
          <time dateTime={s.year} className="font-display text-xl font-[650] leading-8 tracking-[-0.01em] text-ink tabular-nums md:text-[2rem] md:leading-10">
            {s.year}
          </time>
        </p>

        <div className="col-start-2 row-start-2 pb-16 pt-2 md:col-start-3 md:row-start-1 md:pb-24 md:pt-0.5 lg:grid lg:grid-cols-[minmax(0,1fr)_13.5rem] lg:gap-12">
          <Reveal>
            <h3
              id={`s-${s.id}`}
              className="font-display text-[clamp(1.65rem,1.2rem+1.5vw,2.35rem)] font-[650] leading-[1.02] tracking-[-0.015em]"
              style={{ fontVariationSettings: "'wdth' 86" }}
            >
              {s.title}
            </h3>
            <p className="mt-4 max-w-[62ch] text-[1.0625rem] leading-[1.65]">{s.body}</p>
            <div className="mt-6 max-w-[62ch] rounded-[20px] bg-sand px-5 pb-3 pt-4 md:px-6">
              <p className="text-sm font-medium text-clay-ink">The idea</p>
              <p className="mt-1 font-display text-[1.3rem] font-[600] leading-snug md:text-[1.45rem]" style={{ fontVariationSettings: "'wdth' 92" }}>
                {s.idea}
              </p>
              <a
                href={topicHref(s.topic)}
                className="group mt-2 inline-flex min-h-11 items-center gap-2 text-[0.95rem] font-medium underline-offset-4 hover:underline"
              >
                Learn it in topic {t.n}: {t.name}
                <ArrowRight className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
              </a>
            </div>
          </Reveal>
          {s.figure && (
            <Reveal delay={0.08} className="mt-8 lg:mt-1.5">
              <StoryFigure figure={s.figure} />
            </Reveal>
          )}
        </div>
      </article>
    </li>
  );
}

export default function Story() {
  return (
    <Motion>
      <JsonLd
        data={{
          "@type": "Article",
          headline: "Why statistics",
          description: DESCRIPTION,
          url: abs("/story/"),
          inLanguage: "en",
          publisher: { "@type": "Organization", name: SITE_NAME },
        }}
      />
      <SiteHeader mode="landing" />
      <main id="main" tabIndex={-1} className="outline-none">
        {/* ---------- opening ---------- */}
        <header className="mx-auto grid w-full max-w-[1200px] gap-4 px-4 pb-14 pt-8 md:grid-cols-12 md:px-6 md:pb-20 md:pt-14">
          <p className="rise text-sm font-medium text-clay-ink md:col-span-3 md:pt-4">Why statistics</p>
          <div className="md:col-span-9">
            <h1
              className="rise font-display text-[clamp(2.8rem,1.6rem+5vw,5.6rem)] font-[680] leading-[0.92] tracking-[-0.02em]"
              style={{ fontVariationSettings: "'wdth' 78" }}
            >
              Nobody gets to
              <span className="block">see everything.</span>
            </h1>
            <div className="rise mt-7 max-w-[56ch] space-y-4 text-lg text-ink-muted md:text-xl" style={{ animationDelay: "80ms" }}>
              <p>
                Statistics is deciding what to do when you can only see a slice of the data. You can&rsquo;t ask every voter, taste every
                batch or inspect every plane, so you look closely at some of them and say something careful about all of them.
              </p>
              <p>Here are fourteen times people did that, or failed to, and the one idea each one leaves you with.</p>
            </div>

            <nav aria-label="Chapters" className="rise mt-12" style={{ animationDelay: "140ms" }}>
              <ol className="grid border-t border-line sm:grid-cols-2 lg:grid-cols-4">
                {CHAPTERS.map((c) => (
                  <li key={c.id} className="border-b border-line lg:border-b-0">
                    <a href={`#${c.id}`} className="group flex min-h-11 flex-col gap-0.5 py-4 pr-4">
                      <span className="text-xs text-ink-muted tabular-nums">{c.years}</span>
                      <span className="flex items-center gap-1.5 font-display text-xl font-[650] group-hover:underline group-hover:underline-offset-4">
                        {c.title}
                      </span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </div>
        </header>

        {/* ---------- the chapters ---------- */}
        <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6">
          {CHAPTERS.map((c) => (
            <section key={c.id} id={c.id} aria-labelledby={`c-${c.id}`} className="scroll-mt-20 border-t border-line pt-14 md:scroll-mt-24 md:pt-20">
              <Reveal className={`${storyGrid} mb-12 md:mb-16`}>
                <p className="col-span-2 text-sm font-medium text-clay-ink md:col-span-1 md:pt-3 md:text-right">{c.years}</p>
                <div className="col-span-2 mt-3 md:col-span-1 md:col-start-3 md:mt-0">
                  <h2
                    id={`c-${c.id}`}
                    className="font-display text-[clamp(2.2rem,1.4rem+3.2vw,4rem)] font-[650] leading-[0.98] tracking-[-0.018em]"
                    style={{ fontVariationSettings: "'wdth' 84" }}
                  >
                    {c.title}
                  </h2>
                  <p className="mt-4 max-w-[52ch] text-lg text-ink-muted">{c.dek}</p>
                </div>
              </Reveal>
              <ol>
                {c.stories.map((s) => (
                  <StoryItem key={s.id} s={s} />
                ))}
              </ol>
            </section>
          ))}
        </div>

        {/* ---------- where you already use it ---------- */}
        <section aria-labelledby="everyday-uses" className="bg-ink py-16 text-paper md:py-28">
          <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6">
            <Reveal className="mb-12 grid gap-4 md:grid-cols-12">
              <p className="text-sm font-medium text-paper/70 md:col-span-3 md:pt-3">Today</p>
              <div className="space-y-4 md:col-span-9">
                <h2
                  id="everyday-uses"
                  className="font-display text-[clamp(2.2rem,1.4rem+3.2vw,4rem)] font-[650] leading-[0.98] tracking-[-0.018em]"
                  style={{ fontVariationSettings: "'wdth' 84" }}
                >
                  Where you already use it
                </h2>
                <p className="max-w-[52ch] text-lg text-paper/70">None of this stayed in the history books. It runs the jobs you&rsquo;re studying for.</p>
              </div>
            </Reveal>
            <ul className="grid gap-px overflow-hidden rounded-[24px] bg-paper/15 sm:grid-cols-2 lg:grid-cols-4">
              {EVERYDAY.map((e) => (
                <li key={e.name} className="bg-ink">
                  <a href={topicHref(e.topic)} className="group flex h-full min-h-40 flex-col gap-3 p-6 transition-colors hover:bg-paper/5">
                    <span className="flex items-center justify-between gap-3 font-display text-2xl font-[650]">
                      {e.name}
                      <ArrowUpRight className="size-5 shrink-0 text-paper/40 transition-colors group-hover:text-clay" />
                    </span>
                    <span className="text-paper/70">{e.line}</span>
                    <span className="mt-auto text-sm text-paper/70">Topic {topicOf(e.topic).n}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------- close ---------- */}
        <section className="mx-auto w-full max-w-[1200px] px-4 py-20 md:px-6 md:py-28">
          <Reveal className="flex flex-col items-center text-center">
            <h2
              className="max-w-[16ch] font-display text-[clamp(2.4rem,1.4rem+4vw,4.8rem)] font-[680] leading-[0.95] tracking-[-0.02em]"
              style={{ fontVariationSettings: "'wdth' 80" }}
            >
              Every idea here is a topic.
            </h2>
            <p className="mt-5 max-w-[44ch] text-lg text-ink-muted">Read it in a sentence, drag it in a lab, then drill it with fresh numbers.</p>
            <a
              href={studyHref("#learn/topics/data")}
              className="mt-9 inline-flex h-12 items-center gap-2 rounded-full bg-ink px-7 font-medium text-paper transition-colors hover:bg-ink/85"
            >
              Start with topic 1 <ArrowRight className="size-4" />
            </a>
          </Reveal>
        </section>

        {/* ---------- sources ---------- */}
        <section aria-labelledby="story-sources" className="mx-auto w-full max-w-[1200px] px-4 pb-20 md:px-6">
          <div className="grid gap-4 border-t border-line pt-8 md:grid-cols-12 md:pt-10">
            <div className="md:col-span-3">
              <h2 id="story-sources" className="font-display text-2xl font-[650]">
                Sources
              </h2>
            </div>
            <div className="md:col-span-9">
              <p className="max-w-[62ch] text-ink-muted">
                Every date and number above was checked against these. Where accounts disagree, the story leaves the detail out.
              </p>
              <ul className="mt-6 divide-y divide-line border-y border-line">
                {SOURCES.map((src) => (
                  <li key={src.url} className="grid gap-1 py-3 sm:grid-cols-[4rem_minmax(0,1fr)] sm:gap-4">
                    <span className="font-mono text-sm text-ink-muted tabular sm:pt-0.5">{src.story}</span>
                    <span className="min-w-0">
                      <a href={src.url} target="_blank" rel="noreferrer" className="font-medium underline-offset-4 hover:underline">
                        {src.title}
                      </a>
                      <span className="mt-0.5 block break-all font-mono text-xs text-ink-muted">{src.url.replace(/^https?:\/\//, "")}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </Motion>
  );
}
