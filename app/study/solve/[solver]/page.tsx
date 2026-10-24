import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SOLVER_IDS, isSolverId, study } from "@/lib/study/routes";
import { solverById } from "@/lib/study/solvers";
import { SOLVERS as NAV } from "@/lib/site-data";
import { StudyShell } from "@/components/study/study-shell";
import { SolverPanel } from "@/components/study/solver";
import { SolveNav } from "@/components/study/solve-nav";
import { PageHead, lead } from "@/components/study/ui";

export const dynamicParams = false;
export const generateStaticParams = () => SOLVER_IDS.map((solver) => ({ solver }));

type Props = { params: Promise<{ solver: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = (await params).solver;
  const s = isSolverId(id) ? solverById(id) : undefined;
  if (!s) return {};
  return { title: `${s.title} solver`, description: s.sub, alternates: { canonical: study.solve(s.id) } };
}

/** Solve: one solver per page. Type the numbers from any problem; every question shows up with the work. */
export default async function SolvePage({ params }: Props) {
  const id = (await params).solver;
  if (!isSolverId(id) || !solverById(id)) notFound();
  return (
    <StudyShell>
      <div className="grid gap-2 pb-2 pt-8">
        <PageHead title="Solve">
          <p className={`${lead} max-w-[62ch] text-ink-muted`}>
            Type in the numbers from any problem and every question you could be asked shows up with the work. Tap New problem to practice on paper first, then Show answers.
          </p>
        </PageHead>
      </div>
      <SolveNav items={NAV.map((s) => ({ href: study.solve(s.id), label: s.name }))} current={study.solve(id)} />
      <div className="max-w-[980px] pb-8 pt-5">
        <SolverPanel id={id} />
      </div>
    </StudyShell>
  );
}
