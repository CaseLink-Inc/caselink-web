import type { NextConfig } from "next";

/**
 * Security headers applied to every response Vercel serves. These cover
 * the most common web attacks without breaking anything that the site
 * actually needs (Calendly, Web3Forms, self-hosted fonts).
 *
 * Notes on individual headers:
 * - Strict-Transport-Security: tells browsers to always use HTTPS for
 *   this domain for one year. After preload submission, it can be raised
 *   to two years.
 * - X-Content-Type-Options: nosniff. Stops browsers from guessing a
 *   response's content type, which can be abused for MIME confusion
 *   attacks.
 * - X-Frame-Options: DENY. Stops other sites from putting CaseLink in
 *   an iframe, which would otherwise allow clickjacking.
 * - Referrer-Policy: only send the referrer over same-origin requests,
 *   so visitors' previous URLs aren't leaked to third-party assets.
 * - Permissions-Policy: explicitly deny camera, mic, geolocation, and
 *   payment APIs. Defence-in-depth — none of these are used here.
 * - Content-Security-Policy: lenient but real. Restricts script and
 *   frame sources to known good origins (self + Calendly + Vercel
 *   assets + Web3Forms). 'unsafe-inline' is unfortunately required for
 *   Next.js's runtime + the inline JSON-LD blocks. A stricter nonce-
 *   based CSP is a follow-up if we ever add a Vercel WAF rule.
 */
const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Next.js + JSON-LD + Calendly widget all need inline + eval'd code.
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://assets.calendly.com https://calendly.com https://va.vercel-scripts.com",
      // Fonts and stylesheets — self-hosted Satoshi + Calendly widget CSS.
      "style-src 'self' 'unsafe-inline' https://assets.calendly.com",
      "font-src 'self' data:",
      // Images: site assets, Web3Forms badge, Vercel-optimised images, social previews.
      "img-src 'self' data: blob: https:",
      // Calendly popup runs in an iframe.
      "frame-src 'self' https://calendly.com https://*.calendly.com",
      // Web3Forms POST endpoint + Calendly tracking.
      "connect-src 'self' https://api.web3forms.com https://calendly.com https://*.calendly.com https://assets.calendly.com",
      // Stop the site from being framed by anyone else.
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self' https://api.web3forms.com",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Apply to every route, including the static-image responses
        // that Next.js auto-generates for opengraph-image.png etc.
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
