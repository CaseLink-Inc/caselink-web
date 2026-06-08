import { Image as ImageIcon } from "@/components/icons";

/**
 * Placeholder figure for article imagery. Renders a branded, accent-tinted
 * panel with an image glyph so it reads as an intentional visual rather than
 * a broken image. When real images arrive, swap the inner panel for a
 * <next/image> and keep the same wrapper/caption.
 */
export default function ResourceFigure({
  accent = "#3E8EFF",
  variant = "inline",
  caption,
}: {
  accent?: string;
  variant?: "hero" | "inline";
  caption?: string;
}) {
  return (
    <figure
      className={`res-figure res-figure-${variant}`}
      style={{ "--accent": accent } as React.CSSProperties}
    >
      <div className="res-figure-ph">
        <span className="res-figure-glyph" aria-hidden="true">
          <ImageIcon width={20} height={20} />
        </span>
      </div>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}
