import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { QuickMath } from "@/components/study/quick-math";

export const metadata: Metadata = pageMeta("/study/practice/math/", "Quick math", "Mental math tricks for statistics: percents, squares and roots, z anchors and estimates, with 60-second sprints.");

export default function QuickMathPage() {
  return <QuickMath />;
}
