import { SiteHeader } from "@/components/site-header";
import { StudyBottomNav } from "@/components/study/bottom-nav";
import "@/app/study/study.css";

/** Every study page: the header, the page and the phone tab bar. (Where progress is stored is on How it's built.) */
export function StudyShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader mode="study" />
      <div className="mx-auto w-full max-w-page px-gutter pb-[calc(76px+env(safe-area-inset-bottom,0px))] lg:pb-0">
        <main id="main" tabIndex={-1} className="min-h-[70vh] pb-8 outline-none">
          {children}
        </main>
      </div>
      <StudyBottomNav />
    </>
  );
}
