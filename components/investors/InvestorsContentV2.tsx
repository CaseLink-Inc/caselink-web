"use client";

/* ============================================================
   INVESTOR BRIEF — v2 DRAFT
   Rebuilt against advisor feedback (June 2026). Section order:
   01 Hero (value-prop) · 02 Problem · 03 What we built · 04 Today
   05 Trajectory (+assumptions) · 06 Round + use of funds
   07 Why Nick · 08 Talk to Nick
   Reuses the live .inv-* CSS read-only and adds .invv2-* for the
   new pieces, so /investors is never affected. Helper components
   are copied (not imported) so this file can be deleted cleanly.
   ============================================================ */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import BookCallButton from "@/components/BookCallButton";
import ReferralJourney from "@/components/investors/ReferralJourney";

const DECK_HREF = "/caselink-deck-0a5e6b362c.pdf";

/* ===== COUNTER =====
   Renders the real value at all times. No count-up animation: an investor
   brief gets screenshotted, PDF'd, and printed, and a counter that animates
   up from zero shows "$0,000" / "0%" in every static capture (that was the
   advisor's "broken placeholder" finding). Real numbers always win here. */
function Counter({ to, decimals = 0, separator = false, suffix = "", prefix = "" }: { to: number; decimals?: number; separator?: boolean; suffix?: string; prefix?: string }) {
  const formatted = separator ? Math.round(to).toLocaleString() : to.toFixed(decimals);
  return <span>{prefix}{formatted}{suffix}</span>;
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

/* ===== DRAFT NOTE =====
   Deliberately loud, dashed amber box. Marks content Nick still needs
   to supply or verify. Impossible to mistake for finished copy. Strip
   every one of these before the URL goes out. */
function DraftNote({ label = "Draft — needs your content", children }: { label?: string; children: React.ReactNode }) {
  return (
    <div className="invv2-todo" role="note">
      <span className="invv2-todo-tag" aria-hidden="true" />
      <div className="invv2-todo-inner">
        <span className="invv2-todo-label">{label}</span>
        <div className="invv2-todo-body">{children}</div>
      </div>
    </div>
  );
}

const arrow = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
);

