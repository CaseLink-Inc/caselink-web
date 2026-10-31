/**
 * The ROI chart: fourteen month segments around a ring.
 *
 * One case covers fourteen months, so twelve segments carry the year in
 * blue and the two that spill past it are mint. The pale track behind is
 * the same fourteen slots rather than a solid circle, so the gaps stay
 * clean and the filled months read against an empty year, which is the
 * step 7 rule that a filled track takes the selection.
 *
 * The months light up in sequence on scroll, which is the year filling up
 * rather than decoration. Only opacity animates; the rotation that places
 * each segment is an SVG attribute on a wrapping group, so the two never
 * contend for the same transform.
 */
const MONTHS = 14;
const COVERED = 12; /* a year; the remaining two are profit */

const SIZE = 320;
const C = SIZE / 2;
const R = 128;
const STROKE = 22;

const SLOT = (Math.PI * 2 * R) / MONTHS; /* arc length of one month */
const GAP = 10;
/* Round caps add half the stroke at each end, so the dash itself is
   shortened by a whole stroke width to land on the gap we asked for. */
const DASH = SLOT - GAP - STROKE;
const CIRC = Math.PI * 2 * R;

const segments = Array.from({ length: MONTHS }, (_, i) => ({
  i,
  covered: i < COVERED,
  angle: -90 + i * (360 / MONTHS),
}));

export default function RoiRing() {
  return (
    <div className="roi-ring reveal">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        width={SIZE}
        height={SIZE}
        role="img"
        aria-label="Fourteen months covered by a single case: twelve months make up a full year and two months fall beyond it."
      >
        <defs>
          {/* Both gradients are laid out across the whole ring rather than
              each segment, so the light moves through the months instead of
              repeating inside every one of them. */}
          <linearGradient
            id="roiYear"
            gradientUnits="userSpaceOnUse"
            x1={C - R}
            y1={C - R}
            x2={C + R}
            y2={C + R}
          >
            <stop offset="0" stopColor="#1d5fd8" />
            <stop offset="1" stopColor="#74bdf5" />
          </linearGradient>
          <linearGradient
            id="roiBeyond"
            gradientUnits="userSpaceOnUse"
            x1={C - R}
            y1={C + R}
            x2={C + R}
            y2={C - R}
          >
            <stop offset="0" stopColor="#2fbf8f" />
            <stop offset="1" stopColor="#93e3c6" />
          </linearGradient>
        </defs>

        {segments.map((s) => (
          <g key={`t${s.i}`} transform={`rotate(${s.angle} ${C} ${C})`}>
            <circle
              className="roi-seg-track"
              cx={C}
              cy={C}
              r={R}
              fill="none"
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={`${DASH} ${CIRC - DASH}`}
            />
          </g>
        ))}

        {segments.map((s) => (
          <g key={s.i} transform={`rotate(${s.angle} ${C} ${C})`}>
            <circle
              className="roi-seg"
              style={{ "--i": s.i } as React.CSSProperties}
              cx={C}
              cy={C}
              r={R}
              fill="none"
              stroke={`url(#${s.covered ? "roiYear" : "roiBeyond"})`}
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={`${DASH} ${CIRC - DASH}`}
            />
          </g>
        ))}
      </svg>

      {/* The centre is set in HTML, not SVG text, so it takes Satoshi and
          the type scale the same way the rest of the page does. */}
      <div className="roi-ring-mid" aria-hidden="true">
        <strong className="cl-landing">14</strong>
        <span>months covered</span>
      </div>
    </div>
  );
}
