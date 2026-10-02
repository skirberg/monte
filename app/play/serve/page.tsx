import type { Metadata } from "next";
import { GameShell } from "@/components/play/game-shell";
import { ServeMath } from "@/components/play/serve-math";

export const metadata: Metadata = {
  alternates: { canonical: "/play/serve/" },
  title: "Serve math",
  description: "How a small edge on serve points compounds into games and sets. Probability with a tennis racket.",
};

export default function Page() {
  return (
    <GameShell
      slug="serve"
      explain={
        <>
          <p>
            Treat every point as an independent trial the server wins with probability <b>p</b> (and loses with q = 1 − p). To hold, you
            need 4 points before your opponent gets 3, or you win from deuce.
          </p>
          <p>
            <code>P(hold) = p⁴(1 + 4q + 10q²) + 20p³q³ · p² / (1 − 2pq)</code>
          </p>
          <p>
            The 1, 4 and 10 count the orders in which you can win 4–0, 4–1 or 4–2 (your fourth point always comes last), and the 20
            counts the orders that reach deuce at 3–3. That is the binomial coefficient at work. From deuce you need two points in a row
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
      }
    >
      <ServeMath />
    </GameShell>
  );
}
