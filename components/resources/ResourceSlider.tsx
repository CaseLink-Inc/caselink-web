// Horizontal, scroll-snapping card row. CSS-only (drag/scroll), no JS.
export default function ResourceSlider({
  cards,
  accent = "#3E8EFF",
}: {
  cards: { title: string; body: string }[];
  accent?: string;
}) {
  return (
    <div
      className="res-slider"
      style={{ "--accent": accent } as React.CSSProperties}
    >
      <div className="res-slider-track">
        {cards.map((c, i) => (
          <article className="res-slider-card" key={c.title}>
            <span className="res-slider-num">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h4>{c.title}</h4>
            <p>{c.body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
