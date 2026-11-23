import type { Metadata } from "next";
import { gameMeta } from "@/lib/seo";
import { GameShell } from "@/components/play/game-shell";
import { GAME_EXPLAIN } from "@/lib/play/explain";
import { MontyHall } from "@/components/play/monty-hall";

export const metadata: Metadata = gameMeta("monty-hall");

export default function Page() {
  return (
    <GameShell
      slug="monty-hall"
      explain={GAME_EXPLAIN["monty-hall"]}
    >
      <MontyHall />
    </GameShell>
  );
}
