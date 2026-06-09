import Image from "next/image";
import { Image as ImageIcon } from "@/components/icons";

/**
 * Article figure. `wide` is a full-width band, `side` floats beside the body
 * text. Renders the real image when `src` is set; otherwise shows a branded
 * placeholder panel.
 */
export default function ResourceFigure({
  accent = "#3E8EFF",
  variant = "wide",
  side = "right",
  caption,
  src,
  alt,
}: {
  accent?: string;
  variant?: "wide" | "side";
  side?: "left" | "right";
  caption?: string;
  src?: string;
  alt?: string;
}) {
  const cls =
    variant === "side"
      ? `res-figure res-figure-side res-figure-side-${side}`
      : "res-figure res-figure-wide";
  return (
    <figure className={cls} style={{ "--accent": accent } as React.CSSProperties}>
      <div className="res-figure-ph">
        {src ? (
          <Image
            src={src}
            alt={alt ?? ""}
            fill
            sizes={
              variant === "side"
                ? "(max-width: 900px) 100vw, 340px"
                : "(max-width: 900px) 100vw, 760px"
            }
            className="res-figure-img"
          />
        ) : (
          <span className="res-figure-glyph" aria-hidden="true">
            <ImageIcon width={20} height={20} />
          </span>
        )}
      </div>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}
