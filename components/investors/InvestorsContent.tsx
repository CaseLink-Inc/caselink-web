"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ReferralJourney from "@/components/investors/ReferralJourney";

/* ===============================================================
   COUNTER — counts up from 0 to target on every viewport entry.
   =============================================================== */
type CounterProps = {
  to: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
  separator?: boolean;
};

function Counter({ to, prefix = "", suffix = "", decimals = 0, duration = 1600, className, separator = false }: CounterProps) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const rafRef = useRef<number | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setVal(to);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
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
          } else if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
          }
        });
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [to, duration]);
  const formatted = separator ? Math.round(val).toLocaleString() : val.toFixed(decimals);
  return (
    <span ref={ref} className={className}>
      {prefix}{formatted}{suffix}
    </span>
  );
}

function AnimatedBar({
  targetPct,
  className,
  axis = "height",
  delay = 0,
}: {
  targetPct: number;
  className?: string;
  axis?: "height" | "width";
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [val, setVal] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setVal(targetPct);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setTimeout(() => setVal(targetPct), 80 + delay);
          else setVal(0);
        });
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [targetPct, delay]);
  const style = axis === "width" ? { width: `${val}%` } : { height: `${val}%` };
  return <div ref={ref} className={className} style={style} />;
}

function CircleProgress({ targetPct, color }: { targetPct: number; color: string }) {
  const r = 36;
  const c = 2 * Math.PI * r;
  const ref = useRef<SVGSVGElement>(null);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setProgress(targetPct);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setTimeout(() => setProgress(targetPct), 80);
          else setProgress(0);
        });
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [targetPct]);
  const offset = c - (c * progress) / 100;
  return (
    <svg ref={ref} viewBox="0 0 90 90" className="inv-circ">
      <circle cx="45" cy="45" r={r} fill="none" stroke="rgba(26,31,30,0.08)" strokeWidth="6" />
      <circle
        cx="45"
        cy="45"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform="rotate(-90 45 45)"
        style={{ transition: "stroke-dashoffset 1.6s cubic-bezier(0.16, 1, 0.3, 1)" }}
      />
    </svg>
  );
}

function PracticeDots({ count = 12 }: { count?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => setShown(e.isIntersecting));
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`inv-dots ${shown ? "shown" : ""}`}>
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className="inv-dot" style={{ transitionDelay: `${i * 60}ms` }} />
      ))}
    </div>
  );
}

