import type { Metadata } from "next";
import { GameShell } from "@/components/play/game-shell";
import { HouseEdge } from "@/components/play/house-edge";

export const metadata: Metadata = {
  alternates: { canonical: "/play/house-edge/" },
  title: "The house edge",
  description: "Roulette, expected value and the law of large numbers. Spin a thousand times, then simulate a thousand players.",
};

export default function Page() {
  return (
    <GameShell
      slug="house-edge"
      explain={
        <>
          <p>
            A European wheel has 37 pockets: 18 red, 18 black and one green 0. A $1 bet on red wins $1 with probability 18/37 and loses $1
            with probability 19/37, so its <b>expected value</b> is <code>18/37 − 19/37 = −1/37 ≈ −2.70%</code> of every dollar bet. The
            American wheel adds a 00, which makes it <code>−2/38 ≈ −5.26%</code>.
          </p>
          <p>
            A single number pays 35 to 1 and wins 1 time in 37: <code>35 × 1/37 − 36/37 = −1/37</code>. Same edge, far more variance. That
            is why more of the crowd is still ahead after betting on 17 than after betting on red, while the average loss is the same.
          </p>
          <p>
            The <b>law of large numbers</b> is the casino&rsquo;s business model: any one player&rsquo;s results swing wildly, but the
            average over millions of spins lands on the edge, and the casino is the only player who makes millions of spins.
          </p>
          <p className="text-sm text-ink-muted">For learning, not gambling advice.</p>
        </>
      }
    >
      <HouseEdge />
    </GameShell>
  );
}
