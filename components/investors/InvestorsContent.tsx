"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import BookCallButton from "@/components/BookCallButton";
import ReferralJourney from "@/components/investors/ReferralJourney";

/* ===== COUNTER ===== */
function Counter({ to, decimals = 0, duration = 1600, separator = false, suffix = "", prefix = "" }: { to: number; decimals?: number; duration?: number; separator?: boolean; suffix?: string; prefix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const rafRef = useRef<number | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) { setVal(to); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          if (rafRef.current) cancelAnimationFrame(rafRef.current);
          setVal(0);
          const start = performance.now();
          const step = (now: number) => {
            const t = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - t, 3);
            setVal(to * eased);
            if (t < 1) rafRef.current = requestAnimationFrame(step);
          };
          rafRef.current = requestAnimationFrame(step);
        } else if (rafRef.current) cancelAnimationFrame(rafRef.current);
      });
    }, { threshold: 0.4 });
    io.observe(el);
    return () => { io.disconnect(); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [to, duration]);
  const formatted = separator ? Math.round(val).toLocaleString() : val.toFixed(decimals);
  return <span ref={ref}>{prefix}{formatted}{suffix}</span>;
}

/* ===== ANIMATED BAR ===== */
function AnimatedBar({ targetPct, className, axis = "height", delay = 0 }: { targetPct: number; className?: string; axis?: "height" | "width"; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [val, setVal] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) { setVal(targetPct); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) setTimeout(() => setVal(targetPct), 80 + delay);
        else setVal(0);
      });
    }, { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, [targetPct, delay]);
  const style = axis === "width" ? { width: `${val}%` } : { height: `${val}%` };
  return <div ref={ref} className={className} style={style} />;
}

/* ===== MOUSE-FOLLOW PANEL ===== */
/* Adds a soft radial spotlight that follows the cursor inside a panel.
   Sets --x / --y CSS variables which the panel uses to position the
   gradient. Gives the page a live, responsive feel. */
function useMouseFollow() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
      el.style.setProperty("--my", `${e.clientY - rect.top}px`);
    };
    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, []);
  return ref;
}

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useMouseFollow();
  return (
    <div ref={ref} className={`inv-panel reveal ${className}`}>
      <div className="inv-panel-spot" aria-hidden="true" />
      {children}
    </div>
  );
}

function Reveal({ as: Tag = "div", className = "", children, delay }: any) {
  return <Tag className={`reveal ${className}`} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>{children}</Tag>;
}

