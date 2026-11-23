import { cn } from "@/lib/cn";
import { ICON_CURVE } from "./logo-art";

/**
 * The loader: the logo's curve rising from the ground like a pile of grains, then settling back, on a loop.
 * The pile's outline waits underneath in the clay tint so the shape is there from the first frame. With reduced
 * motion the animation stops at once on the full curve (globals.css), so it never shows an empty box.
 */
export function Loader({ className, label = "Loading" }: { className?: string; label?: string }) {
  return (
    <div role="status" className={cn("grid place-items-center", className)}>
      <svg viewBox="0 0 512 512" className="size-16" aria-hidden>
        <path d={ICON_CURVE} fill="var(--clay-tint)" />
        <path d={ICON_CURVE} fill="var(--clay)" className="monte-pile" />
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  );
}
