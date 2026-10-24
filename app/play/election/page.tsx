import type { Metadata } from "next";
import { gameShare } from "@/lib/seo";
import { GameShell } from "@/components/play/game-shell";
import { Election } from "@/components/play/election";

export const metadata: Metadata = {
  alternates: { canonical: "/play/election/" },
  title: "Election night",
  description: "Why a poll of 1,000 people has a margin of error near 3 points, and why the average of many polls beats any one. Confidence intervals by simulation.",
  ...gameShare("election", "Election night", "Why a poll of 1,000 people has a margin of error near 3 points, and why the average of many polls beats any one. Confidence intervals by simulation."),
};

export default function Page() {
  return (
    <GameShell
      slug="election"
      explain={
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
            The formula only counts <b>sampling error</b>, the luck of who gets picked. Real polls also miss because of who answers, who actually
            turns out to vote and how questions are worded. Those errors tend to push every poll the same way, so averaging cannot cancel them.
            That is why real elections miss the polls by more than the margin of error says.
          </p>
        </>
      }
    >
      <Election />
    </GameShell>
  );
}
