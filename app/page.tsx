import Hero from "@/components/home/Hero";
import HowItWorks from "@/components/home/HowItWorks";
import Network from "@/components/home/Network";
import ForWho from "@/components/home/ForWho";
import Trust from "@/components/home/Trust";
import Roi from "@/components/home/Roi";
import Pricing from "@/components/home/Pricing";
import Faq, { faqs } from "@/components/home/Faq";
import CtaBand from "@/components/home/CtaBand";
import { LOGIN_URL, SIGNUP_URL } from "@/lib/urls";

const SITE = "https://www.caselink.net";

// SoftwareApplication tells Google + AI answer engines that CaseLink is a
// SaaS product, not just an organization. AggregateOffer covers the price
// range across the free GP plan and the $299/mo specialist plan, with a
// custom upper bound implied by DSO contracts.
const softwareApplicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "CaseLink",
  url: SITE,
  description:
    "CaseLink is a HIPAA-compliant referral and collaboration network for general dentists, specialists, and dental practice managers. Send referrals with full clinical context, track status in real time, and exchange outcome reports in minutes.",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  audience: {
    "@type": "Audience",
    audienceType: "Dental professionals",
  },
  publisher: {
    "@type": "Organization",
    name: "CaseLink",
    url: SITE,
  },
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "USD",
    lowPrice: "0",
    highPrice: "299",
    offerCount: "3",
  },
  featureList: [
    "HIPAA-compliant patient referrals",
    "End-to-end encryption on every message and file",
    "Real-time referral status tracking",
    "Outcome reports between practices",
    "Encrypted clinical messaging",
    "Audit logs on every action",
    "Role-based access controls",
    "Patient and case organization",
  ],
};

// FAQPage schema is the highest-leverage AEO move for a B2B SaaS site.
// AI answer engines extract Q&A pairs directly from this structure. The
// content here must match the visible FAQ section in components/home/Faq.tsx.
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: f.a,
    },
  })),
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareApplicationJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Hero />
      <HowItWorks />
      <Network />
      <ForWho />
      <Trust />
      <Roi />
      <Pricing />
      <Faq />
      <CtaBand
        title={<>Better referrals<br />start with one signup.</>}
        body="Free for general dentists. Specialists get one month free. No setup fee, no contract, and your first referral can go out the same afternoon."
        primary={{ href: SIGNUP_URL, label: "Get started free", external: true }}
        secondary={{ href: LOGIN_URL, label: "Login now", external: true }}
      />
    </>
  );
}
