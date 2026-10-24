import { ToolPage } from "@/components/decide/tool-page";
import { AbTest } from "@/components/decide/ab-test";
import { toolMetadata } from "@/lib/decide/tools";

export const metadata = toolMetadata("abtest");

export default function Page() {
  return (
    <ToolPage id="abtest">
      <AbTest />
    </ToolPage>
  );
}
