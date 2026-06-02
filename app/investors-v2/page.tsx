import type { Metadata } from "next";
import InvestorsContentV2 from "@/components/investors/InvestorsContentV2";

// Working draft of the investor brief, rebuilt against advisor feedback.
// Same unlisted treatment as /investors: noindex, no canonical, no OG, no
// sitemap/nav/footer link. Kept alongside the live /investors until Nick
// signs off, then one of the two gets deleted.
export const metadata: Metadata = {
  title: "Investor Brief (v2 draft)",
  description:
    "CaseLink investor brief draft. Pre-seed round, twelve practices live, the referral layer dentistry is missing.",
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

export default function InvestorsV2Page() {
  return <InvestorsContentV2 />;
}
