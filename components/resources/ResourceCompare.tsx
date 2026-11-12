/**
 * Two groups answering the same questions, drawn as paired bars.
 *
 * Bars are drawn on a fixed 0 to 100 percent scale. Scaling to the largest
 * value would make a 51 percent answer look like everyone, which overstates
 * what a survey can say. Every value is a published figure from the
 * article's own text.
 */
export default function ResourceCompare({
  caption,
  groups,
  rows,
  source,
  accent = "#3E8EFF",
}: {
  caption: string;
  groups: [string, string];
  rows: { label: string; values: [number, number] }[];
  source: string;
  accent?: string;
}) {
  const fmt = (v: number) => `${v}%`;
  return (
    <figure
      className="res-compare"
      style={{ "--accent": accent } as React.CSSProperties}
    >
      <figcaption className="res-compare-head">
        <span className="res-compare-title">{caption}</span>
        <span className="res-compare-legend">
          <span className="res-compare-key is-a">{groups[0]}</span>
          <span className="res-compare-key is-b">{groups[1]}</span>
        </span>
      </figcaption>
      <ul className="res-compare-rows">
        {rows.map((row) => (
          <li key={row.label} className="res-compare-row">
            <span className="res-compare-label">{row.label}</span>
            {row.values.map((v, i) => (
              <span
                key={groups[i]}
                className={`res-compare-bar ${i === 0 ? "is-a" : "is-b"}`}
              >
                <span className="res-compare-track" aria-hidden="true">
                  <span
                    className="res-compare-fill"
                    style={{ width: `${v}%` }}
                  />
                </span>
                <span className="res-compare-val">
                  <span className="res-sr">{groups[i]}: </span>
                  {fmt(v)}
                </span>
              </span>
            ))}
          </li>
        ))}
      </ul>
      <p className="res-compare-source">Source: {source}</p>
    </figure>
  );
}
