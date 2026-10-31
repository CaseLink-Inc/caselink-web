// Practices on the map. `kind` picks the core colour; both cores are the
// v3 tokens that clear 3:1 on the Ice mesh ground (navy 10.9:1, mint-deep
// 3.47:1). Brand blue and the pale mints all fail there, so they light the
// beams and the frosted pin bodies instead of carrying meaning.
// The glass overlays are laid out in CSS pixels at fixed heights, so the
// slice of the viewBox they cover changes with the container. Re-measured
// at 1440/1024/700/390, the worst case of each is: header down to y=56
// (at 700), feed from y=335 (at 390), legend (only shown >=900) anywhere
// x>=431 above y=139. A pin is r=11, so every pin centre lives in
// y 67-324, and anything right of x=417 stays below y=160.
//
// The constellation is spread to those limits rather than sitting inside
// them, because .map-viz is 560px tall on desktop against 440 and below
// elsewhere: the feed starts at y=417 at 1440 but y=335 at 390, so a
// constellation sized for the narrow case leaves a dead band across the
// bottom of the wide one. The remaining difference is taken out by
// .map-constellation, which is nudged down on desktop only.
const PINS: { x: number; y: number; kind: "gp" | "spec"; label: string; ly: number }[] = [
  { x: 72, y: 140, kind: "gp", label: "Logan Circle", ly: 122 },
  { x: 34, y: 262, kind: "gp", label: "Foggy Bottom", ly: 244 },
  { x: 140, y: 316, kind: "gp", label: "", ly: 0 },
  { x: 205, y: 84, kind: "gp", label: "", ly: 0 },
  { x: 368, y: 78, kind: "spec", label: "", ly: 0 },
  { x: 486, y: 178, kind: "spec", label: "Capitol Hill", ly: 160 },
  { x: 566, y: 272, kind: "spec", label: "H Street", ly: 254 },
  { x: 452, y: 314, kind: "spec", label: "", ly: 0 },
];

// Each practice's line in to the hub, and the signal that travels it.
const BEAMS: { d: string; kind: "gp" | "spec"; delay: number; dur: number; begin: number }[] = [
  { d: "M 72 140 Q 160 196 300 280", kind: "gp", delay: 0, dur: 3.5, begin: 0 },
  { d: "M 34 262 Q 150 268 300 280", kind: "gp", delay: 0.45, dur: 3.4, begin: 1.8 },
  { d: "M 140 316 Q 210 306 300 280", kind: "gp", delay: 0.9, dur: 3.6, begin: 2.2 },
  { d: "M 205 84 Q 245 177 300 280", kind: "gp", delay: 1.35, dur: 3.3, begin: 2.6 },
  { d: "M 368 78 Q 348 173 300 280", kind: "spec", delay: 1.8, dur: 3.2, begin: 0.6 },
  { d: "M 486 178 Q 408 218 300 280", kind: "spec", delay: 2.25, dur: 3.9, begin: 1.6 },
  { d: "M 566 272 Q 435 277 300 280", kind: "spec", delay: 2.7, dur: 3.7, begin: 1.1 },
  { d: "M 452 314 Q 382 302 300 280", kind: "spec", delay: 3.15, dur: 3.8, begin: 0.9 },
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
              {/* The frosted body of a pin: effectively flat. An off-centre
                  radial here is what made the pin look like it spread at the
                  bottom. Its centre has to sit up and left to face the light,
                  so the far end of the ramp always lands on the lower right,
                  and the body fades short of the rim and leaves a pale
                  crescent there. Measured at 0.85 of the radius it was alpha
                  0.99 at the top against 0.81 at the bottom, which reads as a
                  smear rather than a disc. The light belongs to the sheen arc
                  and the rim, so the body just fills the circle evenly. */}
              <radialGradient id="pinGlass" cx="40%" cy="34%" r="90%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.97" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.93" />
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
            {/* Hub, beams, pins, signals and labels move together; the grid
                and its crossing lines are ground and stay put. */}
            <g className="map-constellation">
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
            {/* Glass pins. An even frosted body inside a powder rim, carrying
                a small saturated core. The core is what has to be legible, so
                it keeps the readable token.

                There is deliberately no sheen arc. At this size the body is
                only a few pixels across, and a bright crescent above a dark
                round core stops reading as a highlight and starts reading as
                an eyebrow over an eye. The rim carries the glass on its own
                here. */}
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
            </g>
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
