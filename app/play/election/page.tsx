import type { Metadata } from "next";
import { gameMeta } from "@/lib/seo";
import { GameShell } from "@/components/play/game-shell";
import { GAME_EXPLAIN } from "@/lib/play/explain";
import { Election } from "@/components/play/election";
import { RealRace } from "@/components/play/election-real";

export const metadata: Metadata = gameMeta("election");

export default function Page() {
  return (
    <GameShell
      slug="election"
      explain={GAME_EXPLAIN.election}
    >
      <div className="space-y-3">
        <Election />
        <RealRace />
      </div>
    </GameShell>
  );
}
