import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { Suspense } from "react";
import { Drill } from "@/components/study/drill";
import { Loader } from "@/components/brand/loader";

export const metadata: Metadata = pageMeta("/practice/drill/", "Statistics practice problems and a mock test", "Statistics practice problems with fresh numbers every time, timed or untimed, a full mock test, Monte Daily and the questions you missed.");

// Suspense: the drill reads ?go= and ?topic= from the address, which a static page only knows in the browser.
// Until then the static HTML shows the loader instead of an empty page.
export default function DrillPage() {
  return (
    <Suspense fallback={<Loader className="min-h-[60vh]" label="Loading the drill" />}>
      <Drill />
    </Suspense>
  );
}
