"use client";

import { useEffect, useRef, useState } from "react";

// East Coast wide view, ranging from Boston (top-left) down to Atlanta (bottom-right).
const WIDE_BOX = "0 0 500 440";
// Closer DC view, framing the cluster of CaseLink referral pins around DC.
const CLOSE_BOX = "200 145 180 160";
const ANIM_DURATION = 1800; // ms

// Pins inside the DC zoom (in the same 500x440 coordinate system).
// Mix of GP (deep green) and Specialist (warm orange) so we read as a real network.
const DC_PINS = [
  { x: 260, y: 175, t: "gp" },
  { x: 248, y: 215, t: "sp" },
  { x: 310, y: 190, t: "gp" },
  { x: 295, y: 245, t: "sp" },
  { x: 235, y: 245, t: "sp" },
  { x: 268, y: 260, t: "gp" },
  { x: 320, y: 235, t: "gp" },
  { x: 252, y: 195, t: "sp" },
  { x: 305, y: 215, t: "sp" },
  { x: 285, y: 270, t: "gp" },
  { x: 245, y: 175, t: "gp" },
  { x: 330, y: 260, t: "sp" },
];

// Beam endpoints — referral pairs that draw lines through the hub.
const DC_BEAMS = [
  { from: { x: 260, y: 175 }, to: { x: 280, y: 220 } },
  { from: { x: 320, y: 235 }, to: { x: 280, y: 220 } },
  { from: { x: 245, y: 175 }, to: { x: 280, y: 220 } },
  { from: { x: 305, y: 215 }, to: { x: 280, y: 220 } },
  { from: { x: 268, y: 260 }, to: { x: 280, y: 220 } },
  { from: { x: 235, y: 245 }, to: { x: 280, y: 220 } },
  { from: { x: 330, y: 260 }, to: { x: 280, y: 220 } },
];

// Parse an SVG viewBox string into 4 numbers.
function parseBox(s: string) {
  return s.split(" ").map(Number) as [number, number, number, number];
}

function lerpBox(a: [number, number, number, number], b: [number, number, number, number], t: number) {
  return a.map((v, i) => v + (b[i] - v) * t).join(" ");
}

