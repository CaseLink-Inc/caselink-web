import type { Metadata } from "next";
import CtaBand from "@/components/home/CtaBand";
import ResourceLibrary from "@/components/resources/ResourceLibrary";
import { getResources } from "@/lib/resources";
import { SIGNUP_URL } from "@/lib/urls";

const SITE = "https://www.caselink.net";
const DESCRIPTION =
  "Practical guides on dental referrals, specialist growth, HIPAA-compliant collaboration, and running a connected practice. From the CaseLink team.";

export const metadata: Metadata = {
  title: "Resources · CaseLink",
  description: DESCRIPTION,
  alternates: { canonical: "/resources" },
  openGraph: {
    title: "Resources · CaseLink",
    description: DESCRIPTION,
    url: `${SITE}/resources`,
    type: "website",
  },
};

export default function ResourcesPage() {
  const all = getResources();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "CaseLink Resources",
    description: DESCRIPTION,
    url: `${SITE}/resources`,
    publisher: { "@type": "Organization", name: "CaseLink", url: SITE },
    blogPost: all.map((r) => ({
      "@type": "BlogPosting",
      headline: r.title,
      description: r.excerpt,
      datePublished: r.date,
      author: { "@type": "Organization", name: r.author },
      url: `${SITE}/resources/${r.slug}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Full-bleed image hero. Background photo drops into .res-hero-img
          (see globals.css) — until then it shows a branded dark gradient. */}
      <section className="res-hero">
        <div className="res-hero-img" aria-hidden="true" />
        <div className="wrap res-hero-inner">
          <span className="res-hero-eyebrow">Resources</span>
          <h1>Insights for modern dental referrals</h1>
          <p className="res-hero-sub">
            Guides on referrals, specialist growth, HIPAA-compliant
            collaboration, and running a connected practice. From the CaseLink
            team.
          </p>
        </div>
      </section>

      <ResourceLibrary resources={all} />

      <CtaBand
        title={<>Ready to modernize your referrals?</>}
        body="See how practices across the DMV are replacing fax with one-click, HIPAA-compliant referrals."
        primary={{ href: SIGNUP_URL, label: "Get started", external: true }}
        secondary={{ href: "/contact", label: "Talk to us" }}
      />
    </>
  );
}
