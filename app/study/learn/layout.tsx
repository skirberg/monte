import { StudyShell } from "@/components/study/study-shell";
import { LearnFrame } from "@/components/study/learn-bar";

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return (
    <StudyShell>
      <LearnFrame>{children}</LearnFrame>
    </StudyShell>
  );
}
