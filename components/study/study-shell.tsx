import { SiteHeader } from "@/components/site-header";
import { StudyBottomNav } from "@/components/study/bottom-nav";
import "@/app/study/study.css";

/** Every study page: the header, the page, the progress note, and the phone tab bar. */
export function StudyShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader mode="study" />
      <div className="mx-auto w-full max-w-[1200px] px-4 pb-[calc(76px+env(safe-area-inset-bottom,0px))] md:px-6 lg:pb-0">
        <main id="main" tabIndex={-1} className="min-h-[70vh] outline-none">
          {children}
        </main>
        <footer className="mt-8 border-t border-line py-6 font-mono text-xs tracking-[0.04em] text-ink-muted print:hidden">
          Your progress saves in this browser only.
        </footer>
      </div>
      <StudyBottomNav />
    </>
  );
}
