import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { FormulaSheet } from "@/components/study/formula-sheet";

export const metadata: Metadata = pageMeta("/study/learn/formulas/", "Formula sheet", "Every core statistics formula, when to use it and a worked example. Built to print.");

export default function Page() {
  return <FormulaSheet />;
}
