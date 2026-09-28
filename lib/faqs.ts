/**
 * FAQ hub content for /faqs. Every answer here restates a fact already
 * published elsewhere on the site (home FAQ, pricing, /security, the DC
 * page, article FAQs). Do not introduce new claims here without checking
 * them with Nick first. The FAQPage JSON-LD on /faqs is generated from
 * this list, so the visible page and the schema always match.
 */

/** `guide` is a Resources article slug, rendered as a "Read the guide" link
 *  under the answer. It gives crawlers an internal path into the articles
 *  while Resources stays out of the nav and footer. */
export type Faq = { q: string; a: string; guide?: string };
export type FaqGroup = { id: string; title: string; faqs: Faq[] };

export const faqGroups: FaqGroup[] = [
  {
    id: "getting-started",
    title: "Getting started",
    faqs: [
      {
        q: "What is CaseLink?",
        a: "CaseLink is a HIPAA-compliant dental referral platform. General dentists and specialists send cases, share records, and track every referral in one shared workspace, instead of relying on fax, phone calls, and paper slips.",
      },
      {
        q: "Who is CaseLink for?",
        a: "General dentists who want visibility into every referral they send, specialists who want each incoming case to arrive with full clinical context, and office managers who coordinate referral flow across a practice. Supported specialties include orthodontics, endodontics, periodontics, oral surgery, and prosthodontics.",
      },
      {
        q: "How long does setup take?",
        a: "Under 30 minutes from account creation to first referral. CaseLink runs in the browser, so there is nothing to install. Sending a referral takes under three minutes.",
      },
      {
        q: "Where is CaseLink available?",
        a: "CaseLink works for dental practices anywhere in the US. The company is based in the Washington, DC metro area, and the founding network is concentrated across the District, Northern Virginia, and the Maryland suburbs.",
      },
      {
        q: "What if the specialist or GP I work with is not on CaseLink yet?",
        a: "Invite them from the referral screen. The invitation takes under a minute. They get an email, create an account, and can accept or send referrals right away. General dentists join for free.",
      },
    ],
  },
  {
    id: "pricing",
    title: "Pricing and plans",
    faqs: [
      {
        q: "How much does CaseLink cost?",
        a: "The general dentist plan is free. The specialist plan is $299 per month, or $269 per month on yearly billing. DSO and multi-location pricing is custom, on an annual contract.",
      },
      {
        q: "Is CaseLink really free for general dentists?",
        a: "Yes. The GP plan is permanently free, with no trial period and no credit card. It includes unlimited referrals, secure file sharing, encrypted messaging, and real-time updates.",
        guide: "free-dental-referral-software-for-general-dentists",
      },
      {
        q: "Is there a free trial for specialists?",
        a: "Yes. Specialists get their first month free. After that the plan is $299 per month with monthly billing, or $269 per month with yearly billing.",
      },
      {
        q: "Are there setup fees or long contracts?",
        a: "No. There is no setup fee and no contract on the general dentist or specialist plans. Monthly specialist billing can be cancelled anytime. DSO and multi-location plans run on an annual contract.",
      },
      {
        q: "What does every plan include?",
        a: "Every plan includes HIPAA compliance, a Business Associate Agreement on signup, and unlimited case storage.",
      },
    ],
  },
  {
    id: "hipaa-security",
    title: "HIPAA and security",
    faqs: [
      {
        q: "Is CaseLink HIPAA compliant?",
        a: "Yes. CaseLink is HIPAA compliant from the foundation, with encryption on every referral, message, and file, audit logs on every action, role-based access controls, and automatic session timeouts.",
      },
      {
        q: "Do you sign a Business Associate Agreement?",
        a: "Yes. CaseLink signs a Business Associate Agreement on signup with every practice that holds Protected Health Information, in accordance with HIPAA.",
      },
      {
        q: "How is patient data protected?",
        a: "Every referral, message, and file is encrypted in transit and at rest. Multi-factor authentication is required for all accounts with access to patient information, and sessions expire after a period of inactivity.",
      },
      {
        q: "Does CaseLink keep audit logs?",
        a: "Yes. CaseLink records the user, the resource, the action, the timestamp, and the source IP address for access and material actions on patient information. Audit records are retained for at least six years.",
      },
      {
        q: "Where is CaseLink data stored?",
        a: "Data processed by CaseLink is stored in the United States. The current list of subprocessors with access to patient information is published at caselink.net/subprocessors.",
      },
    ],
  },
  {
    id: "referrals",
    title: "Referrals and workflow",
    faqs: [
      {
        q: "How is CaseLink different from sending referrals by fax or email?",
        a: "Fax and email lose visibility the moment they leave your office. CaseLink keeps every referral in one workspace with full clinical context, real-time status, and outcome reports that move in minutes instead of days.",
        guide: "how-to-stop-losing-dental-referrals",
      },
      {
        q: "What clinical information can I attach to a referral?",
        a: "Patient details, x-rays, insurance information, treatment notes, and supporting attachments. The specialist receives each case with the clinical context already in place.",
      },
      {
        q: "Can both offices see where a referral stands?",
        a: "Yes. Received, patient notified, consult scheduled, and treatment accepted are all timestamped and visible to both the sending and receiving office, so nobody has to call to ask.",
      },
      {
        q: "What happens if a referred patient does not book?",
        a: "If a patient has not booked inside the follow-up window, the case surfaces for outreach. The referral ends with a recorded outcome that both offices can see.",
        guide: "automate-dental-referral-follow-up",
      },
      {
        q: "Can office managers and front desk staff run CaseLink?",
        a: "Yes. CaseLink is built for the full front office. Staff can create and accept referrals, message other offices, and track status without the dentist in the administrative steps.",
      },
    ],
  },
  {
    id: "practice-software",
    title: "Working with your practice software",
    faqs: [
      {
        q: "Does CaseLink replace my practice management system?",
        a: "No. CaseLink works alongside Dentrix, Eaglesoft, Open Dental, and others. Scheduling, charting, and billing stay where they are. CaseLink handles the referral and the communication between offices.",
      },
      {
        q: "Does CaseLink integrate with Dentrix, Eaglesoft, or Open Dental?",
        a: "There is no data-level integration today. CaseLink runs alongside those systems in the browser. A scheduling integration is on the way.",
        guide: "cms-0062-p-fhir-dental-authorization",
      },
      {
        q: "Do I need new hardware?",
        a: "No. CaseLink runs in any modern web browser, so there is nothing to install on office computers.",
      },
    ],
  },
  {
    id: "specialists",
    title: "For specialists",
    faqs: [
      {
        q: "What does the specialist plan add?",
        a: "Everything in the general dentist plan, plus a referral inbox, an analytics dashboard, and case timelines.",
        guide: "how-endodontists-track-and-manage-incoming-referrals",
      },
      {
        q: "Can I see which GPs send me the most referrals?",
        a: "Yes. CaseLink reports on referral volume, source attribution, and completion by referring practice over any time period.",
        guide: "dental-referral-conversion-rate-benchmarks",
      },
      {
        q: "How do I get my referring GPs to use CaseLink?",
        a: "CaseLink is free for general dentists, with no trial, no card, and no limit on sending referrals. Inviting a GP takes under a minute from the referral screen.",
      },
      {
        q: "What does the DSO and multi-location plan include?",
        a: "Team permissions, multi-location analytics, API access, and a dedicated success manager. Pricing is custom on an annual contract.",
      },
    ],
  },
];

export const allFaqs: Faq[] = faqGroups.flatMap((g) => g.faqs);
