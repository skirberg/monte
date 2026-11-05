import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { Suspense } from "react";
import { Drill } from "@/components/study/drill";

export const metadata: Metadata = pageMeta("/study/practice/drill/", "Drill", "Statistics drills with fresh numbers every time, timed or untimed, a mock test, Monte Daily and the questions you missed.");

// Suspense: the drill reads ?go= and ?topic= from the address, which a static page only knows in the browser.
export default function DrillPage() {
  return (
    <Suspense>
      <Drill />
    </Suspense>
  );
}
