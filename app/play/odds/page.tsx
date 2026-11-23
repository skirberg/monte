import type { Metadata } from "next";
import { gameMeta } from "@/lib/seo";
import { GameShell } from "@/components/play/game-shell";
import { GAME_EXPLAIN } from "@/lib/play/explain";
import { Odds } from "@/components/play/odds";

export const metadata: Metadata = gameMeta("odds");

export default function Page() {
  return (
    <GameShell
      slug="odds"
      explain={GAME_EXPLAIN.odds}
    >
      <Odds />
    </GameShell>
  );
}
