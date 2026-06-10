// Resource library catalog.
//
// Each entry is the metadata + structured extras for one article. The
// prose body lives as a markdown file at content/resources/<slug>.md and
// is rendered by the article page. Editing an article = edit its .md file;
// changing stats/FAQs/sources = edit the entry here.

export type ResourceCategory =
  | "Referrals"
  | "Benchmarks"
  | "Software"
  | "Specialists"
  | "Operations"
  | "Getting started"
  | "Policy";

export type ResourceStat = { value: string; label: string };
export type ResourceFaq = { q: string; a: string };
export type ResourceSource = { label: string; url?: string };
export type ResourceLink = { href: string; label: string };

// Per-article layout so each piece reads differently instead of sharing one
// template. `stats` decides where the key-number block lands; `inserts` drops
// editorial devices (pull-quote, side/wide image, card slider) before a given
// H2 (1-based). Mix these differently per article so no two look alike.
export type ResourceInsert =
  | { before: number; kind: "quote"; text: string }
  | { before: number; kind: "figure"; variant: "wide" | "side"; side?: "left" | "right"; src?: string; alt?: string }
  | { before: number; kind: "slider"; cards: { title: string; body: string }[] };

export type ResourceLayout = {
  stats: "top" | "beforeFaq" | { beforeSection: number };
  inserts?: ResourceInsert[];
};

export type Resource = {
  slug: string;
  title: string;
  metaTitle: string;
  excerpt: string;
  category: ResourceCategory;
  author: string;
  /** ISO date, e.g. "2026-05-28" */
  date: string;
  readMinutes: number;
  /** Pulled-up headline numbers shown as a stat strip on the article. */
  keyStats: ResourceStat[];
  faqs: ResourceFaq[];
  sources: ResourceSource[];
  /** Contextual internal links shown in the article's "Related" block. */
  related: ResourceLink[];
  /** Controls per-article reading flow (stat-block + image positions). */
  layout: ResourceLayout;
  /** Card thumbnail image (16:9). Falls back to a shared default if unset. */
  thumbnail?: string;
  /** Descriptive alt text for the card thumbnail. Required when `thumbnail` is set. */
  thumbnailAlt?: string;
};

// Accent color per category, drawn from the marketing theme tokens.
export const CATEGORY_COLOR: Record<ResourceCategory, string> = {
  Referrals: "#3E8EFF",
  Benchmarks: "#FFA940",
  Software: "#3DBD6B",
  Specialists: "#3E8EFF",
  Operations: "#FFA940",
  "Getting started": "#3DBD6B",
  Policy: "#3DBD6B",
};

