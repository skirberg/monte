import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { FORMULAS_PAGE } from "@/lib/study/reference";
import { FormulaSheet } from "@/components/study/formula-sheet";

export const metadata: Metadata = pageMeta(FORMULAS_PAGE.path, FORMULAS_PAGE.title, FORMULAS_PAGE.description);

export default function Page() {
  return <FormulaSheet />;
}
