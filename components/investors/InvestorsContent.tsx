"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowRight } from "@/components/icons";
import BookCallButton from "@/components/BookCallButton";

/* ===============================================================
   COUNTER — counts up from 0 to target on scroll-into-view.
   Runs once. easeOutCubic. respects prefers-reduced-motion.
   =============================================================== */
type CounterProps = {
  to: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
};

function Counter({ to, prefix = "", suffix = "", decimals = 0, duration = 1600, className }: CounterProps) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const fired = useRef(false);
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
          if (!e.isIntersecting || fired.current) return;
          fired.current = true;
          const start = performance.now();
          const step = (now: number) => {
            const t = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - t, 3);
            setVal(to * eased);
            if (t < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        });
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [to, duration]);
  return (
    <span ref={ref} className={className}>
      {prefix}
      {val.toFixed(decimals)}
      {suffix}
    </span>
  );
}

/* ===============================================================
   SIDE NAV — sticky scroll-spy list of sections on the left.
   Hidden under 1100px (the brief is dense, mobile uses the
   normal page scroll).
   =============================================================== */
const NAV_ITEMS: { id: string; label: string; n?: string }[] = [
  { id: "top", label: "Top" },
  { id: "glance", n: "01", label: "At a glance" },
  { id: "problem", n: "02", label: "Problem" },
  { id: "math", n: "03", label: "Math" },
  { id: "shift", n: "04", label: "Shift" },
  { id: "product", n: "05", label: "Product" },
  { id: "market", n: "06", label: "Market" },
  { id: "traction", n: "07", label: "Traction" },
  { id: "financials", n: "08", label: "Financials" },
  { id: "ask", n: "09", label: "The ask" },
  { id: "team", n: "10", label: "Team" },
  { id: "contact", label: "Contact" },
];

function SideNav() {
  const [active, setActive] = useState("top");
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    NAV_ITEMS.forEach((item) => {
      const el = document.getElementById(item.id);
      if (!el) return;
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) setActive(item.id);
          });
        },
        { rootMargin: "-30% 0px -55% 0px", threshold: 0 }
      );
      io.observe(el);
      observers.push(io);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);
  return (
    <nav className="inv-sidenav" aria-label="Section navigation">
      <ul>
        {NAV_ITEMS.map((item) => (
          <li key={item.id}>
            <a href={`#${item.id}`} className={active === item.id ? "active" : ""}>
              <span className="inv-sidenav-dot" aria-hidden="true" />
              {item.n && <span className="inv-sidenav-n">{item.n}</span>}
              <span className="inv-sidenav-lbl">{item.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/* ===============================================================
   ANIMATED BAR — grows from 0 to targetPct on scroll-into-view.
   axis="height" (default) for vertical bars, "width" for horizontal
   progress bars.
   =============================================================== */
function AnimatedBar({
  targetPct,
  className,
  axis = "height",
}: {
  targetPct: number;
  className?: string;
  axis?: "height" | "width";
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
          if (e.isIntersecting) setTimeout(() => setVal(targetPct), 80);
        });
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [targetPct]);
  const style = axis === "width" ? { width: `${val}%` } : { height: `${val}%` };
  return <div ref={ref} className={className} style={style} />;
}

/* ===============================================================
   REVEAL — small wrapper that adds the existing site .reveal
   class so the page picks up the RevealInit observer for fade-in.
   =============================================================== */
function Reveal({ as: Tag = "div", className = "", children, delay }: { as?: any; className?: string; children: React.ReactNode; delay?: number }) {
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
   PILLAR ICONS — cleaner, brand-consistent SVGs (24x24, stroke
   1.8, round caps). Built inline so no extra file imports.
   =============================================================== */
const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 21s7-3.5 7-9V5l-7-2.5L5 5v7c0 5.5 7 9 7 9z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);
const IconNetwork = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="2.5" />
    <circle cx="5" cy="6" r="2" />
    <circle cx="19" cy="6" r="2" />
    <circle cx="5" cy="18" r="2" />
    <circle cx="19" cy="18" r="2" />
    <path d="M7 7l3 3M17 7l-3 3M7 17l3-3M17 17l-3-3" />
  </svg>
);
const IconDashboard = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="8" height="8" rx="1.5" />
    <rect x="13" y="3" width="8" height="5" rx="1.5" />
    <rect x="13" y="10" width="8" height="11" rx="1.5" />
    <rect x="3" y="13" width="8" height="8" rx="1.5" />
  </svg>
);
const IconZap = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />
  </svg>
);

/* ===============================================================
   PAGE
   =============================================================== */
