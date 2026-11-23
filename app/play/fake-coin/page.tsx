import type { Metadata } from "next";
import { gameMeta } from "@/lib/seo";
import { GameShell } from "@/components/play/game-shell";
import { GAME_EXPLAIN } from "@/lib/play/explain";
import { FakeCoin } from "@/components/play/fake-coin";

export const metadata: Metadata = gameMeta("fake-coin");

export default function Page() {
  return (
    <GameShell
      slug="fake-coin"
      explain={GAME_EXPLAIN["fake-coin"]}
    >
      <FakeCoin />
    </GameShell>
  );
}
