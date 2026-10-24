import type { Metadata } from "next";
import { Flashcards } from "@/components/study/flashcards";

export const metadata: Metadata = {
  title: "Flashcards",
  description: "Business statistics flashcards: terms, formulas and memory hooks, with cards you miss coming back sooner.",
  alternates: { canonical: "/study/practice/cards/" },
};

export default function FlashcardsPage() {
  return <Flashcards />;
}
