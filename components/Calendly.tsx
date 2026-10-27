"use client";

import Script from "next/script";

export const CALENDLY_URL = "https://calendly.com/nick-caselink/15min";

type CalendlyAPI = {
  initPopupWidget: (options: { url: string }) => void;
  initBadgeWidget: (options: {
    url: string;
    text: string;
    color: string;
    textColor: string;
    branding: boolean;
  }) => void;
};

declare global {
  interface Window {
    Calendly?: CalendlyAPI;
  }
}

export function openCalendly(url: string = CALENDLY_URL) {
  if (typeof window === "undefined") return;
  if (window.Calendly) {
    window.Calendly.initPopupWidget({ url });
  } else {
    // Fall back to opening the Calendly page if the widget hasn't loaded yet.
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

export default function Calendly() {
  return (
    <>
      <link
        href="https://assets.calendly.com/assets/external/widget.css"
        rel="stylesheet"
      />
      {/* No floating badge: the bottom-right corner belongs to the CaseLink
          live chat widget, which books intro calls itself. The script stays
          so every BookCallButton can still open the Calendly popup. */}
      <Script
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="afterInteractive"
      />
    </>
  );
}
