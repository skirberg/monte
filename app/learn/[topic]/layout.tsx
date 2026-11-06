import { TopicsFrame } from "@/components/study/topics-frame";

// The topic comes from the route, so the server and the browser agree on which one is open.
export default async function TopicsLayout({ children, params }: { children: React.ReactNode; params: Promise<{ topic: string }> }) {
  const { topic } = await params;
  return <TopicsFrame topic={topic}>{children}</TopicsFrame>;
}
