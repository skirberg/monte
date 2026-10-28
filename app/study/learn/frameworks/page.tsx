import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { Frameworks } from "@/components/study/frameworks";

export const metadata: Metadata = pageMeta("/study/learn/frameworks/", "Frameworks", "Which formula? Answer three questions. Plus the three moves in every probability question and the words that decide a test problem.");

export default function Page() {
  return <Frameworks />;
}
