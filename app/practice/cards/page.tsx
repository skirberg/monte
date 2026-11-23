import type { Metadata } from "next";
import { Suspense } from "react";
import { pageMeta } from "@/lib/seo";
import { Flashcards } from "@/components/study/flashcards";

export const metadata: Metadata = pageMeta("/practice/cards/", "Statistics flashcards", "Statistics flashcards: terms, formulas and memory hooks, each back just before you would forget it.");

export default function FlashcardsPage() {
  // Suspense: the cards read ?go=due from the address, which a static page only knows in the browser.
  return (
    <Suspense>
      <Flashcards />
    </Suspense>
  );
}
