import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CtaBand from "@/components/home/CtaBand";
import BookCallButton from "@/components/BookCallButton";
import Breadcrumbs from "@/components/Breadcrumbs";
import FaqAccordion from "@/components/FaqAccordion";
import { ArrowRight, Check, File, Clock, Grid } from "@/components/icons";
import { specialties, getSpecialty } from "@/lib/specialties";
import { getResource } from "@/lib/resources";
import { SIGNUP_URL } from "@/lib/urls";

const SITE = "https://www.caselink.net";

export function generateStaticParams() {
  return specialties.map((s) => ({ specialty: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ specialty: string }>;
}): Promise<Metadata> {
  const { specialty } = await params;
  const s = getSpecialty(specialty);
  if (!s) return {};
  const path = `/referral-software/${s.slug}`;
  return {
    title: s.metaTitle,
    description: s.description,
    alternates: { canonical: path },
    openGraph: {
      title: `${s.metaTitle} · CaseLink`,
      description: s.description,
      url: `${SITE}${path}`,
      type: "website",
    },
  };
}

export default async function SpecialtyPage({
  params,
}: {
  params: Promise<{ specialty: string }>;
}) {
  const { specialty } = await params;
  const s = getSpecialty(specialty);
  if (!s) notFound();

  const path = `/referral-software/${s.slug}`;
  const guide = s.guide ? getResource(s.guide) : undefined;
  const others = specialties.filter((o) => o.slug !== s.slug);

  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `CaseLink referral software for ${s.plural}`,
    serviceType: "Dental referral and case collaboration software",
    description: s.description,
    url: `${SITE}${path}`,
    audience: { "@type": "Audience", audienceType: s.plural },
    provider: { "@type": "Organization", name: "CaseLink, Inc.", url: SITE },
    offers: {
      "@type": "Offer",
      price: "299",
      priceCurrency: "USD",
      url: `${SITE}/pricing`,
      description: "Specialist plan, first month free. Free for referring general dentists.",
    },
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: s.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <Breadcrumbs
        trail={[
          { name: "Referral software", path: "/referral-software" },
          { name: s.field, path },
        ]}
      />

      {/* HERO */}
      <section className="geo-hero">
        <div className="geo-hero-bg" aria-hidden="true" />
        <div className="wrap geo-hero-inner">
          <span className="eyebrow">{s.field}</span>
          <h1>{s.h1}</h1>
          <p className="lead">{s.lead}</p>
          <div className="geo-hero-cta">
            <a
              href={SIGNUP_URL}
              className="btn btn-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              Start 1 month free
              <ArrowRight width={14} height={14} />
            </a>
            <BookCallButton className="btn btn-ghost">
              Book a 15 minute walkthrough
            </BookCallButton>
          </div>
          <ul className="geo-hero-proof">
            <li>
              <Check width={13} height={13} />
              Free for referring GPs
            </li>
            <li>
              <Check width={13} height={13} />
              BAA signed on signup
            </li>
            <li>
              <Check width={13} height={13} />
              Works alongside your PMS
            </li>
          </ul>
        </div>
      </section>

      {/* REFERRALS + WHAT A GOOD ONE INCLUDES */}
      <section className="geo-why">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">The referral</span>
            <h2>What arrives, and what it should include.</h2>
            <p>{s.whyItMatters}</p>
          </div>
          <div className="spec-lists">
            <div className="spec-list-card">
              <h3>Common reasons GPs refer to {s.plural}</h3>
              <ul>
                {s.referralReasons.map((r) => (
                  <li key={r}>
                    <Check width={14} height={14} />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
            <div className="spec-list-card">
              <h3>What a complete referral includes</h3>
              <ul>
                {s.goodReferral.map((r) => (
                  <li key={r}>
                    <Check width={14} height={14} />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* HOW CASELINK HELPS */}
      <section className="geo-steps-sec spec-how">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">How CaseLink helps</span>
            <h2>One inbox, one shared status.</h2>
          </div>
          <div className="geo-grid">
            <div className="geo-card">
              <span className="geo-card-ic" aria-hidden="true">
                <File width={20} height={20} />
              </span>
              <h3>Cases arrive complete</h3>
              <p>
                Referring GPs attach patient details, x-rays, insurance, and
                treatment notes. Each case lands in your referral inbox with
                the clinical context already in place.
              </p>
            </div>
            <div className="geo-card">
              <span className="geo-card-ic" aria-hidden="true">
                <Clock width={20} height={20} />
              </span>
              <h3>Both offices see the status</h3>
              <p>
                Received, patient notified, consult scheduled, treatment
                accepted. Every step is timestamped and visible to both
                sides, and unbooked cases surface for follow-up.
              </p>
            </div>
            <div className="geo-card">
              <span className="geo-card-ic" aria-hidden="true">
                <Grid width={20} height={20} />
              </span>
              <h3>Know your referral sources</h3>
              <p>
                The analytics dashboard reports referral volume, source
                attribution, and completion by referring practice, so you
                know which relationships drive the practice.
              </p>
            </div>
          </div>
          {guide && (
            <p className="geo-steps-more">
              <Link href={`/resources/${guide.slug}`}>
                Read the guide: {guide.title}
                <ArrowRight width={13} height={13} />
              </Link>
            </p>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="geo-faq" aria-label="Frequently asked questions">
        <div className="wrap geo-faq-inner">
          <div className="section-head">
            <span className="eyebrow">FAQ</span>
            <h2>Questions from {s.plural}.</h2>
          </div>
          <FaqAccordion faqs={s.faqs} />
          <nav className="spec-others" aria-label="Other specialties">
            <span>Also for</span>
            {others.map((o) => (
              <Link key={o.slug} href={`/referral-software/${o.slug}`}>
                {o.field}
              </Link>
            ))}
          </nav>
        </div>
      </section>

      <CtaBand
        title={<>Give your referring GPs<br />one easy way to send.</>}
        body="Free for general dentists. Specialists get one month free. No setup fee, no contract."
        primary={{ href: SIGNUP_URL, label: "Start 1 month free", external: true }}
        secondary={{ href: "/pricing", label: "See pricing" }}
      />
    </>
  );
}
