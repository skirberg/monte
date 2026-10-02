import type { Metadata } from "next";
import { GameShell } from "@/components/play/game-shell";
import { Odds } from "@/components/play/odds";

export const metadata: Metadata = {
  alternates: { canonical: "/play/odds/" },
  title: "Read the odds",
  description: "Convert betting lines and prediction market prices into probabilities and find the bookmaker's cut.",
};

export default function Page() {
  return (
    <GameShell
      slug="odds"
      explain={
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
      }
    >
      <Odds />
    </GameShell>
  );
}
