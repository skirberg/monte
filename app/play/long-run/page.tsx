import type { Metadata } from "next";
import { gameShare } from "@/lib/seo";
import { GameShell } from "@/components/play/game-shell";
import { LongRun } from "@/components/play/long-run";

export const metadata: Metadata = {
  alternates: { canonical: "/play/long-run/" },
  title: "The long run",
  description: "98 years of real S&P 500, small cap, Treasury and T-bill returns. Volatility drag and a Monte Carlo of 2,000 futures.",
  ...gameShare("long-run", "The long run", "98 years of real S&P 500, small cap, Treasury and T-bill returns. Volatility drag and a Monte Carlo of 2,000 futures."),
};

export default function Page() {
  return (
    <GameShell
      slug="long-run"
      explain={
        <>
          <p>
            The <b>arithmetic mean</b> averages the yearly returns. The <b>geometric mean</b> is the rate your money actually compounded at:{" "}
            <code>(Π(1 + rₜ))^(1/n) − 1</code>. The geometric mean is always lower when returns move around, by roughly{" "}
            <code>σ² / 2</code>. For the S&amp;P 500 since 1928 that gap is about 1.8 percentage points a year.
          </p>
          <p>
            The simulation is a <b>bootstrap Monte Carlo</b>: build each future by drawing real historical years at random, with replacement,
            then repeat 2,000 times and read off the percentiles. It keeps every real crash and boom, but it assumes years are independent,
            so it ignores streaks and changing regimes. Treat it as a model, not a forecast.
          </p>
          <p>
            Data: annual total returns from Aswath Damodaran&rsquo;s <i>Historical Returns on Stocks, Bonds and Bills</i> at NYU Stern, updated
            January 5, 2026.
          </p>
          <p className="text-sm text-ink-muted">For learning, not investment advice.</p>
        </>
      }
    >
      <LongRun />
    </GameShell>
  );
}
