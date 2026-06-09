import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Clock, Plus } from "@/components/icons";
import CtaBand from "@/components/home/CtaBand";
import ResourceCard from "@/components/resources/ResourceCard";
import ArticleBody, { type ArticleInsert } from "@/components/resources/ArticleBody";
import ResourceStats from "@/components/resources/ResourceStats";
import ResourcePullQuote from "@/components/resources/ResourcePullQuote";
import ResourceSlider from "@/components/resources/ResourceSlider";
import ResourceFigure from "@/components/resources/ResourceFigure";
import {
  resources,
  getResource,
  getResources,
  formatResourceDate,
  CATEGORY_COLOR,
} from "@/lib/resources";
import { getResourceBody } from "@/lib/resourceBody";
import { SIGNUP_URL } from "@/lib/urls";

const SITE = "https://www.caselink.net";

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
  // Per-article social preview image (WhatsApp / iMessage / LinkedIn / X read
  // og:image). Use the article's 16:9 thumbnail; metadataBase makes the URL
  // absolute. Articles without a thumbnail fall back to the site default OG
  // image automatically. Future articles get this for free once a thumbnail
  // is set.
  const ogImages = r.thumbnail
    ? [{ url: r.thumbnail, width: 800, height: 450, alt: r.title }]
    : undefined;
  return {
    title: r.metaTitle,
    description: r.excerpt,
    alternates: { canonical: `/resources/${r.slug}` },
    openGraph: {
      title: r.title,
      description: r.excerpt,
      url: `${SITE}/resources/${r.slug}`,
      type: "article",
      ...(ogImages ? { images: ogImages } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: r.title,
      description: r.excerpt,
      ...(r.thumbnail ? { images: [r.thumbnail] } : {}),
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
  const more = getResources().filter((x) => x.slug !== r.slug).slice(0, 3);

  const statsTop = r.layout.stats === "top";
  const statsBeforeFaq = r.layout.stats === "beforeFaq";
  const statsBeforeSection =
    typeof r.layout.stats === "object" ? r.layout.stats.beforeSection : null;

  // Build the in-body inserts (stat block, pull-quotes, images, sliders) from
  // this article's layout recipe so the reading flow is unique per article.
  const inserts: ArticleInsert[] = [];
  if (statsBeforeSection !== null) {
    inserts.push({
      section: statsBeforeSection,
      node: <ResourceStats stats={r.keyStats} accent={accent} />,
    });
  }
  for (const ins of r.layout.inserts ?? []) {
    if (ins.kind === "quote") {
      inserts.push({
        section: ins.before,
        node: <ResourcePullQuote text={ins.text} accent={accent} />,
      });
    } else if (ins.kind === "slider") {
      inserts.push({
        section: ins.before,
        node: <ResourceSlider cards={ins.cards} accent={accent} />,
      });
    } else if (ins.kind === "figure") {
      inserts.push({
        section: ins.before,
        after: ins.variant === "side",
        node: (
          <ResourceFigure
            variant={ins.variant}
            side={ins.side}
            accent={accent}
            src={ins.src}
            alt={ins.alt}
          />
        ),
      });
    }
  }

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
            <span className="res-cat res-cat-inline">{r.category}</span>
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
          <p className="lead res-article-lede">{r.excerpt}</p>

          {statsTop && <ResourceStats stats={r.keyStats} accent={accent} />}

          <ArticleBody markdown={body} accent={accent} inserts={inserts} />

          {statsBeforeFaq && <ResourceStats stats={r.keyStats} accent={accent} />}

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
