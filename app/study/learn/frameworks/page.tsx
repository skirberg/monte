import type { Metadata } from "next";
import { Frameworks } from "@/components/study/frameworks";

export const metadata: Metadata = {
  title: "Frameworks",
  description: "Which formula? Answer three questions. Plus the three moves in every probability question and the words that decide a test problem.",
  alternates: { canonical: "/study/learn/frameworks/" },
};

export default function Page() {
  return <Frameworks />;
}
