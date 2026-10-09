import type { Metadata } from "next";
import { gameShare } from "@/lib/seo";
import { GameShell } from "@/components/play/game-shell";
import { GuessR } from "@/components/play/guess-r";

export const metadata: Metadata = {
  alternates: { canonical: "/play/correlation/" },
  title: "Guess the correlation",
  description: "Ten scatter plots. Call r by eye. A game for the correlation coefficient.",
  ...gameShare("correlation", "Guess the correlation", "Ten scatter plots. Call r by eye. A game for the correlation coefficient."),
};

export default function Page() {
  return (
    <GameShell
      slug="correlation"
      explain={
        <>
          <p>
            <b>r</b> measures how tightly points hug a straight line, from −1 to +1. The sign gives the direction. The size gives the
            tightness, not the steepness: a shallow line through a tight cloud can have a bigger r than a steep line through a loose one.
          </p>
          <p>
            <code>r = Σ(x − x̄)(y − ȳ) / √[Σ(x − x̄)² · Σ(y − ȳ)²]</code>
          </p>
          <p>
            Square it and you get <b>r²</b>, the share of the spread in y that the line explains. An r of 0.5 explains only 25%, which is
            why a moderate correlation looks so messy.
          </p>
          <p>
            Each plot has 60 points. You are scored against the r of those exact 60 points, not the setting used to draw them. After each
            call, the least-squares line appears so you can see what you were judging.
          </p>
        </>
      }
    >
      <GuessR />
    </GameShell>
  );
}
