import type { Metadata } from "next";
import { FormulaSheet } from "@/components/study/formula-sheet";

export const metadata: Metadata = {
  title: "Formula sheet",
  description: "Every formula in business statistics, when to use it and a worked example. Built to print.",
  alternates: { canonical: "/study/learn/formulas/" },
};

export default function Page() {
  return <FormulaSheet />;
}
