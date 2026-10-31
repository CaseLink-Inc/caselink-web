import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Clock } from "@/components/icons";
import FaqAccordion from "@/components/FaqAccordion";
import CtaBand from "@/components/home/CtaBand";
import ResourceCard from "@/components/resources/ResourceCard";
import Image from "next/image";
import ArticleBody, { type ArticleInsert } from "@/components/resources/ArticleBody";
import ResourceStats from "@/components/resources/ResourceStats";
import ResourcePullQuote from "@/components/resources/ResourcePullQuote";
import ResourceSlider from "@/components/resources/ResourceSlider";
import ResourceFigure from "@/components/resources/ResourceFigure";
import ResourceFunnel from "@/components/resources/ResourceFunnel";
import {
  resources,
  getResource,
  getResources,
  formatResourceDate,
  CATEGORY_COLOR,
} from "@/lib/resources";
import { getResourceBody } from "@/lib/resourceBody";
import { SIGNUP_URL } from "@/lib/urls";
import Breadcrumbs from "@/components/Breadcrumbs";

const SITE = "https://www.caselink.net";

// Articles with a dedicated 1200x630 social card in /public/og. Any article
// not listed here keeps using its 16:9 thumbnail, so adding a card later is
// a matter of dropping the file in and adding the slug.
const FEATURED_OG_SLUGS = new Set([
  "how-to-choose-dental-referral-software",
  "how-to-stop-losing-dental-referrals",
  "free-dental-referral-software-for-general-dentists",
  "dental-referral-conversion-rate-benchmarks",
]);

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
  const featuredOg = FEATURED_OG_SLUGS.has(r.slug)
    ? `/og/resources-${r.slug}.jpg`
    : null;
  const ogImages = featuredOg
    ? [{ url: featuredOg, width: 1200, height: 630, alt: r.title }]
    : r.thumbnail
      ? [{ url: r.thumbnail, width: 800, height: 450, alt: r.title }]
      : undefined;
  const socialImage = featuredOg ?? r.thumbnail;
  return {
    // metaTitle already ends in "· CaseLink"; absolute bypasses the layout's
    // "%s · CaseLink" template so the brand is not doubled.
    title: { absolute: r.metaTitle },
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
      ...(socialImage ? { images: [socialImage] } : {}),
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
    } else if (ins.kind === "funnel") {
      inserts.push({
        section: ins.before,
        node: (
          <ResourceFunnel
            stages={ins.stages}
            result={ins.result}
            accent={accent}
          />
        ),
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
      <Breadcrumbs trail={[
          { name: "Resources", path: "/resources" },
          { name: r.title, path: `/resources/${r.slug}` },
        ]} />
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

        {/* The feature image. The card thumbnail was the only artwork an
            article had, and it only ever appeared on the index, so every
            article opened on a wall of text. */}
        {r.thumbnail && (
          <div className="wrap res-article-figure">
            <Image
              src={r.thumbnail}
              alt={r.thumbnailAlt ?? ""}
              width={1600}
              height={900}
              sizes="(max-width:900px) 100vw, 1080px"
              priority
            />
          </div>
        )}

        <div className="wrap res-article-body">
          <p className="lead res-article-lede">{r.excerpt}</p>

          {statsTop && <ResourceStats stats={r.keyStats} accent={accent} />}

          <ArticleBody
            markdown={body}
            accent={accent}
            inserts={inserts}
            pointIcons={r.layout.pointIcons}
          />

          {statsBeforeFaq && <ResourceStats stats={r.keyStats} accent={accent} />}

          {/* FAQ */}
          {r.faqs.length > 0 && (
            <section className="res-faq" aria-label="Frequently asked questions">
              <h2 className="res-faq-head">Frequently asked questions</h2>
              {/* The article template had its own copy of the accordion
                  markup, so like the DC page it never got the `name` that
                  makes the group exclusive: every answer a reader opened
                  stayed open. The slug keys the group so two articles can
                  never share one. */}
              <FaqAccordion faqs={r.faqs} name={`caselink-faq-${r.slug}`} />
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
