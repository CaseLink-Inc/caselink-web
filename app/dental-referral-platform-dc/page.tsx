import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Network from "@/components/home/Network";
import CtaBand from "@/components/home/CtaBand";
import BookCallButton from "@/components/BookCallButton";
import FaqAccordion from "@/components/FaqAccordion";
import { ArrowRight, Check } from "@/components/icons";
import { SIGNUP_URL } from "@/lib/urls";
import Breadcrumbs from "@/components/Breadcrumbs";

const SITE = "https://www.caselink.net";
const PAGE_URL = `${SITE}/dental-referral-platform-dc`;
const DESCRIPTION =
  "CaseLink is the dental referral platform built in Washington, DC. General dentists and specialists across the DMV send, track, and close referrals in one HIPAA-compliant workspace. Free for GPs.";

export const metadata: Metadata = {
  title: "Dental Referral Platform in Washington, DC",
  description: DESCRIPTION,
  alternates: { canonical: "/dental-referral-platform-dc" },
  openGraph: {
    title: "Dental Referral Platform in Washington, DC | CaseLink",
    description: DESCRIPTION,
    url: PAGE_URL,
    type: "website",
  },
};

const faqs = [
  {
    q: "Is CaseLink available in my area?",
    a: "CaseLink is built in Washington, DC and runs live across the DMV: the District, Northern Virginia, and the Maryland suburbs. The platform itself works anywhere in the US, and the founding network is concentrated in the DC metro area, which means local GPs and specialists are already on it.",
  },
  {
    q: "Is CaseLink really free for general dentists?",
    a: "Yes. The GP plan is free, with no trial period and no credit card. It includes unlimited referrals, secure messaging, file sharing, and real-time status tracking. Specialists pay $299 a month, with 10 percent off annual billing.",
  },
  {
    q: "Does CaseLink replace my practice management system?",
    a: "No. CaseLink works alongside Dentrix, Eaglesoft, Open Dental, and others. Scheduling, charting, and billing stay where they are. CaseLink handles the referral and the communication between offices.",
  },
  {
    q: "Is CaseLink HIPAA compliant?",
    a: "Yes. Every referral, message, and file is encrypted in transit and at rest, with audit logs on every action and role-based access controls. CaseLink signs a Business Associate Agreement on signup with every practice.",
  },
  {
    q: "How do I get the specialists I refer to on CaseLink?",
    a: "Invite them from the referral screen. They get an email, create an account, and can accept your referral in minutes. Many DMV specialists are already in the network, and early practices get founding member pricing and hands-on onboarding.",
  },
];

const serviceLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "CaseLink dental referral platform",
  serviceType: "Dental referral and case collaboration software",
  description: DESCRIPTION,
  url: PAGE_URL,
  areaServed: [
    { "@type": "City", name: "Washington" },
    { "@type": "State", name: "Virginia" },
    { "@type": "State", name: "Maryland" },
  ],
  provider: {
    "@type": "Organization",
    name: "CaseLink, Inc.",
    url: SITE,
    address: {
      "@type": "PostalAddress",
      streetAddress: "124 S Wise St",
      addressLocality: "Arlington",
      addressRegion: "VA",
      postalCode: "22204",
      addressCountry: "US",
    },
  },
  offers: {
    "@type": "AggregateOffer",
    lowPrice: "0",
    highPrice: "299",
    priceCurrency: "USD",
    offerCount: "2",
  },
};

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function DcLandingPage() {
  return (
    <>
      <Breadcrumbs trail={[{ name: "Dental referral platform in Washington, DC", path: "/dental-referral-platform-dc" }]} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />

      {/* HERO */}
      <section className="geo-hero">
        <div className="geo-hero-bg" aria-hidden="true" />
        <div className="wrap geo-hero-inner">
          <span className="eyebrow">Washington, DC metro</span>
          <h1>
            The dental referral platform
            <br />
            <span className="cl-landing">built in DC, for the DMV.</span>
          </h1>
          <p className="lead">
            CaseLink replaces fax and phone-tag referrals with one shared,
            HIPAA-compliant workspace. General dentists and specialists across
            the District, Northern Virginia, and the Maryland suburbs send
            cases, share records, and track every outcome together.
          </p>
          <div className="geo-hero-cta">
            <a
              href={SIGNUP_URL}
              className="cl-btn cl-btn--lg"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get started free
              <ArrowRight width={14} height={14} />
            </a>
            <BookCallButton className="cl-btn cl-btn--secondary cl-btn--lg">
              Book a 15 minute walkthrough
            </BookCallButton>
          </div>
          <ul className="geo-hero-proof">
            <li>
              <Check width={13} height={13} />
              12 practices live in the DMV
            </li>
            <li>
              <Check width={13} height={13} />
              Free for general dentists
            </li>
            <li>
              <Check width={13} height={13} />
              HIPAA compliant by design
            </li>
          </ul>
        </div>
      </section>

      {/* WHY DMV PRACTICES */}
      <section className="geo-why cl-bg-seaglass">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">Why CaseLink here</span>
            <h2>Local network, local team.</h2>
            <p>
              Most referral software is built far from the practices that use
              it. CaseLink started in DC operatories and grows one DMV
              relationship at a time.
            </p>
          </div>
          <div className="geo-grid">
            <div className="geo-card">
              <span className="geo-card-ic" aria-hidden="true">
                <Image src="/ds/icons/caselink-care-team.svg" alt="" width={52} height={52} />
              </span>
              <h3>The network is already here</h3>
              <p>
                Founding practices across the District and the close-in suburbs
                are live today. When you join, the GPs and specialists you
                already work with are a referral away, not a cold start.
              </p>
            </div>
            <div className="geo-card">
              <span className="geo-card-ic" aria-hidden="true">
                <Image src="/ds/icons/caselink-location.svg" alt="" width={52} height={52} />
              </span>
              <h3>Built alongside DC pilots</h3>
              <p>
                CaseLink is headquartered in Arlington and built with direct
                feedback from DMV pilot practices. Feature requests come from
                the same offices the platform serves.
              </p>
            </div>
            <div className="geo-card">
              <span className="geo-card-ic" aria-hidden="true">
                <Image src="/ds/icons/caselink-practice.svg" alt="" width={52} height={52} />
              </span>
              <h3>Founding member terms</h3>
              <p>
                Early DMV practices get founding member pricing, hands-on
                onboarding, and a direct line to the team. The GP side is free
                for everyone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* LIVE NETWORK MAP */}
      <Network />

      {/* HOW IT WORKS SUMMARY */}
      {/* Ice fade, not Glacier: the hero is Glacier, and a page should not
          open and close on the same ground. Ice fade settles white into a
          mint whisper and then powder, which gives the white step cards a
          cleaner surface than Glacier's blue top. */}
      <section className="geo-steps-sec cl-bg-icefade">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">How it works</span>
            <h2>Three steps, one shared record.</h2>
          </div>
          <ol className="geo-steps">
            <li>
              <span className="geo-step-n">
                <b>1</b>
                <ArrowRight className="geo-step-arrow" width={17} height={17} aria-hidden="true" />
              </span>
              <h3>Send the case</h3>
              <p>
                Create a referral with the clinical reason, images, and notes
                attached, and pick the specialist from the directory. Under
                three minutes.
              </p>
            </li>
            <li>
              <span className="geo-step-n">
                <b>2</b>
                <ArrowRight className="geo-step-arrow" width={17} height={17} aria-hidden="true" />
              </span>
              <h3>Both offices see the same status</h3>
              <p>
                Received, patient notified, consult scheduled, treatment
                accepted. Every step is timestamped and visible to both sides,
                so nobody calls to ask.
              </p>
            </li>
            <li>
              <span className="geo-step-n">
                <b>3</b>
                <ArrowRight className="geo-step-arrow" width={17} height={17} aria-hidden="true" />
              </span>
              <h3>Close the loop</h3>
              <p>
                If a patient has not booked inside the follow-up window, the
                case surfaces for outreach. The referral ends with an outcome,
                not a question mark.
              </p>
            </li>
          </ol>
          <p className="geo-steps-more">
            <Link href="/#intro-video">
              See the full product tour
              <ArrowRight width={13} height={13} />
            </Link>
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="geo-faq" aria-label="Frequently asked questions">
        <div className="wrap geo-faq-inner">
          <div className="section-head">
            <span className="eyebrow">FAQ</span>
            <h2>Common questions from DMV practices.</h2>
          </div>
          {/* This page had its own copy of the accordion markup, so it
              missed both fixes the shared component carries: the `name`
              that makes the group exclusive (without it every answer the
              visitor opened stayed open and the list kept growing) and the
              "Read the guide" link under answers that have one. */}
          <FaqAccordion faqs={faqs} name="caselink-faq-dc" />
        </div>
      </section>

      <CtaBand
        title={<>Join the DMV referral network.</>}
        body="Free for general dentists. One recovered referral usually covers the specialist subscription for months."
        primary={{ href: SIGNUP_URL, label: "Get started free", external: true }}
        secondary={{ href: "/contact", label: "Talk to us" }}
      />
    </>
  );
}
