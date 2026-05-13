import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "@/components/icons";
import Timeline from "@/components/about/Timeline";
import CtaBand from "@/components/home/CtaBand";

export default function AboutPage() {
  return (
    <>
      <section className="about-hero">
        <div className="about-hero-bg" />
        <div className="wrap about-hero-inner">
          <div>
            <span className="eyebrow">About CaseLink</span>
            <h1>
              Building the <span className="grad-text">link</span> dentistry
              has been missing.
            </h1>
            <p className="lead">
              CaseLink began with a simple observation. Dentists are some of
              the most connected professionals in healthcare, yet the digital
              tools connecting their practices have not caught up.
            </p>
            <div className="hero-cta">
              <Link href="/contact" className="btn btn-primary">
                Get in touch
                <ArrowRight width={14} height={14} />
              </Link>
              <Link href="/#how" className="btn btn-ghost">See the product</Link>
            </div>
          </div>
          <div className="portrait-wrap">
            <div className="portrait-orbit2" />
            <div className="portrait-orbit" />
            <div className="portrait-frame">
              <Image
                src="/portrait.jpg"
                alt="Nick, founder of CaseLink"
                width={440}
                height={440}
                priority
              />
              <div className="portrait-tag">
                <span className="pt-dot" />
                <div className="pt-txt">
                  <strong>Nick</strong>
                  <span>Founder, CaseLink</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="about-story">
        <div className="wrap">
          <div className="about-story-inner">
            <span className="eyebrow reveal">The founder&apos;s story</span>
            <h2 className="reveal">Why I started CaseLink.</h2>
            <p className="story-quote reveal">
              After watching the same broken handoff happen across dental
              practices in DC, the gap became impossible to ignore. The
              relationships existed. The technology did not.
            </p>
          </div>
          <div className="story-body">
            <div className="reveal">
              <p>
                The idea took shape through conversation. General dentists kept
                describing the same situation. A patient gets referred to a
                specialist. The slip goes home with them. Sometimes they call
                to book. Sometimes they don&apos;t. Weeks later, the GP has no
                idea whether the case was treated, scheduled, or quietly
                forgotten.
              </p>
              <p>
                The specialists were not in better shape. Cases arrived by fax
                with missing x-rays. Front desk teams spent hours on the phone
                reconstructing patient details. Even strong referral
                relationships were leaking value at every step.
              </p>
            </div>
            <div className="reveal" style={{ transitionDelay: ".15s" }}>
              <p>
                The dental software market is approaching one billion dollars
                in the United States, yet fewer than two percent of practices
                use a tool built specifically for referrals. That gap is what
                we are here to close.
              </p>
              <p>
                CaseLink is built around one belief. The relationships that
                already exist between dental practices deserve infrastructure
                that respects them. The patient deserves continuity. The
                practice deserves growth, not friction.
              </p>
              <div className="story-signature">
                <Image src="/portrait-signature.jpg" width={48} height={48} alt="Nick" />
                <div>
                  <div className="sname">Nick</div>
                  <div className="srole">Founder, CaseLink</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Timeline />

      <section className="about-mission">
        <div className="wrap">
          <span className="eyebrow reveal" style={{ textAlign: "center", display: "flex", justifyContent: "center" }}>What we stand for</span>
          <h2 className="reveal">Three principles<br />that shape every decision.</h2>
          <p className="reveal">Patient continuity first. Simplicity always. Compliance by design.</p>
          <div className="mission-grid">
            <div className="mission-card reveal">
              <div className="mission-num">01</div>
              <h3>Patient continuity first</h3>
              <p>Every feature is judged by one question. Does it make it easier for a patient to receive seamless care across two practices.</p>
            </div>
            <div className="mission-card reveal" style={{ transitionDelay: ".1s" }}>
              <div className="mission-num">02</div>
              <h3>The link, not the replacement</h3>
              <p>CaseLink does not replace your practice management software. We are the layer that connects your practice to the next one.</p>
            </div>
            <div className="mission-card reveal" style={{ transitionDelay: ".2s" }}>
              <div className="mission-num">03</div>
              <h3>Compliance you can feel</h3>
              <p>Patient data is sacred. CaseLink is HIPAA compliant by design, audited annually, and every action is traceable.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="about-where">
        <div className="wrap where-grid">
          <div className="reveal">
            <span className="eyebrow">Why DC, why now</span>
            <h2>The right place to<br />prove the model.</h2>
            <p>
              Washington, DC has one of the highest dentist densities in the
              country. Specialists and general dentists already know each
              other. Referrals already flow between them.
            </p>
            <p>
              By starting where the network is informal, we can prove what
              becomes possible when it gets a proper digital home.
            </p>
            <div className="where-cities">
              <span className="where-city now"><span className="dot" />Washington, DC</span>
              <span className="where-city"><span className="dot" />Boston</span>
              <span className="where-city"><span className="dot" />Philadelphia</span>
              <span className="where-city"><span className="dot" />Charlotte</span>
              <span className="where-city"><span className="dot" />Atlanta</span>
            </div>
          </div>
          <div className="where-viz reveal">
            <svg viewBox="0 0 500 440" preserveAspectRatio="xMidYMid meet">
              <defs>
                <linearGradient id="mapBg" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#3E8EFF" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#90F0C5" stopOpacity="0.08" />
                </linearGradient>
              </defs>
              <rect width="500" height="440" fill="url(#mapBg)" rx="20" />
              <path d="M 120 80 L 380 60 L 440 220 L 360 380 L 140 360 L 80 200 Z" fill="#fff" stroke="#3E8EFF" strokeWidth="1.5" opacity="0.4" />
              <g stroke="#3E8EFF" strokeWidth="0.4" opacity="0.3" fill="none">
                <line x1="120" y1="150" x2="440" y2="150" />
                <line x1="120" y1="220" x2="440" y2="220" />
                <line x1="120" y1="290" x2="440" y2="290" />
                <line x1="200" y1="60" x2="200" y2="380" />
                <line x1="280" y1="60" x2="280" y2="380" />
                <line x1="360" y1="60" x2="360" y2="380" />
                <line x1="120" y1="80" x2="440" y2="380" strokeDasharray="3 4" />
                <line x1="440" y1="80" x2="120" y2="380" strokeDasharray="3 4" />
              </g>
              <circle cx="200" cy="160" r="6" fill="#3DBD6B" />
              <circle cx="280" cy="120" r="6" fill="#FFA940" />
              <circle cx="320" cy="220" r="6" fill="#3DBD6B" />
              <circle cx="180" cy="260" r="6" fill="#FFA940" />
              <circle cx="360" cy="300" r="6" fill="#3DBD6B" />
              <circle cx="240" cy="330" r="6" fill="#FFA940" />
              <circle cx="280" cy="220" r="18" fill="#3E8EFF" stroke="#fff" strokeWidth="3" />
              <text x="280" y="225" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700" fontFamily="'Plus Jakarta Sans'">DC</text>
              <circle cx="280" cy="220" r="40" fill="none" stroke="#3E8EFF" strokeWidth="1.5" opacity="0.3">
                <animate attributeName="r" from="20" to="60" dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.5" to="0" dur="3s" repeatCount="indefinite" />
              </circle>
              <circle cx="280" cy="220" r="70" fill="none" stroke="#3E8EFF" strokeWidth="1" opacity="0.2" />
              <circle cx="280" cy="220" r="100" fill="none" stroke="#3E8EFF" strokeWidth="0.7" opacity="0.15" />
              <g opacity="0.5">
                <circle cx="80" cy="60" r="4" fill="#7A8886" />
                <text x="80" y="50" textAnchor="middle" fill="#7A8886" fontSize="9" fontFamily="'Plus Jakarta Sans'">Boston</text>
                <circle cx="100" cy="120" r="4" fill="#7A8886" />
                <text x="100" y="110" textAnchor="middle" fill="#7A8886" fontSize="9" fontFamily="'Plus Jakarta Sans'">Philadelphia</text>
                <circle cx="420" cy="380" r="4" fill="#7A8886" />
                <text x="420" y="402" textAnchor="middle" fill="#7A8886" fontSize="9" fontFamily="'Plus Jakarta Sans'">Charlotte</text>
                <circle cx="380" cy="410" r="4" fill="#7A8886" />
                <text x="380" y="432" textAnchor="middle" fill="#7A8886" fontSize="9" fontFamily="'Plus Jakarta Sans'">Atlanta</text>
              </g>
            </svg>
          </div>
        </div>
      </section>

      <CtaBand
        title={<>Want to be part of<br />the first wave?</>}
        body="Early DC practices get founding member pricing, hands-on onboarding, and a direct line to our team."
        primary={{ href: "/contact", label: "Apply for pilot access" }}
        secondary={{ href: "/", label: "Back to home" }}
      />
    </>
  );
}
