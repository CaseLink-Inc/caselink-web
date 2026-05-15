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
      <Script
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="afterInteractive"
      />
      <Script id="calendly-badge" strategy="afterInteractive">
        {`
          (function () {
            function start() {
              if (window.Calendly && !window.__caselinkBadgeInitialized) {
                window.__caselinkBadgeInitialized = true;
                Calendly.initBadgeWidget({
                  url: '${CALENDLY_URL}',
                  text: 'Schedule time with me',
                  color: '#1b1f1e',
                  textColor: '#ffffff',
                  branding: false
                });
              } else if (!window.Calendly) {
                setTimeout(start, 200);
              }
            }
            if (document.readyState === 'complete') start();
            else window.addEventListener('load', start);
          })();
        `}
      </Script>
    </>
  );
}
