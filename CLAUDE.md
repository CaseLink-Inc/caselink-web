# CaseLink — Marketing Website

> Read this top-to-bottom before making any change. Then read the imported
> Next.js notes at the bottom.

## What this is

Marketing site for **CaseLink**, a HIPAA-compliant dental referral and
collaboration network for general dentists, specialists, and office
managers. Founder: Nick Campbell (Co-Founder, CEO). Based in Washington, DC.

- Marketing site (this repo): https://www.caselink.net
- Product (separate app): https://app.caselink.net
- Brand voice: calm, polished, traditional. **No em dashes, no ellipses, no
  semicolons in prose, no SaaS clichés, no emojis.** Always write the brand
  as `CaseLink` (capital C, capital L, no space).

## Tech stack

- **Next.js 16** (App Router, Turbopack). NOT the Next.js you may remember
  from training data. Read `@AGENTS.md` and the in-repo docs at
  `node_modules/next/dist/docs/` before writing routing or layout code.
- **React 19** + **TypeScript 5**.
- **Tailwind 4** via `@tailwindcss/postcss`. Tokens live in
  `app/globals.css` under `@theme`. Most actual styling is hand-written
  CSS with semantic class names (`.hero`, `.demo-stepper`, `.who-card`),
  not utility classes. Don't replace the semantic classes with Tailwind.
- **Self-hosted Satoshi** font family via `next/font/local` (10 weights
  in `public/fonts/`).
- **Third-party widgets**:
  - **Calendly** — floating "Schedule time with me" badge, mounted in
    `components/Calendly.tsx`. Loaded from `assets.calendly.com`.
  - **Web3Forms** — contact form submission target. Access key currently
    inlined in `components/contact/ContactForm.tsx`. POSTs to
    `api.web3forms.com/submit`. Optional override via
    `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY` env var.

## Repo layout

```
app/
  layout.tsx              Root layout: Satoshi font, metadata, JSON-LD,
                          Nav/Footer/RevealInit/Calendly
  page.tsx                Home — composed from components/home/*
  about/page.tsx          About (per-page metadata + canonical)
  contact/page.tsx        Contact (per-page metadata + canonical)
  login/, signup/,        Stubbed app shells. Not real auth.
  dashboard/              Disallowed in robots.txt.
  not-found.tsx           Custom animated 404 (broken-referral metaphor)
  sitemap.ts              Generates /sitemap.xml
  robots.ts               Generates /robots.txt — explicitly allows major
                          AI crawlers (GPTBot, ClaudeBot, Perplexity, etc.)
  icon.svg                Favicon (CaseLink mark with brand gradient)
  opengraph-image.png     1200x630 social preview
  twitter-image.png       Same
  globals.css             ~1500 lines. Bulk of styling. Mobile
                          breakpoints at 1100, 900, 640, 420.

components/
  Nav.tsx, Footer.tsx     Shared chrome. Both client components.
  Calendly.tsx            Mounts the Calendly badge widget once on load.
  BookCallButton.tsx      Wraps Calendly.initPopupWidget for inline buttons.
  RevealInit.tsx          Scroll-reveal observer. Re-runs on pathname change.
  icons.tsx               All SVG icons. Add new ones here.
  home/                   Section components for the home page.
  about/                  Timeline, DcMap, MarketStat.
  contact/                ContactForm (client, posts to Web3Forms).

lib/
  urls.ts                 LOGIN_URL and SIGNUP_URL constants pointing at
                          app.caselink.net. Use these, do not hardcode.

public/
  fonts/                  Satoshi OTF files (10).
  logo-primary.svg        Full color lockup (icon + wordmark).
  logo-primary-white.svg  White-on-dark variant.
  logo-mark.svg           Square color mark only.
  logo-mark-white.svg     White square mark.
  portrait.png            Nick — transparent PNG, 555x800.
  portrait-signature.jpg  Small Nick avatar for the About story.
  llms.txt                AI-friendly summary read by LLM crawlers.

next.config.ts            Security headers (HSTS, X-Frame-Options, CSP, etc.)
```

## Deployment

- **GitHub repo**: `CaseLink-Inc/caselink-web` (transferred from a
  personal account on 2026-05-14 — GitHub repo-redirect is in place).
- **Vercel**: the `caselink-web` project under the CaseLink Vercel team
  (logged in as `support@caselink.net`). Auto-deploys on every push to
  `main`. Branch deploys get preview URLs.
- **Custom domains**: `caselink.net`, `www.caselink.net`,
  `caselink-web.vercel.app`. The Vercel domain works as a fallback.
- **Env vars on Vercel** (Settings → Environment Variables):
  - `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY` (optional override — code has a
    safe default fallback so the form works even without it).

To ship a change:

```bash
git add -A && git commit -m "..." && git push
```

Vercel picks it up in ~30 seconds.

## Coding conventions

- **Server components by default.** Only mark `"use client"` when the
  component needs browser APIs, state, or hooks like `usePathname`.
- **Routing**: file-based via App Router. Read `next/dist/docs/01-app/`
  before adding routes or layouts.