export default function InvestorsContent() {
  // Mark the body so we can hide the light marketing Nav + Footer
  // on this dark pitch-deck route without affecting the rest of the site.
  useEffect(() => {
    document.body.dataset.invPage = "true";
    return () => {
      delete document.body.dataset.invPage;
    };
  }, []);

  return (
    <div className="inv-page">
      <SideNav />

      {/* ============ HERO ============ */}
      <section className="inv-hero" id="top">
        <div className="inv-hero-bg">
          <span className="inv-mesh inv-mesh-1" />
          <span className="inv-mesh inv-mesh-2" />
          <span className="inv-mesh inv-mesh-3" />
          <span className="inv-mesh inv-mesh-4" />
          <div className="inv-hero-grid" />
        </div>
        <div className="wrap inv-hero-inner">
          <div className="inv-hero-text">
            <span className="inv-hero-bracket inv-hero-bracket-tl" aria-hidden="true" />
            <span className="inv-hero-bracket inv-hero-bracket-tr" aria-hidden="true" />
            <span className="inv-hero-bracket inv-hero-bracket-bl" aria-hidden="true" />
            <span className="inv-hero-bracket inv-hero-bracket-br" aria-hidden="true" />
            <div className="inv-hero-logo">
              <span className="inv-hero-logo-mark" aria-hidden="true" />
              <span className="inv-hero-logo-wm">CaseLink</span>
            </div>
            <span className="inv-tag">
              <span className="inv-tag-dot" />
              Investor brief · Pre-seed · May 2026
            </span>
            <h1>
              The referral layer<br />
              <span className="grad-text">dentistry is missing.</span>
            </h1>
            <p className="inv-lede">
              A HIPAA-compliant collaboration platform that captures the 30%
              of dental referrals that quietly disappear today. Twelve
              practices live in the DMV. V1 shipped. Pre-seed open.
            </p>
            <div className="inv-hero-actions">
              <a className="btn btn-primary" href="#ask">
                See the ask
                <ArrowRight width={14} height={14} />
              </a>
              <BookCallButton className="btn btn-ghost">
                Talk to Nick
              </BookCallButton>
            </div>
          </div>

          <aside className="inv-ask-card">
            <div className="inv-ask-glow" aria-hidden="true" />
            <div className="inv-ask-head">
              <span className="inv-ask-tag">The Round</span>
              <span className="inv-ask-status">
                <span className="inv-ask-dot" />
                Open
              </span>
            </div>
            <div className="inv-ask-amount">
              <Counter to={500} prefix="$" suffix="K" />
              <span className="sub">pre-seed SAFE</span>
            </div>
            <p className="inv-ask-sub">
              Raising on standard YC terms. Currently being filled with
              strategic investors and clinical partners.
            </p>
            <div className="inv-ask-terms">
              <div className="inv-term-row"><span className="lbl">Cap</span><span className="val">$4M post</span></div>
              <div className="inv-term-row"><span className="lbl">Discount</span><span className="val">20%</span></div>
              <div className="inv-term-row"><span className="lbl">Equity at cap</span><span className="val">~20%</span></div>
              <div className="inv-term-row"><span className="lbl">Year 3 ARR</span><span className="val grad-text">$2.4M</span></div>
            </div>
          </aside>
        </div>

        <div className="wrap inv-marquee-wrap">
          <div className="inv-marquee">
            <div className="inv-marquee-track">
              {[
                ["12 practices live", "across the DMV"],
                ["V1 platform shipped", "December 2025"],
                ["Pre-seed SAFE", "open at $4M cap"],
                ["50+ warm leads", "in the DC pipeline"],
                ["$610K ARR", "projected by Q4"],
                ["HIPAA + SOC 2", "via Blaze infrastructure"],
                ["12 practices live", "across the DMV"],
                ["V1 platform shipped", "December 2025"],
                ["Pre-seed SAFE", "open at $4M cap"],
                ["50+ warm leads", "in the DC pipeline"],
                ["$610K ARR", "projected by Q4"],
                ["HIPAA + SOC 2", "via Blaze infrastructure"],
              ].map(([bold, rest], i) => (
                <span key={i} className="inv-marquee-item">
                  <span className="inv-marquee-dot" />
                  <strong>{bold}</strong> {rest}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ 01 / AT A GLANCE ============ */}
      <section className="inv-sec inv-glance" id="glance">
        <div className="wrap">
          <div className="inv-secnum">01 / At a glance</div>
          <Reveal as="h2" className="inv-sec-h">Four numbers, the whole picture.</Reveal>
          <Reveal as="p" className="inv-sec-lede">
            The opportunity, the size, the trajectory, the ask. Everything
            else in this brief expands on these.
          </Reveal>

          <div className="inv-tldr-grid">
            <Reveal className="inv-tldr-cell inv-tint-warm">
              <div className="inv-tldr-lbl">The problem</div>
              <div className="inv-tldr-val grad-warm">
                <Counter to={30} suffix="" />
                <span className="u">%</span>
              </div>
              <p className="inv-tldr-sub">
                of dental referrals fail today, lost between paper, phone,
                and unsecured email
              </p>
            </Reveal>
            <Reveal className="inv-tldr-cell inv-tint-mint" delay={100}>
              <div className="inv-tldr-lbl">The opportunity</div>
              <div className="inv-tldr-val grad-text">
                $<Counter to={1.8} decimals={1} />
                <span className="u">M</span>
              </div>
              <p className="inv-tldr-sub">
                in recoverable revenue per ten-GP network, every single year
              </p>
            </Reveal>
            <Reveal className="inv-tldr-cell inv-tint-blue" delay={200}>
              <div className="inv-tldr-lbl">The trajectory</div>
              <div className="inv-tldr-val grad-text">
                $<Counter to={2.4} decimals={1} />
                <span className="u">M</span>
              </div>
              <p className="inv-tldr-sub">
                projected ARR by Year 3, bottom-up plan, conservative
                assumptions
              </p>
            </Reveal>
            <Reveal className="inv-tldr-cell inv-tint-ink" delay={300}>
              <div className="inv-tldr-lbl">The ask</div>
              <div className="inv-tldr-val">
                $<Counter to={500} />
                <span className="u">K</span>
              </div>
              <p className="inv-tldr-sub">
                pre-seed SAFE at a $4M cap with 20% discount, currently being
                filled
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ 02 / THE PROBLEM ============ */}
      <section className="inv-sec inv-prob" id="problem">
        <div className="wrap">
          <div className="inv-secnum">02 / The problem</div>
          <Reveal as="h2" className="inv-sec-h">
            Dental referrals fail <span className="grad-warm">silently every day.</span>
          </Reveal>
          <Reveal as="p" className="inv-sec-lede">
            Every dental practice in the country runs the same broken loop.
            A GP writes a slip. The patient leaves with it in hand.
            Somewhere between that office and the specialist, a third of
            the time, the case quietly disappears.
          </Reveal>

          <Reveal className="inv-prob-big">
            <div className="num">
              <Counter to={30} suffix="%" />
            </div>
            <p className="cap">
              of all dental referrals never reach treatment. No tracking. No
              follow-up. No way for the GP to know what happened to their
              patient.
            </p>
          </Reveal>

          <div className="inv-prob-grid">
            {[
              { n: "01", h: "Paper and email workflows", p: "The dominant referral channel in 2026 is still a printed slip and a phone call. No audit trail. No tracking. No closed loop." },
              { n: "02", h: "Admin overload", p: "Front-desk staff spend hours every week on referral follow-up calls. Time and payroll wasted on work software should be doing." },
              { n: "03", h: "HIPAA exposure", p: "Every record sent over unsecured email or text raises the practice's compliance risk. Practices know it. They have no better channel." },
              { n: "04", h: "Outcome blindness", p: "Most GPs never learn whether their patient was treated. The relationship with the specialist deteriorates. The cycle compounds." },
            ].map((b, i) => (
              <Reveal key={b.n} className="inv-prob-bullet" delay={i * 80}>
                <div className="inv-prob-no">{b.n}</div>
                <h4>{b.h}</h4>
                <p>{b.p}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 03 / THE MATH ============ */}
      <section className="inv-sec inv-math" id="math">
        <div className="wrap">
          <div className="inv-secnum">03 / The math</div>
          <Reveal as="h2" className="inv-sec-h">
            Every practice is leaking <span className="grad-warm">$180,000 a year.</span>
          </Reveal>
          <Reveal as="p" className="inv-sec-lede">
            The revenue is already earned. It is simply never captured. Run
            the same numbers across a connected network of GPs and the
            figure clears $1.8 million annually.
          </Reveal>

          <Reveal className="inv-eq">
            <div className="inv-eq-row">
              <div className="inv-tile">
                <div className="v"><Counter to={20} /><span className="u">/mo</span></div>
                <div className="l">Specialty referrals from one GP</div>
              </div>
              <div className="inv-op">×</div>
              <div className="inv-tile">
                <div className="v">$<Counter to={2.5} decimals={1} />K</div>
                <div className="l">Average case revenue</div>
              </div>
              <div className="inv-op">×</div>
              <div className="inv-tile">
                <div className="v"><Counter to={30} /><span className="u">%</span></div>
                <div className="l">That fall through today</div>
              </div>
              <div className="inv-op">=</div>
              <div className="inv-tile inv-tile-final">
                <div className="v">$<Counter to={180} />K+</div>
                <div className="l">Lost per practice per year</div>
              </div>
            </div>
            <p className="inv-eq-note">
              Multiply by a referral network of ten general dentists and the
              recoverable annual revenue clears <strong>$1.8 million</strong>.
              These dollars are already earned. CaseLink simply captures
              them.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ============ 04 / THE SHIFT ============ */}
      <section className="inv-sec inv-shift" id="shift">
        <div className="wrap">
          <div className="inv-secnum">04 / The shift</div>
          <Reveal as="h2" className="inv-sec-h">Twenty referrals. Twice the throughput.</Reveal>
          <Reveal as="p" className="inv-sec-lede">
            Same patient volume. Same specialists. The only difference is a
            connected, audited, closed-loop layer between the two offices.
          </Reveal>

          <div className="inv-ba-grid">
            <Reveal className="inv-ba-card inv-ba-before">
              <div className="inv-ba-label">Before CaseLink</div>
              <div className="inv-ba-title">Paper, phone tag, hope.</div>
              <div className="inv-ba-funnel">
                <div className="inv-ba-row"><strong>20</strong>Referrals sent</div>
                <div className="inv-ba-row inv-ba-row-bad"><strong>12</strong>Reach the specialist and complete</div>
              </div>
              <div className="inv-ba-money"><span>Monthly revenue realised</span><strong>$30K</strong></div>
            </Reveal>
            <Reveal className="inv-ba-card inv-ba-after" delay={120}>
              <div className="inv-ba-label">With CaseLink</div>
              <div className="inv-ba-title">Connected. Tracked. Closed-loop.</div>
              <div className="inv-ba-funnel">
                <div className="inv-ba-row"><strong>20</strong>Referrals sent</div>
                <div className="inv-ba-row inv-ba-row-good"><strong>18</strong>Reach the specialist and complete</div>
              </div>
              <div className="inv-ba-money"><span>Monthly revenue realised</span><strong>$45K</strong></div>
            </Reveal>
          </div>

          <Reveal className="inv-lift">
            <div className="inv-lift-v">+$<Counter to={180} />K</div>
            <p className="inv-lift-l">
              Annual revenue lift from <strong>a single provider.</strong>{" "}
              Multiplied across a ten-GP network, recovered revenue exceeds{" "}
              <strong>$1.8 million per year.</strong>
            </p>
          </Reveal>
        </div>
      </section>

      {/* ============ 05 / THE PRODUCT ============ */}
      <section className="inv-sec inv-product" id="product">
        <div className="wrap">
          <div className="inv-secnum">05 / The product</div>
          <Reveal as="h2" className="inv-sec-h">
            An operating system for <span className="grad-text">dental collaboration.</span>
          </Reveal>
          <Reveal as="p" className="inv-sec-lede">
            CaseLink does not replace practice management software. It
            connects the practices that already use one. Less to learn.
            More to gain.
          </Reveal>

          <div className="inv-pillar-grid">
            {[
              { n: "01", I: IconShield, h: "HIPAA-compliant messaging", p: "Encrypted in transit and at rest. BAA on file with every practice. Audit logged on every action.", out: "Faster communication, revenue sooner", tone: "blue" },
              { n: "02", I: IconNetwork, h: "Connected referral network", p: "GPs and specialists in one network. Discover and invite practices. The more it grows, the more valuable it becomes.", out: "Compounding network effect", tone: "mint" },
              { n: "03", I: IconDashboard, h: "One centralised view", p: "Every active case. Every status. Every outcome. The whole referral pipeline visible to the practice in real time.", out: "Track without chasing", tone: "peach" },
              { n: "04", I: IconZap, h: "Built for fast adoption", p: "Live in a practice in an afternoon. No retraining. No PMS migration. Free for GPs to remove every adoption barrier.", out: "Lower admin, faster adoption", tone: "warm" },
            ].map((pillar, i) => (
              <Reveal key={pillar.n} className={`inv-pillar inv-pillar-${pillar.tone}`} delay={i * 80}>
                <div className="inv-pillar-no">{pillar.n}</div>
                <div className="inv-pillar-ic">
                  <pillar.I />
                </div>
                <h4>{pillar.h}</h4>
                <p>{pillar.p}</p>
                <div className="inv-pillar-out">› {pillar.out}</div>
              </Reveal>
            ))}
          </div>

          <Reveal className="inv-tech-band">
            <div className="inv-tech-l">
              <div className="inv-tech-ic">
                <IconShield />
              </div>
              <div>
                <div className="inv-tech-t">Built on Blaze infrastructure</div>
                <div className="inv-tech-s">HIPAA-compliant by design. SOC 2 Type 2 inherited from the underlying platform.</div>
              </div>
            </div>
            <div className="inv-tech-tags">
              {["HIPAA", "SOC 2 TYPE 2", "AES-256", "TLS 1.3", "BAA"].map((t) => (
                <span key={t} className="inv-tech-tag">{t}</span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ 06 / THE MARKET ============ */}
      <section className="inv-sec inv-market" id="market">
        <div className="wrap">
          <div className="inv-secnum">06 / The market</div>
          <Reveal as="h2" className="inv-sec-h">
            A category that is <span className="grad-text">large and almost untouched.</span>
          </Reveal>
          <Reveal as="p" className="inv-sec-lede">
            Dentistry is digitising every other corner of the workflow.
            Referrals are the last piece still moving on paper. Less than 2
            percent of practices use any referral-specific software.
          </Reveal>

          <div className="inv-market-shell">
            <Reveal className="inv-market-bars">
              <div className="inv-market-bar-col">
                <div className="inv-market-bar-val">$2.8B</div>
                <AnimatedBar targetPct={51} className="inv-market-bar inv-market-bar-2024" />
                <div className="inv-market-bar-yr">2024</div>
              </div>
              <div className="inv-market-bar-col">
                <div className="inv-market-bar-val grad-text">$5.5B</div>
                <AnimatedBar targetPct={100} className="inv-market-bar inv-market-bar-2030" />
                <div className="inv-market-bar-yr">2030</div>
              </div>
              <div className="inv-market-arrow" aria-hidden="true">
                <svg viewBox="0 0 80 60" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 50 C 20 50, 30 30, 40 25 S 65 10, 75 8" />
                  <path d="M70 4 L75 8 L71 13" />
                </svg>
              </div>
              <p className="inv-market-caption">
                The US SaaS dental market, doubling by 2030. CaseLink is
                positioned in the highest-yield, lowest-adoption corner of
                it.
              </p>
            </Reveal>

            <div className="inv-market-side">
              <Reveal className="inv-market-stat">
                <div className="inv-ms-row">
                  <span className="inv-ms-val grad-text">&lt;<Counter to={2} />%</span>
                  <span className="inv-ms-tag">Adoption</span>
                </div>
                <p>Of practices use referral-specific software today</p>
              </Reveal>
              <Reveal className="inv-market-stat" delay={100}>
                <div className="inv-ms-row">
                  <span className="inv-ms-val grad-text">~<Counter to={14} />%</span>
                  <span className="inv-ms-tag">CAGR</span>
                </div>
                <p>Dental SaaS growth rate through 2030</p>
              </Reveal>
              <Reveal className="inv-market-stat" delay={200}>
                <div className="inv-ms-row">
                  <span className="inv-ms-val grad-text"><Counter to={2.5} decimals={1} />x</span>
                  <span className="inv-ms-tag">Multiplier</span>
                </div>
                <p>Market doubling in six years on conservative estimates</p>
              </Reveal>
            </div>
          </div>

          <details className="inv-collapse">
            <summary>
              <span>Show competitive landscape</span>
              <span className="inv-chev" aria-hidden="true" />
            </summary>
            <div className="inv-collapse-body">
              <table className="inv-table">
                <thead>
                  <tr><th>Platform</th><th>Focus</th><th>Limitation</th><th>CaseLink edge</th></tr>
                </thead>
                <tbody>
                  <tr><td>Refera</td><td>Digital referral logistics</td><td>Weak network effect, transactional</td><td>Collaborative care, compounding network</td></tr>
                  <tr><td>ReferralLab.io</td><td>Process management</td><td>Internal tool, single-sided</td><td>End-to-end, GP and specialist focused</td></tr>
                  <tr><td>OneClick</td><td>Legacy app</td><td>Dated UI, regional, low traction</td><td>Modern, network-native</td></tr>
                  <tr><td>Paper / phone</td><td>The default workflow</td><td>Still dominant in 2026</td><td>Easy adoption, no PMS replacement</td></tr>
                  <tr className="inv-table-us"><td>CaseLink</td><td>Connected, two-sided collaboration</td><td>Dental adoption is slow by nature</td><td>HIPAA + network effect + GP free</td></tr>
                </tbody>
              </table>
            </div>
          </details>
        </div>
      </section>

      {/* ============ 07 / TRACTION ============ */}
      <section className="inv-sec inv-traction" id="traction">
        <div className="wrap">
          <div className="inv-secnum">07 / Traction</div>
          <Reveal as="h2" className="inv-sec-h">
            From idea to <span className="grad-text">twelve practices live.</span>
          </Reveal>
          <Reveal as="p" className="inv-sec-lede">
            Eighteen months from a clinical observation in DC to a working
            platform with referrals flowing through it in real time.
            Pre-seed open.
          </Reveal>

          <div className="inv-traction-grid">
            <Reveal className="inv-tstate inv-tstate-now">
              <div className="inv-tstate-tag"><span className="inv-tstate-dot" />Live now</div>
              <div className="inv-tstate-v"><Counter to={12} /></div>
              <p>Practices actively sending referrals across the DMV</p>
            </Reveal>
            <Reveal className="inv-tstate" delay={100}>
              <div className="inv-tstate-tag inv-tstate-mono">Locations</div>
              <div className="inv-tstate-v">~<Counter to={20} /></div>
              <p>Across the connected practices, a mix of GPs and specialists</p>
            </Reveal>
            <Reveal className="inv-tstate" delay={200}>
              <div className="inv-tstate-tag inv-tstate-mono">Pipeline</div>
              <div className="inv-tstate-v"><Counter to={50} />+</div>
              <p>Warm leads from DC-metro practices, KOL referrals, study clubs</p>
            </Reveal>
            <Reveal className="inv-tstate" delay={300}>
              <div className="inv-tstate-tag inv-tstate-mono">Platform</div>
              <div className="inv-tstate-v">V1</div>
              <p>Shipped December 2025. UI iteration underway. PMS integrations scoped for Q3</p>
            </Reveal>
          </div>

          <div className="inv-timeline">
            {[
              { d: "2024", t: "Concept", x: "Pattern recognised across DC-area practices", state: "past" },
              { d: "Dec 2025", t: "V1 MVP", x: "First working platform shipped, pilots scoped", state: "past" },
              { d: "May 2026", t: "12 practices live", x: "Referrals flowing. Pre-seed open.", state: "now" },
              { d: "Q3 2026", t: "PMS integrations", x: "Dentrix, Cloud 9. First paid GTM push", state: "future" },
              { d: "2027", t: "East coast scale", x: "Expansion beyond DMV. AI features come online", state: "future" },
            ].map((s, i) => (
              <Reveal key={s.d} className={`inv-tstep inv-tstep-${s.state}`} delay={i * 100}>
                <div className="inv-tstep-d">{s.d}</div>
                <div className="inv-tstep-t">{s.t}</div>
                <div className="inv-tstep-x">{s.x}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 08 / FINANCIALS ============ */}
      <section className="inv-sec inv-fin" id="financials">
        <div className="wrap">
          <div className="inv-secnum">08 / Financials</div>
          <Reveal as="h2" className="inv-sec-h">
            Bottom-up projections.{" "}
            <span className="grad-text">$610K to $2.4M</span> in three years.
          </Reveal>
          <Reveal as="p" className="inv-sec-lede">
            Modelled from DC-area adoption, specialist-first sales motion,
            and conservative assumptions on conversion and retention.
          </Reveal>

          <Reveal className="inv-fin-chart">
            <div className="inv-fin-chart-area">
              <div className="inv-fin-col">
                <div className="inv-fin-val">$610K</div>
                <div className="inv-fin-bar-track">
                  <AnimatedBar targetPct={25} className="inv-fin-bar inv-fin-bar-1" />
                </div>
              </div>
              <div className="inv-fin-col">
                <div className="inv-fin-val">$1.5M</div>
                <div className="inv-fin-bar-track">
                  <AnimatedBar targetPct={62} className="inv-fin-bar inv-fin-bar-2" />
                </div>
              </div>
              <div className="inv-fin-col">
                <div className="inv-fin-val grad-text">$2.4M</div>
                <div className="inv-fin-bar-track">
                  <AnimatedBar targetPct={100} className="inv-fin-bar inv-fin-bar-3" />
                </div>
              </div>
            </div>
            <div className="inv-fin-labels">
              <div>
                <div className="yr">2026</div>
                <div className="ctx">170 spec / 340 GP</div>
              </div>
              <div>
                <div className="yr">2027</div>
                <div className="ctx">420 spec / 840 GP</div>
              </div>
              <div>
                <div className="yr">2028</div>
                <div className="ctx">670 spec / 1,340 GP</div>
              </div>
            </div>
          </Reveal>

          <details className="inv-collapse">
            <summary>
              <span>Show full metrics table and assumptions</span>
              <span className="inv-chev" aria-hidden="true" />
            </summary>
            <div className="inv-collapse-body">
              <table className="inv-table">
                <thead>
                  <tr><th>Metric</th><th>Year 1 (2026)</th><th>Year 2 (2027)</th><th>Year 3 (2028)</th></tr>
                </thead>
                <tbody>
                  <tr><td>Specialists onboarded</td><td>170</td><td>420</td><td>670</td></tr>
                  <tr><td>General dentists</td><td>340</td><td>840</td><td>1,340</td></tr>
                  <tr><td>MRR</td><td>$51K</td><td>$126K</td><td>$200K</td></tr>
                  <tr><td>Gross margin</td><td>70%</td><td>75%</td><td>78%</td></tr>
                  <tr><td>Referrals per practice</td><td>25/mo</td><td>35/mo</td><td>50/mo</td></tr>
                  <tr className="inv-table-us"><td>ARR</td><td>$610K</td><td>$1.5M</td><td>$2.4M</td></tr>
                </tbody>
              </table>
              <p className="inv-fin-meta">
                <strong>Key assumptions.</strong> GPs free to remove the
                largest friction in the two-sided market. Specialists at
                $299/month with a 10 percent yearly discount. Acquisition
                through direct outreach, dental events, and compounding
                network effect. Breakeven projected within 18 to 24 months
                of the first paid GTM push.
              </p>
            </div>
          </details>
        </div>
      </section>

      {/* ============ 09 / THE ASK ============ */}
      <section className="inv-sec inv-bigask" id="ask">
        <div className="wrap">
          <div className="inv-secnum">09 / The ask</div>

          <Reveal className="inv-bigask-card">
            <div className="inv-bigask-outline" aria-hidden="true" />
            <div className="inv-bigask-inner">
              <div className="inv-bigask-grid">
                <div>
                  <div className="inv-bigask-eyebrow">
                    <span className="inv-bigask-pulse" />
                    Pre-seed SAFE · now filling
                  </div>
                  <h2 className="inv-bigask-h">
                    <span className="inv-bigask-amount">$<Counter to={500} />K</span>
                    <span className="inv-bigask-sub">
                      to take CaseLink from twelve live practices to a hundred
                      and seventy paying specialists in twelve months.
                    </span>
                  </h2>
                  <div className="inv-progress">
                    <div className="inv-progress-row">
                      <span>Specialists onboarded</span>
                      <strong>12 / 170</strong>
                    </div>
                    <div className="inv-progress-track">
                      <AnimatedBar targetPct={7} axis="width" className="inv-progress-fill" />
                    </div>
                  </div>
                  <div className="inv-bigask-cta">
                    <BookCallButton className="btn btn-primary">
                      Talk to Nick
                    </BookCallButton>
                    <a className="btn btn-ghost-light" href="mailto:nick@caselink.net?subject=CaseLink%20investor%20call">
                      nick@caselink.net
                    </a>
                  </div>
                </div>
                <div className="inv-bigask-terms">
                  <div className="inv-bigask-term">
                    <div className="lbl">Cap</div>
                    <div className="val"><span className="g">$4M</span> post</div>
                  </div>
                  <div className="inv-bigask-term">
                    <div className="lbl">Discount</div>
                    <div className="val">20%</div>
                  </div>
                  <div className="inv-bigask-term">
                    <div className="lbl">Equity at cap</div>
                    <div className="val">~20%</div>
                  </div>
                  <div className="inv-bigask-term">
                    <div className="lbl">Breakeven</div>
                    <div className="val">18–24 mo</div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          <div className="inv-uof-grid">
            <Reveal className="inv-uof inv-uof-blue">
              <div className="inv-uof-pct"><Counter to={50} />%</div>
              <div className="inv-uof-t">Product</div>
              <p>V1 polish. PMS integrations with Dentrix and Cloud 9. Onboarding automation. Analytics expansion. Foundations for the AI roadmap.</p>
            </Reveal>
            <Reveal className="inv-uof inv-uof-mint" delay={120}>
              <div className="inv-uof-pct"><Counter to={50} />%</div>
              <div className="inv-uof-t">Go-to-market</div>
              <p>First true paid GTM push. Conference presence. Sales enablement for the specialist-first motion. Expanded marketing across the DMV and east coast.</p>
            </Reveal>
          </div>

          <div className="inv-targets">
            <Reveal as="h3">Year 1 milestones the round funds.</Reveal>
            <div className="inv-targets-list">
              {[
                ["1", <><strong>170 specialist providers</strong> onboarded across the DMV and east-coast expansion</>],
                ["2", <><strong>$610K ARR</strong> by Q4 with month-on-month MRR growth visible by Q2</>],
                ["3", <><strong>Three multi-location partnerships</strong> with DSO or group practice organisations</>],
                ["4", <><strong>Two PMS integrations live</strong> (Dentrix, Cloud 9) cutting onboarding friction</>],
                ["5", <><strong>Founding cohort</strong> active with reference case studies for the next round</>],
                ["6", <><strong>Breakeven trajectory</strong> visible by month 18 from this round close</>],
              ].map(([n, body], i) => (
                <Reveal key={n as string} className="inv-target" delay={i * 60}>
                  <span className="inv-target-n">{n}</span>
                  <span>{body}</span>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ 10 / TEAM ============ */}
      <section className="inv-sec inv-team" id="team">
        <div className="wrap">
          <div className="inv-secnum">10 / Team</div>
          <Reveal as="h2" className="inv-sec-h">
            Built by people who have{" "}
            <span className="grad-text">lived inside the problem.</span>
          </Reveal>
          <Reveal as="p" className="inv-sec-lede">
            Dental, healthcare technology, and B2B sales backgrounds. A
            clinical hand on the design. A first-principles understanding
            of how referrals actually move between offices.
          </Reveal>

          <div className="inv-team-grid">
            <Reveal className="inv-tcard">
              <div className="inv-tcard-photo">
                <Image
                  src="/portrait.png"
                  alt="Nicholas Campbell"
                  width={555}
                  height={800}
                />
              </div>
              <div>
                <div className="inv-tcard-name">Nicholas Campbell</div>
                <div className="inv-tcard-role">Co-founder, CEO, MBA</div>
                <p className="inv-tcard-bio">
                  Johns Hopkins. Former Evenly and Dentsply Sirona. Dental,
                  healthcare technology, and B2B sales background. Built
                  CaseLink after watching the same broken handoff happen
                  across DC practice after practice.
                </p>
              </div>
            </Reveal>
            <Reveal className="inv-tcard" delay={120}>
              <div className="inv-tcard-photo inv-tcard-initials" aria-hidden="true">
                LC
              </div>
              <div>
                <div className="inv-tcard-name">Laura Campbell</div>
                <div className="inv-tcard-role">Co-founder</div>
                <p className="inv-tcard-bio">
                  Co-founder and operating partner. Clinical workflow
                  expertise across general and specialist settings. Drives
                  product feedback and the early customer relationships that
                  anchor the DMV network.
                </p>
              </div>
            </Reveal>
          </div>

          <Reveal className="inv-backers">
            <div className="inv-backers-lbl">Backed by people from</div>
            <div className="inv-backers-marquee">
              <div className="inv-backers-track">
                {[
                  "nxtMOVE",
                  "NEWHOLD",
                  "VISA",
                  "KASU",
                  "Blaze Technologies",
                  "nxtMOVE",
                  "NEWHOLD",
                  "VISA",
                  "KASU",
                  "Blaze Technologies",
                ].map((b, i) => (
                  <span key={`${b}-${i}`} className="inv-backer">{b}</span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ CONTACT ============ */}
      <section className="inv-sec inv-contact" id="contact">
        <div className="inv-contact-bg" aria-hidden="true" />
        <div className="wrap">
          <Reveal as="h2" className="inv-sec-h inv-contact-h">
            Ready to take the <span className="grad-text">next conversation?</span>
          </Reveal>
          <Reveal as="p" className="inv-sec-lede inv-contact-lede">
            Nick handles every investor conversation directly. Email, call,
            or schedule a walkthrough. He will go through the platform, the
            network, and the financial model in detail.
          </Reveal>

          <Reveal className="inv-contact-actions">
            <BookCallButton className="btn btn-primary inv-contact-cta">
              Schedule a walkthrough
              <ArrowRight width={14} height={14} />
            </BookCallButton>
            <a className="btn btn-ghost" href="mailto:nick@caselink.net?subject=CaseLink%20investor%20call">
              nick@caselink.net
            </a>
          </Reveal>

          <Reveal className="inv-contact-card">
            <div className="inv-contact-avatar">
              <Image src="/portrait.png" alt="Nicholas Campbell" width={555} height={800} />
            </div>
            <div className="inv-contact-info">
              <div className="inv-contact-name">Nicholas Campbell</div>
              <div className="inv-contact-role">Co-founder &amp; CEO, CaseLink</div>
              <div className="inv-contact-lines">
                <a href="mailto:nick@caselink.net">nick@caselink.net</a>
                <a href="tel:+17035543449">+1 (703) 554-3449</a>
              </div>
            </div>
          </Reveal>

          <p className="inv-fineprint">
            CaseLink · May 2026 · Confidential · For recipient eyes only.
            Forecasts are estimates and subject to change. Pre-seed SAFE on
            standard YC terms at a $4M cap with 20 percent discount.
          </p>
        </div>
      </section>
    </div>
  );
}
