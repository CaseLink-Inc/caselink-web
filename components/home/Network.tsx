export default function Network() {
  return (
    <section id="network" className="network-sec">
      <div className="wrap network-inner">
        <div className="reveal">
          <span className="eyebrow">The network effect</span>
          <h2>A network<br />that grows itself.</h2>
          <p>
            CaseLink starts in Washington, DC, where dentist density is among
            the highest in the country. Every practice we add makes the next
            referral easier.
          </p>
          <div className="network-stats">
            <div className="network-stat"><div className="big">1,400+</div><div className="lbl">Practices in network</div></div>
            <div className="network-stat"><div className="big">7</div><div className="lbl">Dental specialties</div></div>
            <div className="network-stat"><div className="big">2.4h</div><div className="lbl">Average response</div></div>
          </div>
        </div>
        <div className="map-viz reveal">
          <div className="map-header">
            <div className="map-title">Washington, DC network<span className="live">LIVE</span></div>
            <div className="map-meta">14 active referrals</div>
          </div>
          <div className="legend">
            <div className="legend-title">Specialty</div>
            <div className="legend-item"><span className="sw" style={{ background: "#3DBD6B" }} />General dentist</div>
            <div className="legend-item"><span className="sw" style={{ background: "#FFA940" }} />Specialist</div>
            <div className="legend-item"><span className="sw" style={{ background: "#3E8EFF" }} />CaseLink hub</div>
          </div>
          <svg className="map-svg" viewBox="0 0 600 540" preserveAspectRatio="xMidYMid slice">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E8EEF8" strokeWidth="0.5" />
              </pattern>
              <radialGradient id="hubGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#3E8EFF" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#3E8EFF" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="beamGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#3E8EFF" stopOpacity="0.1" />
                <stop offset="50%" stopColor="#3E8EFF" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#90F0C5" stopOpacity="0.1" />
              </linearGradient>
              <linearGradient id="beamGrad2" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#FFA940" stopOpacity="0.1" />
                <stop offset="50%" stopColor="#FFA940" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#FFC794" stopOpacity="0.1" />
              </linearGradient>
              <linearGradient id="beamGrad3" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#3DBD6B" stopOpacity="0.1" />
                <stop offset="50%" stopColor="#3DBD6B" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#90F0C5" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            <g stroke="#E8EEF8" strokeWidth="1.2" fill="none">
              <line x1="0" y1="180" x2="600" y2="180" />
              <line x1="0" y1="280" x2="600" y2="280" />
              <line x1="0" y1="370" x2="600" y2="370" />
              <line x1="160" y1="0" x2="160" y2="540" />
              <line x1="280" y1="0" x2="280" y2="540" />
              <line x1="440" y1="0" x2="440" y2="540" />
              <line x1="50" y1="50" x2="550" y2="450" strokeDasharray="3 5" />
              <line x1="550" y1="50" x2="50" y2="450" strokeDasharray="3 5" />
            </g>
            <circle cx="300" cy="280" r="120" fill="url(#hubGlow)" />
            <g>
              <path className="beam active" stroke="url(#beamGrad)" d="M 110 150 Q 200 220 300 280" />
              <path className="beam active" stroke="url(#beamGrad2)" style={{ animationDelay: ".4s" }} d="M 480 130 Q 400 210 300 280" />
              <path className="beam active" stroke="url(#beamGrad3)" style={{ animationDelay: ".8s" }} d="M 130 410 Q 220 350 300 280" />
              <path className="beam active" stroke="url(#beamGrad)" style={{ animationDelay: "1.2s" }} d="M 480 420 Q 400 360 300 280" />
              <path className="beam active" stroke="url(#beamGrad2)" style={{ animationDelay: "1.6s" }} d="M 90 290 Q 180 285 300 280" />
              <path className="beam active" stroke="url(#beamGrad3)" style={{ animationDelay: "2s" }} d="M 510 290 Q 410 285 300 280" />
              <path className="beam active" stroke="url(#beamGrad)" style={{ animationDelay: "2.4s" }} d="M 220 100 Q 260 190 300 280" />
              <path className="beam active" stroke="url(#beamGrad2)" style={{ animationDelay: "2.8s" }} d="M 380 460 Q 340 370 300 280" />
            </g>
            <g><circle className="pin-pulse p1" cx="110" cy="150" r="8" /><circle className="pin-dot gp" cx="110" cy="150" r="6" /></g>
            <g><circle className="pin-pulse p3" cx="480" cy="130" r="8" /><circle className="pin-dot spec" cx="480" cy="130" r="6" /></g>
            <g><circle className="pin-pulse p4" cx="130" cy="410" r="8" /><circle className="pin-dot gp" cx="130" cy="410" r="6" /></g>
            <g><circle className="pin-pulse p2" cx="480" cy="420" r="8" /><circle className="pin-dot spec" cx="480" cy="420" r="6" /></g>
            <g><circle className="pin-pulse p5" cx="90" cy="290" r="8" /><circle className="pin-dot gp" cx="90" cy="290" r="6" /></g>
            <g><circle className="pin-pulse p3" cx="510" cy="290" r="8" /><circle className="pin-dot spec" cx="510" cy="290" r="6" /></g>
            <g><circle className="pin-pulse p4" cx="220" cy="100" r="8" /><circle className="pin-dot gp" cx="220" cy="100" r="6" /></g>
            <g><circle className="pin-pulse p1" cx="380" cy="460" r="8" /><circle className="pin-dot spec" cx="380" cy="460" r="6" /></g>
            <g><circle className="pin-pulse p2" cx="380" cy="200" r="8" /><circle className="pin-dot gp" cx="380" cy="200" r="6" /></g>
            <g><circle className="pin-pulse p5" cx="200" cy="360" r="8" /><circle className="pin-dot spec" cx="200" cy="360" r="6" /></g>
            <circle cx="300" cy="280" r="26" fill="#3E8EFF" stroke="#fff" strokeWidth="3" />
            <text x="300" y="285" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="700" fontFamily="'Plus Jakarta Sans'">CL</text>
            <circle r="4" fill="#3E8EFF"><animateMotion dur="3.5s" repeatCount="indefinite" path="M 110 150 Q 200 220 300 280" /></circle>
            <circle r="4" fill="#FFA940"><animateMotion dur="3.2s" repeatCount="indefinite" begin="0.6s" path="M 480 130 Q 400 210 300 280" /></circle>
            <circle r="4" fill="#3DBD6B"><animateMotion dur="4s" repeatCount="indefinite" begin="1.4s" path="M 130 410 Q 220 350 300 280" /></circle>
            <circle r="4" fill="#3E8EFF"><animateMotion dur="3.6s" repeatCount="indefinite" begin="2.2s" path="M 220 100 Q 260 190 300 280" /></circle>
            <circle r="4" fill="#FFA940"><animateMotion dur="3.8s" repeatCount="indefinite" begin="0.9s" path="M 380 460 Q 340 370 300 280" /></circle>
            <text x="110" y="138" textAnchor="middle" fill="#7A8886" fontSize="9" fontFamily="'Plus Jakarta Sans'" fontWeight="500">Logan Circle</text>
            <text x="480" y="118" textAnchor="middle" fill="#7A8886" fontSize="9" fontFamily="'Plus Jakarta Sans'" fontWeight="500">Capitol Hill</text>
            <text x="130" y="428" textAnchor="middle" fill="#7A8886" fontSize="9" fontFamily="'Plus Jakarta Sans'" fontWeight="500">Georgetown</text>
            <text x="480" y="440" textAnchor="middle" fill="#7A8886" fontSize="9" fontFamily="'Plus Jakarta Sans'" fontWeight="500">Navy Yard</text>
            <text x="90" y="278" textAnchor="middle" fill="#7A8886" fontSize="9" fontFamily="'Plus Jakarta Sans'" fontWeight="500">Foggy Bottom</text>
            <text x="510" y="278" textAnchor="middle" fill="#7A8886" fontSize="9" fontFamily="'Plus Jakarta Sans'" fontWeight="500">H Street</text>
          </svg>
          <div className="map-feed">
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
