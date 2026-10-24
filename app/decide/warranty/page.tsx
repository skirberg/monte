import { ToolPage } from "@/components/decide/tool-page";
import { Warranty } from "@/components/decide/warranty";
import { toolMetadata } from "@/lib/decide/tools";

export const metadata = toolMetadata("warranty");

export default function Page() {
  return (
    <ToolPage id="warranty">
      <Warranty />
    </ToolPage>
  );
}
