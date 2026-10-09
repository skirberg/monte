import type { Metadata } from "next";
import { gameShare } from "@/lib/seo";
import { GameShell } from "@/components/play/game-shell";
import { MontyHall } from "@/components/play/monty-hall";

export const metadata: Metadata = {
  alternates: { canonical: "/play/monty-hall/" },
  title: "Three doors",
  description: "The Monty Hall problem. Play it, then simulate 1,000 games each way.",
  ...gameShare("monty-hall", "Three doors", "The Monty Hall problem. Play it, then simulate 1,000 games each way."),
};

export default function Page() {
  return (
    <GameShell
      slug="monty-hall"
      explain={
        <>
          <p>
            Your first pick has a 1 in 3 chance, and nothing the host does changes that. The other two doors share the remaining 2 in 3.
            The host knows where the car is and always opens a goat, so that whole 2 in 3 ends up behind the one door he leaves closed.
            Switching wins about two games in three.
          </p>
          <p>
            In Bayes terms: <code>P(car behind your door | host shows a goat) = 1/3</code>, so{" "}
            <code>P(car behind the other closed door) = 2/3</code>. The host&rsquo;s choice carries information because he is not opening
            doors at random.
          </p>
          <p>Still not convinced? Picture 100 doors. You pick one, the host opens 98 goats. Would you stay?</p>
          <p>
            You are in good company. After Marilyn vos Savant gave this answer in Parade magazine in 1990, about 10,000 readers wrote in,
            nearly 1,000 of them with PhDs, most saying she was wrong. The mathematician Paul Erdős reportedly stayed unconvinced until
            he saw a computer simulation, which is what the button above runs.
          </p>
        </>
      }
    >
      <MontyHall />
    </GameShell>
  );
}
