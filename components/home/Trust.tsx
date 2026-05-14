import { Lock, Clock } from "@/components/icons";
import type { SVGProps } from "react";

const Eye = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const ShieldDental = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function Trust() {
  return (
    <section id="trust" className="trust">
      <div className="wrap trust-inner">
        <div className="trust-viz reveal">
          <div className="shield">
            <div className="ring ring1" />
            <div className="ring ring2" />
            <div className="ring ring3" />
            <svg viewBox="0 0 100 110">
              <defs>
                <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3E8EFF" />
                  <stop offset="100%" stopColor="#90F0C5" />
                </linearGradient>
              </defs>
              <path d="M50 5 L90 20 L90 55 Q90 90 50 105 Q10 90 10 55 L10 20 Z" fill="url(#sg)" opacity=".2" />
              <path d="M50 5 L90 20 L90 55 Q90 90 50 105 Q10 90 10 55 L10 20 Z" fill="none" stroke="url(#sg)" strokeWidth="1.5" />
              <path d="M35 55 L45 65 L65 45" fill="none" stroke="#90F0C5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        <div className="reveal">
          <span className="eyebrow">HIPAA compliance</span>
          <h2>HIPAA compliance you can <span className="grad-text">trust.</span></h2>
          <p className="lead">We don&apos;t just meet standards. We build on them.</p>
          <div className="trust-list">
            <div className="trust-item">
              <div className="trust-item-icon"><Lock width={18} height={18} stroke="#3E8EFF" /></div>
              <div>
                <h4>End-to-end encryption</h4>
                <p>Every referral, every message, every file encrypted in transit and at rest.</p>
              </div>
            </div>
            <div className="trust-item">
              <div className="trust-item-icon" style={{ background: "rgba(144,240,197,0.15)" }}>
                <Clock width={18} height={18} stroke="#90F0C5" />
              </div>
              <div>
                <h4>Audit logs for every action</h4>
                <p>Every login, every change, every download timestamped and traceable.</p>
              </div>
            </div>
            <div className="trust-item">
              <div className="trust-item-icon" style={{ background: "rgba(255,199,148,0.15)" }}>
                <Eye width={18} height={18} stroke="#FFC794" />
              </div>
              <div>
                <h4>Role-based access with auto timeouts</h4>
                <p>Staff see only what they need. Sessions end when they should.</p>
              </div>
            </div>
            <div className="trust-item">
              <div className="trust-item-icon" style={{ background: "rgba(62,142,255,0.15)" }}>
                <ShieldDental width={18} height={18} stroke="#3E8EFF" />
              </div>
              <div>
                <h4>Designed for dental privacy from day one</h4>
                <p>Built around HIPAA from the first line of code. Never retrofitted.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
