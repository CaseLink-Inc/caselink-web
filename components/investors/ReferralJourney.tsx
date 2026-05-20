"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Compact ReferralJourney visual. Renders inside the Today panel as
 * the "live activity" element. GP node, CaseLink hub with two
 * counter-rotating dashed orbital rings, Specialist node, animated
 * case pill traveling between them on a 6s loop, plus a live revenue
 * counter ticking in sync.
 */
export default function ReferralJourney() {
  const [revenue, setRevenue] = useState(0);
  const rafRef = useRef<number | null>(null);
  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setRevenue(2500);
      return;
    }
    let started: number | null = null;
    const duration = 6000;
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
    <div className="inv-flow-strip" aria-hidden="true">
      <svg viewBox="0 0 520 140" className="inv-flow-strip-svg">
        <defs>
          <linearGradient id="invStripPath" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#3E8EFF" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#90F0C5" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#3DBD6B" stopOpacity="0.45" />
          </linearGradient>
        </defs>

        <path d="M 70 70 Q 180 30 260 70 Q 340 110 450 70" stroke="url(#invStripPath)" strokeWidth="1.5" fill="none" strokeDasharray="2 5" />

        {/* GP */}
        <g transform="translate(70, 70)">
          <circle r="22" fill="#fff" stroke="#3E8EFF" strokeWidth="1.4" />
          <circle r="22" fill="none" stroke="rgba(62,142,255,0.20)" strokeWidth="1" strokeDasharray="2 4">
            <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="22s" repeatCount="indefinite" />
          </circle>
          <text textAnchor="middle" y="3" fontSize="9" fontWeight="700" fill="#1A1F1E" letterSpacing="0.4">GP</text>
        </g>

        {/* Specialist */}
        <g transform="translate(450, 70)">
          <circle r="22" fill="#fff" stroke="#3DBD6B" strokeWidth="1.4" />
          <circle r="22" fill="none" stroke="rgba(61,189,107,0.20)" strokeWidth="1" strokeDasharray="2 4">
            <animateTransform attributeName="transform" type="rotate" from="360" to="0" dur="20s" repeatCount="indefinite" />
          </circle>
          <text textAnchor="middle" y="3" fontSize="9" fontWeight="700" fill="#1A1F1E" letterSpacing="0.4">SP</text>
        </g>

        {/* Traveling case — tiny triangle (drawn BEFORE the hub so the
            hub covers it as it crosses the centre) */}
        <g>
          <polygon points="-5,-5 6,0 -5,5" fill="#3E8EFF">
            <animate attributeName="fill" values="#3E8EFF;#3E8EFF;#90F0C5;#3DBD6B;#3DBD6B" keyTimes="0;0.30;0.50;0.70;1" dur="6s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;1;1;1;0" keyTimes="0;0.10;0.50;0.90;1" dur="6s" repeatCount="indefinite" />
          </polygon>
          <animateMotion dur="6s" repeatCount="indefinite" path="M 70 70 Q 180 30 260 70 Q 340 110 450 70" rotate="auto" />
        </g>

        {/* Hub — generous white circle, single rotating orbital ring.
            Drawn LAST so it sits on top of the traveling triangle. */}
        <g transform="translate(260, 70)">
          <circle r="46" fill="none" stroke="#3E8EFF" strokeWidth="1" strokeDasharray="4 5" opacity="0.5">
            <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="14s" repeatCount="indefinite" />
          </circle>
          <circle r="32" fill="#fff" stroke="rgba(26,31,30,0.08)" strokeWidth="1" />
          <image href="/logo-mark.svg" x="-16" y="-16" width="32" height="32" />
        </g>
      </svg>

      <div className="inv-flow-strip-meta">
        <div className="inv-flow-strip-meta-lbl">Per-referral revenue</div>
        <div className="inv-flow-strip-meta-val">
          ${revenue.toLocaleString()}
          <span> of $2,500</span>
        </div>
      </div>
    </div>
  );
}
