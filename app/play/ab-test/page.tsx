import type { Metadata } from "next";
import { gameShare } from "@/lib/seo";
import { GameShell } from "@/components/play/game-shell";
import { AbTest } from "@/components/play/ab-test";

export const metadata: Metadata = {
  alternates: { canonical: "/play/ab-test/" },
  title: "Don't peek",
  description: "Why checking an A/B test every day finds winners that are not there. Hypothesis testing by simulation.",
  ...gameShare("ab-test", "Don't peek", "Why checking an A/B test every day finds winners that are not there. Hypothesis testing by simulation."),
};

export default function Page() {
  return (
    <GameShell
      slug="ab-test"
      explain={
        <>
          <p>
            Each test compares two conversion rates with a <b>two-proportion z-test</b>:{" "}
            <code>z = (p̂B − p̂A) / √[p̂(1 − p̂)(1/nA + 1/nB)]</code>, where p̂ pools both groups. A p-value under 0.05 is called significant.
          </p>
          <p>
            That 5% promise holds for <b>one</b> look at a sample size you fixed in advance. Check every day and stop the first time p dips
            under 0.05, and you give chance twenty tries to fool you. With no real difference, the simulation shows the false winner rate
            jumping from about 5% to roughly a quarter of all tests.
          </p>
          <p>
            Fixes used in practice: decide the sample size before you start and look once, or use a sequential test built for repeated
            looks. Either way, a significant result you went fishing for is weaker evidence than it looks.
          </p>
        </>
      }
    >
      <AbTest />
    </GameShell>
  );
}