function Reveal({ as: Tag = "div", className = "", children, delay }: any) {
  return (
    <Tag
      className={`reveal ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}

export default function InvestorsContent() {
  useEffect(() => {
    document.body.dataset.invPage = "true";
    return () => {
      delete document.body.dataset.invPage;
    };
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
            <Link href="/" className="inv-topnav-home" aria-label="Back to caselink.net">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12 L12 3 L21 12" />
                <path d="M5 10 V20 H19 V10" />
              </svg>
              caselink.net
            </Link>
          </div>
          <a href="mailto:nick@caselink.net?subject=CaseLink%20investor%20call" className="btn inv-cta">
            Talk to Nick
          </a>
        </div>
      </header>

      {/* ===== 1. HERO ===== */}
      <section className="inv-hero" id="top">
        <div className="inv-hero-bg" aria-hidden="true" />
        <div className="wrap inv-hero-inner">
          <div className="inv-hero-text">
            <Reveal as="span" className="inv-eyebrow">
              Investor snapshot · May 2026 · Confidential
            </Reveal>
            <Reveal as="h1" delay={80}>
              <span className="inv-amount-line">
                $<Counter to={500} separator />,000 <span className="inv-amount-sub">pre-seed.</span>
              </span>
              <span className="inv-amount-line">
                <span className="grad-text">$4M cap.</span>{" "}
                <Counter to={12} /> practices live.
              </span>
            </Reveal>
            <Reveal as="div" className="inv-hero-cta" delay={200}>
              <a className="btn inv-cta" href="mailto:nick@caselink.net?subject=CaseLink%20investor%20call">
                Talk to Nick
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </a>
              <Link href="/" className="btn inv-cta-ghost">Back to caselink.net</Link>
            </Reveal>
          </div>
          <div className="inv-hero-flow">
            <ReferralJourney />
          </div>
        </div>
      </section>

      {/* ===== 2. THE ROUND ===== */}
      <section className="inv-sec inv-round" aria-labelledby="round-h">
        <div className="inv-sec-tint" aria-hidden="true" />
        <div className="wrap">
          <Reveal className="inv-panel">
            <header className="inv-panel-head">
              <span className="inv-panel-num">02</span>
              <h2 id="round-h" className="inv-panel-title">The round</h2>
              <span className="inv-panel-status">
                <span className="inv-panel-status-dot" />
                Open
              </span>
            </header>
            <div className="inv-panel-body inv-round-body">
              <div className="inv-round-headline">
                <div className="inv-round-amount">
                  $<Counter to={500} separator />,000
                </div>
                <div className="inv-round-sub">YC Standard SAFE</div>
              </div>
              <dl className="inv-round-metrics">
                <div className="inv-round-metric">
                  <dt>Valuation cap</dt>
                  <dd>$4,000,000<span className="inv-round-metric-small"> post</span></dd>
                </div>
                <div className="inv-round-metric">
                  <dt>Discount</dt>
                  <dd>20%</dd>
                </div>
                <div className="inv-round-metric">
                  <dt>Equity at cap</dt>
                  <dd>~20%</dd>
                </div>
                <div className="inv-round-metric">
                  <dt>Year 3 ARR</dt>
                  <dd>$2.4M</dd>
                </div>
              </dl>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== 3. TODAY ===== */}
      <section className="inv-sec inv-today" aria-labelledby="today-h">
        <div className="wrap">
          <Reveal className="inv-panel">
            <header className="inv-panel-head">
              <span className="inv-panel-num">03</span>
              <h2 id="today-h" className="inv-panel-title">Today</h2>
              <span className="inv-panel-status inv-panel-status-live">
                <span className="inv-panel-status-dot" />
                Live
              </span>
            </header>
            <div className="inv-panel-body inv-today-body">
              <div className="inv-today-col">
                <div className="inv-today-col-lbl">Practices live</div>
                <div className="inv-today-col-val">
                  <Counter to={12} />
                </div>
                <PracticeDots count={12} />
                <div className="inv-today-col-foot">DMV network</div>
              </div>
              <div className="inv-today-col">
                <div className="inv-today-col-lbl">Pilot retention</div>
                <div className="inv-today-col-ring">
                  <CircleProgress targetPct={100} color="#3DBD6B" />
                  <div className="inv-today-col-ring-val">
                    <Counter to={100} suffix="%" />
                  </div>
                </div>
                <div className="inv-today-col-foot">Across all pilots</div>
              </div>
              <div className="inv-today-col">
                <div className="inv-today-col-lbl">Pilot churn</div>
                <div className="inv-today-col-ring">
                  <CircleProgress targetPct={0} color="#FFA940" />
                  <div className="inv-today-col-ring-val">
                    <Counter to={0} suffix="%" />
                  </div>
                </div>
                <div className="inv-today-col-foot">No losses to date</div>
              </div>
              <div className="inv-today-col">
                <div className="inv-today-col-lbl">Platform</div>
                <div className="inv-today-col-val">V1</div>
                <div className="inv-today-col-meta">
                  <span className="inv-today-col-tag">Shipped</span>
                  <span className="inv-today-col-tag inv-today-col-tag-mute">Dec 2025</span>
                </div>
                <div className="inv-today-col-foot">Web platform, mobile next</div>
              </div>
            </div>
            <footer className="inv-panel-foot">
              Pre-revenue today. Paid conversion begins Q3 2026.
            </footer>
          </Reveal>
        </div>
      </section>

      {/* ===== 4. THE PLAN ===== */}
      <section className="inv-sec inv-plan" aria-labelledby="plan-h">
        <div className="inv-sec-tint" aria-hidden="true" />
        <div className="wrap">
          <Reveal className="inv-panel">
            <header className="inv-panel-head">
              <span className="inv-panel-num">04</span>
              <h2 id="plan-h" className="inv-panel-title">Three-year trajectory</h2>
              <span className="inv-panel-status-meta">2026 — 2028</span>
            </header>
            <div className="inv-panel-body inv-plan-body">
              <div className="inv-plan-chart">
                <div className="inv-plan-chart-grid">
                  <span /><span /><span /><span />
                </div>
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
                <thead>
                  <tr>
                    <th></th>
                    <th>2026</th>
                    <th>2027</th>
                    <th>2028</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="inv-plan-arr">
                    <th scope="row">ARR</th>
                    <td>$610K</td>
                    <td>$1.5M</td>
                    <td>$2.4M</td>
                  </tr>
                  <tr>
                    <th scope="row">MRR</th>
                    <td>$51K</td>
                    <td>$126K</td>
                    <td>$200K</td>
                  </tr>
                  <tr>
                    <th scope="row">Specialists</th>
                    <td>170</td>
                    <td>420</td>
                    <td>670</td>
                  </tr>
                  <tr>
                    <th scope="row">GPs (free)</th>
                    <td>340</td>
                    <td>840</td>
                    <td>1,340</td>
                  </tr>
                  <tr>
                    <th scope="row">Gross margin</th>
                    <td>70%</td>
                    <td>75%</td>
                    <td>78%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== 5. WHERE IT GOES ===== */}
      <section className="inv-sec inv-where" aria-labelledby="where-h">
        <div className="wrap">
          <Reveal className="inv-panel">
            <header className="inv-panel-head">
              <span className="inv-panel-num">05</span>
              <h2 id="where-h" className="inv-panel-title">Where it goes</h2>
              <span className="inv-panel-status-meta">$500K · 50 / 50 split</span>
            </header>
            <div className="inv-panel-body inv-where-body">
              <div className="inv-alloc">
                <div className="inv-alloc-row">
                  <div className="inv-alloc-lbl">
                    <span className="inv-alloc-pct">50%</span>
                    Product
                  </div>
                  <div className="inv-alloc-track">
                    <AnimatedBar targetPct={50} axis="width" className="inv-alloc-fill inv-alloc-fill-blue" />
                  </div>
                  <div className="inv-alloc-amt">$250K</div>
                </div>
                <p className="inv-alloc-desc">PMS integrations (Dentrix, Cloud 9). Onboarding. Analytics.</p>

                <div className="inv-alloc-row">
                  <div className="inv-alloc-lbl">
                    <span className="inv-alloc-pct">50%</span>
                    Go-to-market
                  </div>
                  <div className="inv-alloc-track">
                    <AnimatedBar targetPct={50} axis="width" className="inv-alloc-fill inv-alloc-fill-mint" delay={140} />
                  </div>
                  <div className="inv-alloc-amt">$250K</div>
                </div>
                <p className="inv-alloc-desc">First paid push. Conference presence. East Coast expansion.</p>
              </div>

              <div className="inv-targets-block">
                <div className="inv-targets-block-h">Year 1 targets</div>
                <ul className="inv-targets">
                  {[
                    "170 specialists onboarded",
                    "$610K ARR by Q4 2026",
                    "Two PMS integrations live",
                    "Breakeven trajectory by month 18",
                  ].map((item, i) => (
                    <li key={item} className="inv-target" style={{ transitionDelay: `${i * 80}ms` }}>
                      <span className="inv-target-check" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== 6. CONTACT ===== */}
      <section className="inv-sec inv-contact" aria-labelledby="contact-h">
        <div className="inv-sec-tint inv-sec-tint-contact" aria-hidden="true" />
        <div className="wrap">
          <Reveal className="inv-panel inv-panel-contact">
            <header className="inv-panel-head">
              <span className="inv-panel-num">06</span>
              <h2 id="contact-h" className="inv-panel-title">Contact</h2>
            </header>
            <div className="inv-panel-body inv-contact-body">
              <div className="inv-contact-name">Nicholas Campbell</div>
              <div className="inv-contact-role">Co-founder and CEO</div>
              <div className="inv-contact-lines">
                <a href="mailto:nick@caselink.net?subject=CaseLink%20investor%20call" className="inv-contact-line">
                  <span className="inv-contact-line-lbl">Email</span>
                  <span className="inv-contact-line-val">nick@caselink.net</span>
                </a>
                <a href="tel:+17035543449" className="inv-contact-line">
                  <span className="inv-contact-line-lbl">Phone</span>
                  <span className="inv-contact-line-val">(703) 554-3449</span>
                </a>
              </div>
              <a className="btn inv-cta inv-cta-sheen" href="mailto:nick@caselink.net?subject=CaseLink%20investor%20call">
                Talk to Nick
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </Reveal>
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
