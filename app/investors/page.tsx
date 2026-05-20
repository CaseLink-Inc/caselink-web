import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight } from "@/components/icons";

// Investor brief is intentionally unlisted. No canonical, no OG image,
// no sitemap entry, no nav or footer link. robots/noindex tells crawlers
// to skip it. The URL is meant to be shared directly by Nick.
export const metadata: Metadata = {
  title: "Investor Brief",
  description:
    "CaseLink investor brief. Pre-seed round, twelve practices live, the referral layer dentistry is missing.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      "max-snippet": -1,
      "max-image-preview": "none",
    },
  },
};

const marqueeItems = [
  ["12 practices live", "across the DMV"],
  ["V1 platform shipped", "December 2025"],
  ["Pre-seed SAFE", "open at $4M cap"],
  ["50+ warm leads", "in the DC pipeline"],
  ["$610K ARR", "projected by Q4"],
  ["HIPAA + SOC 2", "via Blaze infrastructure"],
];

export default function InvestorsPage() {
  return (
    <>
      {/* ============ HERO ============ */}
      <section className="inv-hero">
        <div className="inv-hero-bg" />
        <div className="wrap inv-hero-inner">
          <div className="inv-hero-text">
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
              <a
                className="btn btn-ghost"
                href="mailto:nick@caselink.net?subject=CaseLink%20investor%20call"
              >
                Talk to Nick
              </a>
            </div>
          </div>

          <aside className="inv-ask-card">
            <div className="inv-ask-head">
              <span className="inv-ask-tag">The Round</span>
              <span className="inv-ask-status">
                <span className="inv-ask-dot" />
                Open
              </span>
            </div>
            <div className="inv-ask-amount">
              $500K<span className="sub">pre-seed SAFE</span>
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
              {[...marqueeItems, ...marqueeItems].map(([bold, rest], i) => (
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
      <section className="inv-sec inv-tldr">
        <div className="wrap">
          <div className="inv-secnum">01 / At a glance</div>
          <h2 className="inv-sec-h">Four numbers, the whole picture.</h2>
          <p className="inv-sec-lede">
            The opportunity, the size, the trajectory, the ask. Everything
            else in this brief expands on these.
          </p>

          <div className="inv-tldr-grid">
            <div className="inv-tldr-cell">
              <div className="inv-tldr-lbl">The problem</div>
              <div className="inv-tldr-val grad-warm">30<span className="u">%</span></div>
              <p className="inv-tldr-sub">
                of dental referrals fail today, lost between paper, phone,
                and unsecured email
              </p>
            </div>
            <div className="inv-tldr-cell">
              <div className="inv-tldr-lbl">The opportunity</div>
              <div className="inv-tldr-val grad-text">$1.8<span className="u">M</span></div>
              <p className="inv-tldr-sub">
                in recoverable revenue per ten-GP network, every single year
              </p>
            </div>
            <div className="inv-tldr-cell">
              <div className="inv-tldr-lbl">The trajectory</div>
              <div className="inv-tldr-val grad-text">$2.4<span className="u">M</span></div>
              <p className="inv-tldr-sub">
                projected ARR by Year 3, bottom-up plan, conservative
                assumptions
              </p>
            </div>
            <div className="inv-tldr-cell">
              <div className="inv-tldr-lbl">The ask</div>
              <div className="inv-tldr-val">$500<span className="u">K</span></div>
              <p className="inv-tldr-sub">
                pre-seed SAFE at a $4M cap with 20% discount, currently being
                filled
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 02 / THE PROBLEM ============ */}
      <section className="inv-sec inv-prob">
        <div className="wrap">
          <div className="inv-secnum">02 / The problem</div>
          <h2 className="inv-sec-h">
            Dental referrals fail <span className="grad-warm">silently every day.</span>
          </h2>
          <p className="inv-sec-lede">
            Every dental practice in the country runs the same broken loop.
            A GP writes a slip. The patient leaves with it in hand.
            Somewhere between that office and the specialist, a third of
            the time, the case quietly disappears.
          </p>

          <div className="inv-prob-big">
            <div className="num">30%</div>
            <p className="cap">
              of all dental referrals never reach treatment. No tracking. No
              follow-up. No way for the GP to know what happened to their
              patient.
            </p>
          </div>

          <div className="inv-prob-grid">
            {[
              { n: "01", h: "Paper and email workflows", p: "The dominant referral channel in 2026 is still a printed slip and a phone call. No audit trail. No tracking. No closed loop." },
              { n: "02", h: "Admin overload", p: "Front-desk staff spend hours every week on referral follow-up calls. Time and payroll wasted on work software should be doing." },
              { n: "03", h: "HIPAA exposure", p: "Every record sent over unsecured email or text raises the practice's compliance risk. Practices know it. They have no better channel." },
              { n: "04", h: "Outcome blindness", p: "Most GPs never learn whether their patient was treated. The relationship with the specialist deteriorates. The cycle compounds." },
            ].map((b) => (
              <div key={b.n} className="inv-prob-bullet">
                <div className="inv-prob-no">{b.n}</div>
                <h4>{b.h}</h4>
                <p>{b.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 03 / THE MATH ============ */}
      <section className="inv-sec inv-math">
        <div className="wrap">
          <div className="inv-secnum">03 / The math</div>
          <h2 className="inv-sec-h">
            Every practice is leaking <span className="grad-warm">$180,000 a year.</span>
          </h2>
          <p className="inv-sec-lede">
            The revenue is already earned. It is simply never captured. Run
            the same numbers across a connected network of GPs and the
            figure clears $1.8 million annually.
          </p>

          <div className="inv-eq">
            <div className="inv-eq-row">
              <div className="inv-tile">
                <div className="v">20<span className="u">/mo</span></div>
                <div className="l">Specialty referrals from one GP</div>
              </div>
              <div className="inv-op">×</div>
              <div className="inv-tile">
                <div className="v">$2.5K</div>
                <div className="l">Average case revenue</div>
              </div>
              <div className="inv-op">×</div>
              <div className="inv-tile">
                <div className="v">30<span className="u">%</span></div>
                <div className="l">That fall through today</div>
              </div>
              <div className="inv-op">=</div>
              <div className="inv-tile inv-tile-final">
                <div className="v">$180K+</div>
                <div className="l">Lost per practice per year</div>
              </div>
            </div>
            <p className="inv-eq-note">
              Multiply by a referral network of ten general dentists and the
              recoverable annual revenue clears <strong>$1.8 million</strong>.
              These dollars are already earned. CaseLink simply captures
              them.
            </p>
          </div>
        </div>
      </section>

      {/* ============ 04 / THE SHIFT ============ */}
      <section className="inv-sec inv-shift">
        <div className="wrap">
          <div className="inv-secnum">04 / The shift</div>
          <h2 className="inv-sec-h">Twenty referrals. Twice the throughput.</h2>
          <p className="inv-sec-lede">
            Same patient volume. Same specialists. The only difference is a
            connected, audited, closed-loop layer between the two offices.
          </p>

          <div className="inv-ba-grid">
            <div className="inv-ba-card inv-ba-before">
              <div className="inv-ba-label">Before CaseLink</div>
              <div className="inv-ba-title">Paper, phone tag, hope.</div>
              <div className="inv-ba-funnel">
                <div className="inv-ba-row"><strong>20</strong>Referrals sent</div>
                <div className="inv-ba-row inv-ba-row-bad"><strong>12</strong>Reach the specialist and complete</div>
              </div>
              <div className="inv-ba-money"><span>Monthly revenue realised</span><strong>$30K</strong></div>
            </div>
            <div className="inv-ba-card inv-ba-after">
              <div className="inv-ba-label">With CaseLink</div>
              <div className="inv-ba-title">Connected. Tracked. Closed-loop.</div>
              <div className="inv-ba-funnel">
                <div className="inv-ba-row"><strong>20</strong>Referrals sent</div>
                <div className="inv-ba-row inv-ba-row-good"><strong>18</strong>Reach the specialist and complete</div>
              </div>
              <div className="inv-ba-money"><span>Monthly revenue realised</span><strong>$45K</strong></div>
            </div>
          </div>

          <div className="inv-lift">
            <div className="inv-lift-v">+$180K</div>
            <p className="inv-lift-l">
              Annual revenue lift from <strong>a single provider.</strong>{" "}
              Multiplied across a ten-GP network, recovered revenue exceeds{" "}
              <strong>$1.8 million per year.</strong>
            </p>
          </div>
        </div>
      </section>

      {/* ============ 05 / THE PRODUCT ============ */}
      <section className="inv-sec inv-product">
        <div className="wrap">
          <div className="inv-secnum">05 / The product</div>
          <h2 className="inv-sec-h">
            An operating system for <span className="grad-text">dental collaboration.</span>
          </h2>
          <p className="inv-sec-lede">
            CaseLink does not replace practice management software. It
            connects the practices that already use one. Less to learn.
            More to gain.
          </p>

          <div className="inv-pillar-grid">
            <div className="inv-pillar">
              <div className="inv-pillar-no">01</div>
              <div className="inv-pillar-ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <polyline points="9 12 11 14 15 10" />
                </svg>
              </div>
              <h4>HIPAA-compliant messaging</h4>
              <p>Encrypted in transit and at rest. BAA on file with every practice. Audit logged on every action.</p>
              <div className="inv-pillar-out">› Faster communication, revenue sooner</div>
            </div>
            <div className="inv-pillar">
              <div className="inv-pillar-no">02</div>
              <div className="inv-pillar-ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="3" />
                  <circle cx="4" cy="5" r="1.5" />
                  <circle cx="20" cy="5" r="1.5" />
                  <circle cx="4" cy="19" r="1.5" />
                  <circle cx="20" cy="19" r="1.5" />
                  <line x1="6" y1="6" x2="10" y2="11" />
                  <line x1="18" y1="6" x2="14" y2="11" />
                  <line x1="6" y1="18" x2="10" y2="13" />
                  <line x1="18" y1="18" x2="14" y2="13" />
                </svg>
              </div>
              <h4>Connected referral network</h4>
              <p>GPs and specialists in one network. Discover and invite practices. The more it grows, the more valuable it becomes.</p>
              <div className="inv-pillar-out">› Compounding network effect</div>
            </div>
            <div className="inv-pillar">
              <div className="inv-pillar-no">03</div>
              <div className="inv-pillar-ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <polygon points="12 2 22 8.5 12 15 2 8.5 12 2" />
                  <polyline points="2 15.5 12 22 22 15.5" />
                </svg>
              </div>
              <h4>One centralised view</h4>
              <p>Every active case. Every status. Every outcome. The whole referral pipeline visible to the practice in real time.</p>
              <div className="inv-pillar-out">› Track without chasing</div>
            </div>
            <div className="inv-pillar">
              <div className="inv-pillar-no">04</div>
              <div className="inv-pillar-ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
                  <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
                </svg>
              </div>
              <h4>Built for fast adoption</h4>
              <p>Live in a practice in an afternoon. No retraining. No PMS migration. Free for GPs to remove every adoption barrier.</p>
              <div className="inv-pillar-out">› Lower admin, faster adoption</div>
            </div>
          </div>

          <div className="inv-tech-band">
            <div className="inv-tech-l">
              <div className="inv-tech-ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <polyline points="9 12 11 14 15 10" />
                </svg>
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
          </div>
        </div>
      </section>

      {/* ============ 06 / THE MARKET ============ */}
      <section className="inv-sec inv-market">
        <div className="wrap">
          <div className="inv-secnum">06 / The market</div>
          <h2 className="inv-sec-h">
            A category that is <span className="grad-text">large and almost untouched.</span>
          </h2>
          <p className="inv-sec-lede">
            Dentistry is digitising every other corner of the workflow.
            Referrals are the last piece still moving on paper. Less than 2
            percent of practices use any referral-specific software.
          </p>

          <div className="inv-market-grid">
            <div className="inv-market-headline">
              <div className="inv-market-big">
                <span className="from">2024</span>
                <span className="amt">$2.8B</span>
                <span className="arrow">→</span>
                <span className="to">$5.5B</span>
              </div>
              <p className="inv-market-sub">
                The US SaaS dental market, doubling by 2030. CaseLink is
                positioned in the highest-yield, lowest-adoption corner of
                it.
              </p>
            </div>

            <div className="inv-market-side">
              <div className="inv-market-stat">
                <div className="inv-ms-row">
                  <span className="inv-ms-val grad-text">&lt;2%</span>
                  <span className="inv-ms-tag">Adoption</span>
                </div>
                <p>Of practices use referral-specific software today</p>
              </div>
              <div className="inv-market-stat">
                <div className="inv-ms-row">
                  <span className="inv-ms-val grad-text">~14%</span>
                  <span className="inv-ms-tag">CAGR</span>
                </div>
                <p>Dental SaaS growth rate through 2030</p>
              </div>
              <div className="inv-market-stat">
                <div className="inv-ms-row">
                  <span className="inv-ms-val grad-text">2.5x</span>
                  <span className="inv-ms-tag">Multiplier</span>
                </div>
                <p>Market doubling in six years on conservative estimates</p>
              </div>
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
                  <tr>
                    <th>Platform</th>
                    <th>Focus</th>
                    <th>Limitation</th>
                    <th>CaseLink edge</th>
                  </tr>
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
      <section className="inv-sec inv-traction">
        <div className="wrap">
          <div className="inv-secnum">07 / Traction</div>
          <h2 className="inv-sec-h">
            From idea to <span className="grad-text">twelve practices live.</span>
          </h2>
          <p className="inv-sec-lede">
            Eighteen months from a clinical observation in DC to a working
            platform with referrals flowing through it in real time.
            Pre-seed open.
          </p>

          <div className="inv-traction-grid">
            <div className="inv-tstate inv-tstate-now">
              <div className="inv-tstate-tag"><span className="inv-tstate-dot" />Live now</div>
              <div className="inv-tstate-v">12</div>
              <p>Practices actively sending referrals across the DMV</p>
            </div>
            <div className="inv-tstate">
              <div className="inv-tstate-tag inv-tstate-mono">Locations</div>
              <div className="inv-tstate-v">~20</div>
              <p>Across the connected practices, a mix of GPs and specialists</p>
            </div>
            <div className="inv-tstate">
              <div className="inv-tstate-tag inv-tstate-mono">Pipeline</div>
              <div className="inv-tstate-v">50+</div>
              <p>Warm leads from DC-metro practices, KOL referrals, study clubs</p>
            </div>
            <div className="inv-tstate">
              <div className="inv-tstate-tag inv-tstate-mono">Platform</div>
              <div className="inv-tstate-v">V1</div>
              <p>Shipped December 2025. UI iteration underway. PMS integrations scoped for Q3</p>
            </div>
          </div>

          <div className="inv-timeline">
            {[
              { d: "2024", t: "Concept", x: "Pattern recognised across DC-area practices", state: "past" },
              { d: "Dec 2025", t: "V1 MVP", x: "First working platform shipped, pilots scoped", state: "past" },
              { d: "May 2026", t: "12 practices live", x: "Referrals flowing. Pre-seed open.", state: "now" },
              { d: "Q3 2026", t: "PMS integrations", x: "Dentrix, Cloud 9. First paid GTM push", state: "future" },
              { d: "2027", t: "East coast scale", x: "Expansion beyond DMV. AI features come online", state: "future" },
            ].map((s) => (
              <div key={s.d} className={`inv-tstep inv-tstep-${s.state}`}>
                <div className="inv-tstep-d">{s.d}</div>
                <div className="inv-tstep-t">{s.t}</div>
                <div className="inv-tstep-x">{s.x}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 08 / FINANCIALS ============ */}
      <section className="inv-sec inv-fin">
        <div className="wrap">
          <div className="inv-secnum">08 / Financials</div>
          <h2 className="inv-sec-h">
            Bottom-up projections.{" "}
            <span className="grad-text">$610K to $2.4M</span> in three years.
          </h2>
          <p className="inv-sec-lede">
            Modelled from DC-area adoption, specialist-first sales motion,
            and conservative assumptions on conversion and retention.
          </p>

          <div className="inv-fin-chart">
            <div className="inv-fin-col">
              <div className="inv-fin-val">$610K</div>
              <div className="inv-fin-bar" style={{ height: "25%" }} />
              <div className="inv-fin-yr">2026</div>
              <div className="inv-fin-ctx">170 spec / 340 GP</div>
            </div>
            <div className="inv-fin-col">
              <div className="inv-fin-val">$1.5M</div>
              <div className="inv-fin-bar" style={{ height: "62%" }} />
              <div className="inv-fin-yr">2027</div>
              <div className="inv-fin-ctx">420 spec / 840 GP</div>
            </div>
            <div className="inv-fin-col">
              <div className="inv-fin-val">$2.4M</div>
              <div className="inv-fin-bar" style={{ height: "100%" }} />
              <div className="inv-fin-yr">2028</div>
              <div className="inv-fin-ctx">670 spec / 1,340 GP</div>
            </div>
          </div>

          <details className="inv-collapse">
            <summary>
              <span>Show full metrics table and assumptions</span>
              <span className="inv-chev" aria-hidden="true" />
            </summary>
            <div className="inv-collapse-body">
              <table className="inv-table">
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>Year 1 (2026)</th>
                    <th>Year 2 (2027)</th>
                    <th>Year 3 (2028)</th>
                  </tr>
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

          <div className="inv-bigask-card">
            <div className="inv-bigask-grid">
              <div>
                <div className="inv-bigask-eyebrow">Pre-seed SAFE · now filling</div>
                <h2 className="inv-bigask-h">
                  <span className="grad-text">$500K</span>
                  <span className="inv-bigask-sub">
                    to take CaseLink from twelve live practices to a hundred
                    and seventy paying specialists in twelve months.
                  </span>
                </h2>
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

          <div className="inv-uof-grid">
            <div className="inv-uof">
              <div className="inv-uof-pct">50%</div>
              <div className="inv-uof-t">Product</div>
              <p>V1 polish. PMS integrations with Dentrix and Cloud 9. Onboarding automation. Analytics expansion. Foundations for the AI roadmap.</p>
            </div>
            <div className="inv-uof">
              <div className="inv-uof-pct">50%</div>
              <div className="inv-uof-t">Go-to-market</div>
              <p>First true paid GTM push. Conference presence. Sales enablement for the specialist-first motion. Expanded marketing across the DMV and east coast.</p>
            </div>
          </div>

          <div className="inv-targets">
            <h3>Year 1 milestones the round funds.</h3>
            <div className="inv-targets-list">
              {[
                ["1", <><strong>170 specialist providers</strong> onboarded across the DMV and east-coast expansion</>],
                ["2", <><strong>$610K ARR</strong> by Q4 with month-on-month MRR growth visible by Q2</>],
                ["3", <><strong>Three multi-location partnerships</strong> with DSO or group practice organisations</>],
                ["4", <><strong>Two PMS integrations live</strong> (Dentrix, Cloud 9) cutting onboarding friction</>],
                ["5", <><strong>Founding cohort</strong> active with reference case studies for the next round</>],
                ["6", <><strong>Breakeven trajectory</strong> visible by month 18 from this round close</>],
              ].map(([n, body]) => (
                <div key={n as string} className="inv-target">
                  <span className="inv-target-n">{n}</span>
                  <span>{body}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ 10 / TEAM ============ */}
      <section className="inv-sec inv-team">
        <div className="wrap">
          <div className="inv-secnum">10 / Team</div>
          <h2 className="inv-sec-h">
            Built by people who have{" "}
            <span className="grad-text">lived inside the problem.</span>
          </h2>
          <p className="inv-sec-lede">
            Dental, healthcare technology, and B2B sales backgrounds. A
            clinical hand on the design. A first-principles understanding
            of how referrals actually move between offices.
          </p>

          <div className="inv-team-grid">
            <div className="inv-tcard">
              <div className="inv-tcard-photo">
                <Image
                  src="/portrait.png"
                  alt="Nicholas Campbell"
                  width={555}
                  height={800}
                />
              </div>
              <div className="inv-tcard-name">Nicholas Campbell</div>
              <div className="inv-tcard-role">Co-founder, CEO, MBA</div>
              <p className="inv-tcard-bio">
                Johns Hopkins. Former Evenly and Dentsply Sirona. Dental,
                healthcare technology, and B2B sales background. Built
                CaseLink after watching the same broken handoff happen
                across DC practice after practice.
              </p>
            </div>
            <div className="inv-tcard">
              <div className="inv-tcard-photo inv-tcard-initials" aria-hidden="true">
                LC
              </div>
              <div className="inv-tcard-name">Laura Campbell</div>
              <div className="inv-tcard-role">Co-founder</div>
              <p className="inv-tcard-bio">
                Co-founder and operating partner. Clinical workflow
                expertise across general and specialist settings. Drives
                product feedback and the early customer relationships that
                anchor the DMV network.
              </p>
            </div>
          </div>

          <div className="inv-backers">
            <div className="inv-backers-lbl">Backed by people from</div>
            <div className="inv-backers-row">
              {["nxtMOVE", "NEWHOLD", "VISA", "KASU", "Blaze Technologies"].map((b) => (
                <span key={b} className="inv-backer">{b}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ CONTACT ============ */}
      <section className="inv-sec inv-contact">
        <div className="wrap">
          <h2 className="inv-sec-h">Ready to take the next conversation?</h2>
          <p className="inv-sec-lede">
            Nick handles every investor conversation directly. Email, call,
            or schedule a walkthrough. He will go through the platform, the
            network, and the financial model in detail.
          </p>

          <div className="inv-contact-card">
            <div className="inv-contact-name">Nicholas Campbell</div>
            <div className="inv-contact-role">Co-founder &amp; CEO, CaseLink</div>
            <div className="inv-contact-lines">
              <a href="mailto:nick@caselink.net">nick@caselink.net</a>
              <a href="tel:+17035543449">+1 (703) 554-3449</a>
            </div>
          </div>

          <p className="inv-fineprint">
            CaseLink · May 2026 · Confidential · For recipient eyes only.
            Forecasts are estimates and subject to change. Pre-seed SAFE on
            standard YC terms at a $4M cap with 20 percent discount.
          </p>
        </div>
      </section>
    </>
  );
}