export const resources: Resource[] = [
  {
    slug: "cms-0062-p-fhir-dental-authorization",
    thumbnail: "/resources/card-thumbnail.jpg",
    thumbnailAlt:
      "The HL7 FHIR logo, the data standard CMS-0062-P proposes for prior authorization and referral certification.",
    layout: {
      stats: { beforeSection: 2 },
      inserts: [
        {
          before: 3,
          kind: "figure",
          variant: "side",
          side: "left",
          src: "/resources/fhir-side.jpg",
          alt: "The HL7 FHIR logo, the data standard CMS-0062-P proposes for prior authorization and referral certification.",
        },
        {
          before: 4,
          kind: "figure",
          variant: "wide",
          src: "/resources/fhir-wide.jpg",
          alt: "Federal interoperability is moving electronic prior authorization and referral certification toward FHIR-based exchange.",
        },
        {
          before: 5,
          kind: "quote",
          text: "Once federal-program payers are required to support FHIR, commercial payers historically follow within roughly 18 to 24 months.",
        },
      ],
    },
    title:
      "FHIR is coming to dental authorization workflows. Here is what CMS-0062-P actually proposes.",
    metaTitle: "FHIR and dental authorization: CMS-0062-P explained | CaseLink",
    excerpt:
      "The federal direction on prior authorization and referral certification is FHIR. Here is what CMS-0062-P actually proposes, what it does not, and what dental practices should do before the comment period closes June 15.",
    category: "Policy",
    author: "CaseLink Team",
    date: "2026-06-08",
    readMinutes: 5,
    keyStats: [
      { value: "June 15", label: "comment period closes (2026)" },
      { value: "Oct 2027", label: "proposed NCPDP compliance date" },
      { value: "18-24 mo", label: "before commercial payers typically follow" },
    ],
    faqs: [
      {
        q: "What is CMS-0062-P?",
        a: "It is a federal proposed rule, released April 10, 2026, titled the “2026 CMS Interoperability Standards and Prior Authorization for Drugs Proposed Rule.” Its headline is drug prior authorization, but it also proposes adopting HL7 FHIR implementation guides as HIPAA standards for prior authorization and referral certification transactions, including dental.",
      },
      {
        q: "Does CMS-0062-P require dental practices to use a specific referral platform?",
        a: "No. The rule does not endorse or require any platform. It standardizes how electronic prior authorization and referral certification data moves between HIPAA covered entities and names FHIR as that standard.",
      },
      {
        q: "When does the comment period close?",
        a: "June 15, 2026. Comments can be submitted through the ADA's process or directly through regulations.gov under file code CMS-0062-P.",
      },
      {
        q: "How could this affect small or rural dental practices?",
        a: "CMS is considering eliminating the Direct Data Entry exception that lets offices submit claims, benefit verification, and prior authorizations through payer web portals. Practices that rely on those portals would face a direct operational change.",
      },
      {
        q: "What should a dental practice do now?",
        a: "If you file prior authorizations electronically, review the ADA's three dental-specific concerns and decide whether to comment before June 15. If you are choosing a referral or authorization tool, ask vendors how they plan to support FHIR-based exchange and how their architecture handles structured authorization data.",
      },
    ],
    sources: [
      {
        label:
          "CMS, “2026 CMS Interoperability Standards and Prior Authorization for Drugs Proposed Rule” fact sheet, April 10, 2026.",
        url: "https://www.cms.gov/newsroom/fact-sheets/2026-cms-interoperability-standards-prior-authorization-drugs-proposed-rule",
      },
      {
        label:
          "American Dental Association, “ADA seeks input on proposed CMS rule on interoperability, prior authorization,” May 2026.",
        url: "https://adanews.ada.org/ada-news/2026/may/ada-seeks-input-on-proposed-cms-rule-on-interoperability-prior-authorization/",
      },
      {
        label:
          "Federal Register, Proposed Rule, document 2026-07205, April 14, 2026.",
      },
    ],
    related: [
      { href: "/#how", label: "How it works" },
      { href: "/privacy", label: "HIPAA and privacy" },
    ],
  },
  {
    slug: "how-to-stop-losing-dental-referrals",
    layout: {
      stats: "top",
      inserts: [
        {
          before: 2,
          kind: "quote",
          text: "Half the week's referrals, gone before lunch. There was simply no thread connecting the two offices once the patient walked out the door.",
        },
        { before: 3, kind: "figure", variant: "side", side: "right" },
      ],
    },
    title: "How to stop losing dental referrals to specialists",
    metaTitle: "How to stop losing dental referrals | CaseLink",
    excerpt:
      "About a third of dental referrals never become treatment. Here is where they break down, what each lost case costs, and how to close the gap.",
    category: "Referrals",
    author: "CaseLink Team",
    date: "2026-05-25",
    readMinutes: 6,
    keyStats: [
      { value: "30-40%", label: "of paper referrals never become treatment" },
      { value: "$2,500", label: "average specialty case value" },
      { value: "$30,000", label: "a year per recovered monthly referral" },
    ],
    faqs: [
      {
        q: "What percentage of dental referrals fail?",
        a: "Industry surveys reported through DentistryIQ put the figure at roughly 30 to 40 percent of paper referrals where the patient is told to call the specialist. The rate moves with specialty, geography, and how the handoff is managed, but the gap between offices is the consistent driver.",
      },
      {
        q: "Why do dental referrals fail?",
        a: "Most fail because of a visibility gap. Once the referral leaves the GP, neither office shares a system to confirm the patient called, booked, or accepted treatment. The patient is left to carry the handoff alone, and many do not.",
      },
      {
        q: "How much does a lost dental referral cost?",
        a: "At an average specialty case value near $2,500, each lost referral is about $2,500 in production the specialist never sees. For a GP sending 20 referrals a month, a third going quiet adds up to roughly $180,000 a year in lost specialty production across their referral network.",
      },
      {
        q: "What is a closed-loop referral?",
        a: "A referral where both the sending GP and the receiving specialist can see every stage from send to completion. The loop closes when the outcome is recorded and visible to both offices.",
      },
      {
        q: "Is there free referral software for general dentists?",
        a: "Yes. CaseLink's GP tier is permanently free, covering referral creation, status tracking, secure messaging, and file sharing. Specialists are the paying side.",
      },
      {
        q: "Can I use it alongside my existing practice management system?",
        a: "Yes. CaseLink runs alongside Dentrix, Eaglesoft, Open Dental, and others. It handles the referral and the communication between offices. Scheduling, billing, and charting stay where they are.",
      },
    ],
    sources: [
      {
        label:
          "“How to stop losing patients through the referral cracks,” DentistryIQ",
        url: "https://www.dentistryiq.com/practice-management/patient-relationships/article/14182218/how-to-stop-losing-patients-through-the-referral-cracks",
      },
    ],
    related: [
      { href: "/#how", label: "How it works" },
      { href: "/#network", label: "The network" },
    ],
  },
  {
    slug: "free-dental-referral-software-for-general-dentists",
    layout: {
      stats: "top",
      inserts: [
        {
          before: 2,
          kind: "slider",
          cards: [
            {
              title: "Free trial",
              body: "A window, usually 14 to 30 days, after which you are billed or locked out. Costs nothing to test, solves nothing about long-term adoption.",
            },
            {
              title: "Freemium",
              body: "The basics are free and the parts you actually need sit behind a paywall: tracking, reporting, secure messaging, record sharing.",
            },
            {
              title: "Free for one side",
              body: "In a two-sided network the specialist pays and the general dentist sends at no charge. No time limit, no throttle, no card. This is how CaseLink works.",
            },
          ],
        },
        { before: 4, kind: "figure", variant: "wide" },
      ],
    },
    title: "Free dental referral software for general dentists",
    metaTitle: "Free dental referral software for GPs | CaseLink",
    excerpt:
      "CaseLink is a HIPAA aligned referral platform where general dentists send referrals, track status, and message specialists at no cost. No trial. No credit card.",
    category: "Getting started",
    author: "CaseLink Team",
    date: "2026-05-25",
    readMinutes: 6,
    keyStats: [
      { value: "$0", label: "permanently free for general dentists" },
      { value: "30-40%", label: "of paper referrals fail without tracking" },
      { value: "<30 min", label: "from sign-up to first referral" },
    ],
    faqs: [
      {
        q: "Is CaseLink really free for general dentists?",
        a: "Yes. The GP tier is permanently free, with no trial period, no feature gate on the core referral workflow, and no credit card. GPs create an account, complete a profile, and start sending.",
      },
      {
        q: "Does it work with Dentrix, Eaglesoft, or Open Dental?",
        a: "It works alongside them without replacing them. There is no data-level integration today. Scheduling and billing stay in your system. CaseLink handles the referral workflow and case communication.",
      },
      {
        q: "Is CaseLink HIPAA aligned?",
        a: "Yes. End-to-end encryption and audit logs across all case activity, with Business Associate Agreements available to subscribed specialist practices.",
      },
      {
        q: "What if the specialist I want is not on CaseLink?",
        a: "Invite them from the referral screen. The invitation takes under a minute. They get an email, create an account, and accept the referral once set up.",
      },
      {
        q: "Can office managers and front desk staff run it?",
        a: "Yes. CaseLink is built for the full front office. Staff can create referrals, manage communication, and track status without the dentist in the administrative loop.",
      },
      {
        q: "How long does setup take?",
        a: "Under 30 minutes from account creation to first referral. It runs in the browser, so there is nothing to install.",
      },
    ],
    sources: [
      {
        label: "“How to stop losing patients through the referral cracks,” DentistryIQ",
        url: "https://www.dentistryiq.com/practice-management/patient-relationships/article/14182218/how-to-stop-losing-patients-through-the-referral-cracks",
      },
    ],
    related: [
      { href: "/#pricing", label: "Pricing" },
      { href: "/#how", label: "How it works" },
    ],
  },
  {
    slug: "dental-referral-conversion-rate-benchmarks",
    layout: {
      stats: { beforeSection: 3 },
      inserts: [
        { before: 2, kind: "figure", variant: "side", side: "right" },
        {
          before: 5,
          kind: "quote",
          text: "The single most referenced number on dental referral completion is nearly two decades old. That gap is itself the finding.",
        },
        { before: 6, kind: "figure", variant: "wide" },
      ],
    },
    title: "What a healthy dental referral conversion rate actually looks like",
    metaTitle: "Dental referral conversion rate benchmarks | CaseLink",
    excerpt:
      "Case acceptance and referral conversion are different metrics. Here is what the data says about each stage of the funnel, and where the biggest losses happen.",
    category: "Benchmarks",
    author: "CaseLink Team",
    date: "2026-05-28",
    readMinutes: 8,
    keyStats: [
      { value: "46%", label: "of specialist referrals unfulfilled (Kelton, 2008)" },
      { value: "35-45%", label: "end-to-end conversion on manual systems" },
      { value: "60-70%", label: "with digital coordination (vendor estimates)" },
    ],
    faqs: [
      {
        q: "What is the difference between case acceptance and referral conversion?",
        a: "Case acceptance measures whether a patient in the chair says yes to a proposed treatment, with a national average around 50 to 60 percent (Levin Group, 2021). Referral conversion measures whether a patient referred by a GP reaches the specialist's chair at all. Different metrics, different problems.",
      },
      {
        q: "What is a good dental referral conversion rate?",
        a: "Published benchmarks do not exist the way case acceptance benchmarks do. Based on available data, a working target for a practice using digital coordination is 50 to 60 percent end to end. Practices on manual systems likely convert at 35 to 45 percent. These are synthesis estimates, not industry standards.",
      },
      {
        q: "Where do most dental referrals fail?",
        a: "Between the GP's office and the specialist's phone. The 2008 Kelton study found 46 percent of specialist referrals went unfulfilled nationally. The patient receives a paper referral and never contacts the specialist. That single stage accounts for more lost cases than any other.",
      },
      {
        q: "How can a specialist practice measure conversion?",
        a: "It requires a system both offices share, so both sides of the referral are visible. CaseLink tracks each stage from Referral Received through Treatment Accepted, with reporting that shows conversion by stage and flags where cases stall.",
      },
      {
        q: "Why do younger patients have higher referral failure rates?",
        a: "The Kelton study found 50 percent of patients aged 18 to 49 disregarded specialist referrals, against 39 percent of those 50 and older. Younger patients are more likely to delay because symptoms feel less urgent, scheduling feels inconvenient, or the slip is lost before they act.",
      },
      {
        q: "Does CaseLink work with existing practice management systems?",
        a: "Yes. It works alongside Dentrix, Eaglesoft, Open Dental, and others. It handles the referral workflow between offices, a layer those systems were not built to cover, and does not replace them.",
      },
    ],
    sources: [
      {
        label: "Kelton Research (2008), via DentistryIQ. Nearly half of specialist referrals go unfulfilled",
        url: "https://www.dentistryiq.com/practice-management/industry/article/16369779/study-nearly-half-of-referrals-made-to-dental-specialists-go-unfulfilled",
      },
      {
        label: "Veritas Dental Resources, “Case Acceptance in Dentistry” (references Levin Group 2021)",
        url: "https://veritasdentalresources.com/post/case-acceptance-in-dentistry-whats-normal-whats-ideal-and-how-to-improve-it",
      },
      {
        label: "PracticeNumbers, “Tracking Case Acceptance Rates for Dental Practice Growth”",
        url: "https://practicenumbers.com/blog/tracking-case-acceptance-rates-for-dental-practice-growth/",
      },
      {
        label: "DCM Moguls, “Fast Dental Follow-Up Wins Patients in 2026”",
        url: "https://dcmmoguls.com/fast-dental-patient-follow-up-how-response-time-wins-more-patients-in-2026/",
      },
      {
        label: "First Page Sage, “Patient Conversion Rate by Practice Type: 2025 Report”",
        url: "https://firstpagesage.com/reports/patient-conversion-rate-by-practice-type/",
      },
    ],
    related: [
      { href: "/#how", label: "How it works" },
      { href: "/#pricing", label: "Pricing" },
    ],
  },
  {
    slug: "how-endodontists-track-and-manage-incoming-referrals",
    thumbnail: "/resources/endodontists-card.jpg",
    thumbnailAlt:
      "A dental specialist consults with a patient in the operatory while a coordinator works at the front desk station.",
    layout: {
      stats: { beforeSection: 3 },
      inserts: [
        {
          before: 2,
          kind: "figure",
          variant: "side",
          side: "left",
          src: "/resources/endodontists-side.jpg",
          alt: "An endodontist reviews case records on a laptop in the clinic, with a colleague visible in the background.",
        },
        {
          before: 5,
          kind: "quote",
          text: "The strongest endo practices share one trait: a reliable set of GPs who send cases consistently.",
        },
      ],
    },
    title: "How endodontists track and manage incoming referrals",
    metaTitle: "Referral management for endodontists | CaseLink",
    excerpt:
      "Endodontists depend on GP referrals for most new patients. A referral platform gives the practice visibility from intake through treatment.",
    category: "Specialists",
    author: "CaseLink Team",
    date: "2026-05-28",
    readMinutes: 6,
    keyStats: [
      { value: "80-120", label: "referrals a month at a mid-size endo practice" },
      { value: "$2,500", label: "average root canal case value" },
      { value: "$150,000", label: "a year from five recovered cases a month" },
    ],
    faqs: [
      {
        q: "Do I need to replace my practice management system?",
        a: "No. A referral platform handles the handoff between offices. Charting, imaging, and billing stay in the system you already use. CaseLink works alongside TDO, Dentrix, Eaglesoft, Open Dental, and others.",
      },
      {
        q: "How do I get my referring GPs to use it?",
        a: "CaseLink is free for general dentists. No trial, no card, no feature limit on sending referrals. Inviting a GP takes under a minute from the referral screen. Most adopt because it cuts their phone follow-up.",
      },
      {
        q: "Is the platform HIPAA aligned?",
        a: "Yes. End-to-end encryption and audit logs for all case activity. Business Associate Agreements are available to subscribed specialist practices.",
      },
      {
        q: "Can my front desk manage referrals without me?",
        a: "Yes. CaseLink is built for office managers and front desk teams. Staff can accept referrals, update status, message referring offices, and run the pipeline without clinical involvement in the administrative steps.",
      },
      {
        q: "What if a referring GP is not on CaseLink yet?",
        a: "Invite them from the platform. They get an email, create a free account, and can send referrals right away.",
      },
      {
        q: "How do I track which GPs send the most?",
        a: "CaseLink reports on referral volume, source attribution, and completion by referring practice over any time period.",
      },
    ],
    sources: [
      {
        label: "“How to stop losing patients through the referral cracks,” DentistryIQ",
        url: "https://www.dentistryiq.com/practice-management/patient-relationships/article/14182218/how-to-stop-losing-patients-through-the-referral-cracks",
      },
    ],
    related: [
      { href: "/#network", label: "The network" },
      { href: "/#pricing", label: "Pricing" },
    ],
  },
  {
    slug: "automate-dental-referral-follow-up",
    layout: {
      stats: { beforeSection: 2 },
      inserts: [
        {
          before: 3,
          kind: "quote",
          text: "A referred patient who has not booked within a couple of days probably never will.",
        },
        { before: 5, kind: "figure", variant: "wide" },
      ],
    },
    title: "What changes when a dental practice automates referral follow-up",
    metaTitle: "Automate dental referral follow-up | CaseLink",
    excerpt:
      "Most referral follow-up relies on phone calls no one has time to make. Automated status updates recover the referrals that fail silently.",
    category: "Operations",
    author: "CaseLink Team",
    date: "2026-05-28",
    readMinutes: 6,
    keyStats: [
      { value: "~48 hrs", label: "window before a referral usually goes cold" },
      { value: "30-40%", label: "paper referrals that never become treatment" },
      { value: "30-60 min", label: "a day lost to manual follow-up calls" },
    ],
    faqs: [
      {
        q: "What does automated dental referral follow-up actually do?",
        a: "It sends triggered notifications at each stage of the referral lifecycle. When a GP refers, the specialist receives the case immediately and the patient gets a prompt to schedule. If the patient has not booked inside the follow-up window, a reminder fires. Both offices see status updates without phone calls.",
      },
      {
        q: "How much time does manual follow-up take?",
        a: "Front desk staff at specialist practices commonly spend 30 to 60 minutes a day on follow-up calls to referring offices and patients. That time competes directly with answering incoming calls and managing the schedule.",
      },
      {
        q: "Does automating it require new staff or hardware?",
        a: "No. It replaces outbound calls with triggered notifications through a web platform. CaseLink runs in any modern browser. The front desk still manages patient interactions, but the follow-up loop runs through the platform instead of the phone.",
      },
      {
        q: "Is there really a window after which referrals rarely convert?",
        a: "Yes. Industry observation puts the window at roughly 48 hours: past that, a referred patient who has not booked is far less likely to ever book. The precise threshold varies by patient and specialty, but speed of follow-up consistently tracks with completion.",
      },
      {
        q: "Is CaseLink HIPAA aligned?",
        a: "Yes. End-to-end encryption, audit logs, and Business Associate Agreements available to subscribed specialists.",
      },
      {
        q: "How much does CaseLink cost?",
        a: "Free for general dentists. Specialists pay $299 a month with 10 percent off annual billing. Enterprise pricing is available for DSOs and multi-location groups.",
      },
    ],
    sources: [
      {
        label: "Kelton Research (2008), via DentistryIQ. Nearly half of specialist referrals go unfulfilled",
        url: "https://www.dentistryiq.com/practice-management/industry/article/16369779/study-nearly-half-of-referrals-made-to-dental-specialists-go-unfulfilled",
      },
      {
        label: "“How to stop losing patients through the referral cracks,” DentistryIQ",
        url: "https://www.dentistryiq.com/practice-management/patient-relationships/article/14182218/how-to-stop-losing-patients-through-the-referral-cracks",
      },
      {
        label: "DCM Moguls, “Fast Dental Follow-Up Wins Patients in 2026”",
        url: "https://dcmmoguls.com/fast-dental-patient-follow-up-how-response-time-wins-more-patients-in-2026/",
      },
    ],
    related: [
      { href: "/#how", label: "How it works" },
      { href: "/#network", label: "The network" },
    ],
  },
];

export function getResources(): Resource[] {
  return [...resources].sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getResource(slug: string): Resource | undefined {
  return resources.find((r) => r.slug === slug);
}

export function formatResourceDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return `${months[m - 1]} ${d}, ${y}`;
}
