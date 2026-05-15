import type { Metadata } from "next";
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
const siteTitle = "CaseLink · Your link to better patient care";
const siteDescription =
  "A secure referral and collaboration network for general dentists and specialists. HIPAA compliant by design.";

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
    "dental referrals",
    "dental referral network",
    "HIPAA compliant referrals",
    "general dentist software",
    "specialist referrals",
    "dental practice management",
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
  name: siteName,
  legalName: "CaseLink, Inc.",
  url: siteUrl,
  logo: `${siteUrl}/logo-primary.svg`,
  description: siteDescription,
  foundingDate: "2025",
  founders: [
    {
      "@type": "Person",
      name: "Nick Campbell",
      jobTitle: "Co-Founder and CEO",
    },
  ],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Washington",
    addressRegion: "DC",
    addressCountry: "US",
  },
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "support@caselink.net",
      telephone: "+1-703-554-3449",
      areaServed: "US",
      availableLanguage: ["English"],
    },
  ],
  sameAs: [
    "https://www.facebook.com/caselink.net",
    "https://www.instagram.com/caselinkinc/",
    "https://www.linkedin.com/company/caselinknet/",
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
      </body>
    </html>
  );
}
