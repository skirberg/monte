import { ToolPage } from "@/components/decide/tool-page";
import { Market } from "@/components/decide/market";
import { toolMetadata } from "@/lib/decide/tools";

export const metadata = toolMetadata("market");

export default function Page() {
  return (
    <ToolPage id="market">
      <Market />
    </ToolPage>
  );
}
