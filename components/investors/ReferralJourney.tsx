"use client";

import { useEffect, useRef, useState } from "react";

/**
 * ReferralJourney — animated hero infographic.
 *
 * Layout: GP node on the left, CaseLink hub in the centre (the brand
 * mark with two counter-rotating dashed orbital rings around it),
 * Specialist node on the right. A "case" pill travels left to right
 * on a 6s loop along a curved path. As the pill crosses the hub, its
 * fill colour shifts blue → gradient → green. Beneath the journey, a
 * revenue counter ticks $0 → $2,500 in sync with the pill.
 *
 * Honours prefers-reduced-motion (counter snaps to max, no JS loop).
 */
export default function ReferralJourney() {
  const [revenue, setRevenue] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setRevenue(2500);
      return;
    }
    const duration = 6000;
    let started: number | null = null;
    const loop = (ts: number) => {
      if (started === null) started = ts;
      const t = ((ts - started) % duration) / duration;
      setRevenue(Math.round(t * 2500));
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className="inv-journey" aria-hidden="true">
      <svg
        viewBox="0 0 520 360"
        xmlns="http://www.w3.org/2000/svg"
        className="inv-journey-svg"
      >
        <defs>
          <linearGradient id="invJourneyPath" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#3E8EFF" />
            <stop offset="50%" stopColor="#90F0C5" />
            <stop offset="100%" stopColor="#3DBD6B" />
          </linearGradient>
          <linearGradient id="invJourneyPillGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#3E8EFF" />
            <stop offset="100%" stopColor="#90F0C5" />
          </linearGradient>
          <radialGradient id="invJourneyHubGlow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#3E8EFF" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#3E8EFF" stopOpacity="0" />
          </radialGradient>
          <filter id="invJourneyGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Hub atmospheric glow */}
        <circle cx="260" cy="180" r="100" fill="url(#invJourneyHubGlow)" />

        {/* Connection path (dashed faint guide line) */}
        <path
          d="M 90 180 Q 175 90 260 180 Q 345 270 430 180"
          stroke="rgba(26,31,30,0.12)"
          strokeWidth="1.5"
          fill="none"
          strokeDasharray="3 5"
        />

        {/* GP node */}
        <g transform="translate(90, 180)">
          <circle r="36" fill="#fff" stroke="#3E8EFF" strokeWidth="1.5" />
          <circle r="36" fill="none" stroke="rgba(62,142,255,0.20)" strokeWidth="1" strokeDasharray="2 4">
            <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="20s" repeatCount="indefinite" />
          </circle>
          <text textAnchor="middle" y="-2" fontSize="11" fontWeight="700" fill="#1A1F1E" letterSpacing="0.5">GP</text>
          <text textAnchor="middle" y="14" fontSize="9" fontWeight="600" fill="#7A8886">Dr. Chen</text>
        </g>

        {/* CaseLink hub — brand mark with two counter-rotating dashed orbital rings */}
        <g transform="translate(260, 180)">
          {/* Outer orbital ring (CW, slower) */}
          <circle r="62" fill="none" stroke="#3E8EFF" strokeWidth="1" strokeDasharray="4 6" opacity="0.45">
            <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="14s" repeatCount="indefinite" />
          </circle>
          {/* Inner orbital ring (CCW, faster) */}
          <circle r="46" fill="none" stroke="#90F0C5" strokeWidth="1" strokeDasharray="2 4" opacity="0.55">
            <animateTransform attributeName="transform" type="rotate" from="360" to="0" dur="10s" repeatCount="indefinite" />
          </circle>
          {/* Hub core */}
          <circle r="32" fill="#1A1F1E" />
          {/* CaseLink mark inside */}
          <g transform="translate(-16, -16)">
            <image href="/logo-mark-white.svg" width="32" height="32" />
          </g>
        </g>

        {/* Specialist node */}
        <g transform="translate(430, 180)">
          <circle r="36" fill="#fff" stroke="#3DBD6B" strokeWidth="1.5" />
          <circle r="36" fill="none" stroke="rgba(61,189,107,0.20)" strokeWidth="1" strokeDasharray="2 4">
            <animateTransform attributeName="transform" type="rotate" from="360" to="0" dur="22s" repeatCount="indefinite" />
          </circle>
          <text textAnchor="middle" y="-2" fontSize="10.5" fontWeight="700" fill="#1A1F1E" letterSpacing="0.4">SPEC</text>
          <text textAnchor="middle" y="14" fontSize="9" fontWeight="600" fill="#7A8886">Dr. Lee</text>
        </g>

        {/* Traveling case pill (loops on 6s, fill colour shifts as it crosses the hub) */}
        <g filter="url(#invJourneyGlow)">
          <rect x="-22" y="-9" width="44" height="18" rx="9" fill="#3E8EFF">
            <animate
              attributeName="fill"
              values="#3E8EFF;#3E8EFF;#90F0C5;#3DBD6B;#3DBD6B"
              keyTimes="0;0.30;0.50;0.70;1"
              dur="6s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0;1;1;1;0"
              keyTimes="0;0.10;0.50;0.90;1"
              dur="6s"
              repeatCount="indefinite"
            />
          </rect>
          <animateMotion
            dur="6s"
            repeatCount="indefinite"
            path="M 90 180 Q 175 90 260 180 Q 345 270 430 180"
            keyTimes="0;1"
            keyPoints="0;1"
            calcMode="linear"
            rotate="auto"
          />
        </g>

        {/* Floating context chip — referral */}
        <g transform="translate(60, 50)" opacity="0.92">
          <rect width="170" height="40" rx="10" fill="#fff" stroke="rgba(26,31,30,0.08)" />
          <circle cx="18" cy="20" r="8" fill="rgba(62,142,255,0.14)" />
          <path d="M14 20 L17 23 L23 17" stroke="#3E8EFF" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <text x="34" y="17" fontSize="11" fontWeight="700" fill="#1A1F1E">Case sent</text>
          <text x="34" y="30" fontSize="9" fontWeight="500" fill="#7A8886">Pano x-ray attached</text>
        </g>

        {/* Floating context chip — outcome */}
        <g transform="translate(290, 280)" opacity="0.92">
          <rect width="170" height="40" rx="10" fill="#fff" stroke="rgba(26,31,30,0.08)" />
          <circle cx="18" cy="20" r="8" fill="rgba(61,189,107,0.14)" />
          <path d="M14 20 L17 23 L23 17" stroke="#3DBD6B" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <text x="34" y="17" fontSize="11" fontWeight="700" fill="#1A1F1E">Case completed</text>
          <text x="34" y="30" fontSize="9" fontWeight="500" fill="#7A8886">Outcome report sent</text>
        </g>
      </svg>

      {/* Revenue counter, in sync with the pill loop */}
      <div className="inv-journey-rev" aria-hidden="true">
        <div className="inv-journey-rev-lbl">Revenue captured per referral</div>
        <div className="inv-journey-rev-val">
          ${revenue.toLocaleString()}
          <span className="inv-journey-rev-target">of $2,500</span>
        </div>
        <div className="inv-journey-rev-track">
          <div
            className="inv-journey-rev-fill"
            style={{ width: `${(revenue / 2500) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
