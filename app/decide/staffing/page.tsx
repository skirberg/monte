import { ToolPage } from "@/components/decide/tool-page";
import { Staffing } from "@/components/decide/staffing";
import { toolMetadata } from "@/lib/decide/tools";

export const metadata = toolMetadata("staffing");

export default function Page() {
  return (
    <ToolPage id="staffing">
      <Staffing />
    </ToolPage>
  );
}
