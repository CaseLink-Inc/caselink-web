import DsIcon from "@/components/DsIcon";

/*
 * Data and card blocks for articles. Every number shown must be a published
 * figure from the article's own text. Built to the article rules: glass over
 * the lit ground, palette colours only, Medium never Bold, no drop shadows.
 * Percent scales are fixed at 0 to 100 so a minority never reads as most.
 */

const BLUE_DEEP = "#1D5FD8";
const MINT_DEEP = "#2FBF8F";

/** A ring that fills to a percentage. Decorative: the number beside or
 *  inside it carries the meaning for screen readers. */
function Ring({
  value,
  color,
  size = 132,
  stroke = 12,
  children,
}: {
  value: number;
  color: string;
  size?: number;
  stroke?: number;
  children?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <span className="res-ring" style={{ width: size, height: size }}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        aria-hidden="true"
      >
        <circle
          className="res-ring-track"
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
        />
        <circle
          className="res-ring-fill"
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          stroke={color}
          strokeDasharray={`${(value / 100) * c} ${c}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span className="res-ring-val">{children}</span>
    </span>
  );
}

function Source({ text }: { text?: string }) {
  return text ? <p className="res-viz-source">{text}</p> : null;
}

/* ---- Card grid ----------------------------------------------------- */

export type VizCard = {
  title: string;
  body: string;
  /** Short label above the title, e.g. the threshold to watch. */
  tag?: string;
  /** Icon slug from public/ds/icons. Ignored on numbered grids. */
  icon?: string;
};

export function ResourceCards({
  caption,
  cards,
  numbered = false,
  columns = 2,
  source,
}: {
  caption?: string;
  cards: VizCard[];
  numbered?: boolean;
  columns?: 2 | 3;
  source?: string;
}) {
  return (
    <figure className={`res-tiles res-tiles--${columns}`}>
      {caption && <figcaption className="res-viz-title">{caption}</figcaption>}
      <ol className={`res-tiles-grid${numbered ? " is-numbered" : ""}`}>
        {cards.map((c, i) => (
          <li
            key={c.title}
            className={`res-tile${!numbered && c.icon ? " has-icon" : ""}`}
          >
            <span className="res-tile-mark" aria-hidden="true">
              {numbered ? (
                i + 1
              ) : c.icon ? (
                <DsIcon name={c.icon} size={30} />
              ) : null}
            </span>
            <span className="res-tile-text">
              {c.tag && <span className="res-tile-tag">{c.tag}</span>}
              <span className="res-tile-title">{c.title}</span>
              <span className="res-tile-body">{c.body}</span>
            </span>
          </li>
        ))}
      </ol>
      <Source text={source} />
    </figure>
  );
}

/* ---- Bar chart ----------------------------------------------------- */

export type VizBarSet = {
  title: string;
  rows: { label: string; value: number; tone?: "a" | "b" | "muted" }[];
};

const TONE = { a: BLUE_DEEP, b: MINT_DEEP, muted: "#74BDF5" } as const;

export function ResourceBars({
  caption,
  sets,
  source,
}: {
  caption: string;
  sets: VizBarSet[];
  source?: string;
}) {
  return (
    <figure className="res-bars">
      <figcaption className="res-viz-title">{caption}</figcaption>
      <div className="res-bars-sets">
        {sets.map((set) => (
          <div key={set.title} className="res-bars-set">
            <span className="res-bars-set-title">{set.title}</span>
            <ul className="res-bars-rows">
              {set.rows.map((row) => (
                <li key={row.label} className="res-bars-row">
                  <span className="res-bars-label">{row.label}</span>
                  <span className="res-bars-line">
                    <span className="res-bars-track" aria-hidden="true">
                      <span
                        className="res-bars-fill"
                        style={{
                          width: `${row.value}%`,
                          background: TONE[row.tone ?? "a"],
                        }}
                      />
                    </span>
                    <span className="res-bars-val">{row.value}%</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <Source text={source} />
    </figure>
  );
}

/* ---- Versus -------------------------------------------------------- */

export type VizSide = {
  group: string;
  value: number;
  label: string;
  note: string;
};

export function ResourceVersus({
  caption,
  sides,
  source,
}: {
  caption: string;
  sides: [VizSide, VizSide];
  source?: string;
}) {
  const colors = [BLUE_DEEP, MINT_DEEP];
  return (
    <figure className="res-versus">
      <figcaption className="res-viz-title">{caption}</figcaption>
      <div className="res-versus-grid">
        {sides.map((s, i) => (
          <div key={s.group} className="res-versus-side">
            <span className="res-versus-group">{s.group}</span>
            <Ring value={s.value} color={colors[i]}>
              {s.value.toFixed(1)}%
            </Ring>
            <span className="res-versus-label">{s.label}</span>
            <span className="res-versus-note">{s.note}</span>
          </div>
        ))}
        <span className="res-versus-vs" aria-hidden="true">
          vs
        </span>
      </div>
      <Source text={source} />
    </figure>
  );
}

/* ---- Meter --------------------------------------------------------- */

export function ResourceMeter({
  value,
  label,
  note,
  source,
}: {
  value: number;
  label: string;
  note?: string;
  source?: string;
}) {
  return (
    <figure className="res-meter">
      <div className="res-meter-row">
        <Ring value={value} color={BLUE_DEEP} size={148} stroke={13}>
          {value}%
        </Ring>
        <div className="res-meter-text">
          <span className="res-meter-label">{label}</span>
          {note && <span className="res-meter-note">{note}</span>}
        </div>
      </div>
      <Source text={source} />
    </figure>
  );
}
