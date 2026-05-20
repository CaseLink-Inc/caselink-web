"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ReferralJourney from "@/components/investors/ReferralJourney";
import SectionBreaker from "@/components/investors/SectionBreaker";

/* ===============================================================
   COUNTER — counts up from 0 to target on every viewport entry.
   easeOutCubic. Respects prefers-reduced-motion.
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
          } else {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
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
  const formatted = separator
    ? Math.round(val).toLocaleString()
    : val.toFixed(decimals);
  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

/* ===============================================================
   ANIMATED BAR / PROGRESS — height (vertical) or width (horizontal).
   =============================================================== */
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
          if (e.isIntersecting) {
            setTimeout(() => setVal(targetPct), 80 + delay);
          } else {
            setVal(0);
          }
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

/* ===============================================================
   REVEAL — adds the .reveal class so the existing RevealInit
   observer fades the element in on scroll.
   =============================================================== */
function Reveal({
  as: Tag = "div",
  className = "",
  children,
  delay,
}: {
  as?: any;
  className?: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <Tag
      className={`reveal ${className}`}
      style={delay ? ({ transitionDelay: `${delay}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </Tag>
  );
}

/* ===============================================================
   CIRCULAR PROGRESS — used in the TODAY section for 100% / 0%.
   targetPct fills the arc on viewport entry.
   =============================================================== */
function CircleProgress({
  targetPct,
  color,
  trackColor = "rgba(26,31,30,0.06)",
  label,
}: {
  targetPct: number;
  color: string;
  trackColor?: string;
  label?: string;
}) {
  const r = 56;
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
          if (e.isIntersecting) {
            setTimeout(() => setProgress(targetPct), 80);
          } else {
            setProgress(0);
          }
        });
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [targetPct]);
  const offset = c - (c * progress) / 100;
  return (
    <svg ref={ref} viewBox="0 0 140 140" className="inv-circ" aria-label={label}>
      <circle cx="70" cy="70" r={r} fill="none" stroke={trackColor} strokeWidth="8" />
      <circle
        cx="70"
        cy="70"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform="rotate(-90 70 70)"
        style={{ transition: "stroke-dashoffset 1.6s cubic-bezier(0.16, 1, 0.3, 1)" }}
      />
    </svg>
  );
}

/* ===============================================================
   PRACTICE DOTS — twelve small dots that fade in with a stagger.
   Used inside the "12 practices live" tile.
   =============================================================== */
function PracticeDots() {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setShown(true);
          } else {
            setShown(false);
          }
        });
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`inv-dots ${shown ? "shown" : ""}`}>
      {Array.from({ length: 12 }).map((_, i) => (
        <span key={i} className="inv-dot" style={{ transitionDelay: `${i * 60}ms` }} />
      ))}
    </div>
  );
}

/* ===============================================================
   PAGE
   =============================================================== */
export default function InvestorsContent() {
  // Tag the body so the marketing Nav + Footer hide on this route.
  useEffect(() => {
    document.body.dataset.invPage = "true";
    return () => {
      delete document.body.dataset.invPage;
    };
  }, []);

  return (
    <div className="inv-page">
      {/* ===== TOP NAV ===== */}
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
        <div className="inv-hero-bg">
          <span className="inv-mesh inv-mesh-1" />
          <span className="inv-mesh inv-mesh-2" />
          <span className="inv-mesh inv-mesh-3" />
          <div className="inv-grid-overlay" />
          <span className="inv-shape inv-shape-1" />
          <span className="inv-shape inv-shape-2" />
          <span className="inv-shape inv-shape-3" />
        </div>
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
              <Link href="/" className="btn inv-cta-ghost">
                Back to caselink.net
              </Link>
            </Reveal>
          </div>

          <div className="inv-hero-flow">
            <ReferralJourney />
          </div>
        </div>
      </section>

      <SectionBreaker from="#3E8EFF" to="#90F0C5" id="hero-round" />

      {/* ===== 2. THE ROUND ===== */}
      <section className="inv-sec inv-round">
        <div className="inv-sec-bg">
          <span className="inv-mesh inv-mesh-soft inv-mesh-tl" />
          <span className="inv-mesh inv-mesh-soft inv-mesh-br" />
          <span className="inv-shape inv-shape-a" />
        </div>
        <div className="wrap">
          <Reveal as="div" className="inv-secnum">The round</Reveal>
          <Reveal as="h2" className="inv-sec-h" delay={60}>
            $500,000 SAFE,{" "}
            <span className="grad-text">currently open.</span>
          </Reveal>
          <div className="inv-round-grid">
            {[
              { lbl: "Raise", val: "$500,000", emphasis: true },
              { lbl: "Instrument", val: "YC Standard SAFE" },
              { lbl: "Valuation cap", val: "$4,000,000", small: "post-money", emphasis: true },
              { lbl: "Discount", val: "20%" },
              { lbl: "Equity at cap", val: "~20%" },
              { lbl: "Status", val: "Open", live: true },
            ].map((t, i) => (
              <Reveal key={t.lbl} className={`inv-term ${t.emphasis ? "inv-term-em" : ""}`} delay={i * 60}>
                <span className="inv-term-lbl">{t.lbl}</span>
                <span className="inv-term-val">
                  {t.val}
                  {t.live && (
                    <span className="inv-term-live">
                      <span className="inv-term-live-dot" />
                    </span>
                  )}
                </span>
                {t.small && <span className="inv-term-small">{t.small}</span>}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <SectionBreaker from="#90F0C5" to="#FFC794" id="round-today" />

      {/* ===== 3. TODAY ===== */}
      <section className="inv-sec inv-today">
        <div className="inv-sec-bg">
          <span className="inv-mesh inv-mesh-soft inv-mesh-tr" />
          <span className="inv-mesh inv-mesh-soft inv-mesh-bl" />
          <span className="inv-shape inv-shape-b" />
        </div>
        <div className="wrap">
          <Reveal as="div" className="inv-secnum">Today</Reveal>
          <Reveal as="h2" className="inv-sec-h" delay={60}>
            Four numbers,{" "}
            <span className="grad-text">live.</span>
          </Reveal>

          <div className="inv-today-grid">
            <Reveal className="inv-tile">
              <div className="inv-tile-top">
                <span className="inv-tile-live"><span className="inv-tile-live-dot" />Live</span>
              </div>
              <div className="inv-tile-val">
                <Counter to={12} />
              </div>
              <div className="inv-tile-lbl">Practices live (DMV)</div>
              <PracticeDots />
            </Reveal>

            <Reveal className="inv-tile" delay={80}>
              <div className="inv-tile-circle">
                <CircleProgress targetPct={100} color="#3DBD6B" label="Pilot retention" />
                <div className="inv-tile-circle-inner">
                  <div className="inv-tile-val inv-tile-val-mid">
                    <Counter to={100} suffix="%" />
                  </div>
                </div>
              </div>
              <div className="inv-tile-lbl">Pilot retention</div>
            </Reveal>

            <Reveal className="inv-tile" delay={160}>
              <div className="inv-tile-circle">
                <CircleProgress targetPct={0} color="#FFA940" label="Pilot churn" />
                <div className="inv-tile-circle-inner">
                  <div className="inv-tile-val inv-tile-val-mid">
                    <Counter to={0} suffix="%" />
                  </div>
                </div>
              </div>
              <div className="inv-tile-lbl">Pilot churn</div>
            </Reveal>

            <Reveal className="inv-tile" delay={240}>
              <div className="inv-tile-platform">
                <div className="inv-tile-platform-box">
                  <span className="inv-tile-platform-bar" />
                  <span className="inv-tile-platform-bar" />
                  <span className="inv-tile-platform-bar" />
                </div>
                <div className="inv-tile-check" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              </div>
              <div className="inv-tile-val">V1</div>
              <div className="inv-tile-lbl">Platform shipped</div>
            </Reveal>
          </div>

          <Reveal as="p" className="inv-today-caveat" delay={320}>
            Pre-revenue today. Paid conversion begins Q3 2026.
          </Reveal>
        </div>
      </section>

      <SectionBreaker from="#FFC794" to="#FFA940" id="today-plan" />

      {/* ===== 4. THE PLAN ===== */}
      <section className="inv-sec inv-plan">
        <div className="inv-sec-bg">
          <span className="inv-mesh inv-mesh-soft inv-mesh-tl" />
          <span className="inv-mesh inv-mesh-soft inv-mesh-br" />
          <span className="inv-shape inv-shape-c" />
        </div>
        <div className="wrap">
          <Reveal as="div" className="inv-secnum">The plan</Reveal>
          <Reveal as="h2" className="inv-sec-h" delay={60}>
            <span className="grad-text">Three-year</span> trajectory.
          </Reveal>

          {/* ARR bar chart */}
          <Reveal className="inv-chart">
            <div className="inv-chart-area">
              {[
                { yr: "2026", v: "$610K", h: 25, cls: "inv-bar-1" },
                { yr: "2027", v: "$1.5M", h: 62, cls: "inv-bar-2" },
                { yr: "2028", v: "$2.4M", h: 100, cls: "inv-bar-3" },
              ].map((b, i) => (
                <div key={b.yr} className="inv-bar-col">
                  <div className="inv-bar-val" style={{ transitionDelay: `${i * 140}ms` }}>{b.v}</div>
                  <div className="inv-bar-track">
                    <AnimatedBar targetPct={b.h} className={`inv-bar ${b.cls}`} delay={i * 140} />
                  </div>
                  <div className="inv-bar-yr">{b.yr}</div>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Full table */}
          <Reveal className="inv-plan-table-wrap" delay={120}>
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
          </Reveal>
        </div>
      </section>

      <SectionBreaker from="#FFA940" to="#3DBD6B" id="plan-where" />

      {/* ===== 5. WHERE IT GOES ===== */}
      <section className="inv-sec inv-where">
        <div className="inv-sec-bg">
          <span className="inv-mesh inv-mesh-soft inv-mesh-tr" />
          <span className="inv-mesh inv-mesh-soft inv-mesh-bl" />
          <span className="inv-shape inv-shape-d" />
        </div>
        <div className="wrap">
          <Reveal as="div" className="inv-secnum">Where it goes</Reveal>
          <Reveal as="h2" className="inv-sec-h" delay={60}>
            What <span className="grad-text">$500,000</span> funds.
          </Reveal>

          {/* 50/50 split bar */}
          <Reveal className="inv-split-wrap">
            <div className="inv-split">
              <AnimatedBar targetPct={50} axis="width" className="inv-split-left" />
              <AnimatedBar targetPct={50} axis="width" className="inv-split-right" delay={120} />
            </div>
            <div className="inv-split-labels">
              <div className="inv-split-lbl"><span className="inv-split-sw inv-split-sw-blue" />50% Product</div>
              <div className="inv-split-lbl"><span className="inv-split-sw inv-split-sw-mint" />50% Go-to-market</div>
            </div>
          </Reveal>

          {/* Two cards */}
          <div className="inv-where-grid">
            <Reveal className="inv-where-card inv-where-blue">
              <div className="inv-where-pct">50%</div>
              <div className="inv-where-t">Product</div>
              <p>PMS integrations (Dentrix, Cloud 9). Onboarding. Analytics.</p>
            </Reveal>
            <Reveal className="inv-where-card inv-where-mint" delay={120}>
              <div className="inv-where-pct">50%</div>
              <div className="inv-where-t">Go-to-market</div>
              <p>First paid push. Conference presence. East Coast expansion.</p>
            </Reveal>
          </div>

          {/* Year 1 checklist */}
          <Reveal className="inv-targets-wrap" delay={120}>
            <div className="inv-targets-h">Year 1 targets.</div>
            <ul className="inv-targets">
              {[
                "170 specialists onboarded",
                "$610K ARR by Q4 2026",
                "Two PMS integrations live",
                "Breakeven trajectory by month 18",
              ].map((item, i) => (
                <li key={item} className="inv-target" style={{ transitionDelay: `${i * 100}ms` }}>
                  <span className="inv-target-check" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <SectionBreaker from="#3DBD6B" to="#3E8EFF" id="where-contact" />

      {/* ===== 6. CONTACT ===== */}
      <section className="inv-sec inv-contact">
        <div className="inv-sec-bg">
          <span className="inv-mesh inv-mesh-soft inv-mesh-tl" />
          <span className="inv-mesh inv-mesh-soft inv-mesh-br" />
          <Image
            src="/logo-mark.svg"
            alt=""
            width={400}
            height={400}
            className="inv-contact-mark"
            aria-hidden="true"
          />
        </div>
        <div className="wrap">
          <Reveal as="div" className="inv-secnum">Contact</Reveal>
          <Reveal as="h2" className="inv-sec-h" delay={60}>
            <span className="grad-text">Nicholas Campbell.</span>
          </Reveal>
          <Reveal className="inv-contact-card" delay={120}>
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
          </Reveal>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
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
