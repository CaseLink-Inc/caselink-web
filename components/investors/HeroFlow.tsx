"use client";

/**
 * HeroFlow — animated SVG infographic for the investor page hero.
 * Shows a GP practice → CaseLink hub → Specialist practice with
 * particles flowing along the connection paths in both directions,
 * representing the bidirectional referral and outcome traffic.
 *
 * Pure SMIL animation + CSS keyframes. No JS scheduling.
 */
export default function HeroFlow() {
  return (
    <div className="inv-flow" aria-hidden="true">
      <svg
        viewBox="0 0 560 480"
        xmlns="http://www.w3.org/2000/svg"
        className="inv-flow-svg"
      >
        <defs>
          <linearGradient id="invFlowGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#4F9BFF" />
            <stop offset="100%" stopColor="#90F0C5" />
          </linearGradient>
          <linearGradient id="invFlowGradReverse" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0%" stopColor="#FFC794" />
            <stop offset="100%" stopColor="#FFA940" />
          </linearGradient>
          <radialGradient id="invHubGlow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#4F9BFF" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#4F9BFF" stopOpacity="0" />
          </radialGradient>
          <filter id="invSoftGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Hub glow halo */}
        <circle
          cx="280"
          cy="240"
          r="110"
          fill="url(#invHubGlow)"
          className="inv-flow-glow"
        />

        {/* Connection paths */}
        <path
          d="M 110 240 Q 200 170 280 240"
          stroke="rgba(79,155,255,0.22)"
          strokeWidth="1.5"
          fill="none"
          strokeDasharray="3 4"
        />
        <path
          d="M 280 240 Q 360 170 450 240"
          stroke="rgba(144,240,197,0.22)"
          strokeWidth="1.5"
          fill="none"
          strokeDasharray="3 4"
        />
        <path
          d="M 450 240 Q 360 310 280 240"
          stroke="rgba(255,199,148,0.22)"
          strokeWidth="1.5"
          fill="none"
          strokeDasharray="3 4"
        />
        <path
          d="M 280 240 Q 200 310 110 240"
          stroke="rgba(255,169,64,0.22)"
          strokeWidth="1.5"
          fill="none"
          strokeDasharray="3 4"
        />

        {/* Outbound packets — GP → Hub → Specialist */}
        {[0, 0.8, 1.6, 2.4].map((delay, i) => (
          <g key={`out-${i}`}>
            <circle r="5" fill="url(#invFlowGrad)" filter="url(#invSoftGlow)">
              <animateMotion
                dur="3.2s"
                repeatCount="indefinite"
                begin={`${delay}s`}
                keyTimes="0;0.5;1"
                keyPoints="0;0.5;1"
                calcMode="linear"
                path="M 110 240 Q 200 170 280 240 Q 360 170 450 240"
              />
              <animate
                attributeName="opacity"
                values="0;1;1;0"
                keyTimes="0;0.1;0.9;1"
                dur="3.2s"
                begin={`${delay}s`}
                repeatCount="indefinite"
              />
            </circle>
          </g>
        ))}

        {/* Return packets — Specialist → Hub → GP (outcome reports) */}
        {[1.6, 2.4, 0, 0.8].map((delay, i) => (
          <g key={`back-${i}`}>
            <circle r="4" fill="#FFC794" filter="url(#invSoftGlow)">
              <animateMotion
                dur="3.4s"
                repeatCount="indefinite"
                begin={`${delay}s`}
                keyTimes="0;0.5;1"
                keyPoints="0;0.5;1"
                calcMode="linear"
                path="M 450 240 Q 360 310 280 240 Q 200 310 110 240"
              />
              <animate
                attributeName="opacity"
                values="0;1;1;0"
                keyTimes="0;0.1;0.9;1"
                dur="3.4s"
                begin={`${delay}s`}
                repeatCount="indefinite"
              />
            </circle>
          </g>
        ))}

        {/* GP card */}
        <g transform="translate(38, 188)" className="inv-flow-node">
          <rect
            width="144"
            height="104"
            rx="14"
            fill="#171B22"
            stroke="rgba(255,255,255,0.10)"
          />
          <rect x="14" y="14" width="44" height="6" rx="3" fill="rgba(255,255,255,0.20)" />
          <circle cx="22" cy="42" r="10" fill="rgba(79,155,255,0.18)" />
          <path
            d="M16 42 Q 22 36 28 42 M16 46 Q 22 52 28 46"
            stroke="#4F9BFF"
            strokeWidth="1.5"
            fill="none"
          />
          <text x="40" y="46" fill="#fff" fontSize="13" fontWeight="700">Dr. Chen</text>
          <text x="40" y="62" fill="#9CA0A8" fontSize="10">General Dentist</text>
          <rect x="14" y="78" width="116" height="14" rx="4" fill="rgba(79,155,255,0.10)" />
          <text x="22" y="89" fill="#4F9BFF" fontSize="9" fontWeight="700" letterSpacing="0.5">SENDING REFERRAL</text>
          <circle cx="124" cy="22" r="3" fill="#4F9BFF">
            <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* CaseLink Hub */}
        <g transform="translate(280, 240)" className="inv-flow-hub">
          <circle r="52" fill="#0F2540" stroke="rgba(79,155,255,0.40)" strokeWidth="1.5" />
          <circle r="52" fill="none" stroke="url(#invFlowGrad)" strokeWidth="1" strokeDasharray="2 6">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0"
              to="360"
              dur="12s"
              repeatCount="indefinite"
            />
          </circle>
          {/* Shield icon */}
          <g transform="translate(-14, -16)">
            <path
              d="M14 0 L26 5 V14 C26 22 14 28 14 28 C14 28 2 22 2 14 V5 L14 0 Z"
              fill="rgba(79,155,255,0.18)"
              stroke="#4F9BFF"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path
              d="M9 14 L13 18 L19 11"
              stroke="#90F0C5"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
          <text y="22" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700" letterSpacing="0.4">CASELINK</text>
        </g>

        {/* Specialist card */}
        <g transform="translate(378, 188)" className="inv-flow-node">
          <rect
            width="144"
            height="104"
            rx="14"
            fill="#171B22"
            stroke="rgba(255,255,255,0.10)"
          />
          <rect x="14" y="14" width="56" height="6" rx="3" fill="rgba(255,255,255,0.20)" />
          <circle cx="22" cy="42" r="10" fill="rgba(144,240,197,0.18)" />
          <path
            d="M16 42 L19 45 L28 36"
            stroke="#90F0C5"
            strokeWidth="1.8"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <text x="40" y="46" fill="#fff" fontSize="13" fontWeight="700">Dr. Lee</text>
          <text x="40" y="62" fill="#9CA0A8" fontSize="10">Orthodontist</text>
          <rect x="14" y="78" width="116" height="14" rx="4" fill="rgba(144,240,197,0.10)" />
          <text x="22" y="89" fill="#90F0C5" fontSize="9" fontWeight="700" letterSpacing="0.5">CASE COMPLETED</text>
          <circle cx="134" cy="22" r="3" fill="#5CD68B">
            <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" begin="1s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* Floating chips */}
        <g transform="translate(120, 60)" opacity="0.9">
          <rect width="180" height="46" rx="10" fill="#171B22" stroke="rgba(255,255,255,0.10)" />
          <circle cx="20" cy="23" r="9" fill="rgba(79,155,255,0.18)" />
          <path
            d="M14 23 H26 M20 17 V29"
            stroke="#4F9BFF"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <text x="36" y="20" fill="#fff" fontSize="11" fontWeight="700">X-ray attached</text>
          <text x="36" y="34" fill="#9CA0A8" fontSize="9">Panoramic · 2.4 MB</text>
        </g>

        <g transform="translate(260, 380)" opacity="0.9">
          <rect width="180" height="46" rx="10" fill="#171B22" stroke="rgba(255,255,255,0.10)" />
          <circle cx="20" cy="23" r="9" fill="rgba(144,240,197,0.18)" />
          <path
            d="M14 23 L19 28 L26 19"
            stroke="#5CD68B"
            strokeWidth="1.8"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <text x="36" y="20" fill="#fff" fontSize="11" fontWeight="700">Treatment complete</text>
          <text x="36" y="34" fill="#9CA0A8" fontSize="9">Outcome report sent</text>
        </g>

        <g transform="translate(390, 80)" opacity="0.9">
          <rect width="140" height="36" rx="8" fill="rgba(79,155,255,0.08)" stroke="rgba(79,155,255,0.22)" />
          <circle cx="14" cy="18" r="3" fill="#4F9BFF">
            <animate attributeName="opacity" values="0.4;1;0.4" dur="1.6s" repeatCount="indefinite" />
          </circle>
          <text x="26" y="22" fill="#4F9BFF" fontSize="10" fontWeight="700" letterSpacing="0.5">HIPAA · ENCRYPTED</text>
        </g>
      </svg>
    </div>
  );
}
