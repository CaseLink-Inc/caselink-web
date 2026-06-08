import { Image as ImageIcon } from "@/components/icons";

/**
 * Placeholder figure for article imagery. `wide` is a full-width band, `side`
 * floats beside the body text (alternating left/right per article). Swap the
 * inner panel for <next/image> when real images arrive.
 */
export default function ResourceFigure({
  accent = "#3E8EFF",
  variant = "wide",
  side = "right",
  caption,
}: {
  accent?: string;
  variant?: "wide" | "side";
  side?: "left" | "right";
  caption?: string;
}) {
  const cls =
    variant === "side"
      ? `res-figure res-figure-side res-figure-side-${side}`
      : "res-figure res-figure-wide";
  return (
    <figure className={cls} style={{ "--accent": accent } as React.CSSProperties}>
      <div className="res-figure-ph">
        <span className="res-figure-glyph" aria-hidden="true">
          <ImageIcon width={20} height={20} />
        </span>
      </div>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}
