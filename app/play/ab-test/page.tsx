import type { Metadata } from "next";
import { gameMeta } from "@/lib/seo";
import { GameShell } from "@/components/play/game-shell";
import { GAME_EXPLAIN } from "@/lib/play/explain";
import { AbTest } from "@/components/play/ab-test";

export const metadata: Metadata = gameMeta("ab-test");

export default function Page() {
  return (
    <GameShell
      slug="ab-test"
      explain={GAME_EXPLAIN["ab-test"]}
    >
      <AbTest />
    </GameShell>
  );
}
