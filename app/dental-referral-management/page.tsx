import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import CtaBand from "@/components/home/CtaBand";
import BookCallButton from "@/components/BookCallButton";
import Breadcrumbs from "@/components/Breadcrumbs";
import FaqAccordion from "@/components/FaqAccordion";
import { ArrowRight, Check, Plus } from "@/components/icons";
import type { Faq } from "@/lib/faqs";
import { SIGNUP_URL } from "@/lib/urls";

/**
 * Pillar page for the "dental referral management" query family (how AI
 * answer engines and searchers phrase the category). Every CaseLink claim
 * here restates a fact already on the site (lib/faqs.ts, pricing, security).
 * No competitor names, no invented metrics.
 */

const SITE = "https://www.caselink.net";
const PATH = "/dental-referral-management";
const DESCRIPTION =
  "CaseLink is HIPAA-compliant dental referral management software where general dentists and specialists refer to each other. Send digital referrals with x-rays attached, track every case, and get outcome reports back. Free for GPs.";

export const metadata: Metadata = {
  title: "Dental Referral Management Software for Dentists and Specialists",
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: {
    title: "Dental Referral Management Software · CaseLink",
    description: DESCRIPTION,
    url: `${SITE}${PATH}`,
    type: "website",
  },
};

const faqs: Faq[] = [
  {
    q: "What is dental referral management software?",
    a: "Dental referral management software replaces fax, phone calls, and paper referral slips with one secure system for sending, receiving, and tracking referrals between dental practices. The referring dentist sends the case with x-rays and notes attached, the specialist receives it in an inbox, and both offices see the status and the outcome.",
  },
  {
    q: "Can general dentists and specialists refer to each other on CaseLink?",
    a: "Yes. CaseLink is built for both sides of the referral. General dentists send cases to specialists, specialists accept them and send outcome reports back, and both offices see the same timestamped status. If a practice you work with is not on CaseLink yet, you can invite them from the referral screen in under a minute.",
  },
  {
    q: "How much does dental referral management software cost?",
    a: "On CaseLink, general dentists use the platform for free with unlimited referrals. The specialist plan is $299 per month, or $269 per month on yearly billing, with the first month free. DSO and multi-location pricing is custom. There is no setup fee and no contract on the GP or specialist plans.",
    guide: "free-dental-referral-software-for-general-dentists",
  },
  {
    q: "Is CaseLink HIPAA compliant?",
    a: "Yes. Every referral, message, and file is encrypted in transit and at rest, with audit logs on every action, role-based access controls, and automatic session timeouts. CaseLink signs a Business Associate Agreement on signup with every practice.",
  },
  {
    q: "Does CaseLink work with Dentrix, Eaglesoft, or Open Dental?",
    a: "CaseLink runs in the browser alongside Dentrix, Eaglesoft, Open Dental, and other practice management systems. Scheduling, charting, and billing stay where they are. There is no data-level integration today, and a scheduling integration is on the way.",
  },
  {
    q: "Can CaseLink replace paper referral pads and faxed referrals?",
    a: "Yes. Instead of a paper slip the patient carries or a fax the specialist may never confirm, the referral goes to the specialist with the clinical context attached, and both offices can see when it was received, when the patient was contacted, and when the consult was scheduled.",
    guide: "paperless-dental-referrals",
  },
  {
    q: "Does CaseLink work for DSOs and dental groups?",
    a: "Yes. The DSO and multi-location plan adds team permissions, multi-location analytics, API access, and a dedicated success manager, with custom pricing on an annual contract.",
  },
];

const serviceLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "CaseLink dental referral management",
  alternateName: [
    "Dental referral management software",
    "Dental referral platform",
    "Dentist to specialist referral network",
  ],
  serviceType: "Dental referral management software",
  description: DESCRIPTION,
  url: `${SITE}${PATH}`,
  areaServed: { "@type": "Country", name: "United States" },
  audience: {
    "@type": "Audience",
    audienceType: "General dentists, dental specialists, office managers, and DSOs",
  },
  provider: { "@type": "Organization", name: "CaseLink, Inc.", url: SITE },
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "USD",
    lowPrice: "0",
    highPrice: "299",
    url: `${SITE}/pricing`,
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

const covers = [
  "Sending the referral with x-rays, notes, and insurance attached",
  "Confirming the specialist received it",
  "Reaching the patient and booking the consult",
  "Tracking consult and treatment status in both offices",
  "Reporting the outcome back to the referring dentist",
  "Knowing which relationships send and complete the most cases",
];

const paperGaps = [
  "No confirmation that a faxed referral arrived",
  "Radiographs sent separately, or not at all",
  "The patient carries a paper slip and may never call",
  "Status checks take a phone call between offices",
  "Outcome reports take days to come back",
  "No record of where referrals come from",
];

