"use client";

import { usePathname } from "next/navigation";
import { sectionFor } from "@/lib/study/routes";

/** Which study section is showing ("home", "learn", "practice"...), or null outside /study. */
export function useStudySection() {
  return sectionFor(usePathname());
}
