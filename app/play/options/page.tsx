import type { Metadata } from "next";
import { gameMeta } from "@/lib/seo";
import { GameShell } from "@/components/play/game-shell";
import { GAME_EXPLAIN } from "@/lib/play/explain";
import { Options } from "@/components/play/options";

export const metadata: Metadata = gameMeta("options");

export default function Page() {
  return (
    <GameShell
      slug="options"
      explain={GAME_EXPLAIN.options}
    >
      <Options />
    </GameShell>
  );
}
