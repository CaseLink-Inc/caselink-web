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
- **Image alt text**: ALWAYS write descriptive alt text for every content
  image at the time it is added (resource card thumbnails, article wide/side
  figures, the `/resources` hero, etc.), for SEO and accessibility. Never ship
  a content image without it. Purely decorative images use `alt=""`. This is a
  standing instruction — do it automatically, do not ask each time.
- **External links**: use `<a>` with `target="_blank" rel="noopener
  noreferrer"`. Internal navigation uses `next/link`.
- **CTAs to the product**: import from `lib/urls.ts`, never hardcode.
- **Brand mentions**: always `CaseLink`. The displayed email is
  `support@CaseLink.net` (mailto href keeps lowercase for compatibility).

## Recent significant changes (most recent first)

- **Investor snapshot at `/investors`** (unlisted, fully rebuilt): six
  cohesive panels — Hero / The round / Today / Three-year trajectory /
  Where it goes / Contact — plus a sticky top nav and a confidential
  footer. The 12-section pitch-deck-style version is gone. Page is
  light-theme only, Satoshi-only (no monospaced font), with subtle
  ambient gradient meshes alternating across sections instead of
  flat-white. Panel chrome is unified across all sections: 1px border,
  20px radius, soft drop shadow, header bar with a section number pill
  + sentence-case title + optional status badge (Open / Live / meta).
  Every panel has a mouse-follow blue radial spotlight on hover (sets
  `--mx` / `--my` CSS vars, see `<Panel>` in `InvestorsContent.tsx`).
  Top nav: sticky, transparent, real `logo-primary.svg` lockup on
  left, small "caselink.net" home link, light-touch translucent-white
  "Talk to Nick" pill on the right with a thin rotating conic-gradient
  outline (`@property --inv-angle` keyframe). All "Talk to Nick" CTAs
  page-wide route to Calendly via `BookCallButton`; mailto fallback
  only on the Pitch-deck request. Hero is centred: live `● 12
  practices live in the DMV` pill, tight headline `$500,000 pre-seed.
  $4M cap. V1 shipped. Round open.`, lede, two CTAs. Hero has a 60px
  grid overlay (5% alpha, masked radial). The round is a 4-tile grid
  (Valuation cap, Discount, Equity at cap, Year 3 ARR), no big $500K
  headline (that lives in the hero), 1px hairline accent on hover.
  Today wears a "live activity" strip at the top — `ReferralJourney`
  SVG component (GP → CaseLink hub → Specialist with a small triangle
  that travels under the hub on a 6s loop, fill colour shifts blue →
  mint → green; the hub centre is a generous white circle with the
  CaseLink mark inside and one outer rotating dashed orbital ring;
  the live revenue counter ticks $0 → $2,500 in sync). Below that,
  4 metric cells with unified typography (icon + big number + label +
  caption — no sparklines, no dots, no progress rings). The plan
  panel shows a 3-bar ARR chart (`AnimatedBar` grows on scroll, bars
  flex into available chart height) over the full metrics table; ARR
  row is bold blue but no longer has a gradient tint. Where it goes
  is a 3-column flow viz on desktop ($500K source on the left, two
  thin dashed gradient pipes with small `r=2.5` dot particles
  travelling left-to-right via `preserveAspectRatio="xMidYMid meet"`,
  two destination cards stacked on the right). Year 1 targets are
  card rows with brand-tinted icons and same-size number + unit
  ($610K not $610<small>K</small>). Contact: two-column on desktop —
  Nick's portrait (`object-position: center top` so the head doesn't
  crop) inside a circular frame with two counter-rotating dashed
  orbital rings, plus a 4-button grid (Book a call → Calendly,
  Platform → app.caselink.net, Website → /, Pitch deck → mailto), and
  a direct contact strip (email · phone) with no underlines. Page
  hides marketing Nav and Footer via `body[data-inv-page="true"]`
  set in `useEffect`. Metadata `robots: { index: false, follow: false,
  nocache: true }` plus matching googleBot directives. Not in nav,
  footer, sitemap, robots.ts, or llms.txt. Components:
  `app/investors/page.tsx` (server, metadata) +
  `components/investors/InvestorsContent.tsx` (client, ~600 lines
  with Counter / AnimatedBar / CircleProgress / PracticeDots / Panel
  / useMouseFollow inline helpers) + `components/investors/Refer
  ralJourney.tsx`. CSS in `globals.css` under the `.inv-*` namespace
  with 1100 / 900 / 640 responsive blocks (panel grids reflow to 2x2
  and then 1-col, the Where flow SVG hides on mobile and is replaced
  with a thin downward fade-line, hero CTAs go full-width). Heavily
  iterated through ~10 visual rebuilds — current state is the result
  of feedback "remove decorative shapes / no animated section breakers
  / consistent panel chrome / mouse-follow spotlight / unified
  typography in Today / thin hover lines / triangle passes under the
  hub / dots not eggs / no underlines on contact links".
