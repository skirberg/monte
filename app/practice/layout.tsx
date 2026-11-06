import { StudyShell } from "@/components/study/study-shell";
import { PracticeBar } from "@/components/study/practice-bar";

export default function PracticeLayout({ children }: { children: React.ReactNode }) {
  return (
    <StudyShell>
      <h1 className="sr-only">Practice</h1>
      <PracticeBar />
      {children}
    </StudyShell>
  );
}
