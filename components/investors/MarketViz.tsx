"use client";

/**
 * MarketViz — layered concentric visualization showing where CaseLink
 * sits in the dental SaaS market. Outer ring is the projected 2030
 * TAM ($5.5B), middle ring is today's market ($2.8B), inner ring is
 * the sliver actually using referral software, and the center is
 * CaseLink itself with a pulsing core and concentric expanding waves.
 *
 * Rings stagger their fade-in via CSS animation. The center pulse and
 * wave rings are SVG SMIL so they keep running without JS.
 */
export default function MarketViz() {
  return (
    <div className="inv-mkt-viz" aria-hidden="true">
      <svg viewBox="0 0 560 480" xmlns="http://www.w3.org/2000/svg" className="inv-mkt-svg">
        <defs>
          <radialGradient id="invMktCore" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#90F0C5" stopOpacity="1" />
            <stop offset="60%" stopColor="#4F9BFF" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#4F9BFF" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="invMktRing" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4F9BFF" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#90F0C5" stopOpacity="0.2" />
          </linearGradient>
          <filter id="invMktBlur">
            <feGaussianBlur stdDeviation="2" />
          </filter>
        </defs>

        {/* OUTER RING — 2030 market */}
        <g className="inv-mkt-ring inv-mkt-ring-1">
          <circle cx="280" cy="240" r="210" fill="rgba(62,142,255,0.05)" />
          <circle cx="280" cy="240" r="210" fill="none" stroke="rgba(62,142,255,0.40)" strokeWidth="1" strokeDasharray="3 5" />
          <text x="280" y="38" textAnchor="middle" fill="#7A8886" fontSize="11" fontWeight="700" letterSpacing="2">2030 · $5.5B</text>
        </g>

        {/* MIDDLE RING — 2024 market */}
        <g className="inv-mkt-ring inv-mkt-ring-2">
          <circle cx="280" cy="240" r="150" fill="rgba(62,142,255,0.08)" />
          <circle cx="280" cy="240" r="150" fill="none" stroke="rgba(62,142,255,0.55)" strokeWidth="1.2" />
          <text x="280" y="98" textAnchor="middle" fill="#4A5250" fontSize="11" fontWeight="700" letterSpacing="2">TODAY · $2.8B</text>
        </g>

        {/* INNER RING — referral software adoption (<2%) */}
        <g className="inv-mkt-ring inv-mkt-ring-3">
          <circle cx="280" cy="240" r="80" fill="rgba(144,240,197,0.14)" />
          <circle cx="280" cy="240" r="80" fill="none" stroke="rgba(61,189,107,0.65)" strokeWidth="1.4" />
          <text x="280" y="170" textAnchor="middle" fill="#2BAF59" fontSize="11" fontWeight="700" letterSpacing="2">&lt;2% USE SOFTWARE</text>
        </g>

        {/* Expanding pulse waves from center */}
        <circle cx="280" cy="240" r="20" fill="none" stroke="#4F9BFF" strokeWidth="1">
          <animate attributeName="r" from="20" to="80" dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" from="0.7" to="0" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="280" cy="240" r="20" fill="none" stroke="#90F0C5" strokeWidth="1">
          <animate attributeName="r" from="20" to="80" dur="3s" begin="1s" repeatCount="indefinite" />
          <animate attributeName="opacity" from="0.7" to="0" dur="3s" begin="1s" repeatCount="indefinite" />
        </circle>

        {/* Center: CaseLink core */}
        <g>
          <circle cx="280" cy="240" r="36" fill="url(#invMktCore)" filter="url(#invMktBlur)">
            <animate attributeName="r" values="36;42;36" dur="2.4s" repeatCount="indefinite" />
          </circle>
          <circle cx="280" cy="240" r="14" fill="#1A1F1E" />
          <text x="280" y="244" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="800" letterSpacing="0.5">CL</text>
          <text x="280" y="290" textAnchor="middle" fill="#1A1F1E" fontSize="13" fontWeight="700">CaseLink</text>
          <text x="280" y="306" textAnchor="middle" fill="#7A8886" fontSize="10">network-native, two-sided</text>
        </g>

        {/* Annotation lines and badges around the rings */}
        {/* 14% CAGR badge (right) */}
        <g transform="translate(490, 235)">
          <line x1="-1" y1="5" x2="-50" y2="5" stroke="rgba(62,142,255,0.45)" strokeWidth="1" />
          <rect x="0" y="-8" width="62" height="28" rx="6" fill="#fff" stroke="rgba(62,142,255,0.40)" />
          <text x="31" y="3" textAnchor="middle" fill="#3E8EFF" fontSize="9" fontWeight="700" letterSpacing="1">CAGR</text>
          <text x="31" y="16" textAnchor="middle" fill="#1A1F1E" fontSize="13" fontWeight="800">~14%</text>
        </g>

        {/* 2.5x multiplier badge (top-right) */}
        <g transform="translate(440, 80)">
          <line x1="-5" y1="20" x2="-30" y2="50" stroke="rgba(62,142,255,0.45)" strokeWidth="1" />
          <rect x="0" y="0" width="72" height="32" rx="6" fill="#fff" stroke="rgba(61,189,107,0.45)" />
          <text x="36" y="13" textAnchor="middle" fill="#2BAF59" fontSize="9" fontWeight="700" letterSpacing="1">MULTIPLIER</text>
          <text x="36" y="27" textAnchor="middle" fill="#1A1F1E" fontSize="14" fontWeight="800">2.5x</text>
        </g>

        {/* Growth arrow */}
        <g opacity="0.65">
          <path
            d="M 50 380 Q 150 320 280 280"
            stroke="url(#invMktRing)"
            strokeWidth="2"
            fill="none"
            strokeDasharray="4 6"
          />
          <path d="M 268 274 L 282 280 L 274 290" stroke="#3DBD6B" strokeWidth="2" fill="none" />
        </g>

        {/* Bottom-left "untapped" annotation */}
        <g transform="translate(30, 400)">
          <text fill="#7A8886" fontSize="11" fontWeight="700" letterSpacing="2">UNTAPPED</text>
          <text y="14" fill="#E58A2B" fontSize="13" fontWeight="800">98% paper / phone</text>
        </g>
      </svg>
    </div>
  );
}
