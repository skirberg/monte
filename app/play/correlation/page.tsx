import type { Metadata } from "next";
import { gameMeta } from "@/lib/seo";
import { GameShell } from "@/components/play/game-shell";
import { GAME_EXPLAIN } from "@/lib/play/explain";
import { GuessR } from "@/components/play/guess-r";

export const metadata: Metadata = gameMeta("correlation");

export default function Page() {
  return (
    <GameShell
      slug="correlation"
      explain={GAME_EXPLAIN.correlation}
    >
      <GuessR />
    </GameShell>
  );
}
