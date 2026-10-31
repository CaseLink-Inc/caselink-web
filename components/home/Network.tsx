// Practices on the map. `kind` picks the core colour; both cores are the
// v3 tokens that clear 3:1 on the Ice mesh ground (navy 10.9:1, mint-deep
// 3.47:1). Brand blue and the pale mints all fail there, so they light the
// beams and the frosted pin bodies instead of carrying meaning.
// The glass overlays are laid out in CSS pixels at fixed heights, so the
// slice of the viewBox they cover changes with the container. Measured
// across 1440/1024/820/600/390, the worst case of each is: header down to
// y=56, feed from y=335, legend (only shown >=900) anywhere x>=431 above
// y=139. Every pin therefore lives in y 70-321, and anything right of
// x=417 stays below y=153.
const PINS: { x: number; y: number; kind: "gp" | "spec"; label: string; ly: number }[] = [
  { x: 85, y: 150, kind: "gp", label: "Logan Circle", ly: 132 },
  { x: 55, y: 268, kind: "gp", label: "Foggy Bottom", ly: 250 },
  { x: 150, y: 315, kind: "gp", label: "", ly: 0 },
  { x: 215, y: 95, kind: "gp", label: "", ly: 0 },
  { x: 355, y: 85, kind: "spec", label: "", ly: 0 },
  { x: 470, y: 180, kind: "spec", label: "Capitol Hill", ly: 162 },
  { x: 545, y: 275, kind: "spec", label: "H Street", ly: 257 },
  { x: 430, y: 310, kind: "spec", label: "", ly: 0 },
];

// Each practice's line in to the hub, and the signal that travels it.
const BEAMS: { d: string; kind: "gp" | "spec"; delay: number; dur: number; begin: number }[] = [
  { d: "M 85 150 Q 170 200 300 280", kind: "gp", delay: 0, dur: 3.5, begin: 0 },
  { d: "M 55 268 Q 160 272 300 280", kind: "gp", delay: 0.45, dur: 3.4, begin: 1.8 },
  { d: "M 150 315 Q 215 305 300 280", kind: "gp", delay: 0.9, dur: 3.6, begin: 2.2 },
  { d: "M 215 95 Q 250 180 300 280", kind: "gp", delay: 1.35, dur: 3.3, begin: 2.6 },
  { d: "M 355 85 Q 340 175 300 280", kind: "spec", delay: 1.8, dur: 3.2, begin: 0.6 },
  { d: "M 470 180 Q 400 220 300 280", kind: "spec", delay: 2.25, dur: 3.9, begin: 1.6 },
  { d: "M 545 275 Q 430 278 300 280", kind: "spec", delay: 2.7, dur: 3.7, begin: 1.1 },
  { d: "M 430 310 Q 375 302 300 280", kind: "spec", delay: 3.15, dur: 3.8, begin: 0.9 },
];

