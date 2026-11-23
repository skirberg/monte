import type { Metadata } from "next";
import { gameMeta } from "@/lib/seo";
import { GameShell } from "@/components/play/game-shell";
import { GAME_EXPLAIN } from "@/lib/play/explain";
import { ServeMath } from "@/components/play/serve-math";

export const metadata: Metadata = gameMeta("serve");

export default function Page() {
  return (
    <GameShell
      slug="serve"
      explain={GAME_EXPLAIN.serve}
    >
      <ServeMath />
    </GameShell>
  );
}
