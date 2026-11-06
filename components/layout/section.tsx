import { cn } from "cn";

/**
 * The page grid (DESIGN.md, "Layout"): 4 columns on phones, 12 from tablets up,
 * gutter-wide gaps. Children place themselves with col-span classes.
 */
export const grid = "grid grid-cols-4 gap-x-gutter md:grid-cols-12";

/** The page column: one width and one side margin for every section. */
export const page = "mx-auto w-full max-w-page px-gutter";

type SectionProps = React.ComponentPropsWithoutRef<"section"> & {
  /**
   * "paper" sections space themselves from the one above (pt-section), so two neighbours
   * never stack double padding. "sand" sits on its own ground and pads both sides.
   */
  tone?: "paper" | "sand";
  /** The last section before the footer also pads its bottom. */
  last?: boolean;
  /** "block" for the first section under the header, which needs less air than a section break. */
  top?: "section" | "block";
  inner?: string;
};

/** Every home page band: the page column plus the section rhythm, nothing hand-set. */
export function Section({ tone = "paper", last, top = "section", className, inner, children, ...rest }: SectionProps) {
  return (
    <section
      {...rest}
      className={cn(
        tone === "sand" && "border-y border-line bg-sand/60",
        top === "block" ? "pt-block" : "pt-section",
        (last || tone === "sand") && "pb-section",
        className,
      )}
    >
      <div className={cn(page, inner)}>{children}</div>
    </section>
  );
}
