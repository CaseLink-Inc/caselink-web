import { Lock, Shield, Clock } from "@/components/icons";

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
          <span className="eyebrow">Built on trust</span>
          <h2>Compliant by <span className="grad-text">design.</span></h2>
          <p className="lead">
            Every referral, every message, every record is encrypted and
            audited. Compliance is not a feature we added later.
          </p>
          <div className="trust-list">
            <div className="trust-item">
              <div className="trust-item-icon"><Lock width={18} height={18} stroke="#3E8EFF" /></div>
              <div><h4>End-to-end encryption</h4><p>AES-256 at rest. TLS 1.3 in transit.</p></div>
            </div>
            <div className="trust-item">
              <div className="trust-item-icon" style={{ background: "rgba(255,199,148,0.15)" }}>
                <Shield width={18} height={18} stroke="#FFC794" />
              </div>
              <div><h4>HIPAA, BAA, SOC 2</h4><p>Annual audits. BAA signed with every practice.</p></div>
            </div>
            <div className="trust-item">
              <div className="trust-item-icon" style={{ background: "rgba(144,240,197,0.15)" }}>
                <Clock width={18} height={18} stroke="#90F0C5" />
              </div>
              <div><h4>Audit trail by default</h4><p>Every action timestamped. Every record traceable.</p></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
