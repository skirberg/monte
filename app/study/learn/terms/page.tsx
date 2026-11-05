import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { TermsList } from "@/components/study/terms-list";

export const metadata: Metadata = pageMeta("/study/learn/terms/", "Terms", "Every key word in statistics in plain English, with a quick example.");

export default function Page() {
  return <TermsList />;
}
