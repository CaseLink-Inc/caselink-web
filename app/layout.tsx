import type { Metadata } from "next";
import Script from "next/script";
import localFont from "next/font/local";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import RevealInit from "@/components/RevealInit";
import Calendly from "@/components/Calendly";
import "./globals.css";

const satoshi = localFont({
  variable: "--font-satoshi",
  display: "swap",
  src: [
    { path: "../public/fonts/Satoshi-Light.otf", weight: "300", style: "normal" },
    { path: "../public/fonts/Satoshi-LightItalic.otf", weight: "300", style: "italic" },
    { path: "../public/fonts/Satoshi-Regular.otf", weight: "400", style: "normal" },
    { path: "../public/fonts/Satoshi-Italic.otf", weight: "400", style: "italic" },
    { path: "../public/fonts/Satoshi-Medium.otf", weight: "500", style: "normal" },
    { path: "../public/fonts/Satoshi-MediumItalic.otf", weight: "500", style: "italic" },
    { path: "../public/fonts/Satoshi-Bold.otf", weight: "700", style: "normal" },
    { path: "../public/fonts/Satoshi-BoldItalic.otf", weight: "700", style: "italic" },
    { path: "../public/fonts/Satoshi-Black.otf", weight: "900", style: "normal" },
    { path: "../public/fonts/Satoshi-BlackItalic.otf", weight: "900", style: "italic" },
  ],
});

const siteUrl = "https://www.caselink.net";
const siteName = "CaseLink";
// Google Analytics 4 measurement ID for the caselink.net web stream.
const GA_MEASUREMENT_ID = "G-L5HM3LDBHB";
const siteTitle = "CaseLink · Dental Referral Management Platform for Dentists & Specialists";
const siteDescription =
  "CaseLink is a HIPAA-compliant dental referral management platform where general dentists and specialists refer to each other, share x-rays and records, and track every referral in one shared workspace. Free for GPs.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: "%s · CaseLink",
  },
  description: siteDescription,
  alternates: { canonical: "/" },
  applicationName: siteName,
  keywords: [
    "dental referral management",
    "dental referral management software",
    "dental referral platform",
    "dental referral software",
    "dental referral tracking",
    "dentist to specialist referral network",
    "digital dental referrals",
    "online dental referral system",
    "paperless dental referrals",
    "HIPAA compliant dental referrals",
    "DSO referral management",
    "encrypted dental messaging",
  ],
  authors: [{ name: "CaseLink, Inc.", url: siteUrl }],
  creator: "CaseLink, Inc.",
  publisher: "CaseLink, Inc.",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName,
    title: siteTitle,
    description: siteDescription,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
  },
};

// JSON-LD lets Google (and AI answer engines) render rich brand info in
// search results — logo, social handles, contact details.
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "CaseLink, Inc.",
  url: siteUrl,
  email: "support@caselink.net",
  // Square PNG mark. AI answer engines and Google crop the logo to a square
  // tile, and the wide SVG lockup rendered as a cropped "selink" in ChatGPT.
  logo: {
    "@type": "ImageObject",
    url: `${siteUrl}/logo-square-512.png`,
    width: 512,
    height: 512,
  },
  image: `${siteUrl}/logo-square-512.png`,
  description: siteDescription,
  foundingDate: "2024",
  founders: [
    {
      "@type": "Person",
      name: "Nick Campbell",
      jobTitle: "Co-Founder and CEO",
    },
  ],
  address: {
    "@type": "PostalAddress",
    streetAddress: "124 S Wise St",
    addressLocality: "Arlington",
    addressRegion: "VA",
    postalCode: "22204",
    addressCountry: "US",
  },
  alternateName: "CaseLink",
  slogan: "Your link to better patient care.",
  // The product serves practices anywhere in the US (lib/faqs.ts). The DC
  // metro focus lives on the geo page, not here.
  areaServed: { "@type": "Country", name: "United States" },
  knowsAbout: [
    "Dental referral management",
    "Dentist to specialist referrals",
    "Dental referral tracking",
    "HIPAA compliant dental communication",
    "Dental specialist referral networks",
  ],
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "support@caselink.net",
      areaServed: "US",
      availableLanguage: ["English"],
    },
  ],
  sameAs: [
    "https://www.facebook.com/caselink.net",
    "https://www.instagram.com/caselinkinc/",
    "https://www.linkedin.com/company/caselinknet/",
    "https://www.google.com/maps?cid=12643817021776002590",
  ],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteName,
  url: siteUrl,
  description: siteDescription,
  inLanguage: "en-US",
  publisher: { "@type": "Organization", name: siteName, url: siteUrl },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={satoshi.variable} data-scroll-behavior="smooth">
      <head>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body>
        <Nav />
        {children}
        <Footer />
        <RevealInit />
        <Calendly />

        {/* Google Analytics 4 (gtag.js). afterInteractive so it loads once
            the page is interactive without blocking first paint. */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}');`}
        </Script>

        {/* LeadConnector CRM tracker (served from the branded
            links.caselink.net subdomain). Reports form submissions into the
            CRM so follow-up sequences start automatically. The tracking ID
            is CaseLink-specific. Do not change it. */}
        <Script
          src="https://links.caselink.net/js/external-tracking.js"
          data-tracking-id="tk_a9be11cdd564409692faee1ea3a35f43"
          strategy="afterInteractive"
        />

        {/* LeadConnector live chat widget ("CaseLink"), answered by the
            CaseLink Intro Booking Bot in the CRM. lazyOnload so it never
            competes with first paint. The widget ID is CaseLink-specific.
            The setup script runs first: fresh chat on every page load and
            a spin-in for the launcher button. */}
        <Script src="/chat-widget-setup.js" strategy="afterInteractive" />
        <Script
          src="https://widgets.leadconnectorhq.com/loader.js"
          data-resources-url="https://widgets.leadconnectorhq.com/chat-widget/loader.js"
          data-widget-id="6ae0d9536118072e0e2c589f"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
