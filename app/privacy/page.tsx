import type { Metadata } from "next";
import { REPORT_TARGET, REPORT_URL, REPO_PUBLIC, pageMeta } from "@/lib/seo";
import { PlainPage } from "@/components/plain-page";

export const metadata: Metadata = pageMeta("/privacy/", "Privacy", "No accounts and nothing about you on a server: your progress stays in your browser. What Monte counts, and what it never keeps.");

const a = "underline decoration-line-strong underline-offset-4 hover:decoration-ink";

export default function PrivacyPage() {
  return (
    <PlainPage
      title="Privacy"
      updated="November 19, 2026"
      parts={[
        { h: "No accounts", p: "Monte has no sign-up and asks for nothing about you: no name, no email, no password." },
        {
          h: "Your progress stays in your browser",
          p: "Points, streaks, topics, drills and the daily chart are saved in this browser's local storage, on your device. They are never sent to a server. Clearing the site's data erases them. To move them, copy the backup code from the progress panel and paste it on the other device.",
        },
        {
          h: "What is counted",
          p: "Vercel Web Analytics and Speed Insights count page views, a few named moments like a finished drill, and how fast pages load. They set no cookies and build no profile of you.",
        },
        {
          h: "Other sites",
          p: (
            <>
              Topic videos come from YouTube&rsquo;s privacy-enhanced mode and load only when you tap play. The election game asks Polymarket&rsquo;s public site for live odds. Links to other sites follow
              those sites&rsquo; own policies.
            </>
          ),
        },
        {
          h: "The MCP server",
          p: "mcp.monte.markets answers each request and keeps nothing. Its host, Vercel, keeps short request logs for running the service.",
        },
        {
          h: "Questions",
          p: (
            <>
              {REPO_PUBLIC ? "Open an issue on " : "Ask "}
              <a className={a} href={REPORT_URL} target={REPORT_TARGET} rel="noreferrer">
                {REPO_PUBLIC ? "GitHub" : "Sami Kirberg"}
              </a>
              {REPO_PUBLIC ? "." : ", who makes Monte."}
            </>
          ),
        },
      ]}
    />
  );
}
