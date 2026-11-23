import { ToolPage } from "@/components/decide/tool-page";
import { Bet } from "@/components/decide/bet";
import { toolMetadata } from "@/lib/decide/tools";

export const metadata = toolMetadata("bet");

export default function Page() {
  return (
    <ToolPage id="bet">
      <Bet />
    </ToolPage>
  );
}