- **Styling**:
  - Write semantic class names that mirror the ones in `globals.css`.
    Don't introduce parallel Tailwind utility-only styling.
  - Mobile breakpoints in this exact order: `1100px`, `900px`, `640px`,
    `420px`. Add mobile-only fixes inside the appropriate media query
    block, NOT to base styles. Desktop view is live and must not regress.
  - Verify both desktop and mobile widths before pushing visual changes.
- **Images**: use `next/image` with explicit `width`/`height` matching the
  source aspect. CSS handles final display size.
- **External links**: use `<a>` with `target="_blank" rel="noopener
  noreferrer"`. Internal navigation uses `next/link`.
- **CTAs to the product**: import from `lib/urls.ts`, never hardcode.
- **Brand mentions**: always `CaseLink`. The displayed email is
  `support@CaseLink.net` (mailto href keeps lowercase for compatibility).

## Recent significant changes (most recent first)

- **Email auth live**: SPF (`v=spf1 include:_spf.google.com ~all`), DKIM
  (2048-bit key at `google._domainkey.caselink.net`, activated in Google
  Admin 2026-05-18 — first test email returned `DKIM: PASS with domain
  caselink.net`), and DMARC at `_dmarc.caselink.net` in monitor mode
  (`p=none` with strict alignment, aggregate + forensic reports to
  `support@caselink.net`) all in place as of 2026-05-18. Tighten to
  `p=quarantine` then `p=reject` after 2 to 4 weeks of clean reports.
- **SEO + AIO + Security pass**: added `app/sitemap.ts`, `app/robots.ts`,
  `public/llms.txt`, JSON-LD Organization + WebSite schemas in the root
  layout, per-page metadata + canonicals for About and Contact, full
  security headers + CSP in `next.config.ts`.
- **Branded 404** (`/not-found.tsx`): animated SVG of two practice pins
  trying to reach each other through a broken middle.
- **OpenGraph image** added: `app/opengraph-image.png` (1200x630).
- **Mobile refinements**: bumped hero H1 to 48/40, unified all section
  H2s at 32/28 across breakpoints, asymmetric CTA padding to balance
  visible whitespace, dialled back hero blob opacities for headline
  readability, switched Trust ring positioning from offset-based to
  `inset`-based so they stay concentric at every shield size, hid
  Calendly badge on mobile (in-content Book a call buttons replace it),
  stacked the Product Tour Messages tab, drawer closes on every tap.
- **Calendly integration**: badge widget + popup, with a reusable
  `<BookCallButton>` for inline CTAs. Replaced the old "Get in touch"
  About CTA with a Calendly-bound "Book a call".
- **Contact form**: switched from FormSubmit (had activation issues) to
  Web3Forms. Now reliably delivers to `support@caselink.net`. From-name
  reads "CaseLink", Reply-To set to the submitter's email.
- **Brand assets**: official CaseLink Primary lockup wired into the nav,
  footer, demo-mockup sidebar, and dashboard sidebar. Satoshi replaces
  Plus Jakarta Sans across the entire site.
- **Footer redesign**: dark, three-column with brand + social icons
  (Facebook, Instagram, LinkedIn — real CaseLink URLs wired up), Pages,
  More pages, centered copyright.
- **Repo transfer**: moved from `sdkchamara/caselink-web` to
  `CaseLink-Inc/caselink-web`. Vercel re-linked, deployments uninterrupted.

## In progress / pending

### Immediate

- **DMARC tightening** — DMARC is currently in `p=none` monitor mode
  (deployed 2026-05-18). Watch the daily aggregate reports landing in
  `support@caselink.net`. After 2 weeks of clean reports (no legitimate
  mail failing alignment), edit the `_dmarc` TXT record in IONOS and
  change `p=none` to `p=quarantine`. After another 2 weeks clean, change
  to `p=reject`. Earliest tightening date: 2026-06-01.

### Recommended but not started

- **Privacy policy page** at `/privacy`, linked from the footer. Site
  uses Calendly (sets cookies) and Web3Forms (no persistent cookies).
  Disclosure is cheap insurance, no cookie banner needed.
- **Web3Forms reCAPTCHA**: toggle in the Web3Forms dashboard for spam
  protection on the contact form.
- **Submit sitemap** to Google Search Console + Bing Webmaster Tools.
- **Content strategy / blog** at `/resources` or `/blog`: the single
  biggest organic-traffic lever the site has. Target dental-referral
  long-tail queries.
- **Google Business Profile**: free, ~15 minutes, important for DC local
  dental searches.
- **Customer testimonials with `Review` JSON-LD**: when pilot practices
  go live and have quotes, this adds star ratings to search results.

## Don'ts

- **Don't break desktop while fixing mobile.** Scope mobile changes
  inside `@media (max-width: ...)` blocks. Verify both widths.
- **Don't regress brand voice.** No em dashes, no ellipses, no
  semicolons in prose, no SaaS clichés, no emojis.
- **Don't reintroduce Plus Jakarta Sans.** Satoshi is the brand font.
- **Don't add dead links** (Careers, Press, Privacy unless built, BAA
  template).
- **Don't replace the semantic CSS classes** in `globals.css` with
  Tailwind utility classes. The design system lives there.

---

@AGENTS.md
