import type { Metadata } from "next";
import { GameShell } from "@/components/play/game-shell";
import { FakeCoin } from "@/components/play/fake-coin";

export const metadata: Metadata = {
  alternates: { canonical: "/play/fake-coin/" },
  title: "Can you fake a coin?",
  description: "Type 50 flips that look random, then see how they compare with 20,000 real ones.",
};

export default function Page() {
  return (
    <GameShell
      slug="fake-coin"
      explain={
        <>
          <p>
            A fair coin switches sides only half the time. Fifty real flips average 25.5 <b>runs</b> (unbroken stretches of H or T), and
            their longest streak averages about 6. Fakes usually switch too often and dodge long streaks, so they come out too tidy.
          </p>
          <p>
            The verdict is a <b>hypothesis test</b>. The null hypothesis is a fair coin with independent flips. Your page flips 20,000
            real sequences of 50 and asks, for switches, longest streak and number of heads, how often a real coin lands at least as far
            from average as you did, in either direction. That share is a two-sided p-value.
          </p>
          <p>
            Each test uses a 2% cutoff, so a truly random sequence gets flagged only about 3% of the time. Passing does not prove you are
            random; it means the test could not tell.
          </p>
        </>
      }
    >
      <FakeCoin />
    </GameShell>
  );
}