export default function Network() {
  return (
    <section id="network" className="network-sec">
      <div className="wrap network-inner">
        <div className="reveal">
          <span className="eyebrow">The network effect</span>
          <h2>
            A network<br />
            that <span className="cl-landing">grows</span> itself.
          </h2>
        </div>
        <div className="map-viz cl-bg-icemesh cl-grain reveal">
          <div className="map-header cl-glass cl-glass--thin">
            <div className="map-title">Washington, DC network<span className="live">LIVE</span></div>
            <div className="map-meta">14 active referrals</div>
          </div>
          <div className="legend cl-glass">
            <div className="legend-title">Specialty</div>
            {/* Swatches are the pin cores, not the beam colours. Brand blue
                reads at 2.57:1 on this ground, so the CaseLink mark uses
                blue-deep, the token meant for small blue marks. */}
            <div className="legend-item"><span className="sw sw-gp" />General dentist</div>
            <div className="legend-item"><span className="sw sw-spec" />Specialist</div>
            <div className="legend-item"><span className="sw sw-cl" />CaseLink</div>
          </div>
          {/* `meet`, not `slice`. With slice the viewBox is cropped by a
              different amount at every container aspect, so a pin safely
              placed at one breakpoint was cropped at the next and sat under
              the feed at the one after. With meet the whole 600x540 is
              always visible and pin coordinates mean the same thing at
              every width; the grid rect is drawn oversized so the ground
              still reaches the edges. */}
          <svg className="map-svg" viewBox="0 0 600 540" preserveAspectRatio="xMidYMid meet">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#B8D6FF" strokeOpacity="0.4" strokeWidth="0.5" />
              </pattern>
              <radialGradient id="hubGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
                <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
              </radialGradient>
              {/* One beam family, not three. The old set put navy and
                  forest green at 0.9 in the middle of each line, which is
                  what made the whole field read grey. These are the L1
                  signature stops, blue through sky into mint, so every
                  line is the same light travelling at a different angle. */}
              <linearGradient id="beamBlue" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#3E8EFF" stopOpacity="0.08" />
                <stop offset="45%" stopColor="#74BDF5" stopOpacity="0.72" />
                <stop offset="100%" stopColor="#93E3C6" stopOpacity="0.14" />
              </linearGradient>
              <linearGradient id="beamMint" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#93E3C6" stopOpacity="0.1" />
                <stop offset="45%" stopColor="#74BDF5" stopOpacity="0.66" />
                <stop offset="100%" stopColor="#3E8EFF" stopOpacity="0.14" />
              </linearGradient>
              {/* The frosted body of a pin: bright at the top-left where the
                  light is, settling to a still-solid blue-white at the
                  opposite edge. It must not fall away to nothing: the
                  gradient centre sits up and left, so a faint far stop puts
                  that fade on the bottom of the disc, and the pin reads as
                  spreading into the map instead of ending at its rim. The
                  falloff is lighting, not a vignette. */}
              <radialGradient id="pinGlass" cx="40%" cy="34%" r="76%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.97" />
                <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0.88" />
                <stop offset="100%" stopColor="#EAF3FF" stopOpacity="0.76" />
              </radialGradient>
              <radialGradient id="sigGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#74BDF5" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#74BDF5" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="sigGlowMint" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#93E3C6" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#93E3C6" stopOpacity="0" />
              </radialGradient>
              {/* Pin cores: the same two ramp segments the legend chips use,
                  so map and key are literally the same paint. */}
              <linearGradient id="coreGp" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#0B2A66" />
                <stop offset="100%" stopColor="#1D5FD8" />
              </linearGradient>
              <linearGradient id="coreSpec" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#107A74" />
                <stop offset="100%" stopColor="#93E3C6" />
              </linearGradient>
            </defs>
            <rect x="-600" y="-600" width="1800" height="1740" fill="url(#grid)" />
            <g stroke="#B8D6FF" strokeOpacity="0.5" strokeWidth="1.2" fill="none">
              <line x1="-600" y1="180" x2="1200" y2="180" />
              <line x1="-600" y1="280" x2="1200" y2="280" />
              <line x1="-600" y1="370" x2="1200" y2="370" />
              <line x1="160" y1="-600" x2="160" y2="1140" />
              <line x1="280" y1="-600" x2="280" y2="1140" />
              <line x1="440" y1="-600" x2="440" y2="1140" />
              <line x1="50" y1="50" x2="550" y2="450" strokeDasharray="3 5" />
              <line x1="550" y1="50" x2="50" y2="450" strokeDasharray="3 5" />
            </g>
            <circle cx="300" cy="280" r="120" fill="url(#hubGlow)" />
            <g>
              {BEAMS.map((b) => (
                <path
                  key={b.d}
                  className="beam active"
                  stroke={`url(#${b.kind === "gp" ? "beamBlue" : "beamMint"})`}
                  style={{ animationDelay: `${b.delay}s` }}
                  d={b.d}
                />
              ))}
            </g>
            {/* Glass pins. A frosted body with a powder rim and a top sheen,
                carrying a small saturated core. The core is what has to be
                legible, so it keeps the readable token while the pin itself
                behaves like every other piece of glass on the site. The old
                pins were a flat fill inside a hard 2px white ring, which is
                a sticker, not glass. */}
            {PINS.map((p) => (
              <g key={`${p.x}-${p.y}`} className={`pin pin--${p.kind}`}>
                <circle cx={p.x} cy={p.y} r="11" fill="url(#pinGlass)" />
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="10.5"
                  fill="none"
                  stroke="#B8D6FF"
                  strokeOpacity="0.95"
                  strokeWidth="1"
                />
                <path
                  d={`M ${p.x - 6.4} ${p.y - 5.2} A 8.2 8.2 0 0 1 ${p.x + 3.4} ${p.y - 9.6}`}
                  fill="none"
                  stroke="#FFFFFF"
                  strokeOpacity="0.9"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
                <circle className="pin-core" cx={p.x} cy={p.y} r="4.2" />
              </g>
            ))}
            {/* Signals: a soft halo around a small core, so what travels the
                line reads as light rather than a bead. */}
            {BEAMS.map((b) => (
              <g key={`sig-${b.d}`}>
                <circle r="9" fill={`url(#${b.kind === "gp" ? "sigGlow" : "sigGlowMint"})`} />
                <circle r="3" fill={b.kind === "gp" ? "#3E8EFF" : "#5FD3BA"} />
                <animateMotion
                  dur={`${b.dur}s`}
                  repeatCount="indefinite"
                  begin={`${b.begin}s`}
                  path={b.d}
                />
              </g>
            ))}
            {/* Hub drawn last so the signals pass UNDER the mark. */}
            <circle cx="300" cy="280" r="30" fill="#fff" />
            <image href="/logo-mark.svg" x="285" y="265" width="30" height="30" />
            {PINS.filter((p) => p.label).map((p) => (
              <text
                key={p.label}
                x={p.x}
                y={p.ly}
                textAnchor="middle"
                fill="#566479"
                fontSize="9"
                fontFamily="'Satoshi'"
                fontWeight="500"
              >
                {p.label}
              </text>
            ))}
          </svg>
          <div className="map-feed cl-glass">
            <div className="feed-title">Recent referrals</div>
            <div className="feed-list">
              <div className="feed-track">
                {[
                  ["Dr. Chen", "Dr. Lee", "done", "Complete"],
                  ["Dr. Park", "Dr. Adams", "active", "Active"],
                  ["Dr. Reyes", "Dr. Singh", "sent", "Sent"],
                  ["Dr. Patel", "Dr. Murphy", "done", "Complete"],
                  ["Dr. Chen", "Dr. Lee", "done", "Complete"],
                  ["Dr. Park", "Dr. Adams", "active", "Active"],
                  ["Dr. Reyes", "Dr. Singh", "sent", "Sent"],
                  ["Dr. Patel", "Dr. Murphy", "done", "Complete"],
                ].map(([from, to, cls, label], i) => (
                  <div key={i} className="feed-item">
                    <span className="src">{from}</span>
                    <span className="arrow">→</span>
                    <span className="src">{to}</span>
                    <span className={`pill ${cls}`}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
