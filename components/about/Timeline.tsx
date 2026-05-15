"use client";

import { useEffect, useRef, useState } from "react";

const steps = [
  { when: "The spark", title: "The observation", desc: "The same broken handoff, seen over and over across dental practices in DC." },
  { when: "Listening", title: "First conversations", desc: "Months of listening to GPs, specialists, and front desk teams about what truly breaks." },
  { when: "Building", title: "The first prototype", desc: "An MVP narrow enough to be useful. Referrals, status, secure chat, outcomes." },
  { when: "Right now", title: "DC pilots", desc: "Founding member practices going live with full support and shared learnings." },
  { when: "Next", title: "Beyond DC", desc: "Bringing the model to Boston, Philadelphia, Charlotte, and Atlanta." },
];

// Where each step's dot sits along the line, as a percentage of the line width.
// 5 steps in a 5-col grid -> dots sit at roughly 10%, 30%, 50%, 70%, 90%.
const dotPercents = [10, 30, 50, 70, 90];

// We're actively running DC pilots, so the progress line should land just
// past the 4th dot (DC pilots) but not yet reach the 5th (Beyond DC).
const TARGET_PROGRESS = 78;
const ANIMATION_DURATION_MS = 2200;

export default function Timeline() {
  const gridRef = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(Array(steps.length).fill(false));
  const [progress, setProgress] = useState(0);
  const [glowing, setGlowing] = useState<boolean[]>(Array(steps.length).fill(false));

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Fade in each step card.
          steps.forEach((_, i) => {
            setTimeout(() => {
              setShown((arr) => {
                const next = [...arr];
                next[i] = true;
                return next;
              });
            }, i * 150);
          });

          // Animate the gradient progress line from 0 to TARGET_PROGRESS%
          // and glow each dot the moment the line crosses it.
          const start = performance.now();
          const tick = (now: number) => {
            const elapsed = now - start;
            const t = Math.min(1, elapsed / ANIMATION_DURATION_MS);
            // ease-out cubic so the leading edge slows as it approaches DC.
            const eased = 1 - Math.pow(1 - t, 3);
            const pct = eased * TARGET_PROGRESS;
            setProgress(pct);
            setGlowing((arr) =>
              arr.map((g, i) => g || pct >= dotPercents[i] - 0.5)
            );
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);

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
                <div className={`tl-dot ${glowing[i] ? "lit" : ""}`} />
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