- **Mobile LCP fix**: PageSpeed measured mobile LCP at 5.0s on the home
  page (desktop was 1.0s / Performance 97). Root cause was the chain
  of hero entrance animations — h1 line rise, sub fadeUp, CTA fadeUp,
  meta fadeUp, hero-visual fadeUp with 0.3 to 0.7s delays and 0.9 to
  1.2s durations — stalling the largest paint on mobile CPU. Fix at
  the bottom of `globals.css`: `@media (max-width:900px)` disables
  those entrance animations and freezes the four infinite blob drift
  animations (`animation:none; transform:none; opacity:1`). Desktop
  experience unchanged (animations still active above 900px viewport).
  Also added a `@media (prefers-reduced-motion: reduce)` block as
  baseline accessibility — any user with reduced motion preference
  gets near-instant transitions across the site.
- **AEO + SEO pass (home page)**: home page now renders four JSON-LD
  blocks in the server HTML — Organization and WebSite from the root
  layout, plus SoftwareApplication and FAQPage scoped to the home page
  itself. SoftwareApplication declares `applicationCategory:
  BusinessApplication`, `operatingSystem: Web`, an AggregateOffer
  spanning the free GP plan and the $299/month specialist plan, and a
  featureList. FAQPage mirrors the visible accordion at
  `components/home/Faq.tsx` (six Q&As covering HIPAA, fax/email
  comparison, pricing, free GP plan, attachable clinical info, BAA).
  The accordion uses native `<details>`/`<summary>` so every answer is
  in the DOM without JS interaction. `public/llms.txt` refreshed to
  add `/privacy` to Key pages and to reflect the verified Arlington VA
  headquarters address. Phone number kept in llms.txt by design for
  consistency with the contact page and Organization JSON-LD.
- **Privacy policy page** at `/privacy`. Server component with per-page
  metadata + canonical, hero (eyebrow + h1 + lead + effective date),
  TOC card with 14 anchored sections, body sections with full legal
  copy, and a contact card at the bottom listing the Arlington office.
  Styles added to `globals.css` under the `.privacy-*` namespace.
  Footer in `components/Footer.tsx` now exposes the link in the More
  pages column. `app/sitemap.ts` lists `/privacy` at priority 0.3.
  Cookie section (§6) names hCaptcha and Calendly explicitly so the
  disclosure matches what the site actually loads.
- **Google Business Profile**: created and verified on 2026-05-18.
  Listed as **CaseLink, Inc.**, category "Software company", at 124 S
  Wise St, Arlington, VA 22204. Hours: open 24 hours. CID
  `12643817021776002590`. Direct Maps URL:
  `https://www.google.com/maps?cid=12643817021776002590`. Profile
  strength reads "Looks good!" in the dashboard. Phone number not yet
  added — pending follow-up to surface `+1 (703) 554-3449` on the GBP
  so mobile users can tap-to-call from the Maps card. Verified-but-new
  listings rank near zero for unbranded local queries; branded
  searches (e.g. `CaseLink`) surface the knowledge panel already.
- **Search Console + Bing Webmaster Tools**: `sitemap.xml` submitted to
  both on 2026-05-18.
- **Contact form spam protection**: hCaptcha wired into the contact
  form via Web3Forms's hosted widget (no external site key needed).
  Submissions without a solved `h-captcha-response` token are blocked
  both client-side (clear inline error) and at the Web3Forms layer.
  CSP in `next.config.ts` extended to allow `hcaptcha.com`,
  `*.hcaptcha.com`, and `web3forms.com` for script, style, frame, and
  connect sources. Dashboard toggle confirmed on 2026-05-18.
