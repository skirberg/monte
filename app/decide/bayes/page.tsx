import { ToolPage } from "@/components/decide/tool-page";
import { Bayes } from "@/components/decide/bayes";
import { toolMetadata } from "@/lib/decide/tools";

export const metadata = toolMetadata("bayes");

export default function Page() {
  return (
    <ToolPage id="bayes">
      <Bayes />
    </ToolPage>
  );
}
