import type { Metadata } from "next";
import { GoTo } from "@/components/study/go-to";
import { study } from "@/lib/study/routes";

export const metadata: Metadata = { robots: { index: false }, alternates: { canonical: study.learn } };

export default function Page() {
  return <GoTo href={study.learn} label="See all topics" />;
}
