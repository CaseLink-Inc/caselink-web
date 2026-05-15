"use client";

import { useEffect, useRef, useState } from "react";

const steps = [
  { when: "The spark", title: "The observation", desc: "The same broken handoff, seen over and over across dental practices in DC." },
  { when: "Listening", title: "First conversations", desc: "Months of listening to GPs, specialists, and front desk teams about what truly breaks." },
  { when: "Building", title: "The first prototype", desc: "An MVP narrow enough to be useful. Referrals, status, secure chat, outcomes." },
  { when: "Right now", title: "DC pilots", desc: "Founding member practices going live with full support and shared learnings." },
  { when: "Next", title: "Beyond DC", desc: "Bringing the model to Boston, Philadelphia, Charlotte, and Atlanta." },
];

// Where each step's dot sits along the line, as a percentage.
const dotPercents = [10, 30, 50, 70, 90];

// We're actively running DC pilots, so the leading edge lands just past
// the 4th dot but never reaches the 5th.
const TARGET_PROGRESS = 78;
// Cycle phases (ms):
//  - fill    : 0 -> TARGET_PROGRESS (ease-out)
//  - hold-in : stay at peak
//  - retreat : TARGET_PROGRESS -> 0 (ease-in)
//  - hold-out: stay at 0 before the next sweep
const FILL_MS = 2400;
const HOLD_IN_MS = 1600;
const RETREAT_MS = 1200;
const HOLD_OUT_MS = 600;
const CYCLE_MS = FILL_MS + HOLD_IN_MS + RETREAT_MS + HOLD_OUT_MS;

function progressForCycle(t: number): number {
  if (t < FILL_MS) {
    const u = t / FILL_MS;
    const eased = 1 - Math.pow(1 - u, 3);
    return eased * TARGET_PROGRESS;
  }
  if (t < FILL_MS + HOLD_IN_MS) return TARGET_PROGRESS;
  if (t < FILL_MS + HOLD_IN_MS + RETREAT_MS) {
    const u = (t - FILL_MS - HOLD_IN_MS) / RETREAT_MS;
    const eased = u * u * u; // ease-in
    return TARGET_PROGRESS * (1 - eased);
  }
  return 0;
}

export default function Timeline() {
  const gridRef = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState<boolean[]>(Array(steps.length).fill(false));
  const [progress, setProgress] = useState(0);
  const [glowing, setGlowing] = useState<boolean[]>(Array(steps.length).fill(false));

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;

    let raf = 0;
    let running = false;
    let cycleStart = 0;

    const tick = (now: number) => {
      const t = (now - cycleStart) % CYCLE_MS;
      const pct = progressForCycle(t);
      setProgress(pct);
      setGlowing(dotPercents.map((dotAt) => pct >= dotAt - 0.5));
      if (running) raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running) return;
      running = true;
      cycleStart = performance.now();
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Stagger the step cards in on first reveal (one-shot, the text
            // doesn't need to keep fading in and out).
            steps.forEach((_, i) => {
              setTimeout(() => {
                setShown((arr) => {
                  if (arr[i]) return arr;
                  const next = [...arr];
                  next[i] = true;
                  return next;
                });
              }, i * 150);
            });
            start();
          } else {
            stop();
          }
        });
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => {
      stop();
      obs.disconnect();
    };
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
