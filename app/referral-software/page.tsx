import type { Metadata } from "next";
import Link from "next/link";
import CtaBand from "@/components/home/CtaBand";
import Breadcrumbs from "@/components/Breadcrumbs";
import { ArrowRight } from "@/components/icons";
import { specialties } from "@/lib/specialties";
import { SIGNUP_URL } from "@/lib/urls";

const SITE = "https://www.caselink.net";
const DESCRIPTION =
  "HIPAA-compliant dental referral software and referral management for every specialty: endodontists, orthodontists, periodontists, oral surgeons, and prosthodontists, plus general dentists and DSOs. Free for referring general dentists.";

export const metadata: Metadata = {
  title: "Dental Referral Software for Specialists",
  description: DESCRIPTION,
  alternates: { canonical: "/referral-software" },
  openGraph: {
    title: "Dental Referral Software for Specialists · CaseLink",
    description: DESCRIPTION,
    url: `${SITE}/referral-software`,
    type: "website",
  },
};

const listLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "CaseLink referral software by specialty",
  itemListElement: [
    ...specialties.map((s) => ({ name: s.metaTitle, path: `/referral-software/${s.slug}` })),
    { name: "Free Dental Referral Software for General Dentists", path: "/referral-software/general-dentists" },
    { name: "Referral Management for DSOs and Dental Groups", path: "/referral-software/dso" },
  ].map((item, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: item.name,
    url: `${SITE}${item.path}`,
  })),
};

export default function ReferralSoftwareHub() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listLd) }}
      />
      <Breadcrumbs trail={[{ name: "Referral software", path: "/referral-software" }]} />

      <section className="geo-hero">
        <div className="geo-hero-bg" aria-hidden="true" />
        <div className="wrap geo-hero-inner">
          <span className="eyebrow">For specialists</span>
          <h1>Dental referral software for every specialty.</h1>
          <p className="lead">
            Each specialty receives referrals differently. CaseLink gives every
            specialist practice one inbox for incoming cases, a status both
            offices can see, and reporting on where referrals come from. The
            general dentists who refer to you use it for free.
          </p>
        </div>
      </section>

      <section className="geo-why">
        <div className="wrap">
          <div className="spec-hub-grid">
            {specialties.map((s) => (
              <Link key={s.slug} href={`/referral-software/${s.slug}`} className="geo-card spec-hub-card">
                <span className="eyebrow">{s.field}</span>
                <h2>{s.metaTitle}</h2>
                <p>{s.lead}</p>
                <span className="spec-hub-more">
                  Learn more
                  <ArrowRight width={13} height={13} />
                </span>
              </Link>
            ))}
            <Link href="/referral-software/general-dentists" className="geo-card spec-hub-card spec-hub-gp">
              <span className="eyebrow">General dentists</span>
              <h2>Free for general dentists</h2>
              <p>
                GPs send unlimited referrals, share records, and track every
                case for free, with no trial period and no credit card.
              </p>
              <span className="spec-hub-more">
                Learn more
                <ArrowRight width={13} height={13} />
              </span>
            </Link>
            <Link href="/referral-software/dso" className="geo-card spec-hub-card">
              <span className="eyebrow">DSOs and groups</span>
              <h2>Referral management for DSOs</h2>
              <p>
                One referral workflow across every location, with team
                permissions, multi-location analytics, and API access.
              </p>
              <span className="spec-hub-more">
                Learn more
                <ArrowRight width={13} height={13} />
              </span>
            </Link>
            <Link href="/dental-referral-management" className="geo-card spec-hub-card spec-hub-gp">
              <span className="eyebrow">Overview</span>
              <h2>How referral management works</h2>
              <p>
                What dental referral management covers, where fax falls short,
                and how CaseLink tracks each case from send to outcome.
              </p>
              <span className="spec-hub-more">
                Learn more
                <ArrowRight width={13} height={13} />
              </span>
            </Link>
            <Link href="/resources/how-to-choose-dental-referral-software" className="geo-card spec-hub-card">
              <span className="eyebrow">Buyer&apos;s guide</span>
              <h2>How to choose referral software</h2>
              <p>
                Eight questions to ask before your practice picks a referral
                platform, from who pays and the BAA to how both offices see
                status.
              </p>
              <span className="spec-hub-more">
                Read the guide
                <ArrowRight width={13} height={13} />
              </span>
            </Link>
          </div>
        </div>
      </section>

      <CtaBand
        title={<>One referral network<br />for every specialty.</>}
        body="Free for general dentists. Specialists get one month free. No setup fee, no contract."
        primary={{ href: SIGNUP_URL, label: "Get started free", external: true }}
        secondary={{ href: "/pricing", label: "See pricing" }}
      />
    </>
  );
}
