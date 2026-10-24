import { TOPIC_IDS, TOOLS, isTopicId } from "./data";

/**
 * Every study page is a real route under /study/. The paths spell out what the old hash routes
 * said (#learn/topics/normal is now /study/learn/topics/normal/), so analytics paths stay the same.
 */
export const SOLVER_IDS = ["tree", "draws", "events", "trials", "poisson", "normal", "samp", "ci", "test", "bday", "data"] as const;
export type SolverId = (typeof SOLVER_IDS)[number];
export const isSolverId = (id: unknown): id is SolverId => SOLVER_IDS.includes(id as SolverId);

export const study = {
  today: "/study/",
  learn: "/study/learn/",
  topic: (id: string) => `/study/learn/topics/${id}/`,
  formulas: "/study/learn/formulas/",
  terms: "/study/learn/terms/",
  frameworks: "/study/learn/frameworks/",
  drill: "/study/practice/drill/",
  /** Opens the drill page and starts a set right away. */
  drillStart: (go: "start" | "mock" | "due" | "daily") => `/study/practice/drill/?go=${go}`,
  drillTopic: (id: string) => `/study/practice/drill/?topic=${id}`,
  math: "/study/practice/math/",
  cards: "/study/practice/cards/",
  solve: (id: string = "tree") => `/study/solve/${id}/`,
  tools: (id: string = "excel") => `/study/tools/${id}/`,
  sources: "/study/sources/",
} as const;

/**
 * Maps an old hash route (#learn/topics/normal, #practice/drill/mock, #solve/ci) to its page.
 * Unknown ids fall back to the section's index, so a typed or stale hash never becomes a path.
 */
export function pathForHash(hash: string): string {
  const p = hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  const [page, view, item, extra] = p;
  switch (page) {
    case "learn":
      if (view === "formulas") return study.formulas;
      if (view === "terms") return study.terms;
      if (view === "frameworks") return study.frameworks;
      if (view === "topics" && isTopicId(item)) return study.topic(item);
      return study.learn;
    case "practice":
      if (view === "math") return study.math;
      if (view === "cards") return study.cards;
      if (item === "start" || item === "mock" || item === "daily") return study.drillStart(item);
      if (item === "topic" && isTopicId(extra)) return study.drillTopic(extra);
      return study.drill;
    case "solve":
      return study.solve(isSolverId(view) ? view : "tree");
    case "tools":
      return study.tools(TOOLS.some((t) => t.id === view) ? view : "excel");
    case "sources":
      return study.sources;
    default:
      return study.today;
  }
}

/** Top-level sections, for the header, the phone tab bar and the ⌘K menu. */
export const STUDY_SECTIONS = [
  { page: "home", label: "Today", href: study.today },
  { page: "learn", label: "Learn", href: study.learn },
  { page: "practice", label: "Practice", href: study.drill },
  { page: "solve", label: "Solve", href: study.solve() },
  { page: "tools", label: "Tools", href: study.tools() },
  { page: "sources", label: "Sources", href: study.sources },
] as const;
export type StudySection = (typeof STUDY_SECTIONS)[number]["page"];

/** Which section a pathname belongs to, or null outside /study/. */
export function sectionFor(pathname: string | null): StudySection | null {
  if (!pathname?.startsWith("/study")) return null;
  const seg = pathname.replace(/^\/study\/?/, "").split("/")[0];
  return (STUDY_SECTIONS.find((s) => s.page === seg)?.page ?? "home") as StudySection;
}

export const ALL_TOPIC_IDS = TOPIC_IDS;
