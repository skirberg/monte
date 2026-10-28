import type { Metadata } from "next";
import { ArrowRight, ArrowUpRight, ChevronDown } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Motion, Reveal } from "@/components/landing/motion-bits";
import { JsonLd } from "@/components/json-ld";
import { TOPICS, studyHref } from "@/lib/site-data";
import { SITE_NAME, abs, pageMeta } from "@/lib/seo";

const DESCRIPTION =
  "Fourteen true stories, from a London haberdasher counting the dead in 1662 to Google testing 41 shades of blue, each ending with the one statistics idea it teaches.";

export const metadata: Metadata = pageMeta("/story/", "Why statistics", DESCRIPTION);

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
        body: "Every week London printed its Bills of Mortality: christenings, burials and what each death was blamed on. John Graunt, a haberdasher, kept years of them and added them up. About 14 boys were christened for every 13 girls, year after year. Roughly a third of children died before six. London held about 384,000 people, not the two million some claimed.",
        idea: "One record is an anecdote. Thousands, added up, are evidence.",
        topic: "data",
        figure: { value: "14:13", caption: "Boys to girls christened in London, steady year after year." },
      },
      {
        id: "bernoulli",
        year: "1713",
        title: "How many draws until you’re sure?",
        body: "Picture an urn with 3,000 white tokens and 2,000 black. Draw, note the color, replace, repeat. Jacob Bernoulli proved the share of white closes in on the true 60%, and worked out how fast: after 25,550 draws, landing between 58% and 62% is over a thousand times likelier than not. His book came out in 1713, after his death.",
        idea: "Averages of many repeats settle on the truth, and you can work out how many is enough.",
        topic: "rv",
        figure: { value: "25,550", caption: "Draws to be a thousand to one sure the share is within two points of 60%." },
      },
      {
        id: "de-moivre",
        year: "1733",
        title: "A bell hiding in a coin toss",
        body: "Abraham de Moivre, a Protestant who fled France, tutored mathematics in London, often in coffee houses. The chance of 4,900 to 5,100 heads in 10,000 tosses meant adding thousands of exact terms by hand. In November 1733 he found a shortcut: for many tosses, the counts trace a smooth bell, and the area under it gives the answer.",
        idea: "Many small chances add up to a bell, and the area under the bell is a probability.",
        topic: "normal",
        figure: { art: "bell", caption: "De Moivre’s shortcut: the curve that coin-toss counts settle into." },
      },
      {
        id: "bayes",
        year: "1763",
        title: "A minister’s note on changing your mind",
        body: "Thomas Bayes, a minister, died in 1761 with an essay among his papers. His friend Richard Price sent it to the Royal Society, where it was read in December 1763. It asked a question backwards: after some successes and failures, how sure can you be about the odds behind them? Spam filters still work this way.",
        idea: "Evidence should move your belief, by an amount that depends on what you believed before.",
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
        body: "In January 1801 Giuseppe Piazzi spotted Ceres and tracked it for about 40 days before it slipped into the Sun’s glare. Carl Friedrich Gauss, 24, worked out an orbit from those few, slightly wrong sightings. That December, Ceres turned up almost exactly where he said. His tool, he later wrote, was least squares: keep the squared misses smallest.",
        idea: "When every measurement is a little off, the best line keeps the squared misses smallest.",
        topic: "reg",
        figure: { value: "40 days", caption: "Of sightings before Ceres vanished. Gauss found it again on paper." },
      },
      {
        id: "nightingale",
        year: "1858",
        title: "A chart that argued with an army",
        body: "Florence Nightingale returned from the Crimean War sure soldiers were dying of the wrong things. With William Farr, she drew twelve wedges, one per month, sized by deaths and colored by cause. Blue, for preventable disease, swamped red, for wounds. It went into a confidential report in 1858. When army doctors pushed back, she passed copies to writers and reformers.",
        idea: "A clear picture of the data makes the size of a problem impossible to ignore.",
        topic: "data",
      },
      {
        id: "galton",
        year: "1874",
        title: "Beads, pins and a bell",
        body: "For an 1874 talk, Francis Galton built a board of pins. Beads bounced left or right at each pin. No one could say where a bead would land, but together they piled into the same bell every time. Galton also used statistics to argue for eugenics, a legacy the field still reckons with. Our front page runs the same machine.",
        idea: "Many small random nudges add up to a bell, which is why averages are so predictable.",
        topic: "clt",
        figure: { art: "pile", caption: "Each grain is one bead. No single one is predictable; the pile always is." },
      },
    ],
  },
  {
    id: "samples",
    years: "1908 to 1943",
    title: "Small samples, big stakes",
    dek: "Beer, tea, an election, a war: what can a slice of data really tell you?",
    stories: [
      {
        id: "gosset",
        year: "1908",
        title: "The brewer who signed his work ‘Student’",
        body: "William Sealy Gosset joined Guinness in 1899 as a chemist. His experiments ran on a handful of batches, but the formulas of the day assumed big samples and made small ones look surer than they were. His fix was a curve with fatter tails. Guinness didn’t let staff publish under their own names, so his 1908 paper was signed ‘Student’.",
        idea: "With a small sample, admit more doubt: use t instead of z, and the interval widens.",
        topic: "ci",
      },
      {
        id: "fisher",
        year: "1935",
        title: "Milk first, or tea first?",
        body: "At tea at Rothamsted, Muriel Bristol said she could taste whether the milk went in first. Ronald Fisher later used it to show how to test any claim: pour eight cups, four each way, in random order, and ask her to pick the four milk-first. Guessing gets all four 1 time in 70. By most accounts, she got them all.",
        idea: "Assume nothing is going on, then ask how surprising the result is. That is a hypothesis test.",
        topic: "test",
        figure: { value: "1 in 70", caption: "The chance of picking all four milk-first cups by pure guessing." },
      },
      {
        id: "literary-digest",
        year: "1936",
        title: "2.4 million answers, the wrong winner",
        body: "In 1936 the Literary Digest mailed about 10 million mock ballots, got about 2.4 million back, and called it for Alf Landon. Franklin Roosevelt carried 46 of 48 states. The lists leaned toward phone and car owners, and later studies found Landon voters were likelier to answer. George Gallup asked about 50,000 people chosen to mirror voters, and was right.",
        idea: "A huge sample that leans one way loses to a small one picked fairly.",
        topic: "data",
        figure: { value: "2.4M", caption: "Ballots the Digest got back. Gallup asked about 50,000 and got it right." },
      },
      {
        id: "wald",
        year: "1943",
        title: "The planes that didn’t come back",
        body: "During the Second World War, Abraham Wald of Columbia’s Statistical Research Group studied where bombers were most vulnerable. The only data came from planes that returned, peppered with holes. The tempting move is to armor where the holes are. Wald saw that the sample was the clue: planes hit in the deadliest places mostly never came back to be counted.",
        idea: "Your data holds only what made it into the data. Ask who never made it back.",
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
        body: "In 1950 the Union of Japanese Scientists and Engineers (JUSE) invited the American statistician W. Edwards Deming, who taught hundreds of engineers and managers. His lesson, built on Walter Shewhart’s control charts: every process varies, so tell everyday wobble from a real signal, then shrink it. He gave back his royalties, and JUSE used them to found the Deming Prize.",
        idea: "Manage the spread, not just the average: right on average but all over the place is still broken.",
        topic: "spread",
      },
      {
        id: "moneyball",
        year: "2002",
        title: "Buying the wins nobody else priced",
        body: "The 2002 Oakland A’s spent about $42 million; the Yankees, about $133 million. Both won 103 games. Billy Beane and Paul DePodesta trusted the numbers over the scouts’ eye: getting on base drove runs far more than the market paid for. They bought walks cheaply. The A’s won 20 straight, then a league record, yet lost in the first round.",
        idea: "Hold the other factors fixed and you see what really drives results, and what is overpriced.",
        topic: "mreg",
        figure: { value: "$42M", caption: "Oakland’s payroll. The Yankees spent about $133M. Both won 103 games." },
      },
      {
        id: "41-shades",
        year: "2009",
        title: "Forty-one shades of blue",
        body: "In March 2009 Douglas Bowman, Google’s first visual designer, quit and explained why on his blog. A team couldn’t decide between two blues, he wrote, so they tested 41 shades between them. Bowman felt data had crowded out judgment. The method now runs most of the web: random halves of visitors see two versions, and the difference decides.",
        idea: "Split people at random, change one thing, and check if the gap beats chance.",
        topic: "test",
        figure: { value: "41", caption: "Shades of blue tested between the two a team couldn’t choose from." },
      },
    ],
  },
];

