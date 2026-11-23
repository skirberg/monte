import type { Metadata } from "next";
import { GoTo } from "@/components/study/go-to";
import { StudyShell } from "@/components/study/study-shell";
import { study } from "@/lib/study/routes";

export const metadata: Metadata = { robots: { index: false }, alternates: { canonical: study.tools() } };

export default function Page() {
  return (
    <StudyShell>
      <GoTo href={study.tools()} label="Open the tools" />
    </StudyShell>
  );
}
