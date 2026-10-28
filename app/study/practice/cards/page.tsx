import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { Flashcards } from "@/components/study/flashcards";

export const metadata: Metadata = pageMeta("/study/practice/cards/", "Flashcards", "Statistics flashcards: terms, formulas and memory hooks, with cards you miss coming back sooner.");

export default function FlashcardsPage() {
  return <Flashcards />;
}
