import type { Metadata } from "next";
import CtaBand from "@/components/home/CtaBand";
import Breadcrumbs from "@/components/Breadcrumbs";
import { faqGroups, allFaqs } from "@/lib/faqs";
import { SIGNUP_URL } from "@/lib/urls";

const SITE = "https://www.caselink.net";
const DESCRIPTION =
  "Answers to common questions about CaseLink, the HIPAA-compliant dental referral platform: pricing, BAAs, security, setup, and how it works alongside Dentrix, Eaglesoft, and Open Dental.";

export const metadata: Metadata = {
  title: "Dental Referral Platform FAQs",
  description: DESCRIPTION,
  alternates: { canonical: "/faqs" },
  openGraph: {
    title: "Dental Referral Platform FAQs · CaseLink",
    description: DESCRIPTION,
    url: `${SITE}/faqs`,
    type: "website",
  },
};

// FAQPage schema generated from the same list the page renders, so the
// visible answers and the structured data can never drift apart.
const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: allFaqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function FaqsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <Breadcrumbs trail={[{ name: "FAQs", path: "/faqs" }]} />

      <section className="geo-hero">
        <div className="geo-hero-bg" aria-hidden="true" />
        <div className="wrap geo-hero-inner">
          <span className="eyebrow">FAQ</span>
          <h1>Questions about CaseLink, answered.</h1>
          <p className="lead">
            Pricing, HIPAA and BAAs, setup, and how CaseLink fits alongside
            the software your practice already runs. If your question is not
            here, write to support@CaseLink.net.
          </p>
          <nav className="faqhub-jump" aria-label="FAQ topics">
            {faqGroups.map((g) => (
              <a key={g.id} href={`#${g.id}`}>
                {g.title}
              </a>
            ))}
          </nav>
        </div>
      </section>

      <section className="faqhub-main">
        <div className="wrap faqhub-inner">
          {faqGroups.map((g) => (
            <div key={g.id} id={g.id} className="faqhub-group">
              <h2>{g.title}</h2>
              <div className="res-faq-list">
                {g.faqs.map((f) => (
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
          ))}
        </div>
      </section>

      <CtaBand
        title={<>Still deciding?<br />Send your first referral free.</>}
        body="Free for general dentists. Specialists get one month free. No setup fee and no contract."
        primary={{ href: SIGNUP_URL, label: "Get started free", external: true }}
        secondary={{ href: "/contact", label: "Talk to us" }}
      />
    </>
  );
}