export default function DcMap() {
  const ref = useRef<SVGSVGElement>(null);
  const [box, setBox] = useState<string>(WIDE_BOX);
  const [zoomedIn, setZoomedIn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !zoomedIn) {
          setZoomedIn(true);
          const start = performance.now();
          const a = parseBox(WIDE_BOX);
          const b = parseBox(CLOSE_BOX);
          const tick = (now: number) => {
            const t = Math.min(1, (now - start) / ANIM_DURATION);
            // ease-in-out cubic
            const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
            setBox(lerpBox(a, b, eased));
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.35 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [zoomedIn]);

  return (
    <div className="where-viz reveal">
      <svg
        ref={ref}
        viewBox={box}
        preserveAspectRatio="xMidYMid meet"
        className={`dc-map ${zoomedIn ? "zoomed" : ""}`}
      >
        <defs>
          <linearGradient id="mapBg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3E8EFF" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#90F0C5" stopOpacity="0.08" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="500" height="440" fill="url(#mapBg)" rx="20" />
        {/* Coastline outline */}
        <path
          d="M 120 80 L 380 60 L 440 220 L 360 380 L 140 360 L 80 200 Z"
          fill="#fff"
          stroke="#3E8EFF"
          strokeWidth="1.5"
          opacity="0.4"
        />
        {/* Grid */}
        <g stroke="#3E8EFF" strokeWidth="0.4" opacity="0.25" fill="none">
          <line x1="120" y1="150" x2="440" y2="150" />
          <line x1="120" y1="220" x2="440" y2="220" />
          <line x1="120" y1="290" x2="440" y2="290" />
          <line x1="200" y1="60" x2="200" y2="380" />
          <line x1="280" y1="60" x2="280" y2="380" />
          <line x1="360" y1="60" x2="360" y2="380" />
          <line x1="120" y1="80" x2="440" y2="380" strokeDasharray="3 4" />
          <line x1="440" y1="80" x2="120" y2="380" strokeDasharray="3 4" />
        </g>

        {/* Distant city markers — fade out once we zoom in. */}
        <g className="dc-far" opacity="0.5">
          <circle cx="80" cy="60" r="4" fill="#7A8886" />
          <text x="80" y="50" textAnchor="middle" fill="#7A8886" fontSize="9" fontFamily="'Satoshi'">Boston</text>
          <circle cx="100" cy="120" r="4" fill="#7A8886" />
          <text x="100" y="110" textAnchor="middle" fill="#7A8886" fontSize="9" fontFamily="'Satoshi'">Philadelphia</text>
          <circle cx="420" cy="380" r="4" fill="#7A8886" />
          <text x="420" y="402" textAnchor="middle" fill="#7A8886" fontSize="9" fontFamily="'Satoshi'">Charlotte</text>
          <circle cx="380" cy="410" r="4" fill="#7A8886" />
          <text x="380" y="432" textAnchor="middle" fill="#7A8886" fontSize="9" fontFamily="'Satoshi'">Atlanta</text>
          {/* Other regional pins shown only while zoomed out */}
          <circle cx="200" cy="160" r="6" fill="#3DBD6B" />
          <circle cx="280" cy="120" r="6" fill="#FFA940" />
          <circle cx="320" cy="220" r="6" fill="#3DBD6B" />
          <circle cx="180" cy="260" r="6" fill="#FFA940" />
          <circle cx="360" cy="300" r="6" fill="#3DBD6B" />
          <circle cx="240" cy="330" r="6" fill="#FFA940" />
        </g>

        {/* Detailed DC network — fades in as we zoom in. */}
        <g className="dc-close">
          {DC_BEAMS.map((b, i) => (
            <line
              key={`beam-${i}`}
              x1={b.from.x}
              y1={b.from.y}
              x2={b.to.x}
              y2={b.to.y}
              stroke="#3E8EFF"
              strokeWidth="0.8"
              strokeDasharray="3 3"
              opacity="0.45"
              style={{ animationDelay: `${i * 0.18}s` }}
              className="dc-beam"
            />
          ))}
          {DC_PINS.map((p, i) => (
            <g key={`pin-${i}`} className="dc-pin" style={{ animationDelay: `${i * 0.08}s` }}>
              <circle
                cx={p.x}
                cy={p.y}
                r="3.5"
                fill={p.t === "gp" ? "#3DBD6B" : "#FFA940"}
                stroke="#fff"
                strokeWidth="1"
              />
            </g>
          ))}
          {/* Soft neighborhood labels */}
          <text x="260" y="166" textAnchor="middle" fill="#7A8886" fontSize="4" fontFamily="'Satoshi'" fontWeight="600">Logan Circle</text>
          <text x="320" y="183" textAnchor="middle" fill="#7A8886" fontSize="4" fontFamily="'Satoshi'" fontWeight="600">Capitol Hill</text>
          <text x="228" y="252" textAnchor="middle" fill="#7A8886" fontSize="4" fontFamily="'Satoshi'" fontWeight="600">Georgetown</text>
          <text x="335" y="252" textAnchor="middle" fill="#7A8886" fontSize="4" fontFamily="'Satoshi'" fontWeight="600">H Street</text>
          <text x="245" y="187" textAnchor="middle" fill="#7A8886" fontSize="4" fontFamily="'Satoshi'" fontWeight="600">Foggy Bottom</text>
        </g>

        {/* DC hub */}
        <g>
          <circle cx="280" cy="220" r="40" fill="none" stroke="#3E8EFF" strokeWidth="1.5" opacity="0.3">
            <animate attributeName="r" from="20" to="60" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.5" to="0" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="280" cy="220" r="70" fill="none" stroke="#3E8EFF" strokeWidth="1" opacity="0.2" />
          <circle cx="280" cy="220" r="100" fill="none" stroke="#3E8EFF" strokeWidth="0.7" opacity="0.15" />
          <circle cx="280" cy="220" r="18" fill="#3E8EFF" stroke="#fff" strokeWidth="3" />
          <text x="280" y="225" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700" fontFamily="'Satoshi'">DC</text>
        </g>
      </svg>
      <div className={`dc-map-badge ${zoomedIn ? "show" : ""}`}>
        <span className="live-dot" />
        Active network · DC
      </div>
    </div>
  );
}
