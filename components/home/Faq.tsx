import Link from "next/link";
import { Plus } from "@/components/icons";

export const faqs = [
  {
    q: "Is CaseLink HIPAA compliant?",
    a: "Yes. CaseLink is HIPAA compliant from the foundation, with encryption in transit and at rest on every referral, message, and file, audit logs on every action, role-based access controls, and automatic session timeouts. We sign a Business Associate Agreement on signup.",
  },
  {
    q: "Can general dentists and specialists refer to each other on CaseLink?",
    a: "Yes. CaseLink is a dental referral management platform built for both sides. General dentists send referrals to specialists, specialists receive and accept them, and both offices see the same status, messages, and outcome reports. If a practice you work with is not on CaseLink yet, you can invite them in under a minute.",
  },
  {
    q: "How is CaseLink different from sending referrals by fax or email?",
    a: "Fax and email lose visibility the moment they leave your office. Roughly 30% of dental referrals never reach treatment, often without either practice knowing. CaseLink keeps every referral in one workspace with full clinical context, real-time status, and outcome reports that move in minutes instead of days.",
  },
  {
    q: "How much does CaseLink cost?",
    a: "The general dentist plan is free with unlimited referrals, secure file sharing, HIPAA compliance, and real-time updates. The specialist plan is $299 per month, or $269 per month on yearly billing. DSO and multi-location pricing is custom.",
  },
  {
    q: "Can general dentists use CaseLink for free?",
    a: "Yes. The general dentist plan is free and includes unlimited referrals, secure file sharing, encrypted messaging, and real-time updates. There is no setup fee and no contract.",
  },
  {
    q: "What clinical information can I attach to a referral?",
    a: "Patient details, x-rays, insurance information, treatment notes, and supporting attachments. The specialist receives each case with the clinical context already in place, so they can start work without chasing missing details.",
  },
  {
    q: "Do you sign a Business Associate Agreement?",
    a: "Yes. CaseLink signs a BAA on signup with every practice that holds Protected Health Information, in accordance with HIPAA.",
  },
];

/**
 * FAQ, rebuilt on the system's own FAQ card family (step 7, Content) over
 * a G2 Ice field ground.
 *
 * The layout is split asymmetry, which section 06 gives as the default:
 * the statement on the left, the questions on the right. It used to be a
 * centred head over a centred column, which that section lists under
 * "avoid" along with centred heroes.
 *
 * It stays native details/summary, so every answer is in the DOM without
 * JavaScript and keeps feeding the FAQPage JSON-LD.
 *
 * Copy is unchanged.
 */
export default function Faq() {
  return (
    <section className="faq-sec" id="faq">
      <div className="wrap">
        <div className="faq-grid">
          <div className="faq-say reveal">
            <span className="eyebrow">FAQ</span>
            {/* No forced break here: the column is half the width the
                centred version had, so the line wraps on its own and a
                <br> only stranded "most," by itself. */}
            <h2>
              The questions we hear most,{" "}
              <span className="cl-landing">answered.</span>
            </h2>
            <p className="faq-lede">
              Short answers to what comes up first. If yours is not here, we
              are one email away.
            </p>

            {/* The hub holds the full set in six groups. The blue glass
                primary: this section has no other call to action, and the
                frosted secondary disappeared against the Ice field ground
                it sits on. */}
            <Link href="/faqs" className="cl-btn cl-btn--lg faq-all">
              See all questions
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="faq-list reveal">
            {faqs.map((f, i) => (
              <details
                  key={f.q}
                  /* A shared name makes these an exclusive group natively:
                     opening one closes the rest, with no JavaScript, so
                     every answer stays server-rendered for the FAQPage
                     JSON-LD. */
                  name="caselink-faq"
                  className="faq-item"
                  open={i === 0}
                >
                <summary>
                  <span className="faq-q">{f.q}</span>
                  {/* Under 40px the system calls for a plain Blue Deep
                      stroke rather than a frosted icon in a tile, so the
                      mark is the glyph alone and takes its colour from
                      the summary. */}
                  <span className="faq-icon" aria-hidden="true">
                    <Plus width={18} height={18} />
                  </span>
                </summary>
                <div className="faq-answer">
                  <p>{f.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
