import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { StartModule } from "@/components/study/start";

export const metadata: Metadata = pageMeta("/study/learn/start/", "Same number, three questions", "One value, the average of many, or a range for a mean nobody knows yet: learn to tell which question a problem asks, then practice on fifteen cases.");

export default function Page() {
  return <StartModule />;
}
