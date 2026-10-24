import type { Metadata } from "next";
import { QuickMath } from "@/components/study/quick-math";

export const metadata: Metadata = {
  title: "Quick math",
  description: "Mental math tricks for statistics: percents, squares and roots, z anchors and estimates, with 60-second sprints.",
  alternates: { canonical: "/study/practice/math/" },
};

export default function QuickMathPage() {
  return <QuickMath />;
}
