import type { Metadata } from "next";
import { gameMeta } from "@/lib/seo";
import { GameShell } from "@/components/play/game-shell";
import { GAME_EXPLAIN } from "@/lib/play/explain";
import { HouseEdge } from "@/components/play/house-edge";

export const metadata: Metadata = gameMeta("house-edge");

export default function Page() {
  return (
    <GameShell
      slug="house-edge"
      explain={GAME_EXPLAIN["house-edge"]}
    >
      <HouseEdge />
    </GameShell>
  );
}
