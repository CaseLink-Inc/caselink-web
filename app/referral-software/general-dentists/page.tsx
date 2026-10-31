import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import CtaBand from "@/components/home/CtaBand";
import BookCallButton from "@/components/BookCallButton";
import Breadcrumbs from "@/components/Breadcrumbs";
import FaqAccordion from "@/components/FaqAccordion";
import { ArrowRight, Check } from "@/components/icons";
import type { Faq } from "@/lib/faqs";
import { specialties } from "@/lib/specialties";
import { SIGNUP_URL } from "@/lib/urls";

/**
 * General dentist landing page. Static route, so it takes precedence over
 * /referral-software/[specialty]. The GP plan is "free", never "permanently
 * free" (see CLAUDE.md). "What a complete referral includes" is general
 * guidance for the referring office, not a CaseLink feature list.
 */

const SITE = "https://www.caselink.net";
const PATH = "/referral-software/general-dentists";
const DESCRIPTION =
  "Free dental referral software for general dentists. Send referrals to any specialist with x-rays and notes attached, track every patient you refer, and get outcome reports back. HIPAA compliant, BAA on signup.";

export const metadata: Metadata = {
  title: "Free Dental Referral Software for General Dentists",
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: {
    title: "Free Dental Referral Software for General Dentists · CaseLink",
    description: DESCRIPTION,
    url: `${SITE}${PATH}`,
    type: "website",
  },
};

const faqs: Faq[] = [
  {
    q: "Is CaseLink really free for general dentists?",
    a: "Yes. The GP plan is free, with no trial period and no credit card. It includes unlimited referrals, secure file sharing, encrypted messaging, and real-time updates.",
    guide: "free-dental-referral-software-for-general-dentists",
  },
  {
    q: "What if the specialist I refer to is not on CaseLink yet?",
    a: "Invite them from the referral screen. The invitation takes under a minute. They get an email, create an account, and can accept your referral right away.",
  },
  {
    q: "Can I see whether my patient booked with the specialist?",
    a: "Yes. Received, patient notified, consult scheduled, and treatment accepted are timestamped and visible to your office. If a patient has not booked inside the follow-up window, the case surfaces for outreach.",
    guide: "how-to-stop-losing-dental-referrals",
  },
  {
    q: "How long does setup take?",
    a: "Under 30 minutes from account creation to first referral. CaseLink runs in the browser, so there is nothing to install. Sending a referral takes under three minutes.",
  },
  {
    q: "Does CaseLink replace my practice management system?",
    a: "No. CaseLink works alongside Dentrix, Eaglesoft, Open Dental, and others. Scheduling, charting, and billing stay where they are. CaseLink handles the referral and the communication between offices.",
  },
  {
    q: "Is CaseLink HIPAA compliant?",
    a: "Yes. Every referral, message, and file is encrypted in transit and at rest, with audit logs on every action and role-based access controls. CaseLink signs a Business Associate Agreement on signup with every practice.",
  },
];

const serviceLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "CaseLink referral software for general dentists",
  serviceType: "Dental referral management software",
  description: DESCRIPTION,
  url: `${SITE}${PATH}`,
  audience: { "@type": "Audience", audienceType: "General dentists" },
  provider: { "@type": "Organization", name: "CaseLink, Inc.", url: SITE },
  offers: {
    "@type": "Offer",
    name: "General dentist plan",
    price: "0",
    priceCurrency: "USD",
    url: `${SITE}/pricing`,
    description: "Unlimited referrals, secure file sharing, encrypted messaging, real-time updates.",
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

const gpCan = [
  "Send unlimited referrals to any specialist",
  "Attach x-rays, insurance details, and treatment notes",
  "See when the case is received and the consult is scheduled",
  "Message the specialist's office inside the case",
  "Receive outcome reports and treatment notes back",
  "Invite the specialists you already refer to",
];

const goodReferral = [
  "The reason for referral and the teeth involved",
  "Recent radiographs and any photos already taken",
  "Medical history and current medications",
  "Insurance details and the patient's contact information",
  "How urgent the case is",
  "What your office plans to do after the specialist visit",
];

export default function GeneralDentistsPage() {
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
      <Breadcrumbs
        trail={[
          { name: "Referral software", path: "/referral-software" },
          { name: "General dentists", path: PATH },
        ]}
      />

      {/* HERO */}
      <section className="geo-hero">
        <div className="geo-hero-bg" aria-hidden="true" />
        <div className="wrap geo-hero-inner">
          <span className="eyebrow">General dentists</span>
          <h1>
            Free referral software for{" "}
            <span className="cl-landing">general dentists.</span>
          </h1>
          <p className="lead">
            Send referrals to specialists with the clinical context attached,
            and see where every patient you refer stands. CaseLink is free for
            general dentists, with unlimited referrals and no credit card.
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
              Free, no credit card
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

      {/* WHAT GPs DO + WHAT TO SEND */}
      <section className="geo-why cl-bg-icefield">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">Sending referrals</span>
            <h2>Every referral you send, tracked.</h2>
            <p>
              Once a paper slip or a fax leaves your office, you usually do not
              hear about the patient again until someone calls. On CaseLink the
              referral stays visible to your team from the moment you send it
              to the outcome report.
            </p>
          </div>
          <div className="spec-lists">
            <div className="spec-list-card">
              <h3>What general dentists do on CaseLink</h3>
              <ul>
                {gpCan.map((r) => (
                  <li key={r}>
                    <Check width={14} height={14} />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
            <div className="spec-list-card">
              <h3>What a complete referral includes</h3>
              <ul>
                {goodReferral.map((r) => (
                  <li key={r}>
                    <Check width={14} height={14} />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* HOW CASELINK HELPS */}
      <section className="geo-steps-sec spec-how cl-bg-icemesh">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">How CaseLink helps</span>
            <h2>Send in minutes, follow every case.</h2>
          </div>
          <div className="geo-grid">
            <div className="geo-card geo-card--glass">
              <span className="geo-card-ic" aria-hidden="true">
                <Image src="/ds/icons/caselink-finance.svg" alt="" width={52} height={52} />
              </span>
              <h3>Free for your office</h3>
              <p>
                The GP plan is free, with unlimited referrals, secure file
                sharing, encrypted messaging, and real-time updates. No setup
                fee and no contract.
              </p>
            </div>
            <div className="geo-card geo-card--glass">
              <span className="geo-card-ic" aria-hidden="true">
                <Image src="/ds/icons/caselink-referral-status.svg" alt="" width={52} height={52} />
              </span>
              <h3>See where each patient stands</h3>
              <p>
                Received, patient notified, consult scheduled, treatment
                accepted. Every step is timestamped, so nobody has to call the
                specialist to ask.
              </p>
            </div>
            <div className="geo-card geo-card--glass">
              <span className="geo-card-ic" aria-hidden="true">
                <Image src="/ds/icons/caselink-notifications.svg" alt="" width={52} height={52} />
              </span>
              <h3>Patients do not slip away</h3>
              <p>
                If a patient has not booked inside the follow-up window, the
                case surfaces for outreach, and the referral ends with a
                recorded outcome.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="geo-faq" aria-label="Frequently asked questions">
        <div className="wrap geo-faq-inner">
          <div className="section-head">
            <span className="eyebrow">FAQ</span>
            <h2>Questions from general dentists.</h2>
          </div>
          <FaqAccordion faqs={faqs} />
          <nav className="spec-others" aria-label="Specialties you can refer to">
            <span>Refer to</span>
            {specialties.map((s) => (
              <Link key={s.slug} href={`/referral-software/${s.slug}`}>
                {s.field}
              </Link>
            ))}
            <Link href="/dental-referral-management">Referral management</Link>
          </nav>
        </div>
      </section>

      <CtaBand
        title={<>Send your first referral<br />free today.</>}
        body="Free for general dentists, with unlimited referrals. No credit card, no setup fee, no contract."
        primary={{ href: SIGNUP_URL, label: "Get started free", external: true }}
        secondary={{ href: "/pricing", label: "See pricing" }}
      />
    </>
  );
}
