import type { Metadata } from "next";
import { REPORT_TARGET, REPORT_URL, REPO_PUBLIC, pageMeta } from "@/lib/seo";
import { PlainPage } from "@/components/plain-page";

// The code is named here only while the repository is public (REPO_PUBLIC in lib/seo.ts).
export const metadata: Metadata = pageMeta(
  "/terms/",
  "Terms",
  REPO_PUBLIC ? "Monte is free to use. The lessons are CC BY 4.0 and the code is MIT. The numbers are for learning, not advice." : "Monte is free to use. The lessons are CC BY 4.0. The numbers are for learning, not advice.",
);

const a = "underline decoration-line-strong underline-offset-4 hover:decoration-ink";

export default function TermsPage() {
  return (
    <PlainPage
      title="Terms"
      updated="November 19, 2026"
      parts={[
        { h: "Free to use", p: "Monte is free, with no account and no paywall. Use it to learn, teach or check your work." },
        {
          h: "Reusing it",
          p: (
            <>
              The lessons, formulas, glossary and open data are{" "}
              <a className={a} href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">
                CC BY 4.0
              </a>
              {`: reuse them with credit to monte.markets.${REPO_PUBLIC ? " The code is MIT." : ""} The real series in the games belong to their publishers, named beside each chart.`}
            </>
          ),
        },
        {
          h: "For learning, not advice",
          p: `Every number is worked by ${REPO_PUBLIC ? "the same code you can read" : "code"}, and every effort goes into getting it right. Still, Monte is a place to learn: nothing here is financial, medical or legal advice, and it comes with no warranty.`,
        },
        { h: "Fair use", p: "Please don't overload the site or the MCP server, or pass Monte's work off as your own." },
        {
          h: "Questions",
          p: (
            <>
              {REPO_PUBLIC ? "Open an issue on " : "Ask "}
              <a className={a} href={REPORT_URL} target={REPORT_TARGET} rel="noreferrer">
                {REPO_PUBLIC ? "GitHub" : "Sami Kirberg"}
              </a>
              {REPO_PUBLIC ? "." : ", who makes Monte."} See also <a className={a} href="/privacy/">Privacy</a>.
            </>
          ),
        },
      ]}
    />
  );
}
