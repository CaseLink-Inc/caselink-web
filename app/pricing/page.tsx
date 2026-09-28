import type { Metadata } from "next";
import Link from "next/link";
import Pricing from "@/components/home/Pricing";
import CtaBand from "@/components/home/CtaBand";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Shield, File, Users } from "@/components/icons";
import { faqGroups } from "@/lib/faqs";
import { SIGNUP_URL } from "@/lib/urls";

const SITE = "https://www.caselink.net";
const PAGE_URL = `${SITE}/pricing`;
const DESCRIPTION =
  "CaseLink pricing: free for general dentists, $299 a month for specialists ($269 a month billed yearly), and custom plans for DSOs. Every plan includes HIPAA compliance and a BAA.";

export const metadata: Metadata = {
  title: "Dental Referral Software Pricing",
  description: DESCRIPTION,
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Dental Referral Software Pricing · CaseLink",
    description: DESCRIPTION,
    url: PAGE_URL,
    type: "website",
  },
};

const pricingFaqs = faqGroups.find((g) => g.id === "pricing")?.faqs ?? [];

// One Offer per plan so search and AI answer engines can quote exact
// prices. Must match components/home/Pricing.tsx.
const softwareLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "CaseLink",
  url: SITE,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description: DESCRIPTION,
  offers: [
    {
      "@type": "Offer",
      name: "General dentist",
      price: "0",
      priceCurrency: "USD",
      url: PAGE_URL,
      description: "Unlimited referrals, secure file sharing, real-time updates, HIPAA compliance.",
    },
    {
      "@type": "Offer",
      name: "Specialist, monthly billing",
      price: "299",
      priceCurrency: "USD",
      url: PAGE_URL,
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "299",
        priceCurrency: "USD",
        unitText: "MONTH",
      },
      description: "Referral inbox, analytics dashboard, case timelines. First month free.",
    },
    {
      "@type": "Offer",
      name: "Specialist, yearly billing",
      price: "269",
      priceCurrency: "USD",
      url: PAGE_URL,
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "269",
        priceCurrency: "USD",
        unitText: "MONTH",
      },
      description: "Specialist plan billed yearly, saving $358 per year.",
    },
  ],
};

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: pricingFaqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function PricingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <Breadcrumbs trail={[{ name: "Pricing", path: "/pricing" }]} />

      <section className="geo-hero pricing-page-hero">
        <div className="geo-hero-bg" aria-hidden="true" />
        <div className="wrap geo-hero-inner">
          <span className="eyebrow">Pricing</span>
          <h1>Dental referral software pricing.</h1>
          <p className="lead">
            General dentists send referrals for free, permanently. Specialists
            pay a flat monthly fee that is typically covered by a single new
            case per month. Groups and DSOs get a custom plan.
          </p>
        </div>
      </section>

      <Pricing />

      <section className="geo-why">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">Every plan</span>
            <h2>Included on every plan.</h2>
          </div>
          <div className="geo-grid">
            <div className="geo-card">
              <span className="geo-card-ic" aria-hidden="true">
                <Shield width={20} height={20} />
              </span>
              <h3>HIPAA compliance</h3>
              <p>
                Encryption on every referral, message, and file, audit logs on
                every action, and role-based access. See the{" "}
                <Link href="/security">security page</Link> for detail.
              </p>
            </div>
            <div className="geo-card">
              <span className="geo-card-ic" aria-hidden="true">
                <File width={20} height={20} />
              </span>
              <h3>BAA on signup</h3>
              <p>
                CaseLink signs a Business Associate Agreement with every
                practice that holds Protected Health Information.
              </p>
            </div>
            <div className="geo-card">
              <span className="geo-card-ic" aria-hidden="true">
                <Users width={20} height={20} />
              </span>
              <h3>Unlimited case storage</h3>
              <p>
                Every referral, record, and message stays in one shared
                history, with no cap on cases or attachments.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="geo-faq" aria-label="Pricing questions">
        <div className="wrap geo-faq-inner">
          <div className="section-head">
            <span className="eyebrow">FAQ</span>
            <h2>Pricing questions.</h2>
            <p>
              More answers on setup, security, and workflow live on the{" "}
              <Link href="/faqs">FAQ page</Link>.
            </p>
          </div>
          <div className="res-faq-list">
            {pricingFaqs.map((f) => (
              <details key={f.q} className="res-faq-item">
                <summary>
                  <span>{f.q}</span>
                  <span className="res-faq-mark" aria-hidden="true">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </span>
                </summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        title={<>Better referrals<br />start with one signup.</>}
        body="Free for general dentists. Specialists get one month free. No setup fee, no contract."
        primary={{ href: SIGNUP_URL, label: "Get started free", external: true }}
        secondary={{ href: "/contact", label: "Talk to sales" }}
      />
    </>
  );
}
