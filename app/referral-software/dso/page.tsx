import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import CtaBand from "@/components/home/CtaBand";
import BookCallButton from "@/components/BookCallButton";
import Breadcrumbs from "@/components/Breadcrumbs";
import FaqAccordion from "@/components/FaqAccordion";
import { ArrowRight, Check } from "@/components/icons";
import type { Faq } from "@/lib/faqs";

/**
 * DSO and multi-location landing page. Static route, so it takes precedence
 * over /referral-software/[specialty]. Plan details restate the DSO plan in
 * components/home/Pricing.tsx and lib/faqs.ts only: team permissions,
 * multi-location analytics, API access, dedicated success manager, custom
 * pricing on an annual contract. Do not add DSO features beyond those.
 */

const SITE = "https://www.caselink.net";
const PATH = "/referral-software/dso";
const DESCRIPTION =
  "HIPAA-compliant referral management for DSOs and multi-location dental groups. One referral workflow across every location, with team permissions, multi-location analytics, API access, and a dedicated success manager.";

export const metadata: Metadata = {
  title: "Referral Management for DSOs and Dental Groups",
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: {
    title: "Referral Management for DSOs and Dental Groups · CaseLink",
    description: DESCRIPTION,
    url: `${SITE}${PATH}`,
    type: "website",
  },
};

const faqs: Faq[] = [
  {
    q: "What does the DSO and multi-location plan include?",
    a: "Team permissions, multi-location analytics, API access, and a dedicated success manager. Every plan also includes HIPAA compliance, a Business Associate Agreement on signup, and unlimited case storage.",
  },
  {
    q: "How is DSO pricing set?",
    a: "DSO and multi-location pricing is custom, on an annual contract. Book a call and we will scope it around your locations and referral volume.",
  },
  {
    q: "Can front desk teams at each location run CaseLink?",
    a: "Yes. CaseLink is built for the full front office. Staff can create and accept referrals, message other offices, and track status without the dentist in the administrative steps.",
  },
  {
    q: "Does CaseLink replace our practice management system?",
    a: "No. CaseLink works alongside Dentrix, Eaglesoft, Open Dental, and others. Scheduling, charting, and billing stay where they are. CaseLink handles the referral and the communication between offices.",
  },
  {
    q: "Where is CaseLink data stored?",
    a: "Data processed by CaseLink is stored in the United States. The current list of subprocessors with access to patient information is published at caselink.net/subprocessors.",
  },
];

const serviceLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "CaseLink referral management for DSOs",
  serviceType: "DSO referral management software",
  description: DESCRIPTION,
  url: `${SITE}${PATH}`,
  audience: {
    "@type": "Audience",
    audienceType: "Dental service organizations and multi-location dental groups",
  },
  provider: { "@type": "Organization", name: "CaseLink, Inc.", url: SITE },
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

const groupNeeds = [
  "The same referral workflow at every location",
  "Clear permissions for each role and office",
  "Referral reporting across locations, not one office at a time",
  "A Business Associate Agreement and audit logs on every action",
  "A tool that runs alongside the PMS each office already uses",
];

const included = [
  "Team permissions",
  "Multi-location analytics",
  "API access",
  "A dedicated success manager",
  "HIPAA compliance and a BAA on signup",
  "Unlimited case storage",
];

export default function DsoPage() {
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
          { name: "DSOs and groups", path: PATH },
        ]}
      />

      {/* HERO */}
      <section className="geo-hero">
        <div className="geo-hero-bg" aria-hidden="true" />
        <div className="wrap geo-hero-inner">
          <span className="eyebrow">DSOs and dental groups</span>
          <h1>
            Referral management for{" "}
            <span className="cl-landing">DSOs and dental groups.</span>
          </h1>
          <p className="lead">
            When every location handles referrals its own way, nobody can see
            the whole picture. CaseLink gives a group one referral workflow,
            with team permissions and analytics across every location.
          </p>
          <div className="geo-hero-cta">
            <BookCallButton className="cl-btn cl-btn--lg">
              Book a call
              <ArrowRight width={14} height={14} />
            </BookCallButton>
            <Link href="/contact" className="cl-btn cl-btn--secondary cl-btn--lg">
              Talk to sales
            </Link>
          </div>
          <ul className="geo-hero-proof">
            <li>
              <Check width={13} height={13} />
              Custom annual plans
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

      {/* NEEDS + INCLUDED */}
      {/* Ice field, not Glacier: the hero is already Glacier, so the two
          ran together as one block with a hard seam where the second
          restarted the gradient at its darkest stop. */}
      <section className="geo-why cl-bg-icefield">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">Multi-location referrals</span>
            <h2>One referral workflow across every location.</h2>
            <p>
              A dental group sends referrals from many front desks to many
              specialists. Fax logs and spreadsheets at each office make it
              hard to know which cases were completed and which were lost.
            </p>
          </div>
          <div className="spec-lists">
            <div className="spec-list-card">
              <h3>What groups need from referral management</h3>
              <ul>
                {groupNeeds.map((r) => (
                  <li key={r}>
                    <Check width={14} height={14} />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
            <div className="spec-list-card">
              <h3>Included in the DSO plan</h3>
              <ul>
                {included.map((r) => (
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

      {/* HOW */}
      <section className="geo-steps-sec spec-how cl-on-dark geo-sec--dark">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">How CaseLink helps</span>
            <h2>Built for groups, simple at the front desk.</h2>
          </div>
          <div className="geo-grid">
            <div className="geo-card geo-card--dark">
              <span className="geo-card-ic" aria-hidden="true">
                <Image src="/ds/icons/caselink-access-control.svg" alt="" width={52} height={52} />
              </span>
              <h3>Team permissions</h3>
              <p>
                Role-based access controls decide who can see and act on each
                case, with automatic session timeouts and audit logs on every
                action.
              </p>
            </div>
            <div className="geo-card geo-card--dark">
              <span className="geo-card-ic" aria-hidden="true">
                <Image src="/ds/icons/caselink-multi-location.svg" alt="" width={52} height={52} />
              </span>
              <h3>Multi-location analytics</h3>
              <p>
                Referral volume, source attribution, and completion by
                referring practice, reported across every location in the
                group.
              </p>
            </div>
            <div className="geo-card geo-card--dark">
              <span className="geo-card-ic" aria-hidden="true">
                <Image src="/ds/icons/caselink-integrations.svg" alt="" width={52} height={52} />
              </span>
              <h3>API access</h3>
              <p>
                The DSO plan includes API access. Your success manager can walk
                your team through what it covers during scoping.
              </p>
            </div>
          </div>
          <p className="geo-steps-more">
            <Link href="/dental-referral-management">
              How dental referral management works on CaseLink
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
            <h2>Questions from DSOs and groups.</h2>
          </div>
          <FaqAccordion faqs={faqs} />
          <nav className="spec-others" aria-label="Other pages">
            <span>Also for</span>
            <Link href="/referral-software/general-dentists">General dentists</Link>
            <Link href="/referral-software">Specialists</Link>
          </nav>
        </div>
      </section>

      <CtaBand
        title={<>One referral network<br />for every location.</>}
        body="Custom pricing on an annual contract, with a dedicated success manager from day one."
        primary={{ href: "/contact", label: "Talk to sales" }}
        secondary={{ href: "/pricing", label: "See pricing" }}
      />
    </>
  );
}