export default function DentalReferralManagementPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <Breadcrumbs trail={[{ name: "Dental referral management", path: PATH }]} />

      {/* HERO */}
      <section className="geo-hero geo-hero--flow">
        <div className="geo-hero-bg" aria-hidden="true" />
        <div className="wrap geo-hero-inner">
          <span className="eyebrow">Dental referral management</span>
          <h1>
            Dental referral management for{" "}
            <span className="cl-landing">dentists and specialists.</span>
          </h1>
          <p className="lead">
            CaseLink is a HIPAA-compliant dental referral management platform
            where general dentists and specialists refer to each other. Every
            referral, x-ray, message, and outcome report lives in one shared
            case record that both offices can see.
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
              Free for general dentists
            </li>
            <li>
              <Check width={13} height={13} />
              BAA signed on signup
            </li>
            <li>
              <Check width={13} height={13} />
              Works alongside your PMS
            </li>
          </ul>
        </div>
      </section>

      {/* WHAT IT COVERS */}
      <section className="geo-why cl-bg-icefield">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">The category</span>
            <h2>What referral management covers.</h2>
            <p>
              A dental referral is a handoff between two offices and a patient.
              Referral management is everything that has to happen for that
              handoff to end in treatment, and for both offices to know it did.
            </p>
          </div>
          <div className="spec-lists">
            <div className="spec-list-card">
              <h3>Referral management covers</h3>
              <ul>
                {covers.map((r) => (
                  <li key={r}>
                    <Check width={14} height={14} />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
            <div className="spec-list-card is-gap">
              <h3>Where fax and paper slips fall short</h3>
              <ul>
                {paperGaps.map((r) => (
                  <li key={r}>
                    <Plus width={14} height={14} />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* HOW CASELINK HANDLES IT */}
      <section className="geo-steps-sec spec-how cl-bg-icemesh">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">How CaseLink works</span>
            <h2>Referral tracking from send to outcome.</h2>
          </div>
          <div className="geo-grid">
            <div className="geo-card geo-card--glass">
              <span className="geo-card-ic" aria-hidden="true">
                <Image src="/ds/icons/caselink-send-referral.svg" alt="" width={52} height={52} />
              </span>
              <h3>Send in under three minutes</h3>
              <p>
                The referring office attaches patient details, x-rays,
                insurance, and treatment notes. The specialist receives the
                case with the clinical context already in place.
              </p>
            </div>
            <div className="geo-card geo-card--glass">
              <span className="geo-card-ic" aria-hidden="true">
                <Image src="/ds/icons/caselink-referral-status.svg" alt="" width={52} height={52} />
              </span>
              <h3>One status, both offices</h3>
              <p>
                Received, patient notified, consult scheduled, and treatment
                accepted are timestamped and visible to the sending and the
                receiving office.
              </p>
            </div>
            <div className="geo-card geo-card--glass">
              <span className="geo-card-ic" aria-hidden="true">
                <Image src="/ds/icons/caselink-notifications.svg" alt="" width={52} height={52} />
              </span>
              <h3>Unbooked cases surface</h3>
              <p>
                If a patient has not booked inside the follow-up window, the
                case surfaces for outreach, so the referral ends with a
                recorded outcome.
              </p>
            </div>
            <div className="geo-card geo-card--glass">
              <span className="geo-card-ic" aria-hidden="true">
                <Image src="/ds/icons/caselink-messaging.svg" alt="" width={52} height={52} />
              </span>
              <h3>Encrypted messaging</h3>
              <p>
                Offices message each other inside the case, organized by
                patient and by practice, instead of trading phone calls.
              </p>
            </div>
            <div className="geo-card geo-card--glass">
              <span className="geo-card-ic" aria-hidden="true">
                <Image src="/ds/icons/caselink-post-op-report.svg" alt="" width={52} height={52} />
              </span>
              <h3>Outcome reports back</h3>
              <p>
                Treatment notes and reports return to the referring dentist in
                the same case record, in minutes instead of days.
              </p>
            </div>
            <div className="geo-card geo-card--glass">
              <span className="geo-card-ic" aria-hidden="true">
                <Image src="/ds/icons/caselink-reports.svg" alt="" width={52} height={52} />
              </span>
              <h3>Referral source analytics</h3>
              <p>
                Specialists see referral volume, source attribution, and
                completion by referring practice over any time period.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WHO IT IS FOR */}
      <section className="geo-why">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">Who it is for</span>
            <h2>A referral network for every practice.</h2>
          </div>
          <div className="spec-hub-grid">
            <Link href="/referral-software/general-dentists" className="geo-card spec-hub-card spec-hub-gp">
              <span className="eyebrow">General dentists</span>
              <h3>Free referral software for GPs</h3>
              <p>
                Send unlimited referrals, share records, and see where every
                patient you refer stands. Free, with no credit card.
              </p>
              <span className="spec-hub-more">
                Learn more
                <ArrowRight width={13} height={13} />
              </span>
            </Link>
            <Link href="/referral-software" className="geo-card spec-hub-card">
              <span className="eyebrow">Specialists</span>
              <h3>Referral software for specialists</h3>
              <p>
                One inbox for incoming cases across endodontics, orthodontics,
                periodontics, oral surgery, and prosthodontics.
              </p>
              <span className="spec-hub-more">
                Learn more
                <ArrowRight width={13} height={13} />
              </span>
            </Link>
            <Link href="/referral-software/dso" className="geo-card spec-hub-card">
              <span className="eyebrow">DSOs and groups</span>
              <h3>Referral management for DSOs</h3>
              <p>
                Team permissions, multi-location analytics, API access, and a
                dedicated success manager.
              </p>
              <span className="spec-hub-more">
                Learn more
                <ArrowRight width={13} height={13} />
              </span>
            </Link>
          </div>
          <p className="geo-steps-more">
            <Link href="/resources/how-to-choose-dental-referral-software">
              Comparing options? Read how to choose dental referral software
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
            <h2>Referral management questions.</h2>
            <p>
              More answers on setup, security, and workflow live on the{" "}
              <Link href="/faqs">FAQ page</Link>.
            </p>
          </div>
          <FaqAccordion faqs={faqs} />
        </div>
      </section>

      <CtaBand
        title={<>Manage every referral<br />in one shared record.</>}
        body="Free for general dentists. Specialists get one month free. No setup fee, no contract."
        primary={{ href: SIGNUP_URL, label: "Get started free", external: true }}
        secondary={{ href: "/pricing", label: "See pricing" }}
      />
    </>
  );
}
