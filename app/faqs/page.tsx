import type { Metadata } from "next";
import CtaBand from "@/components/home/CtaBand";
import Breadcrumbs from "@/components/Breadcrumbs";
import Image from "next/image";
import FaqAccordion from "@/components/FaqAccordion";
import { faqGroups, allFaqs } from "@/lib/faqs";
import { SIGNUP_URL } from "@/lib/urls";

const SITE = "https://www.caselink.net";
const DESCRIPTION =
  "Answers to common questions about CaseLink, the HIPAA-compliant dental referral management platform: how dentists and specialists refer to each other, pricing, BAAs, security, setup, DSOs, and how it works alongside Dentrix, Eaglesoft, and Open Dental.";

export const metadata: Metadata = {
  title: "Dental Referral Management Platform FAQs",
  description: DESCRIPTION,
  alternates: { canonical: "/faqs" },
  openGraph: {
    title: "Dental Referral Management Platform FAQs · CaseLink",
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

/* One icon per FAQ group, for wayfinding down a long hub. */
const GROUP_ICON: Record<string, string> = {
  "getting-started": "caselink-send-referral",
  pricing: "caselink-finance",
  "hipaa-security": "caselink-hipaa-lock",
  referrals: "caselink-referral-status",
  "practice-software": "caselink-integrations",
  specialists: "caselink-specialist",
};

export default function FaqsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <Breadcrumbs trail={[{ name: "FAQs", path: "/faqs" }]} />

      <section className="geo-hero faqhub-hero">
        {/* The frosted question tile, sized rather than bled full width:
            at full bleed the artwork scaled to the hero's width and the
            tile came out far larger than it is in the source. It sits in
            its own box on the right and dissolves at every edge, so the
            ground carries it instead of ending on a seam. Decorative, so
            alt is empty. */}
        <span className="faqhub-hero-art" aria-hidden="true">
          <Image
            className="faqhub-hero-img"
            src="/ds/faq-question-tile.webp"
            alt=""
            fill
            sizes="(max-width:1100px) 92vw, 520px"
            priority
          />
        </span>
        <div className="wrap geo-hero-inner">
          <span className="eyebrow">FAQ</span>
          <h1>
            Questions about CaseLink,{" "}
            <span className="cl-landing">answered.</span>
          </h1>
          <p className="lead">
            Pricing, HIPAA and BAAs, setup, and how CaseLink fits alongside
            the software your practice already runs. If your question is not
            here, write to{" "}
            {/* Emphasis is Medium 500 in Blue Deep, which is how the type
                scale marks a phrase. Bold is reserved for UI numbers and
                the wordmark. It is also a mailto now, so the address is
                one tap rather than something to copy out. */}
            <a className="lead-em" href="mailto:support@caselink.net">
              support@CaseLink.net
            </a>
            .
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

      <section className="faqhub-main cl-bg-icefield">
        <div className="wrap faqhub-inner">
          {faqGroups.map((g) => (
            <div key={g.id} id={g.id} className="faqhub-group">
              <div className="faqhub-head">
                <span className="faqhub-ico" aria-hidden="true">
                  <Image
                    src={`/ds/icons/${GROUP_ICON[g.id] ?? "caselink-help"}.svg`}
                    alt=""
                    width={38}
                    height={38}
                  />
                </span>
                <h2>{g.title}</h2>
              </div>
              {/* A name per group, not one for the page: with 31 questions
                  in six groups a single shared name meant opening anything
                  closed whatever the reader had open in another group. */}
              <FaqAccordion faqs={g.faqs} name={`caselink-faq-${g.id}`} />
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
