import type { Metadata } from "next";
import { gameShare } from "@/lib/seo";
import { GameShell } from "@/components/play/game-shell";
import { Options } from "@/components/play/options";

export const metadata: Metadata = {
  alternates: { canonical: "/play/options/" },
  title: "Price an option",
  description: "Monte Carlo option pricing next to the Black-Scholes formula. The normal distribution at work in finance.",
  ...gameShare("options", "Price an option", "Monte Carlo option pricing next to the Black-Scholes formula. The normal distribution at work in finance."),
};

export default function Page() {
  return (
    <GameShell
      slug="options"
      explain={
        <>
          <p>
            A <b>call</b> pays <code>max(S_T − K, 0)</code> at expiry; a <b>put</b> pays <code>max(K − S_T, 0)</code>. To price one, simulate
            the stock under <b>risk-neutral</b> rules, where it grows at the interest rate: <code>S_T = S₀ · exp((r − σ²/2)T + σ√T · Z)</code>{" "}
            with Z a standard normal draw. Average the payoffs, discount by <code>e^(−rT)</code>, and you have a Monte Carlo price.
          </p>
          <p>
            <b>Black-Scholes</b> does the same average in closed form:{" "}
            <code>C = S₀N(d₁) − Ke^(−rT)N(d₂)</code>, with <code>d₁ = [ln(S₀/K) + (r + σ²/2)T] / (σ√T)</code> and <code>d₂ = d₁ − σ√T</code>.
            N is the normal CDF from the normal curve topic. At S₀ = K = 100, one year, 5% and σ = 20%, the call is worth $10.45.
          </p>
          <p>
            The Monte Carlo error shrinks like <code>1/√n</code>: four times the paths, half the error. That is why the shaded band narrows
            slowly, and why banks use Monte Carlo for options too complex for a formula.
          </p>
          <p className="text-sm text-ink-muted">A textbook model (constant volatility, no dividends). For learning, not investment advice.</p>
        </>
      }
    >
      <Options />
    </GameShell>
  );
}