const EVERYDAY: { name: string; line: string; topic: TopicId }[] = [
  { name: "Pricing", line: "Sales lost per dollar of price? That is a regression slope.", topic: "reg" },
  { name: "A/B tests", line: "Two versions, random users; the winner must clear the margin of error.", topic: "ci" },
  { name: "Risk", line: "Insurers and lenders price from the expected loss and its spread.", topic: "rv" },
  { name: "Quality", line: "A plant checks a few parts an hour, stopping when variation jumps.", topic: "spread" },
  { name: "Forecasting", line: "A call center staffs each hour from its average call rate.", topic: "poisson" },
  { name: "Sports", line: "Win 60% of serve points; hold about 74% of service games.", topic: "count" },
  { name: "Medicine", line: "Drugs are approved when treated beat untreated by more than chance.", topic: "test" },
  { name: "Polls", line: "A thousand people speak for millions only if picked at random.", topic: "data" },
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

// Below lg each story folds: the year, headline and idea stay in view, the body and figure open on a tap.
// From lg up the body is printed open, as before. The body is rendered twice (one copy per breakpoint,
// the other display:none) so the page works before hydration and never shifts on load.
function StoryItem({ s }: { s: Story }) {
  const t = topicOf(s.topic);
  const value = s.figure && "value" in s.figure ? s.figure.value : null;
  const cut = t.name.lastIndexOf(" ") + 1;
  const [nameHead, nameTail] = [t.name.slice(0, cut), t.name.slice(cut)];
  return (
    <li>
      <article aria-labelledby={`s-${s.id}`} className={storyGrid}>
        {/* the court line, with one grain per story */}
        <div aria-hidden className="relative col-start-1 row-span-2 row-start-1 md:col-start-2 md:row-span-1">
          <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-line-strong/60" />
          <span className="absolute left-1/2 top-[0.6rem] size-3 -translate-x-1/2 rounded-full bg-clay ring-[5px] ring-paper md:top-[0.85rem]" />
        </div>

        <p className="col-start-2 row-start-1 flex items-center justify-between gap-3 md:sticky md:top-24 md:col-start-1 md:block md:self-start md:text-right">
          <time dateTime={s.year} className="font-display text-xl font-[650] leading-8 tracking-[-0.01em] text-ink tabular-nums md:text-[2rem] md:leading-10">
            {s.year}
          </time>
          {/* the story's number as a small tag on phones; the fold below repeats it with its caption */}
          {value && (
            <span aria-hidden className="rounded-full bg-sand px-2.5 py-0.5 font-display text-[0.95rem] font-[650] text-clay-ink tabular-nums md:hidden">
              {value}
            </span>
          )}
        </p>

        <div className="col-start-2 row-start-2 pb-3 pt-1 md:col-start-3 md:row-start-1 md:pb-16 md:pt-0.5 lg:grid lg:grid-cols-[minmax(0,1fr)_13.5rem] lg:gap-12 lg:pb-24">
          <Reveal>
            <h3
              id={`s-${s.id}`}
              className="font-display text-[clamp(1.55rem,1.2rem+1.5vw,2.35rem)] font-[650] leading-[1.02] tracking-[-0.015em]"
              style={{ fontVariationSettings: "'wdth' 86" }}
            >
              {s.title}
            </h3>
            <p className="mt-4 hidden max-w-[62ch] text-[1.0625rem] leading-[1.65] lg:block">{s.body}</p>
            <div className="mt-3.5 max-w-[62ch] rounded-[20px] bg-sand px-4 pb-1.5 pt-3 md:px-6 lg:mt-6 lg:pb-3 lg:pt-4">
              <p className="text-sm font-medium text-clay-ink">The idea</p>
              <p
                className="mt-0.5 font-display text-[1.125rem] lg:mt-1 font-[600] leading-snug md:text-[1.3rem] lg:text-[1.45rem]"
                style={{ fontVariationSettings: "'wdth' 92" }}
              >
                {s.idea}
              </p>
              <a
                href={topicHref(s.topic)}
                className="group mt-0.5 inline-block py-3 text-sm font-medium leading-snug underline-offset-4 hover:underline md:text-[0.95rem] lg:mt-2 lg:py-2.5 lg:leading-6"
              >
                Learn it in topic {t.n}: {nameHead}
                {/* the last word rides with the arrow, so a wrap never leaves the arrow alone */}
                <span className="whitespace-nowrap">
                  {nameTail}
                  <ArrowRight aria-hidden className="ml-1.5 inline size-4 align-[-0.2em] transition-transform group-hover:translate-x-0.5 lg:ml-2" />
                </span>
              </a>
            </div>
            <details className="group/fold mt-1 max-w-[62ch] lg:hidden">
              <summary className="-mx-1 inline-flex min-h-11 cursor-pointer list-none items-center gap-1.5 rounded-full px-1 text-[0.95rem] font-medium text-ink-muted transition-colors hover:text-ink [&::-webkit-details-marker]:hidden">
                <ChevronDown aria-hidden className="size-4 transition-transform duration-200 group-open/fold:rotate-180 motion-reduce:transition-none" />
                <span className="group-open/fold:hidden">Read the story</span>
                <span className="hidden group-open/fold:inline">Hide the story</span>
              </summary>
              <p className="mt-1 text-[1.0625rem] leading-[1.65]">{s.body}</p>
              {s.figure && (
                <div className="mt-6 pb-2">
                  <StoryFigure figure={s.figure} />
                </div>
              )}
            </details>
          </Reveal>
          {s.figure && (
            <Reveal delay={0.08} className="hidden lg:mt-1.5 lg:block">
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
        <header className="mx-auto grid w-full max-w-[1200px] gap-4 px-4 pb-6 pt-8 md:grid-cols-12 md:px-6 md:pb-20 md:pt-14">
          <p className="rise text-sm font-medium text-clay-ink md:col-span-3 md:pt-4">Why statistics</p>
          <div className="md:col-span-9">
            <h1
              className="rise font-display text-[clamp(2.8rem,1.6rem+5vw,5.6rem)] font-[680] leading-[0.92] tracking-[-0.02em]"
              style={{ fontVariationSettings: "'wdth' 78" }}
            >
              Nobody gets to
              <span className="block">see everything.</span>
            </h1>
            <div className="rise mt-6 max-w-[56ch] space-y-3 text-[1.0625rem] text-ink-muted md:mt-7 md:space-y-4 md:text-xl" style={{ animationDelay: "80ms" }}>
              <p>
                Statistics is deciding what to do from a slice of the data. You can&rsquo;t ask every voter or inspect every plane, so you
                study some and speak carefully about all.
              </p>
              <p>Here are fourteen times people did that, or failed to, and what each teaches.</p>
            </div>

            <nav aria-label="Chapters" className="rise mt-9 md:mt-12" style={{ animationDelay: "140ms" }}>
              <ol className="grid grid-cols-2 border-t border-line lg:grid-cols-4">
                {CHAPTERS.map((c) => (
                  <li key={c.id} className="border-b border-line lg:border-b-0">
                    <a href={`#${c.id}`} className="group flex min-h-11 flex-col gap-0.5 py-3 pr-3 md:py-4 md:pr-4">
                      <span className="text-xs text-ink-muted tabular-nums">{c.years}</span>
                      <span className="flex items-center gap-1.5 font-display text-lg font-[650] group-hover:underline group-hover:underline-offset-4 max-md:leading-tight md:text-xl">
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
            <section key={c.id} id={c.id} aria-labelledby={`c-${c.id}`} className="scroll-mt-20 border-t border-line pt-8 md:scroll-mt-24 md:pt-20">
              <Reveal className={`${storyGrid} mb-6 md:mb-16`}>
                <p className="col-span-2 text-sm font-medium text-clay-ink md:col-span-1 md:pt-3 md:text-right">{c.years}</p>
                <div className="col-span-2 mt-2 md:col-span-1 md:col-start-3 md:mt-0">
                  <h2
                    id={`c-${c.id}`}
                    className="font-display text-[clamp(2.2rem,1.4rem+3.2vw,4rem)] font-[650] leading-[0.98] tracking-[-0.018em]"
                    style={{ fontVariationSettings: "'wdth' 84" }}
                  >
                    {c.title}
                  </h2>
                  <p className="mt-2 max-w-[52ch] text-ink-muted md:mt-4 md:text-lg">{c.dek}</p>
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
        <section aria-labelledby="everyday-uses" className="bg-ink py-10 text-paper md:py-28">
          <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6">
            <Reveal className="mb-8 grid gap-4 md:mb-12 md:grid-cols-12">
              <p className="text-sm font-medium text-paper/70 md:col-span-3 md:pt-3">Today</p>
              <div className="space-y-4 md:col-span-9">
                <h2
                  id="everyday-uses"
                  className="font-display text-[clamp(2.2rem,1.4rem+3.2vw,4rem)] font-[650] leading-[0.98] tracking-[-0.018em]"
                  style={{ fontVariationSettings: "'wdth' 84" }}
                >
                  Where you already use it
                </h2>
                <p className="max-w-[52ch] text-lg text-paper/70">None of this stayed in the history books. You use it every day.</p>
              </div>
            </Reveal>
            <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-[24px] bg-paper/15 lg:grid-cols-4">
              {EVERYDAY.map((e) => (
                <li key={e.name} className="bg-ink">
                  <a href={topicHref(e.topic)} className="group flex h-full flex-col gap-2 p-4 transition-colors hover:bg-paper/5 sm:min-h-40 sm:gap-3 sm:p-6">
                    <span className="flex items-center justify-between gap-2 font-display text-xl font-[650] sm:gap-3 sm:text-2xl">
                      {e.name}
                      <ArrowUpRight className="size-4 shrink-0 text-paper/40 sm:size-5 transition-colors group-hover:text-clay" />
                    </span>
                    <span className="text-sm leading-snug text-paper/70 sm:text-base sm:leading-normal">{e.line}</span>
                    <span className="mt-auto text-xs text-paper/70 sm:text-sm">Topic {topicOf(e.topic).n}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------- close ---------- */}
        <section className="mx-auto w-full max-w-[1200px] px-4 py-10 md:px-6 md:py-28">
          <Reveal className="flex flex-col items-center text-center">
            <h2
              className="max-w-[16ch] font-display text-[clamp(2.4rem,1.4rem+4vw,4.8rem)] font-[680] leading-[0.95] tracking-[-0.02em]"
              style={{ fontVariationSettings: "'wdth' 80" }}
            >
              Every idea here is a topic.
            </h2>
            <p className="mt-4 max-w-[44ch] text-lg text-ink-muted md:mt-5">Read it in a sentence, drag it in a lab, then drill it with fresh numbers.</p>
            <a
              href={studyHref("#learn/topics/data")}
              className="mt-7 inline-flex h-12 items-center md:mt-9 gap-2 rounded-full bg-ink px-7 font-medium text-paper transition-colors hover:bg-ink/85"
            >
              Start with topic 1 <ArrowRight className="size-4" />
            </a>
          </Reveal>
        </section>

        {/* ---------- sources ---------- */}
        <section aria-labelledby="story-sources" className="mx-auto w-full max-w-[1200px] px-4 pb-14 md:px-6 md:pb-20">
          <div className="grid gap-3 border-t border-line pt-6 md:grid-cols-12 md:gap-4 md:pt-10">
            <div className="md:col-span-3">
              <h2 id="story-sources" className="font-display text-2xl font-[650]">
                Sources
              </h2>
            </div>
            <div className="md:col-span-9">
              <p className="max-w-[62ch] text-ink-muted">
                Every date and number above was checked against these. Where accounts disagree, the story leaves the detail out.
              </p>
              <details className="group/src mt-5">
                <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-full border border-line px-4 text-[0.95rem] font-medium transition-colors hover:bg-sand [&::-webkit-details-marker]:hidden">
                  <span className="group-open/src:hidden">Show all {SOURCES.length} sources</span>
                  <span className="hidden group-open/src:inline">Hide the sources</span>
                  <ChevronDown aria-hidden className="size-4 transition-transform duration-200 group-open/src:rotate-180 motion-reduce:transition-none" />
                </summary>
                <ul className="mt-5 divide-y divide-line border-y border-line">
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
              </details>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </Motion>
  );
}
