// A row of glass cards: a grid at the article's break-out width, and a
// scroll-snapping row only once the viewport is too narrow for it.
// CSS-only, no JS. `--i` drives the staggered reveal.
export default function ResourceSlider({
  cards,
  accent = "#3E8EFF",
}: {
  cards: { title: string; body: string }[];
  accent?: string;
}) {
  return (
    <div
      className="res-slider reveal"
      style={{ "--accent": accent } as React.CSSProperties}
    >
      <div className="res-slider-track">
        {cards.map((c, i) => (
          <article
            className="res-slider-card"
            key={c.title}
            style={{ "--i": i } as React.CSSProperties}
          >
            <span className="res-slider-num" aria-hidden="true">
              {i + 1}
            </span>
            <h4>{c.title}</h4>
            <p>{c.body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
