import { ToolPage } from "@/components/decide/tool-page";
import { MonteCarlo } from "@/components/decide/monte-carlo";
import { toolMetadata } from "@/lib/decide/tools";

export const metadata = toolMetadata("choose");

export default function Page() {
  return (
    <ToolPage id="choose">
      <MonteCarlo />
    </ToolPage>
  );
}
