import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock } from "@/components/icons";
import CtaBand from "@/components/home/CtaBand";
import ResourceCard from "@/components/resources/ResourceCard";
import { getResources, formatResourceDate, CATEGORY_COLOR } from "@/lib/resources";
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
  const [featured, ...rest] = all;

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

      <section className="res-hero">
        <div className="res-hero-bg" aria-hidden="true" />
        <div className="wrap res-hero-inner">
          <span className="eyebrow">Resources</span>
          <h1>Insights for modern dental referrals</h1>
          <p className="lead">
            Practical guides on referrals, specialist growth, HIPAA-compliant
            collaboration, and running a connected practice. Written by the
            CaseLink team.
          </p>
        </div>
      </section>

      <section className="res-main">
        <div className="wrap">
          {/* Featured (newest) */}
          <Link href={`/resources/${featured.slug}`} className="res-featured reveal">
            <div
              className="res-thumb res-thumb-lg"
              style={{ "--accent": CATEGORY_COLOR[featured.category] } as React.CSSProperties}
              aria-hidden="true"
            >
              <Image
                src="/logo-mark-white.svg"
                alt=""
                width={72}
                height={72}
                className="res-thumb-mark"
              />
              <span className="res-cat">{featured.category}</span>
            </div>
            <div className="res-featured-body">
              <span className="res-featured-tag">Featured</span>
              <h2>{featured.title}</h2>
              <p>{featured.excerpt}</p>
              <div className="res-meta">
                <span>{featured.author}</span>
                <i aria-hidden="true">·</i>
                <span>{formatResourceDate(featured.date)}</span>
                <i aria-hidden="true">·</i>
                <span className="res-rt">
                  <Clock width={13} height={13} />
                  {featured.readMinutes} min read
                </span>
              </div>
              <span className="res-readmore">
                Read article
                <ArrowRight width={14} height={14} />
              </span>
            </div>
          </Link>

          {/* Grid of the rest */}
          <div className="res-grid">
            {rest.map((r) => (
              <ResourceCard key={r.slug} r={r} />
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        title={<>Ready to modernize your referrals?</>}
        body="See how practices across the DMV are replacing fax with one-click, HIPAA-compliant referrals."
        primary={{ href: SIGNUP_URL, label: "Get started", external: true }}
        secondary={{ href: "/contact", label: "Talk to us" }}
      />
    </>
  );
}
