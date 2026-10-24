"use client";

import { usePathname } from "next/navigation";
import { study } from "@/lib/study/routes";
import { SegNav } from "@/components/study/ui";

const VIEWS = [
  { href: study.drill, label: "Drill" },
  { href: study.math, label: "Quick math" },
  { href: study.cards, label: "Flashcards" },
];

/** Practice: drills, quick math and flashcards, each its own page. */
export function PracticeBar() {
  const pathname = usePathname() ?? "";
  const current = VIEWS.find((v) => pathname.startsWith(v.href))?.href ?? study.drill;
  return (
    <div className="py-5 print:hidden">
      <SegNav label="Practice views" items={VIEWS} current={current} />
    </div>
  );
}
