import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "@/components/icons";
import Timeline from "@/components/about/Timeline";
import DcMap from "@/components/about/DcMap";
import MarketStat from "@/components/about/MarketStat";
import CtaBand from "@/components/home/CtaBand";
import { SIGNUP_URL } from "@/lib/urls";

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
              <a href={SIGNUP_URL} className="btn btn-ghost">See the product</a>
            </div>
          </div>
          <div className="portrait-wrap">
            <svg
              className="portrait-orbits"
              viewBox="0 0 1800 700"
              preserveAspectRatio="xMidYMid meet"
              aria-hidden="true"
            >
              <defs>
                {/* Big wide ellipses centered at (900, 350), unrotated.
                    Each enclosing <g> handles the tilt so animateMotion's
                    coordinates line up with the rendered curve. */}
                <path
                  id="orb-a"
                  d="M 80 350 a 820 210 0 1 0 1640 0 a 820 210 0 1 0 -1640 0"
                />
                <path
                  id="orb-b"
                  d="M 140 350 a 760 175 0 1 0 1520 0 a 760 175 0 1 0 -1520 0"
                />
              </defs>
              <g transform="rotate(-18 900 350)">
                <use
                  href="#orb-a"
                  fill="none"
                  stroke="rgba(62,142,255,0.32)"
                  strokeWidth="1.4"
                  strokeDasharray="6 8"
                />
                <circle r="7" fill="#3E8EFF">
                  <animateMotion dur="20s" repeatCount="indefinite">
                    <mpath href="#orb-a" />
                  </animateMotion>
                </circle>
              </g>
              <g transform="rotate(24 900 350)">
                <use
                  href="#orb-b"
                  fill="none"
                  stroke="rgba(255,169,64,0.30)"
                  strokeWidth="1.4"
                  strokeDasharray="6 8"
                />
                <circle r="6" fill="#FFA940">
                  <animateMotion dur="24s" repeatCount="indefinite">
                    <mpath href="#orb-b" />
                  </animateMotion>
                </circle>
              </g>
            </svg>
            <div className="portrait-frame">
              <Image
                src="/portrait.png"
                alt="Nick Campbell, Co-Founder and CEO of CaseLink"
                width={555}
                height={800}
                priority
              />
              <div className="portrait-tag">
                <span className="pt-dot" />
                <div className="pt-txt">
                  <strong>Nick Campbell</strong>
                  <span>Co-Founder · CEO</span>
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
              I kept hearing the same story from dentists I knew in DC. A
              patient gets referred, and then no one is sure what happens
              next. The relationship was there. The tooling was not.
            </p>
          </div>
          <div className="story-body">
            <div className="reveal">
              <p>
                I started talking to GPs, specialists, and front desk teams.
                Different practices, same frustration. Paper slips that
                disappear. Faxes that arrive without x-rays. Hours on the
                phone reconstructing what should be a two-minute handoff.
              </p>
              <p>
                We built CaseLink to be the one piece of software that lives
                between practices, not inside any one of them. The patient
                arrives at the specialist already known. The GP sees the
                outcome the day it happens.
              </p>
            </div>
            <div className="reveal" style={{ transitionDelay: ".15s" }}>
              <p>
                We are not replacing your practice management system. We are
                the layer that connects yours to the one across town.
              </p>
              <p>
                If that sounds useful, let us know. We are still small enough
                to onboard you ourselves.
              </p>
              <div className="story-signature">
                <Image src="/portrait-signature.jpg" width={48} height={48} alt="Nick Campbell" />
                <div>
                  <div className="sname">Nick Campbell</div>
                  <div className="srole">Co-Founder · CEO</div>
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

      <section className="about-market">
        <div className="wrap">
          <div className="market-head reveal">
            <span className="eyebrow">Why now</span>
            <h2>A quiet, expensive problem.</h2>
            <p>
              The referral handoff is one of the last parts of dentistry that
              still runs on paper and phone calls. The cost lands on
              patients, on partnerships, and on practices.
            </p>
          </div>
          <div className="market-grid">
            <div className="market-stat reveal">
              <div className="num">
                <MarketStat target={30} suffix="%" />
              </div>
              <h4>of referrals never reach treatment</h4>
              <p>Patients drop off between the GP and the specialist, often without either side knowing.</p>
            </div>
            <div className="market-stat alt reveal" style={{ transitionDelay: ".1s" }}>
              <div className="num">
                <MarketStat prefix="<" target={2} start={50} suffix="%" />
              </div>
              <h4>of practices use a dedicated referral tool</h4>
              <p>The category exists for medical referrals. In dentistry it is still wide open.</p>
            </div>
            <div className="market-stat alt2 reveal" style={{ transitionDelay: ".2s" }}>
              <div className="num">
                <MarketStat text="Days" />
              </div>
              <h4>not minutes, to close the loop</h4>
              <p>Outcome reports travel back by fax or phone, when they travel back at all.</p>
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
          <DcMap />
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
