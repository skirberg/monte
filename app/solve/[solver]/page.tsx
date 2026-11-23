import type { Metadata } from "next";
import { SOLVER_SEARCH, abs, breadcrumbList, pageMeta } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { sym } from "@/lib/study/symbols";
import { notFound } from "next/navigation";
import { SOLVER_IDS, isSolverId, study } from "@/lib/study/routes";
import { solverById } from "@/lib/study/solvers";
import { SOLVERS as NAV } from "@/lib/site-data";
import { StudyShell } from "@/components/study/study-shell";
import { SolverPanel } from "@/components/study/solver";
import { SolveNav } from "@/components/study/solve-nav";
import { PageHead } from "@/components/study/ui";
import { SafePart } from "@/components/safe-part";

export const dynamicParams = false;
export const generateStaticParams = () => SOLVER_IDS.map((solver) => ({ solver }));

type Props = { params: Promise<{ solver: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = (await params).solver;
  const s = isSolverId(id) ? solverById(id) : undefined;
  if (!s) return {};
  const q = SOLVER_SEARCH[s.id];
  return pageMeta(study.solve(s.id), q.title, q.description);
}

/** Solve: one solver per page. Type the numbers from any problem; every question shows up with the work. */
export default async function SolvePage({ params }: Props) {
  const id = (await params).solver;
  if (!isSolverId(id) || !solverById(id)) notFound();
  const s = solverById(id);
  const q = SOLVER_SEARCH[id];
  return (
    <StudyShell>
      <JsonLd
        data={{
          "@graph": [
            {
              // A calculator that runs in the browser, free and with no sign-up, and shows its work.
              "@type": ["WebApplication", "LearningResource"],
              name: q.heading,
              alternateName: s.title,
              description: q.description,
              url: abs(study.solve(id)),
              applicationCategory: "EducationalApplication",
              operatingSystem: "Any, in a web browser",
              offers: { "@type": "Offer", price: 0, priceCurrency: "USD" },
              learningResourceType: "Calculator",
              inLanguage: "en",
              isAccessibleForFree: true,
            },
            breadcrumbList([[q.heading, study.solve(id)]]),
          ],
        }}
      />
      {/* The page's heading is the solver, in the words people search for; the tabs below switch solvers. */}
      <div className="grid gap-2 pb-2 pt-8">
        <PageHead title={q.heading} id="solver-h">
          <p className="max-w-measure text-base text-ink-muted">{sym(s.sub)}</p>
        </PageHead>
      </div>
      <SolveNav items={NAV.map((n) => ({ href: study.solve(n.id), label: n.name }))} current={study.solve(id)} />
      <div className="max-w-content pb-8 pt-5">
        <SafePart name="solver">
          <SolverPanel id={id} labelledBy="solver-h" />
        </SafePart>
      </div>
    </StudyShell>
  );
}
