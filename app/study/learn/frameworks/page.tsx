import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { Frameworks } from "@/components/study/frameworks";

export const metadata: Metadata = pageMeta("/study/learn/frameworks/", "Frameworks", "Which method? Answer a few questions and see what has to be true for it to work. Plus the three moves in every probability question and the words that are clues, not answers.");

export default function Page() {
  return <Frameworks />;
}
