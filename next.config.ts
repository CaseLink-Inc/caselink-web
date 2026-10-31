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
  // SAMEORIGIN rather than DENY so the home page can frame its own
  // /intro animation. Other sites still cannot frame CaseLink.
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
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
      // googletagmanager.com serves the GA4 gtag.js library.
      // links.caselink.net serves the LeadConnector CRM tracker.
      // The CaseLink live chat widget loads from widgets.leadconnectorhq.com,
      // pulls helpers from stcdn + services.leadconnectorhq.com, and runs a
      // Cloudflare Turnstile spam check from challenges.cloudflare.com.
      // blob: is needed by the /intro animation bundle, which instantiates its
      // own modules as blob URLs. Same-origin code has to be running already to
      // create one, so alongside the 'unsafe-eval' above it adds no real reach.
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://assets.calendly.com https://calendly.com https://va.vercel-scripts.com https://web3forms.com https://*.hcaptcha.com https://hcaptcha.com https://www.googletagmanager.com https://links.caselink.net https://widgets.leadconnectorhq.com https://services.leadconnectorhq.com https://stcdn.leadconnectorhq.com https://challenges.cloudflare.com",
      // The animation decodes its voiceover and music into blob URLs.
      // The live chat widget plays a new-message sound from its own host.
      "media-src 'self' blob: data: https://widgets.leadconnectorhq.com",
      "worker-src 'self' blob:",
      // Fonts and stylesheets — self-hosted Satoshi + Calendly widget CSS.
      // The live chat widget loads its CSS from LeadConnector and its Roboto
      // font from fonts.bunny.net.
      "style-src 'self' 'unsafe-inline' https://assets.calendly.com https://*.hcaptcha.com https://hcaptcha.com https://widgets.leadconnectorhq.com https://stcdn.leadconnectorhq.com https://fonts.bunny.net",
      "font-src 'self' data: https://fonts.bunny.net",
      // Images: site assets, Web3Forms badge, Vercel-optimised images, social previews.
      "img-src 'self' data: blob: https:",
      // Calendly popup runs in an iframe. hCaptcha challenge also iframed.
      // The live chat widget's Turnstile check renders in a Cloudflare iframe.
      "frame-src 'self' https://calendly.com https://*.calendly.com https://*.hcaptcha.com https://hcaptcha.com https://challenges.cloudflare.com",
      // Web3Forms POST + Calendly tracking + hCaptcha verification + GA4 collect.
      // GA4 beacons go to the bare analytics.google.com apex (not covered by
      // the *.analytics.google.com wildcard), and with Google signals enabled
      // also to www.google.com/g/collect and stats.g.doubleclick.net.
      // links.caselink.net + backend.leadconnectorhq.com receive the CRM
      // tracker's form-submission reports. widgets + services.leadconnectorhq.com
      // carry the live chat widget's config and messages (replies arrive over
      // a wss:// socket on services.leadconnectorhq.com), and
      // services.msgsndr.com (LeadConnector's other host) its visitor session.
      "connect-src 'self' https://api.web3forms.com https://calendly.com https://*.calendly.com https://assets.calendly.com https://*.hcaptcha.com https://hcaptcha.com https://www.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://analytics.google.com https://stats.g.doubleclick.net https://www.google.com https://links.caselink.net https://backend.leadconnectorhq.com https://widgets.leadconnectorhq.com https://services.leadconnectorhq.com wss://services.leadconnectorhq.com https://services.msgsndr.com",
      // Stop the site from being framed by anyone else. 'self' (not 'none')
      // so the home page can embed its own /intro animation in an iframe.
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self' https://api.web3forms.com",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  images: {
    // Next 16 rejects any quality not listed here, so asking for a higher
    // one in a component without this returns an error instead of an
    // image. 92 is for the hero: its ground is a smooth gradient, and
    // gradients band at the default 75 where photographs do not.
    qualities: [75, 92],
  },
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
  async rewrites() {
    return [
      {
        // Tips deck (static, self-contained page in public/). The platform
        // footer links here. Clean URL without the .html extension.
        source: "/tips",
        destination: "/tips.html",
      },
    ];
  },
  async redirects() {
    return [
      {
        // Dentrix referral-software article pulled until the integration
        // ships. Temporary (the article will return), so not a 308.
        // Remove this entry when the article is republished.
        source: "/resources/dental-referral-software-that-works-alongside-dentrix",
        destination: "/resources",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
