import type { Metadata } from "next";
import { gameMeta } from "@/lib/seo";
import { GameShell } from "@/components/play/game-shell";
import { GAME_EXPLAIN } from "@/lib/play/explain";
import { LongRun } from "@/components/play/long-run";

export const metadata: Metadata = gameMeta("long-run");

export default function Page() {
  return (
    <GameShell
      slug="long-run"
      explain={GAME_EXPLAIN["long-run"]}
    >
      <LongRun />
    </GameShell>
  );
}
