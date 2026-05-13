"use client";

import { useEffect, useRef, useState } from "react";

const steps = [
  { when: "The spark", title: "The observation", desc: "The same broken handoff, seen over and over across dental practices in DC." },
  { when: "Listening", title: "First conversations", desc: "Months of listening to GPs, specialists, and front desk teams about what truly breaks." },
  { when: "Building", title: "The first prototype", desc: "An MVP narrow enough to be useful. Referrals, status, secure chat, outcomes." },
  { when: "Right now", title: "DC pilots", desc: "Founding member practices going live with full support and shared learnings." },
  { when: "Next", title: "Beyond DC", desc: "Bringing the model to Boston, Philadelphia, Charlotte, and Atlanta." },
];

export default function Timeline() {
  const gridRef = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(Array(steps.length).fill(false));
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          steps.forEach((_, i) => {
            setTimeout(() => {
              setShown((arr) => {
                const next = [...arr];
                next[i] = true;
                return next;
              });
            }, i * 150);
          });
          setTimeout(() => setProgress(90), 200);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.25 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="timeline-sec">
      <div className="wrap">
        <span className="eyebrow">The journey so far</span>
        <h2>From an observation<br />to a network.</h2>
        <p>Five moments that shaped where CaseLink is today, and where it is heading next.</p>
        <div className="tl-wrap">
          <div className="tl-line" />
          <div className="tl-progress" style={{ width: `${progress}%` }} />
          <div ref={gridRef} className="tl-grid">
            {steps.map((s, i) => (
              <div key={s.title} className={`tl-step ${shown[i] ? "in" : ""}`}>
                <div className="tl-dot" />
                <div className="tl-when">{s.when}</div>
                <h4 className="tl-title">{s.title}</h4>
                <p className="tl-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
