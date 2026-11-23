import { Loader } from "@/components/brand/loader";

// Shown while the next page's data arrives on a client-side navigation.
export default function Loading() {
  return <Loader className="min-h-[60vh]" />;
}
