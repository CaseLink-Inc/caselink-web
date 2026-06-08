export default function ResourcePullQuote({
  text,
  accent = "#3E8EFF",
}: {
  text: string;
  accent?: string;
}) {
  return (
    <blockquote
      className="res-pullquote"
      style={{ "--accent": accent } as React.CSSProperties}
    >
      {text}
    </blockquote>
  );
}
