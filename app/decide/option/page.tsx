import { ToolPage } from "@/components/decide/tool-page";
import { OptionTrade } from "@/components/decide/option-trade";
import { toolMetadata } from "@/lib/decide/tools";

export const metadata = toolMetadata("option");

export default function Page() {
  return (
    <ToolPage id="option">
      <OptionTrade />
    </ToolPage>
  );
}