/* ===== SPARKLINE ===== */
/* Tiny inline sparkline SVG. Path animates in on scroll-into-view. */
function Sparkline({ points, color }: { points: number[]; color: string }) {
  const w = 120, h = 30;
  const max = Math.max(...points), min = Math.min(...points);
  const range = max - min || 1;
  const path = points
    .map((p, i) => `${(i / (points.length - 1)) * w},${h - ((p - min) / range) * h}`)
    .join(" L ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="inv-spark" preserveAspectRatio="none" aria-hidden="true">
      <path d={`M ${path}`} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={w} cy={h - ((points[points.length - 1] - min) / range) * h} r="3" fill={color}>
        <animate attributeName="opacity" values="1;0.3;1" dur="1.8s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

export default function InvestorsContent() {
  useEffect(() => {
    document.body.dataset.invPage = "true";
    return () => { delete document.body.dataset.invPage; };
  }, []);

  return (
    <div className="inv-page">
      {/* TOP NAV */}
      <header className="inv-topnav">
        <div className="wrap inv-topnav-inner">
          <div className="inv-topnav-left">
            <Link href="/" className="inv-topnav-logo" aria-label="CaseLink home">
              <Image src="/logo-primary.svg" alt="CaseLink" width={170} height={38} priority />
            </Link>
            <Link href="/" className="inv-topnav-home">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12 L12 3 L21 12" />
                <path d="M5 10 V20 H19 V10" />
              </svg>
              caselink.net
            </Link>
          </div>
          <BookCallButton className="inv-nav-cta">
            <span className="inv-nav-cta-glow" aria-hidden="true" />
            <span className="inv-nav-cta-inner">
              Talk to Nick
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
            </span>
          </BookCallButton>
        </div>
      </header>

      {/* ===== 1. HERO ===== */}
      <section className="inv-hero" id="top">
        <div className="inv-hero-bg" aria-hidden="true">
          <div className="inv-hero-grid" />
        </div>
        <div className="wrap inv-hero-inner">
          <Reveal as="div" className="inv-hero-live">
            <span className="inv-hero-live-dot" />
            <span className="inv-hero-live-txt">12 practices live in the DMV</span>
          </Reveal>
          <Reveal as="h1" className="inv-hero-h" delay={80}>
            $<Counter to={500} separator />,000 pre-seed.
            <br />
            <span className="inv-hero-h-sub">$4M cap. V1 shipped. Round open.</span>
          </Reveal>
          <Reveal as="p" className="inv-hero-lede" delay={160}>
            A six-section snapshot of CaseLink, the referral and collaboration
            network for general dentists and specialists.
          </Reveal>
          <Reveal as="div" className="inv-hero-cta" delay={240}>
            <BookCallButton className="btn inv-cta inv-cta-lg">
              Talk to Nick
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
            </BookCallButton>
            <Link href="/" className="btn inv-cta-ghost inv-cta-lg">Back to caselink.net</Link>
          </Reveal>
        </div>
      </section>

      {/* ===== 2. THE ROUND ===== */}
      <section className="inv-sec inv-round">
        <div className="wrap">
          <Panel className="inv-panel-round">
            <header className="inv-panel-head">
              <span className="inv-panel-num">02</span>
              <h2 className="inv-panel-title">The round</h2>
              <span className="inv-panel-status">
                <span className="inv-panel-status-dot" />
                Open
              </span>
            </header>
            <div className="inv-panel-body inv-round-body">
              <div className="inv-round-grid">
                <div className="inv-round-tile inv-round-tile-blue">
                  <div className="inv-round-tile-lbl">Valuation cap</div>
                  <div className="inv-round-tile-val">
                    $<Counter to={4} />M
                  </div>
                  <div className="inv-round-tile-foot">Post-money</div>
                </div>
                <div className="inv-round-tile">
                  <div className="inv-round-tile-lbl">Discount</div>
                  <div className="inv-round-tile-val">
                    <Counter to={20} />%
                  </div>
                  <div className="inv-round-tile-foot">YC standard SAFE</div>
                </div>
                <div className="inv-round-tile">
                  <div className="inv-round-tile-lbl">Equity at cap</div>
                  <div className="inv-round-tile-val">
                    ~<Counter to={20} />%
                  </div>
                  <div className="inv-round-tile-foot">Diluted post-round</div>
                </div>
                <div className="inv-round-tile inv-round-tile-mint">
                  <div className="inv-round-tile-lbl">Year 3 ARR</div>
                  <div className="inv-round-tile-val">
                    $<Counter to={2.4} decimals={1} />M
                  </div>
                  <div className="inv-round-tile-foot">Projection · 2028</div>
                </div>
              </div>
            </div>
            <footer className="inv-panel-foot inv-round-foot">
              <span>Instrument</span>
              <strong>YC standard SAFE, pre-seed</strong>
              <span className="inv-round-foot-sep" />
              <span>Raise</span>
              <strong>$500,000</strong>
            </footer>
          </Panel>
        </div>
      </section>

      {/* ===== 3. TODAY ===== */}
      <section className="inv-sec inv-today">
        <div className="inv-sec-mesh inv-sec-mesh-today" aria-hidden="true" />
        <div className="wrap">
          <Panel className="inv-panel-today">
            <header className="inv-panel-head">
              <span className="inv-panel-num">03</span>
              <h2 className="inv-panel-title">Today</h2>
              <span className="inv-panel-status inv-panel-status-live">
                <span className="inv-panel-status-dot" />
                Live
              </span>
            </header>
            <div className="inv-today-strip">
              <ReferralJourney />
            </div>
            <div className="inv-panel-body inv-today-body">
              <div className="inv-tcell inv-tcell-blue">
                <div className="inv-tcell-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="7" r="3.5" /><circle cx="17" cy="9" r="2.5" /><path d="M3 20c1-3.5 3-5.5 6-5.5s5 2 6 5.5" /><path d="M15 18c0.7-2 2-3 3.5-3s2.5 1 3 3" />
                  </svg>
                </div>
                <div className="inv-tcell-num"><Counter to={12} /></div>
                <div className="inv-tcell-lbl">Practices live</div>
                <div className="inv-tcell-foot">DMV network · +12 this year</div>
              </div>

              <div className="inv-tcell inv-tcell-green">
                <div className="inv-tcell-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l6-6 4 4 8-8" /><polyline points="14 7 20 7 20 13" /></svg>
                </div>
                <div className="inv-tcell-num"><Counter to={100} suffix="%" /></div>
                <div className="inv-tcell-lbl">Pilot retention</div>
                <div className="inv-tcell-foot">Across all pilots</div>
              </div>

              <div className="inv-tcell inv-tcell-warm">
                <div className="inv-tcell-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h18" /><circle cx="12" cy="12" r="9" /></svg>
                </div>
                <div className="inv-tcell-num"><Counter to={0} suffix="%" /></div>
                <div className="inv-tcell-lbl">Pilot churn</div>
                <div className="inv-tcell-foot">No losses to date</div>
              </div>

              <div className="inv-tcell inv-tcell-ink">
                <div className="inv-tcell-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 7l7-3 7 3v10l-7 3-7-3V7z" /><path d="M5 7l7 3 7-3" /><path d="M12 10v10" /></svg>
                </div>
                <div className="inv-tcell-num">V1</div>
                <div className="inv-tcell-lbl">Platform</div>
                <div className="inv-tcell-foot">Shipped December 2025</div>
              </div>
            </div>
            <footer className="inv-panel-foot">
              Pre-revenue today. Paid conversion begins Q3 2026.
            </footer>
          </Panel>
        </div>
      </section>

      {/* ===== 4. THE PLAN ===== */}
      <section className="inv-sec inv-plan">
        <div className="wrap">
          <Panel className="inv-panel-plan">
            <header className="inv-panel-head">
              <span className="inv-panel-num">04</span>
              <h2 className="inv-panel-title">Three-year trajectory</h2>
              <span className="inv-panel-status-meta">2026 – 2028</span>
            </header>
            <div className="inv-panel-body inv-plan-body">
              <div className="inv-plan-chart">
                <div className="inv-plan-chart-grid"><span /><span /><span /><span /></div>
                <div className="inv-plan-chart-area">
                  {[
                    { yr: "2026", v: "$610K", h: 25, cls: "inv-bar-1" },
                    { yr: "2027", v: "$1.5M", h: 62, cls: "inv-bar-2" },
                    { yr: "2028", v: "$2.4M", h: 100, cls: "inv-bar-3" },
                  ].map((b, i) => (
                    <div key={b.yr} className="inv-bar-col">
                      <div className="inv-bar-val">{b.v}</div>
                      <div className="inv-bar-track">
                        <AnimatedBar targetPct={b.h} className={`inv-bar ${b.cls}`} delay={i * 140} />
                      </div>
                      <div className="inv-bar-yr">{b.yr}</div>
                    </div>
                  ))}
                </div>
              </div>
              <table className="inv-plan-table">
                <thead><tr><th></th><th>2026</th><th>2027</th><th>2028</th></tr></thead>
                <tbody>
                  <tr className="inv-plan-arr"><th>ARR</th><td>$610K</td><td>$1.5M</td><td>$2.4M</td></tr>
                  <tr><th>MRR</th><td>$51K</td><td>$126K</td><td>$200K</td></tr>
                  <tr><th>Specialists</th><td>170</td><td>420</td><td>670</td></tr>
                  <tr><th>GPs (free)</th><td>340</td><td>840</td><td>1,340</td></tr>
                  <tr><th>Gross margin</th><td>70%</td><td>75%</td><td>78%</td></tr>
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      </section>

      {/* ===== 5. WHERE IT GOES ===== */}
      <section className="inv-sec inv-where">
        <div className="inv-sec-mesh inv-sec-mesh-where" aria-hidden="true" />
        <div className="wrap">
          <Panel className="inv-panel-where">
            <header className="inv-panel-head">
              <span className="inv-panel-num">05</span>
              <h2 className="inv-panel-title">Where it goes</h2>
              <span className="inv-panel-status-meta">$500K · 12 months</span>
            </header>
            <div className="inv-panel-body inv-where-body">
              <div className="inv-flow-viz">
                <div className="inv-flow-source">
                  <div className="inv-flow-source-lbl">Investment</div>
                  <div className="inv-flow-source-amt">$500K</div>
                </div>
                <svg className="inv-flow-lines" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
                  <defs>
                    <linearGradient id="invFlowBlue" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#3E8EFF" stopOpacity="0.8" /><stop offset="100%" stopColor="#3E8EFF" stopOpacity="0.30" /></linearGradient>
                    <linearGradient id="invFlowMint" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#5CD68B" stopOpacity="0.8" /><stop offset="100%" stopColor="#90F0C5" stopOpacity="0.30" /></linearGradient>
                  </defs>
                  <path d="M 0 100 C 120 100, 180 50, 400 50" fill="none" stroke="url(#invFlowBlue)" strokeWidth="2" strokeDasharray="3 4" strokeLinecap="round" />
                  <path d="M 0 100 C 120 100, 180 150, 400 150" fill="none" stroke="url(#invFlowMint)" strokeWidth="2" strokeDasharray="3 4" strokeLinecap="round" />
                  <circle r="2.5" fill="#3E8EFF">
                    <animateMotion path="M 0 100 C 120 100, 180 50, 400 50" dur="3s" repeatCount="indefinite" />
                  </circle>
                  <circle r="2.5" fill="#5CD68B">
                    <animateMotion path="M 0 100 C 120 100, 180 150, 400 150" dur="3s" begin="0.6s" repeatCount="indefinite" />
                  </circle>
                  <circle r="2" fill="#3E8EFF" opacity="0.6">
                    <animateMotion path="M 0 100 C 120 100, 180 50, 400 50" dur="3s" begin="1.2s" repeatCount="indefinite" />
                  </circle>
                  <circle r="2" fill="#5CD68B" opacity="0.6">
                    <animateMotion path="M 0 100 C 120 100, 180 150, 400 150" dur="3s" begin="1.8s" repeatCount="indefinite" />
                  </circle>
                </svg>
                <div className="inv-flow-dests">
                  <div className="inv-flow-dest inv-flow-dest-blue">
                    <div className="inv-flow-dest-pct">50%</div>
                    <div className="inv-flow-dest-t">Product</div>
                    <div className="inv-flow-dest-amt">$250K</div>
                    <p>PMS integrations (Dentrix, Cloud 9). Onboarding. Analytics.</p>
                  </div>
                  <div className="inv-flow-dest inv-flow-dest-mint">
                    <div className="inv-flow-dest-pct">50%</div>
                    <div className="inv-flow-dest-t">Go-to-market</div>
                    <div className="inv-flow-dest-amt">$250K</div>
                    <p>First paid push. Conference presence. East Coast expansion.</p>
                  </div>
                </div>
              </div>

              <div className="inv-targets-block">
                <div className="inv-targets-block-head">
                  <span className="inv-targets-block-lbl">Year 1 targets</span>
                  <span className="inv-targets-block-meta">By Q4 2026</span>
                </div>
                <ul className="inv-targets">
                  {[
                    { n: "170", unit: "", lbl: "Specialists onboarded", icon: "user" },
                    { n: "$610", unit: "K", lbl: "ARR by Q4 2026", icon: "chart" },
                    { n: "2", unit: "", lbl: "PMS integrations live", icon: "plug" },
                    { n: "18", unit: "mo", lbl: "To breakeven trajectory", icon: "flag" },
                  ].map((t, i) => (
                    <li key={t.lbl} className="inv-target" style={{ transitionDelay: `${i * 80}ms` }}>
                      <span className="inv-target-ic" aria-hidden="true">
                        {t.icon === "user" && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-7 8-7s8 3 8 7" /></svg>}
                        {t.icon === "chart" && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l5-5 4 4 8-8" /><polyline points="14 8 20 8 20 14" /></svg>}
                        {t.icon === "plug" && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 2v6M15 2v6M6 8h12v4a6 6 0 01-12 0z" /><path d="M12 18v4" /></svg>}
                        {t.icon === "flag" && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 3v18M4 4h12l-2 4 2 4H4" /></svg>}
                      </span>
                      <span className="inv-target-body">
                        <span className="inv-target-n">
                          {t.n}<span className="inv-target-unit">{t.unit}</span>
                        </span>
                        <span className="inv-target-lbl">{t.lbl}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Panel>
        </div>
      </section>

      {/* ===== 6. CONTACT ===== */}
      <section className="inv-sec inv-contact">
        <div className="inv-sec-mesh inv-sec-mesh-contact" aria-hidden="true" />
        <div className="wrap">
          <Panel className="inv-panel-contact">
            <div className="inv-contact-body">
              <Reveal className="inv-contact-portrait-wrap">
                <div className="inv-contact-orbit-1" aria-hidden="true" />
                <div className="inv-contact-orbit-2" aria-hidden="true" />
                <div className="inv-contact-portrait">
                  <Image src="/portrait.png" alt="Nicholas Campbell" width={555} height={800} priority />
                </div>
              </Reveal>
              <Reveal className="inv-contact-text" delay={120}>
                <div className="inv-contact-eyebrow">
                  <span className="inv-panel-status-dot" />
                  Available for investor conversations
                </div>
                <h2 className="inv-contact-h">
                  Talk to <span className="grad-text">Nick.</span>
                </h2>
                <p className="inv-contact-lede">
                  Nick handles every investor conversation directly. Pick the
                  one that fits how you want to start.
                </p>
                <div className="inv-contact-grid">
                  <BookCallButton className="inv-contact-btn inv-contact-btn-primary">
                    <span className="inv-contact-btn-ic">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 9h18M8 3v4M16 3v4" /></svg>
                    </span>
                    <span className="inv-contact-btn-t">Book a call</span>
                    <span className="inv-contact-btn-s">15 min walkthrough</span>
                  </BookCallButton>
                  <a className="inv-contact-btn" href="https://app.caselink.net" target="_blank" rel="noopener noreferrer">
                    <span className="inv-contact-btn-ic">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="14" rx="2" /><path d="M8 20h8M12 18v2" /></svg>
                    </span>
                    <span className="inv-contact-btn-t">Platform</span>
                    <span className="inv-contact-btn-s">app.caselink.net</span>
                  </a>
                  <Link className="inv-contact-btn" href="/">
                    <span className="inv-contact-btn-ic">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" /></svg>
                    </span>
                    <span className="inv-contact-btn-t">Website</span>
                    <span className="inv-contact-btn-s">caselink.net</span>
                  </Link>
                  <a className="inv-contact-btn" href="mailto:nick@caselink.net?subject=CaseLink%20pitch%20deck%20request">
                    <span className="inv-contact-btn-ic">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" /><path d="M9 13h6M9 17h4" /></svg>
                    </span>
                    <span className="inv-contact-btn-t">Pitch deck</span>
                    <span className="inv-contact-btn-s">Request via email</span>
                  </a>
                </div>
                <div className="inv-contact-direct">
                  <a href="mailto:nick@caselink.net">nick@caselink.net</a>
                  <span className="inv-contact-direct-sep" />
                  <a href="tel:+17035543449">(703) 554-3449</a>
                </div>
              </Reveal>
            </div>
          </Panel>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="inv-footer">
        <div className="wrap">
          <p>
            CaseLink Inc. Delaware C-Corp. Incorporated June 27, 2025. File #10242704.
            Confidential. Forecasts are estimates. SAFE on standard YC terms at a $4M cap, 20% discount.
          </p>
        </div>
      </footer>
    </div>
  );
}
