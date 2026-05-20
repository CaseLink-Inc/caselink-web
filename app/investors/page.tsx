import type { Metadata } from "next";
import InvestorsContent from "@/components/investors/InvestorsContent";

// Investor brief is intentionally unlisted. No canonical, no OG image,
// no sitemap entry, no nav or footer link. robots/noindex tells crawlers
// to skip it. The URL is meant to be shared directly by Nick.
export const metadata: Metadata = {
  title: "Investor Brief",
  description:
    "CaseLink investor brief. Pre-seed round, twelve practices live, the referral layer dentistry is missing.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      "max-snippet": -1,
      "max-image-preview": "none",
    },
  },
};

export default function InvestorsPage() {
  return <InvestorsContent />;
}
