"use client";

/**
 * SectionBreaker — 80px high animated SVG strip placed between every
 * major section. A flowing dashed gradient line walks horizontally
 * across the page, with a small pulsing dot in the centre. Each
 * breaker gets a different gradient so the brand colours appear to
 * walk down the page across the breaks.
 */
type Props = {
  from: string;
  to: string;
  /** Unique id suffix so multiple breakers can have their own gradient defs */
  id: string;
};

export default function SectionBreaker({ from, to, id }: Props) {
  const gradId = `inv-brk-${id}`;
  return (
    <div className="inv-breaker" aria-hidden="true">
      <svg
        viewBox="0 0 1200 80"
        preserveAspectRatio="none"
        className="inv-breaker-svg"
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={from} stopOpacity="0" />
            <stop offset="20%" stopColor={from} stopOpacity="1" />
            <stop offset="80%" stopColor={to} stopOpacity="1" />
            <stop offset="100%" stopColor={to} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M 0 40 Q 200 18 400 40 T 800 40 T 1200 40"
          stroke={`url(#${gradId})`}
          strokeWidth="1.5"
          fill="none"
          strokeDasharray="6 8"
          className="inv-breaker-path"
        />
        <circle
          cx="600"
          cy="40"
          r="5"
          fill={to}
          className="inv-breaker-dot"
          style={{ filter: `drop-shadow(0 0 6px ${to})` }}
        />
      </svg>
    </div>
  );
}
