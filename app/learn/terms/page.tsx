import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { TERMS_PAGE } from "@/lib/study/reference";
import { TermsList } from "@/components/study/terms-list";

export const metadata: Metadata = pageMeta(TERMS_PAGE.path, TERMS_PAGE.title, TERMS_PAGE.description);

export default function Page() {
  return <TermsList />;
}
