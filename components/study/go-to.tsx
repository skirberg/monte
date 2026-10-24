"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/** A section's bare address (/study/solve/) has no page of its own: go to its first page. */
export function GoTo({ href, label }: { href: string; label: string }) {
  const router = useRouter();
  useEffect(() => router.replace(href), [router, href]);
  return (
    <p className="py-16 text-center">
      <Link href={href} className="text-clay-ink underline-offset-4 hover:underline">
        {label}
      </Link>
    </p>
  );
}