export default function InvestorsContentV2() {
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

      {/* ===== 01. HERO (value-prop led) ===== */}
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
            The referral network
            <br />
            for dentists.
          </Reveal>
          <Reveal as="p" className="inv-hero-lede" delay={160}>
            CaseLink connects general dentists to specialists in one click,
            replacing fax referrals across the DMV.
          </Reveal>
          <Reveal as="div" className="invv2-hero-proof" delay={200}>
            <span>12 practices live</span>
            <i aria-hidden="true">·</i>
            <span>V1 shipped Dec 2025</span>
            <i aria-hidden="true">·</i>
            <span>$500K pre-seed open at $4M cap</span>
          </Reveal>
          <Reveal as="div" className="inv-hero-cta" delay={240}>
            <BookCallButton className="btn inv-cta inv-cta-lg">
              Talk to Nick
              {arrow}
            </BookCallButton>
            <a href={DECK_HREF} target="_blank" rel="noopener noreferrer" className="btn inv-cta-ghost inv-cta-lg">
              View the deck
            </a>
          </Reveal>
        </div>
      </section>

      {/* ===== 02. THE PROBLEM ===== */}
      <section className="inv-sec inv-problem">
        <div className="wrap">
          <Panel className="invv2-panel-prose">
            <header className="inv-panel-head">
              <span className="inv-panel-num">02</span>
              <h2 className="inv-panel-title">The problem</h2>
              <span className="inv-panel-status-meta">Why now</span>
            </header>
            <div className="inv-panel-body">
              <p className="invv2-prose-lead">Dental referrals still run on fax machines.</p>
              <ul className="invv2-problem-list">
                <li>General dentists lose a meaningful share of referred cases to drop-off, miscommunication, and scheduling friction.</li>
                <li>Specialists have no visibility into incoming pipeline or who is referring to them.</li>
                <li>Patients are caught in the middle, often re-explaining their case two or three times.</li>
              </ul>
              <p className="invv2-prose-close">
                CaseLink is a single shared workspace for the referral, the case
                file, and the patient handoff.
              </p>
              <DraftNote label="Verify before sending">
                The first bullet originally cited a specific loss rate (your
                advisor used roughly 30 percent). Replace with a sourced figure
                or a real pilot number, then state it plainly. Until then it
                reads as &ldquo;a meaningful share&rdquo; so we are not publishing an
                unverifiable stat.
              </DraftNote>
            </div>
          </Panel>
        </div>
      </section>

      {/* ===== 03. WHAT WE BUILT ===== */}
      <section className="inv-sec inv-built">
        <div className="inv-sec-mesh inv-sec-mesh-today" aria-hidden="true" />
        <div className="wrap">
          <Panel className="invv2-panel-prose">
            <header className="inv-panel-head">
              <span className="inv-panel-num">03</span>
              <h2 className="inv-panel-title">What we built</h2>
              <span className="inv-panel-status inv-panel-status-live">
                <span className="inv-panel-status-dot" />
                V1 live
              </span>
            </header>
            <div className="inv-panel-body">
              <p className="invv2-prose-lead">
                V1 shipped in December 2025 and is in daily use across the pilot
                network.
              </p>
              <ul className="invv2-feature-list">
                <li>
                  <strong>One-click referrals.</strong> A GP sends a specialist the
                  full case in one step, with clinical notes and images attached.
                </li>
                <li>
                  <strong>Shared case workspace.</strong> Referrer and specialist
                  see the same file, status, and history. No more lost faxes.
                </li>
                <li>
                  <strong>HIPAA-compliant by design.</strong> Encrypted messaging
                  and patient handoff, with a BAA in place.
                </li>
              </ul>
              <DraftNote label="Add product proof">
                Drop in one hero screenshot of the live app or a 60-second Loom
                here. &ldquo;V1 shipped&rdquo; is a claim until an investor can see it.
                (Demo build in progress per Nick.)
              </DraftNote>
            </div>
          </Panel>
        </div>
      </section>

      {/* ===== 04. TODAY ===== */}
      <section className="inv-sec inv-today">
        <div className="inv-sec-mesh inv-sec-mesh-today" aria-hidden="true" />
        <div className="wrap">
          <Panel className="inv-panel-today">
            <header className="inv-panel-head">
              <span className="inv-panel-num">04</span>
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

            <div className="invv2-proof-row">
              <DraftNote label="Add pilot texture">
                Name the mix of the 12 pilots, anonymized is fine. Example:
                &ldquo;3 endodontic groups, 4 oral surgery, 5 general dentists across
                Fairfax, Arlington, and Montgomery.&rdquo; Specificity converts.
              </DraftNote>
              <DraftNote label="Testimonial — pending">
                Pull-quote from a pilot here once we have it. Targeting the
                Casagrande quote. Format: one sentence plus name, role, practice.
              </DraftNote>
            </div>

            <footer className="inv-panel-foot">
              Pre-revenue today. Paid conversion begins Q3 2026.
            </footer>
          </Panel>
        </div>
      </section>

      {/* ===== 05. TRAJECTORY (+ assumptions) ===== */}
      <section className="inv-sec inv-plan">
        <div className="wrap">
          <Panel className="inv-panel-plan">
            <header className="inv-panel-head">
              <span className="inv-panel-num">05</span>
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

            <div className="invv2-assume">
              <div className="invv2-assume-head">
                <span className="invv2-assume-head-lbl">Key assumptions</span>
                <span className="invv2-assume-head-meta">What the model rests on</span>
              </div>
              <ul className="invv2-assume-list">
                <li>
                  <span className="invv2-assume-k">GP : specialist ratio</span>
                  <strong className="invv2-assume-v">2 : 1</strong>
                  <em className="invv2-assume-note">Implied by the Year-1 targets (340 GPs to 170 specialists).</em>
                </li>
                <li>
                  <span className="invv2-assume-k">Specialist price</span>
                  <strong className="invv2-assume-v">$299 / mo</strong>
                  <em className="invv2-assume-note">Matches the published plan on caselink.net.</em>
                </li>
                <li>
                  <span className="invv2-assume-k">Implied CAC</span>
                  <strong className="invv2-assume-v">~$1,470</strong>
                  <em className="invv2-assume-note">$250K go-to-market divided across 170 specialists.</em>
                </li>
                <li>
                  <span className="invv2-assume-k">Paid conversion</span>
                  <strong className="invv2-assume-v">TBD</strong>
                  <em className="invv2-assume-note">Share of pilot specialists expected to convert in Q3 2026.</em>
                </li>
              </ul>
              <DraftNote label="Needs Nick's numbers">
                Confirm four things so the trajectory reads as grounded, not
                wishful: (1) expected paid-conversion rate of pilot specialists
                and the signal behind it, (2) the sales model (founder-led vs
                inside sales), (3) CAC payback period, (4) why gross margin
                climbs from 70 to 78 percent over two years.
              </DraftNote>
            </div>
          </Panel>
        </div>
      </section>

      {/* ===== 06. THE ROUND + USE OF FUNDS (merged) ===== */}
      <section className="inv-sec inv-round">
        <div className="wrap">
          <Panel className="inv-panel-round">
            <header className="inv-panel-head">
              <span className="inv-panel-num">06</span>
              <h2 className="inv-panel-title">The round and use of funds</h2>
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
                  <div className="inv-round-tile-lbl">Raise</div>
                  <div className="inv-round-tile-val">
                    $<Counter to={500} separator />K
                  </div>
                  <div className="inv-round-tile-foot">Pre-seed · SAFE</div>
                </div>
              </div>
            </div>

            <div className="invv2-fund">
              <div className="invv2-fund-head">
                <span className="invv2-fund-head-lbl">Use of funds</span>
                <span className="invv2-fund-head-meta">$500K · 12 months</span>
              </div>
              <div className="inv-where-body">
                <div className="inv-flow-viz">
                  <div className="inv-flow-source">
                    <div className="inv-flow-source-lbl">Investment</div>
                    <div className="inv-flow-source-amt">$500K</div>
                    <div className="inv-flow-source-foot">12-month deployment</div>
                  </div>
                  <svg className="inv-flow-lines" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
                    <defs>
                      <linearGradient id="invv2FlowBlue" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#3E8EFF" stopOpacity="0.85" /><stop offset="100%" stopColor="#3E8EFF" stopOpacity="0.40" /></linearGradient>
                      <linearGradient id="invv2FlowMint" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#5CD68B" stopOpacity="0.85" /><stop offset="100%" stopColor="#90F0C5" stopOpacity="0.40" /></linearGradient>
                    </defs>
                    <path d="M 0 100 C 80 100, 120 30, 200 30" fill="none" stroke="url(#invv2FlowBlue)" strokeWidth="1.5" strokeDasharray="3 4" strokeLinecap="round" />
                    <path d="M 0 100 C 80 100, 120 170, 200 170" fill="none" stroke="url(#invv2FlowMint)" strokeWidth="1.5" strokeDasharray="3 4" strokeLinecap="round" />
                    <circle r="3" fill="#3E8EFF">
                      <animateMotion path="M 0 100 C 80 100, 120 30, 200 30" dur="3s" repeatCount="indefinite" />
                    </circle>
                    <circle r="3" fill="#5CD68B">
                      <animateMotion path="M 0 100 C 80 100, 120 170, 200 170" dur="3s" begin="0.6s" repeatCount="indefinite" />
                    </circle>
                    <circle r="2.5" fill="#3E8EFF" opacity="0.6">
                      <animateMotion path="M 0 100 C 80 100, 120 30, 200 30" dur="3s" begin="1.2s" repeatCount="indefinite" />
                    </circle>
                    <circle r="2.5" fill="#5CD68B" opacity="0.6">
                      <animateMotion path="M 0 100 C 80 100, 120 170, 200 170" dur="3s" begin="1.8s" repeatCount="indefinite" />
                    </circle>
                  </svg>
                  <div className="inv-flow-dests">
                    <div className="inv-flow-dest inv-flow-dest-blue">
                      <div className="inv-flow-dest-pct">50%</div>
                      <div className="inv-flow-dest-t">Product</div>
                      <div className="inv-flow-dest-amt">$250K</div>
                      <p>PMS integrations with Dentrix and Cloud 9, the two largest practice-management systems. Onboarding and analytics.</p>
                    </div>
                    <div className="inv-flow-dest inv-flow-dest-mint">
                      <div className="inv-flow-dest-pct">50%</div>
                      <div className="inv-flow-dest-t">Go-to-market</div>
                      <div className="inv-flow-dest-amt">$250K</div>
                      <p>First paid push, founder-led. Specialty conference presence. East Coast expansion beyond the DMV.</p>
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

      {/* ===== 06b. MARKET ===== */}
      <section className="inv-sec inv-market">
        <div className="inv-sec-mesh inv-sec-mesh-where" aria-hidden="true" />
        <div className="wrap">
          <Panel className="invv2-panel-prose">
            <header className="inv-panel-head">
              <span className="inv-panel-num">—</span>
              <h2 className="inv-panel-title">Market</h2>
              <span className="inv-panel-status-meta">Beachhead to national</span>
            </header>
            <div className="inv-panel-body">
              <div className="invv2-market-grid">
                <div className="invv2-market-cell">
                  <div className="invv2-market-n">~155K</div>
                  <div className="invv2-market-lbl">US dental practices</div>
                  <div className="invv2-market-foot">GPs and specialists</div>
                </div>
                <div className="invv2-market-cell">
                  <div className="invv2-market-n">~30K</div>
                  <div className="invv2-market-lbl">Specialist practices</div>
                  <div className="invv2-market-foot">The paying side</div>
                </div>
                <div className="invv2-market-cell invv2-market-cell-accent">
                  <div className="invv2-market-n">~$108M</div>
                  <div className="invv2-market-lbl">ARR ceiling</div>
                  <div className="invv2-market-foot">30K specialists at $299/mo</div>
                </div>
              </div>
              <p className="invv2-prose-close">
                DMV suburban is the beachhead. The playbook runs East Coast, then
                national, on the same GP-led network effect.
              </p>
              <DraftNote label="Sanity-check the figures">
                The 155K and 30K counts are your advisor&rsquo;s estimates. The
                $108M ceiling is 30,000 specialists times $299 per month times 12.
                Confirm the practice counts against a real source (ADA data) and
                we can label this &ldquo;top-down estimate&rdquo; with a citation.
              </DraftNote>
            </div>
          </Panel>
        </div>
      </section>

      {/* ===== 07. WHY NICK ===== */}
      <section className="inv-sec inv-why">
        <div className="wrap">
          <Panel className="invv2-panel-why">
            <header className="inv-panel-head">
              <span className="inv-panel-num">07</span>
              <h2 className="inv-panel-title">Why Nick</h2>
              <span className="inv-panel-status-meta">Founder and CEO</span>
            </header>
            <div className="inv-panel-body invv2-why-body">
              <Reveal className="inv-contact-portrait-wrap invv2-why-portrait">
                <div className="inv-contact-orbit-1" aria-hidden="true" />
                <div className="inv-contact-orbit-2" aria-hidden="true" />
                <div className="inv-contact-portrait">
                  <Image src="/portrait.png" alt="Nicholas Campbell" width={555} height={800} />
                </div>
              </Reveal>
              <div className="invv2-why-text">
                <h3 className="invv2-why-name">Nick Campbell</h3>
                <div className="invv2-why-role">Co-Founder and CEO · Washington, DC</div>
                <DraftNote label="Founder bio — needs Nick">
                  Two sentences: background, why dentistry, why now. Then one
                  credibility line (prior startup, dental-industry experience, or
                  technical background). Investors buy the founder at pre-seed, so
                  this cannot stay a placeholder.
                </DraftNote>
                <div className="invv2-why-links">
                  <a className="invv2-why-link" href="#" aria-disabled="true">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14zM8.34 17V10.5H6.2V17h2.14zM7.27 9.43a1.24 1.24 0 1 0 0-2.48 1.24 1.24 0 0 0 0 2.48zM18 17v-3.57c0-1.91-1.02-2.8-2.38-2.8-1.1 0-1.59.6-1.86 1.03v-.88h-2.14c.03.6 0 6.2 0 6.2h2.14v-3.46c0-.19.01-.38.07-.52.15-.38.5-.78 1.09-.78.77 0 1.08.59 1.08 1.45V17H18z" /></svg>
                    LinkedIn
                    <span className="invv2-why-link-todo">add URL</span>
                  </a>
                </div>
                <p className="invv2-why-foot">Nick handles every investor conversation directly.</p>
              </div>
            </div>
          </Panel>
        </div>
      </section>

      {/* ===== 08. TALK TO NICK ===== */}
      <section className="inv-sec inv-contact">
        <div className="inv-sec-mesh inv-sec-mesh-contact" aria-hidden="true" />
        <div className="wrap">
          <Panel className="inv-panel-contact invv2-panel-cta">
            <header className="inv-panel-head">
              <span className="inv-panel-num">08</span>
              <h2 className="inv-panel-title">Talk to Nick</h2>
              <span className="inv-panel-status">
                <span className="inv-panel-status-dot" />
                Open
              </span>
            </header>
            <div className="inv-panel-body invv2-cta-body">
              <p className="inv-contact-lede">
                Pick the way you want to start. Every path reaches Nick directly.
              </p>
              <div className="inv-contact-grid invv2-cta-grid">
                <BookCallButton className="inv-contact-btn inv-contact-btn-primary">
                  <span className="inv-contact-btn-ic">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 9h18M8 3v4M16 3v4" /></svg>
                  </span>
                  <span className="inv-contact-btn-t">Book a call</span>
                  <span className="inv-contact-btn-s">15 min walkthrough</span>
                </BookCallButton>
                <a className="inv-contact-btn" href={DECK_HREF} target="_blank" rel="noopener noreferrer">
                  <span className="inv-contact-btn-ic">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" /><path d="M9 13h6M9 17h4" /></svg>
                  </span>
                  <span className="inv-contact-btn-t">Pitch deck</span>
                  <span className="inv-contact-btn-s">PDF, 15 MB</span>
                </a>
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
              </div>
              <div className="inv-contact-direct invv2-cta-direct">
                <a href="mailto:nick@caselink.net">nick@caselink.net</a>
                <span className="inv-contact-direct-sep" />
                <a href="tel:+17035543449">(703) 554-3449</a>
              </div>
              <div className="invv2-updated">
                <span className="invv2-updated-dot" />
                Updated June 2, 2026 · 12 practices live, V1 shipped, paid conversion conversations active
              </div>
            </div>
          </Panel>
        </div>
      </section>

      {/* FOOTER (Confidential label removed per advisor) */}
      <footer className="inv-footer">
        <div className="wrap">
          <p>
            CaseLink Inc. Delaware C-Corp. Incorporated June 27, 2025. File #10242704.
            Forecasts are estimates. SAFE on standard YC terms at a $4M cap, 20% discount.
          </p>
        </div>
      </footer>
    </div>
  );
}
