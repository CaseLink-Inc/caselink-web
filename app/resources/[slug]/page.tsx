import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  Clock,
  Users,
  Grid,
  Bolt,
  Briefcase,
  Plus,
} from "@/components/icons";
import CtaBand from "@/components/home/CtaBand";
import ResourceCard from "@/components/resources/ResourceCard";
import ArticleBody from "@/components/resources/ArticleBody";
import {
  resources,
  getResource,
  getResources,
  formatResourceDate,
  CATEGORY_COLOR,
  type ResourceCategory,
} from "@/lib/resources";
import { getResourceBody } from "@/lib/resourceBody";
import { SIGNUP_URL } from "@/lib/urls";

const SITE = "https://www.caselink.net";

type IconType = React.ComponentType<{ width?: number; height?: number }>;
const CATEGORY_ICON: Record<ResourceCategory, IconType> = {
  Referrals: Users,
  Benchmarks: Grid,
  Software: Bolt,
  Specialists: Briefcase,
  Operations: Clock,
  "Getting started": Plus,
};

export function generateStaticParams() {
  return resources.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const r = getResource(slug);
  if (!r) return {};
  return {
    title: r.metaTitle,
    description: r.excerpt,
    alternates: { canonical: `/resources/${r.slug}` },
    openGraph: {
      title: r.title,
      description: r.excerpt,
      url: `${SITE}/resources/${r.slug}`,
      type: "article",
    },
  };
}

export default async function ResourceArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const r = getResource(slug);
  if (!r) notFound();

  const body = await getResourceBody(slug);
  const accent = CATEGORY_COLOR[r.category];
  const Icon = CATEGORY_ICON[r.category];
  const more = getResources().filter((x) => x.slug !== r.slug).slice(0, 3);

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: r.title,
    description: r.excerpt,
    datePublished: r.date,
    author: { "@type": "Organization", name: r.author },
    publisher: {
      "@type": "Organization",
      name: "CaseLink",
      url: SITE,
      logo: { "@type": "ImageObject", url: `${SITE}/logo-mark.svg` },
    },
    mainEntityOfPage: `${SITE}/resources/${r.slug}`,
    articleSection: r.category,
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: r.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />

      <article className="res-article">
        <div
          className="res-article-head"
          style={{ "--accent": accent } as React.CSSProperties}
        >
          <div className="wrap res-article-head-inner">
            <Link href="/resources" className="res-back">
              <ArrowRight width={14} height={14} className="res-back-arr" />
              All resources
            </Link>
            <span className="res-cat res-cat-inline">
              <span className="res-cat-ic" aria-hidden="true">
                <Icon width={13} height={13} />
              </span>
              {r.category}
            </span>
            <h1>{r.title}</h1>
            <div className="res-meta res-article-meta">
              <span>{r.author}</span>
              <i aria-hidden="true">·</i>
              <span>{formatResourceDate(r.date)}</span>
              <i aria-hidden="true">·</i>
              <span className="res-rt">
                <Clock width={13} height={13} />
                {r.readMinutes} min read
              </span>
            </div>
          </div>
        </div>

        <div className="wrap res-article-body">
          {/* Key stats */}
          {r.keyStats.length > 0 && (
            <div
              className="res-stats"
              style={{ "--accent": accent } as React.CSSProperties}
            >
              {r.keyStats.map((s) => (
                <div key={s.label} className="res-stat">
                  <div className="res-stat-val">{s.value}</div>
                  <div className="res-stat-lbl">{s.label}</div>
                </div>
              ))}
            </div>
          )}

          <p className="lead res-article-lede">{r.excerpt}</p>

          <ArticleBody markdown={body} />

          {/* FAQ */}
          {r.faqs.length > 0 && (
            <section className="res-faq" aria-label="Frequently asked questions">
              <h2 className="res-faq-head">Frequently asked questions</h2>
              <div className="res-faq-list">
                {r.faqs.map((f) => (
                  <details key={f.q} className="res-faq-item">
                    <summary>
                      <span>{f.q}</span>
                      <span className="res-faq-mark" aria-hidden="true">
                        <Plus width={16} height={16} />
                      </span>
                    </summary>
                    <p>{f.a}</p>
                  </details>
                ))}
              </div>
            </section>
          )}

          {/* Related */}
          {r.related.length > 0 && (
            <aside className="res-related">
              <h4>Related</h4>
              <ul>
                {r.related.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>
                      {link.label}
                      <ArrowRight width={13} height={13} />
                    </Link>
                  </li>
                ))}
              </ul>
            </aside>
          )}

          {/* Sources */}
          {r.sources.length > 0 && (
            <section className="res-sources" aria-label="Sources">
              <h4>Sources</h4>
              <ol>
                {r.sources.map((s, i) => (
                  <li key={i}>
                    {s.url ? (
                      <a href={s.url} target="_blank" rel="noopener noreferrer nofollow">
                        {s.label}
                      </a>
                    ) : (
                      s.label
                    )}
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>
      </article>

      {more.length > 0 && (
        <section className="res-more">
          <div className="wrap">
            <h3 className="res-more-head">More from the library</h3>
            <div className="res-grid">
              {more.map((m) => (
                <ResourceCard key={m.slug} r={m} />
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaBand
        title={<>Ready to modernize your referrals?</>}
        body="See how practices across the DMV are replacing fax with one-click, HIPAA-compliant referrals."
        primary={{ href: SIGNUP_URL, label: "Get started", external: true }}
        secondary={{ href: "/contact", label: "Talk to us" }}
      />
    </>
  );
}