- **DMARC first-day report (2026-05-18)**: Microsoft Outlook aggregate
  report observed 2 messages from `em110.caselink.net` (SendGrid
  relay) → `nvorthodontics.com` with `header_from: caselink.net`. DKIM
  signs cleanly with selector `s1` against `caselink.net` and aligns,
  so DMARC PASSES end-to-end despite SPF alignment failing under
  strict mode (envelope is a subdomain). The product app is using
  SendGrid for transactional referral notifications — not Google
  Workspace. Tightening to `p=quarantine` is safe on this evidence
  because DKIM alignment is the load-bearing signal. If DKIM ever
  breaks, consider flipping `aspf=s` to `aspf=r` so the SendGrid
  subdomain counts as aligned for SPF too.
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

### Scheduled / time-gated

- **DMARC tightening — `p=quarantine` LIVE as of 2026-06-11** (verified
  on all four IONOS authoritative nameservers). Basis: full
  aggregate-report audit on 2026-06-10 (24 reports from Google,
  Microsoft, and Yahoo covering May 20 to June 4): 150 messages, 150
  DMARC passes, zero failures. Google Workspace mail passes aligned
  DKIM + SPF; SendGrid (`em110.caselink.net`) passes via aligned DKIM
  (selector `s1`) as designed. No spoofing observed. Remaining step:
  flip `quarantine` → `reject` around 2026-06-24 after ~2 weeks of
  clean reports (same TXT record, one word changes). Verify with
  `dig +short TXT _dmarc.caselink.net`.

### Recommended but not started

- **Content strategy / blog** at `/resources` or `/blog`: the single
  biggest organic-traffic lever the site has. Target dental-referral
  long-tail queries.
- **Customer testimonials with `Review` JSON-LD**: when pilot practices
  go live and have quotes, this adds star ratings to search results.
- **Terms of Service page** at `/terms`: currently no link to it
  anywhere (the privacy policy was scoped to drop the `/terms`
  reference to avoid a dead link). Worth adding when ready.
- **Investor page polish items** (low priority, awaiting feedback):
  Laura's real photo (currently LC initials avatar — replaced by an
  inline JSX swap on `InvestorsContent.tsx`); real backer SVG/PNG
  logos (currently text spans `nxtMOVE / NEWHOLD / VISA / KASU /
  Blaze Technologies` in the older versions, now removed from the
  6-section snapshot — re-add if Nick wants logos back); Google
  Business Profile phone number is intentionally not added because
  the public number attracts robocaller spam (user decision).

### Decisions made this session worth remembering

- **Public phone policy**: number is kept on the marketing contact
  page and in the Organization JSON-LD, but intentionally NOT added
  to the Google Business Profile (mass-scraped, drives robocaller
  spam). Same number is in `llms.txt` by design for consistency.
- **DMARC `rua` inbox**: aggregate reports go to `support@caselink.net`
  by design. If the volume becomes annoying, three options for Nick:
  (1) Gmail filter to skip-inbox + label "DMARC", (2) free dashboard
  like dmarcian.com or dmarc.postmarkapp.com, (3) move `rua` to a
  dedicated `dmarc@caselink.net` alias via an IONOS DNS edit.
- **Investor page metaphor**: each section is one substantial PANEL
  with consistent chrome (header bar with number / title / status),
  NOT a scatter of decorative cards. Mouse-follow spotlight on every
  panel for live feel. Light theme everywhere, no dark sections,
  Satoshi only (the spec at `/Users/kasu/Downloads/CaseLink_Investor_
  Snapshot_Content.md` was the source of truth — re-read it before
  making structural changes).
- **Top-nav CTA on `/investors`**: light-touch translucent-white pill
  with thin rotating conic-gradient outline, NOT a heavy gradient
  body. The user explicitly rejected the heavy variant.
- **Where-it-goes flow viz**: must be small perfect dots (r=2.5 / r=2)
  using `preserveAspectRatio="xMidYMid meet"`, NEVER stretched
  ellipses. Lines are thin (1.5-2px dashed), NEVER thick blocks.
- **Today hub centre**: must be a generous white circle with the real
  `/logo-mark.svg` inside, with breathing room. NOT a dark sphere
  with "CL" text. The traveling triangle must pass UNDER the hub
  (hub is drawn LAST in SVG order).
- **Terms of Service page** at `/terms`. Currently no link to it
  anywhere (the privacy policy was scoped to drop the `/terms`
  reference to avoid a dead link). Worth adding when ready.

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
