import { ToolPage } from "@/components/decide/tool-page";
import { Goal } from "@/components/decide/goal";
import { toolMetadata } from "@/lib/decide/tools";

export const metadata = toolMetadata("goal");

export default function Page() {
  return (
    <ToolPage id="goal">
      <Goal />
    </ToolPage>
  );
}
