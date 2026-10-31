export default function ResourcePullQuote({
  text,
  accent = "#3E8EFF",
}: {
  text: string;
  accent?: string;
}) {
  return (
    /* Three layers: the element carries two crossing lenses, ::before is
       the sheet of glass that blurs them, and the text rides above both.
       The text needs its own element because inline content paints under
       a positioned pseudo-element. */
    <blockquote
      className="res-pullquote"
      style={{ "--accent": accent } as React.CSSProperties}
    >
      <span className="res-pq-text">{text}</span>
    </blockquote>
  );
}
