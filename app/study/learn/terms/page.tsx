import type { Metadata } from "next";
import { TermsList } from "@/components/study/terms-list";

export const metadata: Metadata = {
  title: "Terms",
  description: "Every key word in business statistics in plain English, with a quick example.",
  alternates: { canonical: "/study/learn/terms/" },
};

export default function Page() {
  return <TermsList />;
}
